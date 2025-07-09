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
from root.config import API_URL, CLIENT_ID, CLIENT_SECRET, WEB_URL, uri
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from urllib.parse import quote
import dateparser
from dateparser.search import search_dates
from pytz import timezone, utc


# MICROSOFT_CLIENT_ID = "98fa92ef-f5ba-4765-bd81-9ce209dda01b"
# MICROSOFT_CLIENT_SECRET = "Kar8Q~CRDjWSLixLfJyi3gQglRhkKXcd~JIftcds"

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
        session["user_id"] = uid
        stateData = json.dumps({"user_id": uid, "username": username})
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


class GetCalendarEvents(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        selectFields = [
            "access_token",
            "refresh_token",
            "email",
            "provider",
            "user_object",
        ]
        allCreds = DBHelper.find(
            "connected_accounts",  # Consider renaming to "oauth_tokens"
            filters={"user_id": uid},
            select_fields=selectFields,
        )

        if not allCreds:
            return {
                "status": 0,
                "message": "No connected accounts found.",
                "payload": {},
            }

        merged_events = []
        connected_accounts = []
        account_colors = {}
        usersObjects = []

        for i, credData in enumerate(allCreds):
            provider = credData.get("provider", "google").lower()
            access_token = credData.get("access_token")
            refresh_token = credData.get("refresh_token")
            email = credData.get("email")
            color = light_colors[i % len(light_colors)]
            userObject = credData.get("user_object")
            usersObjects.append(userObject)

            try:
                if provider == "google":
                    creds = Credentials(
                        token=access_token,
                        refresh_token=refresh_token,
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
                            maxResults=40,
                            singleEvents=True,
                            orderBy="startTime",
                        )
                        .execute()
                    )

                    events = events_result.get("items", [])

                elif provider == "microsoft":
                    if "." not in access_token:
                        access_token = refresh_microsoft_token(refresh_token)
                        if not access_token:
                            raise Exception("Unable to refresh Microsoft token.")
                        DBHelper.update_one(
                            table_name="connected_accounts",  # Rename to `oauth_tokens` ideally
                            filters={
                                "user_id": uid,
                                "email": email,
                                "provider": "microsoft",
                            },
                            updates={"access_token": access_token},
                        )

                    headers = {
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json",
                    }

                    start_time = datetime.utcnow().isoformat() + "Z"
                    end_time = (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z"

                    response = requests.get(
                        "https://graph.microsoft.com/v1.0/me/calendar/events",
                        headers=headers,
                        params={
                            "$select": "id,subject,start,end,location,isAllDay",
                            "$orderby": "start/dateTime",
                            "$filter": f"start/dateTime ge '{start_time}' and end/dateTime le '{end_time}'",
                        },
                    )

                    if response.status_code != 200:
                        raise Exception(f"Microsoft API error: {response.text}")

                    raw_events = response.json().get("value", [])
                    events = [
                        {
                            "id": ev["id"],
                            "summary": ev["subject"],
                            "start": ev["start"],
                            "end": ev["end"],
                            "location": ev.get("location", {}).get("displayName", ""),
                            "source_email": email,
                            "account_color": color,
                        }
                        for ev in raw_events
                    ]

                else:
                    continue  # Unknown provider

                # Use a compound key to handle same email across providers
                account_key = f"{provider}:{email}"

                connected_accounts.append(
                    {
                        "provider": provider,
                        "email": email,
                        "color": color,
                        "userName": user.get("user_name", ""),
                    }
                )

                account_colors[account_key] = color

                # Tag each event with source info
                for ev in events:
                    ev["source_email"] = email
                    ev["provider"] = provider
                    ev["account_color"] = color

                merged_events.extend(events)

            except Exception as e:
                print(f"Error fetching events for {email}: {e}")
                continue

        merged_events.sort(key=lambda e: e.get("start", {}).get("dateTime", ""))
        # merged_events.append({"user_name": user.get("user_name", "")})
        return {
            "status": 1,
            "message": "Merged calendar events from all connected accounts.",
            "payload": {
                "events": merged_events,
                "connected_accounts": connected_accounts,
                # "connected_accounts": connected_accounts,
                # "account_colors": account_colors,
                # "usersObjects": usersObjects,
            },
        }


users = {}
tokens = {}


def refresh_microsoft_token(refresh_token):
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

    data = {
        # "client_id": MICROSOFT_CLIENT_ID,
        # "client_secret": MICROSOFT_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "scope": "offline_access Calendars.Read",
    }

    response = requests.post(token_url, data=data)
    if response.status_code == 200:
        token_data = response.json()
        return token_data["access_token"]
    else:
        print("Error refreshing Microsoft token:", response.text)
        return None


class GoogleCallback(Resource):
    def get(self):
        code = request.args.get("code")
        state = request.args.get("state")

        if not code or not state:
            return {"error": "Missing code"}, 400

        if state:
            stateData = json.loads(state)
            user_id = stateData.get("user_id")
            if not user_id:
                return
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
        userId = session.get("user_id") or email  # fallback if uid not in session
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
            "connected_accounts",
            filters={
                "user_id": user_id,
                "email": email,
                "provider": "google",
            },
            select_fields=["email"],
        )

        if not existingEmail:
            inserted_id = DBHelper.insert(
                "connected_accounts",
                user_id=user_id,
                email=email,
                access_token=access_token,
                provider="google",
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


# class AddGoogleCalendarEvent(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         inputData = request.get_json(silent=True)
#         matched_users = inputData.get("matchedUsers", [])
#         attendees = [
#             {"email": user["email"]} for user in matched_users if "email" in user
#         ]
#         eventText = inputData.get("event", "")
#         if not eventText:
#             return {"status": 0, "message": "Event text is required.", "payload": {}}

#         cleaned_text = re.sub(r"@\w+", "", eventText).strip()
#         cleaned_text = re.sub(
#             r"^(event\s+on|remind\s+me\s+to|schedule\s+for|set\s+reminder\s+for)\s+",
#             "",
#             cleaned_text,
#             flags=re.IGNORECASE,
#         )

#         # parsed_time = dateparser.parse(
#         #     cleaned_text,
#         #     settings={
#         #         "PREFER_DATES_FROM": "future",
#         #         "TIMEZONE": "UTC",
#         #         "RETURN_AS_TIMEZONE_AWARE": True,
#         #     },
#         # )
#         # parsed_time = extract_datetime(cleaned_text)
#         parsed_time = extract_datetime_us(cleaned_text)
#         if not parsed_time:
#             return {
#                 "status": 0,
#                 "message": "Could not detect time in the event text.",
#                 "payload": {},
#             }

#         user_cred = DBHelper.find_one(
#             "google_tokens",
#             filters={"uid": uid},
#             select_fields=["access_token", "refresh_token", "email"],
#         )

#         if not user_cred:
#             return {
#                 "status": 0,
#                 "message": "No connected Google account found.",
#                 "payload": {},
#             }

#         creds = Credentials(
#             token=user_cred["access_token"],
#             refresh_token=user_cred["refresh_token"],
#             token_uri=uri,
#             client_id=CLIENT_ID,
#             client_secret=CLIENT_SECRET,
#             scopes=SCOPE.split(),
#         )

#         service = build("calendar", "v3", credentials=creds)

#         event = {
#             "summary": f"Event: {eventText}",
#             "start": {"dateTime": parsed_time, "timeZone": "UTC"},
#             "end": {
#                 "dateTime": (parsed_time),
#                 "timeZone": "UTC",
#             },
#             "attendees": attendees,
#             "guestsCanModify": True,
#             "guestsCanInviteOthers": True,
#             "guestsCanSeeOtherGuests": True,
#         }

#         created_event = (
#             service.events().insert(calendarId="primary", body=event).execute()
#         )

#         return {
#             "status": 1,
#             "message": "Google Calendar event successfully added.",
#             "payload": {"event_link": created_event.get("htmlLink")},
#         }


# class AddNotes(Resource):
#     @auth_required(isOptional=True)
#     def post(self, uid, user):
#         inputData = request.get_json(silent=True)

#         note_text = inputData.get("note", "").strip()
#         mode = inputData.get("mode", "today")  # default to 'today'

#         if not note_text:
#             return {"status": 0, "message": "Note text is required.", "payload": {}}

#         # parsed_time_str = extract_datetime(note_text)
#         parsed_time_str = extract_datetime_us(note_text)

#         if not parsed_time_str:
#             return {
#                 "status": 0,
#                 "message": "No time detected in the note text.",
#                 "payload": {},
#             }

#         parsed_time = datetime.fromisoformat(parsed_time_str)
#         ist = pytz.timezone("Asia/Kolkata")
#         parsed_time = parsed_time.astimezone(ist)

#         note_dates = get_future_dates_from_mode(parsed_time, mode)
#         nid = uniqueId(digit=5, isNum=True)
#         inserted_notes = []
#         for note_date in note_dates:
#             full_dt = ist.localize(datetime.combine(note_date, parsed_time.time()))
#             insert_data = {
#                 "uid": uid,
#                 "note": note_text,
#                 "note_time": full_dt.isoformat(),
#                 "status": 1,
#                 "nid": nid,
#             }
#             DBHelper.insert("notes", **insert_data)
#             inserted_notes.append(insert_data)

#         return {
#             "status": 1,
#             "message": f"{len(inserted_notes)} note(s) added successfully.",
#             "payload": inserted_notes,
#         }


### FOR US
class AddNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)

        note_text = inputData.get("note", "").strip()
        mode = inputData.get("mode", "today")  # default to 'today'

        if not note_text:
            return {"status": 0, "message": "Note text is required.", "payload": {}}

        # Parse with US timezone
        parsed_time_str = extract_datetime_us(note_text)

        if not parsed_time_str:
            return {
                "status": 0,
                "message": "No time detected in the note text.",
                "payload": {},
            }

        parsed_time = datetime.fromisoformat(parsed_time_str)

        # Use Detroit timezone
        detroit_tz = pytz.timezone("America/Detroit")
        parsed_time = parsed_time.astimezone(detroit_tz)

        note_dates = get_future_dates_from_mode(parsed_time, mode)
        nid = uniqueId(digit=5, isNum=True)
        inserted_notes = []

        for note_date in note_dates:
            full_dt = detroit_tz.localize(
                datetime.combine(note_date, parsed_time.time())
            )
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


class AddEvent(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)

        title = inputData.get("title", "").strip()
        is_all_day = inputData.get("is_all_day", False)

        if is_all_day:
            start_date = inputData.get("start_date", "").strip()
            end_date = inputData.get("end_date", "").strip()

            if not (title and start_date and end_date):
                return {
                    "status": 0,
                    "message": "Required fields missing for all-day event",
                    "payload": {},
                }

            insert_data = {
                "id": uniqueId(digit=6),
                "user_id": uid,
                "title": title,
                "start_time": "12:00 AM",
                "end_time": "11:59 PM",
                "date": start_date,
                "end_date": end_date,
                "location": inputData.get("location", "").strip(),
                "description": inputData.get("description", "").strip(),
                "is_active": 1,
            }

            # Google event start and end as "date" for all-day
            google_event = {
                "summary": title,
                "start": {"date": start_date, "timeZone": "America/Detroit"},
                "end": {"date": end_date, "timeZone": "America/Detroit"},
            }

        else:
            date = inputData.get("date", "").strip()
            start_time = inputData.get("start_time", "").strip()
            end_time = inputData.get("end_time", "").strip()

            if not (title and date and start_time and end_time):
                return {
                    "status": 0,
                    "message": "Required fields missing for timed event",
                    "payload": {},
                }

            insert_data = {
                "id": uniqueId(digit=6),
                "user_id": uid,
                "title": title,
                "start_time": start_time,
                "end_time": end_time,
                "date": date,
                "end_date": date,
                "location": inputData.get("location", "").strip(),
                "description": inputData.get("description", "").strip(),
                "is_active": 1,
            }

            # Format start and end datetime in RFC3339
            start_dt = datetime.strptime(f"{date} {start_time}", "%Y-%m-%d %I:%M %p")
            end_dt = datetime.strptime(f"{date} {end_time}", "%Y-%m-%d %I:%M %p")
            tz = pytz.timezone("America/Detroit")

            google_event = {
                "summary": title,
                "start": {
                    "dateTime": tz.localize(start_dt).isoformat(),
                    "timeZone": "America/Detroit",
                },
                "end": {
                    "dateTime": tz.localize(end_dt).isoformat(),
                    "timeZone": "America/Detroit",
                },
            }

        # Save to your own DB
        DBHelper.insert("events", **insert_data)

        # Try adding to Google Calendar
        try:
            user_cred = DBHelper.find_one(
                "connected_accounts",
                filters={"uid": uid},
                select_fields=["access_token", "refresh_token", "email"],
            )

            if user_cred:
                creds = Credentials(
                    token=user_cred["access_token"],
                    refresh_token=user_cred["refresh_token"],
                    token_uri=uri,
                    client_id=CLIENT_ID,
                    client_secret=CLIENT_SECRET,
                    scopes=SCOPE.split(),
                )

                service = build("calendar", "v3", credentials=creds)

                # Optional extras
                google_event.update(
                    {
                        "description": insert_data.get("description", ""),
                        "location": insert_data.get("location", ""),
                        "guestsCanModify": True,
                        "guestsCanInviteOthers": True,
                        "guestsCanSeeOtherGuests": True,
                    }
                )

                created_event = (
                    service.events()
                    .insert(calendarId="primary", body=google_event)
                    .execute()
                )

                insert_data["google_event_id"] = created_event.get("id")

        except Exception as e:
            print("Google Calendar Error:", str(e))  # Optionally log it

        return {
            "status": 1,
            "message": "Event added successfully.",
            "payload": insert_data,
        }


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

        # Clean the text (remove @mentions and prompt words)
        cleaned_text = re.sub(r"@\w+", "", eventText).strip()
        cleaned_text = re.sub(
            r"^(event\s+on|remind\s+me\s+to|schedule\s+for|set\s+reminder\s+for)\s+",
            "",
            cleaned_text,
            flags=re.IGNORECASE,
        )

        # Extract datetime in US timezone (America/Detroit)
        parsed_time_str = extract_datetime_us(cleaned_text)
        if not parsed_time_str:
            return {
                "status": 0,
                "message": "Could not detect time in the event text.",
                "payload": {},
            }

        # Convert to datetime object (includes Detroit timezone)
        parsed_dt = datetime.fromisoformat(parsed_time_str)
        end_dt = parsed_dt + timedelta(hours=1)  # Default 1-hour duration

        # Fetch user Google credentials from DB
        user_cred = DBHelper.find_one(
            "connected_accounts",
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

        # Create the event with Detroit time zone
        event = {
            "summary": f"Event: {eventText}",
            "start": {
                "dateTime": parsed_dt.isoformat(),
                "timeZone": "America/Detroit",
            },
            "end": {
                "dateTime": end_dt.isoformat(),
                "timeZone": "America/Detroit",
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
        # selectFields = ["note", "note_time", "status", "nid"]
        # userNotes = DBHelper.find(
        #     "notes", filters={"uid": uid, "status": 1}, select_fields=selectFields
        # )

        # for note in userNotes:
        #     notes.append(
        #         {
        #             "note": note["note"],
        #             "note_time": note[
        #                 "note_time"
        #             ].isoformat(),  # or .strftime('%Y-%m-%dT%H:%M:%S%z') if timezone is present
        #             "status": note["status"],
        #             "nid": note["nid"],
        #         }
        #     )

        return {"status": 1, "message": "Notes fetched", "payload": {"notes": notes}}


def extract_datetime(text: str, now: datetime | None = None) -> datetime:

    ist = pytz.timezone("Asia/Kolkata")
    now = now.astimezone(ist) if now else datetime.now(ist)

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

        # 12‑hour AM/PM handling
        meridian = (
            time_match.group(3).lower()
            if len(time_match.groups()) >= 3 and time_match.group(3)
            else None
        )
        if meridian == "pm" and explicit_hour != 12:
            explicit_hour += 12
        if meridian == "am" and explicit_hour == 12:
            explicit_hour = 0

    # ── Custom date patterns (last pattern = bare “11th”) ────────────────
    custom_formats = [
        r"\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b",  # 24.07.25 or 11/7/25 → d/m/y
        r"\b\d{1,2}(st|nd|rd|th)?\s+\w+\b",  # 15th August
        r"\bon\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b(this|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b\d{1,2}(st|nd|rd|th)\b",  # bare ordinal day (11th)
    ]

    for pattern in custom_formats:
        match = re.search(pattern, cleaned_text, re.I)
        if not match:
            continue

        date_part = match.group(0).strip()

        # ── A) Numeric d/m/y like “11.7.25” or “11/7/2025” ────────────────
        if re.fullmatch(r"\d{1,2}[./-]\d{1,2}[./-]\d{2,4}", date_part):
            # Split on whichever delimiter is present (., /, or -)
            day_str, month_str, year_str = re.split(r"[./-]", date_part)
            day = int(day_str)
            month = int(month_str)
            year = int(year_str)

            # Expand 2‑digit years: 25 → 2025, 99 → 1999
            if year < 100:
                year += 2000 if year < 70 else 1900

            hour = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
            minute = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE

            try:
                candidate = ist.localize(datetime(year, month, day, hour, minute))
            except ValueError:
                # e.g. 31/02 → let dateparser handle improbable cases
                pass
            else:
                return candidate

        # ── B) Bare ordinal day like “11th” ───────────────────────────────
        if re.fullmatch(r"\d{1,2}(st|nd|rd|th)", date_part, re.I):
            day = int(re.sub(r"(st|nd|rd|th)", "", date_part, flags=re.I))
            hour = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
            minute = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE

            year, month = now.year, now.month
            try:
                candidate = ist.localize(datetime(year, month, day, hour, minute))
            except ValueError:
                # “31st” in a 30‑day month → push to next month
                month += 1
                if month == 13:
                    month, year = 1, year + 1
                candidate = ist.localize(datetime(year, month, day, hour, minute))

            # If date has already passed this month, roll to next month
            if candidate < now:
                month += 1
                if month == 13:
                    month, year = 1, year + 1
                candidate = ist.localize(datetime(year, month, day, hour, minute))

            return candidate

        # ── C) Any other recognised date string ──────────────────────────
        # Compose full phrase: <date_part> <hh:mm>
        hh = explicit_hour if explicit_hour is not None else DEFAULT_HOUR
        mm = explicit_minute if explicit_minute is not None else DEFAULT_MINUTE
        full_phrase = f"{date_part} {hh}:{mm:02d}"

        parsed = search_dates(
            full_phrase,
            settings={
                "PREFER_DATES_FROM": "future",
                "RELATIVE_BASE": now,
                "TIMEZONE": "Asia/Kolkata",
                "TO_TIMEZONE": "Asia/Kolkata",
                "RETURN_AS_TIMEZONE_AWARE": True,
                "DATE_ORDER": "DMY",  # ← ensures d/m/y
            },
        )
        if parsed:
            return parsed[0][1].astimezone(ist)

    # ── D) No explicit date but we *do* have an explicit time ──────────────
    if explicit_hour is not None:
        combined = ist.localize(
            datetime.combine(now.date(), time(explicit_hour, explicit_minute))
        )
        if combined < now:
            combined += timedelta(days=1)
        return combined

    # ── E) Fallback → ask dateparser to figure things out from whole text ──
    results = search_dates(
        cleaned_text,
        settings={
            "PREFER_DATES_FROM": "future",
            "RELATIVE_BASE": now,
            "TIMEZONE": "Asia/Kolkata",
            "TO_TIMEZONE": "Asia/Kolkata",
            "RETURN_AS_TIMEZONE_AWARE": True,
            "DATE_ORDER": "DMY",  # ← ensures d/m/y everywhere
        },
    )

    if results:
        dt = results[0][1].astimezone(ist)
        # If the parsed result had no explicit time, overwrite with 10 a.m.
        if dt.hour == 0 and dt.minute == 0 and explicit_hour is None:
            dt = dt.replace(hour=DEFAULT_HOUR, minute=DEFAULT_MINUTE)
        if dt < now:
            dt += timedelta(days=1)
        return dt

    # ── F) Absolute last resort → return current time (should be rare) ────
    return now


def extract_datetime_us(text: str, now=None) -> str:
    detroit_tz = pytz.timezone("America/Detroit")
    now = now or datetime.now(detroit_tz)

    def to_us_iso(dt: datetime) -> str:
        return dt.astimezone(detroit_tz).replace(microsecond=0).isoformat()

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
            "TIMEZONE": "America/Detroit",
            "TO_TIMEZONE": "America/Detroit",
            "RETURN_AS_TIMEZONE_AWARE": True,
        },
    )

    if results:
        results = sorted(results, key=lambda x: len(x[0]), reverse=True)
        matched_text, parsed_dt = results[0]
        parsed_dt = parsed_dt.astimezone(detroit_tz)

        # Handle "only time" (like "10pm") by combining with today's date
        if re.fullmatch(
            r"(at\s*)?\d{1,2}(:\d{2})?\s*(am|pm)", matched_text.strip(), re.IGNORECASE
        ):
            manual_time = extract_time_manually(matched_text)
            if manual_time:
                parsed_dt = detroit_tz.localize(
                    datetime.combine(now.date(), manual_time)
                )

        return to_us_iso(parsed_dt)

    # Step 2: If search_dates fails but there's a time manually
    manual_time = extract_time_manually(text)
    if manual_time:
        parsed_dt = detroit_tz.localize(datetime.combine(now.date(), manual_time))
        return to_us_iso(parsed_dt)

    # Step 3: fallback to current time
    return to_us_iso(now)


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
