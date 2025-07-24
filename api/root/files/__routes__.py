from .models import (
    ListDriveFiles,
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
