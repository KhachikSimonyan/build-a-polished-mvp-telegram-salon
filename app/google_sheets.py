import asyncio
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.database import SlotAlreadyBooked, get_bookings, import_sheet_booking, replace_sheet_catalog


SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

HY = {
    "settings": "\u053f\u0561\u0580\u0563\u0561\u057e\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580",
    "services": "\u053e\u0561\u057c\u0561\u0575\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580",
    "specialists": "\u0544\u0561\u057d\u0576\u0561\u0563\u0565\u057f\u0576\u0565\u0580",
    "weekly_hours": "\u0531\u0577\u056d\u0561\u057f\u0561\u0576\u0584\u0561\u0575\u056b\u0576 \u056a\u0561\u0574\u0565\u0580",
    "exceptions": "\u0532\u0561\u0581\u0561\u057c\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0576\u0565\u0580",
    "bookings": "\u0531\u0574\u0580\u0561\u0563\u0580\u0578\u0582\u0574\u0576\u0565\u0580",
    "confirmed": "\u0540\u0561\u057d\u057f\u0561\u057f\u057e\u0561\u056e",
    "cancelled": "\u0549\u0565\u0572\u0561\u0580\u056f\u057e\u0561\u056e",
    "completed": "\u0531\u057e\u0561\u0580\u057f\u057e\u0561\u056e",
    "no_show": "\u0549\u056b \u0576\u0565\u0580\u056f\u0561\u0575\u0561\u0581\u0565\u056c",
    "pending": "\u054d\u057a\u0561\u057d\u0578\u0582\u0574 \u0567",
}

SHEET_NAMES = {
    "settings": HY["settings"],
    "services": HY["services"],
    "specialists": HY["specialists"],
    "weekly_hours": HY["weekly_hours"],
    "exceptions": HY["exceptions"],
    "bookings": HY["bookings"],
}

DAY_NAMES = {
    "\u056f\u056b\u0580\u0561\u056f\u056b": 0,
    "\u0565\u0580\u056f\u0578\u0582\u0577\u0561\u0562\u0569\u056b": 1,
    "\u0565\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b": 2,
    "\u0579\u0578\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b": 3,
    "\u0570\u056b\u0576\u0563\u0577\u0561\u0562\u0569\u056b": 4,
    "\u0578\u0582\u0580\u0562\u0561\u0569": 5,
    "\u0577\u0561\u0562\u0561\u0569": 6,
    "sunday": 0,
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5,
    "saturday": 6,
}

STATUS_TO_DB = {
    HY["confirmed"].lower(): "confirmed",
    HY["pending"].lower(): "confirmed",
    HY["cancelled"].lower(): "cancelled",
    HY["completed"].lower(): "completed",
    HY["no_show"].lower(): "no_show",
    "confirmed": "confirmed",
    "cancelled": "cancelled",
    "completed": "completed",
    "no_show": "no_show",
}

STATUS_TO_HY = {
    "confirmed": HY["confirmed"],
    "cancelled": HY["cancelled"],
    "completed": HY["completed"],
    "no_show": HY["no_show"],
}

DAY_COLUMNS = [
    (1, "\u0535\u0580\u056f\u0578\u0582\u0577\u0561\u0562\u0569\u056b"),
    (2, "\u0535\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b"),
    (3, "\u0549\u0578\u0580\u0565\u0584\u0577\u0561\u0562\u0569\u056b"),
    (4, "\u0540\u056b\u0576\u0563\u0577\u0561\u0562\u0569\u056b"),
    (5, "\u0548\u0582\u0580\u0562\u0561\u0569"),
    (6, "\u0547\u0561\u0562\u0561\u0569"),
    (0, "\u053f\u056b\u0580\u0561\u056f\u056b"),
]


@dataclass
class SheetSyncResult:
    imported_services: int = 0
    imported_specialists: int = 0
    imported_weekly_hours: int = 0
    imported_exceptions: int = 0
    imported_bookings: int = 0
    exported_bookings: int = 0
    errors: list[str] | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "importedServices": self.imported_services,
            "importedSpecialists": self.imported_specialists,
            "importedWeeklyHours": self.imported_weekly_hours,
            "importedExceptions": self.imported_exceptions,
            "importedBookings": self.imported_bookings,
            "exportedBookings": self.exported_bookings,
            "errors": self.errors or [],
        }


class GoogleSheetsSync:
    def __init__(self, sheet_id: str, service_account_file: str, service_account_json: str = ""):
        self.sheet_id = sheet_id
        self.service_account_file = service_account_file
        self.service_account_json = service_account_json
        self._service = None

    def enabled(self) -> bool:
        return bool(self.sheet_id and (self.service_account_file or self.service_account_json))

    def _client(self):
        if self._service:
            return self._service

        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        if self.service_account_json:
            credentials_info = json.loads(self.service_account_json)
            credentials = service_account.Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
        else:
            credentials = service_account.Credentials.from_service_account_file(
                Path(self.service_account_file),
                scopes=SCOPES,
            )
        self._service = build("sheets", "v4", credentials=credentials, cache_discovery=False)
        return self._service

    async def sync_all(self, pool) -> dict[str, Any]:
        if not self.enabled():
            return {"ok": False, "error": "Google Sheets sync is not configured."}

        result = SheetSyncResult(errors=[])
        await asyncio.to_thread(self.ensure_sheet_format)
        values = await asyncio.to_thread(self._read_required_tabs)

        catalog = parse_catalog(values, result.errors)
        counts = await replace_sheet_catalog(
            pool,
            catalog["services"],
            catalog["specialists"],
            catalog["weeklyHours"],
            catalog["exceptions"],
        )
        result.imported_services = counts["services"]
        result.imported_specialists = counts["specialists"]
        result.imported_weekly_hours = counts["weeklyHours"]
        result.imported_exceptions = counts["exceptions"]

        for index, booking in enumerate(parse_bookings(values.get(SHEET_NAMES["bookings"], []), catalog, result.errors), start=2):
            try:
                await import_sheet_booking(pool, booking)
                result.imported_bookings += 1
            except SlotAlreadyBooked:
                result.errors.append(f"{HY['bookings']} տող {index}: այդ ժամը արդեն զբաղված է։")
            except ValueError as error:
                result.errors.append(f"{HY['bookings']} տող {index}: {error}")

        bookings = await get_bookings(pool)
        await asyncio.to_thread(self.write_bookings, bookings)
        result.exported_bookings = len(bookings)
        return {"ok": True, "sync": result.to_dict()}

    async def export_bookings(self, pool) -> dict[str, Any]:
        if not self.enabled():
            return {"ok": False, "error": "Google Sheets sync is not configured."}
        bookings = await get_bookings(pool)
        await asyncio.to_thread(self.ensure_sheet_format)
        await asyncio.to_thread(self.write_bookings, bookings)
        return {"ok": True, "exportedBookings": len(bookings)}

    def _read_required_tabs(self) -> dict[str, list[list[str]]]:
        service = self._client()
        ranges = [f"{name}!A:Z" for name in SHEET_NAMES.values()]
        response = (
            service.spreadsheets()
            .values()
            .batchGet(spreadsheetId=self.sheet_id, ranges=ranges, majorDimension="ROWS")
            .execute()
        )
        values = {}
        for item in response.get("valueRanges", []):
            name = item["range"].split("!", 1)[0].strip("'")
            values[name] = item.get("values", [])
        return values

    def ensure_sheet_format(self) -> None:
        service = self._client()
        metadata = service.spreadsheets().get(spreadsheetId=self.sheet_id).execute()
        sheet_ids = {sheet["properties"]["title"]: sheet["properties"]["sheetId"] for sheet in metadata.get("sheets", [])}
        requests = []

        for title in SHEET_NAMES.values():
            if title not in sheet_ids:
                requests.append({"addSheet": {"properties": {"title": title}}})

        if requests:
            service.spreadsheets().batchUpdate(spreadsheetId=self.sheet_id, body={"requests": requests}).execute()
            metadata = service.spreadsheets().get(spreadsheetId=self.sheet_id).execute()
            sheet_ids = {sheet["properties"]["title"]: sheet["properties"]["sheetId"] for sheet in metadata.get("sheets", [])}

        checkbox_columns = {
            SHEET_NAMES["services"]: [5],
            SHEET_NAMES["specialists"]: [5],
            SHEET_NAMES["weekly_hours"]: [3, 6, 9, 12, 15, 18, 21],
        }
        requests = []
        for title, columns in checkbox_columns.items():
            sheet_id = sheet_ids.get(title)
            if sheet_id is None:
                continue
            for column in columns:
                requests.append(
                    {
                        "setDataValidation": {
                            "range": {
                                "sheetId": sheet_id,
                                "startRowIndex": 1,
                                "endRowIndex": 500,
                                "startColumnIndex": column,
                                "endColumnIndex": column + 1,
                            },
                            "rule": {
                                "condition": {"type": "BOOLEAN"},
                                "strict": True,
                                "showCustomUi": True,
                            },
                        }
                    }
                )

        if requests:
            service.spreadsheets().batchUpdate(spreadsheetId=self.sheet_id, body={"requests": requests}).execute()

    def write_bookings(self, bookings: list[dict[str, Any]]) -> None:
        rows = [
            [
                "Ամրագրում ID",
                "Ստեղծման օր",
                "Հաճախորդ",
                "Հեռախոս",
                "Telegram ID",
                "Ծառայություն ID",
                "Ծառայություն",
                "Մասնագետ ID",
                "Մասնագետ",
                "Ամսաթիվ",
                "Ժամ",
                "Կարգավիճակ",
            ]
        ]
        for booking in bookings:
            rows.append(
                [
                    booking["id"],
                    booking["createdAt"],
                    booking["clientName"],
                    booking["phone"],
                    booking["telegramUserId"],
                    booking["serviceId"],
                    booking["serviceName"],
                    booking["specialistId"],
                    booking["specialistName"],
                    booking["date"],
                    booking["time"],
                    STATUS_TO_HY.get(booking["status"], booking["status"]),
                ]
            )

        service = self._client()
        service.spreadsheets().values().clear(
            spreadsheetId=self.sheet_id,
            range=f"{SHEET_NAMES['bookings']}!A:L",
            body={},
        ).execute()
        service.spreadsheets().values().update(
            spreadsheetId=self.sheet_id,
            range=f"{SHEET_NAMES['bookings']}!A1",
            valueInputOption="USER_ENTERED",
            body={"values": rows},
        ).execute()


def parse_catalog(values: dict[str, list[list[str]]], errors: list[str]) -> dict[str, list[dict[str, Any]]]:
    services = parse_services(values.get(SHEET_NAMES["services"], []), errors)
    specialists = parse_specialists(values.get(SHEET_NAMES["specialists"], []), errors)
    weekly_hours = parse_weekly_hours(values.get(SHEET_NAMES["weekly_hours"], []), errors)
    exceptions = parse_exceptions(values.get(SHEET_NAMES["exceptions"], []), errors)
    return {
        "services": services,
        "specialists": specialists,
        "weeklyHours": weekly_hours,
        "exceptions": exceptions,
    }


def parse_services(rows: list[list[str]], errors: list[str]) -> list[dict[str, Any]]:
    services = []
    for row_number, row in data_rows(rows):
        service_id = cell(row, 0)
        name = cell(row, 1)
        if not service_id or not name:
            continue
        try:
            duration = int(cell(row, 3) or "0")
        except ValueError:
            errors.append(f"{HY['services']} տող {row_number}: տևողությունը պետք է թիվ լինի։")
            continue
        services.append(
            {
                "id": service_id,
                "name": name,
                "durationMinutes": duration,
                "active": yes(cell(row, 5)),
                "icon": "",
                "imageUrl": "",
            }
        )
    return services


def parse_specialists(rows: list[list[str]], errors: list[str]) -> list[dict[str, Any]]:
    specialists = []
    for row_number, row in data_rows(rows):
        specialist_id = cell(row, 0)
        name = cell(row, 1)
        if not specialist_id or not name:
            continue
        service_ids = [item.strip() for item in cell(row, 3).split(",") if item.strip()]
        if not service_ids:
            errors.append(f"{HY['specialists']} տող {row_number}: պետք է գոնե մեկ ծառայություն ID։")
            continue
        specialists.append(
            {
                "id": specialist_id,
                "name": name,
                "role": cell(row, 4) or cell(row, 2) or "Specialist",
                "active": yes(cell(row, 5)),
                "serviceIds": service_ids,
            }
        )
    return specialists


def parse_weekly_hours(rows: list[list[str]], errors: list[str]) -> list[dict[str, Any]]:
    if not rows:
        return []
    headers = [normalize_header(value) for value in rows[0]]
    if any("երկուշաբթի" in header for header in headers) and len(headers) > 10:
        return parse_wide_weekly_hours(rows, errors)
    return parse_legacy_weekly_hours(rows, errors)


def parse_wide_weekly_hours(rows: list[list[str]], errors: list[str]) -> list[dict[str, Any]]:
    weekly_hours = []
    for row_number, row in data_rows(rows):
        specialist_id = cell(row, 0)
        if not specialist_id:
            continue
        for day_of_week, _label, active_index, start_index, end_index in day_column_map():
            active = yes(cell(row, active_index))
            start = cell(row, start_index) or "10:00"
            end = cell(row, end_index) or "18:00"
            if active and not (start and end):
                errors.append(f"{HY['weekly_hours']} տող {row_number}: նշված աշխատանքային օրը պետք է ունենա սկիզբ և ավարտ։")
                continue
            weekly_hours.append(
                {
                    "specialistId": specialist_id,
                    "dayOfWeek": day_of_week,
                    "start": start,
                    "end": end,
                    "active": active,
                }
            )
    return weekly_hours


def parse_legacy_weekly_hours(rows: list[list[str]], errors: list[str]) -> list[dict[str, Any]]:
    weekly_hours = []
    for row_number, row in data_rows(rows):
        specialist_id = cell(row, 0)
        day_name = cell(row, 1).lower()
        start = cell(row, 2)
        end = cell(row, 3)
        if not specialist_id or not day_name:
            continue
        if day_name not in DAY_NAMES:
            errors.append(f"{HY['weekly_hours']} տող {row_number}: շաբաթվա օրը սխալ է։")
            continue
        weekly_hours.append(
            {
                "specialistId": specialist_id,
                "dayOfWeek": DAY_NAMES[day_name],
                "start": start or "10:00",
                "end": end or "18:00",
                "active": yes(cell(row, 6)),
            }
        )
    return weekly_hours


def parse_exceptions(rows: list[list[str]], errors: list[str]) -> list[dict[str, Any]]:
    exceptions = []
    for _row_number, row in data_rows(rows):
        specialist_id = cell(row, 1)
        exception_date = cell(row, 2)
        exception_type = cell(row, 3).lower()
        if not specialist_id or not exception_date:
            continue
        is_day_off = "փակ ամբողջ" in exception_type or "day off" in exception_type
        exceptions.append(
            {
                "specialistId": specialist_id,
                "date": exception_date,
                "isDayOff": is_day_off,
                "start": "" if is_day_off else cell(row, 4),
                "end": "" if is_day_off else cell(row, 5),
                "note": cell(row, 6),
            }
        )
    return exceptions


def parse_bookings(rows: list[list[str]], catalog: dict[str, list[dict[str, Any]]], errors: list[str]) -> list[dict[str, Any]]:
    if not rows:
        return []
    headers = {normalize_header(value): index for index, value in enumerate(rows[0])}
    service_name_to_id = {item["name"].strip().lower(): item["id"] for item in catalog["services"]}
    specialist_name_to_id = {item["name"].strip().lower(): item["id"] for item in catalog["specialists"]}
    bookings = []
    for row_number, row in data_rows(rows):
        client_name = get_by_headers(row, headers, ["հաճախորդ", "client"])
        phone = get_by_headers(row, headers, ["հեռախոս", "phone"])
        date = get_by_headers(row, headers, ["ամսաթիվ", "date"])
        time = get_by_headers(row, headers, ["ժամ", "time"])
        service_id = get_by_headers(row, headers, ["ծառայություն id", "service id", "serviceid"])
        specialist_id = get_by_headers(row, headers, ["մասնագետ id", "specialist id", "specialistid"])
        service_name = get_by_headers(row, headers, ["ծառայություն", "service"])
        specialist_name = get_by_headers(row, headers, ["մասնագետ", "specialist"])

        if not service_id:
            service_id = service_name_to_id.get(service_name.strip().lower(), "")
        if not specialist_id:
            specialist_id = specialist_name_to_id.get(specialist_name.strip().lower(), "")

        if not any([client_name, phone, date, time, service_id, specialist_id]):
            continue
        if not all([client_name, phone, date, time, service_id, specialist_id]):
            errors.append(f"{HY['bookings']} տող {row_number}: հաճախորդ, հեռախոս, ծառայություն, մասնագետ, ամսաթիվ և ժամ դաշտերը պարտադիր են։")
            continue

        status_value = get_by_headers(row, headers, ["կարգավիճակ", "status"]) or HY["confirmed"]
        bookings.append(
            {
                "id": cell(row, 0),
                "clientName": client_name,
                "phone": phone,
                "telegramUserId": get_by_headers(row, headers, ["telegram id", "telegram"]) or 0,
                "serviceId": service_id,
                "specialistId": specialist_id,
                "date": date,
                "time": time,
                "status": STATUS_TO_DB.get(status_value.lower(), "confirmed"),
            }
        )
    return bookings


def day_column_map() -> list[tuple[int, str, int, int, int]]:
    result = []
    start_index = 3
    for day_of_week, label in DAY_COLUMNS:
        result.append((day_of_week, label, start_index, start_index + 1, start_index + 2))
        start_index += 3
    return result


def data_rows(rows: list[list[str]]) -> list[tuple[int, list[str]]]:
    return [(index + 1, row) for index, row in enumerate(rows[1:], start=1)]


def cell(row: list[str], index: int) -> str:
    if index >= len(row):
        return ""
    return str(row[index]).strip()


def yes(value: str) -> bool:
    return value.strip().lower() in {"այո", "yes", "true", "1", "да", "checked"}


def normalize_header(value: str) -> str:
    return " ".join(str(value).strip().lower().replace("_", " ").split())


def get_by_headers(row: list[str], headers: dict[str, int], candidates: list[str]) -> str:
    for candidate in candidates:
        normalized = normalize_header(candidate)
        if normalized in headers:
            return cell(row, headers[normalized])
    return ""
