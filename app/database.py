import uuid
from datetime import date, datetime, time, timedelta
from typing import Any

import asyncpg


SERVICES = [
    ("haircut-styling", "Կանանց լազերային մազահեռացում", 60, "LH", "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=900&q=80"),
    ("manicure", "Տղամարդկանց մազահեռացում", 60, "MEN", "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=900&q=80"),
    ("facial-treatment", "Անհատական խորհրդատվություն", 30, "VIP", "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80"),
    ("hair-coloring", "Դասընթաց եւ սերտիֆիկացում", 120, "EDU", "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80"),
]

SPECIALISTS = [
    ("emily-rose", "Elena Arayi", "Լազերային մազահեռացման մասնագետ", "10:00", "20:00", [], ["haircut-styling", "manicure", "facial-treatment", "hair-coloring"]),
]

ALLOWED_STATUSES = {"confirmed", "cancelled", "completed", "no_show"}


class SlotAlreadyBooked(Exception):
    pass


class BookingNotFound(Exception):
    pass


def parse_time(value: str) -> time:
    if not isinstance(value, str):
        raise ValueError("Time must be in HH:MM format.")
    return datetime.strptime(value, "%H:%M").time()


def format_time(value: time) -> str:
    return value.strftime("%H:%M")


def format_date(value: date) -> str:
    return value.isoformat()


def add_minutes(value: time, minutes: int) -> time:
    base = datetime.combine(date.today(), value)
    return (base + timedelta(minutes=minutes)).time()


def time_to_minutes(value: time) -> int:
    return value.hour * 60 + value.minute


def minutes_to_time(value: int) -> time:
    return time(value // 60, value % 60)


def ranges_overlap(start_a: time, end_a: time, start_b: time, end_b: time) -> bool:
    return time_to_minutes(start_a) < time_to_minutes(end_b) and time_to_minutes(start_b) < time_to_minutes(end_a)


def booking_to_dict(row: asyncpg.Record) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "createdAt": row["created_at"].isoformat(),
        "updatedAt": row["updated_at"].isoformat() if row["updated_at"] else None,
        "telegramUserId": row["telegram_user_id"],
        "firstName": row["first_name"] or "",
        "username": row["username"] or "",
        "clientName": row["client_name"],
        "phone": row["phone"],
        "serviceId": row["service_id"],
        "serviceName": row["service_name"],
        "durationMinutes": row["duration_minutes"],
        "specialistId": row["specialist_id"],
        "specialistName": row["specialist_name"],
        "date": format_date(row["date"]),
        "time": format_time(row["time"]),
        "endTime": format_time(row["end_time"]),
        "status": row["status"],
    }


def service_to_dict(row: asyncpg.Record) -> dict[str, Any]:
    keys = set(row.keys())
    return {
        "id": row["id"],
        "name": row["name"],
        "durationMinutes": row["duration_minutes"],
        "icon": row["icon"] if "icon" in keys else "",
        "imageUrl": row["image_url"] if "image_url" in keys else "",
        "active": row["active"],
    }


def specialist_to_dict(row: asyncpg.Record) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "role": row["role"],
        "active": row["active"],
        "serviceIds": row["service_ids"] or [],
        "schedule": {
            "start": format_time(row["start_time"]),
            "end": format_time(row["end_time"]),
            "daysOff": row["days_off"] or [],
        },
    }


async def init_db(pool: asyncpg.Pool) -> None:
    async with pool.acquire() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS services (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
              icon TEXT NOT NULL DEFAULT '',
              image_url TEXT NOT NULL DEFAULT '',
              active BOOLEAN NOT NULL DEFAULT TRUE
            );

            ALTER TABLE services
              ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
            ALTER TABLE services
              ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT '';
            ALTER TABLE services
              ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';

            CREATE TABLE IF NOT EXISTS specialists (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              role TEXT NOT NULL,
              active BOOLEAN NOT NULL DEFAULT TRUE
            );

            ALTER TABLE specialists
              ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

            CREATE TABLE IF NOT EXISTS specialist_schedules (
              specialist_id TEXT PRIMARY KEY REFERENCES specialists(id) ON DELETE CASCADE,
              start_time TIME NOT NULL,
              end_time TIME NOT NULL,
              days_off INTEGER[] NOT NULL DEFAULT '{}'
            );

            CREATE TABLE IF NOT EXISTS specialist_weekly_hours (
              specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
              day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
              start_time TIME NOT NULL,
              end_time TIME NOT NULL,
              active BOOLEAN NOT NULL DEFAULT TRUE,
              PRIMARY KEY (specialist_id, day_of_week)
            );

            CREATE TABLE IF NOT EXISTS specialist_services (
              specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
              service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
              PRIMARY KEY (specialist_id, service_id)
            );

            CREATE TABLE IF NOT EXISTS bookings (
              id UUID PRIMARY KEY,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ,
              telegram_user_id BIGINT NOT NULL,
              first_name TEXT,
              username TEXT,
              client_name TEXT NOT NULL,
              phone TEXT NOT NULL,
              service_id TEXT NOT NULL REFERENCES services(id),
              service_name TEXT NOT NULL,
              duration_minutes INTEGER NOT NULL,
              specialist_id TEXT NOT NULL REFERENCES specialists(id),
              specialist_name TEXT NOT NULL,
              date DATE NOT NULL,
              time TIME NOT NULL,
              end_time TIME NOT NULL,
              status TEXT NOT NULL
            );

            ALTER TABLE bookings
              DROP CONSTRAINT IF EXISTS bookings_status_check;
            ALTER TABLE bookings
              ADD CONSTRAINT bookings_status_check
              CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show'));

            CREATE TABLE IF NOT EXISTS salon_settings (
              id INTEGER PRIMARY KEY DEFAULT 1,
              salon_name TEXT NOT NULL DEFAULT 'Maison Rose',
              branch_name TEXT NOT NULL DEFAULT 'Yerevan Studio',
              brand_color TEXT NOT NULL DEFAULT '#b76e79',
              accent_color TEXT NOT NULL DEFAULT '#dcc08c',
              hero_title TEXT NOT NULL DEFAULT '',
              hero_text TEXT NOT NULL DEFAULT '',
              hero_image_url TEXT NOT NULL DEFAULT '',
              phone TEXT NOT NULL DEFAULT '+374 77 123 456',
              address TEXT NOT NULL DEFAULT 'Yerevan, Armenia',
              instagram TEXT NOT NULL DEFAULT '@maisonrose',
              deposit_required BOOLEAN NOT NULL DEFAULT FALSE,
              deposit_amount INTEGER NOT NULL DEFAULT 0,
              reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
              reminder_hours INTEGER NOT NULL DEFAULT 24,
              CHECK (id = 1)
            );

            INSERT INTO salon_settings (id)
            VALUES (1)
            ON CONFLICT (id) DO NOTHING;

            ALTER TABLE salon_settings
              ADD COLUMN IF NOT EXISTS accent_color TEXT NOT NULL DEFAULT '#dcc08c';
            ALTER TABLE salon_settings
              ADD COLUMN IF NOT EXISTS hero_title TEXT NOT NULL DEFAULT '';
            ALTER TABLE salon_settings
              ADD COLUMN IF NOT EXISTS hero_text TEXT NOT NULL DEFAULT '';
            ALTER TABLE salon_settings
              ADD COLUMN IF NOT EXISTS hero_image_url TEXT NOT NULL DEFAULT '';

            CREATE TABLE IF NOT EXISTS specialist_exceptions (
              id UUID PRIMARY KEY,
              specialist_id TEXT NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
              date DATE NOT NULL,
              start_time TIME,
              end_time TIME,
              is_day_off BOOLEAN NOT NULL DEFAULT FALSE,
              note TEXT NOT NULL DEFAULT ''
            );

            CREATE INDEX IF NOT EXISTS specialist_exceptions_lookup_idx
              ON specialist_exceptions (specialist_id, date);

            CREATE TABLE IF NOT EXISTS client_notes (
              id UUID PRIMARY KEY,
              phone TEXT NOT NULL,
              client_name TEXT NOT NULL DEFAULT '',
              note TEXT NOT NULL,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS client_notes_phone_idx
              ON client_notes (phone);

            CREATE INDEX IF NOT EXISTS bookings_schedule_idx
              ON bookings (specialist_id, date, status, time, end_time);
            """
        )

        await conn.execute(
            """
            UPDATE salon_settings
            SET salon_name = 'ELENA_ARAYI',
                branch_name = 'Elena Arayi Studio',
                brand_color = '#064127',
                accent_color = '#d7b84f',
                hero_title = 'Ամրագրիր քո լազերային մազահեռացման այցը',
                hero_text = 'Պրեմիում, անհատական եւ անվտանգ մոտեցում՝ Heln գեղեցկության ստուդիայում։',
                hero_image_url = 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=85',
                instagram = '@elena_arayi',
                address = 'Yerevan, Armenia'
            WHERE id = 1
              AND salon_name IN ('Maison Rose', 'Heln')
            """
        )

        for service_id, name, duration, icon, image_url in SERVICES:
            await conn.execute(
                """
                INSERT INTO services (id, name, duration_minutes, icon, image_url, active)
                VALUES ($1, $2, $3, $4, $5, TRUE)
                ON CONFLICT (id) DO UPDATE
                SET name = EXCLUDED.name,
                    duration_minutes = EXCLUDED.duration_minutes,
                    icon = EXCLUDED.icon,
                    image_url = EXCLUDED.image_url,
                    active = TRUE
                WHERE services.name IN (
                  'Haircut & Styling',
                  'Manicure',
                  'Facial Treatment',
                  'Hair Coloring'
                )
                """,
                service_id,
                name,
                duration,
                icon,
                image_url,
            )

        for specialist_id, name, role, start, end, days_off, service_ids in SPECIALISTS:
            await conn.execute(
                """
                INSERT INTO specialists (id, name, role, active)
                VALUES ($1, $2, $3, TRUE)
                ON CONFLICT (id) DO UPDATE
                SET name = EXCLUDED.name,
                    role = EXCLUDED.role,
                    active = TRUE
                WHERE specialists.name IN ('Emily Rose', 'Elena Arayi')
                """,
                specialist_id,
                name,
                role,
            )
            await conn.execute(
                """
                INSERT INTO specialist_schedules (specialist_id, start_time, end_time, days_off)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (specialist_id) DO NOTHING
                """,
                specialist_id,
                parse_time(start),
                parse_time(end),
                days_off,
            )
            for service_id in service_ids:
                await conn.execute(
                    """
                    INSERT INTO specialist_services (specialist_id, service_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
                    """,
                    specialist_id,
                    service_id,
                )

        await conn.execute(
            """
            UPDATE specialists
            SET active = FALSE
            WHERE id IN ('sophia-martin', 'lily-anderson', 'ava-bennett')
              AND name IN ('Sophia Martin', 'Lily Anderson', 'Ava Bennett')
            """
        )


async def get_catalog(pool: asyncpg.Pool) -> dict[str, Any]:
    async with pool.acquire() as conn:
        services = await conn.fetch("SELECT * FROM services ORDER BY id")
        specialists = await conn.fetch(
            """
            SELECT
              sp.id,
              sp.name,
              sp.role,
              sp.active,
              sc.start_time,
              sc.end_time,
              sc.days_off,
              COALESCE(array_agg(ss.service_id ORDER BY ss.service_id) FILTER (WHERE ss.service_id IS NOT NULL), '{}') AS service_ids
            FROM specialists sp
            JOIN specialist_schedules sc ON sc.specialist_id = sp.id
            LEFT JOIN specialist_services ss ON ss.specialist_id = sp.id
            GROUP BY sp.id, sp.name, sp.role, sp.active, sc.start_time, sc.end_time, sc.days_off
            ORDER BY sp.id
            """
        )
    return {
        "services": [service_to_dict(row) for row in services],
        "specialists": [specialist_to_dict(row) for row in specialists],
    }


async def build_availability(pool: asyncpg.Pool, service_id: str, specialist_id: str, selected_date: str) -> list[dict[str, Any]]:
    try:
        booking_date = date.fromisoformat(selected_date)
    except ValueError as error:
        raise ValueError("Date must be in YYYY-MM-DD format.") from error

    if booking_date < date.today():
        return []
    async with pool.acquire() as conn:
        service = await conn.fetchrow("SELECT * FROM services WHERE id = $1 AND active = TRUE", service_id)
        specialist = await conn.fetchrow(
            """
            SELECT sp.id, sp.name, sp.role, sp.active, sc.start_time, sc.end_time, sc.days_off
            FROM specialists sp
            JOIN specialist_schedules sc ON sc.specialist_id = sp.id
            WHERE sp.id = $1
            """,
            specialist_id,
        )

        if not service or not specialist or not specialist["active"]:
            return []

        can_perform_service = await conn.fetchval(
            """
            SELECT EXISTS (
              SELECT 1 FROM specialist_services
              WHERE specialist_id = $1 AND service_id = $2
            )
            """,
            specialist_id,
            service_id,
        )
        if not can_perform_service:
            return []

        exception = await conn.fetchrow(
            """
            SELECT *
            FROM specialist_exceptions
            WHERE specialist_id = $1 AND date = $2
            ORDER BY is_day_off DESC
            LIMIT 1
            """,
            specialist_id,
            booking_date,
        )

        working_window = await get_working_window(conn, specialist_id, booking_date, specialist, exception)
        if not working_window:
            return []

        bookings = await conn.fetch(
            """
            SELECT time, end_time
            FROM bookings
            WHERE specialist_id = $1 AND date = $2 AND status = 'confirmed'
            """,
            specialist_id,
            booking_date,
        )

    schedule_start, schedule_end = working_window
    start_minutes = time_to_minutes(schedule_start)
    end_minutes = time_to_minutes(schedule_end)
    duration = service["duration_minutes"]
    slots = []

    for slot_start_minutes in range(start_minutes, end_minutes - duration + 1, 30):
        slot_start = minutes_to_time(slot_start_minutes)
        slot_end = minutes_to_time(slot_start_minutes + duration)
        blocking_booking = next(
            (
                booking
                for booking in bookings
                if ranges_overlap(slot_start, slot_end, booking["time"], booking["end_time"])
            ),
            None,
        )

        slots.append(
            {
                "time": format_time(slot_start),
                "endTime": format_time(slot_end),
                "available": blocking_booking is None,
                "reason": "booked" if blocking_booking else None,
            }
        )

    return slots


async def create_booking(pool: asyncpg.Pool, payload: dict[str, Any], telegram_user: dict[str, Any]) -> dict[str, Any]:
    try:
        booking_date = date.fromisoformat(payload["date"])
        start_time = parse_time(payload["time"])
    except ValueError as error:
        raise ValueError("Date must be YYYY-MM-DD and time must be HH:MM.") from error

    if booking_date < date.today():
        raise ValueError("Booking date cannot be in the past.")

    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                "SELECT pg_advisory_xact_lock(hashtext($1))",
                f"{payload['specialistId']}:{payload['date']}",
            )

            service = await conn.fetchrow("SELECT * FROM services WHERE id = $1 AND active = TRUE", payload["serviceId"])
            specialist = await conn.fetchrow("SELECT * FROM specialists WHERE id = $1 AND active = TRUE", payload["specialistId"])
            schedule = await conn.fetchrow(
                "SELECT * FROM specialist_schedules WHERE specialist_id = $1",
                payload["specialistId"],
            )

            if not service or not specialist or not schedule:
                raise ValueError("Selected service or specialist is not available.")

            can_perform_service = await conn.fetchval(
                """
                SELECT EXISTS (
                  SELECT 1 FROM specialist_services
                  WHERE specialist_id = $1 AND service_id = $2
                )
                """,
                payload["specialistId"],
                payload["serviceId"],
            )
            if not can_perform_service:
                raise ValueError("Selected specialist does not provide this service.")

            end_time = add_minutes(start_time, service["duration_minutes"])

            exception = await conn.fetchrow(
                """
                SELECT *
                FROM specialist_exceptions
                WHERE specialist_id = $1 AND date = $2
                ORDER BY is_day_off DESC
                LIMIT 1
                """,
                payload["specialistId"],
                booking_date,
            )

            working_window = await get_working_window(conn, payload["specialistId"], booking_date, schedule, exception)
            if not working_window:
                raise SlotAlreadyBooked()

            schedule_start, schedule_end = working_window

            if start_time < schedule_start or end_time > schedule_end:
                raise SlotAlreadyBooked()

            conflict = await conn.fetchrow(
                """
                SELECT id
                FROM bookings
                WHERE specialist_id = $1
                  AND date = $2
                  AND status = 'confirmed'
                  AND $3::time < end_time
                  AND time < $4::time
                LIMIT 1
                """,
                payload["specialistId"],
                booking_date,
                start_time,
                end_time,
            )

            if conflict:
                raise SlotAlreadyBooked()

            row = await conn.fetchrow(
                """
                INSERT INTO bookings (
                  id, telegram_user_id, first_name, username, client_name, phone,
                  service_id, service_name, duration_minutes, specialist_id, specialist_name,
                  date, time, end_time, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'confirmed')
                RETURNING *
                """,
                uuid.uuid4(),
                int(telegram_user["id"]),
                telegram_user.get("first_name", ""),
                telegram_user.get("username", ""),
                payload["clientName"].strip(),
                payload["phone"].strip(),
                service["id"],
                service["name"],
                service["duration_minutes"],
                specialist["id"],
                specialist["name"],
                booking_date,
                start_time,
                end_time,
            )

    return booking_to_dict(row)


async def get_bookings(pool: asyncpg.Pool) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT *
            FROM bookings
            ORDER BY date DESC, time DESC, created_at DESC
            """
        )
    return [booking_to_dict(row) for row in rows]


async def get_booking(pool: asyncpg.Pool, booking_id: str) -> dict[str, Any]:
    try:
        parsed_id = uuid.UUID(booking_id)
    except ValueError as error:
        raise BookingNotFound() from error

    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM bookings WHERE id = $1", parsed_id)
    if not row:
        raise BookingNotFound()
    return booking_to_dict(row)


async def update_booking_status(pool: asyncpg.Pool, booking_id: str, status: str) -> dict[str, Any]:
    if status not in ALLOWED_STATUSES:
        raise ValueError("Unsupported booking status.")

    try:
        parsed_id = uuid.UUID(booking_id)
    except ValueError as error:
        raise BookingNotFound() from error

    async with pool.acquire() as conn:
        async with conn.transaction():
            booking = await conn.fetchrow("SELECT * FROM bookings WHERE id = $1", parsed_id)
            if not booking:
                raise BookingNotFound()

            if status == "confirmed":
                await conn.execute(
                    "SELECT pg_advisory_xact_lock(hashtext($1))",
                    f"{booking['specialist_id']}:{booking['date'].isoformat()}",
                )
                conflict = await conn.fetchrow(
                    """
                    SELECT id
                    FROM bookings
                    WHERE id <> $1
                      AND specialist_id = $2
                      AND date = $3
                      AND status = 'confirmed'
                      AND $4::time < end_time
                      AND time < $5::time
                    LIMIT 1
                    """,
                    booking["id"],
                    booking["specialist_id"],
                    booking["date"],
                    booking["time"],
                    booking["end_time"],
                )
                if conflict:
                    raise SlotAlreadyBooked()

            row = await conn.fetchrow(
                """
                UPDATE bookings
                SET status = $2, updated_at = NOW()
                WHERE id = $1
                RETURNING *
                """,
                booking["id"],
                status,
            )

    return booking_to_dict(row)


async def reschedule_booking(pool: asyncpg.Pool, booking_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    try:
        parsed_id = uuid.UUID(booking_id)
        booking_date = date.fromisoformat(payload["date"])
        start_time = parse_time(payload["time"])
    except (KeyError, ValueError) as error:
        raise ValueError("Date must be YYYY-MM-DD and time must be HH:MM.") from error

    if booking_date < date.today():
        raise ValueError("Booking date cannot be in the past.")

    async with pool.acquire() as conn:
        async with conn.transaction():
            booking = await conn.fetchrow("SELECT * FROM bookings WHERE id = $1", parsed_id)
            if not booking:
                raise BookingNotFound()

            await conn.execute(
                "SELECT pg_advisory_xact_lock(hashtext($1))",
                f"{booking['specialist_id']}:{booking_date.isoformat()}",
            )
            service = await conn.fetchrow("SELECT * FROM services WHERE id = $1", booking["service_id"])
            schedule = await conn.fetchrow(
                "SELECT * FROM specialist_schedules WHERE specialist_id = $1",
                booking["specialist_id"],
            )
            exception = await conn.fetchrow(
                """
                SELECT *
                FROM specialist_exceptions
                WHERE specialist_id = $1 AND date = $2
                ORDER BY is_day_off DESC
                LIMIT 1
                """,
                booking["specialist_id"],
                booking_date,
            )
            if not service or not schedule:
                raise SlotAlreadyBooked()

            end_time = add_minutes(start_time, service["duration_minutes"])
            working_window = await get_working_window(conn, booking["specialist_id"], booking_date, schedule, exception)
            if not working_window:
                raise SlotAlreadyBooked()

            schedule_start, schedule_end = working_window
            if start_time < schedule_start or end_time > schedule_end:
                raise SlotAlreadyBooked()

            conflict = await conn.fetchrow(
                """
                SELECT id
                FROM bookings
                WHERE id <> $1
                  AND specialist_id = $2
                  AND date = $3
                  AND status = 'confirmed'
                  AND $4::time < end_time
                  AND time < $5::time
                LIMIT 1
                """,
                booking["id"],
                booking["specialist_id"],
                booking_date,
                start_time,
                end_time,
            )
            if conflict:
                raise SlotAlreadyBooked()

            row = await conn.fetchrow(
                """
                UPDATE bookings
                SET date = $2,
                    time = $3,
                    end_time = $4,
                    status = 'confirmed',
                    updated_at = NOW()
                WHERE id = $1
                RETURNING *
                """,
                booking["id"],
                booking_date,
                start_time,
                end_time,
            )

    return booking_to_dict(row)


async def create_admin_booking(pool: asyncpg.Pool, payload: dict[str, Any]) -> dict[str, Any]:
    telegram_user = {
        "id": int(payload.get("telegramUserId") or 0),
        "first_name": payload.get("firstName") or "Manual",
        "username": payload.get("username") or "",
    }
    return await create_booking(pool, payload, telegram_user)


async def update_specialist_schedule(pool: asyncpg.Pool, specialist_id: str, schedule: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(schedule, dict):
        raise ValueError("Schedule must include valid start, end, and daysOff.")

    try:
        start_time = parse_time(schedule["start"])
        end_time = parse_time(schedule["end"])
        days_off = normalize_days_off(schedule.get("daysOff", []))
    except (KeyError, TypeError, ValueError) as error:
        raise ValueError("Schedule must include valid start, end, and daysOff.") from error

    if start_time >= end_time:
        raise ValueError("Start time must be before end time.")

    async with pool.acquire() as conn:
        specialist = await conn.fetchrow("SELECT * FROM specialists WHERE id = $1", specialist_id)
        if not specialist:
            raise ValueError("Specialist not found.")

        await conn.execute(
            """
            UPDATE specialist_schedules
            SET start_time = $2, end_time = $3, days_off = $4
            WHERE specialist_id = $1
            """,
            specialist_id,
            start_time,
            end_time,
            days_off,
        )
        row = await conn.fetchrow(
            """
            SELECT
              sp.id,
              sp.name,
              sp.role,
              sp.active,
              sc.start_time,
              sc.end_time,
              sc.days_off,
              COALESCE(array_agg(ss.service_id ORDER BY ss.service_id) FILTER (WHERE ss.service_id IS NOT NULL), '{}') AS service_ids
            FROM specialists sp
            JOIN specialist_schedules sc ON sc.specialist_id = sp.id
            LEFT JOIN specialist_services ss ON ss.specialist_id = sp.id
            WHERE sp.id = $1
            GROUP BY sp.id, sp.name, sp.role, sp.active, sc.start_time, sc.end_time, sc.days_off
            """,
            specialist_id,
        )

    return specialist_to_dict(row)


async def update_specialist_profile(pool: asyncpg.Pool, specialist_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    name = str(payload.get("name", "")).strip()
    role = str(payload.get("role", "")).strip()

    if not name or not role:
        raise ValueError("Specialist name and role are required.")

    async with pool.acquire() as conn:
        result = await conn.execute(
            """
            UPDATE specialists
            SET name = $2, role = $3
            WHERE id = $1
            """,
            specialist_id,
            name,
            role,
        )

    if result.endswith("0"):
        raise ValueError("Specialist not found.")
    return await get_specialist(pool, specialist_id)


async def create_specialist(pool: asyncpg.Pool, payload: dict[str, Any]) -> dict[str, Any]:
    name = str(payload.get("name", "")).strip()
    role = str(payload.get("role", "")).strip()
    service_ids = normalize_service_ids(payload.get("serviceIds", []))
    schedule = payload.get("schedule") or {"start": "10:00", "end": "18:00", "daysOff": []}

    if not name or not role:
        raise ValueError("Specialist name and role are required.")
    if not service_ids:
        raise ValueError("Choose at least one service category.")

    specialist_id = slugify(name)
    start_time = parse_time(schedule.get("start", "10:00"))
    end_time = parse_time(schedule.get("end", "18:00"))
    days_off = normalize_days_off(schedule.get("daysOff", []))

    if start_time >= end_time:
        raise ValueError("Start time must be before end time.")

    async with pool.acquire() as conn:
        async with conn.transaction():
            existing_id = await conn.fetchval("SELECT id FROM specialists WHERE id = $1", specialist_id)
            if existing_id:
                specialist_id = f"{specialist_id}-{uuid.uuid4().hex[:6]}"

            await validate_service_ids(conn, service_ids)
            await conn.execute(
                "INSERT INTO specialists (id, name, role, active) VALUES ($1, $2, $3, TRUE)",
                specialist_id,
                name,
                role,
            )
            await conn.execute(
                """
                INSERT INTO specialist_schedules (specialist_id, start_time, end_time, days_off)
                VALUES ($1, $2, $3, $4)
                """,
                specialist_id,
                start_time,
                end_time,
                days_off,
            )
            await replace_specialist_services(conn, specialist_id, service_ids)

    return await get_specialist(pool, specialist_id)


async def create_service(pool: asyncpg.Pool, payload: dict[str, Any]) -> dict[str, Any]:
    name = str(payload.get("name", "")).strip()
    duration_minutes = int(payload.get("durationMinutes", 0) or 0)
    icon = str(payload.get("icon", "")).strip()[:8]
    image_url = str(payload.get("imageUrl", "")).strip()

    if not name:
        raise ValueError("Service name is required.")
    if duration_minutes <= 0:
        raise ValueError("Service duration must be greater than zero.")

    service_id = slugify(name)
    async with pool.acquire() as conn:
        existing_id = await conn.fetchval("SELECT id FROM services WHERE id = $1", service_id)
        if existing_id:
            service_id = f"{service_id}-{uuid.uuid4().hex[:6]}"
        row = await conn.fetchrow(
            """
            INSERT INTO services (id, name, duration_minutes, icon, image_url, active)
            VALUES ($1, $2, $3, $4, $5, TRUE)
            RETURNING *
            """,
            service_id,
            name,
            duration_minutes,
            icon,
            image_url,
        )
    return service_to_dict(row)


async def update_service(pool: asyncpg.Pool, service_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    name = str(payload.get("name", "")).strip()
    duration_minutes = int(payload.get("durationMinutes", 0) or 0)
    icon = str(payload.get("icon", "")).strip()[:8]
    image_url = str(payload.get("imageUrl", "")).strip()

    if not name:
        raise ValueError("Service name is required.")
    if duration_minutes <= 0:
        raise ValueError("Service duration must be greater than zero.")

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE services
            SET name = $2,
                duration_minutes = $3,
                icon = $4,
                image_url = $5
            WHERE id = $1
            RETURNING *
            """,
            service_id,
            name,
            duration_minutes,
            icon,
            image_url,
        )
    if not row:
        raise ValueError("Service not found.")
    return service_to_dict(row)


async def set_service_active(pool: asyncpg.Pool, service_id: str, active: bool) -> dict[str, Any]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE services
            SET active = $2
            WHERE id = $1
            RETURNING *
            """,
            service_id,
            active,
        )
    if not row:
        raise ValueError("Service not found.")
    return service_to_dict(row)


async def update_specialist_services(pool: asyncpg.Pool, specialist_id: str, service_ids: list[str]) -> dict[str, Any]:
    service_ids = normalize_service_ids(service_ids)
    if not service_ids:
        raise ValueError("Choose at least one service category.")

    async with pool.acquire() as conn:
        async with conn.transaction():
            specialist = await conn.fetchrow("SELECT * FROM specialists WHERE id = $1", specialist_id)
            if not specialist:
                raise ValueError("Specialist not found.")
            await validate_service_ids(conn, service_ids)
            await replace_specialist_services(conn, specialist_id, service_ids)

    return await get_specialist(pool, specialist_id)


async def set_specialist_active(pool: asyncpg.Pool, specialist_id: str, active: bool) -> dict[str, Any]:
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE specialists SET active = $2 WHERE id = $1",
            specialist_id,
            active,
        )
    if result.endswith("0"):
        raise ValueError("Specialist not found.")
    return await get_specialist(pool, specialist_id)


async def get_specialist(pool: asyncpg.Pool, specialist_id: str) -> dict[str, Any]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT
              sp.id,
              sp.name,
              sp.role,
              sp.active,
              sc.start_time,
              sc.end_time,
              sc.days_off,
              COALESCE(array_agg(ss.service_id ORDER BY ss.service_id) FILTER (WHERE ss.service_id IS NOT NULL), '{}') AS service_ids
            FROM specialists sp
            JOIN specialist_schedules sc ON sc.specialist_id = sp.id
            LEFT JOIN specialist_services ss ON ss.specialist_id = sp.id
            WHERE sp.id = $1
            GROUP BY sp.id, sp.name, sp.role, sp.active, sc.start_time, sc.end_time, sc.days_off
            """,
            specialist_id,
        )

    if not row:
        raise ValueError("Specialist not found.")
    return specialist_to_dict(row)


def settings_to_dict(row: asyncpg.Record) -> dict[str, Any]:
    return {
        "salonName": row["salon_name"],
        "branchName": row["branch_name"],
        "brandColor": row["brand_color"],
        "accentColor": row["accent_color"],
        "heroTitle": row["hero_title"],
        "heroText": row["hero_text"],
        "heroImageUrl": row["hero_image_url"],
        "phone": row["phone"],
        "address": row["address"],
        "instagram": row["instagram"],
        "depositRequired": row["deposit_required"],
        "depositAmount": row["deposit_amount"],
        "remindersEnabled": row["reminders_enabled"],
        "reminderHours": row["reminder_hours"],
    }


async def get_salon_settings(pool: asyncpg.Pool) -> dict[str, Any]:
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM salon_settings WHERE id = 1")
    return settings_to_dict(row)


async def update_salon_settings(pool: asyncpg.Pool, payload: dict[str, Any]) -> dict[str, Any]:
    deposit_amount = int(payload.get("depositAmount", 0) or 0)
    reminder_hours = int(payload.get("reminderHours", 24) or 24)
    if deposit_amount < 0:
        raise ValueError("Deposit amount cannot be negative.")
    if reminder_hours <= 0:
        raise ValueError("Reminder hours must be greater than zero.")

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE salon_settings
            SET salon_name = $1,
                branch_name = $2,
                brand_color = $3,
                accent_color = $4,
                hero_title = $5,
                hero_text = $6,
                hero_image_url = $7,
                phone = $8,
                address = $9,
                instagram = $10,
                deposit_required = $11,
                deposit_amount = $12,
                reminders_enabled = $13,
                reminder_hours = $14
            WHERE id = 1
            RETURNING *
            """,
            str(payload.get("salonName", "Maison Rose")).strip() or "Maison Rose",
            str(payload.get("branchName", "Yerevan Studio")).strip() or "Yerevan Studio",
            str(payload.get("brandColor", "#b76e79")).strip() or "#b76e79",
            str(payload.get("accentColor", "#dcc08c")).strip() or "#dcc08c",
            str(payload.get("heroTitle", "")).strip(),
            str(payload.get("heroText", "")).strip(),
            str(payload.get("heroImageUrl", "")).strip(),
            str(payload.get("phone", "")).strip(),
            str(payload.get("address", "")).strip(),
            str(payload.get("instagram", "")).strip(),
            bool(payload.get("depositRequired")),
            deposit_amount,
            bool(payload.get("remindersEnabled")),
            reminder_hours,
        )
    return settings_to_dict(row)


def exception_to_dict(row: asyncpg.Record) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "specialistId": row["specialist_id"],
        "date": format_date(row["date"]),
        "start": format_time(row["start_time"]) if row["start_time"] else "",
        "end": format_time(row["end_time"]) if row["end_time"] else "",
        "isDayOff": row["is_day_off"],
        "note": row["note"],
    }


async def get_exceptions(pool: asyncpg.Pool) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT *
            FROM specialist_exceptions
            WHERE date >= CURRENT_DATE
            ORDER BY date, specialist_id
            """
        )
    return [exception_to_dict(row) for row in rows]


async def create_exception(pool: asyncpg.Pool, payload: dict[str, Any]) -> dict[str, Any]:
    specialist_id = str(payload.get("specialistId", "")).strip()
    try:
        exception_date = date.fromisoformat(str(payload.get("date", "")))
    except ValueError as error:
        raise ValueError("Exception date must be YYYY-MM-DD.") from error

    is_day_off = bool(payload.get("isDayOff"))
    start_time = None if is_day_off else parse_time(payload.get("start", "10:00"))
    end_time = None if is_day_off else parse_time(payload.get("end", "18:00"))
    if not is_day_off and start_time >= end_time:
        raise ValueError("Start time must be before end time.")

    async with pool.acquire() as conn:
        specialist = await conn.fetchrow("SELECT id FROM specialists WHERE id = $1", specialist_id)
        if not specialist:
            raise ValueError("Specialist not found.")
        row = await conn.fetchrow(
            """
            INSERT INTO specialist_exceptions (id, specialist_id, date, start_time, end_time, is_day_off, note)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
            """,
            uuid.uuid4(),
            specialist_id,
            exception_date,
            start_time,
            end_time,
            is_day_off,
            str(payload.get("note", "")).strip(),
        )
    return exception_to_dict(row)


async def delete_exception(pool: asyncpg.Pool, exception_id: str) -> None:
    try:
        parsed_id = uuid.UUID(exception_id)
    except ValueError as error:
        raise ValueError("Exception not found.") from error
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM specialist_exceptions WHERE id = $1", parsed_id)
    if result.endswith("0"):
        raise ValueError("Exception not found.")


def note_to_dict(row: asyncpg.Record) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "phone": row["phone"],
        "clientName": row["client_name"],
        "note": row["note"],
        "createdAt": row["created_at"].isoformat(),
    }


async def get_client_notes(pool: asyncpg.Pool, phone: str | None = None) -> list[dict[str, Any]]:
    async with pool.acquire() as conn:
        if phone:
            rows = await conn.fetch(
                "SELECT * FROM client_notes WHERE phone = $1 ORDER BY created_at DESC",
                phone,
            )
        else:
            rows = await conn.fetch("SELECT * FROM client_notes ORDER BY created_at DESC LIMIT 50")
    return [note_to_dict(row) for row in rows]


async def create_client_note(pool: asyncpg.Pool, payload: dict[str, Any]) -> dict[str, Any]:
    phone = str(payload.get("phone", "")).strip()
    note = str(payload.get("note", "")).strip()
    if not phone or not note:
        raise ValueError("Phone and note are required.")
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO client_notes (id, phone, client_name, note)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            uuid.uuid4(),
            phone,
            str(payload.get("clientName", "")).strip(),
            note,
        )
    return note_to_dict(row)


def build_analytics(bookings: list[dict[str, Any]]) -> dict[str, Any]:
    confirmed = [booking for booking in bookings if booking["status"] in {"confirmed", "completed"}]
    completed = [booking for booking in bookings if booking["status"] == "completed"]
    cancelled = [booking for booking in bookings if booking["status"] == "cancelled"]
    no_show = [booking for booking in bookings if booking["status"] == "no_show"]
    return {
        "totalBookings": len(bookings),
        "activeBookings": len(confirmed),
        "completed": len(completed),
        "cancelled": len(cancelled),
        "noShow": len(no_show),
        "topServices": top_counts(confirmed, "serviceName"),
        "topSpecialists": top_counts(confirmed, "specialistName"),
    }


def top_counts(bookings: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    counts: dict[str, int] = {}
    for booking in bookings:
        counts[booking[key]] = counts.get(booking[key], 0) + 1
    return [
        {"name": name, "count": count}
        for name, count in sorted(counts.items(), key=lambda item: item[1], reverse=True)[:5]
    ]


async def get_reminder_candidates(pool: asyncpg.Pool) -> list[dict[str, Any]]:
    settings = await get_salon_settings(pool)
    if not settings["remindersEnabled"]:
        return []

    target_start = datetime.now() + timedelta(hours=settings["reminderHours"] - 1)
    target_end = datetime.now() + timedelta(hours=settings["reminderHours"] + 1)
    bookings = await get_bookings(pool)
    candidates = []
    for booking in bookings:
        if booking["status"] != "confirmed":
            continue
        starts_at = datetime.fromisoformat(f"{booking['date']}T{booking['time']}:00")
        if target_start <= starts_at <= target_end:
            candidates.append(booking)
    return sorted(candidates, key=lambda item: (item["date"], item["time"]))


async def get_working_window(
    conn: asyncpg.Connection,
    specialist_id: str,
    booking_date: date,
    fallback_schedule: asyncpg.Record,
    exception: asyncpg.Record | None,
) -> tuple[time, time] | None:
    if exception and exception["is_day_off"]:
        return None
    if exception and exception["start_time"] and exception["end_time"]:
        return exception["start_time"], exception["end_time"]

    day_of_week = js_day_of_week(booking_date)
    weekly_count = await conn.fetchval(
        "SELECT COUNT(*) FROM specialist_weekly_hours WHERE specialist_id = $1",
        specialist_id,
    )
    if weekly_count:
        weekly = await conn.fetchrow(
            """
            SELECT start_time, end_time, active
            FROM specialist_weekly_hours
            WHERE specialist_id = $1 AND day_of_week = $2
            """,
            specialist_id,
            day_of_week,
        )
        if not weekly or not weekly["active"]:
            return None
        return weekly["start_time"], weekly["end_time"]

    if day_of_week in (fallback_schedule["days_off"] or []):
        return None
    return fallback_schedule["start_time"], fallback_schedule["end_time"]


async def replace_sheet_catalog(
    pool: asyncpg.Pool,
    services: list[dict[str, Any]],
    specialists: list[dict[str, Any]],
    weekly_hours: list[dict[str, Any]],
    exceptions: list[dict[str, Any]],
) -> dict[str, int]:
    async with pool.acquire() as conn:
        async with conn.transaction():
            for service in services:
                await conn.execute(
                    """
                    INSERT INTO services (id, name, duration_minutes, icon, image_url, active)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (id) DO UPDATE
                    SET name = EXCLUDED.name,
                        duration_minutes = EXCLUDED.duration_minutes,
                        icon = EXCLUDED.icon,
                        image_url = EXCLUDED.image_url,
                        active = EXCLUDED.active
                    """,
                    service["id"],
                    service["name"],
                    service["durationMinutes"],
                    service.get("icon", ""),
                    service.get("imageUrl", ""),
                    service["active"],
                )

            for specialist in specialists:
                await validate_service_ids(conn, specialist["serviceIds"])
                await conn.execute(
                    """
                    INSERT INTO specialists (id, name, role, active)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (id) DO UPDATE
                    SET name = EXCLUDED.name,
                        role = EXCLUDED.role,
                        active = EXCLUDED.active
                    """,
                    specialist["id"],
                    specialist["name"],
                    specialist["role"],
                    specialist["active"],
                )
                await conn.execute(
                    """
                    INSERT INTO specialist_schedules (specialist_id, start_time, end_time, days_off)
                    VALUES ($1, '10:00', '18:00', '{}')
                    ON CONFLICT (specialist_id) DO NOTHING
                    """,
                    specialist["id"],
                )
                await replace_specialist_services(conn, specialist["id"], specialist["serviceIds"])

            specialist_ids = [specialist["id"] for specialist in specialists]
            if specialist_ids:
                await conn.execute(
                    "DELETE FROM specialist_weekly_hours WHERE specialist_id = ANY($1::text[])",
                    specialist_ids,
                )
            for item in weekly_hours:
                await conn.execute(
                    """
                    INSERT INTO specialist_weekly_hours (specialist_id, day_of_week, start_time, end_time, active)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (specialist_id, day_of_week) DO UPDATE
                    SET start_time = EXCLUDED.start_time,
                        end_time = EXCLUDED.end_time,
                        active = EXCLUDED.active
                    """,
                    item["specialistId"],
                    item["dayOfWeek"],
                    parse_time(item["start"]),
                    parse_time(item["end"]),
                    item["active"],
                )

            await conn.execute("DELETE FROM specialist_exceptions WHERE date >= CURRENT_DATE")
            for item in exceptions:
                start_time = None if item["isDayOff"] else parse_time(item["start"])
                end_time = None if item["isDayOff"] else parse_time(item["end"])
                await conn.execute(
                    """
                    INSERT INTO specialist_exceptions (id, specialist_id, date, start_time, end_time, is_day_off, note)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    uuid.uuid4(),
                    item["specialistId"],
                    date.fromisoformat(item["date"]),
                    start_time,
                    end_time,
                    item["isDayOff"],
                    item.get("note", ""),
                )

    return {
        "services": len(services),
        "specialists": len(specialists),
        "weeklyHours": len(weekly_hours),
        "exceptions": len(exceptions),
    }


async def import_sheet_booking(pool: asyncpg.Pool, payload: dict[str, Any]) -> dict[str, Any]:
    booking_id = payload.get("id")
    try:
        parsed_id = uuid.UUID(str(booking_id)) if booking_id else uuid.uuid4()
    except ValueError:
        parsed_id = uuid.uuid4()

    try:
        booking_date = date.fromisoformat(payload["date"])
        start_time = parse_time(payload["time"])
    except (KeyError, ValueError) as error:
        raise ValueError("Booking date must be YYYY-MM-DD and time must be HH:MM.") from error

    status = payload.get("status") or "confirmed"
    if status not in ALLOWED_STATUSES:
        raise ValueError("Booking status is invalid.")

    async with pool.acquire() as conn:
        async with conn.transaction():
            existing = await conn.fetchrow("SELECT * FROM bookings WHERE id = $1", parsed_id)
            service = await conn.fetchrow("SELECT * FROM services WHERE id = $1", payload["serviceId"])
            specialist = await conn.fetchrow("SELECT * FROM specialists WHERE id = $1", payload["specialistId"])
            if not service or not specialist:
                raise ValueError("Booking service or specialist does not exist.")

            end_time = add_minutes(start_time, service["duration_minutes"])
            if status == "confirmed":
                conflict = await conn.fetchrow(
                    """
                    SELECT id
                    FROM bookings
                    WHERE id <> $1
                      AND specialist_id = $2
                      AND date = $3
                      AND status = 'confirmed'
                      AND $4::time < end_time
                      AND time < $5::time
                    LIMIT 1
                    """,
                    parsed_id,
                    payload["specialistId"],
                    booking_date,
                    start_time,
                    end_time,
                )
                if conflict:
                    raise SlotAlreadyBooked()

            if existing:
                row = await conn.fetchrow(
                    """
                    UPDATE bookings
                    SET client_name = $2,
                        phone = $3,
                        service_id = $4,
                        service_name = $5,
                        duration_minutes = $6,
                        specialist_id = $7,
                        specialist_name = $8,
                        date = $9,
                        time = $10,
                        end_time = $11,
                        status = $12,
                        updated_at = NOW()
                    WHERE id = $1
                    RETURNING *
                    """,
                    parsed_id,
                    payload["clientName"],
                    payload["phone"],
                    service["id"],
                    service["name"],
                    service["duration_minutes"],
                    specialist["id"],
                    specialist["name"],
                    booking_date,
                    start_time,
                    end_time,
                    status,
                )
            else:
                row = await conn.fetchrow(
                    """
                    INSERT INTO bookings (
                      id, telegram_user_id, first_name, username, client_name, phone,
                      service_id, service_name, duration_minutes, specialist_id, specialist_name,
                      date, time, end_time, status
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                    RETURNING *
                    """,
                    parsed_id,
                    int(payload.get("telegramUserId") or 0),
                    payload.get("firstName") or "Sheet",
                    payload.get("username") or "",
                    payload["clientName"],
                    payload["phone"],
                    service["id"],
                    service["name"],
                    service["duration_minutes"],
                    specialist["id"],
                    specialist["name"],
                    booking_date,
                    start_time,
                    end_time,
                    status,
                )

    return booking_to_dict(row)


async def validate_service_ids(conn: asyncpg.Connection, service_ids: list[str]) -> None:
    rows = await conn.fetch("SELECT id FROM services WHERE id = ANY($1::text[])", service_ids)
    found_ids = {row["id"] for row in rows}
    missing_ids = set(service_ids) - found_ids
    if missing_ids:
        raise ValueError("One or more service categories are invalid.")


async def replace_specialist_services(conn: asyncpg.Connection, specialist_id: str, service_ids: list[str]) -> None:
    await conn.execute("DELETE FROM specialist_services WHERE specialist_id = $1", specialist_id)
    for service_id in service_ids:
        await conn.execute(
            """
            INSERT INTO specialist_services (specialist_id, service_id)
            VALUES ($1, $2)
            """,
            specialist_id,
            service_id,
        )


def normalize_service_ids(service_ids: Any) -> list[str]:
    if not isinstance(service_ids, list):
        return []
    return sorted({str(service_id).strip() for service_id in service_ids if str(service_id).strip()})


def normalize_days_off(days_off: Any) -> list[int]:
    if not isinstance(days_off, list):
        return []

    normalized = set()
    for day in days_off:
        parsed_day = int(day)
        if 0 <= parsed_day <= 6:
            normalized.add(parsed_day)
    return sorted(normalized)


def slugify(value: str) -> str:
    slug = "".join(character.lower() if character.isalnum() else "-" for character in value)
    slug = "-".join(part for part in slug.split("-") if part)
    return slug or f"specialist-{uuid.uuid4().hex[:6]}"


def build_admin_stats(bookings: list[dict[str, Any]]) -> dict[str, int]:
    today = date.today().isoformat()
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    return {
        "today": len([booking for booking in bookings if booking["date"] == today and booking["status"] == "confirmed"]),
        "tomorrow": len([booking for booking in bookings if booking["date"] == tomorrow and booking["status"] == "confirmed"]),
        "upcoming": len([booking for booking in bookings if booking["date"] >= today and booking["status"] == "confirmed"]),
        "cancelled": len([booking for booking in bookings if booking["status"] == "cancelled"]),
        "noShow": len([booking for booking in bookings if booking["status"] == "no_show"]),
    }


def js_day_of_week(value: date) -> int:
    return (value.weekday() + 1) % 7
