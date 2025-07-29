'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
// or use `import { useRouter } from 'next/router';` if you're using the Pages Router
import React, { useEffect, useState } from 'react';
import { Layout, Avatar, Button, Typography, Card, Form, Input, Row, Col, List } from 'antd';
import {
    EditOutlined,
    FileTextOutlined,
    PlusOutlined
}
    from '@ant-design/icons';
import PersonalInfoSection from '../../../../../pages/family-hub/components/personal-info';
import MedicalInfoPage from '../../../../../pages/family-hub/components/medical-info';
import SchoolActivities from '../../../../../pages/family-hub/components/school-activities';
import { getPersonalInfo, resolveFamilyMemberUserId } from '../../../../../services/family';
import dayjs from 'dayjs';
import AssetsDevicesSection from '../../../../../pages/family-hub/components/assets-devices';
const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const ProfilePage = () => {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();
    const [personalInfo, setPersonalInfo] = useState<any>(null);
    const [localUserName, setLocalUserName] = useState<string | null>(null);

    useEffect(() => {
        const fetchResolvedUserId = async () => {
            if (!id) return;

            if ((id as string).startsWith("USER")) {
                setResolvedUserId(id as string);
            } else {
                const res = await resolveFamilyMemberUserId(id as string);
                if (res.status === 1) {
                    setResolvedUserId(res.payload.userId);
                }
            }
        };

        fetchResolvedUserId();
    }, [id]);

    useEffect(() => {
        const fetchPersonal = async () => {
            if (!resolvedUserId) return;
            const res = await getPersonalInfo({ userId: resolvedUserId });
            if (res.status === 1 && res.payload) {
                setPersonalInfo(res.payload);
            }
        };

        fetchPersonal();
    }, [resolvedUserId]);

    const handleEdit = () => {
        console.log('Edit profile mode');
    };

    const handleAddDocument = () => {
        console.log('Add new document');
    };

    const devices = [
        {
            name: 'iPhone 14 (Personal)',
            meta: 'Phone: (555) 123-4567 • Screen Time: Enabled',
            icon: '📱',
            action: 'Manage'
        },
        {
            name: 'MacBook Air (School)',
            meta: 'Serial: C02XR4JTHH28 • Parental Controls: Active',
            icon: '💻',
            action: 'Settings'
        },
        {
            name: 'Nintendo Switch',
            meta: 'Shared family device • Play time: 2 hrs/day',
            icon: '🎮',
            action: 'Time Limits'
        },
        {
            name: 'Apple Watch SE',
            meta: 'Family Setup • Location Sharing: On',
            icon: '⌚',
            action: 'Settings'
        },
        {
            name: 'AirPods (3rd Gen)',
            meta: 'Find My: Enabled',
            icon: '🎧',
            action: 'Locate'
        }
    ];

    useEffect(() => {
        const storedName = localStorage.getItem('username');
        if (storedName) {
            setLocalUserName(storedName);
        }
    }, []);

    const documents = [
        {
            name: 'Birth Certificate',
            meta: 'Uploaded Jan 15, 2025 • PDF • 2.1 MB',
            icon: '📜',
            color: '#dc2626'
        },
        {
            name: 'School Photos (2024-25)',
            meta: 'Uploaded Oct 10, 2024 • JPG • 4.7 MB',
            icon: '📷',
            color: '#4338ca'
        },
        {
            name: 'Report Cards (2023-24)',
            meta: 'Uploaded Jun 15, 2024 • PDF • 1.8 MB',
            icon: '📄',
            color: '#374151'
        },
        {
            name: 'Physical Exam Form',
            meta: 'Uploaded Aug 1, 2024 • PDF • 850 KB',
            icon: '🏥',
            color: '#d97706'
        },
        {
            name: 'Vaccination Records',
            meta: 'Updated Dec 20, 2024 • PDF • 1.5 MB',
            icon: '💉',
            color: '#16a34a'
        },
        {
            name: 'School Enrollment Forms',
            meta: 'Uploaded Aug 25, 2024 • PDF • 3.2 MB',
            icon: '🏫',
            color: '#d97706'
        }
    ];
    return (
        <>
            <Layout style={{ height: '100vh', overflow: 'hidden' }}>
                <Layout style={{ overflow: 'hidden' }}>


                    <Content style={{
                        padding: '24px',
                        overflow: 'auto',
                        background: '#f5f5f5',
                        marginLeft: 60,
                        marginTop: 65
                    }}>
                        {/* Back to Family Hub Button */}
                        <div style={{ marginBottom: 16 }}>
                            <Button
                                type="link"
                                onClick={() => router.push('/vini/family-hub')}
                                style={{
                                    padding: 0,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: '#1890ff',
                                }}
                            >
                                ← Back to Family Hub
                            </Button>
                        </div>
                        {/* Member Profile Header */}
                        <Card
                            style={{
                                background: 'linear-gradient(135deg, #3355ff, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 16,
                                marginBottom: 24
                            }}
                            bodyStyle={{ padding: 24 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                                <Avatar
                                    size={80}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        backdropFilter: 'blur(10px)',
                                        fontSize: 32,
                                        fontWeight: 600,
                                        flexShrink: 0
                                    }}
                                >
                                    {(personalInfo?.firstName?.[0] ?? 'F').toUpperCase()}
                                </Avatar>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Title level={2} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
                                        {localUserName || personalInfo?.firstName || `${personalInfo?.preferredName ?? ''} ${personalInfo?.lastName ?? ''}` || 'Family Member'}
                                    </Title>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, display: 'block', marginBottom: 12 }}>
                                        {personalInfo?.relationship || ''} •
                                        {personalInfo?.dateOfBirth ? ` ${dayjs().diff(personalInfo.dateOfBirth, 'year')} years old` : ''} •
                                        {personalInfo?.dateOfBirth ? `Born ${dayjs(personalInfo.dateOfBirth).format('MMMM D, YYYY')}` : ''}
                                    </Text>
                                </div>

                                {/* <Button
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    backdropFilter: 'blur(10px)',
                                    flexShrink: 0
                                }}
                            >
                                Edit Profile
                            </Button> */}
                            </div>
                        </Card>

                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {/* Personal Information Section */}
                                    {resolvedUserId && <PersonalInfoSection memberId={resolvedUserId} />}

                                    {/* Medical Information Section */}

                                    {resolvedUserId && <MedicalInfoPage memberId={resolvedUserId} />}

                                </div>
                            </Col>

                            <Col xs={24} lg={8}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    {/* Documents & Records Section */}
                                    <Card
                                        title={
                                            <span>
                                                <FileTextOutlined style={{ marginRight: 8 }} />
                                                Documents & Records
                                            </span>
                                        }
                                        extra={
                                            <Button
                                                type="text"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={handleAddDocument}
                                                style={{ color: '#1890ff' }}
                                            />
                                        }
                                        style={{ borderRadius: 12 }}
                                    >
                                        <List
                                            dataSource={documents}
                                            split
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                        {/* Icon */}
                                                        <div
                                                            style={{
                                                                width: 40,
                                                                height: 40,
                                                                backgroundColor: `${item.color}20`,
                                                                color: item.color,
                                                                borderRadius: 8,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: 18,
                                                                flexShrink: 0,
                                                                marginRight: 12,
                                                            }}
                                                        >
                                                            {item.icon}
                                                        </div>

                                                        {/* Name & Meta */}
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                                                                {item.name}
                                                            </div>
                                                            <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                                                                {item.meta}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <Button size="small" style={{ fontWeight: 500 }}>View</Button>
                                                            <Button size="small" style={{ fontWeight: 500 }}>Download</Button>
                                                        </div>
                                                    </div>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>

                                    {/* Accounts & Assets Section */}
                                    <AssetsDevicesSection />
                                    {/* School & Activities Section */}
                                    <SchoolActivities />
                                </div>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default ProfilePage;
