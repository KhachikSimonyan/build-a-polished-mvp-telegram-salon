from html import escape

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import Application, CallbackQueryHandler, CommandHandler, ContextTypes

from app.config import settings
from app.database import BookingNotFound, SlotAlreadyBooked, get_booking, get_salon_settings, update_booking_status


def is_owner(chat_id: int | str) -> bool:
    return bool(settings.owner_chat_id) and str(chat_id) == str(settings.owner_chat_id)


def admin_url() -> str:
    if not settings.is_public_https_base_url:
        return f"{settings.base_url}/admin"
    return f"{settings.base_url}/admin?access={settings.admin_password}"


def mini_app_markup(chat_id: int | str | None = None) -> InlineKeyboardMarkup:
    if not settings.is_public_https_base_url:
        return InlineKeyboardMarkup(
            [[InlineKeyboardButton("Mini App-ին պետք է HTTPS", callback_data="mini_app_needs_https")]]
        )

    keyboard = [[InlineKeyboardButton("Ամրագրել այց", web_app=WebAppInfo(settings.base_url))]]
    if chat_id is not None and is_owner(chat_id):
        keyboard.append([InlineKeyboardButton("Բացել ադմին վահանակը", web_app=WebAppInfo(admin_url()))])
    return InlineKeyboardMarkup(keyboard)


def admin_markup() -> InlineKeyboardMarkup:
    if not settings.is_public_https_base_url:
        return InlineKeyboardMarkup(
            [[InlineKeyboardButton("Admin-ին պետք է HTTPS", callback_data="mini_app_needs_https")]]
        )

    return InlineKeyboardMarkup(
        [[InlineKeyboardButton("Բացել ադմին վահանակը", web_app=WebAppInfo(admin_url()))]]
    )


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    first_name = update.effective_user.first_name or "there"
    pool = context.application.bot_data["pool"]
    salon = await get_salon_settings(pool)
    salon_name = salon.get("salonName") or "Heln"
    await update.message.reply_text(
        f"Բարի գալուստ, {first_name}։\n\n"
        f"Ամրագրիր այցդ {salon_name}-ում՝ արագ, գեղեցիկ և հարմար։",
        reply_markup=mini_app_markup(chat_id),
    )


async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    if not is_owner(chat_id):
        await update.message.reply_text("Admin access is available only for the salon owner.")
        return

    await update.message.reply_text(
        "Ադմին վահանակում կարող ես կառավարել այցերը, ծառայությունները, նկարները, գույները և աշխատանքային ժամերը։",
        reply_markup=admin_markup(),
    )


async def callback_query(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    pool = context.application.bot_data["pool"]

    try:
        if query.data == "mini_app_needs_https":
            await query.answer("Set BASE_URL to a public HTTPS URL, then restart the app.", show_alert=True)
            return

        if query.data.startswith("booking:cancel:"):
            booking_id = query.data.replace("booking:cancel:", "")
            booking = await update_booking_status(pool, booking_id, "cancelled")
            await notify_status_change(context.application, booking, "client")
            await query.answer("Your booking has been cancelled.", show_alert=True)
            return

        if query.data.startswith("admin:"):
            _, action, booking_id = query.data.split(":")

            if action == "phone":
                booking = await get_booking(pool, booking_id)
                await query.answer(f"Client phone: {booking['phone']}", show_alert=True)
                return

            if action not in {"confirmed", "cancelled", "completed", "no_show"}:
                await query.answer("Unsupported booking action.", show_alert=True)
                return

            booking = await update_booking_status(pool, booking_id, action)
            await notify_status_change(context.application, booking, "admin")
            await query.answer(f"Booking marked {action}.")
    except BookingNotFound:
        await query.answer("Booking not found.", show_alert=True)
    except SlotAlreadyBooked:
        await query.answer("That slot is already booked.", show_alert=True)
    except Exception:
        await query.answer("Could not update booking.", show_alert=True)


async def create_bot_application(pool) -> Application | None:
    if not settings.telegram_bot_token or settings.disable_telegram_bot:
        return None

    application = (
        Application.builder()
        .token(settings.telegram_bot_token)
        .connect_timeout(20)
        .read_timeout(20)
        .write_timeout(20)
        .pool_timeout(20)
        .build()
    )
    application.bot_data["pool"] = pool
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("admin", admin_command))
    application.add_handler(CallbackQueryHandler(callback_query))
    return application


async def send_booking_messages(application: Application | None, booking: dict) -> None:
    if not application:
        return

    user_message = "\n".join(
        [
            "Ձեր ELENA_ARAYI այցը հաստատված է։",
            "",
            f"{booking['serviceName']}՝ {booking['specialistName']}",
            f"{booking['date']} ժամը {booking['time']}",
            "",
            f"Հաճախորդ՝ {booking['clientName']}",
            "Սիրով սպասում ենք Ձեզ։",
        ]
    )

    user_buttons = [[InlineKeyboardButton("Չեղարկել այցը", callback_data=f"booking:cancel:{booking['id']}")]]
    if settings.is_public_https_base_url:
        user_buttons.append([InlineKeyboardButton("Փոխել ժամը", web_app=WebAppInfo(settings.base_url))])

    await application.bot.send_message(
        booking["telegramUserId"],
        user_message,
        reply_markup=InlineKeyboardMarkup(user_buttons),
    )

    if settings.owner_chat_id:
        telegram_label = escape(booking["firstName"])
        if booking["username"]:
            telegram_label = f"{telegram_label} (@{escape(booking['username'])})"

        owner_message = "\n".join(
            [
                "New salon booking",
                "",
                f"{booking['serviceName']}՝ {booking['specialistName']}",
                f"{booking['date']} ժամը {booking['time']}-{booking['endTime']}",
                f"Հաճախորդ՝ {escape(booking['clientName'])}",
                f"Հեռախոս՝ {escape(booking['phone'])}",
                f"Telegram: {telegram_label}",
            ]
        )

        await application.bot.send_message(
            settings.owner_chat_id,
            owner_message,
            reply_markup=InlineKeyboardMarkup(
                [
                    [
                        InlineKeyboardButton("Հաստատել", callback_data=f"admin:confirmed:{booking['id']}"),
                        InlineKeyboardButton("Ավարտել", callback_data=f"admin:completed:{booking['id']}"),
                        InlineKeyboardButton("Չեղարկել", callback_data=f"admin:cancelled:{booking['id']}"),
                    ],
                    [
                        InlineKeyboardButton("No-show", callback_data=f"admin:no_show:{booking['id']}"),
                        InlineKeyboardButton("Հեռախոս", callback_data=f"admin:phone:{booking['id']}"),
                    ],
                    [InlineKeyboardButton("Ադմին", web_app=WebAppInfo(admin_url()))],
                ]
            ),
        )


async def notify_status_change(application: Application | None, booking: dict, changed_by: str) -> None:
    if not application:
        return

    if changed_by == "admin" and booking.get("telegramUserId"):
        await application.bot.send_message(
            booking["telegramUserId"],
            f"Your Maison Rose booking is now {booking['status']}.\n\n"
            f"{booking['serviceName']} with {booking['specialistName']}\n"
            f"{booking['date']} at {booking['time']}",
        )

    if changed_by == "client" and settings.owner_chat_id:
        await application.bot.send_message(
            settings.owner_chat_id,
            f"Client cancelled a booking.\n\n"
            f"{booking['serviceName']} with {booking['specialistName']}\n"
            f"{booking['date']} at {booking['time']}\n"
            f"Client: {booking['clientName']}",
        )
