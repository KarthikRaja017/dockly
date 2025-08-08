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

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            {bankDetails && <CashFlow bankDetails={bankDetails} />}
          </div>
          <div style={{ display: "flex", marginBottom: "16px" }}>
            <div style={{ width: 890 }}>
              <MonthlyBudget uid={""} />
            </div>
            <GoalsCard uid={""} />
          </div>
          <div style={{ display: "flex", marginBottom: "16px" }}>
            <div style={{ width: 920 }}>
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
          <MonthlyBudget uid={""} />
        </div>
      ),
    },
    // {
    //   label: "Reports",
    //   key: "5",
    //   children: (
    //     <div>
    //       <h3 style={{ textAlign: "center", fontFamily: FONT_FAMILY, color: "#6b7280", fontWeight: 500 }}>Reports Section (Coming Soon)</h3>
    //     </div>
    //   ),
    // },
  ];

  if (loading) {
    return <DocklyLoader />;
  }

  return (
    <div style={{ margin: "60px 16px 16px 48px", fontFamily: FONT_FAMILY, background: "#fafafa" }}>
      <BoardTitle />
      <div
        style={{
          marginLeft: "38px",
        }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={(key) => setActiveKey(key)}
          tabBarGutter={24}
          tabBarStyle={{
            marginBottom: 16,
            fontWeight: "600",
            fontSize: 14,
            fontFamily: FONT_FAMILY,
          }}
          size="middle"
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
        padding: '12px 16px',
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          color: '#059669',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          background: 'linear-gradient(145deg, #ecfdf5, #d1fae5)',
          border: '1px solid #a7f3d0',
        }}
      >
        💵
      </div>
      <h1
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#111827',
          margin: 0,
          fontFamily: FONT_FAMILY,
          letterSpacing: '-0.025em',
        }}
      >
        Finance Board
      </h1>
    </div>
  );
};