import os
import json
import traceback
import requests
from datetime import datetime, timedelta
from flask import Request, request, jsonify, send_file
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload
from google.oauth2.credentials import Credentials
import io

from root.auth.auth import auth_required
from root.common import Status
from root.config import CLIENT_ID, CLIENT_SECRET, SCOPE
from root.db.dbHelper import DBHelper
from google.auth.exceptions import RefreshError

# from root.utils import auth_required
# from root.utils.status import Status


class DriveBaseResource(Resource):
    """Base class for Google Drive operations"""

    def get_user_credentials(self, user_id):
        """Get user's Google credentials from database with proper error handling"""
        try:
            account = DBHelper.find_one(
                "connected_accounts",
                filters={
                    "user_id": user_id,
                    "provider": "google",
                    "is_active": Status.ACTIVE.value,
                },
            )

            if not account:
                return None

            access_token = account.get("access_token")
            refresh_token = account.get("refresh_token")
            expires_at = account.get("expires_at")

            if isinstance(expires_at, str):
                try:
                    expires_at = datetime.fromisoformat(expires_at)
                except ValueError:
                    expires_at = None

            # Create credentials with refresh info
            creds = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=CLIENT_ID,
                client_secret=CLIENT_SECRET,
                scopes=SCOPE.split(),
            )

            # Check if credentials need refresh
            if not creds.valid or creds.expired:
                try:
                    creds.refresh(Request())

                    # Update DB with new token if refresh succeeded
                    DBHelper.update_one(
                        "connected_accounts",
                        filters={"id": account["id"]},
                        updates={
                            "access_token": creds.token,
                            "expires_at": (
                                datetime.utcnow() + timedelta(seconds=3500)
                            ).isoformat(),
                        },
                    )
                    print(f"Token refreshed successfully for user {user_id}")

                except RefreshError as e:
                    print(f"Token refresh failed for user {user_id}: {e}")

                    # Mark the account inactive
                    DBHelper.update_one(
                        "connected_accounts",
                        filters={"id": account["id"]},
                        updates={"is_active": Status.REMOVED.value},
                    )
                    return None

            return creds

        except Exception as e:
            print(f"Error getting credentials for user {user_id}: {str(e)}")
            return None

    def get_drive_service(self, user_id):
        """Get Google Drive service with error handling"""
        try:
            credentials = self.get_user_credentials(user_id)
            if not credentials:
                return None

            return build("drive", "v3", credentials=credentials)
        except Exception as e:
            print(f"Error creating Drive service for user {user_id}: {str(e)}")
            return None


class ListDriveFiles(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_id = data.get("folderId", "root")
            sort_by = data.get("sortBy", "modifiedTime")
            sort_order = data.get("sortOrder", "desc")
            page_size = data.get("pageSize", 100)

            # Get all Google accounts for the user
            select_fields = [
                "access_token",
                "refresh_token",
                "email",
                "provider",
                "user_object",
            ]

            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "google",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=select_fields,
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Google Drive accounts connected.",
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

            for account in all_accounts:
                email = account.get("email")
                user_object = account.get("user_object")

                try:
                    user_object_data = json.loads(user_object) if user_object else {}
                except json.JSONDecodeError:
                    user_object_data = {}

                try:
                    service = self.get_drive_service(uid)
                    if not service:
                        errors.append(
                            {
                                "email": email,
                                "error": "Failed to create Drive service - token may be expired",
                            }
                        )
                        continue

                    # Build query
                    query = f"'{folder_id}' in parents and trashed=false"

                    # Sort mapping
                    sort_mapping = {
                        "name": "name",
                        "modifiedTime": "modifiedTime",
                        "size": "quotaBytesUsed",
                    }

                    order_by = f"{sort_mapping.get(sort_by, 'modifiedTime')} {'desc' if sort_order == 'desc' else ''}".strip()

                    # Get files from Drive
                    results = (
                        service.files()
                        .list(
                            q=query,
                            pageSize=page_size,
                            orderBy=order_by,
                            fields="nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webViewLink, webContentLink, owners, shared, starred, parents)",
                        )
                        .execute()
                    )

                    items = results.get("files", [])

                    # Process files and folders
                    account_files = []
                    account_folders = []

                    for item in items:
                        mime_type = item.get("mimeType", "")
                        is_folder = mime_type == "application/vnd.google-apps.folder"

                        base_info = {
                            "id": item.get("id"),
                            "name": item.get("name"),
                            "modifiedTime": item.get("modifiedTime"),
                            "shared": item.get("shared", False),
                            "parents": item.get("parents", []),
                            "source_email": email,
                            "account_name": user_object_data.get(
                                "name", email.split("@")[0]
                            ),
                        }

                        if is_folder:
                            account_folders.append(base_info)
                        else:
                            account_files.append(
                                {
                                    **base_info,
                                    "mimeType": mime_type,
                                    "size": (
                                        int(item.get("size", 0))
                                        if item.get("size")
                                        else None
                                    ),
                                    "createdTime": item.get("createdTime"),
                                    "thumbnailLink": item.get("thumbnailLink"),
                                    "webViewLink": item.get("webViewLink"),
                                    "webContentLink": item.get("webContentLink"),
                                    "owners": item.get("owners", []),
                                    "starred": item.get("starred", False),
                                    "trashed": False,
                                }
                            )

                    merged_files.extend(account_files)
                    merged_folders.extend(account_folders)

                    # Add to connected accounts
                    connected_accounts.append(
                        {
                            "email": email,
                            "provider": "google",
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
                        f"[GOOGLE DRIVE] {email}: {len(account_files)} files, {len(account_folders)} folders fetched"
                    )

                except Exception as e:
                    error_msg = str(e)
                    print(f"Error fetching Drive files for {email}: {error_msg}")
                    errors.append({"email": email, "error": error_msg})

                    # Mark token as inactive if it's an auth error
                    if any(
                        keyword in error_msg.lower()
                        for keyword in [
                            "invalid_grant",
                            "401",
                            "invalid_token",
                            "expired",
                        ]
                    ):
                        DBHelper.update_one(
                            table_name="connected_accounts",
                            filters={
                                "user_id": uid,
                                "email": email,
                                "provider": "google",
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

            return {
                "status": 1,
                "message": (
                    f"Retrieved {len(merged_files)} files and {len(merged_folders)} folders from Google Drive."
                    if (merged_files or merged_folders)
                    else "No files found."
                ),
                "payload": {
                    "files": merged_files,
                    "folders": merged_folders,
                    "connected_accounts": connected_accounts,
                    "errors": errors,
                    "nextPageToken": None,  # For future pagination support
                },
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to fetch Drive files: {str(e)}",
                "payload": {
                    "files": [],
                    "folders": [],
                    "connected_accounts": [],
                    "errors": [{"error": str(e)}],
                },
            }


class UploadDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            if "file" not in request.files:
                return {"status": 0, "message": "No file provided", "payload": {}}

            file = request.files["file"]
            parent_id = request.form.get("parentId", "root")

            if file.filename == "":
                return {"status": 0, "message": "No file selected", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Prepare file metadata
            file_metadata = {
                "name": secure_filename(file.filename),
                "parents": [parent_id] if parent_id != "root" else [],
            }

            # Create media upload
            media = MediaIoBaseUpload(
                io.BytesIO(file.read()),
                mimetype=file.content_type or "application/octet-stream",
                resumable=True,
            )

            # Upload file
            uploaded_file = (
                service.files()
                .create(
                    body=file_metadata,
                    media_body=media,
                    fields="id, name, mimeType, size, modifiedTime, webViewLink",
                )
                .execute()
            )

            return {
                "status": 1,
                "message": f"File '{file.filename}' uploaded successfully",
                "payload": {"file": uploaded_file},
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "status": 0,
                "message": f"Failed to upload file: {str(e)}",
                "payload": {},
            }


class DownloadDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file metadata
            file_metadata = service.files().get(fileId=file_id).execute()

            # Download file
            request_download = service.files().get_media(fileId=file_id)
            file_buffer = io.BytesIO()
            downloader = MediaIoBaseDownload(file_buffer, request_download)

            done = False
            while done is False:
                status, done = downloader.next_chunk()

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


class DeleteDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def delete(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")

            if not file_id:
                return {"status": 0, "message": "File ID required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file name before deletion
            try:
                file_metadata = (
                    service.files().get(fileId=file_id, fields="name").execute()
                )
                file_name = file_metadata.get("name", "Unknown file")
            except:
                file_name = "Unknown file"

            # Delete file (move to trash)
            service.files().delete(fileId=file_id).execute()

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


class CreateDriveFolder(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            folder_name = data.get("name")
            parent_id = data.get("parentId", "root")

            if not folder_name:
                return {"status": 0, "message": "Folder name required", "payload": {}}

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Create folder metadata
            folder_metadata = {
                "name": folder_name,
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [parent_id] if parent_id != "root" else [],
            }

            # Create folder
            folder = (
                service.files()
                .create(
                    body=folder_metadata, fields="id, name, modifiedTime, webViewLink"
                )
                .execute()
            )

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


class ShareDriveFile(DriveBaseResource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json() or {}
            file_id = data.get("fileId")
            email = data.get("email")
            role = data.get("role", "reader")  # reader, writer, commenter

            if not file_id or not email:
                return {
                    "status": 0,
                    "message": "File ID and email required",
                    "payload": {},
                }

            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file name for response
            try:
                file_metadata = (
                    service.files().get(fileId=file_id, fields="name").execute()
                )
                file_name = file_metadata.get("name", "Unknown file")
            except:
                file_name = "Unknown file"

            # Create permission
            permission = {"type": "user", "role": role, "emailAddress": email}

            # Share file
            service.permissions().create(
                fileId=file_id, body=permission, sendNotificationEmail=True
            ).execute()

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


class GetDriveFileInfo(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user, file_id):
        try:
            service = self.get_drive_service(uid)
            if not service:
                return {
                    "status": 0,
                    "message": "Google Drive not connected or token expired",
                    "payload": {},
                }

            # Get file info
            file_info = (
                service.files()
                .get(
                    fileId=file_id,
                    fields="id, name, mimeType, size, modifiedTime, createdTime, thumbnailLink, webViewLink, webContentLink, owners, shared, starred, parents, permissions",
                )
                .execute()
            )

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


class GetDriveStorage(DriveBaseResource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        """Get storage information for all connected Google accounts"""
        try:
            # Get all Google accounts for the user
            all_accounts = DBHelper.find(
                "connected_accounts",
                filters={
                    "user_id": uid,
                    "provider": "google",
                    "is_active": Status.ACTIVE.value,
                },
                select_fields=["email", "user_object"],
            )

            if not all_accounts:
                return {
                    "status": 0,
                    "message": "No Google Drive accounts connected.",
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
                    service = self.get_drive_service(uid)
                    if not service:
                        continue

                    # Get storage info
                    about = service.about().get(fields="storageQuota, user").execute()
                    storage_quota = about.get("storageQuota", {})
                    user_info = about.get("user", {})

                    used = int(storage_quota.get("usage", 0))
                    limit = int(storage_quota.get("limit", 0))

                    storage_info.append(
                        {
                            "email": email,
                            "displayName": user_info.get(
                                "displayName", email.split("@")[0]
                            ),
                            "photoLink": user_info.get("photoLink", ""),
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
