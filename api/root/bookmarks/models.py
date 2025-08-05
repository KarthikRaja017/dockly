from email.message import EmailMessage
import smtplib
import uuid
from flask import request
from flask_restful import Resource
import time

from root.db.dbHelper import DBHelper
from root.config import EMAIL_PASSWORD, EMAIL_SENDER, SMTP_PORT, SMTP_SERVER, WEB_URL


class SaveBookmarks(Resource):
    def post(self):
        data = request.get_json()
        uid = data.get("uid")
        bookmark = data.get("bookmarks")[0]

        bookmark_id = f"{int(time.time()*1000)}_{uid}_{uuid.uuid4().hex[:6]}"

        bookmark_data = {
            "id": bookmark_id,
            "user_id": str(uid),
            "title": bookmark.get("title"),
            "url": bookmark.get("url"),
            "favicon": bookmark.get("favicon"),
            "category": "",
        }
        DBHelper.insert("bookmarks", **bookmark_data)

        return {
            "status": 1,
            "message": "Bookmark Saved successfully",
        }


class SaveAllBookmarks(Resource):
    def post(self):
        data = request.get_json()

        uid = data.get("uid")
        bookmarks = data.get("bookmarks")
        for bookmark in bookmarks:
            # Generate unique ID: timestamp + uid + random hex
            bookmark_id = f"{int(time.time()*1000)}_{uid}_{uuid.uuid4().hex[:6]}"

            bookmark_data = {
                "id": bookmark_id,
                "user_id": str(uid),
                "title": bookmark.get("title"),
                "url": bookmark.get("url"),
                "favicon": bookmark.get("favicon"),
                "category": "",
            }
            DBHelper.insert("bookmarks", **bookmark_data)

        return {
            "status": 1,
            "message": "Bookmarks saved successfully",
        }


class GetBookmarks(Resource):
    def get(self):
        uid = request.args.get("uid")  # ✅ use query param
        # print(f"uid: {uid}")

        if not uid:
            return {"status": 0, "message": "UID is required"}, 400

        bookmarks = DBHelper.find("bookmarks", {"uid": uid})

        return {
            "status": 1,
            "message": "Bookmarks fetched successfully",
            "bookmarks": bookmarks,
        }


# -------------------------------------------NEW-----------------------------------------------------

from root.auth.auth import auth_required
from datetime import datetime
from root.utilis import Status, uniqueId


class AddOrUpdateBookmark(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        if not data:
            return {"status": 0, "message": "Invalid input", "payload": {}}

        editing = data.get("editing")
        bookmark_id = data.get("id")

        if editing and bookmark_id:
            # If editing, use the given bookmark ID for update
            payload = {
                "title": data.get("title"),
                "url": data.get("url"),
                "description": data.get("description"),
                "favicon": data.get("favicon", ""),
                "category": data.get("category"),
                "tags": data.get("tags", []),
                "is_favorite": data.get("is_favorite", False),
                "updated_at": datetime.utcnow(),
            }

            DBHelper.update_one(
                "bookmarks",
                filters={"id": bookmark_id, "user_id": uid},
                updates=payload,
            )
            msg = "Bookmark updated successfully"
        else:
            # If adding, generate new ID
            new_id = uniqueId(digit=5, isNum=True, prefix=uid)
            payload = {
                "id": new_id,
                "user_id": uid,
                "title": data.get("title"),
                "url": data.get("url"),
                "description": data.get("description"),
                "favicon": data.get("favicon", ""),
                "category": data.get("category"),
                "tags": data.get("tags", []),
                "is_favorite": data.get("is_favorite", False),
                "is_active": 1,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

            DBHelper.insert("bookmarks", **payload)
            msg = "Bookmark added successfully"

        return {"status": 1, "message": msg, "payload": {}}


class GetBookmark(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        args = request.args
        search = args.get("search", "").lower()
        category = args.get("category")
        sort_by = args.get("sortBy", "newest")

        filters = {"user_id": uid, "is_active": Status.ACTIVE.value}
        if category:
            filters["category"] = category

        bookmarks = DBHelper.find_all(
            "bookmarks",
            filters=filters,
            select_fields=[
                "id",
                "title",
                "url",
                "description",
                "favicon",
                "category",
                "tags",
                "is_favorite",
                "created_at",
            ],
        )

        # Convert datetime to string
        for b in bookmarks:
            if isinstance(b.get("created_at"), datetime):
                b["created_at"] = b["created_at"].isoformat()

        # Apply search filtering
        if search:
            bookmarks = [
                b
                for b in bookmarks
                if search in b["title"].lower()
                or search in b.get("description", "").lower()
                or any(search in tag.lower() for tag in (b.get("tags") or []))
            ]

        # Apply sorting
        if sort_by == "title":
            bookmarks.sort(key=lambda x: x["title"])
        elif sort_by == "title-desc":
            bookmarks.sort(key=lambda x: x["title"], reverse=True)
        elif sort_by == "category":
            bookmarks.sort(key=lambda x: x["category"])
        elif sort_by == "oldest":
            bookmarks.sort(key=lambda x: x.get("created_at", ""))
        else:
            bookmarks.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return {"status": 1, "message": "Success", "payload": {"bookmarks": bookmarks}}


class DeleteBookmark(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        data = request.get_json(silent=True)
        bid = data.get("id")
        DBHelper.update_one(
            table_name="bookmarks",
            filters={"id": bid, "user_id": uid},
            updates={"is_active": Status.REMOVED.value},
        )
        return {"status": 1, "message": "Bookmark deleted", "payload": {}}


class ToggleFavorite(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        bid = request.get_json(silent=True)
        bookmark = DBHelper.find_one("bookmarks", filters={"id": bid, "user_id": uid})
        if not bookmark:
            return {"status": 0, "message": "Bookmark not found", "payload": {}}
        new_status = not bookmark.get("is_favorite", False)
        DBHelper.update_one(
            "bookmarks",
            filters={"id": bid, "user_id": uid},
            updates={"is_favorite": new_status, "updated_at": datetime.utcnow()},
        )
        updated = DBHelper.find_one(
            "bookmarks",
            filters={"id": bid, "user_id": uid},
            select_fields=[
                "id",
                "title",
                "url",
                "description",
                "favicon",
                "category",
                "tags",
                "is_favorite",
            ],
        )
        return {
            "status": 1,
            "message": "Favorite toggled",
            "payload": {"bookmark": updated},
        }


class GetBookmarkCategories(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        rows = DBHelper.raw_sql(
            "SELECT DISTINCT category FROM bookmarks WHERE user_id = %s AND is_active = 1",
            (uid,),
        )
        categories = [r["category"] for r in rows]
        return {
            "status": 1,
            "message": "Categories fetched",
            "payload": {"categories": categories},
        }


class GetBookmarkStats(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        total = DBHelper.count(
            "bookmarks", filters={"user_id": uid, "is_active": Status.ACTIVE.value}
        )
        fav = DBHelper.count(
            "bookmarks",
            filters={
                "user_id": uid,
                "is_favorite": True,
                "is_active": Status.ACTIVE.value,
            },
        )

        # Fix: Use alias for the count column to ensure consistent naming
        rows = DBHelper.raw_sql(
            "SELECT COUNT(DISTINCT category) as category_count FROM bookmarks WHERE user_id = %s AND is_active = 1",
            (uid,),
        )

        # Alternative approach: Get the first value regardless of column name
        categories = 0
        if rows and len(rows) > 0:
            # Get the first value from the first row (regardless of column name)
            first_row = rows[0]
            if isinstance(first_row, dict):
                # Try different possible column names
                categories = (
                    first_row.get("category_count")
                    or first_row.get("count")
                    or first_row.get("COUNT(DISTINCT category)")
                    or list(first_row.values())[0]
                    if first_row.values()
                    else 0
                )
            else:
                # If it's a tuple/list, get the first element
                categories = first_row[0] if first_row else 0

        return {
            "status": 1,
            "message": "Stats fetched",
            "payload": {
                "total_bookmarks": total,
                "favorite_bookmarks": fav,
                "categories_count": categories,
            },
        }


class EmailSender:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.smtp_user = EMAIL_SENDER
        self.smtp_password = EMAIL_PASSWORD

    def send_bookmark_email(self, recipient_email, bookmark):
        msg = EmailMessage()
        msg["Subject"] = f"Shared Bookmark: {bookmark['title']}"
        msg["From"] = self.smtp_user
        msg["To"] = recipient_email

        created = bookmark.get("created_at") or ""
        if created:
            created = created.split("T")[0]

        msg.set_content(
            f"""
Hi there!

I wanted to share this Bookmark with you:

Title: {bookmark['title']}
Url: {bookmark['url']}
ResourceType: {bookmark['category']}


Best regards!
""".strip()
        )

        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True, "Email sent successfully"
        except Exception as e:
            return False, str(e)


class ShareBookmark(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        try:
            data = request.get_json(force=True)
        except Exception as e:
            return {"status": 0, "message": f"Invalid JSON: {str(e)}"}, 400

        email = data.get("email")
        bookmark = data.get("bookmark")

        if not email or not bookmark:
            return {
                "status": 0,
                "message": "Both 'email' and 'bookmark' are required.",
            }, 422

        email_sender = EmailSender()
        success, message = email_sender.send_bookmark_email(email, bookmark)

        if success:
            return {"status": 1, "message": "Bookmark shared via email."}
        else:
            return ({"status": 0, "message": f"Failed to send email: {message}"},)
