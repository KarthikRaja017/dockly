import React, { useState, useEffect } from 'react';
import { Card, Progress, Typography, Row, Col, Avatar, Spin, Button, InputNumber, message, Table } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { generateMonthlyBudget, updateMonthlyBudget } from '../../services/apiConfig';
import DocklyLoader from '../../utils/docklyLoader';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title, Text } = Typography;

interface Description {
  spent: number;
  budget: number;
  count: number;
}

interface BudgetCategory {
  spent: number;
  budget: number;
  descriptions: { [key: string]: Description };
}

interface BudgetSummary {
  spent: number;
  total: number;
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  "All Expenses": <HomeOutlined style={{ fontSize: 16, color: '#6b7280' }} />,
};

const MonthlyBudget: React.FC<{ uid: string }> = ({ uid }) => {
  const [categories, setCategories] = useState<{ [key: string]: BudgetCategory }>({});
  const [budgetSummary, setBudgetSummary] = useState<{ [key: string]: BudgetSummary }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState<{ [key: string]: { budget: number; descriptions: { [key: string]: number } } }>({});

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await generateMonthlyBudget({ user_id: uid });
        if (!response || response.status !== 1) {
          throw new Error(response?.error || "Invalid response from server");
        }

        setCategories(response.budget_categories || {});
        setBudgetSummary(response.budget_summary || {});
        setEditedBudgets(response.budget_categories || {});
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load budget data');
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [uid]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedBudgets(
      Object.fromEntries(
        Object.entries(categories).map(([catKey, catValue]) => [
          catKey,
          {
            budget: catValue.budget,
            descriptions: Object.fromEntries(
              Object.entries(catValue.descriptions).map(([descKey, descValue]) => [
                descKey,
                descValue.budget
              ])
            )
          }
        ])
      )
    );
  };

  const handleBudgetChange = (category: string, value: number | null) => {
    if (value === null) return;

    setEditedBudgets(prev => {
      const prevCategory = prev[category] || {};
      const descriptions = prevCategory.descriptions || {};
      const numDescriptions = Object.keys(descriptions).length || 1;
      const perDescriptionBudget = value / numDescriptions;

      const updatedDescriptions = Object.fromEntries(
        Object.entries(descriptions).map(([desc]) => [
          desc,
          perDescriptionBudget
        ])
      );

      return {
        ...prev,
        [category]: {
          ...prevCategory,
          budget: value,
          descriptions: updatedDescriptions
        }
      };
    });
  };

  const handleDescriptionBudgetChange = (
    category: string,
    description: string,
    value: number | null
  ) => {
    if (value === null) return;

    setEditedBudgets(prev => {
      const prevCategory = prev[category] || {};
      const prevDescriptions = prevCategory.descriptions || {};

      return {
        ...prev,
        [category]: {
          ...prevCategory,
          descriptions: {
            ...prevDescriptions,
            [description]: value
          }
        }
      };
    });
  };

  const handleSave = async () => {
    try {
      const updateData = {
        user_id: uid,
        budget_categories: editedBudgets
      };
      const response = await updateMonthlyBudget(updateData);
      if (response.status === 1) {
        const updatedCategories: { [key: string]: BudgetCategory } = Object.fromEntries(
          Object.entries(editedBudgets).map(([catKey, catValue]) => [
            catKey,
            {
              spent: categories[catKey]?.spent || 0,
              budget: catValue.budget,
              descriptions: Object.fromEntries(
                Object.entries(catValue.descriptions).map(([descKey, descBudget]) => [
                  descKey,
                  {
                    spent: categories[catKey]?.descriptions?.[descKey]?.spent || 0,
                    budget: descBudget,
                    count: categories[catKey]?.descriptions?.[descKey]?.count || 0,
                  }
                ])
              )
            }
          ])
        );
        setCategories(updatedCategories);
        recalculateSummary();
        setIsEditing(false);
        message.success('Budget updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update budget');
      }
    } catch (err: any) {
      message.error(err.message || 'Failed to update budget');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedBudgets(
      Object.fromEntries(
        Object.entries(categories).map(([catKey, catValue]) => [
          catKey,
          {
            budget: catValue.budget,
            descriptions: Object.fromEntries(
              Object.entries(catValue.descriptions).map(([descKey, descValue]) => [
                descKey,
                descValue.budget
              ])
            )
          }
        ])
      )
    );
  };

  const recalculateSummary = () => {
    const totalBudget = sum(Object.values(editedBudgets), 'budget');
    const needsBudget = sum(Object.values(editedBudgets).map(c => ({ budget: c.budget || 0 })), 'budget');
    const savingsBudget = totalBudget * 0.2;

    setBudgetSummary({
      Needs: { spent: sum(Object.values(categories).map(c => c.spent || 0), ''), total: needsBudget },
      Savings: { spent: 0, total: savingsBudget }
    });
  };

  const sum = (items: any[], key: string) => items.reduce((sum, item) => sum + (item[key] || 0), 0);

  const tableData: any[] = [];
  const data: BudgetCategory = (isEditing ? editedBudgets : categories)["All Expenses"] as BudgetCategory || { spent: 0, budget: 0, descriptions: {} };
  if (data && Object.keys(data.descriptions).length > 0) {
    tableData.push({
      key: "All Expenses",
      key1: 'spent',
      key2: 'budget',
      name: <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_FAMILY }}><Avatar size={18} icon={categoryIcons["All Expenses"]} />All Expenses</div>,
      spent: `$${('spent' in data ? (data as BudgetCategory).spent : 0).toFixed(2)}`,
      budget: `$${data.budget.toFixed(2)}`,
      count: '',
      isCategory: true,
      edit: isEditing ? <InputNumber
        value={editedBudgets["All Expenses"]?.budget || 0}
        onChange={(value) => handleBudgetChange("All Expenses", value)}
        min={0}
        formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') as unknown as number : 0}
        style={{ width: 90, fontFamily: FONT_FAMILY, fontSize: '12px' }}
      /> : null,
    });
    Object.entries(data.descriptions || {}).forEach(([desc, descData]) => {
      if (descData.count > 5) {
        tableData.push({
          key: `desc-${desc}`,
          name: <Text style={{ marginLeft: 20, fontFamily: FONT_FAMILY, fontSize: '13px' }}>{desc}</Text>,
          spent: `$${descData.spent.toFixed(2)}`,
          budget: `$${descData.budget.toFixed(2)}`,
          count: `(Repeated ${descData.count} times)`,
          isCategory: false,
          edit: isEditing ? <InputNumber
            value={editedBudgets["All Expenses"]?.descriptions[desc] || 0}
            onChange={(value) => handleDescriptionBudgetChange("All Expenses", desc, value)}
            min={0}
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') as unknown as number : 0}
            style={{ width: 90, fontFamily: FONT_FAMILY, fontSize: '12px' }}
          /> : null,
        });
      }
    });
  }

  if (loading) {
    return (
      <DocklyLoader />
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: FONT_FAMILY }}>
        <Card style={{ maxWidth: 400, textAlign: 'center' }}>
          <Text style={{ color: '#ef4444', fontFamily: FONT_FAMILY }}>{error}</Text>
          <Button type="primary" onClick={() => window.location.reload()} style={{ marginTop: 16, fontFamily: FONT_FAMILY }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Card
      style={{
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        maxWidth: '100%',
        minHeight: '680px',
        maxHeight: '75vh',
        margin: '12px',
        overflowY: 'auto',
        transition: '0.3s',
        border: '1px solid #e2e8f0',
        fontFamily: FONT_FAMILY,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 600, color: '#111827' }}>Monthly Budget</Title>
        <Text
          style={{ color: '#3b82f6', cursor: 'pointer', fontFamily: FONT_FAMILY, fontSize: '13px', fontWeight: 500 }}
          onClick={handleEditClick}
        >
          Edit Budget
        </Text>
      </div>

      <Row gutter={12} style={{ marginBottom: 24 }}>
        {Object.entries(budgetSummary).map(([label, data]) => (
          <Col span={12} key={label}>
            <Card
              style={{
                borderRadius: 10,
                background: label === 'Needs' ? 'linear-gradient(145deg, #eff6ff, #dbeafe)' : 'linear-gradient(145deg, #ecfdf5, #d1fae5)',
                border: `1px solid ${label === 'Needs' ? '#bfdbfe' : '#a7f3d0'}`,
                fontFamily: FONT_FAMILY,
              }}
              bodyStyle={{ padding: 12 }}
            >
              <Title level={5} style={{ marginBottom: 6, fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 600 }}>
                {label === 'Needs' ? '80%' : '20%'}
              </Title>
              <Text strong style={{ fontFamily: FONT_FAMILY, fontSize: '13px' }}>{label}</Text>
              <div style={{ marginTop: 6, marginBottom: 6 }}>
                <Text style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }}>${data.spent.toFixed(2)} of ${data.total.toFixed(2)}</Text>
              </div>
              <Progress
                percent={Math.round((data.spent / data.total) * 100)}
                strokeColor={label === 'Needs' ? '#3b82f6' : '#10b981'}
                trailColor="#f1f5f9"
                showInfo={false}
                strokeWidth={6}
              />
              <Text style={{ fontSize: 11, fontFamily: FONT_FAMILY, color: '#6b7280' }}>
                {Math.round((data.spent / data.total) * 100)}% {label === 'Savings' ? 'saved' : 'used'}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Title level={5} style={{ marginBottom: 12, fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 600 }}>Spending by Category</Title>

      <Table
        dataSource={tableData}
        pagination={false}
        showHeader={false}
        size="small"
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Spent',
            dataIndex: 'spent',
            key: 'spent',
            align: 'right',
            render: (text) => <span style={{ fontFamily: FONT_FAMILY, fontSize: '12px', fontWeight: 500 }}>{text}</span>
          },
          {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            align: 'right',
            render: (text) => <span style={{ fontFamily: FONT_FAMILY, fontSize: '12px', color: '#6b7280' }}>{text}</span>
          },
          {
            title: 'Edit',
            dataIndex: 'edit',
            key: 'edit',
            align: 'right',
            render: (text) => text,
          },
        ]}
        rowClassName={(record) => (record.isCategory ? 'category-row' : 'description-row')}
      />

      <style>
        {`
          .category-row {
            font-weight: 600;
            background-color: #f8fafc;
            font-family: ${FONT_FAMILY};
          }
          .description-row {
            margin-left: 16px;
            font-family: ${FONT_FAMILY};
          }
        `}
      </style>

      {isEditing && (
        <div style={{ textAlign: 'right', marginTop: 12 }}>
          <Button onClick={handleCancel} style={{ marginRight: 8, fontFamily: FONT_FAMILY, fontSize: '12px' }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSave} style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }}>
            Save
          </Button>
        </div>
      )}
    </Card>
  );
};

export default MonthlyBudget;