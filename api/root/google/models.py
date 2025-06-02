from datetime import datetime, timedelta
import json
from flask import make_response, redirect, request, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
from root.db.dbHelper import DBHelper
from root.config import API_URL, WEB_URL
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from urllib.parse import quote

import requests

from root.auth.auth import auth_required

# CLIENT_ID = "884758455202-mfdifmnc9pjvgim28q6esstajucur1hj.apps.googleusercontent.com" # for production
CLIENT_ID = "9246231250-hfjuadbtoev4cbd8e912tdk8u1b6e28o.apps.googleusercontent.com"
# CLIENT_SECRET = "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" # for production
CLIENT_SECRET = "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"
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
            return {"error": "No connected Google accounts found."}, 404

        merged_events = []

        for credData in allCreds:
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
                        maxResults=10,
                        singleEvents=True,
                        orderBy="startTime",
                    )
                    .execute()
                )

                email = credData["email"]
                events = events_result.get("items", [])

                # Tag events with the email source
                for event in events:
                    event["source_email"] = email

                merged_events.extend(events)

            except Exception as e:
                print(f"Error fetching events for {credData['email']}: {e}")
                continue  # Skip this account and try others

        # Sort all events by start time
        merged_events.sort(key=lambda e: e.get("start", {}).get("dateTime", ""))

        return {
            "status": 1,
            "message": "Calendar events merged from all connected Google accounts.",
            "payload": {
                "events": merged_events,
                "connected_accounts": [c["email"] for c in allCreds],
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

        inserted_id = DBHelper.insert(
            "google_tokens",
            uid=uid,
            email=email,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=(datetime.utcnow() + timedelta(seconds=expires_in)).isoformat(),
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
