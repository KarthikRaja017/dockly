import random
import re
from threading import Thread
import bcrypt
from flask import request
from flask_restful import Resource
from datetime import datetime
import pytz
import requests
from root.auth.auth import auth_required, getAccessTokens
from root.utilis import handle_user_session, uniqueId
from root.config import (
    EMAIL_PASSWORD,
    EMAIL_SENDER,
    SMTP_PORT,
    SMTP_SERVER,
)
from root.db.dbHelper import DBHelper
import smtplib
from email.message import EmailMessage


def generate_otp():
    return random.randint(1000, 9999)


def send_otp_email(email, otp):
    try:
        msg = EmailMessage()
        msg["Subject"] = "Your OTP Code for Dockly"
        msg["From"] = EMAIL_SENDER
        msg["To"] = email
        msg.set_content(f"Your OTP is: {otp}\nValid for 10 minutes.")

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        return {"otp": otp, "email": email}
    except Exception as e:
        # Optional: Add error logging
        return {"otp": None, "email": email, "error": str(e)}


def format_phone_number(mobile):
    # Remove '+' and any non-numeric characters
    return mobile.replace("+", "").strip()


def send_otp_sms(mobile, otp):

    url = "http://localhost:9090/intl"  # TextBelt running locally
    project_name = "Dockly"

    data = {
        "number": str(mobile),  # Ensure it's a string
        "message": f"{project_name} OTP: {otp}. Use this code to verify your login.",
        "key": "textbelt",  # Default key when running locally
    }

    response = requests.post(url, data=data)

    try:
        return response.json()
    except requests.exceptions.JSONDecodeError:
        return {
            "error": "Invalid response from SMS API",
            "response_text": response.text,
        }


# def maskMobile(value, ifEmpty=False):
#     pattern = ("\s*(?:\+?(\d{1,3}))?[-. (]*(\d{2})[-. )]*(\d{5})[-. ]*(\d{3})(?: *x(\d+))?\s*")
#     result = re.findall(pattern, value)

#     if len(result) > 0:
#         result = result[0]

#     if not (len(result) > 3):
#         return ifEmpty

#     return f"{result[1]}*****{result[3]}"


def getUtcCurrentTime():
    return datetime.now(tz=pytz.UTC)


class RegisterUser(Resource):
    def post(self):
        data = request.get_json()
        userName = data.get("userName")
        inputEmail = data.get("email", "")
        userId = ""

        # 1. Check if user exists by username
        existingUser = DBHelper.find_one(
            "users",
            filters={"username": userName},
            select_fields=["email", "uid", "is_dockly_user"],
        )
        #  CASE 1: User exists
        if existingUser:
            userId = existingUser.get("uid")
            dbEmail = existingUser.get("email")
            isDockly = existingUser.get("is_dockly_user")

            # Case: Dockly user with matching email — login
            if isDockly and inputEmail == dbEmail:
                # sessionInfo = handle_user_session(userId)
                token = getAccessTokens({"uid": userId})
                return {
                    "status": 1,
                    "message": "Welcome back",
                    "payload": {
                        "userId": userId,
                        # "session": sessionInfo,
                        "token": token["accessToken"],
                        "redirectUrl": "/dashboard",
                    },
                }

            # ⚠️ If email not given in input, send OTP to existing DB email for verification
            if isDockly and not inputEmail and dbEmail:
                otp = generate_otp()
                Thread(target=send_otp_email, args=(dbEmail, otp)).start()
                return {
                    "status": 1,
                    "message": f"OTP sent to {dbEmail} for email verification",
                    "payload": {
                        "redirectUrl": "/verify-email",
                        "email": dbEmail,
                        "userId": userId,
                        "otpStatus": {"otp": otp, "email": dbEmail},
                    },
                }

            # 🚧 If not Dockly user, but email is provided, register as Dockly user (depends on your policy)
            # if isDockly and inputEmail != dbEmail:
            return {
                "status": 0,
                "message": "Username already exists and is unavailable",
                "payload": {},
            }

        # CASE 2: New User (username not found)
        uid = uniqueId(digit=5, isNum=True, prefix="USER")
        userId = DBHelper.insert(
            "users",
            return_column="uid",
            uid=uid,
            email="",
            mobile="",
            username=userName,
            is_email_verified=False,
            is_phone_verified=False,
            is_dockly_user=True,
        )

        # sessionInfo = handle_user_session(userId)

        return {
            "status": 1,
            "message": "User registered and session created",
            "payload": {
                "userId": userId,
                # "session": sessionInfo,
                "redirectUrl": "/sign-up",
            },
        }


class SaveUserEmail(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        userId = inputData["userId"]
        email = inputData["email"]
        if userId:
            existingUser = DBHelper.find_one(
                "users",
                filters={"email": email},
                select_fields=["uid", "username"],
            )
            if existingUser:
                return {
                    "status": 0,
                    "message": "Email already exists",
                    "payload": {},
                }
            else:
                uid = DBHelper.update_one(
                    table_name="users",
                    filters={"uid": userId},
                    updates={"email": email},
                    return_fields=["uid"],
                )
            otp = generate_otp()
            otpResponse = send_otp_email(email, otp)
            # otpResponse = {"otp": otp, "email": email}
            username = (
                existingUser.get("username", "")
                if existingUser
                else inputData["username"]
            )
            return {
                "status": 1,
                "message": "OTP sent successfully",
                "payload": {
                    "email": email,
                    "otpStatus": otpResponse,
                    "uid": uid,
                    "username": username,
                },
            }
        else:
            existingUser = DBHelper.find_one(
                "users",
                filters={"email": email},
                select_fields=["uid", "username"],
            )
            otp = generate_otp()
            otpResponse = send_otp_email(email, otp)
            # otpResponse = {"otp": otp, "email": email}
            if existingUser:
                uid = existingUser.get("uid")

                return {
                    "status": 1,
                    "message": "OTP sent successfully",
                    "payload": {
                        "email": email,
                        "otpStatus": otpResponse,
                        "uid": uid,
                        "username": existingUser.get("username"),
                    },
                }
            else:
                usernamePrefix = email.split("@")[0]
                uid = uniqueId(digit=5, isNum=True, prefix="USER")
                username = f"{usernamePrefix}{uid}"
                userId = DBHelper.insert(
                    "users",
                    return_column="uid",
                    uid=uid,
                    email="",
                    mobile="",
                    username=username,
                    is_email_verified=False,
                    is_phone_verified=False,
                    is_dockly_user=True,
                )
                return {
                    "status": 1,
                    "message": "User registered and Otp sent Successfully",
                    "payload": {
                        "email": email,
                        "otpStatus": otpResponse,
                        "uid": uid,
                        "username": username,
                    },
                }


def is_otp_valid(otpData, otp):

    if int(otpData) != int(otp):
        return {
            "status": 0,
            "class": "error",
            "message": "Oops! That OTP doesn't match. Double-check and try again!",
            "payload": {},
        }

    return {
        "status": 1,
        "class": "success",
        "message": "OTP verified!",
        "payload": {},
    }


class OtpVerification(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        userId = inputData["userId"]
        otp = inputData.get("otp")
        response = is_otp_valid(inputData["storedOtp"], otp)
        uid = DBHelper.update_one(
            table_name="users",
            filters={"uid": userId},
            updates={"is_email_verified": True},
            return_fields=["uid", "email"],
        )
        userInfo = {
            "uid": uid.get("uid"),
        }
        token = getAccessTokens(userInfo)
        # handle_user_session(uid)
        response["payload"]["token"] = token["accessToken"]
        response["payload"]["userId"] = uid.get("uid")
        response["payload"]["email"] = uid.get("email")
        return response


class MobileVerification(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        otp = inputData.get("otp")
        uid = inputData.get("uid")
        response = is_otp_valid(inputData["storedOtp"], otp)
        userInfo = {
            "uid": uid,
        }
        token = getAccessTokens(userInfo)
        response["payload"]["token"] = token["accessToken"]
        return response


class SignInVerification(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        otp = inputData.get("otp")
        uid = inputData.get("uid")
        response = is_otp_valid(inputData["storedOtp"], otp)
        userInfo = {
            "uid": uid,
        }
        token = getAccessTokens(userInfo)
        handle_user_session(uid)
        response["payload"]["token"] = token["accessToken"]
        return response


class LoginUser(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        login_type = inputData.get("type")
        otp = generate_otp()

        if login_type == "email":
            email = inputData.get("email")
            user = DBHelper.find_one(
                table_name="users", filters={"email": email}, select_fields=["uid"]
            )

            if not user:
                return {"status": 0, "message": "User not found with this email"}

            otpResponse = send_otp_email(email, otp)
            # otpResponse = {"otp": otp, "email": email}

        elif login_type == "mobile":
            mobileNumber = inputData.get("mobile")
            user = DBHelper.find_one(
                table_name="users",
                filters={"mobile": mobileNumber},
                select_fields=["uid"],
            )

            if not user:
                return {
                    "status": 0,
                    "message": "User not found with this mobile number",
                }

            # otpStatus = send_sms_otp(otp, mobileNumber)
            # print(f"otpStatus: {otpStatus}")
            # if otpStatus:
            #     otpResponse = {"otp": otp, "mobileNumber": mobileNumber}
            # else:
            #     return {
            #         "status": 0,
            #         "message": "Failed to send OTP",
            #     }
            otpResponse = {"otp": otp, "mobileNumber": mobileNumber}

        else:
            return {"status": 0, "message": "Invalid login type"}

        return {
            "status": 1,
            "payload": {"otpStatus": {**otpResponse, "userId": user.get("uid")}},
        }


class GetStarted(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        if not uid:
            return {
                "status": 0,
                "message": "User ID is required",
                "payload": {},
            }

        completedSteps = 0
        steps = [
            "profileCompleted",
            "accountsCompleted",
            "boardCreated",
            "documentUploaded",
            "notificationsSetup",
        ]

        # Check profile completion
        profile = DBHelper.find_one(
            "user_profiles", filters={"uid": uid}, select_fields=["uid"]
        )
        if profile and profile.get("uid"):
            completedSteps += 1
            if "profileCompleted" in steps:
                steps.remove("profileCompleted")

        # Check notifications setup
        notifications = DBHelper.find_one(
            "user_settings",
            filters={"user_id": uid},
            select_fields=["email_notifications", "push_notifications"],
        )

        if notifications is not None:
            completedSteps += 1
            if "notificationsSetup" in steps:
                steps.remove("notificationsSetup")
        googleUser = DBHelper.find_one(
            "google_tokens",
            filters={"uid": uid},
            select_fields=["email"],
        )
        if googleUser is not None:
            completedSteps += 1
            if "accountsCompleted" in steps:
                steps.remove("accountsCompleted")
        print(f"steps: {steps}")
        print(f"completedSteps: {completedSteps}")

        return {
            "status": 1,
            "message": "Fetched Get Started steps",
            "payload": {
                "completedSteps": completedSteps,
                "steps": steps,
                "username": user.get("username", ""),
                "uid": uid,
            },
        }


class AddDetails(Resource):
    @auth_required(isOptional=True)
    def post(self, uid, user):
        inputData = request.get_json(silent=True)
        existingUser = DBHelper.find_one(
            "user_profiles", filters={"uid": uid}, select_fields=["uid"]
        )

        if existingUser:
            if "personalValues" in inputData:
                userDetails = inputData["personalValues"]
                uid = DBHelper.update_one(
                    table_name="user_profiles",
                    filters={"uid": uid},
                    updates={
                        "first_name": userDetails["first_name"],
                        "last_name": userDetails["last_name"],
                        "dob": datetime.fromisoformat(
                            userDetails["dob"].replace("Z", "+00:00")
                        ).date(),
                        "phone": userDetails["phone"],
                    },
                    return_fields=["uid"],
                )
            if "addressValues" in inputData:
                addressDetails = inputData["addressValues"]
                DBHelper.update_one(
                    table_name="user_profiles",
                    filters={"uid": uid},
                    updates={
                        "country": addressDetails["country"],
                        "city": addressDetails["city"],
                        "postal_code": addressDetails["postal_code"],
                    },
                    return_fields=["uid"],
                )

            return {
                "status": 1,
                "message": "User details updated successfully",
                "payload": {"uid": uid, "username": user.get("username", "")},
            }
        else:
            personalDetails = inputData.get("personal", {})
            securityDetails = inputData.get("security", {})
            addressDetails = inputData.get("address", {})
            userDetails = {}
            userEmailDetails = DBHelper.find_one(
                "users", filters={"uid": uid}, select_fields=["email"]
            )
            userEmail = userEmailDetails.get("email", "")
            if personalDetails:
                if userEmail != securityDetails.get("email", ""):
                    DBHelper.update_one(
                        table_name="users",
                        filters={"uid": uid},
                        updates={"email": personalDetails.get("email", "")},
                        return_fields=["uid"],
                    )
                userDetails.update(personalDetails)

            if securityDetails:
                if userEmail == securityDetails.get("backupEmail", ""):
                    return {
                        "status": 0,
                        "message": "Backup email cannot be same as primary email",
                        "payload": {"setStep": 1},
                    }
                userDetails.update(securityDetails)
            if addressDetails:
                userDetails.update(addressDetails)
            if not userDetails:
                return {
                    "status": 0,
                    "message": "No details provided to update",
                    "payload": {"setStep": 1},
                }

            if userDetails:
                name = DBHelper.insert(
                    "user_profiles",
                    return_column="first_name",
                    uid=uid,
                    first_name=userDetails["first_name"],
                    last_name=userDetails["last_name"],
                    dob=datetime.fromisoformat(
                        userDetails["dob"].replace("Z", "+00:00")
                    ).date(),
                    phone=userDetails["phone"],
                    backup_email=userDetails["backupEmail"],
                    country=userDetails["country"],
                    city=userDetails["city"],
                    postal_code=userDetails["postal_code"],
                )

            return {
                "status": 1,
                "message": f"{name}'s Details added successfully",
                "payload": {"name": name, "username": user.get("username", "")},
            }


class GetUserDetails(Resource):
    @auth_required(isOptional=True)
    def get(self, uid, user):
        userDetails = DBHelper.find_one(
            "user_profiles",
            filters={"uid": uid},
            select_fields=[
                "first_name",
                "last_name",
                "dob",
                "phone",
                "backup_email",
                "country",
                "city",
                "postal_code",
            ],
        )

        if not userDetails:
            return {
                "status": 0,
                "message": "User details not found",
                "payload": {},
            }

        userDetails["dob"] = userDetails["dob"].isoformat()
        userDetails["email"] = user.get("email", "")

        return {
            "status": 1,
            "message": "User details fetched successfully",
            "payload": userDetails,
        }


# phone_number = +919952202256
# message = "Hello from TextBelt Open Source!"
# response = send_sms(phone_number, message)
