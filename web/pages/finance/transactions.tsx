// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//   Card,
//   Table,
//   Typography,
//   Avatar,
//   Spin,
//   message,
//   Tag,
//   Space,
//   Select,
// } from 'antd';
// import {
//   ShoppingCartOutlined,
//   DollarCircleOutlined,
//   CarOutlined,
//   CoffeeOutlined,
//   LaptopOutlined,
//   HomeOutlined,
//   BankOutlined,
// } from '@ant-design/icons';
// import { useQuilttSession } from '@quiltt/react';
// import {
//   saveBankTransactions,
//   getSavedTransactions,
// } from '../../services/apiConfig';
// import DocklyLoader from '../../utils/docklyLoader';

// const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// const { Text } = Typography;

// const RecentTransactions = ({
//   isFullscreen = false,
//   onViewAll,
// }: {
//   isFullscreen?: boolean;
//   onViewAll?: () => void;
// }) => {
//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [expanded, setExpanded] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [typeFilter, setTypeFilter] = useState<string>('all');
//   const pageSize = 10;

//   const { session } = useQuilttSession();

//   const getIcon = (desc: string) => {
//     const lower = desc.toLowerCase();
//     if (lower.includes('salary') || lower.includes('deposit')) return <DollarCircleOutlined />;
//     if (lower.includes('netflix') || lower.includes('subscription')) return <LaptopOutlined />;
//     if (lower.includes('gas') || lower.includes('transport')) return <CarOutlined />;
//     if (lower.includes('coffee') || lower.includes('restaurant')) return <CoffeeOutlined />;
//     if (lower.includes('home') || lower.includes('rent')) return <HomeOutlined />;
//     if (lower.includes('bank') || lower.includes('transfer')) return <BankOutlined />;
//     return <ShoppingCartOutlined />;
//   };

//   useEffect(() => {
//     fetchAndSaveTransactions();
//   }, []);

//   const fetchAndSaveTransactions = async () => {
//     const user_id = localStorage.getItem('userId');
//     if (!user_id || !session) {
//       message.error('Missing user session or ID');
//       return;
//     }

//     try {
//       setLoading(true);
//       await saveBankTransactions({ session, user_id });
//       const response = await getSavedTransactions({ user_id });
//       const txns = response?.transactions || [];

//       const formattedTxns = txns.map((txn: any, index: number) => ({
//         key: index,
//         name: txn.description,
//         category: txn.entry_type === 'DEBIT' ? 'Debit' : 'Credit',
//         date: new Date(txn.date).toLocaleDateString('en-US', {
//           month: 'short',
//           day: 'numeric',
//           year: '2-digit',
//         }),
//         amount: txn.amount,
//         account: 'Account',
//         icon: getIcon(txn.description),
//         color: txn.amount < 0 ? '#fecaca' : '#bbf7d0',
//         type: txn.entry_type,
//       }));

//       setTransactions(formattedTxns);
//       message.success(`${formattedTxns.length} transactions loaded.`);
//     } catch (err) {
//       console.error('❌ Error fetching or saving transactions:', err);
//       message.error('Failed to load transactions.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewAllClick = () => {
//     if (onViewAll) {
//       onViewAll();
//     } else {
//       setExpanded(true);
//     }
//   };

//   const filteredTransactions = transactions.filter(transaction => {
//     if (typeFilter === 'all') return true;
//     if (typeFilter === 'credit') return transaction.type === 'CREDIT';
//     if (typeFilter === 'debit') return transaction.type === 'DEBIT';
//     return true;
//   });

//   const columns = [
//     {
//       title: 'Type',
//       dataIndex: 'category',
//       key: 'category',
//       width: 100,
//       render: (category: string, record: any) => (
//         <Tag 
//           color={category === 'Credit' ? 'green' : 'red'}
//           style={{ 
//             fontFamily: FONT_FAMILY, 
//             fontSize: '12px',
//             fontWeight: 500,
//             border: 'none',
//           }}
//         >
//           {category}
//         </Tag>
//       ),
//     },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date',
//       width: 100,
//       render: (date: string) => (
//         <Text style={{ 
//           fontFamily: FONT_FAMILY, 
//           fontSize: '13px',
//           color: '#6b7280',
//         }}>
//           {date}
//         </Text>
//       ),
//     },
//     {
//       title: 'Description',
//       dataIndex: 'name',
//       key: 'name',
//       render: (name: string, record: any) => (
//         <Space size={12}>
//           <Avatar
//             style={{
//               backgroundColor: record.color,
//               fontSize: 12,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//             size={32}
//             icon={record.icon}
//           />
//           <div>
//             <Text style={{ 
//               fontWeight: 500, 
//               fontFamily: FONT_FAMILY, 
//               fontSize: '14px', 
//               color: '#111827',
//               display: 'block',
//             }}>
//               {name}
//             </Text>
//             <Text style={{ 
//               fontFamily: FONT_FAMILY, 
//               fontSize: '12px',
//               color: '#9ca3af',
//             }}>
//               {record.account}
//             </Text>
//           </div>
//         </Space>
//       ),
//     },
//     {
//       title: 'Amount',
//       dataIndex: 'amount',
//       key: 'amount',
//       width: 120,
//       align: 'right' as const,
//       render: (amount: number) => (
//         <Text
//           strong
//           style={{
//             color: amount < 0 ? '#ef4444' : '#10b981',
//             fontSize: '14px',
//             fontFamily: FONT_FAMILY,
//             fontWeight: 600,
//           }}
//         >
//           {amount < 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)}
//         </Text>
//       ),
//     },
//   ];

//   return (
//     <Card
//       title={
//         <span style={{ fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
//           Recent Transactions
//         </span>
//       }
//       extra={
//         <Space size={16}>
//           {isFullscreen && (
//             <Select
//               value={typeFilter}
//               onChange={setTypeFilter}
//               style={{ 
//                 width: 120,
//                 fontFamily: FONT_FAMILY,
//               }}
//               size="small"
//               options={[
//                 { value: 'all', label: 'All Types' },
//                 { value: 'credit', label: 'Credit' },
//                 { value: 'debit', label: 'Debit' },
//               ]}
//             />
//           )}
//           {!isFullscreen && (
//             <Text
//               style={{
//                 color: '#3b82f6',
//                 cursor: 'pointer',
//                 fontFamily: FONT_FAMILY,
//                 fontSize: '13px',
//                 fontWeight: 500
//               }}
//               onClick={handleViewAllClick}
//             >
//               View All
//             </Text>
//           )}
//         </Space>
//       }
//       style={{
//         borderRadius: 12,
//         margin: 12,
//         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
//         height: isFullscreen ? 'auto' : 580,
//         display: 'flex',
//         flexDirection: 'column',
//         border: '1px solid #e2e8f0',
//         fontFamily: FONT_FAMILY,
//       }}
//       styles={{
//         header: {
//           position: 'sticky',
//           top: 0,
//           zIndex: 10,
//           backgroundColor: '#ffffff',
//           borderBottom: '1px solid #e2e8f0',
//         },
//         body: {
//           padding: 0,
//           overflow: 'hidden',
//           fontFamily: FONT_FAMILY,
//         }
//       }}
//     >
//       {loading ? (
//         <div style={{ padding: '12px 12px 8px' }}>
//           <DocklyLoader />
//         </div>
//       ) : (
//         <div 
//           style={{
//             height: isFullscreen ? '400px' : 'auto',
//             overflow: isFullscreen ? 'auto' : 'visible',
//             padding: '8px 12px 12px',
//           }}
//         >
//           <Table
//             columns={columns}
//             dataSource={isFullscreen ? filteredTransactions : filteredTransactions.slice(0, 6)}
//             pagination={isFullscreen ? {
//               current: currentPage,
//               pageSize: pageSize,
//               total: filteredTransactions.length,
//               onChange: (page) => setCurrentPage(page),
//               showSizeChanger: false,
//               size: "small",
//               style: { fontFamily: FONT_FAMILY },
//             } : false}
//             size="middle"
//             showHeader={true}
//             style={{ fontFamily: FONT_FAMILY }}
//             className="transactions-table"
//           />
//         </div>
//       )}

//       <style jsx>{`
//         .transactions-table .ant-table-thead > tr > th {
//           background-color: #f8fafc;
//           border-bottom: 1px solid #e2e8f0;
//           font-family: ${FONT_FAMILY};
//           font-size: 13px;
//           font-weight: 600;
//           color: #374151;
//           padding: 12px 16px;
//         }
//         .transactions-table .ant-table-tbody > tr > td {
//           border-bottom: 1px solid #f3f4f6;
//           padding: 12px 16px;
//           font-family: ${FONT_FAMILY};
//         }
//         .transactions-table .ant-table-tbody > tr:hover > td {
//           background-color: #f9fafb;
//         }
//         .transactions-table .ant-table {
//           border-radius: 8px;
//           overflow: hidden;
//         }
//       `}</style>
//     </Card>
//   );
// };

// export default RecentTransactions;

'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Avatar,
  Spin,
  message,
  Tag,
  Space,
  Select,
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarCircleOutlined,
  CarOutlined,
  CoffeeOutlined,
  LaptopOutlined,
  HomeOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useQuilttSession } from '@quiltt/react';
import {
  saveBankTransactions,
  getSavedTransactions,
} from '../../services/apiConfig';
import DocklyLoader from '../../utils/docklyLoader';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Text } = Typography;

const RecentTransactions = ({
  isFullscreen = false,
  onViewAll,
}: {
  isFullscreen?: boolean;
  onViewAll?: () => void;
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const pageSize = 10;

  const { session } = useQuilttSession();

  const getIcon = (desc: string) => {
    const lower = desc.toLowerCase();
    if (lower.includes('salary') || lower.includes('deposit')) return <DollarCircleOutlined />;
    if (lower.includes('netflix') || lower.includes('subscription')) return <LaptopOutlined />;
    if (lower.includes('gas') || lower.includes('transport')) return <CarOutlined />;
    if (lower.includes('coffee') || lower.includes('restaurant')) return <CoffeeOutlined />;
    if (lower.includes('home') || lower.includes('rent')) return <HomeOutlined />;
    if (lower.includes('bank') || lower.includes('transfer')) return <BankOutlined />;
    return <ShoppingCartOutlined />;
  };

  useEffect(() => {
    fetchAndSaveTransactions();
  }, []);

  const fetchAndSaveTransactions = async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id || !session) {
      message.error('Missing user session or ID');
      return;
    }

    try {
      setLoading(true);
      await saveBankTransactions({ session, user_id });
      const response = await getSavedTransactions({ user_id });
      const txns = response?.transactions || [];

      const formattedTxns = txns.map((txn: any, index: number) => ({
        key: index,
        name: txn.description,
        category: txn.entry_type === 'DEBIT' ? 'Debit' : 'Credit',
        date: new Date(txn.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        }),
        amount: txn.amount,
        account: 'Account',
        icon: getIcon(txn.description),
        color: txn.amount < 0 ? '#fecaca' : '#bbf7d0',
        type: txn.entry_type,
      }));

      setTransactions(formattedTxns);
      message.success(`${formattedTxns.length} transactions loaded.`);
    } catch (err) {
      console.error('❌ Error fetching or saving transactions:', err);
      message.error('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllClick = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      setExpanded(true);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'credit') return transaction.type === 'CREDIT';
    if (typeFilter === 'debit') return transaction.type === 'DEBIT';
    return true;
  });

  const columns = [
    {
      title: 'Type',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string, record: any) => (
        <Tag
          color={category === 'Credit' ? 'green' : 'red'}
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: '12px',
            fontWeight: 500,
            border: 'none',
          }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render: (date: string) => (
        <Text style={{
          fontFamily: FONT_FAMILY,
          fontSize: '13px',
          color: '#6b7280',
        }}>
          {date}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space size={12}>
          <Avatar
            style={{
              backgroundColor: record.color,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            size={32}
            icon={record.icon}
          />
          <div>
            <Text style={{
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
              fontSize: '14px',
              color: '#111827',
              display: 'block',
            }}>
              {name}
            </Text>
            <Text style={{
              fontFamily: FONT_FAMILY,
              fontSize: '12px',
              color: '#9ca3af',
            }}>
              {record.account}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <Text
          strong
          style={{
            color: amount < 0 ? '#ef4444' : '#10b981',
            fontSize: '14px',
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
          }}
        >
          {amount < 0 ? '-' : '+'}${Math.abs(amount).toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <Card
      title={
        <span style={{ fontFamily: FONT_FAMILY, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
          Recent Transactions
        </span>
      }
      extra={
        <Space size={16}>
          {isFullscreen && (
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{
                width: 120,
                fontFamily: FONT_FAMILY,
              }}
              size="small"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'credit', label: 'Credit' },
                { value: 'debit', label: 'Debit' },
              ]}
            />
          )}
          {!isFullscreen && (
            <Text
              style={{
                color: '#3b82f6',
                cursor: 'pointer',
                fontFamily: FONT_FAMILY,
                fontSize: '13px',
                fontWeight: 500
              }}
              onClick={handleViewAllClick}
            >
              View All
            </Text>
          )}
        </Space>
      }
      style={{
        borderRadius: 12,
        margin: 12,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        height: isFullscreen ? 'auto' : 580,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e2e8f0',
        fontFamily: FONT_FAMILY,
      }}
      styles={{
        header: {
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        },
        body: {
          padding: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: FONT_FAMILY,
        },
      }}
    >
      {loading ? (
        <div style={{ padding: '12px 12px 8px' }}>
          <DocklyLoader />
        </div>
      ) : (
        <div
          style={{
            height: isFullscreen ? '400px' : 'auto',
            overflow: isFullscreen ? 'auto' : 'visible',
            padding: '8px 12px 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Table
            columns={columns}
            dataSource={isFullscreen ? filteredTransactions : filteredTransactions.slice(0, 6)}
            pagination={isFullscreen ? {
              current: currentPage,
              pageSize: pageSize,
              total: filteredTransactions.length,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
              size: "small",
              style: {
                margin: 0,
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#ffffff',
                paddingTop: 8,
                borderTop: '1px solid #e2e8f0',
                textAlign: 'right',
                fontFamily: FONT_FAMILY,
              },
            } : false}
            size="middle"
            showHeader={true}
            style={{ flex: 1, fontFamily: FONT_FAMILY }}
            className="transactions-table"
          />
        </div>
      )}

      <style jsx>{`
        .transactions-table .ant-table-thead > tr > th {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-family: ${FONT_FAMILY};
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          padding: 12px 16px;
        }
        .transactions-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
          padding: 12px 16px;
          font-family: ${FONT_FAMILY};
        }
        .transactions-table .ant-table-tbody > tr:hover > td {
          background-color: #f9fafb;
        }
        .transactions-table .ant-table {
          border-radius: 8px;
          overflow: hidden;
        }
        .ant-pagination {
          margin: 0 !important;
        }
      `}</style>
    </Card>
  );
};

export default RecentTransactions;