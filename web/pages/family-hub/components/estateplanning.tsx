import React, { useState } from 'react';
import { Card, Collapse, Badge, Button, Typography, Modal } from 'antd';
import {
    FileTextOutlined,
    MedicineBoxOutlined,
    SafetyOutlined,
    CheckOutlined,
    EyeOutlined,
    EditOutlined,
    SettingOutlined,
    PlusOutlined,
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const EstatePlanningCard: React.FC = () => {
    const [activePanels, setActivePanels] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [iframeUrl, setIframeUrl] = useState('');

    const [estateDocs, setEstateDocs] = useState({
        livingWill: {
            status: 'complete',
            lastUpdated: 'January 15, 2025',
            metadata: {
                proxy: 'Dr. Sarah Williams',
                alternate: 'Martha Smith',
                dnr: 'Specified',
                donation: 'Yes',
            },
        },
        lastWill: {
            status: 'not-started',
            progress: 60,
            steps: ['✓ Personal information', '✓ Executor designation', '✓ Asset distribution', '⏳ Specific bequests', '○ Final provisions'],
        },
        poa: {
            status: 'complete',
            documents: [
                {
                    title: 'Durable Power of Attorney',
                    executed: 'December 1, 2024',
                    details: {
                        financial: 'Robert Johnson',
                        healthcare: 'Dr. Sarah Williams',
                        effective: 'Immediately',
                        notarized: 'Yes',
                    },
                },
                {
                    title: 'Limited Power of Attorney',
                    executed: 'For real estate transactions',
                    details: {
                        agent: 'Martha Smith',
                        scope: 'Property at 123 Main St',
                        expires: 'December 31, 2025',
                    },
                },
            ],
        },
    });

    const openModal = (title: string, url: string) => {
        setModalTitle(title);
        setIframeUrl(url);
        setModalVisible(true);
    };

    return (
        <Card
            style={{
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                height: '100%',
            }}
            hoverable
        >
            <div
                style={{
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f0f4f8',
                    margin: '-24px -24px 20px -24px',
                    padding: '20px 24px',
                }}
            >
                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextOutlined />
                    Estate Planning
                </Title>
                <Badge status="processing" text="In Progress" />
            </div>

            <Collapse
                activeKey={activePanels}
                onChange={(keys) => setActivePanels(keys as string[])}
                expandIconPosition="start"
                ghost
            >
                {/* Living Will */}
                <Panel
                    key="1"
                    header={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MedicineBoxOutlined />
                            <span>Living Will / Advance Directive</span>
                            <Badge status="success" />
                        </div>
                    }
                >
                    {estateDocs.livingWill.status === 'complete' ? (
                        <div
                            style={{
                                padding: '16px',
                                backgroundColor: '#f0f4f8',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '12px',
                            }}
                        >
                            <div style={{ fontWeight: 500 }}>Advance Healthcare Directive</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Last updated: {estateDocs.livingWill.lastUpdated}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginTop: 8 }}>
                                • Healthcare proxy: {estateDocs.livingWill.metadata.proxy}
                                <br />• Alternate proxy: {estateDocs.livingWill.metadata.alternate}
                                <br />• DNR preferences: {estateDocs.livingWill.metadata.dnr}
                                <br />• Organ donation: {estateDocs.livingWill.metadata.donation}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <Button icon={<EyeOutlined />} size="small" onClick={() => openModal('View Living Will', 'https://www.doyourownwill.com/living-will/')}>
                                    View
                                </Button>
                                <Button icon={<EditOutlined />} size="small" onClick={() => openModal('Update Living Will', 'https://www.doyourownwill.com/living-will/')}>
                                    Update
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                backgroundColor: '#eff6ff',
                                border: '2px dashed #3355ff',
                                borderRadius: '8px',
                                padding: '24px',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                            <div style={{ fontSize: '16px', marginBottom: '16px' }}>Complete your will with our guided process</div>
                            <Button
                                type="primary"
                                onClick={() => openModal('Create Living Will', 'https://www.doyourownwill.com/living-will/')}
                            >
                                Continue Setup with DoYourOwnWill.com
                            </Button>
                        </div>
                    )}
                </Panel>

                {/* Last Will */}
                <Panel
                    key="2"
                    header={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileTextOutlined />
                            <span>Last Will and Testament</span>
                            <Badge status={estateDocs.lastWill.status === 'not-started' ? 'error' : 'processing'} />
                        </div>
                    }
                >
                    {estateDocs.lastWill.status === 'not-started' ? (
                        <div
                            style={{
                                backgroundColor: '#eff6ff',
                                border: '2px dashed #3355ff',
                                borderRadius: '8px',
                                padding: '24px',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                            <div style={{ fontSize: '16px', marginBottom: '16px' }}>Complete your will with our guided process</div>
                            <Button
                                type="primary"
                                onClick={() => window.open('https://www.doyourownwill.com/', '_blank')}
                            >
                                Continue Setup with DoYourOwnWill.com
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <Text strong>Progress: {estateDocs.lastWill.progress}% Complete</Text>
                            <ul style={{ marginTop: '8px', marginLeft: '20px', fontSize: '14px', color: '#6b7280' }}>
                                {estateDocs.lastWill.steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Panel>

                {/* Power of Attorney */}
                <Panel
                    key="3"
                    header={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <SafetyOutlined />
                            <span>Power of Attorney</span>
                            <Badge status="success" />
                        </div>
                    }
                >
                    {estateDocs.poa.documents.map((doc, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: '16px',
                                backgroundColor: '#f0f4f8',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '12px',
                            }}
                        >
                            <div style={{ fontWeight: 500 }}>{doc.title}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{doc.executed}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginTop: 8 }}>
                                {Object.entries(doc.details).map(([label, value]) => (
                                    <div key={label}>• {label.charAt(0).toUpperCase() + label.slice(1)}: {value}</div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <Button icon={<SettingOutlined />} onClick={() => openModal('Manage POA', 'https://www.doyourownwill.com/power-of-attorney/')}>
                        Manage POA Documents
                    </Button>
                </Panel>
                <Panel
                    key="4"
                    header={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckOutlined />
                            <span>Life Insurance Policies</span>
                            <Badge status="success" />
                        </div>
                    }
                >
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                        <div
                            style={{
                                backgroundColor: '#f0f4f8',
                                borderRadius: '8px',
                                padding: '16px',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <div style={{ fontWeight: 600, color: '#111827' }}>Term Life - John Smith</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3355ff' }}>$500,000</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginTop: '6px' }}>
                                Policy #: TL-789456<br />
                                Provider: Prudential<br />
                                Premium: $89/month<br />
                                Term: 20 years (Expires 2040)
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#f0f4f8',
                                borderRadius: '8px',
                                padding: '16px',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <div style={{ fontWeight: 600, color: '#111827' }}>Term Life - Sarah Smith</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3355ff' }}>$500,000</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginTop: '6px' }}>
                                Policy #: TL-789457<br />
                                Provider: Prudential<br />
                                Premium: $78/month<br />
                                Term: 20 years (Expires 2040)
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: '#f0f4f8',
                                borderRadius: '8px',
                                padding: '16px',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <div style={{ fontWeight: 600, color: '#111827' }}>Whole Life - Joint</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#3355ff' }}>$250,000</div>
                            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginTop: '6px' }}>
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

            {/* IFRAME MODAL */}
            <Modal
                title={modalTitle}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
                style={{ top: 40 }}
                bodyStyle={{ height: '80vh', padding: 0 }}
                destroyOnClose
            >
                <iframe src={iframeUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
            </Modal>
        </Card>
    );
};

export default EstatePlanningCard;
