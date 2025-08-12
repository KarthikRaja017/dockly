
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
    { label: " Family", value: "FAMILY" },
    { label: " Finance", value: "FINANCE" },
    { label: " Planner", value: "PLANNER" },
    { label: " Health", value: "HEALTH" },
    { label: " Home", value: "HOME" },
    { label: " None (Utilities)", value: "NONE" },
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
        FAMILY: "Family",
        FINANCE: "Finance",
        PLANNER: "Planner",
        HEALTH: "Health",
        HOME: "Home",
        NONE: "Utilities",
    };
    return hubNames[hub] || hub;
};

const AddNoteModal: React.FC<AddNoteModalProps> = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [selectedHubs, setSelectedHubs] = useState<string[]>([]);

    useEffect(() => {
        if (visible) {
            fetchCategories();
            setSelectedHubs([]); // Reset selected hubs
        }
    }, [visible]);

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

            if (selectedHubs.length === 0) {
                message.error("Please select at least one hub or choose 'None' for utilities");
                return;
            }

            setLoading(true);
            const user_id = localStorage.getItem("userId") || "";

            try {
                const addNotePromises = selectedHubs.map(hub =>
                    addNote({
                        title: values.title,
                        description: values.description,
                        category_id: values.category_id,
                        user_id,
                        hub: hub,
                    })
                );

                const responses = await Promise.all(addNotePromises);
                const successCount = responses.filter(res => res.data.status === 1).length;
                const failureCount = selectedHubs.length - successCount;

                if (successCount === selectedHubs.length) {
                    const hubNames = selectedHubs.map(hub => getHubDisplayName(hub)).join(", ");
                    message.success(`Note added to ${hubNames} successfully! 📝`);
                } else if (successCount > 0) {
                    message.warning(`Note added to ${successCount} hubs, but failed for ${failureCount} hubs. Please check and try again.`);
                } else {
                    message.error("Failed to add note to any hub");
                    return;
                }

                handleClose();
                onSuccess?.();

            } catch (err) {
                console.error("Error adding note:", err);
                message.error("Failed to add note");
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
        setSelectedHubs([]);
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
                    label="Select Hubs"
                    rules={[
                        { required: true, message: "Please select at least one hub" },
                    ]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Choose hubs for this note"
                        value={selectedHubs}
                        onChange={setSelectedHubs}
                        options={hubOptions}
                        size="large"
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                    />
                    <div
                        style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 8,
                            fontFamily: "inherit",
                            padding: "8px 12px",
                            backgroundColor: "#f8fafc",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        💡 <strong>Multi-Hub Support:</strong> Select multiple hubs to add this note across all selected hubs simultaneously!
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddNoteModal;

