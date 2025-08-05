"""
Microsoft OAuth Integration - Fixed Version
Addresses authorization code expiration and API response issues
"""

from datetime import datetime, timedelta
import json
import os
from flask import redirect, request, session
from flask_jwt_extended import create_access_token
from flask_restful import Resource
import requests
from urllib.parse import quote, unquote
import urllib.parse
import time
from root.db.dbHelper import DBHelper
from root.config import API_URL, WEB_URL

# Use environment variables for security
MS_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID", "")
MS_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET", "")
MS_TENANT_ID = os.getenv("MICROSOFT_TENANT_ID", "common")

MS_AUTHORITY = f"https://login.microsoftonline.com/{MS_TENANT_ID}"
MS_REDIRECT_URI = f"{API_URL}/microsoft/auth/callback"
MS_SCOPES = [
    "openid",
    "profile",
    "email",
    "offline_access",
    "https://graph.microsoft.com/User.Read",
    "https://graph.microsoft.com/Files.ReadWrite",
    "https://graph.microsoft.com/Files.ReadWrite.All",
    "https://graph.microsoft.com/Sites.ReadWrite.All",
]


class AddMicrosoftAccount(Resource):
    def get(self):
        """Initiate Microsoft OAuth flow with better error handling"""
        try:
            # Get and validate parameters
            uid = request.args.get("userId")
            username = request.args.get("username")

            if not uid or not username:
                return {
                    "status": 0,
                    "message": "Missing userId or username",
                    "payload": {},
                }, 400

            # Ensure parameters are strings and clean
            uid = str(uid).strip()
            username = str(username).strip()

            # Validate environment variables
            if not MS_CLIENT_ID or not MS_CLIENT_SECRET:
                print("❌ Microsoft OAuth credentials not configured")
                return {
                    "status": 0,
                    "message": "Microsoft OAuth not configured properly",
                    "payload": {},
                }, 500

            # Store in session for callback with timestamp
            session["username"] = username
            session["uid"] = uid
            session["oauth_start_time"] = time.time()

            # Create state parameter with proper encoding
            state_data = {
                "uid": uid,
                "username": username,
                "timestamp": datetime.utcnow().isoformat(),
                "nonce": str(int(time.time() * 1000)),  # Add nonce for security
            }
            state = quote(json.dumps(state_data))

            # Build authorization URL with proper encoding
            params = {
                "client_id": MS_CLIENT_ID,
                "response_type": "code",
                "redirect_uri": MS_REDIRECT_URI,
                "scope": " ".join(MS_SCOPES),
                "state": state,
                "prompt": "select_account",
                "response_mode": "query",
                "access_type": "offline",  # Ensure refresh token
            }

            # Use urllib.parse for proper encoding
            auth_url = f"{MS_AUTHORITY}/oauth2/v2.0/authorize"
            param_string = urllib.parse.urlencode(params)
            auth_uri = f"{auth_url}?{param_string}"

            print(f"✅ Initiating OAuth flow for user {uid}")
            return redirect(auth_uri)

        except Exception as e:
            print(f"❌ Error in AddMicrosoftAccount: {str(e)}")
            return {
                "status": 0,
                "message": f"Failed to initiate OAuth flow: {str(e)}",
                "payload": {},
            }, 500


class MicrosoftCallback(Resource):
    def get(self):
        """Handle Microsoft OAuth callback with improved error handling"""
        try:
            # Check for OAuth errors first
            error = request.args.get("error")
            if error:
                error_description = request.args.get(
                    "error_description", "Unknown error"
                )
                print(f"❌ OAuth error: {error} - {error_description}")
                return redirect(
                    f"{WEB_URL}/auth/error?error={error}&description={urllib.parse.quote(error_description)}"
                )

            # Check session timeout (OAuth should complete within 10 minutes)
            oauth_start_time = session.get("oauth_start_time")
            if (
                oauth_start_time and (time.time() - oauth_start_time) > 600
            ):  # 10 minutes
                print("❌ OAuth session timeout")
                return redirect(f"{WEB_URL}/auth/error?error=session_timeout")

            # Validate state parameter
            state = request.args.get("state")
            if not state:
                print("❌ Missing state parameter")
                return redirect(f"{WEB_URL}/auth/error?error=missing_state")

            # Decode and validate state
            try:
                decoded_state = unquote(state)
                state_data = json.loads(decoded_state)
                uid = str(state_data.get("uid", "")).strip()
                username = str(state_data.get("username", "")).strip()

                if not uid or not username:
                    raise ValueError("Invalid state data")

                # Validate against session
                if session.get("uid") != uid or session.get("username") != username:
                    raise ValueError("State mismatch")

            except (json.JSONDecodeError, ValueError) as e:
                print(f"❌ Invalid state parameter: {str(e)}")
                return redirect(f"{WEB_URL}/auth/error?error=invalid_state")

            # Get authorization code
            code = request.args.get("code")
            if not code:
                print("❌ Missing authorization code")
                return redirect(f"{WEB_URL}/auth/error?error=no_code")

            print(f"✅ Received auth code for user {uid}, exchanging for tokens...")

            # Exchange code for tokens with retry logic
            tokens = None
            max_retries = 3
            for attempt in range(max_retries):
                tokens = self._exchange_code_for_tokens(code)
                if tokens:
                    break
                if attempt < max_retries - 1:
                    print(
                        f"⚠️  Token exchange attempt {attempt + 1} failed, retrying..."
                    )
                    time.sleep(1)  # Short delay before retry

            if not tokens:
                print("❌ All token exchange attempts failed")
                return redirect(f"{WEB_URL}/auth/error?error=token_exchange_failed")

            print("✅ Token exchange successful")

            # Get user information with retry
            user_info = None
            for attempt in range(3):
                user_info = self._get_user_info(tokens["access_token"])
                if user_info:
                    break
                if attempt < 2:
                    time.sleep(1)

            if not user_info:
                print("❌ Failed to get user info")
                return redirect(f"{WEB_URL}/auth/error?error=user_info_failed")

            # Get user photo (optional, don't fail if this doesn't work)
            picture_url = None
            try:
                picture_url = self._get_user_photo(tokens["access_token"])
            except Exception as e:
                print(f"⚠️  Failed to get user photo: {str(e)}")

            # Calculate token expiration with buffer
            expires_in = tokens.get("expires_in", 3600)
            expires_at = datetime.utcnow() + timedelta(
                seconds=expires_in - 300
            )  # 5 min buffer

            # Prepare user object
            account_id = str(user_info.get("id", ""))
            email = str(user_info.get("mail") or user_info.get("userPrincipalName", ""))
            display_name = str(user_info.get("displayName", ""))

            user_object = {
                "id": account_id,
                "email": email,
                "name": display_name,
                "picture": picture_url,
                "provider": "outlook",
            }

            # Save or update account in database
            success = self._save_account(
                uid=uid,
                email=email,
                tokens=tokens,
                expires_at=expires_at,
                user_object=user_object,
            )

            if not success:
                print("❌ Failed to save account to database")
                return redirect(f"{WEB_URL}/auth/error?error=database_error")

            # Clear session data
            session.pop("username", None)
            session.pop("uid", None)
            session.pop("oauth_start_time", None)

            # Create JWT token
            jwt_token = create_access_token(
                identity=account_id,
                additional_claims={
                    "email": email,
                    "name": display_name,
                    "picture": picture_url,
                    "provider": "outlook",
                },
            )

            print(f"✅ OAuth flow completed successfully for {email}")
            return redirect(f"{WEB_URL}/{username}/oauth/callback?token={jwt_token}")

        except Exception as e:
            print(f"❌ Microsoft auth callback error: {str(e)}")
            import traceback

            traceback.print_exc()
            return redirect(f"{WEB_URL}/auth/error?error=callback_exception")

    def _exchange_code_for_tokens(self, code):
        """Exchange authorization code for access/refresh tokens with improved handling"""
        try:
            token_url = f"{MS_AUTHORITY}/oauth2/v2.0/token"
            token_data = {
                "client_id": MS_CLIENT_ID,
                "client_secret": MS_CLIENT_SECRET,
                "code": code,
                "redirect_uri": MS_REDIRECT_URI,
                "grant_type": "authorization_code",
                "scope": " ".join(MS_SCOPES),
            }

            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            }

            print(f"🔄 Exchanging code for tokens...")
            response = requests.post(
                token_url, data=token_data, headers=headers, timeout=30
            )

            print(f"📊 Token exchange response: {response.status_code}")

            if response.status_code == 200:
                return response.json()
            else:
                error_data = response.json() if response.content else {}
                error_code = error_data.get("error", "unknown")
                error_desc = error_data.get("error_description", response.text)

                print(f"❌ Token exchange failed: {response.status_code}")
                print(f"❌ Error: {error_code} - {error_desc}")

                # Handle specific error cases
                if error_code == "invalid_grant" and "expired" in error_desc.lower():
                    print(
                        "❌ Authorization code expired - user needs to re-authenticate"
                    )

                return None

        except requests.RequestException as e:
            print(f"❌ Token exchange request failed: {str(e)}")
            return None
        except Exception as e:
            print(f"❌ Unexpected error in token exchange: {str(e)}")
            return None

    def _get_user_info(self, access_token):
        """Get user information from Microsoft Graph with better error handling"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            }

            response = requests.get(
                "https://graph.microsoft.com/v1.0/me", headers=headers, timeout=30
            )

            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ User info request failed: {response.status_code}")
                print(f"❌ Response: {response.text}")
                return None

        except requests.RequestException as e:
            print(f"❌ User info request failed: {str(e)}")
            return None

    def _get_user_photo(self, access_token):
        """Get user profile photo (optional)"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
            }

            response = requests.get(
                "https://graph.microsoft.com/v1.0/me/photo/$value",
                headers=headers,
                timeout=15,  # Shorter timeout for optional feature
            )

            if response.status_code == 200 and response.content:
                import base64

                picture_data = base64.b64encode(response.content).decode("utf-8")
                return f"data:image/jpeg;base64,{picture_data}"

            return None

        except Exception as e:
            print(f"⚠️  Photo request failed: {str(e)}")
            return None

    def _save_account(self, uid, email, tokens, expires_at, user_object):
        """Save or update connected account in database with better error handling"""
        try:
            # Ensure all parameters are properly formatted
            uid = str(uid)
            email = str(email)
            access_token = str(tokens.get("access_token", ""))
            refresh_token = str(tokens.get("refresh_token", ""))
            expires_at_iso = expires_at.isoformat()
            user_object_json = json.dumps(user_object)
            current_time = datetime.utcnow().isoformat()

            if not access_token:
                print("❌ No access token to save")
                return False

            # Check if account already exists
            existing_account = DBHelper.find_one(
                table_name="connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "outlook",
                    "email": email,
                },
                select_fields=["id"],
            )

            if not existing_account:
                # Insert new account
                result = DBHelper.insert(
                    table_name="connected_accounts",
                    return_column="id",
                    user_id=uid,
                    email=email,
                    provider="outlook",
                    access_token=access_token,
                    refresh_token=refresh_token,
                    is_active=1,
                    scopes=" ".join(MS_SCOPES),
                    expires_at=expires_at_iso,
                    user_object=user_object_json,
                    connected_at=current_time,
                    updated_at=current_time,
                )
                print(f"✅ Inserted new account with ID: {result}")
            else:
                # Update existing account
                result = DBHelper.update_one(
                    table_name="connected_accounts",
                    filters={"id": existing_account["id"]},
                    updates={
                        "access_token": access_token,
                        "refresh_token": refresh_token,
                        "expires_at": expires_at_iso,
                        "user_object": user_object_json,
                        "updated_at": current_time,
                        "is_active": 1,
                    },
                )
                print(f"✅ Updated existing account: {existing_account['id']}")

            return True

        except Exception as e:
            print(f"❌ Database error in _save_account: {str(e)}")
            import traceback

            traceback.print_exc()
            return False


# Improved token refresh utility function
def refresh_microsoft_token(refresh_token):
    """Refresh Microsoft access token using refresh token with better error handling"""
    try:
        if not refresh_token:
            print("❌ No refresh token provided")
            return None

        token_url = f"{MS_AUTHORITY}/oauth2/v2.0/token"
        token_data = {
            "client_id": MS_CLIENT_ID,
            "client_secret": MS_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": " ".join(MS_SCOPES),
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        }

        print("🔄 Refreshing Microsoft token...")
        response = requests.post(
            token_url, data=token_data, headers=headers, timeout=30
        )

        if response.status_code == 200:
            print("✅ Token refreshed successfully")
            return response.json()
        else:
            error_data = response.json() if response.content else {}
            error_code = error_data.get("error", "unknown")
            error_desc = error_data.get("error_description", response.text)

            print(f"❌ Token refresh failed: {response.status_code}")
            print(f"❌ Error: {error_code} - {error_desc}")

            # Handle specific refresh token errors
            if error_code in ["invalid_grant", "invalid_client"]:
                print(
                    "❌ Refresh token is invalid or expired - requires re-authentication"
                )

            return None

    except requests.RequestException as e:
        print(f"❌ Token refresh request failed: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error in token refresh: {str(e)}")
        return None
