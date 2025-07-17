from enum import Enum
from random import choice
import string
import pytz
from datetime import datetime, timezone
import uuid
from flask import request, session
from datetime import datetime, timedelta
import requests
from root.config import CLIENT_ID, CLIENT_SECRET, SCOPE, uri
from root.db.dbHelper import DBHelper
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials


def numGenerator(size=6, chars=string.digits):
    return "".join(choice(chars) for _ in range(size))


def alphaNumGenerator(size=4, chars="ABCDEFGHJKLMNPQRSTUVWYZ123456789"):
    return "".join(choice(chars) for _ in range(size))


def get_local_timezone():
    return datetime.now().astimezone().tzinfo


def dateTimeToReadableDate(dateTime, format="%Y-%m-%d %H:%M:%S"):
    if not dateTime:
        return None
    return (
        dateTime.replace(tzinfo=timezone.utc)
        .astimezone(get_local_timezone())
        .strftime(format)
    )


SESSION_TIMEOUT_MINUTES = 1


def get_ip():
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0]
    return request.remote_addr


def get_geo_location(ip):
    try:
        res = requests.get(f"https://ipinfo.io/{ip}/json")
        if res.status_code == 200:
            return res.json()
    except:
        pass
    return {}


def handle_user_session(uid):
    now = datetime.utcnow()

    if "session_id" not in session or "last_active" not in session:
        session["session_id"] = str(uuid.uuid4())
        session["created_at"] = now.isoformat()
        session["last_active"] = now.isoformat()
        session.permanent = True
    else:
        last_active = datetime.fromisoformat(session["last_active"])
        if (now - last_active) > timedelta(minutes=SESSION_TIMEOUT_MINUTES):
            session.clear()
            session["session_id"] = str(uuid.uuid4())
            session["created_at"] = now.isoformat()
        session["last_active"] = now.isoformat()

    ip = get_ip()
    geo = get_geo_location(ip)

    session_data = {
        "uid": uid,
        "session_id": session["session_id"],
        "ip_address": ip,
        "geo_location": str(geo),
        "created_at": session["created_at"],
    }

    existing_session = DBHelper.find_one("user_sessions", {"uid": uid})

    if existing_session:
        DBHelper.update_one("user_sessions", filters={"uid": uid}, updates=session_data)
    else:
        DBHelper.insert("user_sessions", **session_data)

    return {
        "session_id": session["session_id"],
        "created_at": session["created_at"],
        "last_active": session["last_active"],
        "ip_address": ip,
        "geo_location": geo,
    }


class Status(Enum):
    REMOVED = 0
    ACTIVE = 1


def uniqueId(digit=4, isNum=False, ref={}, prefix=None, suffix=None):
    _id = numGenerator(digit) if isNum else alphaNumGenerator(digit)

    if prefix is not None:
        _id = f"{prefix}X{_id}"

    if suffix is not None:
        _id = f"{_id}X{suffix}"

    existing = DBHelper.find_one("uuid", filters={"uid": _id})

    if existing:
        return uniqueId(digit, isNum, ref, prefix, suffix)
    else:
        ref.pop("uid", None)
        DBHelper.insert("uuid", return_column="uid", uid=_id, **ref)
        return _id


def create_calendar_event(user_id, title, start_dt, end_dt=None, attendees=None):
    user_cred = DBHelper.find_one(
        "connected_accounts",
        filters={"user_id": user_id},
        select_fields=["access_token", "refresh_token", "email"],
    )
    if not user_cred:
        raise Exception("No connected Google account found.")

    creds = Credentials(
        token=user_cred["access_token"],
        refresh_token=user_cred["refresh_token"],
        token_uri=uri,
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        scopes=SCOPE.split(),
    )

    service = build("calendar", "v3", credentials=creds)

    if end_dt is None:
        end_dt = start_dt + timedelta(hours=1)

    event = {
        "summary": title,
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "Asia/Kolkata"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "Asia/Kolkata"},
        "attendees": attendees or [],
        "guestsCanModify": True,
        "guestsCanInviteOthers": True,
        "guestsCanSeeOtherGuests": True,
    }

    created_event = service.events().insert(calendarId="primary", body=event).execute()

    return created_event.get("id")  # ✅ return only the Google event ID


def update_calendar_event(
    user_id, calendar_event_id, title, start_dt, end_dt=None, attendees=None
):
    user_cred = DBHelper.find_one(
        "connected_accounts",
        filters={"user_id": user_id},
        select_fields=["access_token", "refresh_token", "email"],
    )
    if not user_cred:
        raise Exception("No connected Google account found.")

    creds = Credentials(
        token=user_cred["access_token"],
        refresh_token=user_cred["refresh_token"],
        token_uri=uri,
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        scopes=SCOPE.split(),
    )

    service = build("calendar", "v3", credentials=creds)

    if end_dt is None:
        end_dt = start_dt + timedelta(hours=1)

    # First: Get the existing event from Google
    existing_event = (
        service.events().get(calendarId="primary", eventId=calendar_event_id).execute()
    )

    # Update fields
    existing_event["summary"] = title
    existing_event["start"] = {
        "dateTime": start_dt.isoformat(),
        "timeZone": "Asia/Kolkata",
    }
    existing_event["end"] = {"dateTime": end_dt.isoformat(), "timeZone": "Asia/Kolkata"}
    existing_event["attendees"] = attendees or []
    existing_event["guestsCanModify"] = True
    existing_event["guestsCanInviteOthers"] = True
    existing_event["guestsCanSeeOtherGuests"] = True

    # Update on Google Calendar
    updated_event = (
        service.events()
        .update(calendarId="primary", eventId=calendar_event_id, body=existing_event)
        .execute()
    )

    return updated_event.get("id")  # Optional return


def extract_datetime(text: str, now: datetime | None = None) -> datetime:
    from datetime import datetime, timedelta, time
    import pytz, re
    from dateparser.search import search_dates

    us_tz = pytz.timezone("America/New_York")
    now = now.astimezone(us_tz) if now else datetime.now(us_tz)

    DEFAULT_HOUR = 10
    DEFAULT_MINUTE = 0

    cleaned_text = re.sub(r"@+\w+", "", text).strip()

    time_regex_12h = re.compile(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", re.I)
    time_regex_24h = re.compile(r"\b(\d{1,2}):(\d{2})\b")

    time_match = time_regex_12h.search(cleaned_text) or time_regex_24h.search(
        cleaned_text
    )

    explicit_hour = explicit_minute = None
    if time_match:
        explicit_hour = int(time_match.group(1))
        explicit_minute = int(time_match.group(2) or 0)

        meridian = (
            time_match.group(3).lower()
            if len(time_match.groups()) >= 3 and time_match.group(3)
            else None
        )
        if meridian == "pm" and explicit_hour != 12:
            explicit_hour += 12
        if meridian == "am" and explicit_hour == 12:
            explicit_hour = 0

    custom_formats = [
        r"\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b",
        r"\b\d{1,2}(st|nd|rd|th)?\s+\w+\b",
        r"\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b(this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b\d{1,2}(st|nd|rd|th)\b",
    ]

    for pattern in custom_formats:
        match = re.search(pattern, cleaned_text, re.I)
        if not match:
            continue

        date_part = match.group(0).strip()

        if re.fullmatch(r"\d{1,2}[./-]\d{1,2}[./-]\d{2,4}", date_part):
            day_str, month_str, year_str = re.split(r"[./-]", date_part)
            day = int(day_str)
            month = int(month_str)
            year = int(year_str)
            if year < 100:
                year += 2000 if year < 70 else 1900

            hour = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
            minute = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE

            try:
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))
            except ValueError:
                pass
            else:
                return candidate

        if re.fullmatch(r"\d{1,2}(st|nd|rd|th)", date_part, re.I):
            day = int(re.sub(r"(st|nd|rd|th)", "", date_part, flags=re.I))
            hour = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
            minute = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE
            year, month = now.year, now.month
            try:
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))
            except ValueError:
                month += 1
                if month == 13:
                    month, year = 1, year + 1
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))

            if candidate < now:
                month += 1
                if month == 13:
                    month, year = 1, year + 1
                candidate = us_tz.localize(datetime(year, month, day, hour, minute))

            return candidate

        hh = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
        mm = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE
        full_phrase = f"{date_part} {hh}:{mm:02d}"

        parsed = search_dates(
            full_phrase,
            settings={
                "PREFER_DATES_FROM": "future",
                "RELATIVE_BASE": now,
                "TIMEZONE": "America/New_York",
                "TO_TIMEZONE": "America/New_York",
                "RETURN_AS_TIMEZONE_AWARE": True,
                "DATE_ORDER": "DMY",
            },
        )
        if parsed:
            return parsed[0][1].astimezone(us_tz)

    if explicit_hour is not None:
        target_date = now.date()
        # Detect words like "tomorrow" or "day after"
        if "tomorrow" in cleaned_text.lower():
            target_date += timedelta(days=1)
        elif "day after" in cleaned_text.lower():
            target_date += timedelta(days=2)
        elif "next" in cleaned_text.lower():
            target_date += timedelta(days=7)

        combined = us_tz.localize(
            datetime.combine(target_date, time(explicit_hour, explicit_minute))
        )
        if combined < now:
            combined += timedelta(days=1)
        return combined

    results = search_dates(
        cleaned_text,
        settings={
            "PREFER_DATES_FROM": "future",
            "RELATIVE_BASE": now,
            "TIMEZONE": "America/New_York",
            "TO_TIMEZONE": "America/New_York",
            "RETURN_AS_TIMEZONE_AWARE": True,
            "DATE_ORDER": "DMY",
        },
    )

    if results:
        dt = results[0][1].astimezone(us_tz)
        if dt.hour == 0 and dt.minute == 0 and explicit_hour is None:
            dt = dt.replace(hour=DEFAULT_HOUR, minute=DEFAULT_MINUTE)
        if dt < now:
            dt += timedelta(days=1)
        return dt

    return now
