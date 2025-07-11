
import React, { useState } from "react";
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

interface Note {
    content: string;
    date: string;
}

const Notes: React.FC = () => {
    const [notesData, setNotesData] = useState<Note[]>([
        {
            content: "Need to call contractor about basement finishing quote next week.",
            date: "Apr 16, 2023",
        },
    ]);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
    const [noteForm] = Form.useForm();

    const showNoteModal = () => setIsNoteModalOpen(true);

    const handleNoteOk = () => {
        noteForm.validateFields().then((values) => {
            const newNote: Note = {
                content: values.content,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            };
            setNotesData([...notesData, newNote]);
            noteForm.resetFields();
            setIsNoteModalOpen(false);
            message.success("Note added successfully!");
        });
    };

    const handleNoteCancel = () => {
        setIsNoteModalOpen(false);
        noteForm.resetFields();
    };

    const handleDelete = () => {
        Modal.confirm({
            title: "Are you sure you want to delete the Notes section?",
            onOk: () => {
                setNotesData([]);
                message.success("Notes section deleted successfully!");
            },
        });
    };

    return (
        <>
            <Card
                title={
                    <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <span>
                            <span style={{ marginRight: "8px" }}>📝</span> Notes
                        </span>
                        <Space>
                            <Button
                                type="default"
                                onClick={showNoteModal}
                                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                            >
                                Add Note
                            </Button>
                            <Button
                                type="default"
                                onClick={handleDelete}
                                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
                            >
                                <DeleteOutlined />
                            </Button>
                        </Space>
                    </Space>
                }
                style={{
                    marginBottom: "24px",
                    borderRadius: "8px",
                    boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
                    border: "1px solid #d9d9d9",
                }}
            >
                <List
                    itemLayout="vertical"
                    dataSource={notesData}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                backgroundColor: "#fffbe6",
                                borderRadius: "4px",
                                marginBottom: "8px",
                                padding: "8px",
                            }}
                        >
                            <List.Item.Meta
                                title={<Text>{item.content}</Text>}
                                description={<Text style={{ color: "#8c8c8c" }}>{item.date}</Text>}
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <Modal
                title="Add Note"
                open={isNoteModalOpen}
                onOk={handleNoteOk}
                onCancel={handleNoteCancel}
                okText="Add"
                cancelText="Cancel"
            >
                <Form form={noteForm} layout="vertical">
                    <Form.Item name="content" label="Note Content" rules={[{ required: true, message: "Please enter note content!" }]}>
                        <AntInput.TextArea style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter note content" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Notes;
