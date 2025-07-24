// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Card, Typography, Spin, Button, InputNumber, message, Table,
//   Avatar, Modal, Col, Row, Progress
// } from 'antd';
// import { HomeOutlined } from '@ant-design/icons';
// import { generateMonthlyBudget, updateMonthlyBudget } from '../../services/apiConfig';

// const { Title, Text } = Typography;

// const categoryIcons = {
//   "All Expenses": <HomeOutlined style={{ fontSize: 20, color: '#4b5563' }} />,
// };

// // Types
// interface Description {
//   spent: number;
//   budget: number;
//   count: number;
// }
// interface Transaction {
//   description: string;
//   amount: number;
//   date: string;
// }
// interface BudgetCategory {
//   spent: number;
//   budget: number;
//   descriptions: Record<string, Description>;
//   all_transactions: Record<string, Transaction[]>;
// }
// interface BudgetSummary {
//   spent: number;
//   total: number;
// }

// const MonthlyBudget: React.FC<{ uid: string }> = ({ uid }) => {
//   const [categories, setCategories] = useState<{ [key: string]: BudgetCategory }>({});
//   const [budgetSummary, setBudgetSummary] = useState<Record<string, BudgetSummary>>({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedBudgets, setEditedBudgets] = useState<any>({});
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [modalTransactions, setModalTransactions] = useState<Transaction[]>([]);
//   const [modalCategory, setModalCategory] = useState<string>('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await generateMonthlyBudget({ user_id: uid });

//         if (!res || res.status !== 1) throw new Error(res?.error || 'Failed to load data');

//         const budgetData = res.budget_categories || {};
//         setCategories(budgetData);

//         const allExpenses = budgetData["All Expenses"];
//         const descriptions = allExpenses?.descriptions || {};

//         setBudgetSummary({
//           Needs: { spent: descriptions.Needs?.spent || 0, total: descriptions.Needs?.budget || 0 },
//           Wants: { spent: descriptions.Wants?.spent || 0, total: descriptions.Wants?.budget || 0 },
//           Savings: { spent: descriptions.Savings?.spent || 0, total: descriptions.Savings?.budget || 0 },
//           Other: { spent: descriptions.Other?.spent || 0, total: descriptions.Other?.budget || 0 }
//         });

//         setEditedBudgets({
//           "All Expenses": {
//             budget: allExpenses?.budget || 0,
//             descriptions: {
//               Needs: descriptions.Needs?.budget || 0,
//               Wants: descriptions.Wants?.budget || 0,
//               Savings: descriptions.Savings?.budget || 0,
//               Other: descriptions.Other?.budget || 0,
//             }
//           }
//         });
//       } catch (err: any) {
//         setError(err.message || 'Error loading budget');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [uid]);

//   const calculatePercentages = (desc: Record<string, number>) => {
//     const total = Object.values(desc).reduce((a, b) => a + b, 0) || 1;
//     return {
//       Needs: ((desc.Needs / total) * 100).toFixed(1) + '%',
//       Wants: ((desc.Wants / total) * 100).toFixed(1) + '%',
//       Savings: ((desc.Savings / total) * 100).toFixed(1) + '%',
//       Other: ((desc.Other / total) * 100).toFixed(1) + '%',
//     };
//   };

//   const handleEditClick = () => {
//     const all = categories["All Expenses"];
//     setIsEditing(true);
//     setEditedBudgets({
//       "All Expenses": {
//         budget: all.budget,
//         descriptions: {
//           Needs: all.descriptions.Needs?.budget || 0,
//           Wants: all.descriptions.Wants?.budget || 0,
//           Savings: all.descriptions.Savings?.budget || 0,
//           Other: all.descriptions.Other?.budget || 0,
//         }
//       }
//     });
//   };

//   const handleBudgetChange = (category: string, value: number | null) => {
//     if (value === null) return;
//     const desc = editedBudgets[category].descriptions;
//     const sum = Object.values(desc).reduce((a: number, b) => a + (b as number), 0) || 1;

//     setEditedBudgets({
//       [category]: {
//         budget: value,
//         descriptions: Object.fromEntries(
//           Object.entries(desc).map(([k, v]) => [
//             k,
//             Math.round(((Number(v) / Number(sum)) * Number(value || 0) * 100)) / 100,
//           ])
//         )
//       }
//     });
//   };

//   const handleDescriptionBudgetChange = (category: string, desc: string, value: number | null) => {
//     if (value === null) return;
//     const newDesc = { ...editedBudgets[category].descriptions, [desc]: value };
//     const total = Object.values(newDesc).reduce((a: number, b) => a + (b as number), 0);
//     setEditedBudgets({
//       [category]: {
//         budget: total,
//         descriptions: newDesc
//       }
//     });
//   };

//   const handleSave = async () => {
//     try {
//       const res = await updateMonthlyBudget({ user_id: uid, budget_categories: editedBudgets });
//       if (res.status === 1) {
//         message.success('Budget updated!');
//         setIsEditing(false);
//         window.location.reload(); // or re-fetch state
//       } else {
//         throw new Error(res.error || 'Failed to update');
//       }
//     } catch (err: any) {
//       message.error(err.message || 'Update failed');
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//   };

//   const showTransactions = (category: string) => {
//     const txns = categories["All Expenses"]?.all_transactions?.[category] || [];
//     if (txns.length) {
//       setModalCategory(category);
//       setModalTransactions(txns);
//       setIsModalVisible(true);
//     }
//   };

//   const data = categories["All Expenses"];
//   const tableData: any[] = [];
//   if (data) {
//     const percents = calculatePercentages(
//       Object.fromEntries(
//         Object.entries(data.descriptions).map(([k, v]) => [k, v.budget])
//       )
//     );

//     tableData.push({
//       key: 'all',
//       name: <><Avatar size={20} icon={categoryIcons["All Expenses"]} /> All Expenses</>,
//       spent: `$${data.spent.toFixed(2)}`,
//       budget: isEditing ? (
//         <InputNumber
//           value={editedBudgets["All Expenses"].budget}
//           onChange={(val) => handleBudgetChange("All Expenses", val)}
//           formatter={(val) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//           parser={(val) => parseFloat(val?.replace(/\$\s?|(,*)/g, '') || '0')}
//         />
//       ) : `$${data.budget.toFixed(2)}`
//     });

//     ["Needs", "Wants", "Savings", "Other"].forEach((cat) => {
//       const d = data.descriptions[cat];
//       tableData.push({
//         key: cat,
//         name: <Text onClick={() => showTransactions(cat)} style={{ marginLeft: 24, color: '#3b82f6', cursor: 'pointer' }}>{cat}</Text>,
//         spent: `$${d.spent.toFixed(2)}`,
//         budget: isEditing ? (
//           <InputNumber
//             value={editedBudgets["All Expenses"].descriptions[cat]}
//             onChange={(val) => handleDescriptionBudgetChange("All Expenses", cat, val)}
//             formatter={(val) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//             parser={(val) => parseFloat(val?.replace(/\$\s?|(,*)/g, '') || '0')}
//           />
//         ) : `$${d.budget.toFixed(2)}`
//       });
//     });
//   }

//   if (loading) return <Spin style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }} />;

//   return (
//     <Card style={{ margin: 24 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//         <Title level={4}>Monthly Budget</Title>
//         {!isEditing && <Text style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={handleEditClick}>Edit Budget</Text>}
//       </div>

//       <Row gutter={16}>
//         {["Needs", "Wants", "Savings", "Other"].map((label) => {
//           const { spent = 0, total = 0 } = budgetSummary[label] || {};
//           const percentUsed = total ? Math.round((spent / total) * 100) : 0;
//           const percentLabel = ((total / Object.values(budgetSummary).reduce((s, x) => s + x.total, 1)) * 100).toFixed(1) + '%';

//           return (
//             <Col span={6} key={label}>
//               <Card style={{ height: 200, background: '#f9fafb' }}>
//                 <Title level={5}>{label}</Title>
//                 <Text>{percentLabel}</Text>
//                 <div><Text>${spent.toFixed(2)} / ${total.toFixed(2)}</Text></div>
//                 <Progress percent={percentUsed} />
//               </Card>
//             </Col>
//           );
//         })}
//       </Row>

//       <Title level={5} style={{ marginTop: 24 }}>Spending by Category</Title>
//       <Table
//         dataSource={tableData}
//         pagination={false}
//         showHeader={false}
//         columns={[
//           { title: 'Category', dataIndex: 'name', key: 'name' },
//           { title: 'Spent', dataIndex: 'spent', key: 'spent', align: 'right' },
//           { title: 'Budget', dataIndex: 'budget', key: 'budget', align: 'right' },
//         ]}
//       />

//       <Modal
//         title={`Transactions for ${modalCategory}`}
//         open={isModalVisible}
//         onCancel={() => setIsModalVisible(false)}
//         footer={null}
//       >
//         <Table
//           dataSource={modalTransactions.map((txn, idx) => ({ ...txn, key: idx }))}
//           columns={[
//             { title: 'Description', dataIndex: 'description' },
//             { title: 'Amount', dataIndex: 'amount', align: 'right', render: val => `$${val.toFixed(2)}` },
//             { title: 'Date', dataIndex: 'date', align: 'right' },
//           ]}
//           pagination={{ pageSize: 8 }}
//         />
//       </Modal>

//       {isEditing && (
//         <div style={{ textAlign: 'right', marginTop: 16 }}>
//           <Button onClick={handleCancel} style={{ marginRight: 8 }}>Cancel</Button>
//           <Button type="primary" onClick={handleSave}>Save</Button>
//         </div>
//       )}
//     </Card>
//   );
// };

// export default MonthlyBudget;


const MonthlyBudget = () => {
  return (
    <div>
      <h1>Monthly Budget</h1>
      <p>Coming soon...</p>
    </div>
  );
};
export default MonthlyBudget;
