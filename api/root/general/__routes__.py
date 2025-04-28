from root.general.bank import SignInBank, SignUpBank
from root.general.currentUser import CurrentUser
from . import general_api

general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")
general_api.add_resource(SignInBank, "/signin/bank")
general_api.add_resource(SignUpBank, "/signup/bank")
# general_api.add_resource(AddBankAccount, "/link_bank_account")
