// import React, { useState, useEffect } from 'react';
// import { Card, Progress, Typography, Row, Col, Avatar, Spin, Button, InputNumber, message, Table } from 'antd';
// import { HomeOutlined } from '@ant-design/icons'; // Using HomeOutlined as a generic icon
// import { generateMonthlyBudget, updateMonthlyBudget } from '../../services/apiConfig';

// const { Title, Text } = Typography;

// interface Description {
//   spent: number;
//   budget: number;
//   count: number;
// }

// interface BudgetCategory {
//   spent: number;
//   budget: number;
//   descriptions: { [key: string]: Description };
// }

// interface BudgetSummary {
//   spent: number;
//   total: number;
// }

// const categoryIcons: { [key: string]: React.ReactNode } = {
//   "All Expenses": <HomeOutlined style={{ fontSize: 20, color: '#4b5563' }} />,
// };

// const MonthlyBudget: React.FC<{ uid: string }> = ({ uid }) => {
//   const [categories, setCategories] = useState<{ [key: string]: BudgetCategory }>({});
//   const [budgetSummary, setBudgetSummary] = useState<{ [key: string]: BudgetSummary }>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedBudgets, setEditedBudgets] = useState<{ [key: string]: { budget: number; descriptions: { [key: string]: number } } }>({});

//   useEffect(() => {
//     const fetchBudgetData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await generateMonthlyBudget({ user_id: uid });
//         if (!response || response.status !== 1) {
//           throw new Error(response?.error || "Invalid response from server");
//         }

//         setCategories(response.budget_categories || {});
//         setBudgetSummary(response.budget_summary || {});
//         setEditedBudgets(response.budget_categories || {});
//         setLoading(false);
//       } catch (err: any) {
//         setError(err.message || 'Failed to load budget data');
//         setLoading(false);
//       }
//     };

//     fetchBudgetData();
//   }, [uid]);

//   const handleEditClick = () => {
//     setIsEditing(true);
//     setEditedBudgets(
//       Object.fromEntries(
//         Object.entries(categories).map(([catKey, catValue]) => [
//           catKey,
//           {
//             budget: catValue.budget,
//             descriptions: Object.fromEntries(
//               Object.entries(catValue.descriptions).map(([descKey, descValue]) => [
//                 descKey,
//                 descValue.budget
//               ])
//             )
//           }
//         ])
//       )
//     );
//   };
//   const handleBudgetChange = (category: string, value: number | null) => {
//     if (value === null) return;

//     setEditedBudgets(prev => {
//       const prevCategory = prev[category] || {};
//       const descriptions = prevCategory.descriptions || {};
//       const numDescriptions = Object.keys(descriptions).length || 1;
//       const perDescriptionBudget = value / numDescriptions;

//       const updatedDescriptions = Object.fromEntries(
//         Object.entries(descriptions).map(([desc]) => [
//           desc,
//           perDescriptionBudget
//         ])
//       );

//       return {
//         ...prev,
//         [category]: {
//           ...prevCategory,
//           budget: value,
//           descriptions: updatedDescriptions
//         }
//       };
//     });
//   };

//   const handleDescriptionBudgetChange = (
//     category: string,
//     description: string,
//     value: number | null
//   ) => {
//     if (value === null) return;

//     setEditedBudgets(prev => {
//       const prevCategory = prev[category] || {};
//       const prevDescriptions = prevCategory.descriptions || {};

//       return {
//         ...prev,
//         [category]: {
//           ...prevCategory,
//           descriptions: {
//             ...prevDescriptions,
//             [description]: value
//           }
//         }
//       };
//     });
//   };

//   const handleSave = async () => {
//     try {
//       const updateData = {
//         user_id: uid,
//         budget_categories: editedBudgets
//       };
//       const response = await updateMonthlyBudget(updateData);
//       if (response.status === 1) {
//         // Convert editedBudgets to BudgetCategory shape
//         const updatedCategories: { [key: string]: BudgetCategory } = Object.fromEntries(
//           Object.entries(editedBudgets).map(([catKey, catValue]) => [
//             catKey,
//             {
//               spent: categories[catKey]?.spent || 0,
//               budget: catValue.budget,
//               descriptions: Object.fromEntries(
//                 Object.entries(catValue.descriptions).map(([descKey, descBudget]) => [
//                   descKey,
//                   {
//                     spent: categories[catKey]?.descriptions?.[descKey]?.spent || 0,
//                     budget: descBudget,
//                     count: categories[catKey]?.descriptions?.[descKey]?.count || 0,
//                   }
//                 ])
//               )
//             }
//           ])
//         );
//         setCategories(updatedCategories);
//         recalculateSummary();
//         setIsEditing(false);
//         message.success('Budget updated successfully');
//       } else {
//         throw new Error(response.error || 'Failed to update budget');
//       }
//     } catch (err: any) {
//       message.error(err.message || 'Failed to update budget');
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setEditedBudgets(
//       Object.fromEntries(
//         Object.entries(categories).map(([catKey, catValue]) => [
//           catKey,
//           {
//             budget: catValue.budget,
//             descriptions: Object.fromEntries(
//               Object.entries(catValue.descriptions).map(([descKey, descValue]) => [
//                 descKey,
//                 descValue.budget
//               ])
//             )
//           }
//         ])
//       )
//     );
//   };

//   const recalculateSummary = () => {
//     const totalBudget = sum(Object.values(editedBudgets), 'budget');
//     const needsBudget = sum(Object.values(editedBudgets).map(c => ({ budget: c.budget || 0 })), 'budget');
//     const savingsBudget = totalBudget * 0.2;

//     setBudgetSummary({
//       Needs: { spent: sum(Object.values(categories).map(c => c.spent || 0), ''), total: needsBudget },
//       Savings: { spent: 0, total: savingsBudget }
//     });
//   };

//   const sum = (items: any[], key: string) => items.reduce((sum, item) => sum + (item[key] || 0), 0);

//   // Prepare table data
//   const tableData: any[] = [];
//   const data: BudgetCategory = (isEditing ? editedBudgets : categories)["All Expenses"] as BudgetCategory || { spent: 0, budget: 0, descriptions: {} };
//   if (data && Object.keys(data.descriptions).length > 0) {
//     tableData.push({
//       key: "All Expenses",
//       key1: 'spent',
//       key2: 'budget',
//       name: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar size={20} icon={categoryIcons["All Expenses"]} />All Expenses</div>,
//       spent: `$${('spent' in data ? (data as BudgetCategory).spent : 0).toFixed(2)}`,
//       budget: `$${data.budget.toFixed(2)}`,
//       count: '',
//       isCategory: true,
//       edit: isEditing ? <InputNumber
//         value={editedBudgets["All Expenses"]?.budget || 0}
//         onChange={(value) => handleBudgetChange("All Expenses", value)}
//         min={0}
//         formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//         parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') as unknown as number : 0}
//         style={{ width: 100 }}
//       /> : null,
//     });
//     Object.entries(data.descriptions || {}).forEach(([desc, descData]) => {
//       if (descData.count > 5) { // Filter for > 5 repetitions
//         tableData.push({
//           key: `desc-${desc}`,
//           name: <Text style={{ marginLeft: 24 }}>{desc}</Text>,
//           spent: `$${descData.spent.toFixed(2)}`,
//           budget: `$${descData.budget.toFixed(2)}`,
//           count: `(Repeated ${descData.count} times)`,
//           isCategory: false,
//           edit: isEditing ? <InputNumber
//             value={editedBudgets["All Expenses"]?.descriptions[desc] || 0}
//             onChange={(value) => handleDescriptionBudgetChange("All Expenses", desc, value)}
//             min={0}
//             formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//             parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') as unknown as number : 0}
//             style={{ width: 100 }}
//           /> : null,
//         });
//       }
//     });
//   }

//   if (loading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <Card style={{ maxWidth: 400, textAlign: 'center' }}>
//           <Text style={{ color: '#f5222d' }}>{error}</Text>
//           <Button type="primary" onClick={() => window.location.reload()} style={{ marginTop: 16 }}>
//             Retry
//           </Button>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <Card
//       style={{
//         background: 'linear-gradient(145deg, rgb(255, 255, 255), rgb(249, 250, 251))',
//         borderRadius: '16px',
//         padding: '1.5rem',
//         boxShadow: 'rgba(0, 0, 0, 0.1) 0px 8px 24px',
//         maxWidth: '100%',
//         // width: 'min(400px, 90vw)',
//         minHeight: '716px',
//         maxHeight: '80vh',
//         margin: '20px',
//         overflowY: 'auto',
//         transition: '0.3s',
//         marginTop: '25px',
//       }}
//       bodyStyle={{ padding: 0 }}
//     >
//       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
//         <Title level={4} style={{ margin: 0 }}>Monthly Budget</Title>
//         <Text
//           style={{ color: '#3b82f6', cursor: 'pointer' }}
//           onClick={handleEditClick}
//         >
//           Edit Budget
//         </Text>
//       </div>

//       {/* Budget Summary */}
//       <Row gutter={16} style={{ marginBottom: 32 }}>
//         {Object.entries(budgetSummary).map(([label, data]) => (
//           <Col span={12} key={label}>
//             <Card
//               style={{
//                 borderRadius: 12,
//                 background: label === 'Needs' ? '#eff6ff' : '#d1fae5',
//                 borderColor: label === 'Needs' ? '#3b82f6' : '#10b981',
//               }}
//               bodyStyle={{ padding: 16 }}
//             >
//               <Title level={4} style={{ marginBottom: 8 }}>
//                 {label === 'Needs' ? '80%' : '20%'}
//               </Title>
//               <Text strong>{label}</Text>
//               <div style={{ marginTop: 8, marginBottom: 8 }}>
//                 <Text>${data.spent.toFixed(2)} of ${data.total.toFixed(2)}</Text>
//               </div>
//               <Progress
//                 percent={Math.round((data.spent / data.total) * 100)}
//                 strokeColor={label === 'Needs' ? '#3b82f6' : '#10b981'}
//                 trailColor="#f1f5f9"
//                 showInfo={false}
//               />
//               <Text style={{ fontSize: 12 }}>
//                 {Math.round((data.spent / data.total) * 100)}% {label === 'Savings' ? 'saved' : 'used'}
//               </Text>
//             </Card>
//           </Col>
//         ))}
//       </Row>
//       <Title level={5} style={{ marginBottom: 16 }}>Spending by Category</Title>

//       <Table
//         dataSource={tableData}
//         pagination={false}
//         showHeader={false}
//         columns={[
//           {
//             title: 'Name',
//             dataIndex: 'name',
//             key: 'name',
//           },
//           {
//             title: 'Spent',
//             dataIndex: 'spent',
//             key: 'spent',
//             align: 'right',
//           },
//           {
//             title: 'Budget',
//             dataIndex: 'budget',
//             key: 'budget',
//             align: 'right',
//           },
//           // {
//           //   title: 'Count',
//           //   dataIndex: 'count',
//           //   key: 'count',
//           //   align: 'right',
//           // },
//           {
//             title: 'Edit',
//             dataIndex: 'edit',
//             key: 'edit',
//             align: 'right',
//             render: (text) => text,
//           },
//         ]}
//         rowClassName={(record) => (record.isCategory ? 'category-row' : 'description-row')}
//       />

//       <style>
//         {`
//           .category-row {
//             font-weight: bold;
//             background-color: #f9fafb;
//           }
//           .description-row {
//             margin-left: 20px;
//           }
//         `}
//       </style>

//       {isEditing && (
//         <div style={{ textAlign: 'right', marginTop: 16 }}>
//           <Button onClick={handleCancel} style={{ marginRight: 8 }}>
//             Cancel
//           </Button>
//           <Button type="primary" onClick={handleSave}>
//             Save
//           </Button>
//         </div>
//       )}
//     </Card>
//   );
// };

// export default MonthlyBudget;


const A = () => {

  return (
    <div>MonthlyBudget</div>
  )
}

export default A