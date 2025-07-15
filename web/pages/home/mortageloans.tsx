'use client';
import React from 'react';
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message, Avatar, Skeleton, Menu } from 'antd';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { getLoansAndMortgages, addMortgage, updateMortgage, deleteMortgage } from '../../services/home';
import Dropdown from 'antd/es/dropdown/dropdown';

const { Text, Title } = Typography;

// Mortgage types and icons
const MORTGAGE_TYPES = [
    { type: 'Home Mortgage', icon: '🏠' },
    { type: 'Auto Loan', icon: '🚗' },
    { type: 'Personal Loan', icon: '💸' },
    { type: 'Student Loan', icon: '🎓' },
    { type: 'Vivo', icon: '🏦' },
];

// Interface for Mortgage data
interface Mortgage {
    id?: string;
    name: string;
    meta: string;
    amount: number;
    interestRate: number;
    term: number;
    createdAt?: string;
    userId?: string;
    monthlyPayment?: number;
    remainingBalance?: number;
    refinanceDate?: string;
    loanOfficer?: string;
}

// Custom hook for mortgage logic
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
                amount: loan.amount || 0,
                interestRate: loan.interestRate || 0,
                term: loan.term || 0,
                monthlyPayment: loan.monthlyPayment || 0,
                remainingBalance: loan.remainingBalance || 0,
                userId: loan.userId || uid,
                refinanceDate: loan.refinanceDate || null,
                loanOfficer: loan.loanOfficer || null,
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

    const addMortgageLocal = async (values: { name: string; meta: string; amount: number; interestRate: number; term: number; monthlyPayment: number; remainingBalance: number; refinanceDate?: string; loanOfficer?: string }) => {
        if (mortgageData.some((m) => m.name.toLowerCase() === values.name.toLowerCase() && m.meta === values.meta)) {
            message.error('Duplicate mortgage name or meta!');
            return false;
        }
        try {
            const response = await addMortgage({ ...values, uid, createdAt: new Date().toISOString() });
            if (response.status === 1) {
                setMortgageData([...mortgageData, ...response.payload.loans]);
                message.success('Mortgage added successfully!');
                return true;
            } else {
                message.error(response.message);
                return false;
            }
        } catch (error) {
            message.error('Failed to add mortgage');
            console.error('Error adding mortgage:', error);
            return false;
        }
    };

    const updateMortgageLocal = async (id: string, values: { name: string; meta: string; amount: number; interestRate: number; term: number; monthlyPayment: number; remainingBalance: number; refinanceDate?: string; loanOfficer?: string }) => {
        if (mortgageData.some((m) => m.id !== id && m.name.toLowerCase() === values.name.toLowerCase() && m.meta === values.meta)) {
            message.error('Duplicate mortgage name or meta!');
            return false;
        }
        try {
            const response = await updateMortgage(id, { ...values, uid, createdAt: new Date().toISOString() });
            if (response.status === 1) {
                setMortgageData(mortgageData.map((m) => (m.id === id ? response.payload.loans[0] : m)));
                message.success('Mortgage updated successfully!');
                return true;
            } else {
                message.error(response.message);
                return false;
            }
        } catch (error) {
            message.error('Failed to update mortgage');
            console.error('Error updating mortgage:', error);
            return false;
        }
    };

    const deleteMortgageLocal = async (id: string) => {
        try {
            const response = await deleteMortgage(id);
            if (response.status === 1) {
                setMortgageData(mortgageData.filter((m) => m.id !== id));
                message.success('Mortgage deleted successfully!');
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Failed to delete mortgage');
            console.error('Error deleting mortgage:', error);
        }
    };

    return { mortgageData, loading, addMortgage: addMortgageLocal, updateMortgage: updateMortgageLocal, deleteMortgage: deleteMortgageLocal, fetchLoansAndMortgages };
};

// Mortgage Item Component
interface MortgageItemProps {
    mortgage: Mortgage;
    onEdit: (mortgage: Mortgage) => void;
    onDelete: (id: string) => void;
}

const MortgageItem: React.FC<MortgageItemProps> = ({ mortgage, onEdit, onDelete }) => {
    const mortgageType = MORTGAGE_TYPES.find((mt) => mt.type === mortgage.name) || { icon: '🏦' };

    const menu = (
        <Menu>
            <Menu.Item key="edit" onClick={() => onEdit(mortgage)}>
                Edit
            </Menu.Item>
            <Menu.Item key="delete" onClick={() => onDelete(mortgage.id!)}>
                Delete
            </Menu.Item>
        </Menu>
    );

    return (
        <List.Item
            style={{
                borderBottom: '1px solid #f0f0f0',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff',
                borderRadius: '8px',
                marginBottom: '8px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar style={{ background: 'linear-gradient(135deg, #1890ff, #40c4ff)', fontSize: '18px', marginRight: '16px' }}>{mortgageType.icon}</Avatar>
                <div>
                    <Text style={{ fontWeight: 600, fontSize: '16px', color: '#1f1f1f' }}>{mortgage.name}</Text>
                    <Space direction="vertical" style={{ marginLeft: '12px', fontSize: '14px', color: '#595959' }}>
                        <Text> {mortgage.name} • ${mortgage.amount.toLocaleString()}</Text>
                    </Space>
                </div>
            </div>
            <Dropdown overlay={menu} trigger={['click']}>
                <Button
                    size="small"
                    style={{
                        color: '#595959',
                        borderColor: '#d9d9d9',
                        background: 'transparent',
                        borderRadius: '6px',
                        padding: '0 12px',
                        transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                    <MoreOutlined />
                </Button>
            </Dropdown>
        </List.Item>
    );
};

// Mortgage Details Component
interface MortgageDetailsProps {
    mortgage: Mortgage;
}

const MortgageDetails: React.FC<MortgageDetailsProps> = ({ mortgage }) => (
    <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px', marginBottom: '16px' }}>
        <Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>Loan Details</Text>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <Text style={{ color: '#595959' }}> {mortgage.name}</Text>
            <Text style={{ color: '#595959' }}>
                {mortgage.term}-year fixed at {mortgage.interestRate}%, {mortgage.remainingBalance?.toLocaleString()}
            </Text>
        </div>
        {mortgage.name === 'Home Mortgage' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <Text style={{ color: '#595959' }}>HELOC</Text>
                <Text style={{ color: '#595959' }}>
                    ${mortgage.amount.toLocaleString()} line, ${mortgage.remainingBalance?.toLocaleString() || 'N/A'} drawn, variable rate {mortgage.interestRate}%
                </Text>
            </div>
        )}
        {/* {mortgage.refinanceDate && mortgage.loanOfficer && (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
        <Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>Refinance Notes</Text>
        <Text style={{ color: '#595959' }}>
          Last refinanced {new Date(mortgage.refinanceDate).toLocaleDateString()}, Loan Officer: {mortgage.loanOfficer}
        </Text>
      </div>
    )} */}
    </div>
);

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
        width={600}
        bodyStyle={{ background: '#fafafa', borderRadius: '8px', padding: '24px' }}
        okButtonProps={{
            style: { background: 'linear-gradient(135deg, #1890ff, #40c4ff)', border: 'none', borderRadius: '6px' },
        }}
        cancelButtonProps={{ style: { borderRadius: '6px' } }}
    >
        <Form form={form} layout="vertical">
            <Form.Item
                name="name"
                label="Mortgage Name"
                rules={[{ required: true, message: 'Please enter mortgage name!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter mortgage name (e.g., Vivo)"
                />
            </Form.Item>
            <Form.Item
                name="meta"
                label="Mortgage Details"
                rules={[{ required: true, message: 'Please enter mortgage details!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter details (e.g., 8897753545)"
                />
            </Form.Item>
            <Form.Item
                name="amount"
                label="Loan Amount"
                rules={[{ required: true, message: 'Please enter loan amount!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter loan amount (e.g., 1234)"
                    type="number"
                    min={0}
                />
            </Form.Item>
            <Form.Item
                name="interestRate"
                label="Interest Rate (%)"
                rules={[{ required: true, message: 'Please enter interest rate!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter interest rate (e.g., 2)"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                />
            </Form.Item>
            <Form.Item
                name="term"
                label="Loan Term (Years)"
                rules={[{ required: true, message: 'Please enter loan term!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter loan term in years (e.g., 12)"
                    type="number"
                    min={1}
                    step={1}
                />
            </Form.Item>
            <Form.Item
                name="monthlyPayment"
                label="Monthly Payment"
                rules={[{ required: true, message: 'Please enter monthly payment!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter monthly payment (e.g., 1450)"
                    type="number"
                    min={0}
                />
            </Form.Item>
            <Form.Item
                name="remainingBalance"
                label="Remaining Balance"
                rules={[{ required: true, message: 'Please enter remaining balance!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter remaining balance (e.g., 245000)"
                    type="number"
                    min={0}
                />
            </Form.Item>
            <Form.Item
                name="refinanceDate"
                label="Refinance Date"
                rules={[{ required: false, message: 'Please enter refinance date!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter refinance date (e.g., 2023-05-15)"
                />
            </Form.Item>
            <Form.Item
                name="loanOfficer"
                label="Loan Officer"
                rules={[{ required: false, message: 'Please enter loan officer!' }]}
            >
                <AntInput
                    style={{ padding: '8px', borderRadius: '6px', fontSize: '14px' }}
                    placeholder="Enter loan officer name"
                />
            </Form.Item>
        </Form>
    </Modal>
);

// Main Component
interface MortgageLoansProps {
    uid: string;
}

const MortgageLoans: React.FC<MortgageLoansProps> = ({ uid }) => {
    const { mortgageData, loading, addMortgage, updateMortgage, deleteMortgage } = useMortgageLoans(uid);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false);
    const [isViewMoreModalOpen, setIsViewMoreModalOpen] = React.useState<boolean>(false);
    const [editingMortgage, setEditingMortgage] = React.useState<Mortgage | null>(null);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const handleAdd = () => {
        addForm.resetFields();
        setIsAddModalOpen(true);
    };

    const handleEdit = (mortgage: Mortgage) => {
        setEditingMortgage(mortgage);
        editForm.setFieldsValue({
            name: mortgage.name,
            meta: mortgage.meta,
            amount: mortgage.amount,
            interestRate: mortgage.interestRate,
            term: mortgage.term,
            monthlyPayment: mortgage.monthlyPayment,
            remainingBalance: mortgage.remainingBalance,
            refinanceDate: mortgage.refinanceDate,
            loanOfficer: mortgage.loanOfficer,
        });
        setIsEditModalOpen(true);
    };

    const handleAddOk = () => {
        addForm.validateFields().then(async (values) => {
            const success = await addMortgage({ ...values, userId: uid });
            if (success) {
                setIsAddModalOpen(false);
                addForm.resetFields();
            }
        });
    };

    const handleEditOk = () => {
        editForm.validateFields().then(async (values) => {
            if (editingMortgage) {
                const success = await updateMortgage(editingMortgage.id!, { ...values, userId: uid });
                if (success) {
                    setIsEditModalOpen(false);
                    editForm.resetFields();
                    setEditingMortgage(null);
                }
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

    const handleViewMore = () => {
        setIsViewMoreModalOpen(true);
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
                            background: '#2563eb',
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
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #d9d9d9',
                    width: '100%',
                    background: '#ffffff',
                    height: '316px',
                    overflow: 'hidden',
                }}
                headStyle={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    background: '#ffffff',
                    borderBottom: '1px solid #f0f0f0',
                }}
                bodyStyle={{
                    padding: '0',
                    overflowY: 'auto',
                }}
            >
                {loading ? (
                    <Skeleton active paragraph={{ rows: 1 }} style={{ padding: '24px' }} />
                ) : mortgageData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: '#595959' }}>
                        <Text style={{ fontSize: '16px' }}>No mortgages or loans found. Add one to get started!</Text>
                        <div style={{ marginTop: '16px' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                style={{
                                    border: 'none',
                                    borderRadius: '6px',
                                }}
                            >
                                Add Your First Mortgage
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {mortgageData.slice(0, 1).map((mortgage) => (
                            <div key={mortgage.id}>
                                <MortgageItem mortgage={mortgage} onEdit={handleEdit} onDelete={handleDelete} />
                                <MortgageDetails mortgage={mortgage} />
                            </div>
                        ))}
                    </div>
                )}
                {mortgageData.length > 1 && (
                    <div style={{ textAlign: 'center', padding: '16px', borderTop: '1px solid #f0f0f0' }}>
                        <Button
                            type="primary"
                            onClick={handleViewMore}
                            style={{
                                border: 'none',
                                borderRadius: '6px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 500,
                            }}
                        >
                            View All
                        </Button>
                    </div>
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

            {isViewMoreModalOpen && (
                <Modal
                    title={<Title level={4} style={{ margin: 0, color: '#1f1f1f' }}>All Mortgages</Title>}
                    open={true}
                    onCancel={() => setIsViewMoreModalOpen(false)}
                    footer={null}
                    width={700}
                    style={{ padding: '24px' }}
                    bodyStyle={{ background: '#fafafa', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto', padding: '24px' }}
                >
                    <List
                        itemLayout="horizontal"
                        dataSource={mortgageData}
                        renderItem={(item) => (
                            <div>
                                <MortgageItem mortgage={item} onEdit={handleEdit} onDelete={handleDelete} />
                                <MortgageDetails mortgage={item} />
                            </div>
                        )}
                        style={{ padding: '0 16px' }}
                    />
                </Modal>
            )}
        </>
    );
};

export default MortgageLoans;