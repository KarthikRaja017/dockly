
import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar } from 'antd';
import { getAccounts, getExpenseIncome } from '../../services/apiConfig';
import { useRouter } from 'next/navigation';
const { Title, Text } = Typography;

const AccountsOverview = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [netWorth, setNetWorth] = useState<number>(0);
  const [assets, setAssets] = useState<number>(0);
  const [liabilities, setLiabilities] = useState<number>(0);
  const [cashFlow, setCashFlow] = useState<number>(0);
  const router = useRouter();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || '';
    setUsername(storedUsername);
  }, []);

  const formatCurrency = (amount: number) =>
    `${amount < 0 ? '-' : ''}$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await getAccounts({});
        const { payload } = res.data;
        setNetWorth(payload.total_balance || 0);
        setAssets(payload.assets || 0);
        setLiabilities(payload.liabilities || 0);
        setSections(payload.sections || []);
      } catch (err) {
        console.error('Error fetching account data', err);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchIncomeExpense = async () => {
      try {
        const response = await getExpenseIncome({});
        if (response.expense_total !== undefined) {
          setCashFlow(Number(response.expense_total));
        }
      } catch (error) {
        console.error('Error fetching income and expense:', error);
      }
    };
    fetchIncomeExpense();
  }, []);

  return (
    <Card style={{ borderRadius: 16, padding: 24, margin: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4}>Accounts & Net Worth</Title>
        <Text
          style={{ color: '#3b82f6', cursor: 'pointer' }}
        // onClick={() => router.push(`/${username}/finance-hub/setup`)}
        >
          Manage Accounts
        </Text>
      </div>

      <Row
        gutter={24}
        style={{
          background: '#f9fafb',
          borderRadius: 12,
          padding: '24px 16px',
          marginBottom: 32,
        }}
      >
        <Col span={6}>
          <Text type="secondary">Net Worth</Text>
          <Title level={3} style={{ color: netWorth < 0 ? '#ef4444' : '#22c55e' }}>
            {formatCurrency(netWorth)}
          </Title>
        </Col>
        <Col span={6}>
          <Text type="secondary">Total Assets</Text>
          <Title level={3}>{formatCurrency(assets)}</Title>
        </Col>
        <Col span={6}>
          <Text type="secondary">Total Liabilities</Text>
          <Title level={3} style={{ color: '#ef4444' }}>
            {formatCurrency(liabilities)}
          </Title>
        </Col>
        <Col span={6}>
          <Text type="secondary">Monthly Cash Flow</Text>
          <Title level={3} style={{ color: cashFlow < 0 ? '#ef4444' : '#111827' }}>
            {formatCurrency(cashFlow)}
          </Title>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {sections.map((section, index) => (
          <Col span={12} key={index}>
            <Card
              title={section.title}
              extra={
                <Text
                  style={{
                    color: section.total >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 500,
                  }}
                >
                  {formatCurrency(section.total)}
                </Text>
              }
              style={{ borderRadius: 12, background: '#fff' }}
              bodyStyle={{ padding: 0 }}
            >
              {section.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom:
                      idx !== section.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar style={{ backgroundColor: item.color }}>
                      {item.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text style={{ fontWeight: 500 }}>{item.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.type}
                      </Text>
                    </div>
                  </div>
                  <Text
                    strong
                    style={{
                      color: item.value < 0 ? '#ef4444' : '#111827',
                    }}
                  >
                    {formatCurrency(item.value)}
                  </Text>
                </div>
              ))}
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default AccountsOverview;
