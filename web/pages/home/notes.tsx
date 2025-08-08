import React, { useState, useEffect } from "react";
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { addPlannerNotes, getPlannerNotes, updatePlannerNote, deletePlannerNote } from "../../services/home"; // Adjust import path as needed

const { Text, Title } = Typography;

const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

interface Note {
    id: string;
    title: string;
    description: string;
    date: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    userId?: string;
}

const Notes: React.FC = () => {
    const uid = "sample-user-123"; // Replace with actual user ID from auth context
    const [notesData, setNotesData] = useState<Note[]>([]);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [noteForm] = Form.useForm();

    const fetchNotes = async () => {
        try {
            const res = await getPlannerNotes();
            if (res.data.status === 1) {
                const userNotes = res.data.payload.filter((note: Note) => note.userId === uid);
                setNotesData(userNotes.map((note: Note) => ({
                    ...note,
                    date: note.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                })));
            } else {
                setNotesData([]);
                message.error("Failed to fetch notes");
            }
        } catch (err) {
            console.error(err);
            setNotesData([]);
            message.error("Something went wrong");
        }
    };

    useEffect(() => {
        // fetchNotes();
    }, [uid]); // Depend on uid to refetch if it changes

    const showNoteModal = (note?: Note) => {
        if (note) {
            setEditingNote(note);
            noteForm.setFieldsValue({ title: note.title, description: note.description });
        } else {
            setEditingNote(null);
            noteForm.resetFields();
        }
        setIsNoteModalOpen(true);
    };

    const handleNoteOk = async () => {
        try {
            const values = await noteForm.validateFields();
            const noteData = {
                title: values.title,
                description: values.description,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                userId: uid,
            };
            if (editingNote) {
                await updatePlannerNote({ id: editingNote.id, ...noteData });
                message.success("Note updated successfully!");
            } else {
                await addPlannerNotes(noteData);
                message.success("Note added successfully!");
            }
            setIsNoteModalOpen(false);
            noteForm.resetFields();
            setEditingNote(null);
            fetchNotes();
        } catch (err) {
            message.error("Failed to save note");
        }
    };

    const handleNoteCancel = () => {
        setIsNoteModalOpen(false);
        noteForm.resetFields();
        setEditingNote(null);
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: "Are you sure you want to delete this note?",
            content: "This action cannot be undone.",
            okText: "Delete",
            okButtonProps: { danger: true, style: { borderRadius: "6px" } },
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    await deletePlannerNote(id);
                    message.success("Note deleted successfully!");
                    fetchNotes();
                } catch (err) {
                    message.error("Failed to delete note");
                }
            },
        });
    };

    const handleDeleteAll = () => {
        Modal.confirm({
            title: "Are you sure you want to delete all notes?",
            content: "This action cannot be undone for all notes.",
            okText: "Delete All",
            okButtonProps: { danger: true, style: { borderRadius: "6px" } },
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    // Assuming backend supports deleting all notes for a user
                    const deletePromises = notesData.map((note) => deletePlannerNote(note.id));
                    await Promise.all(deletePromises);
                    message.success("All notes deleted successfully!");
                    fetchNotes();
                } catch (err) {
                    message.error("Failed to delete all notes");
                }
            },
        });
    };

    const visibleNotes = notesData.slice(0, 3); // Show up to 3 notes by default

    return (
        <>
            <Card
                title={
                    <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <span>
                            {/* <span style={{ marginRight: "8px" }}>📝</span> */}
                            <Title level={4} style={{ margin: 0, color: "#1f1f1f" }}>📝 Notes</Title>
                        </span>
                        <Space>
                            <Button
                                type="default"
                                onClick={() => showNoteModal()}
                                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent", borderRadius: "6px" }}
                            >
                                Add Note
                            </Button>
                            <Button
                                type="default"
                                onClick={handleDeleteAll}
                                style={{ borderColor: "#d9d9d9", backgroundColor: "transparent", borderRadius: "6px" }}
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
                    width: "100%",
                    background: "#ffffff",
                }}
            >
                <List
                    itemLayout="vertical"
                    dataSource={visibleNotes}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                backgroundColor: "#fffbe6",
                                borderRadius: "4px",
                                marginBottom: "8px",
                                padding: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                            actions={[
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => showNoteModal(item)}
                                    style={{ padding: "0", fontSize: "16px" }}
                                />,
                                <Button
                                    type="link"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(item.id)}
                                    style={{ padding: "0", fontSize: "16px", color: "#ff4d4f" }}
                                    danger
                                />,
                            ]}
                        >
                            <List.Item.Meta
                                title={<Text style={{ fontWeight: 600, color: "#1f1f1f" }}>{item.title}</Text>}
                                description={
                                    <Space direction="vertical">
                                        <Text style={{ color: "#595959" }}>{item.description}</Text>
                                        <Text style={{ color: "#8c8c8c" }}>Date: {item.date}</Text>
                                        {item.created_at && <Text style={{ color: "#8c8c8c" }}>Created: {new Date(item.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</Text>}
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
                {notesData.length > 3 && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                        <Button
                            onClick={() => setNotesData(notesData)} // Show all notes, adjust logic if needed
                            style={{
                                background: "linear-gradient(135deg, #1890ff, #40c4ff)",
                                border: "none",
                                borderRadius: "6px",
                                color: "#fff",
                            }}
                        >
                            View More
                        </Button>
                    </div>
                )}
            </Card>

            <Modal
                title={editingNote ? "Edit Note" : "Add Note"}
                open={isNoteModalOpen}
                onOk={handleNoteOk}
                onCancel={handleNoteCancel}
                okText={editingNote ? "Save" : "Add"}
                cancelText="Cancel"
                style={{ padding: "24px" }}
                bodyStyle={{ background: "#fafafa", borderRadius: "8px" }}
            >
                <Form form={noteForm} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Note Title"
                        rules={[{ required: true, message: "Please enter note title!" }]}
                    >
                        <AntInput
                            style={{ padding: "8px", borderRadius: "6px", fontSize: "14px" }}
                            placeholder="Enter note title"
                        />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Note Description"
                        rules={[{ required: true, message: "Please enter note description!" }]}
                    >
                        <AntInput.TextArea
                            style={{ padding: "8px", borderRadius: "6px", fontSize: "14px" }}
                            placeholder="Enter note description"
                            autoSize={{ minRows: 3, maxRows: 5 }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Notes;