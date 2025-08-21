
# from root.general.bank import *

# # # # BankConnect,
# # # # GetBankAccount,
# # # # GetSavedTransactions,
# # # # RecurringTransactions,
# # # # SaveBankAccount,
# # # # SaveBankTransactions,


# # # from root.general.currentUser import CurrentUser
# from . import general_api

# # # general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")
# # # general_api.add_resource(BankConnect, "/connect/bank")
# # # general_api.add_resource(GetBankAccount, "/get/bank-account")
# # # general_api.add_resource(SaveBankAccount, "/save/bank-account")

# # # general_api.add_resource(SaveBankTransactions, "/save/bank-transactions")
# # # general_api.add_resource(GetSavedTransactions, "/get/saved-transactions")
# # # general_api.add_resource(RecurringTransactions, "/get/recurring-transactions")


# # # general_api.add_resource(AddAccounts, "/add/accounts")
# # # general_api.add_resource(GetAccounts, "/get/accounts")


# # # general_api.add_resource(GetIncomeExpense, "/get/income-expense")
# # # general_api.add_resource(getTotalBalance, "/get/total-balance")


# from root.general.bank import *


# from root.general.currentUser import CurrentUser
# from . import general_api

# general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")
# general_api.add_resource(BankConnect, "/connect/bank")
# general_api.add_resource(GetBankAccount, "/get/bank-account")
# general_api.add_resource(SaveBankAccount, "/save/bank-account")

# general_api.add_resource(SaveBankTransactions, "/save/bank-transactions")
# general_api.add_resource(GetSavedTransactions, "/get/saved-transactions")
# general_api.add_resource(RecurringTransactions, "/get/recurring-transactions")


# general_api.add_resource(AddAccounts, "/add/accounts")
# general_api.add_resource(GetAccounts, "/get/accounts")


# general_api.add_resource(GetIncomeExpense, "/get/income-expense")
# general_api.add_resource(GetTotalBalance, "/get/total-balance")


# general_api.add_resource(AddFinanceGoal, "/add/finance_goal")
# general_api.add_resource(GetFinanceGoal, "/get/finance_goal")
# general_api.add_resource(UpdateFinanceGoal, "/update/finance_goal")


# general_api.add_resource(GenerateMonthlyBudget, "/get/monthly-budget")

# # # Ensure __routes__.py includes this endpoint
# # general_api.add_resource(UpdateMonthlyBudget, "/update/monthly-budget")


# # general_api.add_resource(BankConnect, "/connect/bank")
# # general_api.add_resource(GetBankAccount, "/get/bank-account")
# # general_api.add_resource(GetTransactions, "/transactions/list")
# # general_api.add_resource(GetBudgets, "/budgets/get")
# # general_api.add_resource(GetFinancialGoals, "/goals/list")
# # general_api.add_resource(GetAccountsSummary, "/accounts/summary")


from root.general.bank import *
from root.general.currentUser import CurrentUser
from . import general_api

general_api.add_resource(CurrentUser, "/currentUser", endpoint="CurrentUser")
general_api.add_resource(BankConnect, "/connect/bank")
general_api.add_resource(GetBankAccount, "/get/bank-account")
general_api.add_resource(SaveBankAccount, "/save/bank-account")
general_api.add_resource(SaveBankTransactions, "/save/bank-transactions")
# general_api.add_resource(UserBudgetTransactions, "/get/user-budget
general_api.add_resource(GetSavedTransactions, "/get/saved-transactions")
general_api.add_resource(RecurringTransactions, "/get/recurring-transactions")
general_api.add_resource(AddAccounts, "/add/accounts")
general_api.add_resource(GetAccounts, "/get/accounts")
general_api.add_resource(GetIncomeExpense, "/get/income-expense")
general_api.add_resource(GetTotalBalance, "/get/total-balance")
general_api.add_resource(AddFinanceGoal, "/add/finance_goal")
general_api.add_resource(GetFinanceGoal, "/get/finance_goal")
general_api.add_resource(UpdateFinanceGoal, "/update/finance_goal")
# general_api.add_resource(GenerateMonthlyBudget, "/get/monthly-budget")
general_api.add_resource(UpdateMonthlyBudget, "/update/monthly-budget")
general_api.add_resource(GenerateMonthlyBudget, "/get/monthly-budget")

general_api.add_resource(UpdateTransactionCategory, "/update/transaction-category")

