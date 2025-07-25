'use client';

import React, { useState } from 'react';
import { Card, Progress, Button, Badge, Table, Collapse, Typography, Row, Col, Statistic } from 'antd';
import {
    CheckOutlined,
    ExportOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    SettingOutlined,
    MedicineBoxOutlined,
    FileTextOutlined,
    SafetyOutlined,
    TeamOutlined,
    FolderOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    MinusCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const GuardianSection: React.FC = () => {
    const [activeEstatePanels, setActiveEstatePanels] = useState<string[]>([]);

    const guardianData = [
        {
            name: "Martha Smith",
            details: "Grandmother • Primary Guardian",
            access: "Full Access",
            accessType: "full"
        },
        {
            name: "Robert Johnson",
            details: "Uncle • Secondary Guardian",
            access: "Financial Only",
            accessType: "financial"
        },
        {
            name: "Dr. Sarah Williams",
            details: "Family Friend • Medical Decisions",
            access: "Medical Only",
            accessType: "medical"
        },
        {
            name: "Emergency Contact System",
            details: "Automated alerts to all guardians",
            access: "Emergency",
            accessType: "emergency"
        }
    ];

    const beneficiaryColumns = [
        {
            title: 'Account/Policy',
            dataIndex: 'account',
            key: 'account',
        },
        {
            title: 'Primary Beneficiary',
            dataIndex: 'primary',
            key: 'primary',
        },
        {
            title: 'Secondary Beneficiary',
            dataIndex: 'secondary',
            key: 'secondary',
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated',
            key: 'updated',
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="primary" ghost size="small">Edit</Button>
            ),
        },
    ];

    const beneficiaryData = [
        {
            key: '1',
            account: '401(k) - Vanguard',
            primary: 'Sarah Smith (100%)',
            secondary: 'Emma Smith (50%), Liam Smith (50%)',
            updated: 'Jan 2025',
        },
        {
            key: '2',
            account: 'IRA - Fidelity',
            primary: 'Sarah Smith (100%)',
            secondary: 'Martha Smith (100%)',
            updated: 'Jan 2025',
        },
        {
            key: '3',
            account: 'Life Insurance - Prudential',
            primary: 'Sarah Smith (100%)',
            secondary: 'Trust (100%)',
            updated: 'Dec 2024',
        },
        {
            key: '4',
            account: 'Checking - Chase',
            primary: 'Sarah Smith (POD)',
            secondary: '-',
            updated: 'Nov 2024',
        },
    ];

    const getAccessBadgeColor = (type: string) => {
        switch (type) {
            case 'full': return '#1890ff';
            case 'financial': return '#faad14';
            case 'medical': return '#722ed1';
            case 'emergency': return '#f5222d';
            default: return '#1890ff';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'complete':
                return <Badge status="success" text="Complete" />;
            case 'in-progress':
                return <Badge status="processing" text="In Progress" />;
            case 'not-started':
                return <Badge status="error" text="Not Started" />;
            default:
                return <Badge status="default" text="Unknown" />;
        }
    };

    return (
        <div style={{
            maxWidth: '100%',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f9fafb',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Section Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e5e7eb'
            }}>
                <Title level={2} style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <SafetyCertificateOutlined style={{ fontSize: '28px', color: '#007AFF' }} />
                    Guardians & Estate Planning
                </Title>
                <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    style={{
                        padding: '10px 20px',
                        height: 'auto',
                        fontSize: '14px',
                        fontWeight: 500
                    }}
                >
                    Export All Documents
                </Button>
            </div>

            {/* Progress Overview */}
            <Card style={{
                marginBottom: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
                <Title level={2} style={{ marginBottom: '10px', marginTop: '6px', fontSize: '20px' }}>Estate Planning Progress</Title>
                <Row gutter={16} style={{ marginBottom: '20px' }}>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>Documents Complete</span>}
                            value={7}
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>In Progress</span>}
                            value={3}
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>Not Started</span>}
                            value={2}
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>Overall Complete</span>}
                            value={85}
                            suffix="%"
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                </Row>
                <Progress percent={85} strokeColor="#10b981" />
            </Card>

            {/* Estate Planning Grid */}
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                {/* Guardians Card */}
                <Col span={12}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            height: '100%'
                        }}
                        hoverable
                    >
                        <div style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f0f4f8',
                            margin: '-24px -24px 20px -24px',
                            padding: '20px 24px'
                        }}>
                            <Title level={4} style={{
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <TeamOutlined />
                                Guardians & Access Management
                            </Title>
                            {getStatusBadge('complete')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            {guardianData.map((guardian, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    backgroundColor: '#f0f4f8',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: '#111827' }}>
                                            {guardian.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                            {guardian.details}
                                        </div>
                                    </div>
                                    <Badge
                                        color={getAccessBadgeColor(guardian.accessType)}
                                        text={guardian.access}
                                    />
                                </div>
                            ))}
                        </div>

                        <Button
                            ghost
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ marginBottom: '12px' }}
                        >
                            Add Guardian
                        </Button>

                        <Paragraph style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            margin: 0,
                            lineHeight: 1.5
                        }}>
                            Guardians can access specific areas of your Dockly account in case of emergency. Configure their access levels based on your needs.
                        </Paragraph>
                    </Card>
                </Col>

                {/* Estate Planning Card with Collapsible Sections */}
                <Col span={12}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            height: '100%'
                        }}
                        hoverable
                    >
                        <div style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f0f4f8',
                            margin: '-24px -24px 20px -24px',
                            padding: '20px 24px'
                        }}>
                            <Title level={4} style={{
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FileTextOutlined />
                                Estate Planning
                            </Title>
                            {getStatusBadge('in-progress')}
                        </div>

                        <Collapse
                            activeKey={activeEstatePanels}
                            onChange={(keys) => setActiveEstatePanels(keys as string[])}
                            expandIconPosition="right"
                            ghost
                        >
                            <Panel
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MedicineBoxOutlined />
                                        <span>Living Will / Advance Directive</span>
                                        <Badge status="success" />
                                    </div>
                                }
                                key="1"
                            >
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f0f4f8',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#111827' }}>
                                                Advance Healthcare Directive
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                Last updated: January 15, 2025
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                                        • Healthcare proxy: Dr. Sarah Williams<br />
                                        • Alternate proxy: Martha Smith<br />
                                        • DNR preferences: Specified<br />
                                        • Organ donation: Yes
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                    <Button ghost type="primary" icon={<EyeOutlined />} size="small">
                                        View
                                    </Button>
                                    <Button ghost type="primary" icon={<EditOutlined />} size="small">
                                        Update
                                    </Button>
                                </div>
                                <Text style={{ fontSize: '13px', color: '#6b7280' }}>
                                    Your living will specifies your healthcare wishes if you're unable to communicate them yourself.
                                </Text>
                            </Panel>

                            <Panel
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileTextOutlined />
                                        <span>Last Will and Testament</span>
                                        <Badge status="processing" />
                                    </div>
                                }
                                key="2"
                            >
                                <div style={{
                                    backgroundColor: '#eff6ff',
                                    border: '2px dashed #3355ff',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                                    <div style={{ fontSize: '16px', marginBottom: '16px' }}>
                                        Complete your will with our guided process
                                    </div>
                                    <Button type="primary">
                                        Continue Setup with DoYourOwnWill.com
                                    </Button>
                                </div>
                                <div>
                                    <Text strong>Progress: 60% Complete</Text>
                                    <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px', color: '#6b7280' }}>
                                        <li>✓ Personal information</li>
                                        <li>✓ Executor designation</li>
                                        <li>✓ Asset distribution</li>
                                        <li>⏳ Specific bequests</li>
                                        <li>○ Final provisions</li>
                                    </ul>
                                </div>
                            </Panel>

                            <Panel
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <SafetyOutlined />
                                        <span>Power of Attorney</span>
                                        <Badge status="success" />
                                    </div>
                                }
                                key="3"
                            >
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#f0f4f8',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: '#111827' }}>
                                                    Durable Power of Attorney
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                    Executed: December 1, 2024
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                                            • Financial POA: Robert Johnson<br />
                                            • Healthcare POA: Dr. Sarah Williams<br />
                                            • Effective: Immediately<br />
                                            • Witnessed & Notarized: Yes
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#f0f4f8',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        marginBottom: '12px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: '#111827' }}>
                                                    Limited Power of Attorney
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                    For real estate transactions
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                                            • Agent: Martha Smith<br />
                                            • Scope: Property at 123 Main St<br />
                                            • Expires: December 31, 2025
                                        </div>
                                    </div>
                                </div>

                                <Button ghost type="primary" icon={<SettingOutlined />}>
                                    Manage POA Documents
                                </Button>
                            </Panel>

                            <Panel
                                header={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CheckOutlined />
                                        <span>Life Insurance Policies</span>
                                        <Badge status="success" />
                                    </div>
                                }
                                key="4"
                            >
                                <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{
                                        backgroundColor: '#f0f4f8',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>
                                                    Term Life - John Smith
                                                </div>
                                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#3355ff' }}>
                                                    $500,000
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                                            Policy #: TL-789456<br />
                                            Provider: Prudential<br />
                                            Premium: $89/month<br />
                                            Term: 20 years (Expires 2040)
                                        </div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#f0f4f8',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>
                                                    Term Life - Sarah Smith
                                                </div>
                                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#3355ff' }}>
                                                    $500,000
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                                            Policy #: TL-789457<br />
                                            Provider: Prudential<br />
                                            Premium: $78/month<br />
                                            Term: 20 years (Expires 2040)
                                        </div>
                                    </div>

                                    <div style={{
                                        backgroundColor: '#f0f4f8',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>
                                                    Whole Life - Joint
                                                </div>
                                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#3355ff' }}>
                                                    $250,000
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                                            Policy #: WL-123789<br />
                                            Provider: MetLife<br />
                                            Premium: $312/month<br />
                                            Cash Value: $18,450
                                        </div>
                                    </div>
                                </div>

                                <Button ghost type="primary" icon={<PlusOutlined />}>
                                    Add Policy
                                </Button>
                            </Panel>
                        </Collapse>
                    </Card>
                </Col>

                {/* Second Row - Beneficiary Designations */}
                <Col span={16}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            height: '100%'
                        }}
                        hoverable
                    >
                        <div style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f0f4f8',
                            margin: '-24px -24px 20px -24px',
                            padding: '20px 24px'
                        }}>
                            <Title level={4} style={{
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <TeamOutlined />
                                Beneficiary Designations
                            </Title>
                            {getStatusBadge('complete')}
                        </div>

                        <Table
                            columns={beneficiaryColumns}
                            dataSource={beneficiaryData}
                            pagination={false}
                            size="small"
                            style={{ marginBottom: '16px' }}
                        />

                        <Button ghost type="primary" icon={<PlusOutlined />}>
                            Add Account/Policy
                        </Button>
                    </Card>
                </Col>

                {/* Additional Estate Documents */}
                <Col span={8}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            height: '100%'
                        }}
                        hoverable
                    >
                        <div style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f0f4f8',
                            margin: '-24px -24px 20px -24px',
                            padding: '20px 24px'
                        }}>
                            <Title level={4} style={{
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FolderOutlined />
                                Additional Estate Documents
                            </Title>
                            {getStatusBadge('in-progress')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            {[
                                { title: "✓ Trust Documents", subtitle: "Smith Family Revocable Living Trust" },
                                { title: "✓ Digital Asset Inventory", subtitle: "Passwords, accounts, crypto wallets" },
                                { title: "✓ Funeral Instructions", subtitle: "Preferences and prepaid arrangements" },
                                { title: "⏳ Letter of Intent", subtitle: "Personal wishes and guidance" },
                                { title: "○ Pet Care Instructions", subtitle: "Not started" }
                            ].map((doc, index) => (
                                <div key={index} style={{
                                    padding: '16px',
                                    marginBottom: '12px',
                                    backgroundColor: '#f0f4f8',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#111827' }}>
                                                {doc.title}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {doc.subtitle}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button ghost type="primary" icon={<FileTextOutlined />}>
                            Manage Documents
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default GuardianSection;