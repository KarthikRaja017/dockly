from flask import request, make_response, redirect, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
import requests
import json
from datetime import datetime, timedelta
from urllib.parse import quote

from root.common import Status
from root.config import (
    DROPBOX_CLIENT_ID,
    DROPBOX_CLIENT_SECRET,
    DROPBOX_REDIRECT_URI,
    WEB_URL,
)
from root.db.dbHelper import DBHelper


class AddDropbox(Resource):
    """
    Initiate Dropbox OAuth flow
    """

    def get(self):
        username = request.args.get("username")
        uid = request.args.get("userId")

        if not username or not uid:
            return {"error": "Missing username or userId"}, 400

        # Store user data in session
        session["username"] = username
        session["user_id"] = uid

        # Create state data for security
        state_data = json.dumps({"user_id": uid, "username": username})
        encoded_state = quote(state_data)

        # Dropbox OAuth URL
        auth_url = (
            "https://www.dropbox.com/oauth2/authorize"
            f"?response_type=code"
            f"&client_id={DROPBOX_CLIENT_ID}"
            f"&redirect_uri={DROPBOX_REDIRECT_URI}"
            f"&state={encoded_state}"
            f"&token_access_type=offline"  # For refresh token
            f"&force_reapprove=false"
        )

        return make_response(redirect(auth_url))


class DropboxCallback(Resource):
    """
    Handle Dropbox OAuth callback
    """

    def get(self):
        code = request.args.get("code")
        state = request.args.get("state")
        error = request.args.get("error")

        # Handle OAuth errors
        if error:
            return {"error": f"Dropbox OAuth error: {error}"}, 400

        if not code or not state:
            return {"error": "Missing authorization code or state"}, 400

        # Validate and extract state data
        try:
            state_data = json.loads(state)
            user_id = state_data.get("user_id")
            username = state_data.get("username")

            if not user_id:
                return {"error": "Invalid state data"}, 400

        except json.JSONDecodeError:
            return {"error": "Invalid state format"}, 400

        # Step 1: Exchange authorization code for access token
        token_url = "https://api.dropboxapi.com/oauth2/token"
        token_data = {
            "code": code,
            "grant_type": "authorization_code",
            "client_id": DROPBOX_CLIENT_ID,
            "client_secret": DROPBOX_CLIENT_SECRET,
            "redirect_uri": DROPBOX_REDIRECT_URI,
        }

        token_response = requests.post(token_url, data=token_data)
        print(f"token_response: {token_response}")

        if token_response.status_code != 200:
            return {"error": "Token exchange failed"}, 400

        token_json = token_response.json()
        access_token = token_json.get("access_token")
        print(f"access_token: {access_token}")
        refresh_token = token_json.get("refresh_token")
        expires_in = token_json.get(
            "expires_in", 14400
        )  # Dropbox tokens expire in 4 hours by default

        if not access_token:
            return {"error": "No access token received"}, 400

        # Step 2: Get user account info from Dropbox
        user_info_response = requests.post(
            "https://api.dropboxapi.com/2/users/get_current_account",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            data=json.dumps(None),  # sends actual JSON null
        )

        if user_info_response.status_code != 200:
            print(
                "Failed to fetch user info:",
                user_info_response.status_code,
                user_info_response.text,
            )
            return {
                "error": "Failed to fetch user info",
                "details": user_info_response.text,
            }, 400

        user_info = user_info_response.json()
        email = user_info.get("email")

        if not email:
            return {"error": "Email not found in Dropbox account"}, 400

        # Step 3: Get additional user info (space usage, etc.)
        space_usage_response = requests.post(
            "https://api.dropboxapi.com/2/users/get_space_usage",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
        )

        space_info = {}
        if space_usage_response.status_code == 200:
            space_info = space_usage_response.json()

        # Step 4: Create user object
        user = {
            "id": user_id,
            "email": email,
            "name": user_info.get("name", {}).get("display_name", email.split("@")[0]),
            "account_id": user_info.get("account_id"),
            "country": user_info.get("country"),
            "locale": user_info.get("locale"),
            "profile_photo_url": user_info.get("profile_photo_url"),
            "space_usage": space_info.get("used", 0) if space_info else 0,
            "space_allocation": (
                space_info.get("allocation", {}).get("allocated", 0)
                if space_info
                else 0
            ),
        }

        # Step 5: Check if account already exists
        existing_account = DBHelper.find_one(
            "connected_accounts",
            filters={
                "user_id": user_id,
                "email": email,
                "provider": "dropbox",
            },
            select_fields=["id"],
        )

        if existing_account:
            # Update existing account
            updates = {
                "access_token": access_token,
                "is_active": Status.ACTIVE.value,
                "expires_at": (
                    datetime.utcnow() + timedelta(seconds=expires_in)
                ).isoformat(),
                "user_object": json.dumps(user),
            }

            # Add refresh token if available
            if refresh_token:
                updates["refresh_token"] = refresh_token

            DBHelper.update_one(
                table_name="connected_accounts",
                filters={"id": existing_account["id"]},
                updates=updates,
            )
        else:
            # Insert new account
            insert_data = {
                "user_id": user_id,
                "email": email,
                "access_token": access_token,
                "provider": "dropbox",
                "is_active": Status.ACTIVE.value,
                "expires_at": (
                    datetime.utcnow() + timedelta(seconds=expires_in)
                ).isoformat(),
                "user_object": json.dumps(user),
            }

            # Add refresh token if available
            if refresh_token:
                insert_data["refresh_token"] = refresh_token

            DBHelper.insert("connected_accounts", **insert_data)

        # Step 6: Create JWT token for client
        jwt_token = create_access_token(
            identity=user["id"],
            additional_claims={
                "email": user["email"],
                "name": user["name"],
                "profile_photo_url": user.get("profile_photo_url"),
                "provider": "dropbox",
            },
        )

        # Step 7: Redirect back to client application
        redirect_url = f"{WEB_URL}/{username}/oauth/callback?token={jwt_token}"
        return redirect(redirect_url)


class RefreshDropboxToken(Resource):
    """
    Refresh Dropbox access token using refresh token
    """

    def post(self):
        data = request.get_json()
        refresh_token = data.get("refresh_token")
        user_id = data.get("user_id")

        if not refresh_token or not user_id:
            return {"error": "Missing refresh_token or user_id"}, 400

        # Refresh token request
        token_url = "https://api.dropboxapi.com/oauth2/token"
        token_data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": DROPBOX_CLIENT_ID,
            "client_secret": DROPBOX_CLIENT_SECRET,
        }

        response = requests.post(token_url, data=token_data)

        if response.status_code != 200:
            return {"error": "Token refresh failed"}, 400

        token_json = response.json()
        new_access_token = token_json.get("access_token")
        expires_in = token_json.get("expires_in", 14400)

        if not new_access_token:
            return {"error": "No access token received"}, 400

        # Update token in database
        DBHelper.update_one(
            table_name="connected_accounts",
            filters={"user_id": user_id, "provider": "dropbox"},
            updates={
                "access_token": new_access_token,
                "expires_at": (
                    datetime.utcnow() + timedelta(seconds=expires_in)
                ).isoformat(),
            },
        )

        return {
            "status": True,
            "message": "Token refreshed successfully",
            "access_token": new_access_token,
            "expires_in": expires_in,
        }
