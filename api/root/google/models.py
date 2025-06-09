import calendar
from datetime import datetime, time, timedelta
import json
import re
from flask import make_response, redirect, request, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
import pytz
from root.utilis import uniqueId
from root.db.dbHelper import DBHelper
from root.config import API_URL, CLIENT_ID, CLIENT_SECRET, WEB_URL
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from urllib.parse import quote
import dateparser
from dateparser.search import search_dates
from pytz import timezone, utc

import requests

from root.auth.auth import auth_required


REDIRECT_URI = f"{API_URL}/auth/callback/google"
SCOPE = (
    "email profile "
    "https://www.googleapis.com/auth/calendar "
    "https://www.googleapis.com/auth/drive "
    "https://www.googleapis.com/auth/fitness.activity.read "
    "https://www.googleapis.com/auth/fitness.body.read "
    "https://www.googleapis.com/auth/fitness.location.read "
    "https://www.googleapis.com/auth/fitness.sleep.read "
    "https://www.googleapis.com/auth/userinfo.email "
    "https://www.googleapis.com/auth/userinfo.profile"
)
uri = "https://oauth2.googleapis.com/token"

# Define a list of distinct light pastel colors
light_colors = [
    "#FF6F61",  # Vibrant coral red
    "#42A5F5",  # Bright blue
    "#66BB6A",  # Lively green
    "#FFA726",  # Strong orange
    "#AB47BC",  # Rich purple
    "#EC407A",  # Pink rose
    "#9CCC65",  # Bright lime green
    "#26C6DA",  # Electric teal
    "#FFD54F",  # Bright yellow
    "#5C6BC0",  # Deep indigo
]


class AddGoogleCalendar(Resource):
    def get(self):
        username = request.args.get("username")
        uid = request.args.get("userId")
        session["username"] = username
        session["uid"] = uid
        stateData = json.dumps({"uid": uid, "username": username})
        encoded_state = quote(stateData)

        auth_url = (
            "https://accounts.google.com/o/oauth2/v2/auth"
            f"?response_type=code"
            f"&client_id={CLIENT_ID}"
            f"&redirect_uri={REDIRECT_URI}"
            f"&scope={SCOPE.replace(' ', '%20')}"
            f"&access_type=offline"
            f"&prompt=consent"
            f"&state={encoded_state}"
        )

        return make_response(redirect(auth_url))


class GetGoogleCalendarEvents(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        selectFields = ["access_token", "refresh_token", "email"]
        allCreds = DBHelper.find(
            "google_tokens", filters={"uid": uid}, select_fields=selectFields
        )

        if not allCreds or len(allCreds) == 0:
            return {
                "status": 0,
                "message": "No connected Google accounts found.",
                "payload": {},
            }

        if len(allCreds) > len(light_colors):
            return {
                "status": 0,
                "message": "Too many connected Google accounts. Please limit to 10.",
                "payload": {},
            }

        merged_events = []
        color_mapping = {}

        for i, credData in enumerate(allCreds):
            try:
                creds = Credentials(
                    token=credData["access_token"],
                    refresh_token=credData["refresh_token"],
                    token_uri=uri,
                    client_id=CLIENT_ID,
                    client_secret=CLIENT_SECRET,
                    scopes=SCOPE.split(),
                )

                service = build("calendar", "v3", credentials=creds)

                events_result = (
                    service.events()
                    .list(
                        calendarId="primary",
                        timeMin=datetime.utcnow().isoformat() + "Z",
                        maxResults=20,
                        singleEvents=True,
                        orderBy="startTime",
                    )
                    .execute()
                )

                email = credData["email"]
                color = light_colors[i]
                color_mapping[email] = color

                events = events_result.get("items", [])

                # Tag events with the email and color
                for event in events:
                    event["source_email"] = email
                    event["account_color"] = color

                merged_events.extend(events)

            except Exception as e:
                print(f"Error fetching events for {credData['email']}: {e}")
                continue

        # Sort events by start datetime
        merged_events.sort(key=lambda e: e.get("start", {}).get("dateTime", ""))

        return {
            "status": 1,
            "message": "Calendar events merged from all connected Google accounts.",
            "payload": {
                "events": merged_events,
                "connected_accounts": list(color_mapping.keys()),
                "account_colors": color_mapping,
            },
        }


users = {}
tokens = {}


class GoogleCallback(Resource):
    def get(self):
        code = request.args.get("code")
        state = request.args.get("state")

        if not code or not state:
            return {"error": "Missing code"}, 400

        if state:
            stateData = json.loads(state)
            uid = stateData.get("uid")
            username = stateData.get("username")

        # Step 1: Exchange code for tokens
        tokenUrl = "https://oauth2.googleapis.com/token"
        tokenData = {
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        tokenResponse = requests.post(tokenUrl, data=tokenData)
        if tokenResponse.status_code != 200:
            return {"error": "Token exchange failed"}, 400

        tokenJson = tokenResponse.json()
        access_token = tokenJson.get("access_token")
        refresh_token = tokenJson.get("refresh_token")
        expires_in = tokenJson.get("expires_in", 3600)

        if not access_token or not refresh_token:
            return {"error": "Invalid token data"}, 400

        # Step 2: Get user info from Google
        userInfoResponse = requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if userInfoResponse.status_code != 200:
            return {"error": "Failed to fetch user info"}, 400

        userInfo = userInfoResponse.json()
        email = userInfo.get("email")
        if not email:
            return {"error": "Email not found"}, 400

        # Step 3: Get or create user
        userId = session.get("uid") or email  # fallback if uid not in session
        user = users.get(userId)
        if not user:
            users[userId] = {
                "id": userId,
                "email": email,
                "name": userInfo.get("name"),
                "picture": userInfo.get("picture"),
            }
            user = users[userId]

        existingEmail = DBHelper.find_one(
            "google_tokens",
            filters={"uid": uid, "email": email},
            select_fields=["email"],
        )

        if not existingEmail:
            inserted_id = DBHelper.insert(
                "google_tokens",
                uid=uid,
                email=email,
                access_token=access_token,
                refresh_token=refresh_token,
                expires_at=(
                    datetime.utcnow() + timedelta(seconds=expires_in)
                ).isoformat(),
                user_object=json.dumps(user),
            )

        # Step 5: Issue JWT for client
        jwtToken = create_access_token(
            identity=user["id"],
            additional_claims={
                "email": user["email"],
                "name": user["name"],
                "picture": user["picture"],
            },
        )

        redirect_url = f"{WEB_URL}/{username}/oauth/callback?token={jwtToken}"
        return redirect(redirect_url)


class AddGoogleCalendarEvent(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        matched_users = inputData.get("matchedUsers", [])
        attendees = [
            {"email": user["email"]} for user in matched_users if "email" in user
        ]
        eventText = inputData.get("event", "")
        if not eventText:
            return {"status": 0, "message": "Event text is required.", "payload": {}}

        cleaned_text = re.sub(r"@\w+", "", eventText).strip()
        cleaned_text = re.sub(
            r"^(event\s+on|remind\s+me\s+to|schedule\s+for|set\s+reminder\s+for)\s+",
            "",
            cleaned_text,
            flags=re.IGNORECASE,
        )

        # parsed_time = dateparser.parse(
        #     cleaned_text,
        #     settings={
        #         "PREFER_DATES_FROM": "future",
        #         "TIMEZONE": "UTC",
        #         "RETURN_AS_TIMEZONE_AWARE": True,
        #     },
        # )
        parsed_time = extract_datetime(cleaned_text)
        if not parsed_time:
            return {
                "status": 0,
                "message": "Could not detect time in the event text.",
                "payload": {},
            }

        user_cred = DBHelper.find_one(
            "google_tokens",
            filters={"uid": uid},
            select_fields=["access_token", "refresh_token", "email"],
        )

        if not user_cred:
            return {
                "status": 0,
                "message": "No connected Google account found.",
                "payload": {},
            }

        creds = Credentials(
            token=user_cred["access_token"],
            refresh_token=user_cred["refresh_token"],
            token_uri=uri,
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            scopes=SCOPE.split(),
        )

        service = build("calendar", "v3", credentials=creds)

        event = {
            "summary": f"Event: {eventText}",
            "start": {"dateTime": parsed_time, "timeZone": "UTC"},
            "end": {
                "dateTime": (parsed_time),
                "timeZone": "UTC",
            },
            "attendees": attendees,
            "guestsCanModify": True,
            "guestsCanInviteOthers": True,
            "guestsCanSeeOtherGuests": True,
        }

        created_event = (
            service.events().insert(calendarId="primary", body=event).execute()
        )

        return {
            "status": 1,
            "message": "Google Calendar event successfully added.",
            "payload": {"event_link": created_event.get("htmlLink")},
        }


class AddNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)

        note_text = inputData.get("note", "").strip()
        mode = inputData.get("mode", "today")  # default to 'today'

        if not note_text:
            return {"status": 0, "message": "Note text is required.", "payload": {}}

        parsed_time_str = extract_datetime(note_text)

        if not parsed_time_str:
            return {
                "status": 0,
                "message": "No time detected in the note text.",
                "payload": {},
            }

        parsed_time = datetime.fromisoformat(parsed_time_str)
        ist = pytz.timezone("Asia/Kolkata")
        parsed_time = parsed_time.astimezone(ist)

        note_dates = get_future_dates_from_mode(parsed_time, mode)
        nid = uniqueId(digit=5, isNum=True)
        inserted_notes = []
        for note_date in note_dates:
            full_dt = ist.localize(datetime.combine(note_date, parsed_time.time()))
            insert_data = {
                "uid": uid,
                "note": note_text,
                "note_time": full_dt.isoformat(),
                "status": 1,
                "nid": nid,
            }
            DBHelper.insert("notes", **insert_data)
            inserted_notes.append(insert_data)

        return {
            "status": 1,
            "message": f"{len(inserted_notes)} note(s) added successfully.",
            "payload": inserted_notes,
        }


class DeleteNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        noteId = int(inputData.get("noteId"))

        result = DBHelper.update_one(
            table_name="notes",
            filters={"uid": uid, "nid": noteId},
            updates={"status": 0},
            return_fields=["uid"],
        )

        if result is None:
            return {"status": 0, "message": "Note not found", "payload": {}}

        return {"status": 1, "message": "Notes deleted", "payload": {}}


class UpdateNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        noteId = int(inputData.get("noteId"))

        result = DBHelper.update_one(
            table_name="notes",
            filters={"uid": uid, "nid": noteId},
            updates={"status": 2},
            return_fields=["uid"],
        )

        if result is None:
            return {"status": 0, "message": "Note not found", "payload": {}}

        return {"status": 1, "message": "Note Completed", "payload": {}}


class GetNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        notes = []
        selectFields = ["note", "note_time", "status", "nid"]
        userNotes = DBHelper.find(
            "notes", filters={"uid": uid, "status": 1}, select_fields=selectFields
        )

        for note in userNotes:
            notes.append(
                {
                    "note": note["note"],
                    "note_time": note[
                        "note_time"
                    ].isoformat(),  # or .strftime('%Y-%m-%dT%H:%M:%S%z') if timezone is present
                    "status": note["status"],
                    "nid": note["nid"],
                }
            )

        return {"status": 1, "message": "Notes fetched", "payload": {"notes": notes}}


def extract_datetime(text: str, now=None) -> str:
    ist = pytz.timezone("Asia/Kolkata")
    now = now or datetime.now(ist)

    def to_ist_iso(dt: datetime) -> str:
        return dt.astimezone(ist).replace(microsecond=0).isoformat()

    def extract_time_manually(text: str) -> time | None:
        match = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", text, re.IGNORECASE)
        if match:
            hour = int(match.group(1))
            minute = int(match.group(2) or 0)
            meridian = match.group(3).lower()
            if meridian == "pm" and hour != 12:
                hour += 12
            if meridian == "am" and hour == 12:
                hour = 0
            return time(hour, minute)
        return None

    # Step 1: Try search_dates (for full datetime matches)
    results = search_dates(
        text,
        settings={
            "PREFER_DATES_FROM": "future",
            "RELATIVE_BASE": now,
            "TIMEZONE": "Asia/Kolkata",
            "TO_TIMEZONE": "Asia/Kolkata",
            "RETURN_AS_TIMEZONE_AWARE": True,
        },
    )

    if results:
        results = sorted(results, key=lambda x: len(x[0]), reverse=True)
        matched_text, parsed_dt = results[0]
        parsed_dt = parsed_dt.astimezone(ist)

        # Handle "only time" (like "10pm") by combining with today's date
        if re.fullmatch(
            r"(at\s*)?\d{1,2}(:\d{2})?\s*(am|pm)", matched_text.strip(), re.IGNORECASE
        ):
            manual_time = extract_time_manually(matched_text)
            if manual_time:
                parsed_dt = ist.localize(datetime.combine(now.date(), manual_time))

        return to_ist_iso(parsed_dt)

    # Step 2: If search_dates fails but there's a time manually
    manual_time = extract_time_manually(text)
    if manual_time:
        parsed_dt = ist.localize(datetime.combine(now.date(), manual_time))
        return to_ist_iso(parsed_dt)

    # Step 3: fallback to current time
    return to_ist_iso(now)


def extract_datetime_us(text: str, now=None) -> str:
    detroit = pytz.timezone("America/Detroit")
    now = now or datetime.now(detroit)

    def to_detroit_iso(dt: datetime) -> str:
        return dt.astimezone(detroit).replace(microsecond=0).isoformat()

    def extract_time_manually(text: str) -> time | None:
        match = re.search(r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b", text, re.IGNORECASE)
        if match:
            hour = int(match.group(1))
            minute = int(match.group(2) or 0)
            meridian = match.group(3).lower()
            if meridian == "pm" and hour != 12:
                hour += 12
            if meridian == "am" and hour == 12:
                hour = 0
            return time(hour, minute)
        return None

    # Try search_dates
    results = search_dates(
        text,
        settings={
            "PREFER_DATES_FROM": "future",
            "RELATIVE_BASE": now,
            "TIMEZONE": "America/Detroit",
            "TO_TIMEZONE": "America/Detroit",
            "RETURN_AS_TIMEZONE_AWARE": True,
        },
    )

    if results:
        # If it returns a full datetime, use it
        _, parsed_dt = results[0]
        return to_detroit_iso(parsed_dt)

    # Fallback: detect time manually
    manual_time = extract_time_manually(text)
    if manual_time:
        dt = datetime.combine(now.date(), manual_time)
        return to_detroit_iso(detroit.localize(dt))

    # Fallback to now
    return to_detroit_iso(now)


def get_future_dates_from_mode(base_date: datetime, mode: str):
    dates = []
    base_date = base_date.date()

    if mode == "today":
        dates = [base_date]

    elif mode == "week":
        weekday = base_date.weekday()  # Monday=0
        days_remaining = 6 - weekday  # till Saturday
        dates = [base_date + timedelta(days=i) for i in range(days_remaining + 1)]

    elif mode == "month":
        last_day = calendar.monthrange(base_date.year, base_date.month)[1]
        dates = [
            base_date + timedelta(days=i) for i in range((last_day - base_date.day) + 1)
        ]

    return dates
