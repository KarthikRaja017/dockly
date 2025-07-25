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

const AssetsDevicesSection: React.FC = () => {
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
            if (!id) return;
            let finalUserId = id as string;

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
    }, [id]);

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
        if (!resolvedUserId) return;

        const payload = {
            userId: resolvedUserId,
            addedBy: resolvedUserId,
            editedBy: resolvedUserId,
            ...values,
        };

        try {
            if (editingIndex !== null) {
                const existing = accounts[editingIndex];
                const updated = [...accounts];
                const response = await updateAccountPassword({ ...payload, id: existing.id });
                if (response.status === 1) {
                    updated[editingIndex] = { ...payload, id: existing.id };
                    setAccounts(updated);
                    message.success('Account updated');
                }
            } else {
                const response = await addAccountPassword(payload);
                if (response.status === 1) {
                    const newItem = { ...payload, id: response.payload.id };
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

        return (
            <>
                <Alert
                    message="🔐 All passwords are securely encrypted and only accessible by guardians"
                    type="warning"
                    style={{ marginBottom: 16, fontSize: 12 }}
                />
                {Object.entries(grouped).map(([category, entries]) => (
                    <div key={category} style={{ marginBottom: 24 }}>
                        <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>
                            {category}
                        </Title>
                        {entries.map((entry, index) => {
                            const isShown = entry.id === showPasswordId;

                            return (
                                <Card
                                    key={index}
                                    size="small"
                                    style={{
                                        marginBottom: 8,
                                        backgroundColor: '#fafafa',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 8
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                                <Text strong style={{ fontSize: 14 }}>
                                                    {entry.title}
                                                </Text>
                                                {entry.url && (
                                                    <Tooltip title={entry.url}>
                                                        <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4, color: '#1890ff', fontSize: 11 }}>
                                                            ↗
                                                        </a>
                                                    </Tooltip>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2, wordBreak: 'break-all' }}>
                                                {entry.username}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                                Password: {isShown ? entry.password : '••••••••••'}
                                            </div>
                                        </div>
                                        <Space size={4} style={{ flexShrink: 0 }}>
                                            <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => {
                                                if (entry.id) { setShowPasswordId(showPasswordId === entry.id ? null : entry.id) }
                                            }

                                            }>
                                                Show
                                            </Button>
                                            <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => handleCopy(entry.password)}>
                                                Copy
                                            </Button>
                                            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(index)}>
                                                Edit
                                            </Button>
                                        </Space>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ))}
            </>
        );
    };

    return (
        <div style={{ maxWidth: '2000px', margin: '0 auto' }}>
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span>
                            <LaptopOutlined style={{ marginRight: 8 }} />
                            Accounts & Assets
                        </span>
                        <Button type="text" icon={<PlusOutlined />} onClick={handleAdd} style={{ color: '#1890ff' }} />
                    </div>
                }
                style={{ width: '100%' }}
                bodyStyle={{ padding: 24 }}
            >
                <Tabs defaultActiveKey="accounts">
                    <TabPane tab="Accounts & Passwords" key="accounts">
                        {renderAccounts()}
                    </TabPane>
                    <TabPane tab="Devices" key="devices">
                        {staticDevices.map((item, idx) => (
                            <Card
                                key={idx}
                                style={{ marginBottom: 12, borderRadius: 8 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: '#f5f5f5',
                                                color: '#595959',
                                                borderRadius: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 16,
                                                marginRight: 12
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
                                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.meta}</div>
                                        </div>
                                    </div>
                                    <Button size="small" type="text">{item.action}</Button>
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
        </div>
    );
};

export default AssetsDevicesSection;
