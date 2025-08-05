import os
import json
import traceback
import requests
from datetime import datetime, timedelta
from flask import Request, request, jsonify, send_file
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import io
import time

from root.microsoft.models import refresh_microsoft_token
from root.auth.auth import auth_required
from root.common import Status
from root.db.dbHelper import DBHelper

# Microsoft Graph API endpoints
GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"


class OutlookBaseResource(Resource):
    """Base class for Microsoft Outlook/OneDrive operations with improved error handling"""

    def get_user_credentials(self, user_id):
        """Get user's Microsoft credentials with comprehensive error handling and token refresh"""
        try:
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": user_id,
                    "provider": "outlook",
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account:
                print(f"❌ No active Outlook account found for user {user_id}")
                return None

            access_token = account.get("access_token")
            refresh_token = account.get("refresh_token")
            expires_at = account.get("expires_at")
            account_id = account.get("id")
            email = account.get("email")

            if not access_token or not refresh_token:
                print(f"❌ Missing tokens for user {user_id}")
                return None

            # Parse expiration time
            if isinstance(expires_at, str):
                try:
                    expires_at = datetime.fromisoformat(
                        expires_at.replace("Z", "+00:00")
                    )
                except ValueError as e:
                    print(f"⚠️  Invalid expires_at format: {expires_at}")
                    expires_at = datetime.utcnow() - timedelta(hours=1)  # Force refresh

            # Check if token needs refresh (with 5-minute buffer)
            current_time = datetime.utcnow()
            if expires_at and expires_at <= (current_time + timedelta(minutes=5)):
                print(f"🔄 Token expired/expiring for {email}, refreshing...")

                try:
                    new_tokens = refresh_microsoft_token(refresh_token)
                    if new_tokens and new_tokens.get("access_token"):
                        # Calculate new expiration with buffer
                        expires_in = new_tokens.get("expires_in", 3600)
                        new_expires_at = current_time + timedelta(
                            seconds=expires_in - 300
                        )

                        # Update database with new tokens
                        update_data = {
                            "access_token": new_tokens["access_token"],
                            "expires_at": new_expires_at.isoformat(),
                            "updated_at": current_time.isoformat(),
                        }

                        # Update refresh token if provided
                        if new_tokens.get("refresh_token"):
                            update_data["refresh_token"] = new_tokens["refresh_token"]

                        DBHelper.update_one(
                            "connected_accounts",
                            filters={"id": account_id},
                            updates=update_data,
                        )

                        access_token = new_tokens["access_token"]
                        print(f"✅ Token refreshed successfully for {email}")
                    else:
                        print(f"❌ Token refresh failed for {email}")
                        # Mark account as inactive
                        DBHelper.update_one(
                            "connected_accounts",
                            filters={"id": account_id},
                            updates={
                                "is_active": Status.REMOVED.value,
                                "updated_at": current_time.isoformat(),
                            },
                        )
                        return None

                except Exception as e:
                    print(f"❌ Token refresh error for {email}: {str(e)}")
                    # Mark account as inactive on refresh failure
                    DBHelper.update_one(
                        "connected_accounts",
                        filters={"id": account_id},
                        updates={
                            "is_active": Status.REMOVED.value,
                            "updated_at": current_time.isoformat(),
                        },
                    )
                    return None

            return access_token

        except Exception as e:
            print(f"❌ Error getting credentials for user {user_id}: {str(e)}")
            traceback.print_exc()
            return None

    def get_graph_headers(self, user_id):
        """Get Microsoft Graph API headers with valid token"""
        access_token = self.get_user_credentials(user_id)
        if not access_token:
            print(f"❌ No valid access token for user {user_id}")
            return None

        return {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def make_graph_request(
        self, user_id, method, endpoint, data=None, files=None, max_retries=3
    ):
        """Make a request to Microsoft Graph API with retry logic and better error handling"""

        for attempt in range(max_retries):
            try:
                headers = self.get_graph_headers(user_id)
                if not headers:
                    print(f"❌ Cannot get headers for user {user_id}")
                    return None

                url = f"{GRAPH_API_BASE}{endpoint}"

                # Remove Content-Type for file uploads
                if files:
                    headers.pop("Content-Type", None)

                print(
                    f"🌐 Making {method} request to: {endpoint} (attempt {attempt + 1})"
                )

                # Make the request based on method
                if method.upper() == "GET":
                    response = requests.get(url, headers=headers, timeout=45)
                elif method.upper() == "POST":
                    if files:
                        response = requests.post(
                            url, headers=headers, files=files, timeout=90
                        )
                    else:
                        response = requests.post(
                            url, headers=headers, json=data, timeout=45
                        )
                elif method.upper() == "PUT":
                    if files:
                        response = requests.put(
                            url, headers=headers, data=data, timeout=90
                        )
                    else:
                        response = requests.put(
                            url, headers=headers, json=data, timeout=45
                        )
                elif method.upper() == "DELETE":
                    response = requests.delete(url, headers=headers, timeout=45)
                elif method.upper() == "PATCH":
                    response = requests.patch(
                        url, headers=headers, json=data, timeout=45
                    )
                else:
                    print(f"❌ Unsupported HTTP method: {method}")
                    return None

                print(f"📊 Response status: {response.status_code}")

                # Log response content for debugging 400 errors
                if response.status_code == 400:
                    try:
                        error_content = response.json()
                        print(
                            f"🔍 400 Error details: {json.dumps(error_content, indent=2)}"
                        )
                    except:
                        print(f"🔍 400 Error text: {response.text[:500]}")

                # Handle successful responses
                if response.status_code in [200, 201, 202, 204]:
                    return response

                # Handle authentication errors
                elif response.status_code == 401:
                    print(f"⚠️  Authentication error (401) - attempt {attempt + 1}")
                    if attempt < max_retries - 1:
                        # Try to refresh token and retry
                        print("🔄 Attempting to refresh token...")
                        self.get_user_credentials(
                            user_id
                        )  # This will refresh if needed
                        time.sleep(1)
                        continue
                    else:
                        print("❌ Authentication failed after retries")
                        return response

                # Handle rate limiting
                elif response.status_code == 429:
                    retry_after = int(response.headers.get("Retry-After", 5))
                    print(f"⚠️  Rate limited. Waiting {retry_after} seconds...")
                    if attempt < max_retries - 1:
                        time.sleep(retry_after)
                        continue
                    else:
                        return response

                # Handle server errors with retry
                elif response.status_code >= 500:
                    print(
                        f"⚠️  Server error ({response.status_code}) - attempt {attempt + 1}"
                    )
                    if attempt < max_retries - 1:
                        time.sleep(2**attempt)  # Exponential backoff
                        continue
                    else:
                        return response

                # Handle other client errors (don't retry)
                else:
                    print(f"❌ Client error: {response.status_code}")
                    print(f"❌ Response: {response.text}")
                    return response

            except requests.exceptions.Timeout:
                print(f"⚠️  Request timeout - attempt {attempt + 1}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    print("❌ Request timed out after all retries")
                    return None

            except requests.exceptions.ConnectionError:
                print(f"⚠️  Connection error - attempt {attempt + 1}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                else:
                    print("❌ Connection failed after all retries")
                    return None

            except Exception as e:
                print(f"❌ Unexpected error in Graph API request: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
                else:
                    traceback.print_exc()
                    return None

        print("❌ All retry attempts exhausted")
        return None


class ListOutlookFiles(OutlookBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_id = data.get("folderId", "root")
            sort_by = data.get("sortBy", "lastModifiedDateTime")
            sort_order = data.get("sortOrder", "desc")
            page_size = min(data.get("pageSize", 100), 200)  # Limit page size

            print(f"📂 Listing files for user {uid}, folder: {folder_id}")

            # Get all active Outlook accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "outlook",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=[
                    "id",
                    "access_token",
                    "refresh_token",
                    "email",
                    "provider",
                    "user_object",
                    "expires_at",
                ],
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No active Outlook accounts connected.",
                    "payload": {
                        "files": [],
                        "folders": [],
                        "connected_accounts": [],
                        "errors": [],
                    },
                }

            merged_files = []
            merged_folders = []
            connected_accounts = []
            errors = []

            # Track processed files to avoid duplicates
            processed_file_ids = set()
            processed_folder_ids = set()

            for account in all_accounts:
                account_id = account.get("id")
                email = account.get("email")
                user_object = account.get("user_object")

                try:
                    user_object_data = json.loads(user_object) if user_object else {}
                except json.JSONDecodeError:
                    user_object_data = {}

                try:
                    print(f"📁 Fetching files for account: {email}")

                    # Build endpoint with proper parameters - handle personal vs business accounts
                    try:
                        # First try to get drive info to determine account type
                        drive_response = self.make_graph_request(
                            uid, "GET", "/me/drive"
                        )
                        if not drive_response or drive_response.status_code != 200:
                            # Try alternative endpoint for personal accounts
                            if folder_id == "root":
                                endpoint = "/me/drive/root/children"
                            else:
                                endpoint = f"/me/drive/items/{folder_id}/children"
                        else:
                            drive_info = drive_response.json()
                            drive_type = drive_info.get("driveType", "personal")

                            if drive_type == "personal":
                                # For personal OneDrive accounts
                                if folder_id == "root":
                                    endpoint = "/me/drive/root/children"
                                else:
                                    endpoint = f"/me/drive/items/{folder_id}/children"
                            else:
                                # For business OneDrive accounts
                                if folder_id == "root":
                                    endpoint = "/me/drive/root/children"
                                else:
                                    endpoint = f"/me/drive/items/{folder_id}/children"
                    except Exception as drive_error:
                        print(f"⚠️  Drive detection failed: {str(drive_error)}")
                        # Fallback to standard endpoint
                        if folder_id == "root":
                            endpoint = "/me/drive/root/children"
                        else:
                            endpoint = f"/me/drive/items/{folder_id}/children"

                    # Build query parameters
                    params = {
                        "$top": str(page_size),
                        "$orderby": f"{sort_by} {'desc' if sort_order == 'desc' else 'asc'}",
                        "$select": "id,name,size,lastModifiedDateTime,createdDateTime,webUrl,folder,file,shared,createdBy,lastModifiedBy,parentReference",
                    }

                    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
                    endpoint_with_params = f"{endpoint}?{query_string}"

                    # Make request to Graph API with retry for different endpoints
                    response = None
                    endpoints_to_try = [
                        endpoint_with_params,
                        (
                            f"/me/drive/root/children?{query_string}"
                            if folder_id == "root"
                            else f"/me/drive/items/{folder_id}/children?{query_string}"
                        ),
                    ]

                    for attempt_endpoint in endpoints_to_try:
                        print(f"🔄 Trying endpoint: {attempt_endpoint}")
                        response = self.make_graph_request(uid, "GET", attempt_endpoint)

                        if response and response.status_code == 200:
                            print(f"✅ Success with endpoint: {attempt_endpoint}")
                            break
                        elif response and response.status_code == 400:
                            error_data = {}
                            try:
                                error_data = response.json()
                            except:
                                pass

                            error_code = error_data.get("error", {}).get("code", "")
                            if error_code == "notSupported":
                                print(
                                    f"⚠️  Endpoint not supported, trying next: {attempt_endpoint}"
                                )
                                continue
                            else:
                                print(f"❌ Different error: {error_code}")
                                break
                        else:
                            print(
                                f"⚠️  Failed with status {response.status_code if response else 'No response'}"
                            )
                            continue

                    if not response:
                        error_msg = "No response from Microsoft Graph API"
                        print(f"❌ {error_msg} for {email}")
                        errors.append({"email": email, "error": error_msg})
                        continue

                    if response.status_code != 200:
                        error_msg = f"API error: {response.status_code}"
                        if response.content:
                            try:
                                error_data = response.json()
                                error_msg += f" - {error_data.get('error', {}).get('message', response.text)}"
                            except:
                                error_msg += f" - {response.text[:200]}"

                        print(f"❌ {error_msg} for {email}")
                        errors.append({"email": email, "error": error_msg})

                        # Mark account as inactive if it's an auth error
                        if response.status_code == 401:
                            DBHelper.update_one(
                                "connected_accounts",
                                filters={"id": account_id},
                                updates={
                                    "is_active": Status.REMOVED.value,
                                    "updated_at": datetime.utcnow().isoformat(),
                                },
                            )
                        continue

                    result = response.json()
                    items = result.get("value", [])

                    print(f"✅ Retrieved {len(items)} items for {email}")

                    # Process files and folders
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
                                "name", email.split("@")[0]
                            ),
                        }

                        if is_folder:
                            account_folders.append(
                                {
                                    **base_info,
                                    "owners": [
                                        {
                                            "displayName": item.get("createdBy", {})
                                            .get("user", {})
                                            .get("displayName", "Unknown"),
                                            "emailAddress": email,
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
                                    "thumbnailLink": None,
                                    "webViewLink": item.get("webUrl"),
                                    "webContentLink": item.get(
                                        "@microsoft.graph.downloadUrl"
                                    )
                                    or item.get("@content.downloadUrl"),
                                    "owners": [
                                        {
                                            "displayName": item.get("createdBy", {})
                                            .get("user", {})
                                            .get("displayName", "Unknown"),
                                            "emailAddress": email,
                                        }
                                    ],
                                    "starred": False,
                                    "trashed": False,
                                }
                            )

                    merged_files.extend(account_files)
                    merged_folders.extend(account_folders)

                    # Add to connected accounts
                    connected_accounts.append(
                        {
                            "email": email,
                            "provider": "outlook",
                            "userName": user_object_data.get(
                                "name", email.split("@")[0]
                            ),
                            "displayName": user_object_data.get(
                                "name", email.split("@")[0]
                            ),
                            "picture": user_object_data.get("picture", ""),
                            "files_count": len(account_files),
                            "folders_count": len(account_folders),
                        }
                    )

                    print(
                        f"✅ {email}: {len(account_files)} files, {len(account_folders)} folders processed"
                    )

                except Exception as e:
                    error_msg = str(e)
                    print(f"❌ Error processing account {email}: {error_msg}")
                    traceback.print_exc()
                    errors.append({"email": email, "error": error_msg})

            # Sort merged results
            try:
                merged_files.sort(
                    key=lambda f: f.get("modifiedTime", "1900-01-01T00:00:00Z"),
                    reverse=(sort_order == "desc"),
                )
                merged_folders.sort(
                    key=lambda f: f.get("modifiedTime", "1900-01-01T00:00:00Z"),
                    reverse=(sort_order == "desc"),
                )
            except Exception as e:
                print(f"⚠️  Error sorting results: {str(e)}")

            total_items = len(merged_files) + len(merged_folders)
            print(
                f"✅ Final result: {len(merged_files)} files, {len(merged_folders)} folders from {len(connected_accounts)} accounts"
            )

            return {
                "status": 1,
                "message": (
                    f"Retrieved {total_items} items from {len(connected_accounts)} Outlook accounts."
                    if total_items > 0
                    else "No files found in connected Outlook accounts."
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
            print(f"❌ Failed to fetch Outlook files: {str(e)}")
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


# Continue with other classes following the same improved pattern...
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

            # Secure filename
            filename = secure_filename(file.filename)
            if not filename:
                filename = "uploaded_file"

            print(f"📤 Uploading file: {filename} to folder: {parent_id}")

            # Build upload endpoint - try multiple approaches
            endpoints_to_try = []

            if parent_id == "root":
                endpoints_to_try = [
                    f"/me/drive/root:/{filename}:/content",
                    f"/me/drive/root/children/{filename}/content",
                ]
            else:
                endpoints_to_try = [
                    f"/me/drive/items/{parent_id}:/{filename}:/content",
                    f"/me/drive/items/{parent_id}/children/{filename}/content",
                ]

            # Read file data
            file_data = file.read()
            if not file_data:
                return {"status": 0, "message": "File is empty", "payload": {}}

            # Try uploading with different endpoints
            response = None
            for endpoint in endpoints_to_try:
                print(f"🔄 Trying upload endpoint: {endpoint}")
                response = self.make_graph_request(uid, "PUT", endpoint, data=file_data)

                if response and response.status_code in [200, 201]:
                    print(f"✅ Upload successful with endpoint: {endpoint}")
                    break
                elif response and response.status_code == 400:
                    try:
                        error_data = response.json()
                        error_code = error_data.get("error", {}).get("code", "")
                        if error_code == "notSupported":
                            print(
                                f"⚠️  Upload endpoint not supported, trying next: {endpoint}"
                            )
                            continue
                    except:
                        pass
                    break
                else:
                    print(
                        f"⚠️  Upload failed with status {response.status_code if response else 'No response'}"
                    )
                    continue

            if not response or response.status_code not in [200, 201]:
                error_msg = "Upload failed"
                if response:
                    error_msg += f" - Status: {response.status_code}"
                    if response.content:
                        try:
                            error_data = response.json()
                            error_msg += f" - {error_data.get('error', {}).get('message', response.text[:200])}"
                        except:
                            error_msg += f" - {response.text[:200]}"

                print(f"❌ {error_msg}")
                return {"status": 0, "message": error_msg, "payload": {}}

            uploaded_file = response.json()
            print(f"✅ File uploaded successfully: {filename}")

            return {
                "status": 1,
                "message": f"File '{filename}' uploaded successfully",
                "payload": {"file": uploaded_file},
            }

        except Exception as e:
            print(f"❌ Upload error: {str(e)}")
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

            # Get file metadata first
            metadata_response = self.make_graph_request(
                uid, "GET", f"/me/drive/items/{file_id}"
            )
            if not metadata_response or metadata_response.status_code != 200:
                return {
                    "status": 0,
                    "message": "Failed to get file metadata",
                    "payload": {},
                }

            file_metadata = metadata_response.json()

            # Download file content
            download_response = self.make_graph_request(
                uid, "GET", f"/me/drive/items/{file_id}/content"
            )
            if not download_response or download_response.status_code != 200:
                return {
                    "status": 0,
                    "message": "Failed to download file",
                    "payload": {},
                }

            file_buffer = io.BytesIO(download_response.content)
            file_buffer.seek(0)

            return send_file(
                file_buffer,
                as_attachment=True,
                download_name=file_metadata["name"],
                mimetype="application/octet-stream",
            )

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

            # Get file name before deletion
            metadata_response = self.make_graph_request(
                uid, "GET", f"/me/drive/items/{file_id}"
            )
            if metadata_response and metadata_response.status_code == 200:
                file_metadata = metadata_response.json()
                file_name = file_metadata.get("name", "Unknown file")
            else:
                file_name = "Unknown file"

            # Delete file
            response = self.make_graph_request(
                uid, "DELETE", f"/me/drive/items/{file_id}"
            )

            if not response or response.status_code not in [200, 204]:
                return {
                    "status": 0,
                    "message": f"Failed to delete file: {response.text if response else 'No response'}",
                    "payload": {},
                }

            return {
                "status": 1,
                "message": f"File '{file_name}' deleted successfully",
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

            # Build endpoint
            if parent_id == "root":
                endpoint = "/me/drive/root/children"
            else:
                endpoint = f"/me/drive/items/{parent_id}/children"

            folder_data = {
                "name": folder_name,
                "folder": {},
                "@microsoft.graph.conflictBehavior": "rename",
            }

            # Create folder
            response = self.make_graph_request(uid, "POST", endpoint, data=folder_data)

            if not response or response.status_code not in [200, 201]:
                return {
                    "status": 0,
                    "message": f"Failed to create folder: {response.text if response else 'No response'}",
                    "payload": {},
                }

            folder = response.json()

            return {
                "status": 1,
                "message": f"Folder '{folder_name}' created successfully",
                "payload": {"folder": folder},
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

            # Get file name
            metadata_response = self.make_graph_request(
                uid, "GET", f"/me/drive/items/{file_id}"
            )
            if metadata_response and metadata_response.status_code == 200:
                file_metadata = metadata_response.json()
                file_name = file_metadata.get("name", "Unknown file")
            else:
                file_name = "Unknown file"

            # Create sharing invitation
            share_data = {
                "recipients": [{"email": email}],
                "message": f"File '{file_name}' has been shared with you.",
                "requireSignIn": True,
                "sendInvitation": True,
                "roles": [role],
            }

            response = self.make_graph_request(
                uid, "POST", f"/me/drive/items/{file_id}/invite", data=share_data
            )

            if not response or response.status_code not in [200, 201]:
                return {
                    "status": 0,
                    "message": f"Failed to share file: {response.text if response else 'No response'}",
                    "payload": {},
                }

            return {
                "status": 1,
                "message": f"File '{file_name}' shared successfully with {email}",
                "payload": {"shared_with": email, "role": role, "file_name": file_name},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to share file: {str(e)}",
                "payload": {},
            }


class GetOutlookFileInfo(OutlookBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user, file_id):
        try:
            response = self.make_graph_request(uid, "GET", f"/me/drive/items/{file_id}")

            if not response or response.status_code != 200:
                return {
                    "status": 0,
                    "message": f"Failed to get file info: {response.text if response else 'No response'}",
                    "payload": {},
                }

            file_info = response.json()

            return {
                "status": 1,
                "message": "File information retrieved successfully",
                "payload": {"file": file_info},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to get file info: {str(e)}",
                "payload": {},
            }


class GetOutlookStorage(OutlookBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        try:
            # Get all Outlook accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "outlook",
                    "is_active": Status.ACTIVE.value,
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
                    # Get storage info from OneDrive
                    response = self.make_graph_request(uid, "GET", "/me/drive")
                    if not response or response.status_code != 200:
                        continue

                    drive_info = response.json()
                    quota = drive_info.get("quota", {})

                    used = quota.get("used", 0)
                    limit = quota.get("total", 0)

                    try:
                        user_object_data = json.loads(account.get("user_object", "{}"))
                    except json.JSONDecodeError:
                        user_object_data = {}

                    storage_info.append(
                        {
                            "email": email,
                            "displayName": user_object_data.get(
                                "name", email.split("@")[0]
                            ),
                            "photoLink": user_object_data.get("picture", ""),
                            "used": used,
                            "limit": limit,
                            "usage_percentage": (
                                round((used / limit * 100), 2) if limit > 0 else 0
                            ),
                            "used_formatted": self.format_bytes(used),
                            "limit_formatted": self.format_bytes(limit),
                        }
                    )

                    total_used += used
                    total_limit += limit

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


# Additional Outlook operations (rename, copy, move)
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

            rename_data = {"name": new_name}
            response = self.make_graph_request(
                uid, "PATCH", f"/me/drive/items/{file_id}", data=rename_data
            )

            if not response or response.status_code != 200:
                return {
                    "status": 0,
                    "message": f"Failed to rename file: {response.text if response else 'No response'}",
                    "payload": {},
                }

            updated_file = response.json()

            return {
                "status": 1,
                "message": f"File renamed to '{new_name}' successfully",
                "payload": {"file": updated_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to rename file: {str(e)}",
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

            # Get original file name if no name provided
            if not name:
                metadata_response = self.make_graph_request(
                    uid, "GET", f"/me/drive/items/{file_id}"
                )
                if metadata_response and metadata_response.status_code == 200:
                    original_file = metadata_response.json()
                    name = f"Copy of {original_file['name']}"
                else:
                    name = "Copy of file"

            # Prepare copy data
            copy_data = {"name": name}
            if parent_id and parent_id != "root":
                copy_data["parentReference"] = {"id": parent_id}

            response = self.make_graph_request(
                uid, "POST", f"/me/drive/items/{file_id}/copy", data=copy_data
            )

            if not response or response.status_code not in [200, 202]:
                return {
                    "status": 0,
                    "message": f"Failed to copy file: {response.text if response else 'No response'}",
                    "payload": {},
                }

            return {
                "status": 1,
                "message": f"File copied successfully as '{name}'",
                "payload": {"message": "Copy operation initiated"},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to copy file: {str(e)}",
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

            # Get file name
            metadata_response = self.make_graph_request(
                uid, "GET", f"/me/drive/items/{file_id}"
            )
            if metadata_response and metadata_response.status_code == 200:
                file_metadata = metadata_response.json()
                file_name = file_metadata.get("name", "Unknown file")
            else:
                file_name = "Unknown file"

            # Move file
            move_data = {
                "parentReference": {
                    "id": target_folder_id if target_folder_id != "root" else "root"
                }
            }

            response = self.make_graph_request(
                uid, "PATCH", f"/me/drive/items/{file_id}", data=move_data
            )

            if not response or response.status_code != 200:
                return {
                    "status": 0,
                    "message": f"Failed to move file: {response.text if response else 'No response'}",
                    "payload": {},
                }

            updated_file = response.json()

            return {
                "status": 1,
                "message": f"File '{file_name}' moved successfully",
                "payload": {"file": updated_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to move file: {str(e)}",
                "payload": {},
            }
