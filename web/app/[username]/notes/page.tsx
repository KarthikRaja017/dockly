"use client";
import React, { useState } from "react";
import {
    Card,
    Button,
    Input,
    Select,
    Dropdown,
    Menu,
    Tag,
    Typography,
    Space,
    Row,
    Col,
    Modal,
    Form,
    message,
} from "antd";
import {
    HomeOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    MoreOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    FileTextOutlined,
    TagOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Types
interface StickyNoteData {
    id: string;
    text: string;
    status: "yet-to-start" | "due" | "in-progress" | "done";
}

interface NoteData {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    category: string;
}

const FamilyHubComplete = () => {
    // Sticky Notes State
    const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([
        {
            id: "1",
            text: "Pick up groceries:\n• Milk\n• Bread\n• Eggs\n• Apples",
            status: "yet-to-start",
        },
        {
            id: "2",
            text: "Soccer practice\nSaturday 3PM\nDon't forget water bottle!",
            status: "due",
        },
        {
            id: "3",
            text: "Mom's birthday\nApril 15th\nBook restaurant",
            status: "in-progress",
        },
        {
            id: "4",
            text: "Dentist appointment\nNext Tuesday 2PM\nCall to confirm",
            status: "done",
        },
    ]);

    // Notes State
    const [notes, setNotes] = useState<NoteData[]>([
        {
            id: "1",
            title: "Grocery Shopping List",
            content:
                "Weekly groceries needed:\n• Fresh vegetables (broccoli, carrots, spinach)\n• Dairy products (milk, cheese, yogurt)\n• Proteins (chicken, fish, eggs)\n• Pantry items (rice, pasta, canned goods)",
            createdAt: new Date(2024, 5, 25),
            category: "HOME",
        },
        {
            id: "2",
            title: "Vacation Planning",
            content:
                "Summer vacation to the beach house:\n• Book accommodation for July 15-22\n• Research local restaurants and activities\n• Pack sunscreen, beach toys, and summer clothes\n• Arrange pet care while away",
            createdAt: new Date(2024, 5, 20),
            category: "FAMILY",
        },
        {
            id: "3",
            title: "Kids' School Schedule",
            content:
                "Important school dates:\n• Parent-teacher conference: June 10th\n• Science fair: June 15th\n• Last day of school: June 28th\n• Summer camp starts: July 1st",
            createdAt: new Date(2024, 5, 18),
            category: "HEALTH",
        },
        {
            id: "4",
            title: "Budget Review",
            content:
                "Monthly finance check:\n• Review bank statements\n• Adjust savings plan for Q3\n• Pay utility bills by July 5\n• Plan investment allocation",
            createdAt: new Date(2024, 6, 1),
            category: "FINANCE",
        },
    ]);

    // UI State
    const [activeTab, setActiveTab] = useState("sticky-notes");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [editingSticky, setEditingSticky] = useState<string | null>(null);
    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
    const [form] = Form.useForm();

    // Status Configuration
    const statusConfig = {
        "yet-to-start": {
            label: "Yet to Start",
            color: "#fa8c16",
            icon: ClockCircleOutlined,
            bgColor: "#fff7e6",
            borderColor: "#ffd591",
        },
        due: {
            label: "Due",
            color: "#f5222d",
            icon: ExclamationCircleOutlined,
            bgColor: "#fff2f0",
            borderColor: "#ffccc7",
        },
        "in-progress": {
            label: "In Progress",
            color: "#1890ff",
            icon: PlayCircleOutlined,
            bgColor: "#f0f5ff",
            borderColor: "#adc6ff",
        },
        done: {
            label: "Done",
            color: "#52c41a",
            icon: CheckCircleOutlined,
            bgColor: "#f6ffed",
            borderColor: "#b7eb8f",
        },
    };

    const categories = ["All", "FAMILY", "FINANCE", "HOME", "HEALTH"];
    const categoryColors = {
        FAMILY: { color: "#52c41a", background: "#f6ffed" },
        FINANCE: { color: "#1890ff", background: "#f0f5ff" },
        HOME: { color: "#faad14", background: "#fffbe6" },
        HEALTH: { color: "#722ed1", background: "#f9f0ff" },
    };

    // Sticky Notes Functions
    const addStickyNote = (status: StickyNoteData["status"]) => {
        const newNote: StickyNoteData = {
            id: Date.now().toString(),
            text: "New note...",
            status,
        };
        setStickyNotes([...stickyNotes, newNote]);
        setEditingSticky(newNote.id);
    };

    const updateStickyNote = (id: string, updates: Partial<StickyNoteData>) => {
        setStickyNotes((notes) =>
            notes.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
    };

    const deleteStickyNote = (id: string) => {
        setStickyNotes((notes) => notes.filter((note) => note.id !== id));
    };

    // Notes Functions
    const addNote = () => {
        setIsNoteModalVisible(true);
    };

    const handleNoteModalOk = () => {
        form
            .validateFields()
            .then((values) => {
                const newNote: NoteData = {
                    id: Date.now().toString(),
                    title: values.title || "New Note",
                    content: values.content || "Start writing your note here...",
                    createdAt: new Date(),
                    category: values.category,
                };
                setNotes([newNote, ...notes]);
                setIsNoteModalVisible(false);
                form.resetFields();
                setEditingNote(newNote.id);
                message.success("Note created successfully!");
            })
            .catch((error) => {
                message.error("Please fill in all required fields");
            });
    };

    const handleNoteModalCancel = () => {
        setIsNoteModalVisible(false);
        form.resetFields();
    };

    const updateNote = (id: string, updates: Partial<NoteData>) => {
        setNotes((notes) =>
            notes.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
    };

    const deleteNote = (id: string) => {
        setNotes((notes) => notes.filter((note) => note.id !== id));
    };

    // Filtered Notes
    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === "All" || note.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Get Notes by Status
    const getNotesByStatus = (status: StickyNoteData["status"]) => {
        return stickyNotes.filter((note) => note.status === status);
    };

    // Render Sticky Note
    const renderStickyNote = (note: StickyNoteData) => {
        const config = statusConfig[note.status];
        const Icon = config.icon;

        const statusMenu = (
            <Menu
                onClick={({ key }) =>
                    updateStickyNote(note.id, { status: key as StickyNoteData["status"] })
                }
            >
                {Object.entries(statusConfig).map(([status, cfg]) => {
                    const StatusIcon = cfg.icon;
                    return (
                        <Menu.Item
                            key={status}
                            icon={<StatusIcon style={{ color: cfg.color }} />}
                        >
                            {cfg.label}
                        </Menu.Item>
                    );
                })}
            </Menu>
        );

        return (
            <Card
                key={note.id}
                size="small"
                style={{
                    backgroundColor: config.bgColor,
                    marginBottom: 12,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: 12 }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                    }}
                >
                    <Dropdown overlay={statusMenu} trigger={["click"]}>
                        <Button
                            size="small"
                            type="text"
                            icon={<Icon style={{ color: config.color }} />}
                            style={{
                                backgroundColor: "rgba(255,255,255,0.6)",
                                border: "none",
                                borderRadius: 4,
                            }}
                        />
                    </Dropdown>

                    <Space>
                        <Button
                            size="small"
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() =>
                                setEditingSticky(editingSticky === note.id ? null : note.id)
                            }
                            style={{ color: "#666" }}
                        />
                        <Button
                            size="small"
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() => deleteStickyNote(note.id)}
                            style={{ color: "#ff4d4f" }}
                        />
                    </Space>
                </div>

                {editingSticky === note.id ? (
                    <TextArea
                        value={note.text}
                        onChange={(e) =>
                            updateStickyNote(note.id, { text: e.target.value })
                        }
                        onBlur={() => setEditingSticky(null)}
                        autoSize={{ minRows: 3 }}
                        style={{
                            backgroundColor: "rgba(255,255,255,0.8)",
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                        }}
                        autoFocus
                    />
                ) : (
                    <div style={{ minHeight: 60 }}>
                        <Text
                            style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#333" }}
                        >
                            {note.text}
                        </Text>
                    </div>
                )}
            </Card>
        );
    };

    // Render Note Card
    const renderNoteCard = (note: NoteData) => {
        const categoryColor = categoryColors[
            note.category as keyof typeof categoryColors
        ] || { color: "#666", background: "#f5f5f5" };

        const noteMenu = (
            <Menu>
                <Menu.Item
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={() =>
                        setEditingNote(editingNote === note.id ? null : note.id)
                    }
                >
                    Edit
                </Menu.Item>
                <Menu.Item
                    key="delete"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteNote(note.id)}
                    style={{ color: "#ff4d4f" }}
                >
                    Delete
                </Menu.Item>
            </Menu>
        );

        return (
            <Card
                key={note.id}
                style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    height: 300,
                    display: "flex",
                    flexDirection: "column",
                }}
                bodyStyle={{
                    padding: 20,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 16,
                    }}
                >
                    <div style={{ flex: 1 }}>
                        {editingNote === note.id ? (
                            <Input
                                value={note.title}
                                onChange={(e) => updateNote(note.id, { title: e.target.value })}
                                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}
                                autoFocus
                            />
                        ) : (
                            <Title level={4} style={{ margin: "0 0 8px 0", color: "#333" }}>
                                {note.title}
                            </Title>
                        )}

                        <Tag
                            color={categoryColor.color}
                            style={{
                                backgroundColor: categoryColor.background,
                                border: `1px solid ${categoryColor.color}`,
                                borderRadius: 12,
                                color: categoryColor.color,
                            }}
                        >
                            <TagOutlined /> {note.category}
                        </Tag>
                    </div>

                    <Dropdown overlay={noteMenu} trigger={["click"]}>
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        marginBottom: 16,
                        paddingRight: 8,
                        maxHeight: 150,
                    }}
                >
                    {editingNote === note.id ? (
                        <TextArea
                            value={note.content}
                            onChange={(e) => updateNote(note.id, { content: e.target.value })}
                            autoSize={{ minRows: 4 }}
                            style={{ borderRadius: 8, height: "100%" }}
                        />
                    ) : (
                        <Paragraph
                            style={{ whiteSpace: "pre-wrap", color: "#666", margin: 0 }}
                        >
                            {note.content}
                        </Paragraph>
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "auto",
                    }}
                >
                    <Space style={{ color: "#999", fontSize: 12 }}>
                        <CalendarOutlined />
                        {note.createdAt.toLocaleDateString()}
                    </Space>

                    {editingNote === note.id && (
                        <Space>
                            <Button size="small" onClick={() => setEditingNote(null)}>
                                Cancel
                            </Button>
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => {
                                    setEditingNote(null);
                                    message.success("Note saved successfully!");
                                }}
                            >
                                Save
                            </Button>
                        </Space>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: 24,
                background: "#F5F5F5",
            }}
        >
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            marginBottom: 16,
                        }}
                    >
                        <HomeOutlined style={{ fontSize: 32, color: "#6366f1" }} />
                    </div>
                </div>

                {/* Professional Tabs */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 32,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: 16,
                            padding: 6,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <Button.Group>
                            <Button
                                type={activeTab === "sticky-notes" ? "primary" : "text"}
                                icon={<TagOutlined />}
                                onClick={() => setActiveTab("sticky-notes")}
                                style={{
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    padding: "12px 24px",
                                    height: "auto",
                                    backgroundColor:
                                        activeTab === "sticky-notes" ? "#6366f1" : "transparent",
                                    borderColor:
                                        activeTab === "sticky-notes" ? "#6366f1" : "transparent",
                                    color: activeTab === "sticky-notes" ? "white" : "#6b7280",
                                    boxShadow:
                                        activeTab === "sticky-notes"
                                            ? "0 4px 12px #6366f140"
                                            : "none",
                                }}
                            >
                                Sticky Notes
                            </Button>
                            <Button
                                type={activeTab === "notes" ? "primary" : "text"}
                                icon={<FileTextOutlined />}
                                onClick={() => setActiveTab("notes")}
                                style={{
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    padding: "12px 24px",
                                    height: "auto",
                                    backgroundColor:
                                        activeTab === "notes" ? "#8b5cf6" : "transparent",
                                    borderColor:
                                        activeTab === "notes" ? "#8b5cf6" : "transparent",
                                    color: activeTab === "notes" ? "white" : "#6b7280",
                                    boxShadow:
                                        activeTab === "notes" ? "0 4px 12px #8b5cf640" : "none",
                                }}
                            >
                                Notes
                            </Button>
                        </Button.Group>
                    </div>
                </div>

                {/* Content */}
                <div
                    style={{
                        opacity: 1,
                        transform: "translateY(0)",
                        transition: "all 0.3s ease-in-out",
                    }}
                >
                    {activeTab === "sticky-notes" && (
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 24,
                                }}
                            >
                                <Title level={2} style={{ margin: 0, color: "#333" }}>
                                    Sticky Notes
                                </Title>
                            </div>

                            <Row gutter={24}>
                                {Object.entries(statusConfig).map(([status, config]) => {
                                    const Icon = config.icon;
                                    const notes = getNotesByStatus(
                                        status as StickyNoteData["status"]
                                    );

                                    return (
                                        <Col key={status} xs={24} sm={12} lg={6}>
                                            <Card
                                                title={
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <Icon style={{ color: config.color }} />
                                                            <span
                                                                style={{ color: config.color, fontWeight: 600 }}
                                                            >
                                                                {config.label}
                                                            </span>
                                                            <Tag
                                                                color={config.color}
                                                                style={{ minWidth: 20, textAlign: "center" }}
                                                            >
                                                                {notes.length}
                                                            </Tag>
                                                        </div>
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            icon={<PlusOutlined />}
                                                            onClick={() =>
                                                                addStickyNote(
                                                                    status as StickyNoteData["status"]
                                                                )
                                                            }
                                                            style={{ color: config.color }}
                                                        />
                                                    </div>
                                                }
                                                style={{
                                                    backgroundColor: config.bgColor,
                                                    borderWidth: 2,
                                                    borderRadius: 12,
                                                    minHeight: 400,
                                                }}
                                                bodyStyle={{ padding: 16 }}
                                            >
                                                {notes.map(renderStickyNote)}
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </div>
                    )}

                    {activeTab === "notes" && (
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 24,
                                }}
                            >
                                <Title level={2} style={{ margin: 0, color: "#333" }}>
                                    Notes
                                </Title>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={addNote}
                                    style={{ borderRadius: 8 }}
                                >
                                    Add Note
                                </Button>
                            </div>

                            {/* Search and Filter */}
                            <Row gutter={16} style={{ marginBottom: 24 }}>
                                <Col xs={24} sm={16}>
                                    <Input
                                        placeholder="Search notes..."
                                        prefix={<SearchOutlined />}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ borderRadius: 8 }}
                                    />
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Select
                                        value={selectedCategory}
                                        onChange={setSelectedCategory}
                                        style={{ width: "100%", borderRadius: 8 }}
                                    >
                                        {categories.map((category) => (
                                            <Option key={category} value={category}>
                                                {category}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>

                            {/* Notes Grid */}
                            <Row gutter={16}>
                                {filteredNotes.map((note) => (
                                    <Col key={note.id} xs={24} md={12} lg={8}>
                                        {renderNoteCard(note)}
                                    </Col>
                                ))}
                            </Row>

                            {filteredNotes.length === 0 && (
                                <div style={{ textAlign: "center", padding: 48 }}>
                                    <SearchOutlined
                                        style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                                    />
                                    <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
                                        No notes found
                                    </Title>
                                    <Text style={{ color: "#999" }}>
                                        {searchTerm || selectedCategory !== "All"
                                            ? "Try adjusting your search or filter criteria"
                                            : "Create your first note to get started"}
                                    </Text>
                                </div>
                            )}
                        </div>
                    )}

                    {/* New Note Modal */}
                    <Modal
                        title="Create New Note"
                        visible={isNoteModalVisible}
                        onOk={handleNoteModalOk}
                        onCancel={handleNoteModalCancel}
                        okText="Create"
                        cancelText="Cancel"
                        style={{ top: 20 }}
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: "Please enter a title" }]}
                            >
                                <Input placeholder="Note title" />
                            </Form.Item>
                            <Form.Item
                                name="category"
                                label="Category"
                                rules={[
                                    { required: true, message: "Please select a category" },
                                ]}
                            >
                                <Select placeholder="Select a category">
                                    {categories
                                        .filter((cat) => cat !== "All")
                                        .map((category) => (
                                            <Option key={category} value={category}>
                                                {category}
                                            </Option>
                                        ))}
                                </Select>
                            </Form.Item>
                            <Form.Item name="content" label="Content">
                                <TextArea
                                    rows={4}
                                    placeholder="Start writing your note here..."
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default FamilyHubComplete;

