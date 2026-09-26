import asyncio
import importlib.util
import logging
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

import asyncpg
from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from telegram import Update

from app.bot import create_bot_application, notify_status_change, send_booking_messages
from app.config import settings
from app.database import (
    ALLOWED_STATUSES,
    BookingNotFound,
    SlotAlreadyBooked,
    build_admin_stats,
    build_analytics,
    build_availability,
    create_admin_booking,
    create_client_note,
    create_exception,
    create_service,
    create_specialist,
    create_booking,
    delete_bookings,
    delete_exception,
    delete_service,
    get_bookings,
    get_catalog,
    get_client_notes,
    get_exceptions,
    get_reminder_candidates,
    get_salon_settings,
    init_db,
    reschedule_booking,
    set_service_active,
    set_specialist_active,
    update_salon_settings,
    update_service,
    update_booking_status,
    update_specialist_profile,
    update_specialist_schedule,
    update_specialist_services,
)
from app.google_sheets import GoogleSheetsSync
from app.telegram_auth import validate_telegram_init_data


BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
UPLOAD_DIR = PUBLIC_DIR / "uploads"
MULTIPART_AVAILABLE = importlib.util.find_spec("multipart") is not None
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is required for PostgreSQL.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    pool = await asyncpg.create_pool(settings.database_url, min_size=1, max_size=10)
    await init_db(pool)
    app.state.pool = pool
    app.state.google_sheets = GoogleSheetsSync(
        settings.google_sheet_id,
        settings.google_service_account_file,
        settings.google_service_account_json,
    )
    app.state.google_sync_task = None
    if settings.google_sync_enabled:
        app.state.google_sync_task = asyncio.create_task(run_google_sync_loop(app))
    app.state.telegram_app = await create_bot_application(pool)
    app.state.telegram_mode = "disabled"

    if app.state.telegram_app:
        try:
            await app.state.telegram_app.initialize()
            await app.state.telegram_app.start()
            if settings.telegram_use_webhook:
                if not settings.is_public_https_base_url:
                    raise RuntimeError("Telegram webhook mode requires a public HTTPS BASE_URL.")
                if not settings.telegram_webhook_secret:
                    raise RuntimeError("TELEGRAM_WEBHOOK_SECRET is required in webhook mode.")
                await app.state.telegram_app.bot.set_webhook(
                    url=f"{settings.base_url}/telegram/webhook",
                    secret_token=settings.telegram_webhook_secret,
                    drop_pending_updates=False,
                )
                app.state.telegram_mode = "webhook"
            else:
                await app.state.telegram_app.updater.start_polling()
                app.state.telegram_mode = "polling"
        except Exception:
            logger.exception("Telegram bot could not start. FastAPI will continue without Telegram updates.")
            try:
                if app.state.telegram_app.running:
                    await app.state.telegram_app.stop()
                await app.state.telegram_app.shutdown()
            except Exception:
                logger.exception("Telegram bot shutdown after failed startup also failed.")
            app.state.telegram_app = None
            app.state.telegram_mode = "disabled"
    elif settings.disable_telegram_bot:
        print("DISABLE_TELEGRAM_BOT is true. FastAPI will run, but the bot is disabled.")
    else:
        print("TELEGRAM_BOT_TOKEN is not set. FastAPI will run, but the bot is disabled.")

    try:
        yield
    finally:
        if getattr(app.state, "google_sync_task", None):
            app.state.google_sync_task.cancel()
            try:
                await app.state.google_sync_task
            except asyncio.CancelledError:
                pass
        if app.state.telegram_app:
            if app.state.telegram_mode == "polling" and app.state.telegram_app.updater.running:
                await app.state.telegram_app.updater.stop()
            await app.state.telegram_app.stop()
            await app.state.telegram_app.shutdown()
        await pool.close()


app = FastAPI(title="Maison Rose Telegram Salon Booking", lifespan=lifespan)


@app.middleware("http")
async def no_cache_public_assets(request: Request, call_next):
    response = await call_next(request)
    if request.url.path in {"/", "/index.html", "/app.js", "/style.css", "/admin", "/admin.html", "/admin.js"}:
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


def require_admin(password: str | None) -> None:
    if not settings.admin_password or password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Admin password is required.")


@app.get("/health")
async def health():
    return {
        "ok": True,
        "app": "telegram-salon-booking-mini-app",
        "botEnabled": bool(getattr(app.state, "telegram_app", None)),
        "botMode": getattr(app.state, "telegram_mode", "disabled"),
    }


@app.post("/telegram/webhook")
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str | None = Header(default=None),
):
    if not settings.telegram_use_webhook or not getattr(app.state, "telegram_app", None):
        raise HTTPException(status_code=404, detail="Telegram webhook is not enabled.")
    if x_telegram_bot_api_secret_token != settings.telegram_webhook_secret:
        raise HTTPException(status_code=403, detail="Invalid Telegram webhook secret.")

    update = Update.de_json(await request.json(), app.state.telegram_app.bot)
    await app.state.telegram_app.process_update(update)
    return {"ok": True}


@app.get("/admin")
async def admin_page():
    return FileResponse(PUBLIC_DIR / "admin.html")


@app.get("/api/catalog")
async def catalog():
    catalog_data = await get_catalog(app.state.pool)
    return {"ok": True, **catalog_data, "settings": await get_salon_settings(app.state.pool)}


@app.get("/api/availability")
async def availability(serviceId: str, specialistId: str, date: str):
    try:
        slots = await build_availability(app.state.pool, serviceId, specialistId, date)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    return {
        "ok": True,
        "bookedTimes": [slot["time"] for slot in slots if not slot["available"]],
        "slots": slots,
    }


@app.post("/api/bookings")
async def submit_booking(request: Request, x_telegram_init_data: str | None = Header(default=None)):
    valid, telegram_user, reason = validate_telegram_init_data(
        x_telegram_init_data,
        settings.telegram_bot_token,
    )
    if not valid:
        raise HTTPException(status_code=401, detail=reason)

    payload = await request.json()
    required_fields = ["clientName", "phone", "serviceId", "specialistId", "date", "time"]
    missing_field = next((field for field in required_fields if not str(payload.get(field, "")).strip()), None)
    if missing_field:
        raise HTTPException(status_code=400, detail=f"Missing required field: {missing_field}.")

    try:
        booking = await create_booking(app.state.pool, payload, telegram_user)
    except SlotAlreadyBooked:
        raise HTTPException(status_code=409, detail="This time is already booked. Please choose another time.")
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    if app.state.telegram_app:
        task = asyncio.create_task(send_booking_messages(app.state.telegram_app, booking))
        task.add_done_callback(log_background_task_error)
    if settings.google_sync_enabled:
        task = asyncio.create_task(app.state.google_sheets.export_bookings(app.state.pool))
        task.add_done_callback(log_background_task_error)

    return {"ok": True, "booking": booking}


@app.get("/api/admin/bookings")
async def admin_bookings(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    bookings = await get_bookings(app.state.pool)
    return {"ok": True, "bookings": bookings, "stats": build_admin_stats(bookings)}


@app.delete("/api/admin/bookings")
async def admin_delete_bookings(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    deleted = await delete_bookings(app.state.pool)
    if settings.google_sync_enabled:
        task = asyncio.create_task(app.state.google_sheets.export_bookings(app.state.pool))
        task.add_done_callback(log_background_task_error)
    return {"ok": True, "deleted": deleted, "bookings": [], "stats": build_admin_stats([])}


@app.patch("/api/admin/bookings/{booking_id}/status")
async def admin_booking_status(
    booking_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    status = body.get("status")
    if status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail="Status must be confirmed, cancelled, completed, or no_show.")

    try:
        booking = await update_booking_status(app.state.pool, booking_id, status)
    except BookingNotFound:
        raise HTTPException(status_code=404, detail="Booking not found.")
    except SlotAlreadyBooked:
        raise HTTPException(status_code=409, detail="This time is already booked. Choose another slot before restoring.")

    if app.state.telegram_app:
        await notify_status_change(app.state.telegram_app, booking, "admin")
    if settings.google_sync_enabled:
        task = asyncio.create_task(app.state.google_sheets.export_bookings(app.state.pool))
        task.add_done_callback(log_background_task_error)
    return {"ok": True, "booking": booking}


@app.patch("/api/admin/bookings/{booking_id}/reschedule")
async def admin_reschedule_booking(
    booking_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        booking = await reschedule_booking(app.state.pool, booking_id, body)
    except BookingNotFound:
        raise HTTPException(status_code=404, detail="Booking not found.")
    except SlotAlreadyBooked:
        raise HTTPException(status_code=409, detail="That slot is not available.")
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    if app.state.telegram_app:
        await notify_status_change(app.state.telegram_app, booking, "admin")
    if settings.google_sync_enabled:
        task = asyncio.create_task(app.state.google_sheets.export_bookings(app.state.pool))
        task.add_done_callback(log_background_task_error)
    return {"ok": True, "booking": booking}


@app.post("/api/admin/bookings")
async def admin_manual_booking(request: Request, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    body = await request.json()
    required_fields = ["clientName", "phone", "serviceId", "specialistId", "date", "time"]
    missing_field = next((field for field in required_fields if not str(body.get(field, "")).strip()), None)
    if missing_field:
        raise HTTPException(status_code=400, detail=f"Missing required field: {missing_field}.")
    try:
        booking = await create_admin_booking(app.state.pool, body)
    except SlotAlreadyBooked:
        raise HTTPException(status_code=409, detail="That slot is not available.")
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    if settings.google_sync_enabled:
        task = asyncio.create_task(app.state.google_sheets.export_bookings(app.state.pool))
        task.add_done_callback(log_background_task_error)
    return {"ok": True, "booking": booking}


@app.post("/api/admin/google-sheets/sync")
async def admin_google_sheets_sync(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    try:
        return await app.state.google_sheets.sync_all(app.state.pool)
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="Google service account file was not found.")
    except Exception as error:
        logger.exception("Google Sheets sync failed.")
        raise HTTPException(status_code=500, detail=str(error))


@app.get("/api/admin/google-sheets/status")
async def admin_google_sheets_status(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    return {
        "ok": True,
        "enabled": settings.google_sync_enabled,
        "configured": app.state.google_sheets.enabled(),
        "sheetId": settings.google_sheet_id,
        "intervalSeconds": settings.google_sync_interval_seconds,
    }


@app.get("/api/admin/settings")
async def admin_settings(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    return {"ok": True, "settings": await get_salon_settings(app.state.pool)}


@app.patch("/api/admin/settings")
async def admin_update_settings(request: Request, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        settings_data = await update_salon_settings(app.state.pool, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "settings": settings_data}


@app.get("/api/admin/exceptions")
async def admin_exceptions(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    return {"ok": True, "exceptions": await get_exceptions(app.state.pool)}


@app.post("/api/admin/exceptions")
async def admin_create_exception(request: Request, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        exception = await create_exception(app.state.pool, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "exception": exception}


@app.delete("/api/admin/exceptions/{exception_id}")
async def admin_delete_exception(exception_id: str, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    try:
        await delete_exception(app.state.pool, exception_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
    return {"ok": True}


@app.get("/api/admin/notes")
async def admin_notes(phone: str | None = None, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    return {"ok": True, "notes": await get_client_notes(app.state.pool, phone)}


@app.post("/api/admin/notes")
async def admin_create_note(request: Request, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        note = await create_client_note(app.state.pool, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "note": note}


@app.get("/api/admin/analytics")
async def admin_analytics(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    bookings = await get_bookings(app.state.pool)
    return {"ok": True, "analytics": build_analytics(bookings)}


@app.get("/api/admin/reminders")
async def admin_reminders(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    return {"ok": True, "candidates": await get_reminder_candidates(app.state.pool)}


@app.get("/api/admin/specialists")
async def admin_specialists(x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    catalog_data = await get_catalog(app.state.pool)
    return {
        "ok": True,
        "services": catalog_data["services"],
        "specialists": catalog_data["specialists"],
    }


if MULTIPART_AVAILABLE:
    @app.post("/api/admin/uploads")
    async def admin_upload_image(
        image: UploadFile = File(...),
        x_admin_password: str | None = Header(default=None),
    ):
        require_admin(x_admin_password)
        if image.content_type not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
            raise HTTPException(status_code=400, detail="Upload a JPG, PNG, WEBP, or GIF image.")

        extension_by_type = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
        }
        extension = extension_by_type[image.content_type]
        contents = await image.read()
        max_bytes = 5 * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(status_code=400, detail="Image is too large. Maximum size is 5 MB.")

        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4().hex}{extension}"
        target = UPLOAD_DIR / filename
        target.write_bytes(contents)
        return {"ok": True, "url": f"/uploads/{filename}"}
else:
    @app.post("/api/admin/uploads")
    async def admin_upload_image_unavailable(x_admin_password: str | None = Header(default=None)):
        require_admin(x_admin_password)
        raise HTTPException(status_code=503, detail="Image uploads are temporarily unavailable.")


@app.post("/api/admin/services")
async def admin_create_service(request: Request, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        service = await create_service(app.state.pool, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "service": service}


@app.patch("/api/admin/services/{service_id}")
async def admin_update_service(
    service_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        service = await update_service(app.state.pool, service_id, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "service": service}


@app.patch("/api/admin/services/{service_id}/active")
async def admin_service_active(
    service_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        service = await set_service_active(app.state.pool, service_id, bool(body.get("active")))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "service": service}


@app.delete("/api/admin/services/{service_id}")
async def admin_delete_service(service_id: str, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    try:
        await delete_service(app.state.pool, service_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True}


@app.post("/api/admin/specialists")
async def admin_create_specialist(request: Request, x_admin_password: str | None = Header(default=None)):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        specialist = await create_specialist(app.state.pool, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "specialist": specialist}


@app.patch("/api/admin/specialists/{specialist_id}/schedule")
async def admin_specialist_schedule(
    specialist_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        specialist = await update_specialist_schedule(app.state.pool, specialist_id, body.get("schedule") or {})
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "specialist": specialist}


@app.patch("/api/admin/specialists/{specialist_id}/profile")
async def admin_specialist_profile(
    specialist_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        specialist = await update_specialist_profile(app.state.pool, specialist_id, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "specialist": specialist}


@app.patch("/api/admin/specialists/{specialist_id}/services")
async def admin_specialist_services(
    specialist_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        specialist = await update_specialist_services(app.state.pool, specialist_id, body.get("serviceIds") or [])
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "specialist": specialist}


@app.patch("/api/admin/specialists/{specialist_id}/active")
async def admin_specialist_active(
    specialist_id: str,
    request: Request,
    x_admin_password: str | None = Header(default=None),
):
    require_admin(x_admin_password)
    body = await request.json()
    try:
        specialist = await set_specialist_active(app.state.pool, specialist_id, bool(body.get("active")))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    return {"ok": True, "specialist": specialist}


app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")


def log_background_task_error(task: asyncio.Task) -> None:
    try:
        task.result()
    except Exception:
        logger.exception("Background Telegram notification failed.")


async def run_google_sync_loop(app: FastAPI) -> None:
    await asyncio.sleep(5)
    while True:
        try:
            result = await app.state.google_sheets.sync_all(app.state.pool)
            if not result.get("ok"):
                logger.warning("Google Sheets sync is not ready: %s", result)
        except Exception:
            logger.exception("Google Sheets background sync failed.")
        await asyncio.sleep(max(settings.google_sync_interval_seconds, 15))
