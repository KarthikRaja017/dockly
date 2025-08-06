"""
Microsoft OAuth Integration - Complete Backend Implementation
Handles OAuth flow, token management, and file operations
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
MS_REDIRECT_URI = f"{API_URL}/auth/callback"
print(f"MS_REDIRECT_URI: {MS_REDIRECT_URI}")
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

# Reduced timeout for OAuth sessions (authorization codes typically expire in 5-10 minutes)
OAUTH_SESSION_TIMEOUT = 300  # 5 minutes instead of 10


class AddMicrosoftAccount(Resource):
    def get(self):
        """Initiate Microsoft OAuth flow"""
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

            # Clear any existing session data to prevent conflicts
            session.pop("username", None)
            session.pop("uid", None)
            session.pop("oauth_start_time", None)

            # Store in session for callback
            session["username"] = username
            session["uid"] = uid
            session["oauth_start_time"] = time.time()

            # Create state parameter with timestamp for validation
            state_data = {
                "uid": uid,
                "username": username,
                "timestamp": datetime.utcnow().isoformat(),
                "nonce": str(int(time.time() * 1000)),
            }
            state = quote(json.dumps(state_data))

            # Build authorization URL with additional parameters to ensure fresh auth
            params = {
                "client_id": MS_CLIENT_ID,
                "response_type": "code",
                "redirect_uri": MS_REDIRECT_URI,
                "scope": " ".join(MS_SCOPES),
                "state": state,
                "prompt": "select_account",  # Force account selection
                "response_mode": "query",
                "access_type": "offline",
                "approval_prompt": "force",  # Force consent screen
            }

            auth_url = f"{MS_AUTHORITY}/oauth2/v2.0/authorize"
            param_string = urllib.parse.urlencode(params)
            auth_uri = f"{auth_url}?{param_string}"

            print(f"✅ Initiating OAuth flow for user {uid} at {datetime.utcnow()}")
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
        """Handle Microsoft OAuth callback"""
        callback_start_time = datetime.utcnow()
        print(f"📞 Callback received at {callback_start_time}")

        try:
            # Check for OAuth errors first
            error = request.args.get("error")
            if error:
                error_description = request.args.get(
                    "error_description", "Unknown error"
                )
                print(f"❌ OAuth error: {error} - {error_description}")

                # Handle specific error types
                if error == "access_denied":
                    return redirect(
                        f"{WEB_URL}/auth/error?error=user_cancelled&description=User cancelled the authorization"
                    )
                else:
                    return redirect(
                        f"{WEB_URL}/auth/error?error={error}&description={urllib.parse.quote(error_description)}"
                    )

            # Check session timeout with reduced window
            oauth_start_time = session.get("oauth_start_time")
            if not oauth_start_time:
                print("❌ No OAuth session found")
                return redirect(
                    f"{WEB_URL}/auth/error?error=no_session&description=OAuth session not found. Please try again."
                )

            session_duration = time.time() - oauth_start_time
            if session_duration > OAUTH_SESSION_TIMEOUT:
                print(
                    f"❌ OAuth session timeout: {session_duration}s > {OAUTH_SESSION_TIMEOUT}s"
                )
                # Clear expired session
                session.pop("username", None)
                session.pop("uid", None)
                session.pop("oauth_start_time", None)
                return redirect(
                    f"{WEB_URL}/auth/error?error=session_timeout&description=OAuth session expired. Please try again."
                )

            print(f"✅ Session valid, duration: {session_duration:.2f}s")

            # Validate state parameter
            state = request.args.get("state")
            if not state:
                print("❌ Missing state parameter")
                return redirect(
                    f"{WEB_URL}/auth/error?error=missing_state&description=Security validation failed"
                )

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
                return redirect(
                    f"{WEB_URL}/auth/error?error=invalid_state&description=Security validation failed"
                )

            # Get authorization code
            code = request.args.get("code")
            if not code:
                print("❌ Missing authorization code")
                return redirect(
                    f"{WEB_URL}/auth/error?error=no_code&description=Authorization code not received"
                )

            print(f"✅ Received auth code for user {uid}, exchanging for tokens...")
            code_received_time = datetime.utcnow()
            print(
                f"🕐 Time from callback start to code processing: {(code_received_time - callback_start_time).total_seconds():.2f}s"
            )

            # Exchange code for tokens with immediate processing
            tokens = self._exchange_code_for_tokens(code)
            if not tokens:
                print("❌ Token exchange failed")
                # Clear session on failed exchange
                session.pop("username", None)
                session.pop("uid", None)
                session.pop("oauth_start_time", None)
                return redirect(
                    f"{WEB_URL}/auth/error?error=token_exchange_failed&description=Failed to exchange authorization code for tokens. The code may have expired. Please try again."
                )

            token_exchange_time = datetime.utcnow()
            print(
                f"✅ Token exchange successful in {(token_exchange_time - code_received_time).total_seconds():.2f}s"
            )

            # Get user information
            user_info = self._get_user_info(tokens["access_token"])
            if not user_info:
                print("❌ Failed to get user info")
                return redirect(
                    f"{WEB_URL}/auth/error?error=user_info_failed&description=Failed to retrieve user information"
                )

            # Get user photo (optional, don't fail if this doesn't work)
            picture_url = None
            try:
                picture_url = self._get_user_photo(tokens["access_token"])
            except Exception as e:
                print(f"⚠️  Failed to get user photo: {str(e)}")

            # Calculate token expiration
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

            # Save account to database
            success = self._save_account(
                uid=uid,
                email=email,
                tokens=tokens,
                expires_at=expires_at,
                user_object=user_object,
            )

            if not success:
                print("❌ Failed to save account to database")
                return redirect(
                    f"{WEB_URL}/auth/error?error=database_error&description=Failed to save account information"
                )

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

            completion_time = datetime.utcnow()
            total_duration = (completion_time - callback_start_time).total_seconds()
            print(
                f"✅ OAuth flow completed successfully for {email} in {total_duration:.2f}s"
            )
            return redirect(f"{WEB_URL}/{username}/oauth/callback?token={jwt_token}")

        except Exception as e:
            print(f"❌ Microsoft auth callback error: {str(e)}")
            import traceback

            traceback.print_exc()

            # Clear session on any error
            session.pop("username", None)
            session.pop("uid", None)
            session.pop("oauth_start_time", None)

            return redirect(
                f"{WEB_URL}/auth/error?error=callback_exception&description=An unexpected error occurred during authentication"
            )

    def _exchange_code_for_tokens(self, code):
        """Exchange authorization code for access/refresh tokens with improved error handling"""
        exchange_start = datetime.utcnow()

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
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            print(f"🔄 Exchanging code for tokens at {exchange_start}...")

            # Make request with shorter timeout to fail fast
            response = requests.post(
                token_url,
                data=token_data,
                headers=headers,
                timeout=15,  # Reduced from 30 to 15 seconds
            )

            exchange_end = datetime.utcnow()
            exchange_duration = (exchange_end - exchange_start).total_seconds()

            print(
                f"📊 Token exchange response: {response.status_code} (took {exchange_duration:.2f}s)"
            )

            if response.status_code == 200:
                token_response = response.json()
                print(
                    f"✅ Received tokens: access_token length={len(token_response.get('access_token', ''))}, has_refresh_token={bool(token_response.get('refresh_token'))}"
                )
                return token_response
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {
                        "error": "unknown",
                        "error_description": response.text,
                    }

                error_code = error_data.get("error", "unknown")
                error_desc = error_data.get(
                    "error_description", "No description available"
                )

                print(f"❌ Token exchange failed: {response.status_code}")
                print(f"❌ Error: {error_code} - {error_desc}")

                # Handle specific error cases
                if error_code == "invalid_grant":
                    if "expired" in error_desc.lower() or "AADSTS70000" in error_desc:
                        print(
                            "🔄 Authorization code has expired - this is common if there was a delay in processing"
                        )
                    elif "AADSTS70008" in error_desc:
                        print("🔄 Authorization code has already been used")
                    else:
                        print(f"🔄 Invalid grant error: {error_desc}")

                return None

        except requests.Timeout as e:
            print(f"❌ Token exchange request timed out after 15s: {str(e)}")
            return None
        except requests.RequestException as e:
            print(f"❌ Token exchange request failed: {str(e)}")
            return None
        except Exception as e:
            print(f"❌ Unexpected error in token exchange: {str(e)}")
            return None

    def _get_user_info(self, access_token):
        """Get user information from Microsoft Graph"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            print("🔄 Fetching user info from Microsoft Graph...")
            response = requests.get(
                "https://graph.microsoft.com/v1.0/me", headers=headers, timeout=15
            )

            if response.status_code == 200:
                user_info = response.json()
                print(
                    f"✅ Retrieved user info for: {user_info.get('displayName', 'Unknown')} ({user_info.get('mail', user_info.get('userPrincipalName', 'No email'))})"
                )
                return user_info
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
                "User-Agent": "Microsoft-OAuth-Integration/1.0",
            }

            response = requests.get(
                "https://graph.microsoft.com/v1.0/me/photo/$value",
                headers=headers,
                timeout=10,  # Short timeout for optional feature
            )

            if response.status_code == 200 and response.content:
                import base64

                picture_data = base64.b64encode(response.content).decode("utf-8")
                print("✅ Retrieved user profile photo")
                return f"data:image/jpeg;base64,{picture_data}"

            print(f"⚠️  No profile photo available (status: {response.status_code})")
            return None

        except Exception as e:
            print(f"⚠️  Photo request failed: {str(e)}")
            return None

    def _save_account(self, uid, email, tokens, expires_at, user_object):
        """Save or update connected account in database"""
        try:
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

            print(f"💾 Saving account for {email} (user_id: {uid})")

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


def refresh_microsoft_token(refresh_token):
    """Refresh Microsoft access token using refresh token"""
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
            "User-Agent": "Microsoft-OAuth-Integration/1.0",
        }

        print("🔄 Refreshing Microsoft token...")
        response = requests.post(
            token_url, data=token_data, headers=headers, timeout=15
        )

        if response.status_code == 200:
            print("✅ Token refreshed successfully")
            return response.json()
        else:
            try:
                error_data = response.json()
            except:
                error_data = {"error": "unknown", "error_description": response.text}

            error_code = error_data.get("error", "unknown")
            error_desc = error_data.get("error_description", response.text)

            print(f"❌ Token refresh failed: {response.status_code}")
            print(f"❌ Error: {error_code} - {error_desc}")
            return None

    except requests.RequestException as e:
        print(f"❌ Token refresh request failed: {str(e)}")
        return None
    except Exception as e:
        print(f"❌ Unexpected error in token refresh: {str(e)}")
        return None
