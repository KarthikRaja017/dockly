import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const FinancialCard = ({
    title,
    value,
    change,
    changeColor,
    note,
    valueColor,
}: {
    title: string;
    value: string;
    change: string;
    note: string;
    changeColor: string;
    valueColor: string;
}) => {
    return (
        <Card
            style={{
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                marginBottom: '20px',
                padding: '20px',
                width: '350px'
            }}
            bodyStyle={{ padding: 0 }}
        >
            <div>
                <Text style={{ fontSize: '16px', fontWeight: 500, color: '#444' }}>{title}</Text>
                <Title
                    level={2}
                    style={{
                        color: valueColor,
                        margin: '10px 0 4px 0',
                        fontWeight: 600,
                    }}
                >
                    {value}
                </Title>
                <Text style={{ color: changeColor, fontWeight: 500 }}>{change}</Text>
                <br />
                <Text style={{ color: '#999', fontSize: '13px' }}>{note}</Text>
            </div>
        </Card>
    );
};

const FinancialSummary = () => {
    return (
        <div style={{ maxWidth: '200px', margin: 'auto' }}>
            <FinancialCard
                title="Total Balance"
                value="$12,543.87"
                change="↑ 5.2% from last month"
                note=""
                valueColor="#1e1e1e"
                changeColor="#28c76f"
            />
            <FinancialCard
                title="Monthly Income"
                value="$1,649.45"
                change="↑ 100% Jun 2025"
                note=""
                valueColor="#28c76f"
                changeColor="#28c76f"
            />
            <FinancialCard
                title="Monthly Expenses"
                value="$2,156.00"
                change="↑ 100% Jun 2025"
                note=""
                valueColor="#ff4d4f"
                changeColor="#ff4d4f"
            />
        </div>
    );
};

export default FinancialSummary;
