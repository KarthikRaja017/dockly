import os
import json
import traceback
import requests
from datetime import datetime, timedelta
from flask import Request, request, jsonify, send_file
from flask_restful import Resource
from werkzeug.utils import secure_filename
import io
import zipfile

from root.db.dbHelper import DBHelper
from root.auth.auth import auth_required
from root.common import Status
from root.microsoft.models import MS_CLIENT_ID, MS_CLIENT_SECRET

# from root.db.dbHelper import DBHelper


class OutlookBaseResource(Resource):
    """Base class for Outlook/OneDrive operations"""

    def validate_access_token(self, access_token):
        """Validate that the access token has proper JWT format"""
        if not access_token:
            return False

        # JWT tokens should have 3 parts separated by dots
        parts = access_token.split(".")
        if len(parts) != 3:
            print(f"Invalid token format - expected 3 parts, got {len(parts)}")
            return False

        # Check that none of the parts are empty
        if not all(part.strip() for part in parts):
            print("Invalid token format - empty parts found")
            return False

        return True

    def get_user_credentials(self, user_id):
        """Get user's Outlook credentials from database with proper error handling"""
        try:
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": user_id,
                    # "provider": "outlook",
                    # "is_active": Status.ACTIVE.value,
                },
            )

            if not account:
                print(f"No active Outlook account found for user {user_id}")
                return None

            access_token = account.get("access_token")
            refresh_token = account.get("refresh_token")
            expires_at = account.get("expires_at")

            # Validate access token format first
            if not self.validate_access_token(access_token):
                print(
                    f"Invalid access token format for user {user_id}, attempting refresh"
                )
                if refresh_token:
                    new_token = self.refresh_access_token(refresh_token)
                    if new_token and new_token.get("access_token"):
                        # Update DB with new token
                        new_access_token = new_token["access_token"]
                        if self.validate_access_token(new_access_token):
                            DBHelper.update_one(
                                "connected_accounts",
                                filters={"id": account["id"]},
                                updates={
                                    "access_token": new_access_token,
                                    "expires_at": (
                                        datetime.utcnow()
                                        + timedelta(
                                            seconds=new_token.get("expires_in", 3600)
                                        )
                                    ).isoformat(),
                                },
                            )
                            print(f"Token refreshed and validated for user {user_id}")
                            return new_access_token
                        else:
                            print(f"Refreshed token is also invalid for user {user_id}")
                    else:
                        print(f"Token refresh failed for user {user_id}")

                # Mark account as inactive if token issues persist
                DBHelper.update_one(
                    "connected_accounts",
                    filters={"id": account["id"]},
                    updates={"is_active": Status.REMOVED.value},
                )
                return None

            # Parse expires_at
            if isinstance(expires_at, str):
                try:
                    expires_at = datetime.fromisoformat(expires_at)
                except ValueError:
                    expires_at = None

            # Check if token needs refresh
            if expires_at and expires_at <= datetime.utcnow():
                print(f"Token expired for user {user_id}, refreshing...")
                try:
                    new_token = self.refresh_access_token(refresh_token)
                    if new_token and new_token.get("access_token"):
                        new_access_token = new_token["access_token"]
                        if self.validate_access_token(new_access_token):
                            # Update DB with new token
                            DBHelper.update_one(
                                "connected_accounts",
                                filters={"id": account["id"]},
                                updates={
                                    "access_token": new_access_token,
                                    "expires_at": (
                                        datetime.utcnow()
                                        + timedelta(
                                            seconds=new_token.get("expires_in", 3600)
                                        )
                                    ).isoformat(),
                                },
                            )
                            access_token = new_access_token
                            print(f"Token refreshed successfully for user {user_id}")
                        else:
                            print(f"Refreshed token is invalid for user {user_id}")
                            DBHelper.update_one(
                                "connected_accounts",
                                filters={"id": account["id"]},
                                updates={"is_active": Status.REMOVED.value},
                            )
                            return None
                    else:
                        print(
                            f"Token refresh returned invalid response for user {user_id}"
                        )
                        # Mark the account inactive
                        DBHelper.update_one(
                            "connected_accounts",
                            filters={"id": account["id"]},
                            updates={"is_active": Status.REMOVED.value},
                        )
                        return None
                except Exception as e:
                    print(f"Token refresh failed for user {user_id}: {e}")
                    DBHelper.update_one(
                        "connected_accounts",
                        filters={"id": account["id"]},
                        updates={"is_active": Status.REMOVED.value},
                    )
                    return None

            # Final validation before returning
            if self.validate_access_token(access_token):
                return access_token
            else:
                print(f"Final token validation failed for user {user_id}")
                return None

        except Exception as e:
            print(f"Error getting Outlook credentials for user {user_id}: {str(e)}")
            return None

    def get_user_credentials_for_account(self, user_id, email):
        """Get credentials for a specific account"""
        try:
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": user_id,
                    "email": email,
                    # "provider": "outlook",
                    # "is_active": Status.ACTIVE.value,
                },
            )

            if not account:
                print(f"No active Outlook account found for {email}")
                return None

            access_token = account.get("access_token")
            refresh_token = account.get("refresh_token")
            expires_at = account.get("expires_at")

            # Validate access token format first
            if not self.validate_access_token(access_token):
                print(f"Invalid access token format for {email}, attempting refresh")
                if refresh_token:
                    new_token = self.refresh_access_token(refresh_token)
                    if new_token and new_token.get("access_token"):
                        new_access_token = new_token["access_token"]
                        if self.validate_access_token(new_access_token):
                            # Update DB with new token
                            DBHelper.update_one(
                                "connected_accounts",
                                filters={"id": account["id"]},
                                updates={
                                    "access_token": new_access_token,
                                    "expires_at": (
                                        datetime.utcnow()
                                        + timedelta(
                                            seconds=new_token.get("expires_in", 3600)
                                        )
                                    ).isoformat(),
                                },
                            )
                            print(f"Token refreshed and validated for {email}")
                            return new_access_token
                        else:
                            print(f"Refreshed token is also invalid for {email}")

                # Mark account as inactive if token issues persist
                DBHelper.update_one(
                    "connected_accounts",
                    filters={"id": account["id"]},
                    updates={"is_active": Status.REMOVED.value},
                )
                return None

            # Parse expires_at
            if isinstance(expires_at, str):
                try:
                    expires_at = datetime.fromisoformat(expires_at)
                except ValueError:
                    expires_at = None

            # Check if token needs refresh
            if expires_at and expires_at <= datetime.utcnow():
                print(f"Token expired for {email}, refreshing...")
                try:
                    new_token = self.refresh_access_token(refresh_token)
                    if new_token and new_token.get("access_token"):
                        new_access_token = new_token["access_token"]
                        if self.validate_access_token(new_access_token):
                            # Update DB with new token
                            DBHelper.update_one(
                                "connected_accounts",
                                filters={"id": account["id"]},
                                updates={
                                    "access_token": new_access_token,
                                    "expires_at": (
                                        datetime.utcnow()
                                        + timedelta(
                                            seconds=new_token.get("expires_in", 3600)
                                        )
                                    ).isoformat(),
                                },
                            )
                            access_token = new_access_token
                            print(f"Token refreshed successfully for {email}")
                        else:
                            print(f"Refreshed token is invalid for {email}")
                            DBHelper.update_one(
                                "connected_accounts",
                                filters={"id": account["id"]},
                                updates={"is_active": Status.REMOVED.value},
                            )
                            return None
                    else:
                        print(f"Token refresh returned invalid response for {email}")
                        # Mark the account inactive
                        DBHelper.update_one(
                            "connected_accounts",
                            filters={"id": account["id"]},
                            updates={"is_active": Status.REMOVED.value},
                        )
                        return None
                except Exception as e:
                    print(f"Token refresh failed for {email}: {e}")
                    DBHelper.update_one(
                        "connected_accounts",
                        filters={"id": account["id"]},
                        updates={"is_active": Status.REMOVED.value},
                    )
                    return None

            # Final validation before returning
            if self.validate_access_token(access_token):
                return access_token
            else:
                print(f"Final token validation failed for {email}")
                return None

        except Exception as e:
            print(f"Error getting Outlook credentials for {email}: {str(e)}")
            return None

    def refresh_access_token(self, refresh_token):
        """Refresh Outlook access token"""
        try:
            if not refresh_token:
                print("No refresh token provided")
                return None

            token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"

            data = {
                "client_id": MS_CLIENT_ID,
                "client_secret": MS_CLIENT_SECRET,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
                "scope": "https://graph.microsoft.com/Files.ReadWrite https://graph.microsoft.com/User.Read offline_access",
            }

            print("Attempting to refresh token...")
            response = requests.post(token_url, data=data)

            if response.status_code == 200:
                token_data = response.json()
                if token_data.get("access_token"):
                    print("Token refresh successful")
                    return token_data
                else:
                    print("Token refresh response missing access_token")
                    return None
            else:
                print(
                    f"Token refresh failed with status {response.status_code}: {response.text}"
                )
                return None

        except Exception as e:
            print(f"Error refreshing token: {str(e)}")
            return None

    def make_graph_request(
        self, access_token, endpoint, method="GET", data=None, files=None, stream=False
    ):
        """Make authenticated request to Microsoft Graph API"""
        try:
            # Validate token before making request
            if not self.validate_access_token(access_token):
                print(f"Invalid access token format, cannot make request to {endpoint}")
                return None

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json" if not files else None,
            }

            if files:
                del headers["Content-Type"]

            url = f"https://graph.microsoft.com/v1.0{endpoint}"

            print(f"Making {method} request to: {url}")

            if method == "GET":
                response = requests.get(url, headers=headers, stream=stream)
            elif method == "POST":
                if files:
                    response = requests.post(url, headers=headers, files=files)
                else:
                    response = requests.post(url, headers=headers, json=data)
            elif method == "PUT":
                if data and isinstance(data, bytes):
                    headers["Content-Type"] = "application/octet-stream"
                    response = requests.put(url, headers=headers, data=data)
                else:
                    response = requests.put(url, headers=headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers)
            elif method == "PATCH":
                response = requests.patch(url, headers=headers, json=data)
            else:
                print(f"Unsupported HTTP method: {method}")
                return None

            if response.status_code in [200, 201, 204]:
                print(f"Request successful: {response.status_code}")
                return response.json() if response.content and not stream else response
            else:
                print(f"Graph API error: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            print(f"Error making Graph request to {endpoint}: {str(e)}")
            return None

    def format_bytes(self, bytes_value):
        """Format bytes to human readable format"""
        if bytes_value == 0:
            return "0 B"

        sizes = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        while bytes_value >= 1024 and i < len(sizes) - 1:
            bytes_value /= 1024
            i += 1

        return f"{bytes_value:.1f} {sizes[i]}"


class ListOutlookFiles(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_id = data.get("folderId", "root")
            sort_by = data.get("sortBy", "lastModifiedDateTime")
            sort_order = data.get("sortOrder", "desc")
            page_size = data.get("pageSize", 100)

            print(f"Listing Outlook files for user {uid}, folder: {folder_id}")

            # Get all Outlook accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    # "provider": "outlook",
                    # "is_active": Status.ACTIVE.value,
                },
                select_fields=[
                    "access_token",
                    "refresh_token",
                    "email",
                    "provider",
                    "user_object",
                ],
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Outlook accounts connected.",
                    "payload": {
                        "files": [],
                        "folders": [],
                        "connected_accounts": [],
                        "errors": [],
                    },
                }

            print(f"Found {len(all_accounts)} Outlook accounts")

            merged_files = []
            merged_folders = []
            connected_accounts = []
            errors = []

            processed_file_ids = set()
            processed_folder_ids = set()

            for account in all_accounts:
                email = account.get("email")
                user_object = account.get("user_object")

                print(f"Processing account: {email}")

                try:
                    user_object_data = json.loads(user_object) if user_object else {}
                except json.JSONDecodeError:
                    user_object_data = {}

                try:
                    access_token = self.get_user_credentials_for_account(uid, email)
                    if not access_token:
                        error_msg = "Failed to get valid access token - may be expired or malformed"
                        print(f"[{email}] {error_msg}")
                        errors.append({"email": email, "error": error_msg})
                        continue

                    # Build endpoint for folder contents
                    if folder_id == "root":
                        endpoint = "/me/drive/root/children"
                    else:
                        endpoint = f"/me/drive/items/{folder_id}/children"

                    # Add query parameters
                    endpoint += f"?$top={page_size}&$orderby={sort_by} {sort_order}"

                    print(f"[{email}] Making request to: {endpoint}")

                    # Get files from OneDrive
                    result = self.make_graph_request(access_token, endpoint)

                    if not result:
                        error_msg = "Failed to access OneDrive - API request failed"
                        print(f"[{email}] {error_msg}")
                        errors.append({"email": email, "error": error_msg})
                        continue

                    items = result.get("value", [])
                    print(f"[{email}] Retrieved {len(items)} items")

                    account_files = []
                    account_folders = []

                    for item in items:
                        item_id = item.get("id")
                        is_folder = "folder" in item

                        # Skip if we've already processed this file/folder
                        if is_folder:
                            if item_id in processed_folder_ids:
                                continue
                            processed_folder_ids.add(item_id)
                        else:
                            if item_id in processed_file_ids:
                                continue
                            processed_file_ids.add(item_id)

                        base_info = {
                            "id": item_id,
                            "name": item.get("name"),
                            "modifiedTime": item.get("lastModifiedDateTime"),
                            "shared": bool(item.get("shared")),
                            "parents": [folder_id] if folder_id != "root" else [],
                            "source_email": email,
                            "account_name": user_object_data.get(
                                "displayName", email.split("@")[0]
                            ),
                        }

                        if is_folder:
                            account_folders.append(
                                {
                                    **base_info,
                                    "owners": [
                                        {
                                            "displayName": user_object_data.get(
                                                "displayName", email.split("@")[0]
                                            ),
                                            "emailAddress": email,
                                            "photoLink": user_object_data.get(
                                                "picture", ""
                                            ),
                                        }
                                    ],
                                }
                            )
                        else:
                            account_files.append(
                                {
                                    **base_info,
                                    "mimeType": item.get("file", {}).get(
                                        "mimeType", "application/octet-stream"
                                    ),
                                    "size": item.get("size", 0),
                                    "createdTime": item.get("createdDateTime"),
                                    "thumbnailLink": (
                                        item.get("thumbnails", [{}])[0]
                                        .get("medium", {})
                                        .get("url")
                                        if item.get("thumbnails")
                                        else None
                                    ),
                                    "webViewLink": item.get("webUrl"),
                                    "webContentLink": item.get(
                                        "@microsoft.graph.downloadUrl"
                                    ),
                                    "owners": [
                                        {
                                            "displayName": user_object_data.get(
                                                "displayName", email.split("@")[0]
                                            ),
                                            "emailAddress": email,
                                            "photoLink": user_object_data.get(
                                                "picture", ""
                                            ),
                                        }
                                    ],
                                    "starred": False,  # OneDrive doesn't have starring
                                    "trashed": False,
                                }
                            )

                    merged_files.extend(account_files)
                    merged_folders.extend(account_folders)

                    connected_accounts.append(
                        {
                            "email": email,
                            "provider": "outlook",
                            "userName": user_object_data.get(
                                "displayName", email.split("@")[0]
                            ),
                            "displayName": user_object_data.get(
                                "displayName", email.split("@")[0]
                            ),
                            "picture": user_object_data.get("picture", ""),
                            "files_count": len(account_files),
                            "folders_count": len(account_folders),
                        }
                    )

                    print(
                        f"[OUTLOOK] {email}: {len(account_files)} files, {len(account_folders)} folders fetched successfully"
                    )

                except Exception as e:
                    error_msg = str(e)
                    print(f"Error fetching Outlook files for {email}: {error_msg}")
                    errors.append({"email": email, "error": error_msg})

                    # Mark token as inactive if it's an auth error
                    if any(
                        keyword in error_msg.lower()
                        for keyword in [
                            "invalid_grant",
                            "401",
                            "invalid_token",
                            "expired",
                            "invalidauthenticationtoken",
                        ]
                    ):
                        print(f"Marking account {email} as inactive due to auth error")
                        DBHelper.update_one(
                            table_name="connected_accounts",
                            filters={
                                "user_id": uid,
                                "email": email,
                                "provider": "outlook",
                            },
                            updates={"is_active": Status.REMOVED.value},
                        )

            # Sort merged results
            merged_files.sort(
                key=lambda f: f.get("modifiedTime", ""), reverse=(sort_order == "desc")
            )
            merged_folders.sort(
                key=lambda f: f.get("modifiedTime", ""), reverse=(sort_order == "desc")
            )

            print(
                f"Final results: {len(merged_files)} files, {len(merged_folders)} folders, {len(errors)} errors"
            )

            return {
                "status": 1,
                "message": (
                    f"Retrieved {len(merged_files)} files and {len(merged_folders)} folders from OneDrive."
                    if (merged_files or merged_folders)
                    else "No files found."
                ),
                "payload": {
                    "files": merged_files,
                    "folders": merged_folders,
                    "connected_accounts": connected_accounts,
                    "errors": errors,
                    "nextPageToken": None,
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to fetch Outlook files: {str(e)}",
                "payload": {
                    "files": [],
                    "folders": [],
                    "connected_accounts": [],
                    "errors": [{"error": str(e)}],
                },
            }


# Keep all other classes the same, just inherit from the fixed OutlookBaseResource
class UploadOutlookFile(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided", "payload": {}}

            file = request.files["file"]
            parent_id = request.form.get("parentId", "root")

            if file.filename == "":
                return {"status": 0, "message": "No file selected", "payload": {}}

            # Build upload endpoint
            filename = secure_filename(file.filename)
            if parent_id == "root":
                endpoint = f"/me/drive/root:/{filename}:/content"
            else:
                endpoint = f"/me/drive/items/{parent_id}:/{filename}:/content"

            # Upload file
            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            file_content = file.read()
            response = self.make_graph_request(
                access_token, endpoint, method="PUT", data=file_content
            )

            if response and hasattr(response, "json"):
                uploaded_file = response.json()
                return {
                    "status": 1,
                    "message": f"File '{file.filename}' uploaded successfully",
                    "payload": {"file": uploaded_file},
                }
            else:
                return {
                    "status": 0,
                    "message": f"Failed to upload file",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to upload file: {str(e)}",
                "payload": {},
            }


class DownloadOutlookFile(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Get file metadata first
            file_info = self.make_graph_request(
                access_token, f"/me/drive/items/{file_id}"
            )
            if not file_info:
                return {
                    "status": 0,
                    "message": "File not found",
                    "payload": {},
                }

            # Get download URL
            download_url = file_info.get("@microsoft.graph.downloadUrl")
            if not download_url:
                return {
                    "status": 0,
                    "message": "File cannot be downloaded",
                    "payload": {},
                }

            # Download file content
            response = requests.get(download_url)
            if response.status_code == 200:
                file_buffer = io.BytesIO(response.content)
                return send_file(
                    file_buffer,
                    as_attachment=True,
                    download_name=file_info["name"],
                    mimetype="application/octet-stream",
                )
            else:
                return {
                    "status": 0,
                    "message": "Failed to download file content",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to download file: {str(e)}",
                "payload": {},
            }


class DeleteOutlookFile(OutlookBaseResource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Get file name before deletion
            file_info = self.make_graph_request(
                access_token, f"/me/drive/items/{file_id}"
            )
            file_name = (
                file_info.get("name", "Unknown file") if file_info else "Unknown file"
            )

            # Delete file
            result = self.make_graph_request(
                access_token, f"/me/drive/items/{file_id}", method="DELETE"
            )

            if result is not None:  # DELETE returns empty response on success
                return {
                    "status": 1,
                    "message": f"File '{file_name}' deleted successfully",
                    "payload": {},
                }
            else:
                return {
                    "status": 0,
                    "message": f"Failed to delete file '{file_name}'",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to delete file: {str(e)}",
                "payload": {},
            }


class CreateOutlookFolder(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_name = data.get("name")
            parent_id = data.get("parentId", "root")

            if not folder_name:
                return {"status": 0, "message": "Folder name required", "payload": {}}

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Build endpoint
            if parent_id == "root":
                endpoint = "/me/drive/root/children"
            else:
                endpoint = f"/me/drive/items/{parent_id}/children"

            # Create folder
            folder_data = {
                "name": folder_name,
                "folder": {},
                "@microsoft.graph.conflictBehavior": "rename",
            }

            result = self.make_graph_request(
                access_token, endpoint, method="POST", data=folder_data
            )

            if result:
                return {
                    "status": 1,
                    "message": f"Folder '{folder_name}' created successfully",
                    "payload": {"folder": result},
                }
            else:
                return {
                    "status": 0,
                    "message": f"Failed to create folder '{folder_name}'",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to create folder: {str(e)}",
                "payload": {},
            }


class ShareOutlookFile(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            email = data.get("email")
            role = data.get("role", "read")  # read, write

            if not file_id or not email:
                return {
                    "status": 0,
                    "message": "File ID and email required",
                    "payload": {},
                }

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Get file name for response
            file_info = self.make_graph_request(
                access_token, f"/me/drive/items/{file_id}"
            )
            file_name = (
                file_info.get("name", "Unknown file") if file_info else "Unknown file"
            )

            # Create sharing invitation
            share_data = {
                "recipients": [{"email": email}],
                "message": f"I've shared '{file_name}' with you.",
                "requireSignIn": True,
                "sendInvitation": True,
                "roles": [role],
            }

            result = self.make_graph_request(
                access_token,
                f"/me/drive/items/{file_id}/invite",
                method="POST",
                data=share_data,
            )

            if result:
                return {
                    "status": 1,
                    "message": f"File '{file_name}' shared successfully with {email}",
                    "payload": {
                        "shared_with": email,
                        "role": role,
                        "file_name": file_name,
                    },
                }
            else:
                return {
                    "status": 0,
                    "message": f"Failed to share file '{file_name}'",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to share file: {str(e)}",
                "payload": {},
            }


class BulkDownloadOutlookFiles(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])

            if not file_ids:
                return {"status": 0, "message": "File IDs required", "payload": {}}

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Create a zip file in memory
            zip_buffer = io.BytesIO()

            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for file_id in file_ids:
                    try:
                        # Get file metadata
                        file_info = self.make_graph_request(
                            access_token, f"/me/drive/items/{file_id}"
                        )
                        if not file_info:
                            continue

                        file_name = file_info["name"]
                        download_url = file_info.get("@microsoft.graph.downloadUrl")

                        if not download_url:
                            continue

                        # Download file content
                        response = requests.get(download_url)
                        if response.status_code == 200:
                            zip_file.writestr(file_name, response.content)

                    except Exception as e:
                        print(f"Error downloading file {file_id}: {str(e)}")
                        continue

            zip_buffer.seek(0)

            return send_file(
                zip_buffer,
                as_attachment=True,
                download_name="bulk_download.zip",
                mimetype="application/zip",
            )

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk download files: {str(e)}",
                "payload": {},
            }


class BulkDeleteOutlookFiles(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])

            if not file_ids:
                return {"status": 0, "message": "File IDs required", "payload": {}}

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            deleted_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get file name before deletion
                    file_info = self.make_graph_request(
                        access_token, f"/me/drive/items/{file_id}"
                    )
                    file_name = (
                        file_info.get("name", "Unknown file")
                        if file_info
                        else "Unknown file"
                    )

                    # Delete file
                    result = self.make_graph_request(
                        access_token, f"/me/drive/items/{file_id}", method="DELETE"
                    )

                    if result is not None:
                        deleted_files.append({"id": file_id, "name": file_name})
                    else:
                        errors.append({"id": file_id, "error": "Failed to delete"})

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

            return {
                "status": 1,
                "message": f"Bulk delete completed. {len(deleted_files)} files deleted, {len(errors)} errors",
                "payload": {
                    "deleted_files": deleted_files,
                    "errors": errors,
                    "success_count": len(deleted_files),
                    "error_count": len(errors),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk delete files: {str(e)}",
                "payload": {},
            }


class BulkMoveOutlookFiles(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])
            target_folder_id = data.get("targetFolderId")

            if not file_ids or not target_folder_id:
                return {
                    "status": 0,
                    "message": "File IDs and target folder ID required",
                    "payload": {},
                }

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            moved_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get file name for response
                    file_info = self.make_graph_request(
                        access_token, f"/me/drive/items/{file_id}"
                    )
                    file_name = (
                        file_info.get("name", "Unknown file")
                        if file_info
                        else "Unknown file"
                    )

                    # Move file
                    if target_folder_id == "root":
                        move_data = {"parentReference": {"path": "/drive/root"}}
                    else:
                        move_data = {"parentReference": {"id": target_folder_id}}

                    result = self.make_graph_request(
                        access_token,
                        f"/me/drive/items/{file_id}",
                        method="PATCH",
                        data=move_data,
                    )

                    if result:
                        moved_files.append({"id": file_id, "name": file_name})
                    else:
                        errors.append({"id": file_id, "error": "Failed to move"})

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

            return {
                "status": 1,
                "message": f"Bulk move completed. {len(moved_files)} files moved, {len(errors)} errors",
                "payload": {
                    "moved_files": moved_files,
                    "errors": errors,
                    "success_count": len(moved_files),
                    "error_count": len(errors),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk move files: {str(e)}",
                "payload": {},
            }


class BulkCopyOutlookFiles(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])
            target_folder_id = data.get("targetFolderId")

            if not file_ids or not target_folder_id:
                return {
                    "status": 0,
                    "message": "File IDs and target folder ID required",
                    "payload": {},
                }

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            copied_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get original file metadata
                    original_file = self.make_graph_request(
                        access_token, f"/me/drive/items/{file_id}"
                    )
                    if not original_file:
                        errors.append({"id": file_id, "error": "File not found"})
                        continue

                    original_name = original_file["name"]

                    # Prepare copy data
                    copy_data = {"name": f"Copy of {original_name}"}
                    if target_folder_id != "root":
                        copy_data["parentReference"] = {"id": target_folder_id}
                    else:
                        copy_data["parentReference"] = {"path": "/drive/root"}

                    result = self.make_graph_request(
                        access_token,
                        f"/me/drive/items/{file_id}/copy",
                        method="POST",
                        data=copy_data,
                    )

                    if result:
                        copied_files.append(
                            {
                                "original_id": file_id,
                                "name": f"Copy of {original_name}",
                            }
                        )
                    else:
                        errors.append({"id": file_id, "error": "Failed to copy"})

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

            return {
                "status": 1,
                "message": f"Bulk copy completed. {len(copied_files)} files copied, {len(errors)} errors",
                "payload": {
                    "copied_files": copied_files,
                    "errors": errors,
                    "success_count": len(copied_files),
                    "error_count": len(errors),
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk copy files: {str(e)}",
                "payload": {},
            }


class BulkShareOutlookFiles(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_ids = data.get("fileIds", [])
            email = data.get("email")
            role = data.get("role", "read")

            if not file_ids or not email:
                return {
                    "status": 0,
                    "message": "File IDs and email required",
                    "payload": {},
                }

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            shared_files = []
            errors = []

            for file_id in file_ids:
                try:
                    # Get file name
                    file_info = self.make_graph_request(
                        access_token, f"/me/drive/items/{file_id}"
                    )
                    file_name = (
                        file_info.get("name", "Unknown file")
                        if file_info
                        else "Unknown file"
                    )

                    # Create sharing invitation
                    share_data = {
                        "recipients": [{"email": email}],
                        "message": f"I've shared '{file_name}' with you.",
                        "requireSignIn": True,
                        "sendInvitation": True,
                        "roles": [role],
                    }

                    result = self.make_graph_request(
                        access_token,
                        f"/me/drive/items/{file_id}/invite",
                        method="POST",
                        data=share_data,
                    )

                    if result:
                        shared_files.append({"id": file_id, "name": file_name})
                    else:
                        errors.append({"id": file_id, "error": "Failed to share"})

                except Exception as e:
                    errors.append({"id": file_id, "error": str(e)})

            return {
                "status": 1,
                "message": f"Bulk share completed. {len(shared_files)} files shared, {len(errors)} errors",
                "payload": {
                    "shared_files": shared_files,
                    "errors": errors,
                    "success_count": len(shared_files),
                    "error_count": len(errors),
                    "shared_with": email,
                    "role": role,
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to bulk share files: {str(e)}",
                "payload": {},
            }


class RenameOutlookFile(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            new_name = data.get("newName")

            if not file_id or not new_name:
                return {
                    "status": 0,
                    "message": "File ID and new name required",
                    "payload": {},
                }

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Rename file
            rename_data = {"name": new_name}
            result = self.make_graph_request(
                access_token,
                f"/me/drive/items/{file_id}",
                method="PATCH",
                data=rename_data,
            )

            if result:
                return {
                    "status": 1,
                    "message": f"File renamed to '{new_name}' successfully",
                    "payload": {"file": result},
                }
            else:
                return {
                    "status": 0,
                    "message": f"Failed to rename file to '{new_name}'",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to rename file: {str(e)}",
                "payload": {},
            }


class MoveOutlookFile(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            target_folder_id = data.get("targetFolderId")

            if not file_id or not target_folder_id:
                return {
                    "status": 0,
                    "message": "File ID and target folder ID required",
                    "payload": {},
                }

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Get file name for response
            file_info = self.make_graph_request(
                access_token, f"/me/drive/items/{file_id}"
            )
            file_name = (
                file_info.get("name", "Unknown file") if file_info else "Unknown file"
            )

            # Move file
            if target_folder_id == "root":
                move_data = {"parentReference": {"path": "/drive/root"}}
            else:
                move_data = {"parentReference": {"id": target_folder_id}}

            result = self.make_graph_request(
                access_token,
                f"/me/drive/items/{file_id}",
                method="PATCH",
                data=move_data,
            )

            if result:
                return {
                    "status": 1,
                    "message": f"File '{file_name}' moved successfully",
                    "payload": {"file": result},
                }
            else:
                return {
                    "status": 0,
                    "message": f"Failed to move file '{file_name}'",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to move file: {str(e)}",
                "payload": {},
            }


class CopyOutlookFile(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            parent_id = data.get("parentId")
            name = data.get("name")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            access_token = self.get_user_credentials(uid)
            if not access_token:
                return {
                    "status": 0,
                    "message": "Outlook not connected or token expired",
                    "payload": {},
                }

            # Get original file name if no name provided
            if not name:
                file_info = self.make_graph_request(
                    access_token, f"/me/drive/items/{file_id}"
                )
                original_name = (
                    file_info.get("name", "Unknown file")
                    if file_info
                    else "Unknown file"
                )
                name = f"Copy of {original_name}"

            # Prepare copy data
            copy_data = {"name": name}
            if parent_id and parent_id != "root":
                copy_data["parentReference"] = {"id": parent_id}
            else:
                copy_data["parentReference"] = {"path": "/drive/root"}

            result = self.make_graph_request(
                access_token,
                f"/me/drive/items/{file_id}/copy",
                method="POST",
                data=copy_data,
            )

            if result:
                return {
                    "status": 1,
                    "message": f"File copied successfully as '{name}'",
                    "payload": {"file": result},
                }
            else:
                return {
                    "status": 0,
                    "message": f"Failed to copy file as '{name}'",
                    "payload": {},
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to copy file: {str(e)}",
                "payload": {},
            }


class GetOutlookStorage(OutlookBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        """Get storage information for all connected Outlook accounts"""
        try:
            # Get all Outlook accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    # "provider": "outlook",
                    # "is_active": Status.ACTIVE.value,
                },
                select_fields=["email", "user_object"],
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Outlook accounts connected.",
                    "payload": {
                        "storage_info": [],
                        "total_storage": {"used": 0, "limit": 0},
                    },
                }

            storage_info = []
            total_used = 0
            total_limit = 0

            for account in all_accounts:
                email = account.get("email")

                try:
                    access_token = self.get_user_credentials_for_account(uid, email)
                    if not access_token:
                        continue

                    # Get storage info
                    drive_info = self.make_graph_request(access_token, "/me/drive")
                    user_info = self.make_graph_request(access_token, "/me")

                    if not drive_info or not user_info:
                        continue

                    quota = drive_info.get("quota", {})
                    used = quota.get("used", 0)
                    total = quota.get("total", 0)

                    storage_info.append(
                        {
                            "email": email,
                            "displayName": user_info.get(
                                "displayName", email.split("@")[0]
                            ),
                            "photoLink": user_info.get("photo", {}).get(
                                "@odata.mediaReadUrl", ""
                            ),
                            "used": used,
                            "limit": total,
                            "usage_percentage": (
                                round((used / total * 100), 2) if total > 0 else 0
                            ),
                            "used_formatted": self.format_bytes(used),
                            "limit_formatted": self.format_bytes(total),
                        }
                    )

                    total_used += used
                    total_limit += total

                except Exception as e:
                    print(f"Error getting storage info for {email}: {str(e)}")
                    continue

            return {
                "status": 1,
                "message": f"Storage information retrieved for {len(storage_info)} accounts",
                "payload": {
                    "storage_info": storage_info,
                    "total_storage": {
                        "used": total_used,
                        "limit": total_limit,
                        "usage_percentage": (
                            round((total_used / total_limit * 100), 2)
                            if total_limit > 0
                            else 0
                        ),
                        "used_formatted": self.format_bytes(total_used),
                        "limit_formatted": self.format_bytes(total_limit),
                    },
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get storage info: {str(e)}",
                "payload": {
                    "storage_info": [],
                    "total_storage": {"used": 0, "limit": 0},
                },
            }
