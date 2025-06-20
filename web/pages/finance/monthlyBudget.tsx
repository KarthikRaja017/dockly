// import { Card, Button } from "antd";
// import { Progress } from "antd";
// import SpendingByCategory from "./spendingByCategory";

// const BudgetCategoryBar = (props: any) => {
//   const { category, spent, limit, color } = props;
//   const percent = Math.min((spent / limit) * 100, 100);
//   const overBudget = spent > limit;

//   return (
//     <div style={{ marginBottom: 16 }}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           fontWeight: 500,
//           marginBottom: 4,
//         }}
//       >
//         <span>{category}</span>
//         <span style={{ color: overBudget ? "red" : "#333" }}>
//           ${spent.toFixed(2)} / ${limit.toFixed(2)}
//         </span>
//       </div>
//       <Progress
//         percent={percent}
//         strokeColor={color}
//         trailColor="#e0e0e0"
//         showInfo={false}
//         strokeWidth={10}
//       />
//     </div>
//   );
// };

// const MonthlyBudget = () => {
//   const categories = [
//     { category: "Housing", spent: 1850, limit: 1900, color: "green" },
//     { category: "Food & Dining", spent: 852.43, limit: 800, color: "red" },
//     { category: "Transportation", spent: 412.75, limit: 500, color: "green" },
//     { category: "Utilities", spent: 412.75, limit: 300, color: "green" },
//     { category: "Entertainment", spent: 345.28, limit: 350, color: "orange" },
//   ];

//   return (
//     <Card
//       title="📋 Monthly Budget"
//       extra={
//         <Button type="text" icon={<span style={{ fontSize: 16 }}>⋯</span>} />
//       }
//       style={{
//         borderRadius: 16,
//         boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//         background: "#ffffff",
//         maxWidth: 1600,
//         margin: "0 auto",
//       }}
//     >
//       {categories.map((cat, i) => (
//         <BudgetCategoryBar key={i} {...cat} />
//       ))}

//       <SpendingByCategory />

//       <div
//         style={{
//           marginTop: 20,
//           borderTop: "1px solid #eee",
//           paddingTop: 16,
//           textAlign: "center",
//           color: "#555",
//           cursor: "pointer",
//         }}
//       >
//         ⚙️ Manage Budget
//       </div>
//     </Card>
//   );
// };

// export default MonthlyBudget;

import React from 'react';
import { Card, Progress, Typography, Row, Col, Avatar, Divider } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  CoffeeOutlined,
  ShoppingCartOutlined,
  SmileOutlined,
  GiftOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const categories = [
  {
    name: 'Housing',
    spent: 850,
    budget: 900,
    type: 'Needs',
    icon: <HomeOutlined style={{ fontSize: 20, color: '#4b5563' }} />,
  },
  {
    name: 'Dining Out',
    spent: 245,
    budget: 300,
    type: 'Wants',
    icon: <CoffeeOutlined style={{ fontSize: 20, color: '#d97706' }} />,
  },
  {
    name: 'Groceries',
    spent: 228,
    budget: 250,
    type: 'Needs',
    icon: <ShoppingCartOutlined style={{ fontSize: 20, color: '#6366f1' }} />,
  },
  {
    name: 'Entertainment',
    spent: 125,
    budget: 150,
    type: 'Wants',
    icon: <SmileOutlined style={{ fontSize: 20, color: '#a855f7' }} />,
  },
  {
    name: 'Shopping',
    spent: 275,
    budget: 300,
    type: 'Wants',
    icon: <GiftOutlined style={{ fontSize: 20, color: '#f97316' }} />,
  },
];

const budgetSummary = [
  {
    percent: 50,
    label: 'Needs',
    spent: 1078,
    total: 1250,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    percent: 30,
    label: 'Wants',
    spent: 645,
    total: 750,
    color: '#f59e0b',
    bg: '#fef9c3',
  },
  {
    percent: 20,
    label: 'Savings',
    spent: 433,
    total: 500,
    color: '#10b981',
    bg: '#d1fae5',
  },
];

const MonthlyBudget = () => {
  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        padding: 24,
        margin: 24,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Monthly Budget
        </Title>
        <Text style={{ color: '#3b82f6', cursor: 'pointer' }}>Edit Budget</Text>
      </div>

      {/* Budget Summary */}
      <Row gutter={16} style={{ marginBottom: 32 }}>
        {budgetSummary.map((item) => (
          <Col span={8} key={item.label}>
            <Card
              style={{
                borderRadius: 12,
                background: item.bg,
                borderColor: item.color,
              }}
              bodyStyle={{ padding: 16 }}
            >
              <Title level={4} style={{ marginBottom: 8 }}>{item.percent}%</Title>
              <Text strong>{item.label}</Text>
              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <Text>
                  ${item.spent} of ${item.total}
                </Text>
              </div>
              <Progress
                percent={Math.round((item.spent / item.total) * 100)}
                strokeColor={item.color}
                trailColor="#f1f5f9"
                showInfo={false}
              />
              <Text style={{ fontSize: 12 }}>{Math.round((item.spent / item.total) * 100)}% {item.label === 'Savings' ? 'saved' : 'used'}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Spending List */}
      <Title level={5} style={{ marginBottom: 16 }}>Spending by Category</Title>
      {categories.map((cat, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: index !== categories.length - 1 ? '1px solid #f0f0f0' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              size={40}
              style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              icon={cat.icon}
            />
            <div>
              <Text style={{ fontWeight: 500 }}>{cat.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                ${cat.spent} of ${cat.budget} • {cat.type}
              </Text>
            </div>
          </div>
          <div>
            <Text strong>${cat.spent.toFixed(2)}</Text>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default MonthlyBudget;
