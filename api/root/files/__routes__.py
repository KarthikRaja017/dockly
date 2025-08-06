# Update routes to include all the new Outlook endpoints

from .outlook import (
    CreateOutlookFolder,
    DeleteOutlookFile,
    ListOutlookFiles,
    # ShareOutlookFile,
    UploadOutlookFile,
)
from .models import (
    AdvancedSearch,
    # BulkCopyFiles,
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

# Google Drive endpoints
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

# google_drive_api.add_resource(ListOutlookFiles, "/outlook/files")
# google_drive_api.add_resource(UploadOutlookFile, "/outlook/upload")
# google_drive_api.add_resource(DownloadOutlookFile, "/outlook/download")
# google_drive_api.add_resource(DeleteOutlookFile, "/outlook/delete")
# google_drive_api.add_resource(CreateOutlookFolder, "/outlook/folder/create")
# google_drive_api.add_resource(ShareOutlookFile, "/outlook/share")
# google_drive_api.add_resource(GetOutlookFileInfo, "/outlook/file/<string:file_id>")
# google_drive_api.add_resource(GetOutlookStorage, "/outlook/storage")

# # File Operations
# google_drive_api.add_resource(RenameOutlookFile, "/outlook/rename")
# google_drive_api.add_resource(CopyOutlookFile, "/outlook/copy")
# google_drive_api.add_resource(MoveOutlookFile, "/outlook/move")
google_drive_api.add_resource(ListOutlookFiles, "/outlook/files")
google_drive_api.add_resource(UploadOutlookFile, "/outlook/upload")
# google_drive_api.add_resource(DownloadOutlookFile, "/outlook/download")
google_drive_api.add_resource(DeleteOutlookFile, "/outlook/delete")
google_drive_api.add_resource(CreateOutlookFolder, "/outlook/folder/create")
# google_drive_api.add_resource(ShareOutlookFile, "/outlook/share")
