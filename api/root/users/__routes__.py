
from root.general.currentUser import CurrentUser
from .models import AddDetails, AddMobile, LoginUser, MobileVerification, OtpVerification, RegisterUser, SaveUserEmail, SignInVerification
from . import users_api


users_api.add_resource(RegisterUser, "/add/username")
users_api.add_resource(SaveUserEmail, "/sign-up/email")
users_api.add_resource(LoginUser, "/sign-in")
users_api.add_resource(OtpVerification, "/email/otpVerification")
users_api.add_resource(MobileVerification, "/mobile/otpVerification")
users_api.add_resource(SignInVerification, "/signIn/otpVerification")
users_api.add_resource(AddMobile, "/sign-up/mobile")
users_api.add_resource(AddDetails, "/add-details")
users_api.add_resource(CurrentUser, "/get/currentUser")

