

"use client";

import React, { ForwardRefExoticComponent, RefAttributes, useEffect, useState } from "react";
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
    DatePicker,
} from "antd";
import {
    HomeOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    TagOutlined,
    CalendarOutlined,
    FileTextOutlined,
    RightOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import {
    getAllNotes,
    updateNote,
    addNote,
    addNoteCategory,
    getNoteCategories,
} from "../../../services/family";
import { addNotes, getNotes } from "../../../services/notes";
import { showNotification } from "../../../utils/notification";
import dayjs from "dayjs";
import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Types
interface StickyNoteData {
    id: number;
    title: string;
    description: string;
    reminderDate: string;
    status: number;
}

interface Note {
    id?: number;
    title: string;
    description: string;
    created_at?: string;
}

interface Category {
    title: string;
    icon: string;
    items: Note[];
    category_id?: number;
    id?: number;
}

interface ApiCategory {
    id: number;
    title: string;
    icon: string;
}

interface ApiNote {
    id: number;
    title: string;
    description: string;
    category_id: number;
    category_name?: string;
    created_at: string;
}

interface StatusConfig {
    [key: number]: {
        label: string;
        color: string;
        icon: ForwardRefExoticComponent<Omit<AntdIconProps, "ref"> & RefAttributes<HTMLSpanElement>>;
        bgColor: string;
        borderColor: string;
    };
}
// Status configuration for Sticky Notes
const statusConfig: StatusConfig = {
    3: {
        label: "Yet to Start",
        color: "#fa8c16",
        icon: ClockCircleOutlined,
        bgColor: "#fff7e6",
        borderColor: "#ffd591",
    },
    0: {
        label: "Due",
        color: "#f5222d",
        icon: ExclamationCircleOutlined,
        bgColor: "#fff2f0",
        borderColor: "#ffccc7",
    },
    1: {
        label: "In Progress",
        color: "#1890ff",
        icon: PlayCircleOutlined,
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
    },
    2: {
        label: "Done",
        color: "#52c41a",
        icon: CheckCircleOutlined,
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
    },
};

// Status mapping for backend
const statusMap: Record<"Done" | "In Progress" | "Yet to Start" | "Due", number> = {
    Done: 2,
    "In Progress": 1,
    Due: 0,
    "Yet to Start": 3,
};

const numberToStatusMap: Record<number, string> = Object.entries(statusMap).reduce(
    (acc, [key, value]) => {
        acc[value] = key;
        return acc;
    },
    {} as Record<number, string>
);

// Category configurations
const categoryColorMap: Record<string, { color: string; background: string }> = {
    "Important Notes": { color: "#ef4444", background: "#fef2f2" },
    "House Rules & Routines": { color: "#10b981", background: "#f0fdf4" },
    "Shopping Lists": { color: "#3b82f6", background: "#eff6ff" },
    "Birthday & Gift Ideas": { color: "#ec4899", background: "#fdf2f8" },
    "Meal Ideas & Recipes": { color: "#8b5cf6", background: "#f3f4f6" },
};

const defaultCategories: Category[] = [
    { title: "Important Notes", icon: "📌", items: [] },
    { title: "House Rules & Routines", icon: "🏠", items: [] },
    { title: "Shopping Lists", icon: "🛒", items: [] },
    { title: "Birthday & Gift Ideas", icon: "🎁", items: [] },
    { title: "Meal Ideas & Recipes", icon: "🍽", items: [] },
];

const categoryIdMap: Record<string, number> = {
    "Important Notes": 1,
    "House Rules & Routines": 3,
    "Shopping Lists": 4,
    "Birthday & Gift Ideas": 5,
    "Meal Ideas & Recipes": 6,
};

const categoryIdMapReverse: Record<number, string> = Object.entries(categoryIdMap).reduce(
    (acc, [title, id]) => {
        acc[id] = title;
        return acc;
    },
    {} as Record<number, string>
);

const stringToColor = (str: string): { color: string; background: string } => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    const colorHex = `#${color.padStart(6, "0")}`;
    return {
        color: colorHex,
        background: `${colorHex}15`,
    };
};

const IntegratedFamilyNotes = () => {
    // State
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
    const [activeTab, setActiveTab] = useState("notes");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(false);

    // Modal states
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
    const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
    const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [newCategoryModal, setNewCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingSticky, setEditingSticky] = useState<number | null>(null);

    // Sticky Notes Modal states
    const [stickyModalOpen, setStickyModalOpen] = useState(false);
    const [stickyModalMode, setStickyModalMode] = useState<"create" | "edit">("create");
    const [editingStickyId, setEditingStickyId] = useState<number | null>(null);

    const [form] = Form.useForm();
    const [stickyForm] = Form.useForm();

    useEffect(() => {
        fetchCategoriesAndNotes();
        fetchStickyNotes();
    }, []);

    // Fetch sticky notes from backend
    const fetchStickyNotes = async () => {
        try {
            const response = await getNotes({});
            const { status, message: msg, payload } = response.data;
            if (status) {
                setStickyNotes(payload.notes);
            } else {
                showNotification("Error", msg, "error");
            }
        } catch (error) {
            console.error("Error fetching sticky notes:", error);
            showNotification("Error", "Failed to fetch sticky notes", "error");
        }
    };

    const fetchCategoriesAndNotes = async () => {
        try {
            setLoading(true);
            const [categoriesRes, notesRes] = await Promise.all([
                getNoteCategories(),
                getAllNotes(),
            ]);

            const categoriesPayload: ApiCategory[] = categoriesRes.data.payload;
            const rawNotes: ApiNote[] = notesRes.data.payload;

            const customCategories: Category[] = categoriesPayload.map((cat) => ({
                title: cat.title,
                icon: cat.icon || "✍",
                items: [],
                category_id: cat.id,
                id: cat.id,
            }));

            const updatedDefaultCategories = defaultCategories.map((cat) => ({
                ...cat,
                items: [],
            }));

            const allCategories = [...updatedDefaultCategories, ...customCategories];

            const groupedNotes: Record<string, Note[]> = {};

            rawNotes.forEach((note) => {
                let catTitle = categoryIdMapReverse[note.category_id];
                if (!catTitle && note.category_name) {
                    catTitle = note.category_name;
                }
                if (!catTitle) {
                    catTitle = "Others";
                }

                if (!groupedNotes[catTitle]) groupedNotes[catTitle] = [];

                groupedNotes[catTitle].unshift({
                    id: note.id,
                    title: note.title,
                    description: note.description,
                    created_at: note.created_at,
                });
            });

            const finalCategories = allCategories.map((cat) => ({
                ...cat,
                items: groupedNotes[cat.title] || [],
            }));

            setCategories(finalCategories);
        } catch (err) {
            message.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Sticky Notes Functions
    const addStickyNote = (status: number) => {
        setStickyModalMode("create");
        stickyForm.setFieldsValue({
            reminderDate: dayjs(),
            status: numberToStatusMap[status],
        });
        setStickyModalOpen(true);
    };

    const updateStickyNote = (note: StickyNoteData) => {
        setStickyModalMode("edit");
        setEditingStickyId(note.id);
        stickyForm.setFieldsValue({
            title: note.title,
            description: note.description,
            reminderDate: dayjs(note.reminderDate),
            status: numberToStatusMap[note.status],
            id: note.id,
        });
        setStickyModalOpen(true);
    };

    const deleteStickyNote = async (id: number) => {
        try {
            setStickyNotes((notes) => notes.filter((note) => note.id !== id));
            showNotification("Success", "Note deleted successfully", "success");
        } catch (error) {
            showNotification("Error", "Failed to delete note", "error");
        }
    };

    const handleSaveStickyNote = async () => {
        setLoading(true);
        try {
            const values = await stickyForm.validateFields();
            const statusNumber = statusMap[values.status as keyof typeof statusMap] ?? -1;

            if (stickyModalMode === "create") {
                values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
                values.status = statusNumber;
                const response = await addNotes(values);
                const { status, message } = response.data;
                if (status) {
                    showNotification("Success", message, "success");
                    fetchStickyNotes();
                }
            } else {
                values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
                values.status = statusNumber;
                const response = await addNotes({
                    id: values.id,
                    editing: true,
                    ...values,
                });
                const { status, message } = response.data;
                if (status) {
                    showNotification("Success", message, "success");
                    fetchStickyNotes();
                }
            }
            setStickyModalOpen(false);
            stickyForm.resetFields();
            setEditingStickyId(null);
        } catch (error) {
            console.error("Validation failed:", error);
        }
        setLoading(false);
    };

    const closeStickyModal = () => {
        setStickyModalOpen(false);
        stickyForm.resetFields();
        setEditingStickyId(null);
    };

    const getNotesByStatus = (status: number) => {
        return stickyNotes.filter((note) => note.status === status);
    };

    // Category modal functions
    const openCategoryModal = (index: number) => {
        setActiveCategoryIndex(index);
        setCategoryModalOpen(true);
        setShowNoteForm(false);
        setEditingNoteIndex(null);
        setNewNote({ title: "", description: "" });
    };

    const handleEditNote = (note: Note, idx: number) => {
        setEditingNoteIndex(idx);
        setNewNote({ ...note });
        setShowNoteForm(true);
    };

    const handleSaveNote = async () => {
        if (activeCategoryIndex === null) return;
        const categoryTitle = categories[activeCategoryIndex].title;
        const category_id = categoryIdMap[categoryTitle] || categories[activeCategoryIndex].category_id;

        if (!newNote.title.trim() || !newNote.description.trim()) {
            message.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            if (editingNoteIndex !== null) {
                const rawNotes = await getAllNotes();
                const fullNote = rawNotes.data.payload.find(
                    (note: ApiNote) =>
                        note.title === categories[activeCategoryIndex].items[editingNoteIndex].title &&
                        note.description === categories[activeCategoryIndex].items[editingNoteIndex].description &&
                        note.category_id === category_id
                );
                if (!fullNote) {
                    message.error("Note not found");
                    setLoading(false);
                    return;
                }
                const res = await updateNote({
                    id: fullNote.id,
                    title: newNote.title,
                    description: newNote.description,
                    category_id: category_id as number,
                });
                if (res.data.status === 1) {
                    message.success("Note updated");
                    await fetchCategoriesAndNotes();
                }
            } else {
                const user_id = localStorage.getItem("userId") || "";
                const res = await addNote({
                    title: newNote.title,
                    description: newNote.description,
                    category_id: category_id as number,
                    user_id,
                });
                if (res.data.status === 1) {
                    message.success("Note added");
                    await fetchCategoriesAndNotes();
                }
            }
            setShowNoteForm(false);
            setEditingNoteIndex(null);
            setNewNote({ title: "", description: "" });
        } catch (err) {
            message.error("Something went wrong");
        }
        setLoading(false);
    };

    const handleAddCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return;
        if (categories.some((c) => c.title === name)) {
            message.error("Category already exists");
            return;
        }

        setLoading(true);
        try {
            const user_id = localStorage.getItem("userId") || "";
            const res = await addNoteCategory({ name, icon: "✍", user_id });

            if (res.data.status === 1) {
                message.success("Category added");
                setNewCategoryModal(false);
                setNewCategoryName("");
                await fetchCategoriesAndNotes();
            } else {
                message.error("Failed to add category");
            }
        } catch (err) {
            message.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Filtered categories
    const filteredCategories = categories.filter((category) => {
        const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Render Sticky Note
    const renderStickyNote = (note: StickyNoteData) => {
        const config = statusConfig[note.status];
        const Icon = config.icon;

        const statusMenu = (
            <Menu
                onClick={({ key }) => {
                    const updatedNote = { ...note, status: parseInt(key) };
                    updateStickyNote(updatedNote);
                }}
            >
                {Object.entries(statusConfig).map(([status, cfg]) => {
                    const StatusIcon = cfg.icon;
                    return (
                        <Menu.Item key={status} icon={<StatusIcon style={{ color: cfg.color }} />}>
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
                            onClick={() => updateStickyNote(note)}
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

                <div style={{ minHeight: 60 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{note.title}</div>
                    <Text style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#666" }}>
                        {note.description}
                    </Text>
                    {note.reminderDate && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "#999",
                                marginTop: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <CalendarOutlined />
                            {dayjs(note.reminderDate).format("MMM DD, YYYY")}
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    // Render category card
    const renderCategoryCard = (category: Category, index: number) => {
        const categoryColor = categoryColorMap[category.title] || stringToColor(category.title);

        return (
            <Card
                key={index}
                style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    height: 300,
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                }}
                bodyStyle={{
                    padding: 20,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
                onClick={() => openCategoryModal(index)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
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
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    background: categoryColor.background,
                                    borderRadius: 12,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: 20,
                                }}
                            >
                                {category.icon}
                            </div>
                            <Title level={4} style={{ margin: 0, color: "#333" }}>
                                {category.title}
                            </Title>
                        </div>

                        <Tag
                            color={categoryColor.color}
                            style={{
                                backgroundColor: categoryColor.background,
                                border: `1px solid ${categoryColor.color}`,
                                borderRadius: 12,
                                color: categoryColor.color,
                            }}
                        >
                            <TagOutlined /> {category.items.length} notes
                        </Tag>
                    </div>

                    <RightOutlined style={{ fontSize: 16, color: "#999" }} />
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
                    {category.items.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
                            <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                            <div>No notes yet</div>
                            <div style={{ fontSize: 12 }}>Click to add your first note</div>
                        </div>
                    ) : (
                        <div>
                            {category.items.slice(0, 3).map((note, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: 8,
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: 6,
                                        marginBottom: 6,
                                        fontSize: 12,
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{note.title}</div>
                                    <div style={{ color: "#666", marginTop: 2 }}>
                                        {note.description.substring(0, 50)}
                                        {note.description.length > 50 && "..."}
                                    </div>
                                </div>
                            ))}
                            {category.items.length > 3 && (
                                <div style={{ fontSize: 12, color: "#999", textAlign: "center" }}>
                                    +{category.items.length - 3} more notes
                                </div>
                            )}
                        </div>
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
                        {category.items.length > 0 && category.items[0].created_at
                            ? new Date(category.items[0].created_at).toLocaleDateString()
                            : "No activity"}
                    </Space>
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
                paddingRight: 10,
                paddingLeft: 100,
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
                            marginLeft: 0,
                            marginRight: "auto",
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
                                    backgroundColor: activeTab === "sticky-notes" ? "#6366f1" : "transparent",
                                    borderColor: activeTab === "sticky-notes" ? "#6366f1" : "transparent",
                                    color: activeTab === "sticky-notes" ? "white" : "#6b7280",
                                    boxShadow: activeTab === "sticky-notes" ? "0 4px 12px #6366f140" : "none",
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
                                    backgroundColor: activeTab === "notes" ? "#8b5cf6" : "transparent",
                                    borderColor: activeTab === "notes" ? "#8b5cf6" : "transparent",
                                    color: activeTab === "notes" ? "white" : "#6b7280",
                                    boxShadow: activeTab === "notes" ? "0 4px 12px #8b5cf640" : "none",
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
                                    const notes = getNotesByStatus(parseInt(status));

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
                                                            <span style={{ color: config.color, fontWeight: 600 }}>
                                                                {config.label}
                                                            </span>
                                                            <Tag color={config.color} style={{ minWidth: 20, textAlign: "center" }}>
                                                                {notes.length}
                                                            </Tag>
                                                        </div>
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            icon={<PlusOutlined />}
                                                            onClick={() => addStickyNote(parseInt(status))}
                                                            style={{ color: config.color }}
                                                        />
                                                    </div>
                                                }
                                                style={{
                                                    backgroundColor: config.bgColor,
                                                    borderWidth: 2,
                                                    borderRadius: 12,
                                                    height: 400,
                                                    overflowY: "auto",
                                                }}
                                                bodyStyle={{
                                                    padding: 16,
                                                }}
                                            >
                                                {notes.length === 0 ? (
                                                    <div
                                                        style={{
                                                            textAlign: "center",
                                                            color: "#999",
                                                            padding: 20,
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => addStickyNote(parseInt(status))}
                                                    >
                                                        <TagOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                                        <div>No notes yet</div>
                                                        <div style={{ fontSize: 12 }}>Click to add your first note</div>
                                                    </div>
                                                ) : (
                                                    notes.map(renderStickyNote)
                                                )}
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </div>
                    )}

                    {activeTab === "notes" && (
                        <div>
                            {/* Notes Section */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 24,
                                }}
                            >
                                <Title level={2} style={{ margin: 0, color: "#333" }}>
                                    Notes Categories
                                </Title>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setNewCategoryModal(true)}
                                    style={{ borderRadius: 8, marginRight: 20 }}
                                >
                                </Button>
                            </div>

                            {/* Search */}
                            <Row gutter={16} style={{ marginBottom: 24 }}>
                                <Col xs={24} sm={16}>
                                    <Input
                                        placeholder="Search categories..."
                                        prefix={<SearchOutlined />}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ borderRadius: 8 }}
                                    />
                                </Col>
                            </Row>

                            {/* Categories Grid */}
                            <Row gutter={16}>
                                {filteredCategories.map((category, index) => (
                                    <Col key={index} xs={24} md={12} lg={8}>
                                        {renderCategoryCard(category, index)}
                                    </Col>
                                ))}
                            </Row>

                            {filteredCategories.length === 0 && (
                                <div style={{ textAlign: "center", padding: 48 }}>
                                    <SearchOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
                                    <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
                                        No categories found
                                    </Title>
                                    <Text style={{ color: "#999" }}>
                                        {searchTerm ? "Try adjusting your search criteria" : "Create your first category to get started"}
                                    </Text>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sticky Note Create/Edit Modal */}
                <Modal
                    open={stickyModalOpen}
                    onCancel={closeStickyModal}
                    footer={null}
                    width={500}
                    closable={false}
                    style={{ top: "50px" }}
                    styles={{
                        body: {
                            padding: 0,
                            borderRadius: "12px",
                            overflow: "hidden",
                        },
                    }}
                >
                    <div
                        style={{
                            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                            padding: "16px",
                            color: "white",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "25px",
                                height: "25px",
                                background: "rgba(255, 255, 255, 0.2)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 8px",
                            }}
                        >
                            {stickyModalMode === "create" ? (
                                <PlusOutlined style={{ fontSize: "14px", color: "white" }} />
                            ) : (
                                <EditOutlined style={{ fontSize: "14px", color: "white" }} />
                            )}
                        </div>
                        <Title
                            level={4}
                            style={{
                                color: "white",
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: 600,
                            }}
                        >
                            {stickyModalMode === "create" ? "New Sticky Note" : "Edit Sticky Note"}
                        </Title>
                        <Text
                            style={{
                                color: "rgba(255, 255, 255, 0.8)",
                                fontSize: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                marginTop: "4px",
                            }}
                        >
                            {stickyModalMode === "create" ? "Get organized" : "Update note"}
                        </Text>
                    </div>
                    <div
                        style={{
                            padding: "16px",
                            background: "white",
                            minHeight: "300px",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Form
                            form={stickyForm}
                            layout="vertical"
                            initialValues={{
                                reminderDate: dayjs(),
                                status: "Yet to Start",
                            }}
                            style={{ width: "100%", flex: 1 }}
                            onFinish={handleSaveStickyNote}
                        >
                            <Form.Item
                                label={
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: "#1f2937",
                                        }}
                                    >
                                        Title
                                    </span>
                                }
                                name="title"
                                rules={[{ required: true, message: "Enter a title" }]}
                            >
                                <Input
                                    placeholder="Note title..."
                                    size="middle"
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                        fontSize: "14px",
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                label={
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            color: "#1f2937",
                                        }}
                                    >
                                        Description
                                    </span>
                                }
                                name="description"
                            >
                                <TextArea
                                    placeholder="Note details..."
                                    rows={3}
                                    style={{
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                        fontSize: "14px",
                                        resize: "none",
                                    }}
                                />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: 500,
                                                    color: "#1f2937",
                                                }}
                                            >
                                                Reminder Date
                                            </span>
                                        }
                                        name="reminderDate"
                                        rules={[{ required: true, message: "Select a date" }]}
                                    >
                                        <DatePicker
                                            style={{
                                                width: "100%",
                                                borderRadius: "8px",
                                                border: "1px solid #e5e7eb",
                                                fontSize: "14px",
                                            }}
                                            size="middle"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label={
                                            <span
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: 500,
                                                    color: "#1f2937",
                                                }}
                                            >
                                                Status
                                            </span>
                                        }
                                        name="status"
                                    >
                                        <Select
                                            size="middle"
                                            style={{
                                                borderRadius: "8px",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <Option value="Yet to Start">Yet to Start</Option>
                                            <Option value="In Progress">In Progress</Option>
                                            <Option value="Done">Done</Option>
                                            <Option value="Due">Due</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item name="id" hidden>
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={12} style={{ marginTop: "16px" }}>
                                <Col span={12}>
                                    <Button
                                        size="middle"
                                        block
                                        onClick={closeStickyModal}
                                        style={{
                                            borderRadius: "8px",
                                            height: "36px",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            border: "1px solid #e5e7eb",
                                            color: "#374151",
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                                <Col span={12}>
                                    <Button
                                        type="primary"
                                        size="middle"
                                        block
                                        onClick={handleSaveStickyNote}
                                        style={{
                                            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                            border: "none",
                                            borderRadius: "8px",
                                            height: "36px",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
                                        }}
                                        loading={loading}
                                    >
                                        {stickyModalMode === "create" ? "Create" : "Update"}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </Modal>

                {/* Add Category Modal */}
                <Modal
                    open={newCategoryModal}
                    onCancel={() => setNewCategoryModal(false)}
                    onOk={handleAddCategory}
                    centered
                    width={400}
                    okText="Add"
                    closable={false}
                    footer={[
                        <Button key="cancel" onClick={() => setNewCategoryModal(false)}>
                            Cancel
                        </Button>,
                        <Button key="submit" type="primary" onClick={handleAddCategory} loading={loading}>
                            Add Category
                        </Button>,
                    ]}
                >
                    <div style={{ padding: 24 }}>
                        <Title level={4}>Create New Category</Title>
                        <Input
                            placeholder="Category Name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            style={{ marginBottom: 20 }}
                        />
                    </div>
                </Modal>

                {/* Category Notes Modal */}
                <Modal
                    open={categoryModalOpen}
                    onCancel={() => setCategoryModalOpen(false)}
                    footer={null}
                    centered
                    width={550}
                    closable={false}
                >
                    {activeCategoryIndex !== null && (
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 15,
                                }}
                            >
                                <span style={{ fontSize: 22, fontWeight: 600 }}>
                                    {categories[activeCategoryIndex].icon} {categories[activeCategoryIndex].title}
                                </span>
                                <Button
                                    type="primary"
                                    shape="default"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setShowNoteForm(true);
                                        setEditingNoteIndex(null);
                                        setNewNote({ title: "", description: "" });
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: 20,
                                        right: 44,
                                        width: 34,
                                        height: 34,
                                        borderRadius: 12,
                                        backgroundColor: "#1677ff",
                                        color: "white",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                        border: "none",
                                    }}
                                />
                            </div>

                            <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
                                {categories[activeCategoryIndex].items.length === 0 && !showNoteForm ? (
                                    <div
                                        style={{
                                            border: "1px dashed #d9d9d9",
                                            borderRadius: 8,
                                            padding: 24,
                                            textAlign: "center",
                                            marginBottom: 16,
                                            backgroundColor: "#fffbfbff",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            setShowNoteForm(true);
                                            setEditingNoteIndex(null);
                                            setNewNote({ title: "", description: "" });
                                        }}
                                    >
                                        <PlusOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                                        <div style={{ marginTop: 8, color: "#1677ff" }}>
                                            Add your first note
                                        </div>
                                    </div>
                                ) : (
                                    categories[activeCategoryIndex].items.map((note, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                border: "1px solid #f0f0f0",
                                                borderRadius: 8,
                                                padding: 12,
                                                marginBottom: 12,
                                                backgroundColor: "#fffbfbff",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: 8,
                                                }}
                                            >
                                                <div style={{ marginTop: 4 }}>📍</div>
                                                <div>
                                                    <div style={{ fontSize: "15px" }}>
                                                        <strong>{note.title}</strong> — {note.description}
                                                    </div>
                                                    {note.created_at && (
                                                        <div style={{ fontSize: 11, color: "#333" }}>
                                                            {new Date(note.created_at).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                icon={<EditOutlined />}
                                                size="small"
                                                onClick={() => handleEditNote(note, idx)}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            {showNoteForm && (
                                <div style={{ marginTop: 20 }}>
                                    <Input
                                        placeholder="Note Title"
                                        value={newNote.title}
                                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                        style={{ marginBottom: 12 }}
                                    />
                                    <Input
                                        placeholder="Note Description"
                                        value={newNote.description}
                                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                                        style={{ marginBottom: 20 }}
                                    />
                                </div>
                            )}
                            <div style={{ marginTop: 20, textAlign: "right" }}>
                                <Button onClick={() => setCategoryModalOpen(false)} style={{ marginRight: 8 }}>
                                    Cancel
                                </Button>
                                {showNoteForm && (
                                    <Button type="primary" onClick={handleSaveNote} loading={loading}>
                                        {editingNoteIndex !== null ? "Update Note" : "Add Note"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default IntegratedFamilyNotes;

