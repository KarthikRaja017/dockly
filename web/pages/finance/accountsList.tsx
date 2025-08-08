import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Avatar } from 'antd';
import { getAccounts, getExpenseIncome } from '../../services/apiConfig';
import { useRouter } from 'next/navigation';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
    <Card style={{
      borderRadius: 12,
      padding: 16,
      // margin: 12,
      marginLeft: 12,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
      fontFamily: FONT_FAMILY,
      maxWidth: '1290px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={4} style={{
          margin: 0,
          fontFamily: FONT_FAMILY,
          fontSize: '16px',
          fontWeight: 600,
          color: '#111827'
        }}>
          Accounts & Net Worth
        </Title>
        <Text
          style={{
            color: '#3b82f6',
            cursor: 'pointer',
            fontFamily: FONT_FAMILY,
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          Manage Accounts
        </Text>
      </div>

      <Row
        gutter={16}
        style={{
          background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)',
          borderRadius: 10,
          padding: '16px',
          marginBottom: 24,
          border: '1px solid #e2e8f0',
        }}
      >
        <Col span={6}>
          <Text type="secondary" style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }}>Net Worth</Text>
          <Title level={4} style={{
            color: netWorth < 0 ? '#ef4444' : '#059669',
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            fontWeight: 600,
            margin: '4px 0 0 0'
          }}>
            {formatCurrency(netWorth)}
          </Title>
        </Col>
        <Col span={6}>
          <Text type="secondary" style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }}>Total Assets</Text>
          <Title level={4} style={{
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            fontWeight: 600,
            margin: '4px 0 0 0',
            color: '#111827'
          }}>
            {formatCurrency(assets)}
          </Title>
        </Col>
        <Col span={6}>
          <Text type="secondary" style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }}>Total Liabilities</Text>
          <Title level={4} style={{
            color: '#ef4444',
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            fontWeight: 600,
            margin: '4px 0 0 0'
          }}>
            {formatCurrency(liabilities)}
          </Title>
        </Col>
        <Col span={6}>
          <Text type="secondary" style={{ fontFamily: FONT_FAMILY, fontSize: '12px' }}>Monthly Cash Flow</Text>
          <Title level={4} style={{
            color: cashFlow < 0 ? '#ef4444' : '#111827',
            fontFamily: FONT_FAMILY,
            fontSize: '16px',
            fontWeight: 600,
            margin: '4px 0 0 0'
          }}>
            {formatCurrency(cashFlow)}
          </Title>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {sections.map((section, index) => (
          <Col span={12} key={index}>
            <Card
              title={
                <span style={{ fontFamily: FONT_FAMILY, fontSize: '14px', fontWeight: 600 }}>
                  {section.title}
                </span>
              }
              extra={
                <Text
                  style={{
                    color: section.total >= 0 ? '#059669' : '#ef4444',
                    fontWeight: 600,
                    fontFamily: FONT_FAMILY,
                    fontSize: '14px',
                  }}
                >
                  {formatCurrency(section.total)}
                </Text>
              }
              style={{
                borderRadius: 10,
                background: '#fff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              bodyStyle={{ padding: 0 }}
              headStyle={{
                padding: '12px 16px',
                borderBottom: '1px solid #f3f4f6',
                fontFamily: FONT_FAMILY
              }}
            >
              {section.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom:
                      idx !== section.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar
                      style={{
                        backgroundColor: item.color,
                        fontSize: '12px',
                        width: 28,
                        height: 28
                      }}
                      size={28}
                    >
                      {item.name.charAt(0)}
                    </Avatar>
                    <div>
                      <Text style={{
                        fontWeight: 500,
                        fontFamily: FONT_FAMILY,
                        fontSize: '13px',
                        color: '#111827'
                      }}>
                        {item.name}
                      </Text>
                      <br />
                      <Text type="secondary" style={{
                        fontSize: 11,
                        fontFamily: FONT_FAMILY
                      }}>
                        {item.type}
                      </Text>
                    </div>
                  </div>
                  <Text
                    strong
                    style={{
                      color: item.value < 0 ? '#ef4444' : '#111827',
                      fontFamily: FONT_FAMILY,
                      fontSize: '13px',
                      fontWeight: 600,
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