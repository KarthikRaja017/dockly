"use client";
import React, { useEffect } from "react";
import { Tabs } from "antd";
import Overview from "./overView";
import UpcomingBills from "./upcomingBills";
import SavingsGoals from "./savingsGoals";
import AccountsList from "./accountsList";
import RecentTransactions from "./transactions";
import MonthlyBudget from "./monthlyBudget";
import { useQuilttSession } from "@quiltt/react";
import { getBankAccount } from "../../services/apiConfig";

const FinanceTabs = (props: any) => {
  // const { bankDetails } = props;
  const [bankDetails, setBankDetails] = React.useState<any>(null);
  const { session } = useQuilttSession();
  const getUserBankAccount = async () => {
    const response = await getBankAccount({ session: session });
    const data = response?.data?.data;
    if (data) {
      setBankDetails(data);
    }
  };
  useEffect(() => {
    getUserBankAccount();
  }, []);

  const items = [
    {
      label: "Overview",
      key: "1",
      children: (
        <>
          <div style={{ display: "flex", gap: 10 }}>
            {bankDetails && (
              <>
                <div>
                  <Overview bankDetails={bankDetails} />
                  <AccountsList
                    accountDetails={bankDetails.connections[0].accounts}
                  />
                  <div style={{ marginTop: 10 }}>
                    <MonthlyBudget />
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <UpcomingBills />
                  <SavingsGoals />
                  <RecentTransactions
                    transactions={bankDetails.transactions.nodes}
                  />
                </div>
              </>
            )}
          </div>
          {/* <div style={{ marginTop: 20 }}>
            {bankDetails && (
              <AccountsList
                accountDetails={bankDetails.connections[0].accounts}
              />
            )}
          </div>
          <div style={{ marginTop: 20, display: "flex" }}>
            {bankDetails && (
              <RecentTransactions
                transactions={bankDetails.transactions.nodes}
              />
            )}
          </div> */}
        </>
      ),
    },
    {
      label: "Accounts",
      key: "2",
      children: (
        <div>
          {/* Uncomment and use when data is available */}
          {bankDetails && (
            <AccountsList
              accountDetails={bankDetails.connections[0].accounts}
            />
          )}
        </div>
      ),
    },
    {
      label: "Transactions",
      key: "3",
      children: (
        <div>
          {bankDetails && (
            <RecentTransactions transactions={bankDetails.transactions.nodes} />
          )}
        </div>
      ),
    },
    {
      label: "Budgets",
      key: "4",
      children: (
        <div>
          <MonthlyBudget />
        </div>
      ),
    },
    {
      label: "Reports",
      key: "5",
      children: (
        <div>
          <h3 style={{ textAlign: "center" }}>Reports Section (Coming Soon)</h3>
        </div>
      ),
    },
  ];

  return (
    <div style={{ margin: "80px 10px 10px 60px" }}>
      <h2>Finance</h2>
      <div
        style={{
          margin: 20,
          padding: 20,
          background: "#f7f9fb",
          borderRadius: 16,
        }}
      >
        <Tabs
          defaultActiveKey="1"
          tabBarGutter={30}
          tabBarStyle={{
            marginBottom: 24,
            fontWeight: "500",
            fontSize: 16,
          }}
          size="large"
          animated
          items={items}
        />
      </div>
    </div>
  );
};

export default FinanceTabs;
