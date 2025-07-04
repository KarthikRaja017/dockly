'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  List,
  Typography,
  Avatar,
  Row,
  Col,
  Spin,
  message,
  Pagination,
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

      const formattedTxns = txns.map((txn: any) => ({
        name: txn.description,
        category: txn.entry_type === 'DEBIT' ? 'Debit' : 'Credit',
        date: new Date(txn.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        amount: txn.amount,
        account: 'Account',
        icon: getIcon(txn.description),
        color: txn.amount < 0 ? '#fecaca' : '#bbf7d0',
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

  const displayedTransactions = isFullscreen
    ? transactions.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : transactions.slice(0, 6);

  const handleViewAllClick = () => {
    if (onViewAll) {
      onViewAll(); // 🔁 Let parent handle navigation
    } else {
      setExpanded(true);
    }
  };

  return (
    <Card
      title="Recent Transactions"
      extra={
        !isFullscreen && (
          <Text style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={handleViewAllClick}>
            View All
          </Text>
        )
      }
      style={{
        borderRadius: 16,
        margin: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        height: isFullscreen ? 'auto' : 520,
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        paddingRight: 12,
        paddingTop: 8,
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <DocklyLoader />
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={displayedTransactions}
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
                  title={<Text style={{ fontWeight: 500 }}>{item.name}</Text>}
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
                      {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
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
          {isFullscreen && (
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={transactions.length}
              onChange={(page) => setCurrentPage(page)}
              style={{ textAlign: 'right', marginTop: 12 }}
              showSizeChanger={false}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default RecentTransactions;