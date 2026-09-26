import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class Settings:
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    telegram_use_webhook: bool = os.getenv("TELEGRAM_USE_WEBHOOK", "").lower() == "true"
    telegram_webhook_secret: str = os.getenv("TELEGRAM_WEBHOOK_SECRET", "")
    base_url: str = os.getenv("BASE_URL", "http://localhost:3000").rstrip("/")
    port: int = int(os.getenv("PORT", "3000"))
    owner_chat_id: str = os.getenv("OWNER_CHAT_ID", "")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "123456")
    database_url: str = os.getenv("DATABASE_URL", "")
    disable_telegram_bot: bool = os.getenv("DISABLE_TELEGRAM_BOT", "").lower() == "true"
    google_sheet_id: str = os.getenv("GOOGLE_SHEET_ID", "")
    google_service_account_file: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "")
    google_service_account_json: str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")
    google_sync_enabled: bool = os.getenv("GOOGLE_SYNC_ENABLED", "").lower() == "true"
    google_sync_interval_seconds: int = int(os.getenv("GOOGLE_SYNC_INTERVAL_SECONDS", "60"))

    @property
    def is_public_https_base_url(self) -> bool:
        return self.base_url.startswith("https://")


settings = Settings()
