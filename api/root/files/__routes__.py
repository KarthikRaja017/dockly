from .models import (
    AdvancedSearch,
    BulkCopyFiles,
    BulkDeleteFiles,
    BulkDownloadFiles,
    BulkMoveFiles,
    BulkShareFiles,
    CopyDriveFile,
    FindDuplicateFiles,
    GetActivityLog,
    GetStorageAnalytics,
    ListDriveFiles,
    LogActivity,
    MoveDriveFile,
    RenameDriveFile,
    StarDriveFile,
    UploadDriveFile,
    DownloadDriveFile,
    DeleteDriveFile,
    CreateDriveFolder,
    ShareDriveFile,
    GetDriveFileInfo,
    GetDriveStorage,
)
from . import google_drive_api

google_drive_api.add_resource(ListDriveFiles, "/files")
google_drive_api.add_resource(UploadDriveFile, "/upload")
google_drive_api.add_resource(DownloadDriveFile, "/download")
google_drive_api.add_resource(DeleteDriveFile, "/delete")
google_drive_api.add_resource(CreateDriveFolder, "/folder/create")
google_drive_api.add_resource(ShareDriveFile, "/share")
google_drive_api.add_resource(GetDriveFileInfo, "/file/<string:file_id>")
google_drive_api.add_resource(GetDriveStorage, "/storage")

# Bulk Operations
google_drive_api.add_resource(BulkDownloadFiles, "/bulk/download")
google_drive_api.add_resource(BulkDeleteFiles, "/bulk/delete")
google_drive_api.add_resource(BulkMoveFiles, "/bulk/move")
google_drive_api.add_resource(BulkCopyFiles, "/bulk/copy")
google_drive_api.add_resource(BulkShareFiles, "/bulk/share")

# File Operations
google_drive_api.add_resource(RenameDriveFile, "/rename")
google_drive_api.add_resource(CopyDriveFile, "/copy")
google_drive_api.add_resource(MoveDriveFile, "/move")
google_drive_api.add_resource(StarDriveFile, "/star")

# Advanced Search
google_drive_api.add_resource(AdvancedSearch, "/search/advanced")

# Duplicate Detection
google_drive_api.add_resource(FindDuplicateFiles, "/duplicates/find")

# Storage Analytics
google_drive_api.add_resource(GetStorageAnalytics, "/analytics/storage")

# Activity Tracking
google_drive_api.add_resource(GetActivityLog, "/activity")
google_drive_api.add_resource(LogActivity, "/activity/log")
