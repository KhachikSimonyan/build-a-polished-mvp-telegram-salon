# Maison Rose Demo Runbook

This project has two modes:

- Local demo: data is stored on this computer in PostgreSQL database `salon_booking`.
- Server mode: data is stored on the hosting provider's PostgreSQL database, for example Render PostgreSQL.

## Local Demo

Run PowerShell in the project folder:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\start_demo.ps1
```

Open:

```text
http://localhost:3000
http://localhost:3000/admin
```

Admin password comes from `.env`.

## Public Telegram Demo From This Computer

Use this when you want to show the Mini App inside Telegram from your laptop.

First put your real bot values in `.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
OWNER_CHAT_ID=your_telegram_id
```

Then run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\start_public_demo.ps1
```

The script starts the app, opens a temporary Cloudflare HTTPS URL, writes it to `BASE_URL`, restarts the app, and enables the Telegram bot.

Send `/start` to your bot.

## Stop Demo

```powershell
.\scripts\stop_demo.ps1
```

## GitHub

Safe to push:

- source code
- `requirements.txt`
- `render.yaml`
- `.env.example`
- `.env.demo.example`
- `DEMO.md`

Do not push:

- `.env`
- `.venv`
- `google-service-account.json`
- real bot tokens or passwords

These are already ignored by `.gitignore`.

## Always-On Telegram Deployment

For a permanent Telegram bot, deploy the app to a server with PostgreSQL.

Recommended MVP path:

1. Push project to GitHub.
2. Create a Render Web Service from the repo.
3. Add Render PostgreSQL.
4. Set environment variables:

```env
TELEGRAM_BOT_TOKEN=your_real_bot_token
BASE_URL=https://your-render-app.onrender.com
DATABASE_URL=render_postgres_connection_string
OWNER_CHAT_ID=your_telegram_id
ADMIN_PASSWORD=strong_password
DISABLE_TELEGRAM_BOT=
GOOGLE_SYNC_ENABLED=false
```

5. Open:

```text
https://your-render-app.onrender.com/health
```

Expected:

```json
{"ok": true}
```

6. Send `/start` to the bot in Telegram.
