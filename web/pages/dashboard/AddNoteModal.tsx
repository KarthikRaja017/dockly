
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { addNote, getNoteCategories } from '../../services/family';

const { TextArea } = Input;

interface AddNoteModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
}

interface ApiCategory {
    id: number;
    title: string;
    icon: string;
    pinned: boolean;
}

const hubOptions = [
    { label: "🌟 All Hubs", value: "ALL" },
    { label: "👥 Family", value: "FAMILY" },
    { label: "💰 Finance", value: "FINANCE" },
    { label: "📅 Planner", value: "PLANNER" },
    { label: "❤ Health", value: "HEALTH" },
    { label: "🏠 Home", value: "HOME" },
];

const defaultCategories: ApiCategory[] = [
    { id: 1, title: "Important Notes", icon: "📌", pinned: true },
    { id: 3, title: "House Rules & Routines", icon: "🏠", pinned: false },
    { id: 4, title: "Shopping Lists", icon: "🛒", pinned: false },
    { id: 5, title: "Birthday & Gift Ideas", icon: "🎁", pinned: false },
    { id: 6, title: "Meal Ideas & Recipes", icon: "🍽", pinned: false },
];


const getHubDisplayName = (hub: string): string => {
    const hubNames: Record<string, string> = {
        ALL: "All Hubs",
        FAMILY: "Family",
        FINANCE: "Finance",
        PLANNER: "Planner",
        HEALTH: "Health",
        HOME: "Home",
    };
    return hubNames[hub] || hub;
};

const AddNoteModal: React.FC<AddNoteModalProps> = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<ApiCategory[]>([]);

    useEffect(() => {
        if (visible) {
            fetchCategories();
            form.setFieldsValue({ hub: "FAMILY" }); // Set default hub
        }
    }, [visible, form]);

    const fetchCategories = async () => {
        try {
            const response = await getNoteCategories();
            if (response?.data?.status === 1) {
                const apiCategories = response.data.payload || [];

                // Merge API categories with default categories
                const mergedCategories = [...apiCategories];

                // Add default categories if they don't exist
                defaultCategories.forEach((defCat) => {
                    const exists = mergedCategories.some((c) => c.id === defCat.id);
                    if (!exists) {
                        mergedCategories.push(defCat);
                    }
                });

                setCategories(mergedCategories);
            } else {
                // Fallback to default categories
                setCategories(defaultCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to default categories
            setCategories(defaultCategories);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (values.description.length > 200) {
                message.error("Description must be 200 characters or less");
                return;
            }

            setLoading(true);
            const user_id = localStorage.getItem("userId") || "";

            // Handle "ALL" hubs option
            if (values.hub === "ALL") {
                const allHubs = ["FAMILY", "FINANCE", "PLANNER", "HEALTH", "HOME"];
                const addNotePromises = allHubs.map(hub =>
                    addNote({
                        title: values.title,
                        description: values.description,
                        category_id: values.category_id,
                        user_id,
                        hub: hub,
                    })
                );

                try {
                    const responses = await Promise.all(addNotePromises);
                    const successCount = responses.filter(res => res.data.status === 1).length;
                    const failureCount = allHubs.length - successCount;

                    if (successCount === allHubs.length) {
                        message.success(`Note added to all ${allHubs.length} hubs successfully! 🌟`);
                    } else if (successCount > 0) {
                        message.warning(`Note added to ${successCount} hubs, but failed for ${failureCount} hubs. Please check and try again.`);
                    } else {
                        message.error("Failed to add note to any hub");
                        return;
                    }

                    handleClose();
                    onSuccess?.();

                } catch (err) {
                    console.error("Error adding note to all hubs:", err);
                    message.error("Failed to add note to all hubs");
                }
            } else {
                // Handle single hub
                const res = await addNote({
                    title: values.title,
                    description: values.description,
                    category_id: values.category_id,
                    user_id,
                    hub: values.hub,
                });

                if (res.data.status === 1) {
                    message.success(`Note added to ${getHubDisplayName(values.hub)} successfully`);
                    handleClose();
                    onSuccess?.();
                } else {
                    message.error("Failed to add note");
                }
            }
        } catch (err) {
            console.error("Error adding note:", err);
            message.error("Failed to add note");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Add New Note</span>
                </div>
            }
            open={visible}
            onCancel={handleClose}
            onOk={handleSubmit}
            centered
            width={600}
            okText="Add Note"
            confirmLoading={loading}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Title"
                    rules={[
                        { required: true, message: "Please enter a title" },
                        { max: 100, message: "Title must be 100 characters or less" },
                    ]}
                >
                    <Input placeholder="Enter note title" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                        { required: true, message: "Please enter a description" },
                        {
                            max: 200,
                            message: "Description must be 200 characters or less",
                        },
                    ]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter note description"
                        showCount
                        maxLength={200}
                    />
                </Form.Item>

                <Form.Item
                    name="category_id"
                    label="Category"
                    rules={[{ required: true, message: "Please select a category" }]}
                >
                    <Select
                        placeholder="Select a category for your note"
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {categories.map((category) => (
                            <Select.Option key={category.id} value={category.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>{category.icon}</span>
                                    <span>{category.title}</span>
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="hub"
                    label={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>Hub</span>
                            <span
                                style={{
                                    //   backgroundColor: "#722ed1",
                                    color: "white",
                                    padding: "2px 6px",
                                    borderRadius: 8,
                                    fontSize: 10,
                                    fontWeight: "bold"
                                }}
                            >
                                {/* Choose 'All Hubs' to save across all hubs! 🌟 */}
                            </span>
                        </div>
                    }
                    rules={[{ required: true, message: "Please select a hub" }]}
                >
                    <Select
                        placeholder="Select which hub this note belongs to"
                        options={hubOptions}
                        size="large"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddNoteModal;

