# Maison Rose Telegram Salon Booking

A premium Telegram Mini App salon booking demo built with Python, FastAPI, PostgreSQL, and a plain HTML/CSS/JavaScript frontend.

## Features

- Telegram bot `/start` command with Mini App booking button
- Telegram bot `/admin` command for the owner dashboard
- Premium mobile-first Mini App booking flow
- Service, specialist, date, time, name, and phone collection
- PostgreSQL storage for services, specialists, schedules, and bookings
- Server-side Telegram Mini App `initData` validation
- Service durations block overlapping bookings
- Specialist working hours and days off
- Admin dashboard at `/admin`
- Admin can update booking status: `confirmed`, `cancelled`, `completed`
- Admin can manage staff schedules
- Admin can add, remove, and restore specialists
- Admin can assign specialists to service categories
- Admin can add, edit, hide, and restore service categories
- Admin can edit specialist names and roles
- Clients only see active specialists who provide the selected service
- Clients only see working days and available hours for the selected specialist
- Customer Telegram confirmation with cancel button
- Owner Telegram notifications with quick action buttons
- Optional Google Sheets admin sync for services, specialists, weekly hours, exceptions, and manual bookings

## Project Structure

```text
.
|-- main.py
|-- requirements.txt
|-- .env.example
|-- README.md
|-- app
|   |-- __init__.py
|   |-- bot.py
|   |-- config.py
|   |-- database.py
|   |-- google_sheets.py
|   `-- telegram_auth.py
`-- public
    |-- admin.html
    |-- admin.js
    |-- app.js
    |-- index.html
    `-- style.css
```

## Setup

1. Create and activate a virtual environment:

```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a PostgreSQL database:

```sql
CREATE DATABASE salon_booking;
```

4. Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

5. Fill in `.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
BASE_URL=https://your-public-https-url.example.com
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/salon_booking
OWNER_CHAT_ID=
ADMIN_PASSWORD=123456
DISABLE_TELEGRAM_BOT=
GOOGLE_SYNC_ENABLED=false
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_FILE=google-service-account.json
GOOGLE_SYNC_INTERVAL_SECONDS=60
```

For Telegram Mini Apps, `BASE_URL` must be a public HTTPS URL. For local demos, run a tunnel:

```bash
ngrok http 3000
```

Then put the HTTPS forwarding URL in `BASE_URL`.

6. Start the app:

```bash
uvicorn main:app --host 0.0.0.0 --port 3000
```

The app creates the PostgreSQL tables and seeds demo services/specialists automatically on startup.

## Google Sheets Admin Sync

Use this when the salon owner wants to manage the bot from Google Sheets.

Recommended flow:

```text
Google Sheet -> FastAPI sync -> PostgreSQL -> Telegram Mini App
Telegram booking -> PostgreSQL -> Google Sheet
```

PostgreSQL stays the fast booking database. Google Sheets becomes the easy admin control panel.

### 1. Prepare the Sheet

Use the simplified Armenian template in:

```text
outputs/maison-rose-simple-admin-sheet-hy.xlsx
```

Upload it to Google Drive and open it with Google Sheets.

The required tab names are:

```text
Ծառայություններ
Մասնագետներ
Աշխատանքային ժամեր
Բացառություններ
Ամրագրումներ
```

Optional helper tabs can also exist:

```text
Ուղեցույց
Մասնագիտություններ
```

The simplified schedule tab uses one row per specialist. Weekday columns become real Google Sheets checkboxes after the first sync.

```text
Մասնագետներ
Աշխատանքային ժամեր
```

Admin can manually add bookings in `Ամրագրումներ`. When sync runs, the booking is saved in PostgreSQL and that slot becomes unavailable for clients.

### 2. Create Google credentials

1. Open Google Cloud Console.
2. Create a project.
3. Enable `Google Sheets API`.
4. Create a Service Account.
5. Create a JSON key for that Service Account.
6. Put the downloaded JSON file in the project root as:

```text
google-service-account.json
```

7. Open the JSON file and copy the `client_email`.
8. Share your Google Sheet with that email as `Editor`.

### 3. Get the Sheet ID

From a Google Sheet URL like:

```text
https://docs.google.com/spreadsheets/d/1ABCDEF_your_sheet_id_here/edit
```

copy only this part:

```text
1ABCDEF_your_sheet_id_here
```

### 4. Enable sync in `.env`

```env
GOOGLE_SYNC_ENABLED=true
GOOGLE_SHEET_ID=1ABCDEF_your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_FILE=google-service-account.json
GOOGLE_SYNC_INTERVAL_SECONDS=60
```

Restart the server after changing `.env`.

### 5. Use it

Open admin:

```text
http://localhost:3000/admin
```

or through ngrok:

```text
https://your-ngrok-link.ngrok-free.dev/admin
```

Press `Sync now` in the Google Sheet section.

What sync does:

- Reads `Ծառայություններ` into the bot services.
- Reads `Մասնագետներ` into the bot staff list.
- Reads `Աշխատանքային ժամեր` into per-specialist weekly hours.
- Reads `Բացառություններ` into day-off or special-day rules.
- Reads manual rows from `Ամրագրումներ`.
- Writes all current bot bookings back to `Ամրագրումներ`.

If `GOOGLE_SYNC_ENABLED=true`, this also runs automatically every `GOOGLE_SYNC_INTERVAL_SECONDS`.

## Telegram Usage

- Send `/start` to open the client booking Mini App.
- If your Telegram chat id equals `OWNER_CHAT_ID`, `/start` also shows an admin button.
- Send `/admin` as the owner to open the admin dashboard from Telegram.

Admin dashboard:

```text
http://localhost:3000/admin
https://your-ngrok-link.ngrok-free.dev/admin
```

## Hosting / Production Deploy

The app is ready for hosts that run Python web services with PostgreSQL.

Recommended simple hosting path:

```text
GitHub repo -> Render Web Service -> Render PostgreSQL
```

Render settings:

```text
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Required environment variables on the host:

```env
TELEGRAM_BOT_TOKEN=your_real_bot_token
BASE_URL=https://your-host-domain.example.com
DATABASE_URL=host_postgres_connection_string
OWNER_CHAT_ID=your_telegram_owner_chat_id
ADMIN_PASSWORD=choose_a_strong_password
DISABLE_TELEGRAM_BOT=
GOOGLE_SYNC_ENABLED=false
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_JSON=
GOOGLE_SYNC_INTERVAL_SECONDS=60
```

For Google Sheets on hosting, do not upload `google-service-account.json`. Instead, paste the full JSON content into:

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Then set:

```env
GOOGLE_SYNC_ENABLED=true
GOOGLE_SHEET_ID=your_google_sheet_id
```

After deploy, open:

```text
https://your-host-domain.example.com/health
```

Expected result:

```json
{"ok": true}
```

Then update `BASE_URL` to the final public HTTPS URL and restart/redeploy the service.

## API

### `GET /health`

Returns server status.

### `GET /api/catalog`

Returns services and specialists.

### `GET /api/availability`

Returns available and booked slots for a service, specialist, and date.

```text
/api/availability?serviceId=hair-coloring&specialistId=ava-bennett&date=2026-04-25
```

### `POST /api/bookings`

Creates a booking. Requires valid Telegram Mini App init data in the `x-telegram-init-data` header.

```json
{
  "clientName": "Ani Sargsyan",
  "phone": "+374 77 123 456",
  "serviceId": "haircut-styling",
  "specialistId": "emily-rose",
  "date": "2026-04-25",
  "time": "14:00"
}
```

### `GET /api/admin/bookings`

Returns bookings and dashboard stats. Requires `x-admin-password`.

### `PATCH /api/admin/bookings/:id/status`

Updates a booking status. Requires `x-admin-password`.

```json
{
  "status": "cancelled"
}
```

### `GET /api/admin/specialists`

Returns services, specialists, category assignments, and schedules. Requires `x-admin-password`.

### `POST /api/admin/specialists`

Creates a new active specialist. Requires `x-admin-password`.

```json
{
  "name": "Mia Harper",
  "role": "Brow Artist",
  "serviceIds": ["facial-treatment"],
  "schedule": {
    "start": "10:00",
    "end": "18:00",
    "daysOff": [0]
  }
}
```

### `POST /api/admin/services`

Creates a new active service category. Requires `x-admin-password`.

```json
{
  "name": "Brow Lamination",
  "durationMinutes": 45
}
```

### `PATCH /api/admin/services/:id`

Updates a service name and duration. Requires `x-admin-password`.

### `PATCH /api/admin/services/:id/active`

Hides or restores a service category in the customer booking flow.

```json
{
  "active": false
}
```

### `PATCH /api/admin/specialists/:id/schedule`

Updates a staff schedule. Requires `x-admin-password`.

```json
{
  "schedule": {
    "start": "10:00",
    "end": "18:00",
    "daysOff": [1]
  }
}
```

### `PATCH /api/admin/specialists/:id/profile`

Updates a specialist name and role.

```json
{
  "name": "Emily Rose",
  "role": "Creative Director"
}
```

### `PATCH /api/admin/specialists/:id/services`

Assigns service categories to a specialist. Requires `x-admin-password`.

```json
{
  "serviceIds": ["haircut-styling", "hair-coloring"]
}
```

### `PATCH /api/admin/specialists/:id/active`

Hides or restores a specialist in the customer booking flow. Existing bookings remain in history.

```json
{
  "active": false
}
```

### `POST /api/admin/google-sheets/sync`

Manually syncs Google Sheets with PostgreSQL. Requires `x-admin-password`.

### `GET /api/admin/google-sheets/status`

Returns Google Sheets sync configuration status. Requires `x-admin-password`.
