// "use client";
// import { Card, Button, Pagination } from "antd";
// import { Avatar } from "antd";
// import { BankOutlined } from "@ant-design/icons";
// import { useState } from "react";

// const TransactionItem = (props: any) => {
//   const { description, date, amount, entryType, currencyCode, status } =
//     props.data;
//   const isIncome = entryType === "CREDIT";
//   const formattedAmount = `${isIncome ? "+" : "-"}${currencyCode} ${Math.abs(
//     amount
//   ).toFixed(2)}`;

//   const icon = <BankOutlined />;

//   const safeDate =
//     typeof date === "string"
//       ? date
//       : new Date(date).toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "short",
//           day: "numeric",
//         });

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         padding: "12px 0",
//         borderBottom: "1px solid #f0f0f0",
//         justifyContent: "space-between",
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//         <Avatar
//           size="large"
//           style={{
//             backgroundColor: "#e6f4ff",
//             fontSize: 20,
//           }}
//           icon={icon}
//         />
//         <div>
//           <div style={{ fontWeight: 600 }}>{description}</div>
//           <div style={{ color: "#999", fontSize: 13 }}>{entryType}</div>
//         </div>
//       </div>
//       <div style={{ textAlign: "right" }}>
//         <div
//           style={{
//             fontWeight: 600,
//             color: isIncome ? "green" : "red",
//           }}
//         >
//           {formattedAmount}
//         </div>
//         <div style={{ fontSize: 12, color: "#999" }}>{safeDate}</div>
//       </div>
//     </div>
//   );
// };

// const RecentTransactions = (props: any) => {
//   const transactions = Array.isArray(props.transactions)
//     ? props.transactions
//     : [];
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;

//   const startIndex = (currentPage - 1) * pageSize;
//   const currentData = transactions.slice(startIndex, startIndex + pageSize);

//   return (
//     <Card
//       title="💳 Recent Transactions"
//       extra={
//         <Button type="text" icon={<span style={{ fontSize: 16 }}>⋯</span>} />
//       }
//       style={{
//         borderRadius: 16,
//         boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//         background: "#ffffff",
//         maxWidth: 1500,
//       }}
//     >
//       {currentData.map((tx: any, index: number) => (
//         <TransactionItem key={tx.id || index} data={tx} />
//       ))}
//       <div style={{ display: "flex", justifyContent: "end" }}>
//         <Pagination
//           current={currentPage}
//           pageSize={pageSize}
//           total={transactions.length}
//           onChange={(page) => setCurrentPage(page)}
//           style={{ marginTop: 20, textAlign: "right" }}
//         />
//       </div>

//       <div
//         style={{
//           marginTop: 16,
//           padding: "8px 12px",
//           border: "1px solid #ddd",
//           borderRadius: 8,
//           textAlign: "center",
//           cursor: "pointer",
//           color: "#555",
//         }}
//       >
//         🔍 View All Transactions
//       </div>
//     </Card>
//   );
// };

// export default RecentTransactions;



import React from 'react';
import { Card, List, Typography, Avatar, Row, Col } from 'antd';
import {
  ShoppingCartOutlined,
  DollarCircleOutlined,
  CarOutlined,
  CoffeeOutlined,
  LaptopOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const transactions = [
  {
    name: 'Whole Foods Market',
    category: 'Groceries',
    date: 'Today, 2:34 PM',
    amount: -87.43,
    account: 'Chase Checking',
    icon: <ShoppingCartOutlined />,
    color: '#fde68a',
  },
  {
    name: 'Direct Deposit',
    category: 'Income',
    date: 'Jun 15, 9:00 AM',
    amount: 1649.45,
    account: 'Chase Checking',
    icon: <DollarCircleOutlined />,
    color: '#bbf7d0',
  },
  {
    name: 'Shell Gas Station',
    category: 'Transportation',
    date: 'Jun 14, 5:45 PM',
    amount: -52.18,
    account: 'Visa Card',
    icon: <CarOutlined />,
    color: '#fecaca',
  },
  {
    name: 'Chipotle Mexican Grill',
    category: 'Dining Out',
    date: 'Jun 14, 12:30 PM',
    amount: -14.85,
    account: 'Chase Checking',
    icon: <CoffeeOutlined />,
    color: '#bfdbfe',
  },
  {
    name: 'Netflix Subscription',
    category: 'Entertainment',
    date: 'Jun 13, 12:00 AM',
    amount: -19.99,
    account: 'Amex Card',
    icon: <LaptopOutlined />,
    color: '#ddd6fe',
  },
  {
    name: 'Property Management LLC',
    category: 'Housing',
    date: 'Jun 1, 8:00 AM',
    amount: -850.0,
    account: 'Chase Checking',
    icon: <HomeOutlined />,
    color: '#fca5a5',
  },
];

const RecentTransactions = (props: any) => {
  const { isFullscreen = false } = props;
  const formatCurrency = (amount: number) => {
    const formatted = `$${Math.abs(amount).toFixed(2)}`;
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
  };

  return (
    <Card
      title="Recent Transactions"
      extra={isFullscreen ? <></> : <Text style={{ color: '#3b82f6', cursor: 'pointer' }}>View All</Text>}
      style={{
        borderRadius: 16,
        margin: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        // ...(isFullscreen ? { width: 900 } : { width: 900 })
      }}
    >
      <List
        itemLayout="horizontal"
        dataSource={transactions}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: item.color,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  size="large"
                  icon={item.icon}
                />
              }
              title={
                <Text style={{ fontWeight: 500 }}>{item.name}</Text>
              }
              description={
                <Text type="secondary">
                  {item.category} • {item.date}
                </Text>
              }
            />
            <Row style={{ textAlign: 'right' }}>
              <Col span={24}>
                <Text
                  strong
                  style={{
                    color: item.amount < 0 ? '#ef4444' : '#22c55e',
                    fontSize: 16,
                  }}
                >
                  {formatCurrency(item.amount)}
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.account}
                </Text>
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RecentTransactions;
