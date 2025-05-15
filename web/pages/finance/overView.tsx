"use client";
import React from "react";
import { Card, Row, Col, Typography, Divider } from "antd";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import dayjs from "dayjs";
const { Title, Text } = Typography;

export const getMonthlyComparisonSummary = (transactions: any[]) => {
  const now = dayjs();
  const currentMonth = now.month();
  const currentYear = now.year();
  const prevMonthDate = now.subtract(1, "month");
  const prevMonth = prevMonthDate.month();
  const prevYear = prevMonthDate.year();

  let currentIncome = 0;
  let currentExpense = 0;
  let prevIncome = 0;
  let prevExpense = 0;

  transactions.forEach((tx) => {
    const txDate = dayjs(tx.date);
    const amount = parseFloat(tx.amount);

    if (txDate.year() === currentYear && txDate.month() === currentMonth) {
      if (tx.entryType === "CREDIT") currentIncome += amount;
      else if (tx.entryType === "DEBIT") currentExpense += Math.abs(amount);
    } else if (txDate.year() === prevYear && txDate.month() === prevMonth) {
      if (tx.entryType === "CREDIT") prevIncome += amount;
      else if (tx.entryType === "DEBIT") prevExpense += Math.abs(amount);
    }
  });

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0)
      return { percent: current > 0 ? 100 : 0, icon: RiseOutlined };
    const change = ((current - previous) / previous) * 100;
    return {
      percent: Math.abs(change).toFixed(2),
      icon: change >= 0 ? RiseOutlined : FallOutlined,
    };
  };

  const incomeChange = calculateChange(currentIncome, prevIncome);
  const expenseChange = calculateChange(currentExpense, prevExpense);

  return {
    currentIncome,
    currentExpense,
    prevIncome,
    prevExpense,
    incomeChange,
    expenseChange,
  };
};

const getLastSixMonthsSummary = (transactions: any[]) => {
  const summary = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = dayjs().subtract(i, "month");
    const targetMonth = monthDate.month();
    const targetYear = monthDate.year();
    const label = monthDate.format("MMM YYYY");

    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      const txDate = dayjs(tx.date);
      if (txDate.month() === targetMonth && txDate.year() === targetYear) {
        const amount = parseFloat(tx.amount);
        if (tx.entryType === "CREDIT") {
          income += amount;
        } else if (tx.entryType === "DEBIT") {
          expenses += Math.abs(amount);
        }
      }
    });

    summary.push({
      month: label,
      income: parseFloat(income.toFixed(2)),
      expenses: parseFloat(expenses.toFixed(2)),
    });
  }

  return summary;
};
export const getNetWorth = (connections: any[]) => {
  let totalAssets = 0;
  let totalLiabilities = 0;

  connections.forEach((account: any) => {
    const balance = account.balance?.current ?? 0;
    const name = account.name?.toLowerCase() ?? "";

    if (
      ["savings", "checking", "investment"].some((type) => name.includes(type))
    ) {
      totalAssets += balance;
    } else if (
      ["credit", "loan", "mortgage"].some((type) => name.includes(type))
    ) {
      totalLiabilities += balance;
    }
  });

  const netWorth = totalAssets - totalLiabilities;

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
  };
};

const OverView = (props: any) => {
  const { bankDetails } = props;
  const { totalAssets, totalLiabilities, netWorth } = getNetWorth(
    bankDetails.connections[0].accounts
  );
  const savings = bankDetails.connections[0].accounts.find(
    (account: any) => account.name === "Savings"
  );
  const checking = bankDetails.connections[0].accounts.find(
    (account: any) => account.name === "Checking"
  );
  const transactions = bankDetails.transactions.nodes;
  const { currentIncome, currentExpense, incomeChange, expenseChange } =
    getMonthlyComparisonSummary(transactions);
  const totalBalance =
    parseFloat(savings.balance.current) + parseFloat(checking.balance.current);
  const graphData = getLastSixMonthsSummary(transactions);
  const totalDebited = transactions.reduce((sum: number, tx: any) => {
    if (tx.entryType === "DEBIT") {
      return sum + Math.abs(parseFloat(tx.amount) || 0);
    }
    return sum;
  }, 0);
  const startMonth = graphData[0]?.month || "";
  const endMonth = graphData[graphData.length - 1]?.month || "";
  const chartTitle = `Chart showing monthly income and expense trends from ${startMonth} to ${endMonth}`;
  const currentMonthYear = dayjs().format("MMM YYYY");
  const IncomeIcon = incomeChange.icon;
  const ExpenseIcon = expenseChange.icon;
  const savingsRate =
    currentIncome > 0
      ? ((currentIncome - currentExpense) / currentIncome) * 100
      : 0;
  return (
    <Card
      style={{
        maxWidth: 900,
        margin: "10px",
        borderRadius: 20,
        padding: 4,
        background: "#f9fcff",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
              background: "#ffffff",
            }}
          >
            <Title level={4} style={titleStyle}>
              Total Balance
            </Title>
            <Title level={2} style={{ marginTop: 0 }}>
              ${totalBalance}
            </Title>
            <Text>
              All accounts
              {/* <Text type="success">Checking + Savings</Text> */}
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
              background: "#ffffff",
            }}
          >
            <Title level={4} style={titleStyle}>
              Monthly Income
            </Title>
            <Title level={2} style={{ color: "#27ae60", marginTop: 0 }}>
              ${currentIncome.toFixed(2)}
            </Title>
            <Text>
              {currentMonthYear}
              <Text type="success">
                <IncomeIcon
                  style={{
                    color: incomeChange.icon === RiseOutlined ? "green" : "red",
                  }}
                />{" "}
                <span>{incomeChange.percent}%</span>
              </Text>
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
              background: "#ffffff",
            }}
          >
            <Title level={4} style={titleStyle}>
              Monthly Expenses
            </Title>
            <Title level={2} style={{ color: "#e74c3c", marginTop: 0 }}>
              ${currentExpense.toFixed(2)}
            </Title>
            <Text>
              {currentMonthYear}
              <Text type="danger">
                <ExpenseIcon
                  style={{
                    color:
                      expenseChange.icon === RiseOutlined ? "green" : "red",
                  }}
                />{" "}
                <span>{expenseChange.percent}%</span>
              </Text>
            </Text>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              padding: 20,
              background: "#e9f5ff",
            }}
          >
            <Title level={4} style={{ textAlign: "center" }}>
              Income Vs. Expenses (Last 6 Months)
            </Title>
            <Text
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {chartTitle}
            </Text>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={graphData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#2ecc71"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#e74c3c"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
              background: "#ffffff",
            }}
          >
            <Title level={4} style={titleStyle}>
              Net Worth
            </Title>
            <Title level={2} style={{ marginTop: 0 }}>
              ${netWorth}
            </Title>
            <Text type="success">Total Assets - Total Liabilities</Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
              background: "#ffffff",
            }}
          >
            <Title level={4} style={titleStyle}>
              Total Debt
            </Title>
            <Title level={2} style={{ color: "#e74c3c", marginTop: 0 }}>
              ${totalDebited.toFixed(2)}
            </Title>
            <Text type="danger">
              <FallOutlined /> 1.2% YTD
            </Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              textAlign: "center",
              background: "#ffffff",
            }}
          >
            <Title level={4} style={titleStyle}>
              Savings Rate
            </Title>
            <Title level={2} style={{ color: "#2ecc71", marginTop: 0 }}>
              {savingsRate.toFixed(2)}%
            </Title>
            <Text type="success">
              <RiseOutlined /> 2.1% from last month
            </Text>
          </Card>
        </Col> */}
      </Row>
    </Card>
  );
};

const titleStyle = {
  color: "#666",
  marginBottom: 10,
};

export default OverView;
