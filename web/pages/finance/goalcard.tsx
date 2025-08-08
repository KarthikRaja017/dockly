import React, { useEffect, useState } from "react";
import {
    Button,
    Form,
    Input,
    Modal,
    InputNumber,
    DatePicker,
    Select,
    message,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import {
    addFinanceGoal,
    getFinanceGoal,
    updateFinanceGoal,
} from "../../services/apiConfig";

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Option } = Select;

interface FinanceGoal {
    id: string;
    name: string;
    saved_amount: number;
    target_amount: number;
    goal_status: number;
    deadline?: string;
    is_active: number;
}

interface GoalsCardProps {
    uid: string;
    onGoalsUpdate?: (goals: FinanceGoal[]) => void;
}

const GoalsCard = ({ uid, onGoalsUpdate }: GoalsCardProps) => {
    const [financeGoals, setFinanceGoals] = useState<FinanceGoal[]>([]);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isViewMoreModalVisible, setIsViewMoreModalVisible] = useState(false);
    const [goalForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [editingGoal, setEditingGoal] = useState<FinanceGoal | null>(null);

    const openModal = () => setIsGoalModalVisible(true);
    const closeModal = () => {
        setIsGoalModalVisible(false);
        goalForm.resetFields();
    };
    const closeEditModal = () => {
        setEditingGoal(null);
        setIsEditModalVisible(false);
        editForm.resetFields();
    };
    const openViewMoreModal = () => setIsViewMoreModalVisible(true);
    const closeViewMoreModal = () => setIsViewMoreModalVisible(false);

    const handleAddFinanceGoal = async () => {
        try {
            const values = await goalForm.validateFields();
            const payload = {
                uid,
                name: values.name,
                goal_status: Number(values.goal_status),
                target_amount: Number(values.target_amount),
                saved_amount: Number(values.saved_amount || 0),
                deadline: values.deadline
                    ? values.deadline.format("YYYY-MM-DD")
                    : undefined,
                is_active: 1,
            };

            const response = await addFinanceGoal(payload);
            if (response.data?.status === 1) {
                message.success("Goal added successfully");
                closeModal();
                await getGoals();
            } else {
                message.error("Failed to add goal. Please try again.");
            }
        } catch (err) {
            console.error("Add goal error:", err);
            message.error("Validation failed or server error.");
        }
    };

    const handleEditClick = (goal: FinanceGoal) => {
        setEditingGoal(goal);
        setIsEditModalVisible(true);
        editForm.setFieldsValue({
            ...goal,
            deadline: goal.deadline ? dayjs(goal.deadline) : null,
        });
    };

    const handleUpdateFinanceGoal = async () => {
        try {
            const values = await editForm.validateFields();
            const payload = {
                id: editingGoal?.id,
                uid,
                name: values.name,
                goal_status: Number(values.goal_status),
                target_amount: Number(values.target_amount),
                saved_amount: Number(values.saved_amount || 0),
                deadline: values.deadline
                    ? values.deadline.format("YYYY-MM-DD")
                    : undefined,
            };

            const response = await updateFinanceGoal(payload);
            if (response.data?.status === 1) {
                message.success("Goal updated successfully");
                closeEditModal();
                await getGoals();
            } else {
                message.error(response.data?.message || "Failed to update goal.");
            }
        } catch (err) {
            console.error("Update error:", err);
            message.error("Error updating goal.");
        }
    };

    const getGoals = async () => {
        try {
            const response = await getFinanceGoal({ uid });
            const rawGoals = response.data.payload;

            const formattedGoals = rawGoals.map((item: any) => ({
                id: item.id,
                name: item.name,
                saved_amount: item.saved_amount,
                target_amount: item.target_amount,
                goal_status: item.goal_status,
                deadline: item.deadline
                    ? dayjs(item.deadline).format("YYYY-MM-DD")
                    : undefined,
                is_active: item.is_active,
            }));

            setFinanceGoals(formattedGoals);
            onGoalsUpdate?.(formattedGoals);
        } catch (error) {
            message.error("Failed to fetch finance goals");
            onGoalsUpdate?.([]);
        }
    };

    useEffect(() => {
        getGoals();
    }, [uid]);

    const statusMap: Record<
        number,
        { text: string; bgColor: string; textColor: string }
    > = {
        0: { text: "Pending", bgColor: "#fef3c7", textColor: "#d97706" },
        1: { text: "Active", bgColor: "#dbeafe", textColor: "#2563eb" },
        2: { text: "Cancelled", bgColor: "#fecaca", textColor: "#dc2626" },
        3: { text: "Completed", bgColor: "#d1fae5", textColor: "#059669" },
    };

    const renderGoalCard = (goal: FinanceGoal) => {
        const { text, bgColor, textColor } = statusMap[goal.goal_status] || statusMap[0];
        const progress = (goal.saved_amount / goal.target_amount) * 100;

        return (
            <div
                key={goal.id}
                style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: "14px",
                                color: "#111827",
                                fontFamily: FONT_FAMILY,
                                lineHeight: 1.3,
                            }}
                        >
                            {goal.name}
                            <br />
                            <span
                                style={{
                                    fontSize: "11px",
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    fontWeight: 500,
                                    marginTop: "4px",
                                    display: "inline-block",
                                }}
                            >
                                {text}
                            </span>
                        </span>
                    </div>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditClick(goal)}
                        style={{
                            color: "#6b7280",
                            fontSize: "12px",
                            padding: "0 4px",
                            minWidth: 'auto',
                            fontFamily: FONT_FAMILY
                        }}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: 500,
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                    }}
                >
                    <span>Saved: ${goal.saved_amount.toLocaleString()}</span>
                    <span>Target: ${goal.target_amount.toLocaleString()}</span>
                </div>
                {/* Progress Bar */}
                <div
                    style={{
                        width: '100%',
                        height: 4,
                        background: '#f3f4f6',
                        borderRadius: 2,
                        marginBottom: 6,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            width: `${Math.min(progress, 100)}%`,
                            height: '100%',
                            background: progress >= 100 ? '#10b981' : '#3b82f6',
                            borderRadius: 2,
                            transition: 'width 0.3s ease',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: '#9ca3af', fontFamily: FONT_FAMILY }}>
                        {progress.toFixed(1)}% complete
                    </span>
                    {goal.deadline && (
                        <span
                            style={{
                                fontSize: "10px",
                                color: "#9ca3af",
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            {dayjs(goal.deadline).format("MMM YYYY")}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const EmptyGoalsTemplate = () => (
        <div
            style={{
                background: "linear-gradient(145deg, #f0f9ff, #e0f2fe)",
                borderRadius: 12,
                padding: "20px",
                textAlign: "center",
                border: "1px solid #bae6fd",
                cursor: "pointer",
            }}
            onClick={openModal}
        >
            {/* <Target size={32} style={{ color: "#3b82f6", marginBottom: 8 }} /> */}
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 4, fontFamily: FONT_FAMILY }}>
                Set Your First Goal
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, fontFamily: FONT_FAMILY }}>
                Start saving for what matters most
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#2563eb' }}>
                    🏠 House
                </span>
                <span style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#16a34a' }}>
                    🚗 Car
                </span>
                <span style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#d97706' }}>
                    ✈️ Vacation
                </span>
            </div>
        </div>
    );

    return (
        <div
            style={{
                background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                borderRadius: 12,
                padding: "16px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                maxWidth: "100%",
                width: "min(380px, 90vw)",
                maxHeight: financeGoals.length === 0 ? "auto" : "195vh",
                overflow: "hidden",
                transition: "all 0.3s ease",
                margin: "12px",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #e2e8f0",
                fontFamily: FONT_FAMILY,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#111827",
                    position: "sticky",
                    top: 0,
                    background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                    zIndex: 10,
                    padding: "8px 0",
                    fontFamily: FONT_FAMILY,
                }}
            >
                <span>Financial Goals</span>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined style={{ fontSize: '12px' }} />}
                    onClick={openModal}
                    size="small"
                    style={{
                        background: "#2563eb",
                        border: "none",
                        boxShadow: "0 1px 2px rgba(37, 99, 235, 0.3)",
                        transition: "transform 0.2s ease",
                        width: '28px',
                        height: '28px',
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "grid",
                    gap: "10px",
                    gridTemplateColumns: "1fr",
                }}
            >
                {financeGoals.length === 0 ? (
                    <div style={{ height: "200px" }}>
                        <EmptyGoalsTemplate />
                    </div>
                ) : (
                    financeGoals.slice(0, 3).map((goal) => renderGoalCard(goal))
                )}
            </div>

            {financeGoals.length > 3 && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "12px 0",
                        position: "sticky",
                        bottom: 0,
                        background: "linear-gradient(145deg, #ffffff, #f8fafc)",
                    }}
                >
                    <Button
                        type="link"
                        onClick={openViewMoreModal}
                        style={{ fontFamily: FONT_FAMILY, fontSize: '13px', padding: 0 }}
                    >
                        View More
                    </Button>
                </div>
            )}

            {/* Add Goal Modal */}
            <Modal
                title="Add Financial Goal"
                open={isGoalModalVisible}
                onCancel={closeModal}
                onOk={handleAddFinanceGoal}
                okText="Add Goal"
                width="min(90vw, 400px)"
                style={{ top: 20 }}
                bodyStyle={{ padding: "20px", fontFamily: FONT_FAMILY }}
            >
                <Form form={goalForm} layout="vertical" style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}>
                    <Form.Item
                        name="name"
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Goal Name</span>}
                        rules={[{ required: true, message: "Please enter goal name" }]}
                    >
                        <Input placeholder="e.g., New Car Fund" style={{ fontFamily: FONT_FAMILY }} />
                    </Form.Item>
                    <Form.Item
                        name="goal_status"
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Goal Status</span>}
                        initialValue={1}
                        rules={[{ required: true, message: "Please select a status" }]}
                    >
                        <Select placeholder="Select status" style={{ fontFamily: FONT_FAMILY }}>
                            <Option value={0}>Pending</Option>
                            <Option value={1}>Active</Option>
                            <Option value={2}>Cancelled</Option>
                            <Option value={3}>Completed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="target_amount"
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Target Amount</span>}
                        rules={[{ required: true, message: "Please enter target amount" }]}
                    >
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%", fontFamily: FONT_FAMILY }}
                            min={0}
                            placeholder="e.g., 10000"
                        />
                    </Form.Item>
                    <Form.Item name="saved_amount" label={<span style={{ fontFamily: FONT_FAMILY }}>Saved Amount</span>}>
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%", fontFamily: FONT_FAMILY }}
                            min={0}
                            placeholder="e.g., 5000"
                        />
                    </Form.Item>
                    <Form.Item name="deadline" label={<span style={{ fontFamily: FONT_FAMILY }}>Deadline (optional)</span>}>
                        <DatePicker
                            style={{ width: "100%", fontFamily: FONT_FAMILY }}
                            placeholder="Select deadline"
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Goal Modal */}
            <Modal
                title="Edit Financial Goal"
                open={isEditModalVisible}
                onCancel={closeEditModal}
                onOk={handleUpdateFinanceGoal}
                okText="Update Goal"
                width="min(90vw, 400px)"
                style={{ top: 20 }}
                bodyStyle={{ padding: "20px", fontFamily: FONT_FAMILY }}
            >
                <Form form={editForm} layout="vertical" style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}>
                    <Form.Item
                        name="name"
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Goal Name</span>}
                        rules={[{ required: true, message: "Please enter goal name" }]}
                    >
                        <Input placeholder="e.g., New Car Fund" style={{ fontFamily: FONT_FAMILY }} />
                    </Form.Item>
                    <Form.Item
                        name="goal_status"
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Goal Status</span>}
                        rules={[{ required: true, message: "Please select a status" }]}
                    >
                        <Select placeholder="Select status" style={{ fontFamily: FONT_FAMILY }}>
                            <Option value={0}>Pending</Option>
                            <Option value={1}>Active</Option>
                            <Option value={2}>Cancelled</Option>
                            <Option value={3}>Completed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="target_amount"
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Target Amount</span>}
                        rules={[{ required: true, message: "Please enter target amount" }]}
                    >
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%", fontFamily: FONT_FAMILY }}
                            min={0}
                            placeholder="e.g., 10000"
                        />
                    </Form.Item>
                    <Form.Item name="saved_amount" label={<span style={{ fontFamily: FONT_FAMILY }}>Saved Amount</span>}>
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%", fontFamily: FONT_FAMILY }}
                            min={0}
                            placeholder="e.g., 5000"
                        />
                    </Form.Item>
                    <Form.Item name="deadline" label={<span style={{ fontFamily: FONT_FAMILY }}>Deadline</span>}>
                        <DatePicker
                            style={{ width: "100%", fontFamily: FONT_FAMILY }}
                            placeholder="Select deadline"
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* View More Modal */}
            <Modal
                title="All Financial Goals"
                open={isViewMoreModalVisible}
                onCancel={closeViewMoreModal}
                footer={null}
                width="min(90vw, 600px)"
                style={{ top: 20 }}
                bodyStyle={{ padding: "20px", maxHeight: "60vh", overflowY: "auto", fontFamily: FONT_FAMILY }}
            >
                <div
                    style={{
                        display: "grid",
                        gap: "12px",
                        gridTemplateColumns: "1fr",
                    }}
                >
                    {financeGoals.map((goal) => renderGoalCard(goal))}
                </div>
            </Modal>
        </div>
    );
};

export default GoalsCard;