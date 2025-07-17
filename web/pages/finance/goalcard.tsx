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

const GoalsCard = ({ uid }: { uid: string }) => {
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
        } catch (error) {
            message.error("Failed to fetch finance goals");
        }
    };

    useEffect(() => {
        getGoals();
    }, [uid]);

    const statusMap: Record<
        number,
        { text: string; bgColor: string; textColor: string }
    > = {
        0: { text: "Pending", bgColor: "#FFF4E5", textColor: "#D48806" },
        1: { text: "Active", bgColor: "#E6F7FF", textColor: "#1890FF" },
        2: { text: "Cancelled", bgColor: "#FFF1F0", textColor: "#CF1322" },
        3: { text: "Completed", bgColor: "#F6FFED", textColor: "#389E0D" },
    };

    const renderGoalCard = (goal: FinanceGoal) => {
        const { text, bgColor, textColor } = statusMap[goal.goal_status] || statusMap[0];

        return (
            <div
                key={goal.id}
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "1rem",
                    // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        {/* <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditClick(goal)}
              style={{ color: "#1890FF", fontSize: "0.9rem", padding: "0 8px 0 0" }}
            /> */}
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: "1rem",
                                color: "#1f2a44",
                            }}
                        >
                            {goal.name}
                            <br />
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: 6,
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    fontWeight: 500,
                                }}
                            >
                                {text}
                            </span>
                            {/* <br /> */}
                        </span>
                        {/* <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditClick(goal)}
              style={{ color: "#1890FF", fontSize: "0.9rem", padding: "0 8px 0 0" }}
            /> */}
                    </div>
                    {/* <span
            style={{
              fontSize: "0.75rem",
              padding: "0.25rem 0.5rem",
              borderRadius: 6,
              backgroundColor: bgColor,
              color: textColor,
              fontWeight: 500,
            }}
          >
            {text}
          </span> */}
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditClick(goal)}
                        style={{ color: "#1890FF", fontSize: "0.9rem", padding: "0 8px 0 0" }}
                    />
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        color: "#555",
                        fontWeight: 500,
                        marginBottom: "0.5rem",
                    }}
                >
                    <span>Saved: ${goal.saved_amount.toLocaleString()}</span>
                    <span>Target: ${goal.target_amount.toLocaleString()}</span>
                </div>
                {goal.deadline && (
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#888",
                            marginTop: "0.25rem",
                        }}
                    >
                        Deadline: {dayjs(goal.deadline).format("MMM YYYY")}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            style={{
                background: "linear-gradient(145deg, #ffffff, #f9fafb)",
                borderRadius: 16,
                padding: "1.5rem",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                maxWidth: "100%",
                width: "min(400px, 90vw)",
                // minHeight: financeGoals.length === 2 ? "200px" : "716px",
                maxHeight: "208vh",
                overflow: "hidden",
                transition: "all 0.3s ease",
                margin: "20px",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1f2a44",
                    position: "sticky",
                    top: 0,
                    background: "linear-gradient(145deg, #ffffff, #f9fafb)",
                    zIndex: 10,
                    padding: "0.5rem 0",
                }}
            >
                <span>Financial Goals</span>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<PlusOutlined />}
                    onClick={openModal}
                    style={{
                        background: "#1890FF",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
                        transition: "transform 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "grid",
                    gap: "1rem",
                    gridTemplateColumns: "1fr",
                }}
            >
                {financeGoals.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            color: "#888",
                            fontSize: "0.9rem",
                            padding: "1rem",
                        }}
                    >
                        No goals yet. Add one to get started!
                    </div>
                ) : (
                    financeGoals.slice(0, 3).map((goal) => renderGoalCard(goal))
                )}
            </div>

            {financeGoals.length > 3 && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "1rem 0",
                        position: "sticky",
                        bottom: 0,
                        background: "linear-gradient(145deg, #ffffff, #f9fafb)",
                    }}
                >
                    <Button type="link" onClick={openViewMoreModal}>
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
                bodyStyle={{ padding: "1.5rem" }}
            >
                <Form form={goalForm} layout="vertical" style={{ fontSize: "0.9rem" }}>
                    <Form.Item
                        name="name"
                        label="Goal Name"
                        rules={[{ required: true, message: "Please enter goal name" }]}
                    >
                        <Input placeholder="e.g., New Car Fund" />
                    </Form.Item>
                    <Form.Item
                        name="goal_status"
                        label="Goal Status"
                        initialValue={1}
                        rules={[{ required: true, message: "Please select a status" }]}
                    >
                        <Select placeholder="Select status">
                            <Option value={0}>Pending</Option>
                            <Option value={1}>Active</Option>
                            <Option value={2}>Cancelled</Option>
                            <Option value={3}>Completed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="target_amount"
                        label="Target Amount"
                        rules={[{ required: true, message: "Please enter target amount" }]}
                    >
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%" }}
                            min={0}
                            placeholder="e.g., 10000"
                        />
                    </Form.Item>
                    <Form.Item name="saved_amount" label="Saved Amount">
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%" }}
                            min={0}
                            placeholder="e.g., 5000"
                        />
                    </Form.Item>
                    <Form.Item name="deadline" label="Deadline (optional)">
                        <DatePicker
                            style={{ width: "100%" }}
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
                bodyStyle={{ padding: "1.5rem" }}
            >
                <Form form={editForm} layout="vertical" style={{ fontSize: "0.9rem" }}>
                    <Form.Item
                        name="name"
                        label="Goal Name"
                        rules={[{ required: true, message: "Please enter goal name" }]}
                    >
                        <Input placeholder="e.g., New Car Fund" />
                    </Form.Item>
                    <Form.Item
                        name="goal_status"
                        label="Goal Status"
                        rules={[{ required: true, message: "Please select a status" }]}
                    >
                        <Select placeholder="Select status">
                            <Option value={0}>Pending</Option>
                            <Option value={1}>Active</Option>
                            <Option value={2}>Cancelled</Option>
                            <Option value={3}>Completed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="target_amount"
                        label="Target Amount"
                        rules={[{ required: true, message: "Please enter target amount" }]}
                    >
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%" }}
                            min={0}
                            placeholder="e.g., 10000"
                        />
                    </Form.Item>
                    <Form.Item name="saved_amount" label="Saved Amount">
                        <InputNumber
                            prefix="$"
                            style={{ width: "100%" }}
                            min={0}
                            placeholder="e.g., 5000"
                        />
                    </Form.Item>
                    <Form.Item name="deadline" label="Deadline">
                        <DatePicker
                            style={{ width: "100%" }}
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
                bodyStyle={{ padding: "1.5rem", maxHeight: "60vh", overflowY: "auto" }}
            >
                <div
                    style={{
                        display: "grid",
                        gap: "1rem",
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