from enum import Enum
from random import choice
import string
import pytz
from datetime import datetime, timezone
import uuid
from flask import request, session
from datetime import datetime, timedelta
import requests
from root.db.dbHelper import DBHelper


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

    DBHelper.insert(
            "user_sessions",
            uid=uid,
            session_id=session['session_id'],
            ip_address=ip,  # ✅ Corrected column name
            geo_location=str(geo),
            created_at=session['created_at']
        )
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

    existing = DBHelper.find_one("uuid", filters={"_id": _id})

    if existing:
        return uniqueId(digit, isNum, ref, prefix, suffix)
    else:
        ref.pop("_id", None)
        DBHelper.insert("uuid", return_column="_id", _id=_id, **ref)
        return _id
