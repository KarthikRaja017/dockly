'use client';

import React, { useState, useEffect } from 'react';
import {
    Card, Tabs, Button, Typography, Space, Modal, Form, Input, Select, message, Alert, Tooltip
} from 'antd';
import {
    EyeOutlined, CopyOutlined, EditOutlined, PlusOutlined,
    LaptopOutlined
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { addAccountPassword, getAccountPasswords, resolveFamilyMemberUserId, updateAccountPassword } from '../../../services/family';
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface AccountItem {
    id?: string;
    category: string;
    title: string;
    username: string;
    password: string;
    url?: string;
}

const categoryOptions = [
    'School & Education',
    'Personal Accounts',
    'Entertainment & Subscriptions',
    'Other'
];

const staticDevices = [
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

interface AssetsDevicesSectionProps {
    memberId: string;
}

const AssetsDevicesSection: React.FC<AssetsDevicesSectionProps> = ({ memberId }) => {
    const [accounts, setAccounts] = useState<AccountItem[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showPasswordIndex, setShowPasswordIndex] = useState<number | null>(null);
    const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
    const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
    const params = useParams();
    const id = params?.id;

    useEffect(() => {
        const fetchData = async () => {
            if (!memberId) return;

            let finalUserId = memberId;

            if (!finalUserId.startsWith('USER')) {
                const res = await resolveFamilyMemberUserId(finalUserId);
                if (res.status === 1) finalUserId = res.payload.userId;
            }

            setResolvedUserId(finalUserId);

            const fetched = await getAccountPasswords({ userId: finalUserId });
            if (fetched.status === 1 && fetched.payload) {
                setAccounts(fetched.payload);
            }
        };

        fetchData();
    }, [memberId]);

    const handleAdd = () => {
        form.resetFields();
        setEditingIndex(null);
        setModalVisible(true);
    };

    const handleEdit = (index: number) => {
        const item = accounts[index];
        form.setFieldsValue(item);
        setEditingIndex(index);
        setModalVisible(true);
    };

    const handleSubmit = async (values: AccountItem) => {
        if (!resolvedUserId) {
            console.log(resolvedUserId);
            return;
        }

        const accountPayload = {
            userId: resolvedUserId,
            addedBy: resolvedUserId,
            editedBy: resolvedUserId,
            ...values,
        };

        try {
            if (editingIndex !== null) {
                const existing = accounts[editingIndex];
                const response = await updateAccountPassword({ account: { ...accountPayload, id: existing.id } });
                if (response.status === 1) {
                    const updated = [...accounts];
                    updated[editingIndex] = { ...accountPayload, id: existing.id };
                    setAccounts(updated);
                    message.success('Account updated');
                }
            } else {

                const response = await addAccountPassword(accountPayload);
                if (response.status === 1) {
                    const newItem = { ...accountPayload, id: response.payload.id };
                    setAccounts([...accounts, newItem]);
                    message.success('Account added');
                }
            }

            setModalVisible(false);
        } catch (error) {
            message.error('Something went wrong');
        }
    };

    const handleCopy = (password: string) => {
        navigator.clipboard.writeText(password);
        message.success('Password copied');
    };

    const renderAccounts = () => {
        const grouped = categoryOptions.reduce((acc, category) => {
            const items = accounts.filter(a => a.category === category);
            if (items.length > 0) acc[category] = items;
            return acc;
        }, {} as Record<string, AccountItem[]>);

        const totalAccounts = accounts.length;
        const shouldScroll = totalAccounts > 1;

        return (
            <div style={{
                maxHeight: shouldScroll ? '250px' : 'none',
                overflowY: shouldScroll ? 'auto' : 'visible',
                paddingRight: shouldScroll ? '4px' : '0'
            }}>
                <Alert
                    message="🔐 All passwords are securely encrypted and only accessible by guardians"
                    type="warning"
                    style={{ marginBottom: 8, fontSize: 10 }}
                />
                {Object.entries(grouped).map(([category, entries]) => (
                    <div key={category} style={{ marginBottom: 12 }}>
                        <Title level={5} style={{ fontSize: 12, marginBottom: 6, color: '#595959' }}>
                            {category}
                        </Title>
                        {entries.map((entry, index) => {
                            const isShown = entry.id === showPasswordId;

                            return (
                                <Card
                                    key={index}
                                    size="small"
                                    style={{
                                        marginBottom: 4,
                                        backgroundColor: '#fafafa',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 8
                                    }}
                                    bodyStyle={{ padding: 6 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                                <Text strong style={{ fontSize: 13 }}>
                                                    {entry.title}
                                                </Text>
                                                {entry.url && (
                                                    <Tooltip title={entry.url}>
                                                        <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 3, color: '#1890ff', fontSize: 10 }}>
                                                            ↗
                                                        </a>
                                                    </Tooltip>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#8c8c8c', marginBottom: 1, wordBreak: 'break-all' }}>
                                                {entry.username}
                                            </div>
                                            <div style={{ fontSize: 9, color: '#8c8c8c' }}>
                                                Password: {isShown ? entry.password : '••••••••••'}
                                            </div>
                                        </div>
                                        <Space size={2} style={{ flexShrink: 0 }}>
                                            <Button size="small" type="text" style={{ fontSize: 10, padding: '2px 4px' }} icon={<EyeOutlined style={{ fontSize: 10 }} />} onClick={() => {
                                                if (entry.id) { setShowPasswordId(showPasswordId === entry.id ? null : entry.id) }
                                            }

                                            }>
                                                Show
                                            </Button>
                                            <Button size="small" type="text" style={{ fontSize: 10, padding: '2px 4px' }} icon={<CopyOutlined style={{ fontSize: 10 }} />} onClick={() => handleCopy(entry.password)}>
                                                Copy
                                            </Button>
                                            <Button size="small" type="text" style={{ fontSize: 10, padding: '2px 4px' }} icon={<EditOutlined style={{ fontSize: 10 }} />} onClick={() => handleEdit(index)}>
                                                Edit
                                            </Button>
                                        </Space>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            <LaptopOutlined style={{ marginRight: 8 }} />
                            Accounts & Assets
                        </span>
                        <Button type="text" icon={<PlusOutlined />} onClick={handleAdd} style={{ color: '#1890ff' }} />
                    </div>
                }
                style={{ width: '100%' }}
                bodyStyle={{ padding: 6 }}
            >
                <Tabs defaultActiveKey="accounts">
                    <TabPane tab="Accounts & Passwords" key="accounts">
                        {renderAccounts()}
                    </TabPane>
                    <TabPane tab="Devices" key="devices">
                        {staticDevices.map((item, idx) => (
                            <Card
                                key={idx}
                                style={{ marginBottom: 6, borderRadius: 8 }}
                                bodyStyle={{ padding: 8 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div
                                            style={{
                                                width: 28,
                                                height: 28,
                                                backgroundColor: '#f5f5f5',
                                                color: '#595959',
                                                borderRadius: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 12,
                                                marginRight: 8
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</div>
                                            <div style={{ fontSize: 10, color: '#8c8c8c' }}>{item.meta}</div>
                                        </div>
                                    </div>
                                    <Button size="small" type="text" style={{ fontSize: 10, padding: '2px 6px' }}>{item.action}</Button>
                                </div>
                            </Card>
                        ))}
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={editingIndex !== null ? 'Edit Account' : 'Add New Account'}
                open={isModalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                okText="Save"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item name="category" label="Account Type" rules={[{ required: true }]}>
                        <Select placeholder="Select type">
                            {categoryOptions.map(cat => (
                                <Select.Option key={cat} value={cat}>
                                    {cat}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="title" label="Account Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g., Google for Education" />
                    </Form.Item>
                    <Form.Item name="username" label="Username / Email" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="url" label="URL (Optional)">
                        <Input placeholder="e.g., https://schoolportal.com" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default AssetsDevicesSection;
