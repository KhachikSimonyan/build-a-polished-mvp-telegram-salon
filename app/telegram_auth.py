import hashlib
import hmac
import json
import time
from urllib.parse import parse_qsl


MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60


def validate_telegram_init_data(init_data: str | None, bot_token: str) -> tuple[bool, dict | None, str | None]:
    if not bot_token:
        return False, None, "Telegram bot token is not configured."

    if not init_data:
        return False, None, "Missing Telegram Mini App init data."

    pairs = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = pairs.pop("hash", None)

    if not received_hash:
        return False, None, "Missing Telegram hash."

    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(calculated_hash, received_hash):
        return False, None, "Invalid Telegram Mini App signature."

    auth_date = int(pairs.get("auth_date", "0") or "0")
    if not auth_date or int(time.time()) - auth_date > MAX_INIT_DATA_AGE_SECONDS:
        return False, None, "Telegram Mini App session has expired."

    try:
        user = json.loads(pairs.get("user", "{}"))
    except json.JSONDecodeError:
        return False, None, "Telegram user data is invalid."

    if not user.get("id"):
        return False, None, "Telegram user data is missing."

    return True, user, None
