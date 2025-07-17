from datetime import date, timedelta, datetime
from email.message import EmailMessage
import json
import smtplib
from flask import request
from flask_restful import Resource

# from root.google.models import SCOPE
from root.db.dbHelper import DBHelper
from root.common import GoalStatus, Priority, Status
from root.utilis import uniqueId
from root.auth.auth import auth_required
from google.oauth2.credentials import Credentials
from root.config import (
    CLIENT_ID,
    CLIENT_SECRET,
    EMAIL_PASSWORD,
    EMAIL_SENDER,
    SCOPE,
    SMTP_PORT,
    SMTP_SERVER,
    uri,
)
from googleapiclient.discovery import build
from google.auth.exceptions import GoogleAuthError
from datetime import datetime
from root.utilis import extract_datetime
import requests

# Light colors for better account differentiation
light_colors = [
    "#FF6F61",
    "#42A5F5",
    "#66BB6A",
    "#FFA726",
    "#AB47BC",
    "#EC407A",
    "#9CCC65",
    "#26C6DA",
    "#FFD54F",
    "#5C6BC0",
]


class AddWeeklyGoals(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        id = uniqueId(digit=15, isNum=True)
        backup = data.get("backup", [])
        sync_to_google = data.get("sync_to_google", True)

        # Use provided date or compute current week's Saturday
        goal_date = data.get("date")
        if not goal_date:
            today = datetime.today()
            weekday = today.weekday()  # Monday = 0
            days_until_saturday = (5 - weekday) if weekday <= 5 else 0
            weekend_date = today + timedelta(days=days_until_saturday)
            goal_date = weekend_date.strftime("%Y-%m-%d")

        goal_time = data.get("time", datetime.now().strftime("%I:%M %p"))

        goal = {
            "id": id,
            "user_id": uid,
            "goal": data.get("goal", ""),
            "date": goal_date,
            "time": goal_time,
            "priority": Priority.LOW.value,
            "goal_status": GoalStatus.YET_TO_START.value,
            "status": Status.ACTIVE.value,
            "google_calendar_id": None,
            "synced_to_google": sync_to_google,
        }

        # Sync to Google Calendar if enabled and backup exists
        if sync_to_google:
            try:
                # Parse the date and time for Google Calendar
                start_dt = datetime.strptime(
                    f"{goal_date} {goal_time}", "%Y-%m-%d %I:%M %p"
                )
                google_event_id = create_calendar_event(
                    uid, data.get("goal", ""), start_dt
                )
                goal["google_calendar_id"] = google_event_id
                goal["synced_to_google"] = True
            except Exception as e:
                print(f"Failed to sync goal to Google Calendar: {e}")
                goal["synced_to_google"] = False

        # Always store in database
        DBHelper.insert("weekly_goals", return_column="id", **goal)

        return {
            "status": 1,
            "message": "Weekly Goal Added Successfully",
            "payload": goal,
        }


class UpdateWeeklyGoals(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        data = request.get_json(silent=True)
        goal_id = data.get("id")
        backup = data.get("backup", [])
        sync_to_google = data.get("sync_to_google", True)

        if not goal_id:
            return {"status": 0, "message": "Goal ID is required", "payload": {}}

        # Get existing goal to check if it was synced
        existing_goal = DBHelper.find_one(
            "weekly_goals",
            filters={"id": goal_id, "user_id": uid},
            select_fields=["google_calendar_id", "synced_to_google"],
        )

        updates = {
            "goal": data.get("goal", ""),
            "date": data.get("date", ""),
            "time": data.get("time", ""),
            "synced_to_google": sync_to_google,
        }

        try:
            start_dt = datetime.strptime(
                f"{data.get('date', '')} {data.get('time', '')}", "%Y-%m-%d %I:%M %p"
            )
        except ValueError:
            return {"status": 0, "message": "Invalid date/time format", "payload": {}}

        # Handle Google Calendar sync for updates
        if sync_to_google:
            try:
                if existing_goal and existing_goal.get("google_calendar_id"):
                    # Update existing Google Calendar event
                    update_calendar_event(
                        uid,
                        existing_goal["google_calendar_id"],
                        data.get("goal", ""),
                        start_dt,
                    )
                else:
                    # Create new Google Calendar event
                    google_event_id = create_calendar_event(
                        uid, data.get("goal", ""), start_dt
                    )
                    updates["google_calendar_id"] = google_event_id
            except Exception as e:
                print(f"Failed to sync goal update to Google Calendar: {e}")
                updates["synced_to_google"] = False

        DBHelper.update_one(
            table_name="weekly_goals",
            filters={"id": goal_id, "user_id": uid},
            updates=updates,
        )

        return {
            "status": 1,
            "message": "Weekly Goal Updated Successfully",
            "payload": updates,
        }


class AddEvents(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        id = inputData.get("id", None)
        unid = uniqueId(digit=15, isNum=True)
        backup = inputData.get("backup", [])
        sync_to_google = inputData.get("sync_to_google", True)

        title = inputData.get("title", "")
        date = inputData.get("date", "")
        time = inputData.get("time", "")

        event_data = {
            "title": title,
            "time": time,
            "date": date,
            "synced_to_google": sync_to_google,
            "google_calendar_id": None,
        }

        try:
            start_dt = datetime.strptime(f"{date} {time}", "%Y-%m-%d %I:%M %p")
        except ValueError:
            return {"status": 0, "message": "Invalid date/time format", "payload": {}}

        # Handle Google Calendar sync
        if sync_to_google:
            print(f"sync_to_google: {sync_to_google}")
            try:
                google_event_id = create_calendar_event(uid, title, start_dt)
                event_data["google_calendar_id"] = google_event_id
                event_data["synced_to_google"] = True
            except Exception as e:
                print(f"Failed to sync event to Google Calendar: {e}")
                event_data["synced_to_google"] = False

        if id:
            DBHelper.update_one(
                table_name="events",
                filters={"id": id, "user_id": uid},
                updates=event_data,
            )
            message = "Event Updated Successfully"
        else:
            event_data["user_id"] = uid
            event_data["id"] = unid
            event_data["is_active"] = 1
            DBHelper.insert("events", return_column="id", **event_data)
            message = "Event Added Successfully"

        return {"status": 1, "message": message, "payload": event_data}


class AddWeeklyTodos(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        id = uniqueId(digit=15, isNum=True)
        backup = data.get("backup", [])
        sync_to_google = data.get("sync_to_google", True)

        # Use provided date or compute current week's Saturday
        todo_date = data.get("date")
        if not todo_date:
            today = datetime.today()
            weekday = today.weekday()
            days_until_saturday = (5 - weekday) if weekday <= 5 else 0
            weekend_date = today + timedelta(days=days_until_saturday)
            todo_date = weekend_date.strftime("%Y-%m-%d")

        todo_time = data.get("time", datetime.now().strftime("%I:%M %p"))

        todo = {
            "id": id,
            "user_id": uid,
            "text": data.get("text", ""),
            "date": todo_date,
            "time": todo_time,
            "priority": data.get("priority", "medium"),
            "completed": False,
            "goal_id": data.get("goal_id", None),
            "google_calendar_id": None,
            "synced_to_google": sync_to_google,
        }

        # Sync to Google Calendar if enabled
        if sync_to_google:
            try:
                start_dt = datetime.strptime(
                    f"{todo_date} {todo_time}", "%Y-%m-%d %I:%M %p"
                )
                google_event_id = create_calendar_event(
                    uid, data.get("text", ""), start_dt
                )
                todo["google_calendar_id"] = google_event_id
                todo["synced_to_google"] = True
            except Exception as e:
                print(f"Failed to sync todo to Google Calendar: {e}")
                todo["synced_to_google"] = False

        # Always store in database
        DBHelper.insert("weekly_todos", return_column="id", **todo)

        return {
            "status": 1,
            "message": "Weekly todo Added Successfully",
            "payload": todo,
        }


class UpdateWeeklyTodos(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        data = request.get_json(silent=True)
        todo_id = data.get("id")
        backup = data.get("backup", [])
        sync_to_google = data.get("sync_to_google", True)

        if not todo_id:
            return {"status": 0, "message": "Todo ID is required", "payload": {}}

        # Get existing todo to check if it was synced
        existing_todo = DBHelper.find_one(
            "weekly_todos",
            filters={"id": todo_id, "user_id": uid},
            select_fields=["google_calendar_id", "synced_to_google"],
        )

        updates = {
            "text": data.get("text", ""),
            "date": data.get("date", ""),
            "time": data.get("time", ""),
            "priority": data.get("priority", "medium"),
            "goal_id": data.get("goal_id", None),
            "synced_to_google": sync_to_google,
        }

        try:
            start_dt = datetime.strptime(
                f"{data.get('date', '')} {data.get('time', '')}", "%Y-%m-%d %I:%M %p"
            )
        except ValueError:
            return {"status": 0, "message": "Invalid date/time format", "payload": {}}

        # Handle Google Calendar sync for updates
        if sync_to_google:
            try:
                if existing_todo and existing_todo.get("google_calendar_id"):
                    # Update existing Google Calendar event
                    update_calendar_event(
                        uid,
                        existing_todo["google_calendar_id"],
                        data.get("text", ""),
                        start_dt,
                    )
                else:
                    # Create new Google Calendar event
                    google_event_id = create_calendar_event(
                        uid, data.get("text", ""), start_dt
                    )
                    updates["google_calendar_id"] = google_event_id
            except Exception as e:
                print(f"Failed to sync todo update to Google Calendar: {e}")
                updates["synced_to_google"] = False

        DBHelper.update_one(
            table_name="weekly_todos",
            filters={"id": todo_id, "user_id": uid},
            updates=updates,
        )

        return {
            "status": 1,
            "message": "Weekly Todo Updated Successfully",
            "payload": updates,
        }


class GetWeeklyGoals(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        goals = DBHelper.find_all(
            "weekly_goals",
            {"user_id": uid},
            select_fields=[
                "id",
                "goal",
                "date",
                "time",
                "priority",
                "goal_status",
                "status",
                "google_calendar_id",
                "synced_to_google",
            ],
        )
        return {"status": 1, "payload": goals}


class GetWeeklyTodos(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        todos = DBHelper.find_all(
            "weekly_todos",
            {"user_id": uid},
            select_fields=[
                "id",
                "text",
                "date",
                "time",
                "completed",
                "priority",
                "goal_id",
                "google_calendar_id",
                "synced_to_google",
            ],
        )
        return {"status": 1, "payload": todos}


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
    return created_event.get("id")


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

    existing_event = (
        service.events().get(calendarId="primary", eventId=calendar_event_id).execute()
    )

    existing_event["summary"] = title
    existing_event["start"] = {
        "dateTime": start_dt.isoformat(),
        "timeZone": "Asia/Kolkata",
    }
    existing_event["end"] = {"dateTime": end_dt.isoformat(), "timeZone": "Asia/Kolkata"}
    existing_event["attendees"] = attendees or []

    updated_event = (
        service.events()
        .update(calendarId="primary", eventId=calendar_event_id, body=existing_event)
        .execute()
    )

    return updated_event.get("id")


# Enhanced GetPlanner class to properly handle all data types and filtering
class GetPlanner(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # Get filter parameters
        show_dockly = request.args.get("show_dockly", "true").lower() == "true"
        show_google = request.args.get("show_google", "true").lower() == "true"

        # Initialize response data
        all_events = []
        goals = []
        todos = []
        events = []

        # Get local database data if Dockly is enabled
        if show_dockly:
            # Get goals from database
            raw_goals = DBHelper.find_all(
                "weekly_goals",
                {"user_id": uid, "status": Status.ACTIVE.value},
                select_fields=[
                    "id",
                    "goal",
                    "date",
                    "time",
                    "priority",
                    "goal_status",
                    "status",
                    "google_calendar_id",
                    "synced_to_google",
                ],
            )
            goals = raw_goals or []

            # Get todos from database
            raw_todos = DBHelper.find_all(
                "weekly_todos",
                {"user_id": uid},
                select_fields=[
                    "id",
                    "text",
                    "date",
                    "time",
                    "completed",
                    "priority",
                    "goal_id",
                    "google_calendar_id",
                    "synced_to_google",
                ],
            )
            todos = raw_todos or []

            # Get events from database
            raw_events = DBHelper.find_all(
                "events",
                {"user_id": uid, "is_active": 1},
                select_fields=[
                    "id",
                    "title",
                    "date",
                    # "time",
                    "google_calendar_id",
                    "synced_to_google",
                ],
            )
            events = raw_events or []

            # Transform local data to unified event format
            for todo in todos:
                all_events.append(
                    {
                        "id": f"todo_{todo.get('id')}",
                        "summary": todo.get("text"),
                        "date": self._format_date(todo.get("date")),
                        "startTime": todo.get("time"),
                        "endTime": self._add_hour_to_time(todo.get("time")),
                        "description": f"Todo - Priority: {todo.get('priority', 'medium')}",
                        "person": "Dockly",
                        "color": "#10B981",
                        "source": "dockly",
                        "type": "todo",
                        "priority": todo.get("priority", "medium"),
                        "completed": todo.get("completed", False),
                        "synced_to_google": todo.get("synced_to_google", False),
                        "source_email": user.get("email", "dockly@user.com"),
                        "provider": "dockly",
                    }
                )

            for goal in goals:
                all_events.append(
                    {
                        "id": f"goal_{goal.get('id')}",
                        "summary": goal.get("goal"),
                        "date": self._format_date(goal.get("date")),
                        "startTime": goal.get("time"),
                        "endTime": self._add_hour_to_time(goal.get("time")),
                        "description": f"Goal - Status: {self._get_goal_status_text(goal.get('goal_status'))}",
                        "person": "Dockly",
                        "color": "#3B82F6",
                        "source": "dockly",
                        "type": "goal",
                        "priority": self._get_priority_text(goal.get("priority")),
                        "status": self._get_goal_status_text(goal.get("goal_status")),
                        "synced_to_google": goal.get("synced_to_google", False),
                        "source_email": user.get("email", "dockly@user.com"),
                        "provider": "dockly",
                    }
                )

            for event in events:
                all_events.append(
                    {
                        "id": f"event_{event.get('id')}",
                        "summary": event.get("title"),
                        "date": self._format_date(event.get("date")),
                        "startTime": event.get("time") or "12:00 PM",
                        "endTime": self._add_hour_to_time(event.get("time")),
                        "description": "Event",
                        "person": "Dockly",
                        "color": "#F59E0B",
                        "source": "dockly",
                        "type": "event",
                        "synced_to_google": event.get("synced_to_google", False),
                        "source_email": user.get("email", "dockly@user.com"),
                        "provider": "dockly",
                    }
                )

        # Add Google Calendar events if enabled
        if show_google:
            try:
                google_events = self._fetch_google_calendar_events(uid)
                synced_event_ids = set()

                # Collect all synced Google Calendar IDs from local data
                if show_dockly:
                    for item in todos + goals + events:
                        if item.get("google_calendar_id"):
                            synced_event_ids.add(item.get("google_calendar_id"))

                for event in google_events:
                    # Skip events that are already synced from our database
                    if event.get("id") not in synced_event_ids:
                        all_events.append(
                            {
                                "id": f"google_{event.get('id')}",
                                "summary": event.get("summary", "No Title"),
                                "date": self._extract_date_from_google_event(event),
                                "startTime": self._extract_time_from_google_event(
                                    event, "start"
                                ),
                                "endTime": self._extract_time_from_google_event(
                                    event, "end"
                                ),
                                "description": event.get("description", ""),
                                "person": event.get("creator", {})
                                .get("email", "Google User")
                                .split("@")[0],
                                "color": event.get("account_color", "#4285F4"),
                                "source": "google",
                                "type": "google_event",
                                "source_email": event.get("source_email"),
                                "provider": event.get("provider", "google"),
                            }
                        )
            except Exception as e:
                print(f"Error fetching Google Calendar events: {e}")

        return {
            "status": 1,
            "message": "Planner data fetched successfully",
            "payload": {
                "goals": goals,
                "todos": todos,
                "events": all_events,
                "filters": {
                    "show_dockly": show_dockly,
                    "show_google": show_google,
                },
            },
        }

    def _format_date(self, date_obj):
        """Helper method to format date objects"""
        if isinstance(date_obj, (datetime, date)):
            return date_obj.strftime("%Y-%m-%d")
        elif isinstance(date_obj, str):
            try:
                # Try to parse and reformat if it's a string
                parsed_date = datetime.strptime(date_obj, "%Y-%m-%d")
                return parsed_date.strftime("%Y-%m-%d")
            except:
                return date_obj
        return str(date_obj) if date_obj else ""

    def _add_hour_to_time(self, time_str):
        """Helper method to add an hour to time string"""
        if not time_str:
            return "N/A"
        try:
            time_obj = datetime.strptime(time_str, "%I:%M %p")
            new_time = time_obj + timedelta(hours=1)
            return new_time.strftime("%I:%M %p")
        except:
            return "N/A"

    def _get_goal_status_text(self, status_value):
        """Convert goal status enum to text"""
        status_map = {0: "Yet to Start", 1: "In Progress", 2: "Completed"}
        return status_map.get(status_value, "Yet to Start")

    def _get_priority_text(self, priority_value):
        """Convert priority enum to text"""
        priority_map = {0: "low", 1: "medium", 2: "high"}
        return priority_map.get(priority_value, "low")

    def _fetch_google_calendar_events(self, user_id):
        """Fetch events from Google Calendar"""
        user_cred = DBHelper.find_one(
            "connected_accounts",
            filters={"user_id": user_id, "is_active": Status.ACTIVE.value},
            select_fields=["access_token", "refresh_token", "email"],
        )

        if not user_cred:
            return []

        creds = Credentials(
            token=user_cred["access_token"],
            refresh_token=user_cred["refresh_token"],
            token_uri=uri,
            client_id=CLIENT_ID,
            client_secret=CLIENT_SECRET,
            scopes=SCOPE.split(),
        )

        service = build("calendar", "v3", credentials=creds)

        # Get events from the past week to future
        time_min = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"

        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=time_min,
                maxResults=100,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        events = events_result.get("items", [])

        # Add account info to events
        for event in events:
            event["source_email"] = user_cred["email"]
            event["account_color"] = "#4285F4"
            event["provider"] = "google"

        return events

    def _extract_date_from_google_event(self, event):
        """Extract date from Google Calendar event"""
        start = event.get("start", {})
        if "date" in start:
            return start["date"]
        elif "dateTime" in start:
            return start["dateTime"][:10]  # Extract date part
        return datetime.now().strftime("%Y-%m-%d")

    def _extract_time_from_google_event(self, event, time_type):
        """Extract time from Google Calendar event"""
        time_info = event.get(time_type, {})
        if "dateTime" in time_info:
            dt = datetime.fromisoformat(time_info["dateTime"].replace("Z", "+00:00"))
            return dt.strftime("%I:%M %p")
        return "12:00 PM"  # Default time for all-day events


# Enhanced GetCalendarEvents to include proper account filtering
class GetCalendarEvents(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        # Get filter parameters
        show_dockly = request.args.get("show_dockly", "true").lower() == "true"
        show_google = request.args.get("show_google", "true").lower() == "true"

        selectFields = [
            "access_token",
            "refresh_token",
            "email",
            "provider",
            "user_object",
        ]
        allCreds = DBHelper.find(
            "connected_accounts",
            filters={"user_id": uid, "is_active": Status.ACTIVE.value},
            select_fields=selectFields,
        )

        merged_events = []
        connected_accounts = []
        account_colors = {}
        usersObjects = []
        errors = []

        # Add Dockly as a virtual account if enabled
        if show_dockly:
            connected_accounts.append(
                {
                    "provider": "dockly",
                    "email": user.get("email", "dockly@user.com"),
                    "color": "#10B981",
                    "userName": user.get("user_name", "Dockly User"),
                    "displayName": user.get("user_name", "Dockly User"),
                }
            )
            account_colors["dockly:dockly@user.com"] = "#10B981"

        # Process Google Calendar accounts only if show_google is True
        if show_google and allCreds:
            for i, credData in enumerate(allCreds):
                provider = credData.get("provider", "google").lower()
                access_token = credData.get("access_token")
                refresh_token = credData.get("refresh_token")
                email = credData.get("email")
                color = light_colors[i % len(light_colors)]
                userObject = credData.get("user_object")

                try:
                    userObjectData = json.loads(userObject) if userObject else {}
                except:
                    userObjectData = {}

                usersObjects.append(userObjectData)

                try:
                    events = []
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

                        # Get events from the past week to future
                        time_min = (
                            datetime.utcnow() - timedelta(days=7)
                        ).isoformat() + "Z"

                        events_result = (
                            service.events()
                            .list(
                                calendarId="primary",
                                timeMin=time_min,
                                maxResults=100,
                                singleEvents=True,
                                orderBy="startTime",
                            )
                            .execute()
                        )

                        events = events_result.get("items", [])

                    # Mark event source
                    for ev in events:
                        ev["source_email"] = email
                        ev["provider"] = provider
                        ev["account_color"] = color

                    merged_events.extend(events)

                    # Add to connected accounts
                    connected_accounts.append(
                        {
                            "provider": provider,
                            "email": email,
                            "color": color,
                            "userName": userObjectData.get("name", email.split("@")[0]),
                            "displayName": userObjectData.get(
                                "name", email.split("@")[0]
                            ),
                        }
                    )

                    account_colors[f"{provider}:{email}"] = color

                except Exception as e:
                    print(f"Error fetching events for {email}: {str(e)}")
                    errors.append(
                        {"email": email, "provider": provider, "error": str(e)}
                    )

        # Sort merged events
        merged_events.sort(key=lambda e: e.get("start", {}).get("dateTime", ""))

        return {
            "status": 1,
            "message": "Calendar events fetched successfully",
            "payload": {
                "events": merged_events,
                "connected_accounts": connected_accounts,
                "account_colors": account_colors,
                "usersObjects": usersObjects,
                "errors": errors,
                "filters": {
                    "show_dockly": show_dockly,
                    "show_google": show_google,
                },
            },
        }


# Smart Notes Classes
class AddSmartNote(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        full_text = inputData.get("note", "")
        members = inputData.get("members", "")
        uid = inputData.get("userId", "")
        frontend_timing = inputData.get("timing")
        source = inputData.get("source", "planner")
        email = inputData.get("email", "")

        if frontend_timing:
            try:
                parsed_datetime = datetime.fromisoformat(frontend_timing)
            except Exception as e:
                print("Invalid frontend timing:", e)
                parsed_datetime = extract_datetime(full_text)
        else:
            parsed_datetime = extract_datetime(full_text)

        if uid:
            DBHelper.insert(
                "smartnotes",
                user_id=uid,
                note=full_text,
                timing=parsed_datetime,
                members=members,
                source=source,
            )
            try:
                create_calendar_event(
                    user_id=uid,
                    title=full_text,
                    start_dt=parsed_datetime,
                )
            except Exception as e:
                print("Failed to create calendar event:", e)
            if email:
                try:
                    send_mention_email(
                        email=email,
                        full_text=full_text,
                        mentioned_by=user.get("user_name") or "a Dockly user",
                    )
                except Exception as e:
                    print("Failed to send mention email:", e)

        return {
            "status": 1,
            "message": "Smart Note Added Successfully",
            "payload": {
                "parsedTiming": parsed_datetime.isoformat(),
            },
        }


def send_mention_email(email, full_text, mentioned_by):
    try:
        msg = EmailMessage()
        msg["Subject"] = "You were mentioned on Dockly"
        msg["From"] = EMAIL_SENDER
        msg["To"] = email

        message_body = f"""
Hi there,

You were mentioned by *{mentioned_by}* in a Smart Note.

Note Content:
"{full_text}"

Kindly check Dockly for more details.

Best regards,  
Dockly Team
        """.strip()

        msg.set_content(message_body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        return {"status": 1, "email": email}
    except Exception as e:
        return {"status": 0, "email": email, "error": str(e)}


class GetSmartNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        source = request.args.get("source")
        filters = {"user_id": uid}
        if source:
            filters["source"] = source

        notes = DBHelper.find_all(
            table_name="smartnotes",
            filters=filters,
            select_fields=["id", "note", "timing", "members", "created_at"],
        )

        user_notes = []
        for note in notes:
            user_notes.append(
                {
                    "id": note["id"],
                    "note": note["note"],
                    "timing": note["timing"].isoformat() if note["timing"] else None,
                    "members": note["members"],
                    "created_at": (
                        note["created_at"].isoformat() if note["created_at"] else None
                    ),
                }
            )

        return {
            "status": 1,
            "message": "Smart Notes fetched successfully",
            "payload": {"notes": user_notes},
        }


class FrequentNotes(Resource):
    def get(self, uid):
        source = request.args.get("source")
        filters = {"user_id": uid}
        if source:
            filters["source"] = source

        notes = DBHelper.find_all(
            table_name="smartnotes", filters=filters, select_fields=["note"]
        )

        note_counts = {}
        for note in notes:
            text = note["note"].strip()
            note_counts[text] = note_counts.get(text, 0) + 1

        if not note_counts:
            return [], 200

        sorted_notes = sorted(note_counts.items(), key=lambda x: x[1], reverse=True)
        top_notes = [note[0] for note in sorted_notes[:3]]

        if len(top_notes) < 3:
            all_notes = list(note_counts.keys())
            for n in all_notes:
                if n not in top_notes:
                    top_notes.append(n)
                    if len(top_notes) == 3:
                        break

        return top_notes, 200


class AddWeeklyFocus(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        id = uniqueId(digit=15, isNum=True)

        focus = {
            "id": id,
            "user_id": uid,
            "focus": data.get("focus", ""),
        }
        DBHelper.insert("weekly-focus", return_column="id", **focus)
        return {
            "status": 1,
            "message": "Weekly focus Added Successfully",
            "payload": focus,
        }


class GetWeeklyFocus(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        focus = DBHelper.find_all(
            "weekly-focus",
            {"user_id": uid},
            select_fields=["id", "focus"],
        )
        return {"status": 1, "payload": focus}


class AddPlannerNotes(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)

        if not data.get("title"):
            return {"status": 0, "message": "Title is required", "payload": {}}

        note = {
            "id": uniqueId(digit=15, isNum=True),
            "user_id": uid,
            "title": data.get("title", ""),
            "description": data.get("description", ""),
            "date": data.get("date") or date.today().isoformat(),
            "status": "Yet to Start",
        }

        DBHelper.insert("notes", return_column="id", **note)

        return {
            "status": 1,
            "message": "Note added successfully",
            "payload": note,
        }


class GetPlannerNotes(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        notes = DBHelper.find_all(
            "notes",
            {"user_id": uid},
            select_fields=[
                "id",
                "title",
                "description",
                "date",
                "status",
                "created_at",
                "updated_at",
            ],
        )

        # Convert date objects to strings
        for note in notes:
            if isinstance(note.get("date"), (datetime, date)):
                note["date"] = note["date"].isoformat()
            if isinstance(note.get("created_at"), datetime):
                note["created_at"] = note["created_at"].isoformat()
            if isinstance(note.get("updated_at"), datetime):
                note["updated_at"] = note["updated_at"].isoformat()

        return {"status": 1, "payload": notes}


class UpdatePlannerNotes(Resource):
    @auth_required(isOptional=True)
    def put(self, uid, user):
        data = request.get_json(silent=True)
        note_id = data.get("id")

        if not note_id:
            return {"status": 0, "message": "Note ID is required", "payload": {}}

        update_data = {}
        for field in ["title", "description", "date", "status"]:
            if data.get(field) is not None:
                update_data[field] = data.get(field)

        if not update_data:
            return {"status": 0, "message": "No fields to update", "payload": {}}

        success = DBHelper.update_one(
            "notes", {"id": note_id, "user_id": uid}, update_data
        )

        if success:
            return {"status": 1, "message": "Note updated successfully"}
        else:
            return {"status": 0, "message": "Note not found or update failed"}


class DeletePlannerNotes(Resource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        note_id = request.args.get("id")

        if not note_id:
            return {"status": 0, "message": "Note ID is required", "payload": {}}

        try:
            DBHelper.delete_all("notes", {"id": note_id, "user_id": uid})
            return {"status": 1, "message": "Note deleted successfully"}
        except Exception as e:
            return {"status": 0, "message": "Failed to delete note", "error": str(e)}
