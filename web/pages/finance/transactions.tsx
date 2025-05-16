"use client";
import { Card, Button, Pagination } from "antd";
import { Avatar } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useState } from "react";

const TransactionItem = (props: any) => {
  const { description, date, amount, entryType, currencyCode, status } =
    props.data;
  const isIncome = entryType === "CREDIT";
  const formattedAmount = `${isIncome ? "+" : "-"}${currencyCode} ${Math.abs(
    amount
  ).toFixed(2)}`;

  const icon = <BankOutlined />;

  const safeDate =
    typeof date === "string"
      ? date
      : new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #f0f0f0",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar
          size="large"
          style={{
            backgroundColor: "#e6f4ff",
            fontSize: 20,
          }}
          icon={icon}
        />
        <div>
          <div style={{ fontWeight: 600 }}>{description}</div>
          <div style={{ color: "#999", fontSize: 13 }}>{entryType}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontWeight: 600,
            color: isIncome ? "green" : "red",
          }}
        >
          {formattedAmount}
        </div>
        <div style={{ fontSize: 12, color: "#999" }}>{safeDate}</div>
      </div>
    </div>
  );
};

const RecentTransactions = (props: any) => {
  const transactions = Array.isArray(props.transactions)
    ? props.transactions
    : [];
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = transactions.slice(startIndex, startIndex + pageSize);

  return (
    <Card
      title="💳 Recent Transactions"
      extra={
        <Button type="text" icon={<span style={{ fontSize: 16 }}>⋯</span>} />
      }
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        background: "#ffffff",
        maxWidth: 1500,
      }}
    >
      {currentData.map((tx: any, index: number) => (
        <TransactionItem key={tx.id || index} data={tx} />
      ))}
      <div style={{ display: "flex", justifyContent: "end" }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={transactions.length}
          onChange={(page) => setCurrentPage(page)}
          style={{ marginTop: 20, textAlign: "right" }}
        />
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "8px 12px",
          border: "1px solid #ddd",
          borderRadius: 8,
          textAlign: "center",
          cursor: "pointer",
          color: "#555",
        }}
      >
        🔍 View All Transactions
      </div>
    </Card>
  );
};

export default RecentTransactions;
