'use client';

import React, { useState } from 'react';
import { Card, Tabs, Button, Typography, Space, Modal, Form, Input, Select, message } from 'antd';

const { Title } = Typography;
const { TabPane } = Tabs;

interface Device {
    icon: string;
    type: string;
    name: string;
    id: string;
    owner: string;
    action: string;
}

interface Account {
    icon: string;
    name: string;
    meta: string;
    action: string;
    color: string;
    textColor: string;
}

interface Password {
    name: string;
    info: string;
}

const AssetsDevicesSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState('devices');
    const [isDeviceModalVisible, setIsDeviceModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editDeviceIndex, setEditDeviceIndex] = useState<number | null>(null);
    const [selectedDeviceIndex, setSelectedDeviceIndex] = useState<number | null>(null);
    const [devices, setDevices] = useState<Device[]>([
        {
            icon: '📱',
            type: 'Phone',
            name: 'iPhone 14 (Personal)',
            id: 'IPH123456',
            owner: 'Emma Smith',
            action: 'View',
        },
        {
            icon: '💻',
            type: 'Laptop',
            name: 'MacBook Air (School)',
            id: 'MAC789012',
            owner: 'Emma Smith',
            action: 'View',
        },
        {
            icon: '🎮',
            type: 'Gaming Console',
            name: 'Nintendo Switch',
            id: 'NSW456789',
            owner: 'Family',
            action: 'View',
        },
    ]);
    const [form] = Form.useForm();

    // Device type options for dropdown
    const deviceTypeOptions = [
        { value: 'Phone', label: 'Phone', icon: '📱' },
        { value: 'Tablet', label: 'Tablet', icon: '📱' },
        { value: 'Laptop', label: 'Laptop', icon: '💻' },
        { value: 'Gaming Console', label: 'Gaming Console', icon: '🎮' },
        { value: 'Smartwatch', label: 'Smartwatch', icon: '⌚' },
        { value: 'Other', label: 'Other', icon: '📱' },
    ];

    // Handle adding a new device
    const handleAddDevice = (values: { type: string; name: string; id: string; owner: string }) => {
        const selectedType = deviceTypeOptions.find((option) => option.value === values.type);
        const newDevice: Device = {
            icon: selectedType?.icon || '📱',
            type: values.type,
            name: values.name,
            id: values.id,
            owner: values.owner,
            action: 'View',
        };
        setDevices([...devices, newDevice]);
        setIsDeviceModalVisible(false);
        setSelectedDeviceIndex(null);
        form.resetFields();
        message.success('Device added successfully');
    };

    // Handle editing an existing device
    const handleEditDevice = (values: { type: string; name: string; id: string; owner: string }) => {
        if (editDeviceIndex === null) return;
        const selectedType = deviceTypeOptions.find((option) => option.value === values.type);
        const updatedDevices = [...devices];
        updatedDevices[editDeviceIndex] = {
            icon: selectedType?.icon || '📱',
            type: values.type,
            name: values.name,
            id: values.id,
            owner: values.owner,
            action: 'View',
        };
        setDevices(updatedDevices);
        setIsDeviceModalVisible(false);
        setIsEditMode(false);
        setEditDeviceIndex(null);
        setSelectedDeviceIndex(null);
        form.resetFields();
        message.success('Device updated successfully');
    };

    // Handle removing a device
    const handleRemoveDevice = () => {
        if (selectedDeviceIndex === null) {
            message.error('Please select a device to remove');
            return;
        }
        Modal.confirm({
            title: 'Are you sure you want to remove this device?',
            onOk: () => {
                setDevices(devices.filter((_, i) => i !== selectedDeviceIndex));
                setSelectedDeviceIndex(null);
                message.success('Device removed successfully');
            },
        });
    };

    // Open modal for editing a device
    const openEditModal = () => {
        if (selectedDeviceIndex === null) {
            message.error('Please select a device to edit');
            return;
        }
        const device = devices[selectedDeviceIndex];
        form.setFieldsValue({
            type: device.type,
            name: device.name,
            id: device.id,
            owner: device.owner,
        });
        setIsEditMode(true);
        setEditDeviceIndex(selectedDeviceIndex);
        setIsDeviceModalVisible(true);
    };

    return (
        <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
            <Card
                title={
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Title level={4} style={{ margin: 0 }}>
                            📱 Assets & Devices
                        </Title>
                        <Button type="primary" onClick={() => setIsDeviceModalVisible(true)}>
                            + Add
                        </Button>
                    </div>
                }
                style={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                }}
                bodyStyle={{ padding: '24px' }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    style={{ width: '100%' }}
                >
                    {/* Devices Tab */}
                    <TabPane tab="Devices" key="devices">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginBottom: 16,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Select
                                style={{ width: 200 }}
                                placeholder="Select a device"
                                value={selectedDeviceIndex !== null ? devices[selectedDeviceIndex]?.name : undefined}
                                onChange={(value) => setSelectedDeviceIndex(Number(value))}
                            >
                                {devices.map((device, index) => (
                                    <Select.Option key={index} value={index}>
                                        {device.name}
                                    </Select.Option>
                                ))}
                            </Select>
                            <Space>
                                <Button onClick={openEditModal} disabled={selectedDeviceIndex === null}>
                                    Edit
                                </Button>
                                <Button danger onClick={handleRemoveDevice} disabled={selectedDeviceIndex === null}>
                                    Delete
                                </Button>
                            </Space>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                width: '100%',
                            }}
                        >
                            {devices.map((device, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 24,
                                                backgroundColor: '#f3f4f6',
                                                color: '#374151',
                                                padding: '8px',
                                                borderRadius: 8,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {device.icon}
                                        </div>
                                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {device.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>
                                                Type: {device.type} | ID: {device.id} | Owner: {device.owner}
                                            </div>
                                        </div>
                                    </div>
                                    <Button>{device.action}</Button>
                                </div>
                            ))}
                        </div>
                    </TabPane>

                    {/* Accounts Tab */}
                    <TabPane tab="Accounts" key="accounts">
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                width: '100%',
                            }}
                        >
                            {[
                                {
                                    icon: '📧',
                                    name: 'Apple ID',
                                    meta: 'emma.smith@family.com',
                                    action: 'Manage',
                                    color: '#fee2e2',
                                    textColor: '#dc2626',
                                },
                                {
                                    icon: '🎓',
                                    name: 'Google for Education',
                                    meta: 'School managed',
                                    action: 'View',
                                    color: '#dcfce7',
                                    textColor: '#16a34a',
                                },
                                {
                                    icon: '📸',
                                    name: 'Instagram',
                                    meta: '@emma_smith2011',
                                    action: 'Monitor',
                                    color: '#e0e7ff',
                                    textColor: '#4338ca',
                                },
                                {
                                    icon: '🎵',
                                    name: 'Spotify Family',
                                    meta: 'Family member account',
                                    action: 'Settings',
                                    color: '#fef3c7',
                                    textColor: '#d97706',
                                },
                                {
                                    icon: '🎬',
                                    name: 'Disney+',
                                    meta: 'Kids profile',
                                    action: 'View',
                                    color: '#f3f4f6',
                                    textColor: '#374151',
                                },
                            ].map((acc, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '12px 16px',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 24,
                                                backgroundColor: acc.color,
                                                color: acc.textColor,
                                                padding: '8px',
                                                borderRadius: 8,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {acc.icon}
                                        </div>
                                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {acc.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>
                                                {acc.meta}
                                            </div>
                                        </div>
                                    </div>
                                    <Button>{acc.action}</Button>
                                </div>
                            ))}
                        </div>
                    </TabPane>

                    {/* Passwords Tab */}
                    <TabPane tab="Passwords" key="passwords">
                        <div
                            style={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                padding: '8px 12px',
                                borderRadius: 6,
                                fontSize: 12,
                                marginBottom: 16,
                            }}
                        >
                            🔐 All passwords are securely encrypted and only accessible by guardians
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                width: '100%',
                            }}
                        >
                            {[
                                {
                                    name: 'School Portal',
                                    info: 'Username: emma.smith2029',
                                },
                                {
                                    name: 'Email Account',
                                    info: 'emma.smith@family.com',
                                },
                                {
                                    name: 'Khan Academy',
                                    info: 'emma_smith_shs',
                                },
                                {
                                    name: 'Library Card',
                                    info: 'Card #: 2145678901',
                                },
                                {
                                    name: 'School WiFi',
                                    info: 'Network: SHS-Student',
                                },
                            ].map((pwd, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: '12px',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 8,
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {pwd.name}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>
                                                {pwd.info}
                                            </div>
                                        </div>
                                        <Space>
                                            <Button size="small">Show</Button>
                                            <Button size="small">Copy</Button>
                                        </Space>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabPane>
                </Tabs>
            </Card>

            {/* Device Modal */}
            <Modal
                title={isEditMode ? 'Edit Device' : 'Add New Device'}
                open={isDeviceModalVisible}
                onCancel={() => {
                    setIsDeviceModalVisible(false);
                    setIsEditMode(false);
                    setEditDeviceIndex(null);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={isEditMode ? handleEditDevice : handleAddDevice}
                    layout="vertical"
                >
                    <Form.Item
                        name="type"
                        label="Device Type"
                        rules={[{ required: true, message: 'Please select a device type' }]}
                    >
                        <Select placeholder="Select device type">
                            {deviceTypeOptions.map((option) => (
                                <Select.Option key={option.value} value={option.value}>
                                    {option.label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="Device Name"
                        rules={[{ required: true, message: 'Please enter device name' }]}
                    >
                        <Input placeholder="e.g., iPhone 14" />
                    </Form.Item>
                    <Form.Item
                        name="id"
                        label="Device ID"
                        rules={[{ required: true, message: 'Please enter device ID' }]}
                    >
                        <Input placeholder="e.g., IPH123456" />
                    </Form.Item>
                    <Form.Item
                        name="owner"
                        label="Owner"
                        rules={[{ required: true, message: 'Please enter owner name' }]}
                    >
                        <Input placeholder="e.g., Emma Smith" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {isEditMode ? 'Update Device' : 'Add Device'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AssetsDevicesSection;