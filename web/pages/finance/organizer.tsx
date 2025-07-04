

"use client";
import React, { useEffect, useState } from "react";
import { Tabs, Typography } from "antd";
import Overview from "./overView";
import UpcomingBills from "./upcomingBills";
import SavingsGoals from "./savingsGoals";
import AccountsList from "./accountsList";
import RecentTransactions from "./transactions";
import MonthlyBudget from "./monthlyBudget";
import { useQuilttSession } from "@quiltt/react";
import { getBankAccount } from "../../services/apiConfig";
import CashFlow from "./cashFlow";
import FinancialSummary from "./financialSummary";
import AccountsOverview from "./accountsList";
import GoalsCard from "./goalcard";
import RecurringTransactions from "./recurringTransactions";
import { DollarSign } from "lucide-react";
import DocklyLoader from "../../utils/docklyLoader";

const { Text, Title } = Typography;

const FinanceTabs = () => {
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState("1");
  const { session } = useQuilttSession();

  const getUserBankAccount = async () => {
    setLoading(true);
    const response = await getBankAccount({ session: session });
    const data = response?.data?.data;
    if (data) {
      setBankDetails(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getUserBankAccount();
  }, []);

  const goToTransactionsTab = () => {
    setActiveKey("3");
  };

  const items = [
    {
      label: "Overview",
      key: "1",
      children: (
        <>
          <div style={{ display: "flex" }}>
            {bankDetails && <CashFlow bankDetails={bankDetails} />}
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ width: 950 }}>
              <MonthlyBudget />
            </div>
            <GoalsCard />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ width: 950 }}>
              <RecentTransactions onViewAll={goToTransactionsTab} />
            </div>
            <RecurringTransactions />
          </div>
          <AccountsList />
        </>
      ),
    },
    {
      label: "Accounts",
      key: "2",
      children: (
        <div>
          {bankDetails && <AccountsOverview />}
        </div>
      ),
    },
    {
      label: "Transactions",
      key: "3",
      children: (
        <>
          {bankDetails && (
            <RecentTransactions isFullscreen={true} />
          )}
        </>
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

  if (loading) {
    return <DocklyLoader />;
  }

  return (
    <div style={{ margin: "65px 10px 10px 60px" }}>
      {/* <Title level={2} style={{ marginBottom: "20px", marginLeft: 40 }}>
        Financesss
      </Title> */}
      <BoardTitle />
      <div
        style={{
          margin: 20,
          padding: 20,
          background: "#f7f9fb",
          borderRadius: 16,
        }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
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


const BoardTitle: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        // marginBottom: '24px',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          // backgroundColor: '#e6f4ea',
          color: '#2e7d32',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
        }}
      >
        <DollarSign size={24} />
      </div>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#1b1f23',
          margin: 0,
        }}
      >
        Finance Board
      </h1>
    </div>
  );
};