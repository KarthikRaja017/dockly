'use client';
import React from 'react';
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message, Avatar, Select, Dropdown, Menu, Skeleton, Tooltip } from 'antd';
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addUtility, getUtilities, updateUtility, deleteUtility } from '../../services/home';

const { Text, Title } = Typography;
const { Option } = Select;

// Utility types and icons mapping
const USA_UTILITY_TYPES = [
    { type: 'Water', icon: '💧' },
    { type: 'Electricity', icon: '⚡️' },
    { type: 'Gas', icon: '🔥' },
    { type: 'Waste Management', icon: '🗑️' },
    { type: 'Internet', icon: '🌐' },
    { type: 'Cable TV', icon: '📺' },
    { type: 'Sewer', icon: '🚿' },
    { type: 'Home Phone', icon: '☎️' },
];

// Custom hook for utilities logic
const useUtilities = (userId: string) => {
    const [utilitiesData, setUtilitiesData] = React.useState<Utility[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const fetchUtilities = async () => {
        setLoading(true);
        try {
            const response = await getUtilities({ user_id: userId });
            if (response.status === 1) {
                const utilities = response.payload.utilities || [];
                setUtilitiesData(utilities.filter((util: Utility) => util.is_active === 1));
                message.success(response.message);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Failed to fetch utilities');
            console.error('Error fetching utilities:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUtilities();
    }, [userId]);

    const handleAddUtility = async (values: any, form: any) => {
        try {
            const response = await addUtility({
                ...values,
                monthlyCost: parseFloat(values.monthlyCost),
                user_id: userId,
            });
            if (response.status === 1 && response.payload.utility.is_active === 1) {
                setUtilitiesData([...utilitiesData, response.payload.utility]);
                message.success(response.message);
                form.resetFields();
                return true;
            } else {
                message.error(response.message || 'Failed to add utility');
                return false;
            }
        } catch (error) {
            message.error('Failed to add utility');
            console.error('Error adding utility:', error);
            return false;
        }
    };

    const handleUpdateUtility = async (id: string, values: any, form: any) => {
        try {
            const response = await updateUtility(id, {
                ...values,
                monthlyCost: parseFloat(values.monthlyCost),
                user_id: userId,
            });
            if (response.status === 1) {
                setUtilitiesData((prev) =>
                    prev.map((util) =>
                        util.id === id ? { ...util, ...response.payload.utility } : util
                    ).filter((util) => util.is_active === 1)
                );
                message.success(response.message);
                form.resetFields();
                return true;
            } else {
                message.error(response.message);
                return false;
            }
        } catch (error) {
            message.error('Failed to update utility');
            console.error('Error updating utility:', error);
            return false;
        }
    };

    const handleDeleteUtility = async (id: string) => {
        setLoading(true);
        try {
            const response = await deleteUtility(id);
            if (response.status === 1) {
                await fetchUtilities();
                message.success('Utility deactivated successfully');
            } else {
                message.error(response.message || 'Failed to deactivate utility');
            }
        } catch (error) {
            message.error('Failed to deactivate utility');
            console.error('Error deactivating utility:', error);
        } finally {
            setLoading(false);
        }
    };

    return { utilitiesData, loading, fetchUtilities, handleAddUtility, handleUpdateUtility, handleDeleteUtility };
};

// Utility Item Component
interface UtilityItemProps {
    utility: Utility;
    onEdit: (utility: Utility) => void;
    onDelete: (id: string) => void;
}

interface Utility {
    id: string;
    type: string;
    accountNumber: string;
    monthlyCost: number;
    providerUrl: string;
    is_active: number;
}

const UtilityItem: React.FC<UtilityItemProps> = ({ utility, onEdit, onDelete }) => {
    const menu = (
        <Menu>
            <Menu.Item key="edit" onClick={() => onEdit(utility)}>
                <EditOutlined /> Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => onDelete(utility.id)} style={{ color: '#ff4d4f' }}>
                <DeleteOutlined /> Deactivate
            </Menu.Item>
        </Menu>
    );

    const utilityType = USA_UTILITY_TYPES.find((ut) => ut.type === utility.type);

    return (
        <List.Item
            style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0', transition: 'background-color 0.3s' }}
            actions={[
                <Tooltip title="Visit Provider">
                    <Button
                        size="small"
                        href={utility.providerUrl}
                        target="_blank"
                        style={{
                            color: '#1890ff',
                            borderColor: '#1890ff',
                            background: 'transparent',
                            borderRadius: '6px',
                            padding: '0 12px',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#e6f7ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        Log In
                    </Button>
                </Tooltip>,
                <Dropdown overlay={menu} trigger={['click']}>
                    <Button
                        size="small"
                        style={{
                            borderColor: '#d9d9d9',
                            background: 'transparent',
                            borderRadius: '6px',
                            padding: '0 12px',
                        }}
                    >
                        <MoreOutlined />
                    </Button>
                </Dropdown>,
            ]}
        >
            <List.Item.Meta
                avatar={<Avatar style={{ background: 'linear-gradient(135deg, #1890ff, #40c4ff)', fontSize: '18px' }}>{utilityType?.icon || utility.type[0]}</Avatar>}
                title={<Text style={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f' }}>{utility.type}</Text>}
                description={
                    <div>
                        <Text style={{ color: '#595959' }}>
                            Account #{utility.accountNumber || 'N/A'} • ${utility.monthlyCost != null ? utility.monthlyCost.toFixed(2) : '0.00'}/month
                        </Text>
                        <br />
                        {/* <Text style={{ color: '#1890ff' }}>
              <a href={utility.providerUrl} target="_blank" style={{ color: '#1890ff' }}>
                {utility.providerUrl}
              </a>
            </Text> */}
                    </div>
                }
            />
        </List.Item>
    );
};

// Utility Form Component
interface UtilityFormProps {
    form: any;
    onOk: () => void;
    onCancel: () => void;
    title: string;
    okText: string;
}

const UtilityForm: React.FC<UtilityFormProps> = ({ form, onOk, onCancel, title, okText }) => (
    <Modal
        title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>{title}</Title>}
        open={true}
        onOk={onOk}
        onCancel={onCancel}
        okText={okText}
        cancelText="Cancel"
        style={{ padding: '24px' }}
        bodyStyle={{ background: '#fafafa', borderRadius: '8px' }}
        okButtonProps={{
            style: { background: 'linear-gradient(135deg, #1890ff, #40c4ff)', border: 'none', borderRadius: '6px' },
        }}
        cancelButtonProps={{ style: { borderRadius: '6px' } }}
    >
        <Form form={form} layout="vertical" style={{ padding: '16px' }}>
            <Form.Item
                name="type"
                label="Utility Type"
                rules={[{ required: true, message: 'Please select utility type!' }]}
            >
                <Select
                    style={{ width: '100%', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Select utility type"
                >
                    {USA_UTILITY_TYPES.map(({ type, icon }) => (
                        <Option key={type} value={type}>
                            {icon} {type}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                name="accountNumber"
                label="Account Number"
                rules={[{ required: true, message: 'Please enter account number!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter account number"
                />
            </Form.Item>
            <Form.Item
                name="monthlyCost"
                label="Monthly Cost ($)"
                rules={[
                    { required: true, message: 'Please enter monthly cost!' },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: 'Please enter a valid amount (e.g., 65.00)' },
                ]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter monthly cost"
                />
            </Form.Item>
            <Form.Item
                name="providerUrl"
                label="Provider URL"
                rules={[
                    { required: true, message: 'Please enter provider URL!' },
                    { type: 'url', message: 'Please enter a valid URL!' },
                ]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter provider URL"
                />
            </Form.Item>
        </Form>
    </Modal>
);

// Main Utilities Component
const Utilities: React.FC = () => {
    const userId = 'test_user_id'; // TODO: Replace with actual user ID from auth context
    const { utilitiesData, loading, handleAddUtility, handleUpdateUtility, handleDeleteUtility } = useUtilities(userId);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = React.useState<boolean>(false);
    const [editingUtility, setEditingUtility] = React.useState<Utility | null>(null);
    const [editForm] = Form.useForm();
    const [addForm] = Form.useForm();

    const handleEdit = (utility: Utility) => {
        setEditingUtility(utility);
        editForm.setFieldsValue({
            type: utility.type || '',
            accountNumber: utility.accountNumber || '',
            monthlyCost: utility.monthlyCost != null ? utility.monthlyCost.toFixed(2) : '0.00',
            providerUrl: utility.providerUrl || '',
        });
        setIsEditModalOpen(true);
    };

    const handleEditOk = () => {
        editForm.validateFields().then(async (values) => {
            if (editingUtility) {
                const success = await handleUpdateUtility(editingUtility.id, values, editForm);
                if (success) {
                    setIsEditModalOpen(false);
                    setEditingUtility(null);
                }
            }
        });
    };

    const handleAddOk = () => {
        addForm.validateFields().then(async (values) => {
            const success = await handleAddUtility(values, addForm);
            if (success) {
                setIsAddModalOpen(false);
            }
        });
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to deactivate this utility?',
            content: 'This will mark the utility as inactive but not permanently delete it.',
            okText: 'Deactivate',
            okButtonProps: { danger: true, style: { borderRadius: '6px' } },
            cancelText: 'Cancel',
            onOk: () => handleDeleteUtility(id),
        });
    };

    return (
        <>
            <Card
                title={
                    <Space>
                        <span style={{ fontSize: '20px' }}>🔌</span>
                        <Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Utilities</Title>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            background: 'linear-gradient(135deg, #1890ff, #40c4ff)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0 16px',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        Add Utility
                    </Button>
                }
                style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
                }}
            >
                {loading ? (
                    <Skeleton active paragraph={{ rows: 4 }} style={{ padding: '16px' }} />
                ) : utilitiesData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#595959' }}>
                        <Text style={{ fontSize: '16px' }}>No active utilities found. Add a utility to get started!</Text>
                        <div style={{ marginTop: '16px' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsAddModalOpen(true)}
                                style={{
                                    background: 'linear-gradient(135deg, #1890ff, #40c4ff)',
                                    border: 'none',
                                    borderRadius: '6px',
                                }}
                            >
                                Add Your First Utility
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <List
                            itemLayout="horizontal"
                            dataSource={utilitiesData.slice(0, 4)}
                            renderItem={(item) => (
                                <UtilityItem utility={item} onEdit={handleEdit} onDelete={handleDelete} />
                            )}
                            style={{ padding: '0 16px' }}
                        />
                        {utilitiesData.length > 4 && (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Button
                                    type="primary"
                                    onClick={() => setIsViewAllModalOpen(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #1890ff, #40c4ff)',
                                        border: 'none',
                                        borderRadius: '20px',
                                        padding: '0 24px',
                                        height: '36px',
                                        transition: 'all 0.3s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                >
                                    View All Utilities
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {isEditModalOpen && (
                <UtilityForm
                    form={editForm}
                    onOk={handleEditOk}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        editForm.resetFields();
                        setEditingUtility(null);
                    }}
                    title="Edit Utility"
                    okText="Save"
                />
            )}

            {isAddModalOpen && (
                <UtilityForm
                    form={addForm}
                    onOk={handleAddOk}
                    onCancel={() => {
                        setIsAddModalOpen(false);
                        addForm.resetFields();
                    }}
                    title="Add Utility"
                    okText="Add"
                />
            )}

            <Modal
                title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>All Utilities</Title>}
                open={isViewAllModalOpen}
                onCancel={() => setIsViewAllModalOpen(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsViewAllModalOpen(false)}
                        style={{ borderRadius: '6px' }}
                    >
                        Close
                    </Button>,
                ]}
                width={600}
                style={{ padding: '24px' }}
                bodyStyle={{ background: '#fafafa', borderRadius: '8px' }}
            >
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={utilitiesData}
                    renderItem={(item) => (
                        <UtilityItem utility={item} onEdit={handleEdit} onDelete={handleDelete} />
                    )}
                    style={{ padding: '0 16px' }}
                />
            </Modal>
        </>
    );
};

export default Utilities;