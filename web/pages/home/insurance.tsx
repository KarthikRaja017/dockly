'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Form, Input, Typography, message, Space, Avatar, Select, InputNumber, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import { addInsurance, getInsurance, updateInsurance, deleteInsurance } from '../../services/home';

const { Text } = Typography;
const { Item: FormItem } = Form;
const { Option } = Select;

// Define schema for dynamic insurance types
const insuranceSchemas: { [key: string]: { label: string } } = {
    Health: { label: 'Health Insurance' },
    Auto: { label: 'Auto Insurance' },
    Home: { label: 'Home Insurance' },
    Life: { label: 'Life Insurance' }
};
// const insuranceSchemas: {
//     Health: {
//         label: string;
//     };
//     Auto: {
//         label: string;
//     };
//     Home: {
//         label: string;
//     };
//     Life: {
//         label: string;
//     };
// }

// Types
interface InsuranceDetail {
    key: string;
    value: string | number | null;
}
interface Insurance {
    id: string;
    name: string;
    meta: string;
    type: string;
    years: number;
    payment: number;
    renewalDate: string | null;
    color?: string;
    details?: InsuranceDetail[];
    is_active: number;
}
interface InsuranceCardProps {
    isMobile: boolean;
}
interface FormModalProps {
    visible: boolean;
    title: string;
    onOk: () => void;
    onCancel: () => void;
    form: any;
    isMobile: boolean;
    initialValues?: Partial<Insurance>;
}

const Insurance: React.FC<InsuranceCardProps> = ({ isMobile }) => {
    const [insuranceData, setInsuranceData] = useState<Insurance[]>([]);
    const [modals, setModals] = useState({ add: false, edit: false, view: false });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewing, setViewing] = useState<Insurance | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    const PRIMARY_COLOR = '#1890ff';
    const SHADOW_COLOR = 'rgba(0, 0, 0, 0.1)';

    // Replace with actual user_id from auth context
    // const userId = 'test_user_id'; // TODO: Replace with actual user ID from auth context

    // Fetch insurance policies on mount
    useEffect(() => {
        const fetchInsurance = async () => {
            setLoading(true);
            try {
                const response = await getInsurance({});
                console.log('Fetched insurance response:', response); // Debug log
                if (response.status === 1) {
                    const insurances = response.payload.insurances || [];
                    setInsuranceData(insurances.map((item: Insurance) => ({
                        ...item,
                        color: PRIMARY_COLOR,
                        details: [
                            { key: 'Policy Number', value: item.meta },
                            { key: 'Insurance Type', value: insuranceSchemas[item.type]?.label || item.type },
                            { key: 'Duration', value: `${item.years} years` },
                            { key: 'Payment Amount', value: `$${item.payment}` },
                            { key: 'Renewal Date', value: item.renewalDate || 'N/A' },
                        ]
                    })));
                    message.success(response.message);
                } else {
                    message.error(response.message);
                }
            } catch (error) {
                message.error('Failed to fetch insurance policies');
                console.error('Error fetching insurance:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInsurance();
    }, []);

    // Check for duplicate policy name and number
    const checkDuplicate = (name: string, meta: string, skipId?: string) => {
        return insuranceData.some(
            it =>
                it.name.toLowerCase() === name.toLowerCase() &&
                it.meta === meta &&
                it.id !== skipId
        );
    };

    // Open modal with proper state reset
    const openModal = (type: 'add' | 'edit' | 'view', insn?: Insurance) => {
        try {
            if (type === 'add') {
                form.resetFields();
                setModals({ add: true, edit: false, view: false });
            } else if (type === 'edit' && insn) {
                setEditingId(insn.id);
                const vals = {
                    insuranceName: insn.name,
                    insuranceMeta: insn.meta,
                    insuranceType: insn.type,
                    years: insn.years,
                    payment: insn.payment,
                    renewalDate: insn.renewalDate && moment(insn.renewalDate, 'YYYY-MM-DD').isValid()
                        ? moment(insn.renewalDate, 'YYYY-MM-DD')
                        : null,
                };
                form.setFieldsValue(vals);
                setModals({ add: false, edit: true, view: false });
                console.log('Edit modal opened with initial values:', vals);
            } else if (type === 'view' && insn) {
                setViewing(insn);
                setModals({ add: false, edit: false, view: true });
            }
            console.log(`Opening modal: ${type}`, { insurance: insn });
        } catch (error) {
            console.error('Error opening modal:', error);
            message.error('Failed to open modal. Please try again.');
        }
    };

    // Handle form save for add/edit
    const handleSave = async (isEdit: boolean) => {
        try {
            const values = await form.validateFields();
            if (checkDuplicate(values.insuranceName, values.insuranceMeta, isEdit ? editingId! : undefined)) {
                message.error('Duplicate policy name/number!');
                return;
            }
            const insurancePayload = {
                // user_id: userId,
                name: values.insuranceName,
                meta: values.insuranceMeta,
                type: values.insuranceType,
                years: values.years,
                payment: values.payment,
                renewalDate: values.renewalDate ? moment(values.renewalDate).format('YYYY-MM-DD') : null
            };
            if (isEdit) {
                const response = await updateInsurance(editingId!, insurancePayload);
                if (response.status === 1) {
                    setInsuranceData(prev =>
                        prev.map(it =>
                            it.id === editingId
                                ? {
                                    ...it,
                                    name: values.insuranceName,
                                    meta: values.insuranceMeta,
                                    type: values.insuranceType,
                                    years: values.years,
                                    payment: values.payment,
                                    renewalDate: values.renewalDate ? moment(values.renewalDate).format('YYYY-MM-DD') : null,
                                    is_active: response.payload.insurance.is_active,
                                    details: [
                                        { key: 'Policy Number', value: values.insuranceMeta },
                                        { key: 'Insurance Type', value: insuranceSchemas[values.insuranceType]?.label || values.insuranceType },
                                        { key: 'Duration', value: `${values.years} years` },
                                        { key: 'Payment Amount', value: `$${values.payment}` },
                                        { key: 'Renewal Date', value: values.renewalDate ? moment(values.renewalDate).format('YYYY-MM-DD') : 'N/A' },
                                    ]
                                }
                                : it
                        )
                    );
                    message.success(response.message);
                } else {
                    message.error(response.message);
                }
            } else {
                const response = await addInsurance(insurancePayload);
                if (response.status === 1) {
                    const newInsurance = {
                        ...response.payload.insurance,
                        color: PRIMARY_COLOR,
                        details: [
                            { key: 'Policy Number', value: values.insuranceMeta },
                            { key: 'Insurance Type', value: insuranceSchemas[values.insuranceType]?.label || values.insuranceType },
                            { key: 'Duration', value: `${values.years} years` },
                            { key: 'Payment Amount', value: `$${values.payment}` },
                            { key: 'Renewal Date', value: values.renewalDate ? moment(values.renewalDate).format('YYYY-MM-DD') : 'N/A' },
                        ]
                    };
                    setInsuranceData(prev => [...prev, newInsurance]);
                    message.success(response.message);
                } else {
                    message.error(response.message);
                }
            }
            form.resetFields();
            setModals({ add: false, edit: false, view: false });
            setEditingId(null);
        } catch (error) {
            console.error('Error saving policy:', error);
            message.error('Failed to save policy. Please check the form and try again.');
        }
    };

    // Handle delete confirmation
    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this policy?',
            onOk: async () => {
                try {
                    const response = await deleteInsurance(id);
                    if (response.status === 1) {
                        setInsuranceData(prev => prev.filter(it => it.id !== id));
                        setViewing(null);
                        setModals({ ...modals, view: false });
                        message.success('Policy deactivated successfully!');
                    } else {
                        message.error(response.message);
                    }
                } catch (error) {
                    message.error('Failed to deactivate policy');
                    console.error('Error deactivating policy:', error);
                }
            },
        });
    };

    // Form modal component
    const FormModal: React.FC<FormModalProps> = ({
        visible,
        title,
        onOk,
        onCancel,
        form,
        isMobile,
        initialValues,
    }) => {
        useEffect(() => {
            if (visible && initialValues) {
                const vals = {
                    insuranceName: initialValues.name || '',
                    insuranceMeta: initialValues.meta || '',
                    insuranceType: initialValues.type || undefined,
                    years: initialValues.years || undefined,
                    payment: initialValues.payment || undefined,
                    renewalDate: initialValues.renewalDate && moment(initialValues.renewalDate, 'YYYY-MM-DD').isValid()
                        ? moment(initialValues.renewalDate, 'YYYY-MM-DD')
                        : null,
                };
                form.setFieldsValue(vals);
                console.log('FormModal initialized with values:', vals);
            } else if (visible) {
                form.resetFields();
                console.log('FormModal reset for add mode');
            }
        }, [visible, initialValues, form]);

        return (
            <Modal
                title={title}
                open={visible}
                onOk={onOk}
                onCancel={onCancel}
                width={isMobile ? '90%' : 600}
                destroyOnClose
                style={{ borderRadius: '8px' }}
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <FormItem
                        name="insuranceName"
                        label="Policy Holder Name"
                        rules={[{ required: true, message: 'Please enter policy name!' }]}
                    >
                        <Input placeholder="Enter policy name" style={{ borderRadius: '4px' }} />
                    </FormItem>
                    <FormItem
                        name="insuranceMeta"
                        label="Policy Number"
                        rules={[{ required: true, message: 'Please enter policy number!' }]}
                    >
                        <Input placeholder="e.g., POL-123456" style={{ borderRadius: '4px' }} />
                    </FormItem>
                    <FormItem
                        name="insuranceType"
                        label="Insurance Type"
                        rules={[{ required: true, message: 'Please select insurance type!' }]}
                    >
                        <Select placeholder="Select type" style={{ borderRadius: '4px' }}>
                            {Object.keys(insuranceSchemas).map(key => (
                                <Option key={key} value={key}>
                                    {insuranceSchemas[key].label}
                                </Option>
                            ))}
                        </Select>
                    </FormItem>
                    <FormItem
                        name="years"
                        label="Duration (Years)"
                        rules={[{ required: true, message: 'Please select duration!' }]}
                    >
                        <Select placeholder="Select duration" style={{ borderRadius: '4px' }}>
                            {[...Array(10)].map((_, i) => (
                                <Option key={i + 1} value={i + 1}>
                                    {i + 1} year{i ? 's' : ''}
                                </Option>
                            ))}
                        </Select>
                    </FormItem>
                    <FormItem
                        name="payment"
                        label="Payment Amount ($)"
                        rules={[{ required: true, message: 'Please enter payment amount!' }]}
                    >
                        <InputNumber
                            style={{ width: '100%', borderRadius: '4px' }}
                            min={0}
                            step={100}
                            placeholder="e.g., 1250"
                            parser={value => (value ? parseFloat(value.replace(/[^\d.]/g, '')) : 0)}
                            formatter={value => (value ? `${value}` : '')}
                        />
                    </FormItem>
                    <FormItem
                        name="renewalDate"
                        label="Renewal Date"
                        rules={[
                            { required: true, message: 'Please select renewal date!' },
                            {
                                validator: (_, value: Moment | null) => {
                                    if (value && !moment(value).isValid()) {
                                        return Promise.reject(new Error('Invalid date format!'));
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <DatePicker
                            style={{ width: '100%', borderRadius: '4px' }}
                            format="YYYY-MM-DD"
                            onChange={(value) => {
                                if (value && !value.isValid()) {
                                    console.warn('Invalid date selected:', value);
                                    form.setFieldsValue({ renewalDate: null });
                                }
                            }}
                        />
                    </FormItem>
                </Form>
            </Modal>
        );
    };

    return (
        <Card
            title={
                <span>
                    <span style={{ marginRight: '8px' }}>🛡️</span> Insurance Policies
                </span>
            }
            extra={
                <Button
                    icon={<PlusOutlined />}
                    onClick={() => openModal('add')}
                    style={{
                        backgroundColor: PRIMARY_COLOR,
                        color: '#fff',
                        borderRadius: '4px',
                        border: 'none',
                        padding: '0 16px',
                        height: '32px',
                    }}
                >
                    Add Insurance
                </Button>
            }
            style={{
                borderRadius: '10px',
                boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
                marginBottom: '16px',
                width: '100%',
                border: '1px solid #d9d9d9',
            }}
            styles={{ body: { padding: '16px' } }}
        >
            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={insuranceData}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Button
                                key="view"
                                size="small"
                                onClick={() => openModal('view', item)}
                                style={{
                                    color: PRIMARY_COLOR,
                                    borderColor: PRIMARY_COLOR,
                                    backgroundColor: 'transparent',
                                    borderRadius: '4px',
                                    padding: '0 8px',
                                }}
                            >
                                <EyeOutlined /> View
                            </Button>,
                        ]}
                        style={{ borderBottom: '1px solid #f0f0f0', padding: isMobile ? '8px 4px' : '8px 0' }}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar style={{ backgroundColor: item.color, borderRadius: '50%' }}>
                                    {item.name[0]}
                                </Avatar>
                            }
                            title={<Text strong>{item.name}</Text>}
                            description={
                                <Text>
                                    {item.meta} • {insuranceSchemas[item.type]?.label || item.type} • {item.years} year
                                    {item.years > 1 ? 's' : ''} • Renewal: {item.renewalDate || 'N/A'}
                                </Text>
                            }
                        />
                    </List.Item>
                )}
            />
            {insuranceData.length === 0 && !loading && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Text type="secondary">No insurance policies found. Add a policy to get started.</Text>
                </div>
            )}
            <FormModal
                visible={modals.add}
                title="Add Insurance Policy"
                onOk={() => handleSave(false)}
                onCancel={() => {
                    form.resetFields();
                    setModals({ add: false, edit: false, view: false });
                }}
                form={form}
                isMobile={isMobile}
            />
            <FormModal
                visible={modals.edit}
                title="Edit Insurance Policy"
                onOk={() => handleSave(true)}
                onCancel={() => {
                    form.resetFields();
                    setEditingId(null);
                    setModals({ add: false, edit: false, view: false });
                }}
                form={form}
                isMobile={isMobile}
                initialValues={editingId ? insuranceData.find(item => item.id === editingId) : undefined}
            />
            <Modal
                title={
                    <Space>
                        <Text strong>{viewing?.name || 'Insurance Details'}</Text>
                        <Button
                            size="small"
                            style={{
                                color: '#fff',
                                backgroundColor: PRIMARY_COLOR,
                                borderColor: PRIMARY_COLOR,
                                borderRadius: '4px',
                                padding: '0 8px',
                                marginLeft: '250px'
                            }}
                            onClick={() => {
                                openModal('edit', viewing!);
                                setModals({ add: false, edit: true, view: false });
                            }}
                        >
                            <EditOutlined /> Edit
                        </Button>
                        <Button
                            size="small"
                            style={{
                                color: '#fff',
                                backgroundColor: '#ff4d4f',
                                borderColor: '#ff4d4f',
                                borderRadius: '4px',
                                padding: '0 8px',
                            }}
                            onClick={() => viewing && handleDelete(viewing.id)}
                        >
                            <DeleteOutlined /> Delete
                        </Button>
                    </Space>
                }
                open={modals.view}
                onCancel={() => setModals({ ...modals, view: false })}
                footer={
                    <Button
                        onClick={() => setModals({ ...modals, view: false })}
                        style={{ borderRadius: '4px' }}
                    >
                        Close
                    </Button>
                }
                width={isMobile ? '90%' : 600}
                destroyOnClose
                style={{ borderRadius: '8px' }}
            >
                {viewing && (
                    <div style={{ lineHeight: '2' }}>
                        <Text strong>Policy Number: </Text>
                        <Text>{viewing.meta}</Text>
                        <br />
                        <Text strong>Insurance Type: </Text>
                        <Text>{insuranceSchemas[viewing.type]?.label || viewing.type}</Text>
                        <br />
                        <Text strong>Duration: </Text>
                        <Text>
                            {viewing.years} year{viewing.years > 1 ? 's' : ''}
                        </Text>
                        <br />
                        <Text strong>Payment Amount: </Text>
                        <Text>${viewing.payment}</Text>
                        <br />
                        <Text strong>Renewal Date: </Text>
                        <Text>{viewing.renewalDate || 'N/A'}</Text>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default Insurance;