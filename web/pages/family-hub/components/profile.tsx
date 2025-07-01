'use client';

import React from 'react';
import { Layout, Button, Avatar, Typography, Space, Form } from 'antd';
import {
    ShareAltOutlined,
    ExportOutlined,
    SaveOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PersonalInfoSection from './personal-info';
import DocumentsRecordsSection from './documents-records';
import AssetsDevicesSection from './assets-devices';
import SchoolActivitiesForm from './school-activities';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const FamilyHubMemberDetails: React.FC = () => {
    const router = useRouter();
    const [form] = Form.useForm();

    const goBack = () => router.back();

    const onFinish = (values: any) => {
        console.log('Collected Personal Info:', values);
    };
    const handleSave = () => {
        console.log('Profile saved successfully!');
        form.submit();
    };
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout>
                {/* <Header
                    style={{
                        background: '#fff',
                        padding: '16px 24px',
                        marginTop: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <Button type="link" onClick={goBack} style={{ padding: 0, marginLeft: '74px' }}>
                        ← Back to Family Hub
                    </Button>
                    <Space>
                        <Button icon={<ShareAltOutlined />}>Share</Button>
                        <Button icon={<ExportOutlined />}>Export</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} htmlType='submit'>Save</Button>
                    </Space>
                </Header> */}

                <Content style={{ padding: '84px', marginLeft: '72px' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(135deg, #3355ff, #8b5cf6)',
                            borderRadius: '16px',
                            padding: '24px',
                            color: '#fff',
                        }}
                    >
                        <Avatar size={80} style={{ backgroundColor: '#ffffff33', fontSize: 32 }}>
                            E
                        </Avatar>
                        <div style={{ marginLeft: '20px', flex: 1 }}>
                            <Title level={2} style={{ margin: 0, color: 'white' }}>
                                Emma Smith
                            </Title>
                            <div>
                                <Text style={{ color: 'white' }}>
                                    Daughter • 14 years old • Born March 15, 2011
                                </Text>
                            </div>
                            <div
                                style={{
                                    marginTop: '6px',
                                    padding: '4px 12px',
                                    backgroundColor: '#ffffff33',
                                    borderRadius: '12px',
                                    display: 'inline-block',
                                    fontWeight: 500,
                                    color: 'white',
                                }}
                            >
                                Child Access Level
                            </div>
                        </div>
                        <Button
                            icon={<EditOutlined />}
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                            }}
                        >
                            Edit Profile
                        </Button>
                    </div>

                    {/* Modular sections */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <div>
                            {/* <Form form={form} onFinish={onFinish}>
                                <PersonalInfoSection form={form} />
                            </Form> */}
                            <PersonalInfoSection />
                            <SchoolActivitiesForm />
                        </div>
                        <div>
                            <DocumentsRecordsSection />
                            <AssetsDevicesSection />
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default FamilyHubMemberDetails;
