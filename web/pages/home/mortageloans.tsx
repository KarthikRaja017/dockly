'use client';
import React from 'react';
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message, Avatar, Skeleton, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getLoansAndMortgages } from '../../services/apiConfig';

const { Text, Title } = Typography;

// Mortgage types and icons
const MORTGAGE_TYPES = [
    { type: 'Home Mortgage', icon: '🏠' },
    { type: 'Auto Loan', icon: '🚗' },
    { type: 'Personal Loan', icon: '💸' },
    { type: 'Student Loan', icon: '🎓' },
];

// Custom hook for mortgage logic
interface Mortgage {
    id?: string;
    name: string;
    meta: string;
    color: string;
}

const useMortgageLoans = (uid: string) => {
    const [mortgageData, setMortgageData] = React.useState<Mortgage[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const fetchLoansAndMortgages = async () => {
        try {
            setLoading(true);
            const response = await getLoansAndMortgages({ uid });
            const loans = response.payload?.loans.map((loan: any) => ({
                id: loan.id,
                name: loan.name,
                meta: loan.meta,
                color: loan.color || '#1890ff',
            })) || [];
            setMortgageData(loans);
        } catch (error) {
            message.error('Failed to fetch loans and mortgages');
            console.error('Error fetching loans and mortgages:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLoansAndMortgages();
    }, [uid]);

    const addMortgage = (values: { name: string; meta: string }) => {
        if (mortgageData.some((m) => m.name.toLowerCase() === values.name.toLowerCase() && m.meta === values.meta)) {
            message.error('Duplicate mortgage name or meta!');
            return false;
        }
        setMortgageData([...mortgageData, { name: values.name, meta: values.meta, color: '#1890ff' }]);
        message.success('Mortgage added successfully!');
        return true;
    };

    const updateMortgage = (id: string, values: { name: string; meta: string }) => {
        if (mortgageData.some((m) => m.id !== id && m.name.toLowerCase() === values.name.toLowerCase() && m.meta === values.meta)) {
            message.error('Duplicate mortgage name or meta!');
            return false;
        }
        setMortgageData(mortgageData.map((m) => (m.id === id ? { ...m, ...values } : m)));
        message.success('Mortgage updated successfully!');
        return true;
    };

    const deleteMortgage = (id: string) => {
        setMortgageData(mortgageData.filter((m) => m.id !== id));
        message.success('Mortgage deleted successfully!');
    };

    return { mortgageData, loading, addMortgage, updateMortgage, deleteMortgage, fetchLoansAndMortgages };
};

// Mortgage Item Component
interface MortgageItemProps {
    mortgage: Mortgage;
    onEdit: (mortgage: Mortgage) => void;
    onDelete: (id: string) => void;
}

const MortgageItem: React.FC<MortgageItemProps> = ({ mortgage, onEdit, onDelete }) => {
    const mortgageType = MORTGAGE_TYPES.find((mt) => mt.type === mortgage.name) || { icon: '🏦' };

    return (
        <List.Item
            style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0', transition: 'background-color 0.3s' }}
            actions={[
                <Tooltip title="Edit Mortgage">
                    <Button
                        size="small"
                        onClick={() => onEdit(mortgage)}
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
                        <EditOutlined />
                    </Button>
                </Tooltip>,
                <Tooltip title="Delete Mortgage">
                    <Button
                        size="small"
                        onClick={() => onDelete(mortgage.id!)}
                        style={{
                            color: '#ff4d4f',
                            borderColor: '#ff4d4f',
                            background: 'transparent',
                            borderRadius: '6px',
                            padding: '0 12px',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fff1f0')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                        <DeleteOutlined />
                    </Button>
                </Tooltip>,
            ]}
        >
            <List.Item.Meta
                avatar={<Avatar style={{ background: 'linear-gradient(135deg, #1890ff, #40c4ff)', fontSize: '18px' }}>{mortgageType.icon}</Avatar>}
                title={<Text style={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f' }}>{mortgage.name}</Text>}
                description={<Text style={{ color: '#595959' }}>{mortgage.meta}</Text>}
            />
        </List.Item>
    );
};

// Mortgage Form Component
interface MortgageFormProps {
    form: any;
    onOk: () => void;
    onCancel: () => void;
    title: string;
    okText: string;
    initialValues?: Partial<Mortgage>;
}

const MortgageForm: React.FC<MortgageFormProps> = ({ form, onOk, onCancel, title, okText, initialValues }) => (
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
                name="name"
                label="Mortgage Name"
                rules={[{ required: true, message: 'Please enter mortgage name!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter mortgage name (e.g., Home Mortgage)"
                />
            </Form.Item>
            <Form.Item
                name="meta"
                label="Mortgage Details"
                rules={[{ required: true, message: 'Please enter mortgage details!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter details (e.g., Loan #12345, $2000/month)"
                />
            </Form.Item>
        </Form>
    </Modal>
);

// Main Component
const MortgageLoans: React.FC = () => {
    const uid = 'sample-uid'; // TODO: Replace with actual user ID from auth context
    const { mortgageData, loading, addMortgage, updateMortgage, deleteMortgage } = useMortgageLoans(uid);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
    const [editingMortgage, setEditingMortgage] = React.useState<Mortgage | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const handleAdd = () => {
        addForm.resetFields();
        setIsAddModalOpen(true);
    };

    const handleEdit = (mortgage: Mortgage) => {
        setEditingMortgage(mortgage);
        editForm.setFieldsValue({ name: mortgage.name, meta: mortgage.meta });
        setIsEditModalOpen(true);
    };

    const handleAddOk = () => {
        addForm.validateFields().then((values) => {
            if (addMortgage(values)) {
                setIsAddModalOpen(false);
                addForm.resetFields();
            }
        });
    };

    const handleEditOk = () => {
        editForm.validateFields().then((values) => {
            if (editingMortgage && updateMortgage(editingMortgage.id!, values)) {
                setIsEditModalOpen(false);
                editForm.resetFields();
                setEditingMortgage(null);
            }
        });
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this mortgage?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okButtonProps: { danger: true, style: { borderRadius: '6px' } },
            cancelText: 'Cancel',
            onOk: () => deleteMortgage(id),
        });
    };

    return (
        <>
            <Card
                title={
                    <Space>
                        <span style={{ fontSize: '20px' }}>🏦</span>
                        <Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>Mortgage & Loans</Title>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
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
                        Add Mortgage
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
                ) : mortgageData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#595959' }}>
                        <Text style={{ fontSize: '16px' }}>No mortgages or loans found. Add one to get started!</Text>
                        <div style={{ marginTop: '16px' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                style={{
                                    background: 'linear-gradient(135deg, #1890ff, #40c4ff)',
                                    border: 'none',
                                    borderRadius: '6px',
                                }}
                            >
                                Add Your First Mortgage
                            </Button>
                        </div>
                    </div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={mortgageData}
                        renderItem={(item) => (
                            <MortgageItem mortgage={item} onEdit={handleEdit} onDelete={handleDelete} />
                        )}
                        style={{ padding: '0 16px' }}
                    />
                )}
            </Card>

            {isAddModalOpen && (
                <MortgageForm
                    form={addForm}
                    onOk={handleAddOk}
                    onCancel={() => setIsAddModalOpen(false)}
                    title="Add Mortgage"
                    okText="Add"
                />
            )}

            {isEditModalOpen && editingMortgage && (
                <MortgageForm
                    form={editForm}
                    onOk={handleEditOk}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        editForm.resetFields();
                        setEditingMortgage(null);
                    }}
                    title="Edit Mortgage"
                    okText="Save"
                    initialValues={editingMortgage}
                />
            )}
        </>
    );
};

export default MortgageLoans;