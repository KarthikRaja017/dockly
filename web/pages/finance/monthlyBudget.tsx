import { Card, Button } from "antd";
import { Progress } from "antd";
import SpendingByCategory from "./spendingByCategory";

const BudgetCategoryBar = (props: any) => {
  const { category, spent, limit, color } = props;
  const percent = Math.min((spent / limit) * 100, 100);
  const overBudget = spent > limit;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 500,
          marginBottom: 4,
        }}
      >
        <span>{category}</span>
        <span style={{ color: overBudget ? "red" : "#333" }}>
          ${spent.toFixed(2)} / ${limit.toFixed(2)}
        </span>
      </div>
      <Progress
        percent={percent}
        strokeColor={color}
        trailColor="#e0e0e0"
        showInfo={false}
        strokeWidth={10}
      />
    </div>
  );
};

const MonthlyBudget = () => {
  const categories = [
    { category: "Housing", spent: 1850, limit: 1900, color: "green" },
    { category: "Food & Dining", spent: 852.43, limit: 800, color: "red" },
    { category: "Transportation", spent: 412.75, limit: 500, color: "green" },
    { category: "Utilities", spent: 412.75, limit: 300, color: "green" },
    { category: "Entertainment", spent: 345.28, limit: 350, color: "orange" },
  ];

  return (
    <Card
      title="📋 Monthly Budget"
      extra={
        <Button type="text" icon={<span style={{ fontSize: 16 }}>⋯</span>} />
      }
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        background: "#ffffff",
        maxWidth: 1600,
        margin: "0 auto",
      }}
    >
      {categories.map((cat, i) => (
        <BudgetCategoryBar key={i} {...cat} />
      ))}

      <SpendingByCategory />

      <div
        style={{
          marginTop: 20,
          borderTop: "1px solid #eee",
          paddingTop: 16,
          textAlign: "center",
          color: "#555",
          cursor: "pointer",
        }}
      >
        ⚙️ Manage Budget
      </div>
    </Card>
  );
};

export default MonthlyBudget;
