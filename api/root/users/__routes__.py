
from .models import AddDetails, LoginUser, OtpVerification, RegisterUser
from . import users_api


users_api.add_resource(RegisterUser, "/sign-up")
users_api.add_resource(LoginUser, "/sign-in")
users_api.add_resource(OtpVerification, "/email/otpVerification")
users_api.add_resource(AddDetails, "/add-details")

