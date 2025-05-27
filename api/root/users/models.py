import random
import re
import bcrypt
from flask import request
from flask_restful import Resource
from datetime import datetime
import pytz
import requests
from root.auth.auth import getAccessTokens
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
    msg = EmailMessage()
    msg["Subject"] = "Your OTP Code for Dockly"
    msg["From"] = EMAIL_SENDER
    msg["To"] = email
    msg.set_content(f"Your OTP is: {otp}\nValid for 10 minutes.")

    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(EMAIL_SENDER, EMAIL_PASSWORD)
    server.send_message(msg)
    server.quit()
    return {"otp": otp, "email": email}


def format_phone_number(mobile):
    # Remove '+' and any non-numeric characters
    return mobile.replace("+", "").strip()


def send_otp_sms(mobile, otp):
    print(f"Sending OTP to: {mobile}")
    print(f"OTP: {otp}")

    url = "http://localhost:9090/intl"  # TextBelt running locally
    project_name = "Dockly"

    data = {
        "number": str(mobile),  # Ensure it's a string
        "message": f"{project_name} OTP: {otp}. Use this code to verify your login.",
        "key": "textbelt",  # Default key when running locally
    }

    print(f"Request data: {data}")  # Debugging

    response = requests.post(url, data=data)
    print(f"Response status code: {response.status_code}")
    print(f"Response text: {response.text}")

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
        userId = ""
        inputEmail = data.get("email", "")

        # Check if user with the username exists
        existingUser = DBHelper.find_one(
            "users",
            filters={"username": userName},
            select_fields=[
                "email",
                "is_email_verified",
                "uid",
                "is_dockly_user",
            ],
        )

        #  CASE 1: User exists
        if existingUser:
            isDockly = existingUser.get("is_dockly_user")
            userId = existingUser.get("uid")
            dbEmail = existingUser.get("email")

            # ✅ If Dockly user, log in
            if isDockly and inputEmail == dbEmail:
                sessionInfo = handle_user_session(userId)
                token = getAccessTokens({"uid": userId})

                return {
                    "status": 1,
                    "message": "Welcome back",
                    "payload": {
                        "userId": userId,
                        "session": sessionInfo,
                        "token": token["accessToken"],
                        "redirectUrl": "/dashboard",
                    },
                }

            # ⚠️ If email not given in input, send OTP to existing DB email for verification
            if isDockly and not inputEmail and dbEmail:
                otp = generate_otp()
                otpResponse = send_otp_email(dbEmail, otp)
                # You need to implement this function

                return {
                    "status": 1,
                    "message": f"OTP sent to {dbEmail} for email verification",
                    "payload": {
                        "redirectUrl": "/verify-email",
                        "email": dbEmail,
                        "userId": userId,
                        "otpStatus": otpResponse,
                    },
                }

            # 🚧 If not Dockly user, but email is provided, register as Dockly user (depends on your policy)
            if isDockly and inputEmail != dbEmail:
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

        sessionInfo = handle_user_session(userId)

        return {
            "status": 1,
            "message": "User registered and session created",
            "payload": {
                "userId": userId,
                "session": sessionInfo,
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
                select_fields=["uid"],
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
            return {
                "status": 1,
                "message": "OTP sent successfully",
                "payload": {"email": email, "otpStatus": otpResponse, "uid": uid},
            }
        else:
            existingUser = DBHelper.find_one(
                "users",
                filters={"email": email},
                select_fields=["uid"],
            )
            otp = generate_otp()
            otpResponse = send_otp_email(email, otp)
            # otpResponse = {"otp": otp, "email": email}
            uid = existingUser.get("uid")

            return {
                "status": 1,
                "message": "OTP sent successfully",
                "payload": {"email": email, "otpStatus": otpResponse, "uid": uid},
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
        print(f"inputData: {inputData}")
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


class AddMobile(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        email = inputData["email"]
        mobileNumber = inputData["mobile"]

        existingUser = DBHelper.find_one("users", filters={"email": email})
        if existingUser:
            uid = DBHelper.update_one(
                table_name="users",
                filters={"email": email},
                updates={"mobile": mobileNumber},
                return_fields=["uid"],
            )
        otp = generate_otp()
        # otpStatus = send_sms_otp(otp, "91" + mobileNumber)
        # if otpStatus:
        #     otpResponse = {"otp": otp, "mobileNumber": mobileNumber}
        # else:
        #     return {
        #         "status": 0,
        #         "message": "Failed to send OTP",
        #     }
        otpResponse = {"otp": otp, "mobileNumber": mobileNumber}
        return {
            "status": 1,
            "message": "OTP sent successfully",
            "payload": {"email": email, "otpStatus": otpResponse, "uid": uid},
        }


class AddDetails(Resource):
    def post(self):
        inputData = request.get_json(silent=True)
        userId = inputData["userId"]
        mobileNumber = inputData["mobileNumber"]

        existingUser = DBHelper.find_one("users", columns="id", id=userId)
        if existingUser:
            DBHelper.update_one("users", inputData, id=userId)
        otp = generate_otp()
        # otpStatus = send_otp_sms(mobileNumber, otp)
        # print(f"otpStatus: {otpStatus}")
        otpResponse = {"otp": otp, "mobileNumber": mobileNumber}

        return {
            "status": 1,
            "message": "OTP sent successfully",
            "payload": {"userId": userId, "otpStatus": otpResponse},
        }


# phone_number = +919952202256
# message = "Hello from TextBelt Open Source!"
# response = send_sms(phone_number, message)
