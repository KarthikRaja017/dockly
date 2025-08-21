// import React, { useState, useEffect } from 'react';
// import { Card, Progress, Typography, Row, Col, Button, Modal, List, Avatar, InputNumber, Form, message, Select } from 'antd';
// import {
//   HomeOutlined,
//   ShoppingOutlined,
//   DollarOutlined,
//   GiftOutlined,
// } from '@ant-design/icons';
// import { generateMonthlyBudget, updateMonthlyBudget, saveBudgetCategory } from '../../services/apiConfig';

// const { Title, Text } = Typography;
// const { Option } = Select;

// const MonthlyBudget = () => {
//   type Transaction = { transaction_id: string; description: string; amount: number; category?: 'Needs' | 'Wants' | 'Savings' | 'Others' };
//   type BudgetCategory = { spent: number; budget: number; transactions: Transaction[]; count: number };
//   type BudgetSummary = { spent: number; total: number };
//   type SpendingCategory = { name: string; spent: number; budget: number; type: string; icon: string };
//   type BudgetData = {
//     budget_categories: {
//       Needs: BudgetCategory;
//       Wants: BudgetCategory;
//       Savings: BudgetCategory;
//       Others: BudgetCategory;
//     };
//     budget_summary: {
//       Needs: BudgetSummary;
//       Wants: BudgetSummary;
//       Savings: BudgetSummary;
//       Others: BudgetSummary;
//     };
//     spending_by_category: SpendingCategory[];
//     message: string;
//     status?: number;
//     error?: string;
//   };

//   const [budgetData, setBudgetData] = useState<BudgetData>({
//     budget_categories: {
//       Needs: { spent: 0, budget: 0, transactions: [], count: 0 },
//       Wants: { spent: 0, budget: 0, transactions: [], count: 0 },
//       Savings: { spent: 0, budget: 0, transactions: [], count: 0 },
//       Others: { spent: 0, budget: 0, transactions: [], count: 0 },
//     },
//     budget_summary: {
//       Needs: { spent: 0, total: 0 },
//       Wants: { spent: 0, total: 0 },
//       Savings: { spent: 0, total: 0 },
//       Others: { spent: 0, total: 0 },
//     },
//     spending_by_category: [
//       { name: "Groceries", spent: 0, budget: 0, type: "Needs", icon: "DollarOutlined" },
//       { name: "Housing", spent: 0, budget: 0, type: "Needs", icon: "HomeOutlined" },
//       { name: "Entertainment", spent: 0, budget: 0, type: "Wants", icon: "GiftOutlined" },
//       { name: "Shopping", spent: 0, budget: 0, type: "Wants", icon: "ShoppingOutlined" },
//       { name: "Dining Out", spent: 0, budget: 0, type: "Wants", icon: "ShoppingOutlined" },
//     ],
//     message: '',
//   });
//   const [visibleModal, setVisibleModal] = useState(false);
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState<'Needs' | 'Wants' | 'Savings' | 'Others' | null>(null);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(true);
//   const [retryCount, setRetryCount] = useState(0);
//   const maxRetries = 3;

//   const uid = localStorage.getItem('uid') || 'user123';
//   const BUDGET_CATEGORIES = ['Needs', 'Wants', 'Savings', 'Others'];

//   useEffect(() => {
//     const fetchBudget = async () => {
//       try {
//         setLoading(true);
//         console.log(`Fetching monthly budget for user ${uid}`);
//         const response = await generateMonthlyBudget({ uid });
//         console.log('Budget data received:', response.data);

//         if (response.data.status === 1) {
//           // Update budget data with backend response
//           setBudgetData({
//             ...response.data,
//             budget_categories: {
//               Needs: response.data.budget_categories.Needs,
//               Wants: response.data.budget_categories.Wants,
//               Savings: response.data.budget_categories.Savings,
//               Others: response.data.budget_categories.Others,
//             },
//             budget_summary: {
//               Needs: { spent: response.data.budget_summary.Needs.spent, total: response.data.budget_summary.Needs.total },
//               Wants: { spent: response.data.budget_summary.Wants.spent, total: response.data.budget_summary.Wants.total },
//               Savings: { spent: response.data.budget_summary.Savings.spent, total: response.data.budget_summary.Savings.total },
//               Others: { spent: response.data.budget_summary.Others.spent, total: response.data.budget_summary.Others.total },
//             },
//             spending_by_category: response.data.spending_by_category,
//           });
//         } else {
//           throw new Error(response.data.error || 'Failed to fetch monthly budget');
//         }
//       } catch (error: any) {
//         console.error('Error fetching monthly budget:', error.message);
//         if (retryCount < maxRetries) {
//           setRetryCount(retryCount + 1);
//           message.warning(`Retrying budget fetch (${retryCount + 1}/${maxRetries})...`);
//           setTimeout(fetchBudget, 1000 * (retryCount + 1)); // Exponential backoff
//         } else {
//           message.error('Failed to fetch monthly budget after retries. Please try again later.');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBudget();
//   }, [uid, retryCount]);

//   const calculateBudgets = (categories: BudgetData['budget_categories']) => {
//     const totalSpent = Object.values(categories).reduce((sum, cat) => sum + cat.spent, 0);
//     const defaultPercentages = { Needs: 50, Wants: 30, Savings: 20, Others: 0 };
//     console.log(`Calculating budgets with total spent: ${totalSpent}`);
    
//     return {
//       Needs: { spent: categories.Needs.spent, budget: (totalSpent * defaultPercentages.Needs) / 100 },
//       Wants: { spent: categories.Wants.spent, budget: (totalSpent * defaultPercentages.Wants) / 100 },
//       Savings: { spent: categories.Savings.spent, budget: (totalSpent * defaultPercentages.Savings) / 100 },
//       Others: { spent: categories.Others.spent, budget: (totalSpent * defaultPercentages.Others) / 100 },
//     };
//   };

//   const handleViewTransactions = (category: 'Needs' | 'Wants' | 'Savings' | 'Others') => {
//     setSelectedCategory(category);
//     const categoryTransactions = (budgetData.budget_categories[category]?.transactions || []).map((t: any) =>
//       typeof t === 'object' && t !== null
//         ? { transaction_id: t.transaction_id || '', description: t.description || '', amount: t.amount || 0, category: t.category || category }
//         : { transaction_id: '', description: 'Unknown', amount: 0, category }
//     );
//     setTransactions(categoryTransactions);
//     console.log(`Viewing transactions for category ${category}:`, categoryTransactions);
//     setVisibleModal(true);
//   };

//   const handleCloseModal = () => {
//     setVisibleModal(false);
//     setSelectedCategory(null);
//     setTransactions([]);
//     console.log('Closed transactions modal');
//   };

//   const handleEditBudget = () => {
//     form.setFieldsValue({
//       Needs: budgetData.budget_summary.Needs.total,
//       Wants: budgetData.budget_summary.Wants.total,
//       Savings: budgetData.budget_summary.Savings.total,
//       Others: budgetData.budget_summary.Others.total,
//       NeedsPercent: 50,
//       WantsPercent: 30,
//       SavingsPercent: 20,
//       OthersPercent: 0,
//     });
//     setEditModalVisible(true);
//     console.log('Opening edit budget modal with values:', form.getFieldsValue());
//   };

//   const handleUpdateBudget = async (values: { Needs: number; Wants: number; Savings: number; Others: number; NeedsPercent: number; WantsPercent: number; SavingsPercent: number; OthersPercent: number }) => {
//     try {
//       console.log('Updating budget with values:', values);
//       const totalPercent = values.NeedsPercent + values.WantsPercent + values.SavingsPercent + values.OthersPercent;
//       if (totalPercent !== 100) {
//         message.error('Total percentage must equal 100%');
//         console.error('Total percentage is not 100%:', totalPercent);
//         return;
//       }

//       const totalBudget = values.Needs + values.Wants + values.Savings + values.Others;
//       const updatedBudgetCategories = {
//         Needs: { ...budgetData.budget_categories.Needs, budget: values.Needs },
//         Wants: { ...budgetData.budget_categories.Wants, budget: values.Wants },
//         Savings: { ...budgetData.budget_categories.Savings, budget: values.Savings },
//         Others: { ...budgetData.budget_categories.Others, budget: values.Others },
//       };

//       await updateMonthlyBudget({
//         uid,
//         budget_categories: {
//           Needs: { budget: values.Needs },
//           Wants: { budget: values.Wants },
//           Savings: { budget: values.Savings },
//           Others: { budget: values.Others },
//         },
//       });

//       setBudgetData({
//         ...budgetData,
//         budget_categories: updatedBudgetCategories,
//         budget_summary: {
//           Needs: { spent: budgetData.budget_summary.Needs.spent, total: values.Needs },
//           Wants: { spent: budgetData.budget_summary.Wants.spent, total: values.Wants },
//           Savings: { spent: budgetData.budget_summary.Savings.spent, total: values.Savings },
//           Others: { spent: budgetData.budget_summary.Others.spent, total: values.Others },
//         },
//       });

//       message.success('Budget updated successfully');
//       setEditModalVisible(false);
//     } catch (error: any) {
//       message.error(error.message || 'Failed to update budget');
//       console.error('Error updating budget:', error.message);
//     }
//   };

//   const handleChangeCategory = (transactionId: string, newCategory: string) => {
//     setTransactions((prev) =>
//       prev.map((t) =>
//         t.transaction_id === transactionId ? { ...t, category: newCategory as 'Needs' | 'Wants' | 'Savings' | 'Others' } : t
//       )
//     );
//   };

//   const handleSaveChanges = async () => {
//     try {
//       const changes = transactions.filter((t) => t.category !== selectedCategory);
//       if (changes.length === 0) {
//         handleCloseModal();
//         return;
//       }

//       for (const change of changes) {
//         await saveBudgetCategory({ uid, transaction_id: change.transaction_id, category: change.category ?? 'Others' });
//       }

//       const updatedCategories = { ...budgetData.budget_categories };
//       if (selectedCategory) {
//         updatedCategories[selectedCategory].transactions = transactions;
//       }

//       setBudgetData({
//         ...budgetData,
//         budget_categories: updatedCategories,
//       });

//       message.success('Categories updated successfully');
//       handleCloseModal();
//     } catch (error: any) {
//       message.error(error.message || 'Failed to save category changes');
//       console.error('Error saving category changes:', error.message);
//     }
//   };

//   const budgetSummary = [
//     {
//       label: 'Needs',
//       spent: budgetData.budget_summary.Needs.spent,
//       total: budgetData.budget_summary.Needs.total,
//       color: '#3b82f6',
//       bg: '#eff6ff',
//       icon: <HomeOutlined style={{ fontSize: 20, color: '#3b82f6' }} />,
//     },
//     {
//       label: 'Wants',
//       spent: budgetData.budget_summary.Wants.spent,
//       total: budgetData.budget_summary.Wants.total,
//       color: '#d97706',
//       bg: '#fefcbf',
//       icon: <ShoppingOutlined style={{ fontSize: 20, color: '#d97706' }} />,
//     },
//     {
//       label: 'Savings',
//       spent: budgetData.budget_summary.Savings.spent,
//       total: budgetData.budget_summary.Savings.total,
//       color: '#10b981',
//       bg: '#d1fae5',
//       icon: <DollarOutlined style={{ fontSize: 20, color: '#10b981' }} />,
//     },
//     {
//       label: 'Others',
//       spent: budgetData.budget_summary.Others.spent,
//       total: budgetData.budget_summary.Others.total,
//       color: '#6b7280',
//       bg: '#f3f4f6',
//       icon: <GiftOutlined style={{ fontSize: 20, color: '#6b7280' }} />,
//     },
//   ];

//   const getIcon = (iconName: string) => {
//     switch (iconName) {
//       case 'HomeOutlined':
//         return <HomeOutlined style={{ fontSize: 20, color: '#4b5563' }} />;
//       case 'ShoppingOutlined':
//         return <ShoppingOutlined style={{ fontSize: 20, color: '#d97706' }} />;
//       case 'DollarOutlined':
//         return <DollarOutlined style={{ fontSize: 20, color: '#10b981' }} />;
//       case 'GiftOutlined':
//         return <GiftOutlined style={{ fontSize: 20, color: '#6b7280' }} />;
//       default:
//         return <GiftOutlined style={{ fontSize: 20, color: '#6b7280' }} />;
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Card
//       style={{
//         borderRadius: 16,
//         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
//         padding: 24,
//         margin: 10,
//       }}
//       styles={{ body: { padding: 0 } }}
//     >
//       <>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
//           <Title level={4} style={{ margin: 0 }}>
//             Monthly Budget
//           </Title>
//           <Button type="link" onClick={handleEditBudget} style={{ color: '#3b82f6' }}>
//             Edit Budget
//           </Button>
//         </div>

//         <Row gutter={16} style={{ marginBottom: 32 }}>
//           {budgetSummary.map((item: typeof budgetSummary[number], idx: number) => (
//             <Col span={6} key={item.label}>
//               <Card
//                 style={{
//                   borderRadius: 12,
//                   background: item.bg,
//                   borderColor: item.color,
//                 }}
//                 styles={{ body: { padding: 16 } }}
//               >
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
//                   {item.icon}
//                   <Text style={{ fontWeight: 500 }}>{item.label}</Text>
//                 </div>
//                 <div style={{ fontSize: 12, color: 'rgba(10, 4, 4, 1)', alignItems: 'center', gap: 12, marginBottom: 8 }}>
//                   <Text type="secondary">
//                     {item.label === 'Needs' ? '50%' : item.label === 'Wants' ? '30%' : item.label === 'Savings' ? '20%' : '0%'}
//                   </Text>
//                 </div>
//                 <Text strong>${item.spent.toFixed(2)} / ${item.total.toFixed(2)}</Text>
//                 <div style={{ marginTop: 8, marginBottom: 8 }}>
//                   <Progress
//                     percent={item.total ? Math.round((item.spent / item.total) * 100) : 0}
//                     strokeColor={item.color}
//                     trailColor="#f1f5f9"
//                     showInfo={false}
//                   />
//                 </div>
//                 <Button
//                   type="link"
//                   onClick={() => handleViewTransactions(item.label as 'Needs' | 'Wants' | 'Savings' | 'Others')}
//                 >
//                   View Transactions
//                 </Button>
//               </Card>
//             </Col>
//           ))}
//         </Row>

//         <Title level={5} style={{ marginBottom: 16 }}>Spending by Category</Title>
//         {budgetData.spending_by_category.map((cat: typeof budgetData.spending_by_category[number], index: number) => (
//           <div
//             key={index}
//             style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               padding: '12px 0',
//               borderBottom: index !== budgetData.spending_by_category.length - 1 ? '1px solid #f0f0f0' : 'none',
//             }}
//           >
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//               <Avatar
//                 size={40}
//                 style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
//                 icon={getIcon(cat.icon)}
//               />
//               <div>
//                 <Text style={{ fontWeight: 500 }}>{cat.name}</Text>
//                 <br />
//                 <Text type="secondary" style={{ fontSize: 12 }}>
//                   ${cat.spent.toFixed(2)} of ${cat.budget.toFixed(2)}
//                 </Text>
//               </div>
//             </div>
//             <div>
//               <Text strong>${cat.spent.toFixed(2)}</Text>
//             </div>
//           </div>
//         ))}

//         <Modal
//           title={
//             <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1, padding: '16px 24px' }}>
//               {selectedCategory} Transactions ({transactions.length})
//             </div>
//           }
//           open={visibleModal}
//           onCancel={handleCloseModal}
//           footer={
//             <div style={{ position: 'sticky', bottom: 0, background: '#fff', zIndex: 1, padding: '16px 24px', textAlign: 'right' }}>
//               <Button key="save" type="primary" onClick={handleSaveChanges} style={{ marginRight: 8 }}>
//                 Save Changes
//               </Button>
//               <Button key="close" onClick={handleCloseModal}>
//                 Cancel
//               </Button>
//             </div>
//           }
//           style={{ top: 20 }}
//           styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
//         >
//           {transactions.length > 0 ? (
//             <List
//               dataSource={transactions}
//               renderItem={(item: Transaction) => (
//                 <List.Item
//                   actions={[
//                     <Select
//                       value={item.category || selectedCategory}
//                       style={{ width: 120 }}
//                       onChange={(value) => handleChangeCategory(item.transaction_id, value)}
//                     >
//                       {BUDGET_CATEGORIES.map((cat: string) => (
//                         <Option key={cat} value={cat}>
//                           {cat}
//                         </Option>
//                       ))}
//                     </Select>,
//                   ]}
//                 >
//                   <List.Item.Meta
//                     title={<Text style={{ fontWeight: 500 }}>{item.description}</Text>}
//                     description={`Amount: $${item.amount.toFixed(2)}`}
//                   />
//                 </List.Item>
//               )}
//             />
//           ) : (
//             <Text type="secondary">No transactions found for {selectedCategory}</Text>
//           )}
//         </Modal>

//         <Modal
//           title="Edit Monthly Budget"
//           open={editModalVisible}
//           onCancel={() => setEditModalVisible(false)}
//           footer={null}
//         >
//           <Form form={form} onFinish={handleUpdateBudget} layout="vertical">
//             <Form.Item
//               name="NeedsPercent"
//               label="Needs Percentage"
//               rules={[{ required: true, message: 'Please enter Needs percentage' }]}
//             >
//               <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
//             </Form.Item>
//             <Form.Item
//               name="WantsPercent"
//               label="Wants Percentage"
//               rules={[{ required: true, message: 'Please enter Wants percentage' }]}
//             >
//               <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
//             </Form.Item>
//             <Form.Item
//               name="SavingsPercent"
//               label="Savings Percentage"
//               rules={[{ required: true, message: 'Please enter Savings percentage' }]}
//             >
//               <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
//             </Form.Item>
//             <Form.Item
//               name="OthersPercent"
//               label="Others Percentage"
//               rules={[{ required: true, message: 'Please enter Others percentage' }]}
//             >
//               <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
//             </Form.Item>
//             {budgetSummary.map((item: typeof budgetSummary[number]) => (
//               <Form.Item
//                 key={item.label}
//                 name={item.label}
//                 label={`${item.label} Budget`}
//                 rules={[{ required: true, message: `Please enter ${item.label} budget` }]}
//               >
//                 <InputNumber
//                   min={0}
//                   style={{ width: '100%' }}
//                   formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//                   precision={2}
//                 />
//               </Form.Item>
//             ))}
//             <Form.Item>
//               <Button type="primary" htmlType="submit">
//                 Save Budget
//               </Button>
//               <Button style={{ marginLeft: 8 }} onClick={() => setEditModalVisible(false)}>
//                 Cancel
//               </Button>
//             </Form.Item>
//           </Form>
//         </Modal>
//       </>
//     </Card>
//   );
// };

// export default MonthlyBudget;
import React, { useState, useEffect } from 'react';
import { Card, Progress, Typography, Row, Col, Button, Modal, List, Avatar, InputNumber, Form, message, Select } from 'antd';
import {
  HomeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { generateMonthlyBudget, updateMonthlyBudget, updateTransactionCategory } from '../../services/apiConfig';

const { Title, Text } = Typography;
const { Option } = Select;

const MonthlyBudget = () => {
  type Transaction = { transaction_id: string; description: string; amount: number; category?: 'Needs' | 'Wants' | 'Savings' | 'Others' };
  type BudgetCategory = { spent: number; budget: number; transactions: Transaction[]; count: number };
  type BudgetSummary = { spent: number; total: number };
  type SpendingCategory = { name: string; spent: number; budget: number; type: string; icon: string };
  type BudgetData = {
    budget_categories: {
      Needs: BudgetCategory;
      Wants: BudgetCategory;
      Savings: BudgetCategory;
      Others: BudgetCategory;
    };
    budget_summary: {
      Needs: BudgetSummary;
      Wants: BudgetSummary;
      Savings: BudgetSummary;
      Others: BudgetSummary;
    };
    spending_by_category: SpendingCategory[];
    message: string;
    status?: number;
    error?: string;
  };

  const [budgetData, setBudgetData] = useState<BudgetData>({
    budget_categories: {
      Needs: { spent: 0, budget: 0, transactions: [], count: 0 },
      Wants: { spent: 0, budget: 0, transactions: [], count: 0 },
      Savings: { spent: 0, budget: 0, transactions: [], count: 0 },
      Others: { spent: 0, budget: 0, transactions: [], count: 0 },
    },
    budget_summary: {
      Needs: { spent: 0, total: 0 },
      Wants: { spent: 0, total: 0 },
      Savings: { spent: 0, total: 0 },
      Others: { spent: 0, total: 0 },
    },
    spending_by_category: [
      { name: "Groceries", spent: 0, budget: 0, type: "Needs", icon: "DollarOutlined" },
      { name: "Housing", spent: 0, budget: 0, type: "Needs", icon: "HomeOutlined" },
      { name: "Entertainment", spent: 0, budget: 0, type: "Wants", icon: "GiftOutlined" },
      { name: "Shopping", spent: 0, budget: 0, type: "Wants", icon: "ShoppingOutlined" },
      { name: "Dining Out", spent: 0, budget: 0, type: "Wants", icon: "ShoppingOutlined" },
    ],
    message: '',
  });
  const [visibleModal, setVisibleModal] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Needs' | 'Wants' | 'Savings' | 'Others' | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [uid, setUid] = useState<string>('user123'); // Initialize uid with default value
  const maxRetries = 3;
  const BUDGET_CATEGORIES = ['Needs', 'Wants', 'Savings', 'Others'];

  // Access localStorage only on the client side to avoid SSR issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUid = localStorage.getItem('uid') || 'user123';
      setUid(storedUid);
    }
  }, []);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      console.log(`Fetching monthly budget for user ${uid}`);
      const response = await generateMonthlyBudget({ uid });
      console.log('Budget data received:', response.data);

      if (response.data.status === 1) {
        setBudgetData({
          ...response.data,
          budget_categories: {
            Needs: response.data.budget_categories.Needs,
            Wants: response.data.budget_categories.Wants,
            Savings: response.data.budget_categories.Savings,
            Others: response.data.budget_categories.Others,
          },
          budget_summary: {
            Needs: { spent: response.data.budget_summary.Needs.spent, total: response.data.budget_summary.Needs.total },
            Wants: { spent: response.data.budget_summary.Wants.spent, total: response.data.budget_summary.Wants.total },
            Savings: { spent: response.data.budget_summary.Savings.spent, total: response.data.budget_summary.Savings.total },
            Others: { spent: response.data.budget_summary.Others.spent, total: response.data.budget_summary.Others.total },
          },
          spending_by_category: response.data.spending_by_category,
        });
      } else {
        throw new Error(response.data.error || 'Failed to fetch monthly budget');
      }
    } catch (error: any) {
      console.error('Error fetching monthly budget:', error.message);
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        message.warning(`Retrying budget fetch (${retryCount + 1}/${maxRetries})...`);
        setTimeout(fetchBudget, 1000 * (retryCount + 1));
      } else {
        message.error('Failed to fetch monthly budget after retries. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [uid, retryCount]);

  const calculateBudgets = (categories: BudgetData['budget_categories']) => {
    const totalSpent = Object.values(categories).reduce((sum, cat) => sum + cat.spent, 0);
    const defaultPercentages = { Needs: 50, Wants: 30, Savings: 20, Others: 0 };
    console.log(`Calculating budgets with total spent: ${totalSpent}`);
    
    return {
      Needs: { spent: categories.Needs.spent, budget: (totalSpent * defaultPercentages.Needs) / 100 },
      Wants: { spent: categories.Wants.spent, budget: (totalSpent * defaultPercentages.Wants) / 100 },
      Savings: { spent: categories.Savings.spent, budget: (totalSpent * defaultPercentages.Savings) / 100 },
      Others: { spent: categories.Others.spent, budget: (totalSpent * defaultPercentages.Others) / 100 },
    };
  };

  const handleViewTransactions = (category: 'Needs' | 'Wants' | 'Savings' | 'Others') => {
    setSelectedCategory(category);
    const categoryTransactions = (budgetData.budget_categories[category]?.transactions || []).map((t: any) =>
      typeof t === 'object' && t !== null
        ? { transaction_id: t.transaction_id || '', description: t.description || '', amount: t.amount || 0, category: t.category || category }
        : { transaction_id: '', description: 'Unknown', amount: 0, category }
    );
    setTransactions(categoryTransactions);
    console.log(`Viewing transactions for category ${category}:`, categoryTransactions);
    setVisibleModal(true);
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
    setSelectedCategory(null);
    setTransactions([]);
    console.log('Closed transactions modal');
  };

  const handleEditBudget = () => {
    form.setFieldsValue({
      Needs: budgetData.budget_summary.Needs.total,
      Wants: budgetData.budget_summary.Wants.total,
      Savings: budgetData.budget_summary.Savings.total,
      Others: budgetData.budget_summary.Others.total,
      NeedsPercent: 50,
      WantsPercent: 30,
      SavingsPercent: 20,
      OthersPercent: 0,
    });
    setEditModalVisible(true);
    console.log('Opening edit budget modal with values:', form.getFieldsValue());
  };

  const handleUpdateBudget = async (values: { Needs: number; Wants: number; Savings: number; Others: number; NeedsPercent: number; WantsPercent: number; SavingsPercent: number; OthersPercent: number }) => {
    try {
      console.log('Updating budget with values:', values);
      const totalPercent = values.NeedsPercent + values.WantsPercent + values.SavingsPercent + values.OthersPercent;
      if (totalPercent !== 100) {
        message.error('Total percentage must equal 100%');
        console.error('Total percentage is not 100%:', totalPercent);
        return;
      }

      const updatedBudgetCategories = {
        Needs: { ...budgetData.budget_categories.Needs, budget: values.Needs },
        Wants: { ...budgetData.budget_categories.Wants, budget: values.Wants },
        Savings: { ...budgetData.budget_categories.Savings, budget: values.Savings },
        Others: { ...budgetData.budget_categories.Others, budget: values.Others },
      };

      await updateMonthlyBudget({
        uid,
        budget_categories: {
          Needs: { budget: values.Needs },
          Wants: { budget: values.Wants },
          Savings: { budget: values.Savings },
          Others: { budget: values.Others },
        },
      });

      setBudgetData({
        ...budgetData,
        budget_categories: updatedBudgetCategories,
        budget_summary: {
          Needs: { spent: budgetData.budget_summary.Needs.spent, total: values.Needs },
          Wants: { spent: budgetData.budget_summary.Wants.spent, total: values.Wants },
          Savings: { spent: budgetData.budget_summary.Savings.spent, total: values.Savings },
          Others: { spent: budgetData.budget_summary.Others.spent, total: values.Others },
        },
      });

      message.success('Budget updated successfully');
      setEditModalVisible(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to update budget');
      console.error('Error updating budget:', error.message);
    }
  };

  const handleChangeCategory = (transactionId: string, newCategory: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.transaction_id === transactionId ? { ...t, category: newCategory as 'Needs' | 'Wants' | 'Savings' | 'Others' } : t
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      const changes = transactions.filter((t) => t.category !== selectedCategory);
      if (changes.length === 0) {
        handleCloseModal();
        return;
      }

      for (const change of changes) {
        await updateTransactionCategory({
          uid,
          transaction_id: change.transaction_id,
          category: change.category ?? 'Others',
        });
      }

      // Refresh budget data after category changes
      const response = await generateMonthlyBudget({ uid });
      if (response.data.status === 1) {
        setBudgetData({
          ...response.data,
          budget_categories: {
            Needs: response.data.budget_categories.Needs,
            Wants: response.data.budget_categories.Wants,
            Savings: response.data.budget_categories.Savings,
            Others: response.data.budget_categories.Others,
          },
          budget_summary: {
            Needs: { spent: response.data.budget_summary.Needs.spent, total: response.data.budget_summary.Needs.total },
            Wants: { spent: response.data.budget_summary.Wants.spent, total: response.data.budget_summary.Wants.total },
            Savings: { spent: response.data.budget_summary.Savings.spent, total: response.data.budget_summary.Savings.total },
            Others: { spent: response.data.budget_summary.Others.spent, total: response.data.budget_summary.Others.total },
          },
          spending_by_category: response.data.spending_by_category,
        });
      }

      message.success('Categories updated successfully');
      handleCloseModal();
    } catch (error: any) {
      message.error(error.message || 'Failed to save category changes');
      console.error('Error saving category changes:', error.message);
    }
  };

  const budgetSummary = [
    {
      label: 'Needs',
      spent: budgetData.budget_summary.Needs.spent,
      total: budgetData.budget_summary.Needs.total,
      color: '#3b82f6',
      bg: '#eff6ff',
      icon: <HomeOutlined style={{ fontSize: 20, color: '#3b82f6' }} />,
    },
    {
      label: 'Wants',
      spent: budgetData.budget_summary.Wants.spent,
      total: budgetData.budget_summary.Wants.total,
      color: '#d97706',
      bg: '#fefcbf',
      icon: <ShoppingOutlined style={{ fontSize: 20, color: '#d97706' }} />,
    },
    {
      label: 'Savings',
      spent: budgetData.budget_summary.Savings.spent,
      total: budgetData.budget_summary.Savings.total,
      color: '#10b981',
      bg: '#d1fae5',
      icon: <DollarOutlined style={{ fontSize: 20, color: '#10b981' }} />,
    },
    {
      label: 'Others',
      spent: budgetData.budget_summary.Others.spent,
      total: budgetData.budget_summary.Others.total,
      color: '#6b7280',
      bg: '#f3f4f6',
      icon: <GiftOutlined style={{ fontSize: 20, color: '#6b7280' }} />,
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HomeOutlined':
        return <HomeOutlined style={{ fontSize: 20, color: '#4b5563' }} />;
      case 'ShoppingOutlined':
        return <ShoppingOutlined style={{ fontSize: 20, color: '#d97706' }} />;
      case 'DollarOutlined':
        return <DollarOutlined style={{ fontSize: 20, color: '#10b981' }} />;
      case 'GiftOutlined':
        return <GiftOutlined style={{ fontSize: 20, color: '#6b7280' }} />;
      default:
        return <GiftOutlined style={{ fontSize: 20, color: '#6b7280' }} />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        padding: 24,
        margin: 10,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>
            Monthly Budget
          </Title>
          <Button type="link" onClick={handleEditBudget} style={{ color: '#3b82f6' }}>
            Edit Budget
          </Button>
        </div>

        <Row gutter={16} style={{ marginBottom: 32 }}>
          {budgetSummary.map((item: typeof budgetSummary[number], idx: number) => (
            <Col span={6} key={item.label}>
              <Card
                style={{
                  borderRadius: 12,
                  background: item.bg,
                  borderColor: item.color,
                }}
                styles={{ body: { padding: 16 } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  {item.icon}
                  <Text style={{ fontWeight: 500 }}>{item.label}</Text>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(10, 4, 4, 1)', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Text type="secondary">
                    {item.label === 'Needs' ? '50%' : item.label === 'Wants' ? '30%' : item.label === 'Savings' ? '20%' : '0%'}
                  </Text>
                </div>
                <Text strong>${item.spent.toFixed(2)} / ${item.total.toFixed(2)}</Text>
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  <Progress
                    percent={item.total ? Math.round((item.spent / item.total) * 100) : 0}
                    strokeColor={item.color}
                    trailColor="#f1f5f9"
                    showInfo={false}
                  />
                </div>
                <Button
                  type="link"
                  onClick={() => handleViewTransactions(item.label as 'Needs' | 'Wants' | 'Savings' | 'Others')}
                >
                  View Transactions
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        <Title level={5} style={{ marginBottom: 16 }}>Spending by Category</Title>
        {budgetData.spending_by_category.map((cat: typeof budgetData.spending_by_category[number], index: number) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index !== budgetData.spending_by_category.length - 1 ? '1px solid #f0f0f0' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar
                size={40}
                style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                icon={getIcon(cat.icon)}
              />
              <div>
                <Text style={{ fontWeight: 500 }}>{cat.name}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ${cat.spent.toFixed(2)} of ${cat.budget.toFixed(2)}
                </Text>
              </div>
            </div>
            <div>
              <Text strong>${cat.spent.toFixed(2)}</Text>
            </div>
          </div>
        ))}

        <Modal
          title={
            <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1, padding: '16px 24px' }}>
              {selectedCategory} Transactions ({transactions.length})
            </div>
          }
          open={visibleModal}
          onCancel={handleCloseModal}
          footer={
            <div style={{ position: 'sticky', bottom: 0, background: '#fff', zIndex: 1, padding: '16px 24px', textAlign: 'right' }}>
              <Button key="save" type="primary" onClick={handleSaveChanges} style={{ marginRight: 8 }}>
                Save Changes
              </Button>
              <Button key="close" onClick={handleCloseModal}>
                Cancel
              </Button>
            </div>
          }
          style={{ top: 20 }}
          styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
        >
          {transactions.length > 0 ? (
            <List
              dataSource={transactions}
              renderItem={(item: Transaction) => (
                <List.Item
                  actions={[
                    <Select
                      value={item.category || selectedCategory}
                      style={{ width: 120 }}
                      onChange={(value) => handleChangeCategory(item.transaction_id, value)}
                    >
                      {BUDGET_CATEGORIES.map((cat: string) => (
                        <Option key={cat} value={cat}>
                          {cat}
                        </Option>
                      ))}
                    </Select>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text style={{ fontWeight: 500 }}>{item.description}</Text>}
                    description={`Amount: $${item.amount.toFixed(2)}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">No transactions found for {selectedCategory}</Text>
          )}
        </Modal>

        <Modal
          title="Edit Monthly Budget"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleUpdateBudget} layout="vertical">
            <Form.Item
              name="NeedsPercent"
              label="Needs Percentage"
              rules={[{ required: true, message: 'Please enter Needs percentage' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
            <Form.Item
              name="WantsPercent"
              label="Wants Percentage"
              rules={[{ required: true, message: 'Please enter Wants percentage' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
            <Form.Item
              name="SavingsPercent"
              label="Savings Percentage"
              rules={[{ required: true, message: 'Please enter Savings percentage' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
            <Form.Item
              name="OthersPercent"
              label="Others Percentage"
              rules={[{ required: true, message: 'Please enter Others percentage' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
            {budgetSummary.map((item: typeof budgetSummary[number]) => (
              <Form.Item
                key={item.label}
                name={item.label}
                label={`${item.label} Budget`}
                rules={[{ required: true, message: `Please enter ${item.label} budget` }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  precision={2}
                />
              </Form.Item>
            ))}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Budget
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={() => setEditModalVisible(false)}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </>
    </Card>
  );
};

export default MonthlyBudget;