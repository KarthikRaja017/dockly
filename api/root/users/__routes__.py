from root.general.currentUser import CurrentUser
from .models import (
    AddDetails,
    GetStarted,
    GetUserDetails,
    LoginUser,
    MobileVerification,
    OtpVerification,
    RegisterUser,
    SaveUserEmail,
    SignInVerification,
)
from . import users_api


users_api.add_resource(RegisterUser, "/add/username")
users_api.add_resource(SaveUserEmail, "/sign-up/email")
users_api.add_resource(LoginUser, "/sign-in")
users_api.add_resource(OtpVerification, "/email/otpVerification")
users_api.add_resource(MobileVerification, "/mobile/otpVerification")
users_api.add_resource(SignInVerification, "/signIn/otpVerification")
users_api.add_resource(GetStarted, "/get/started")
users_api.add_resource(AddDetails, "/add/profile")
users_api.add_resource(GetUserDetails, "/get/profile")
users_api.add_resource(CurrentUser, "/get/currentUser")
