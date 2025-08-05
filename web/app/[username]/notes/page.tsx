
"use client";

import React, { useEffect, useState } from "react";
import {
    Button,
    Input,
    message,
    Modal,
    Select,
    Typography,
    Row,
    Col,
    Form,
    Dropdown,
    Menu,
    Popconfirm,
    Spin,
    Empty,
    Badge,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    RightOutlined,
    PushpinOutlined,
    PushpinFilled,
    FileTextOutlined,
    SearchOutlined,
    TagOutlined,
    CalendarOutlined,
    MoreOutlined,
    DeleteOutlined,
    ShareAltOutlined,
    MailOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    getAllNotes,
    updateNote,
    addNote,
    addNoteCategory,
    getNoteCategories,
    updateNoteCategory,
    deleteNote,
    shareNote,
} from "../../../services/family";
import DocklyLoader from "../../../utils/docklyLoader";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Note {
    id?: number;
    title: string;
    description: string;
    created_at?: string;
    updated_at?: string;
    hub?: string;
}

interface Category {
    title: string;
    icon: string;
    items: Note[];
    category_id?: number;
    pinned?: boolean;
}

interface ApiCategory {
    pinned: boolean;
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
    updated_at: string;
    hub?: string;
}

const suggestedCategories = [
    { label: "💰 Budget & Finance", value: "Budget & Finance", icon: "💰" },
    { label: "🏥 Health & Medical", value: "Health & Medical", icon: "🏥" },
    { label: "🚗 Car & Maintenance", value: "Car & Maintenance", icon: "🚗" },
    { label: "🎯 Goals & Plans", value: "Goals & Plans", icon: "🎯" },
    { label: "📚 Books & Movies", value: "Books & Movies", icon: "📚" },
    { label: "🏃 Fitness & Exercise", value: "Fitness & Exercise", icon: "🏃" },
    { label: "🧹 Cleaning & Chores", value: "Cleaning & Chores", icon: "🧹" },
    { label: "👥 Family Events", value: "Family Events", icon: "👥" },
    { label: "🎨 Hobbies & Crafts", value: "Hobbies & Crafts", icon: "🎨" },
    { label: "📞 Contacts & Info", value: "Contacts & Info", icon: "📞" },
    { label: "🌱 Garden & Plants", value: "Garden & Plants", icon: "🌱" },
    { label: "🎓 Education & Learning", value: "Education & Learning", icon: "🎓" },
    { label: "💻 Technology & Apps", value: "Technology & Apps", icon: "💻" },
    { label: "✈ Travel & Vacation", value: "Travel & Vacation", icon: "✈" },
    { label: "🔧 Home Improvement", value: "Home Improvement", icon: "🔧" },
    { label: "📝 Work & Projects", value: "Work & Projects", icon: "📝" },
    { label: "🎉 Party Planning", value: "Party Planning", icon: "🎉" },
    { label: "🐾 Pet Care", value: "Pet Care", icon: "🐾" },
    { label: "🎪 Kids Activities", value: "Kids Activities", icon: "🎪" },
    { label: "💡 Ideas & Inspiration", value: "Ideas & Inspiration", icon: "💡" },
    { label: "Others", value: "Others", icon: "✍" },
];

const categoryColorMap: Record<string, string> = {
    "Important Notes": "#ef4444",
    "House Rules & Routines": "#10b981",
    "Shopping Lists": "#3b82f6",
    "Birthday & Gift Ideas": "#ec4899",
    "Meal Ideas & Recipes": "#8b5cf6",
    "Budget & Finance": "#f59e0b",
    "Health & Medical": "#dc2626",
    "Car & Maintenance": "#374151",
    "Goals & Plans": "#7c3aed",
    "Books & Movies": "#059669",
    "Fitness & Exercise": "#ea580c",
    "Cleaning & Chores": "#0891b2",
    "Family Events": "#be185d",
    "Hobbies & Crafts": "#9333ea",
    "Contacts & Info": "#0d9488",
    "Garden & Plants": "#16a34a",
    "Education & Learning": "#2563eb",
    "Technology & Apps": "#6b7280",
    "Travel & Vacation": "#0ea5e9",
    "Home Improvement": "#a16207",
    "Work & Projects": "#4338ca",
    "Party Planning": "#db2777",
    "Pet Care": "#15803d",
    "Kids Activities": "#dc2626",
    "Ideas & Inspiration": "#7c2d12",
};

const hubOptions = [
    { label: " All Hubs", value: "ALL" },
    { label: " Family", value: "FAMILY" },
    { label: " Finance", value: "FINANCE" },
    { label: " Planner", value: "PLANNER" },
    { label: " Health", value: "HEALTH" },
    { label: " Home", value: "HOME" },
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

const getHubIcon = (hub: string): string => {
    const hubIcons: Record<string, string> = {
        ALL: "🌟",
        FAMILY: "",
        FINANCE: "",
        PLANNER: "",
        HEALTH: "",
        HOME: "",
    };
    return hubIcons[hub] || "";
};

const getHubColor = (hub: string): string => {
    const hubColors: Record<string, string> = {
        ALL: "#722ed1",
        FAMILY: "#10b981",
        FINANCE: "#f59e0b",
        PLANNER: "#3b82f6",
        HEALTH: "#ef4444",
        HOME: "#8b5cf6",
    };
    return hubColors[hub] || "#6b7280";
};

const defaultCategories: Category[] = [
    { title: "Important Notes", icon: "📌", items: [], pinned: true },
    { title: "House Rules & Routines", icon: "🏠", items: [], pinned: false },
    { title: "Shopping Lists", icon: "🛒", items: [], pinned: false },
    { title: "Birthday & Gift Ideas", icon: "🎁", items: [], pinned: false },
    { title: "Meal Ideas & Recipes", icon: "🍽", items: [], pinned: false },
];

const categoryIdMap: Record<string, number> = {
    "Important Notes": 1,
    "House Rules & Routines": 3,
    "Shopping Lists": 4,
    "Birthday & Gift Ideas": 5,
    "Meal Ideas & Recipes": 6,
};

const categoryIdMapReverse: Record<number, string> = Object.entries(
    categoryIdMap
).reduce((acc, [title, id]) => {
    acc[id] = title;
    return acc;
}, {} as Record<number, string>);

const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; str.length > i; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, "0")}`;
};

const IntegratedNotes = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [newCategoryModal, setNewCategoryModal] = useState<boolean>(false);
    const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>("");
    const [customCategoryName, setCustomCategoryName] = useState<string>("");
    const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [tempNote, setTempNote] = useState<Note | null>(null);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
    const [currentCategoryTitle, setCurrentCategoryTitle] = useState<string>("");
    const [form] = Form.useForm();
    const [totalNotes, setTotalNotes] = useState<number>(0);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [shareForm] = Form.useForm();
    const [currentShareNote, setCurrentShareNote] = useState<Note | null>(null);

    useEffect(() => {
        fetchCategoriesAndNotes();
    }, []);

    const fetchCategoriesAndNotes = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            console.log("🚀 Fetching all notes and categories...");

            // Fetch from all hubs
            const hubsToFetch = ["FAMILY", "FINANCE", "PLANNER", "HEALTH", "HOME"];

            const [categoriesRes, ...notesResponses] = await Promise.all([
                getNoteCategories(),
                ...hubsToFetch.map(hub => getAllNotes(hub))
            ]);

            console.log("📊 API Responses:", { categoriesRes, notesResponses });

            // Validate API responses
            if (!categoriesRes?.data?.status || categoriesRes.data.status !== 1) {
                throw new Error("Failed to fetch categories");
            }

            const categoriesPayload: ApiCategory[] = categoriesRes.data.payload || [];

            // Combine all notes from all hubs
            const allNotes: ApiNote[] = [];
            hubsToFetch.forEach((hub, index) => {
                const response = notesResponses[index];
                if (response?.data?.status === 1 && response.data.payload) {
                    const hubNotes = response.data.payload.map((note: ApiNote) => ({
                        ...note,
                        hub: hub // Ensure hub is set since backend doesn't return it
                    }));
                    allNotes.push(...hubNotes);
                }
            });

            console.log("📋 Categories:", categoriesPayload);
            console.log("📝 All Notes:", allNotes);

            // Process categories - merge API categories with defaults
            const customCategories: Category[] = categoriesPayload.map((cat) => ({
                title: cat.title,
                icon: cat.icon || "✍",
                items: [],
                category_id: cat.id,
                pinned: cat.pinned === true,
            }));

            const mergedCategories: Category[] = [...customCategories];

            // Add default categories if missing
            defaultCategories.forEach((defCat) => {
                const exists = mergedCategories.some((c) => c.title === defCat.title);
                if (!exists) {
                    mergedCategories.push({ ...defCat });
                }
            });

            // Group notes by category
            const groupedNotes: Record<string, Note[]> = {};

            allNotes.forEach((note) => {
                let catTitle = "Others"; // Default category

                // Try to get category title from mapping
                if (note.category_id && categoryIdMapReverse[note.category_id]) {
                    catTitle = categoryIdMapReverse[note.category_id];
                } else if (note.category_name) {
                    catTitle = note.category_name;
                } else {
                    // Find category by ID in fetched categories
                    const foundCategory = categoriesPayload.find(cat => cat.id === note.category_id);
                    if (foundCategory) {
                        catTitle = foundCategory.title;
                    }
                }

                if (!groupedNotes[catTitle]) {
                    groupedNotes[catTitle] = [];
                }

                const noteItem: Note = {
                    id: note.id,
                    title: note.title,
                    description: note.description,
                    created_at: note.created_at,
                    updated_at: note.updated_at,
                    hub: note.hub || "FAMILY",
                };

                groupedNotes[catTitle].unshift(noteItem);
            });

            console.log("🗂 Grouped Notes:", groupedNotes);

            // Attach notes to categories and sort
            const finalCategories = mergedCategories
                .map((cat) => ({
                    ...cat,
                    items: groupedNotes[cat.title] || [],
                }))
                .sort((a, b) => {
                    // Pinned categories first
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    // Then by number of items (descending)
                    if (b.items.length !== a.items.length) {
                        return b.items.length - a.items.length;
                    }
                    // Finally alphabetically
                    return a.title.localeCompare(b.title);
                });

            console.log("✅ Final Categories:", finalCategories);

            setCategories(finalCategories);
            setTotalNotes(allNotes.length);

            if (allNotes.length === 0) {
                console.log("ℹ No notes found across all hubs");
            }

        } catch (error) {
            console.error("❌ Error fetching data:", error);
            message.error(
                error instanceof Error
                    ? `Failed to load data: ${error.message}`
                    : "Failed to load data. Please try again."
            );
            // Set empty state on error
            setCategories([]);
            setTotalNotes(0);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchCategoriesAndNotes(true);
    };

    const togglePinCategory = async (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPinnedStatus = !category.pinned;
        const categoryId = category.category_id || categoryIdMap[category.title];

        if (!categoryId) {
            message.error("Category ID not found");
            return;
        }

        try {
            const res = await updateNoteCategory({
                id: categoryId,
                pinned: newPinnedStatus,
            });

            if (res.data.status === 1) {
                message.success(`Category ${newPinnedStatus ? 'pinned' : 'unpinned'}`);
                fetchCategoriesAndNotes();
            } else {
                message.error("Failed to update pin status");
            }
        } catch (err) {
            console.error("Error updating pin status:", err);
            message.error("Failed to update pin status");
        }
    };

    const handleStartEdit = (note: Note, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingNoteId(note.id || null);
        setTempNote({ ...note });
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingNoteId(null);
        setTempNote(null);
    };

    const handleTempNoteChange = (field: keyof Note, value: string) => {
        if (tempNote) {
            setTempNote({
                ...tempNote,
                [field]: value,
            });
        }
    };

    const handleSaveEdit = async (noteId: number, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!tempNote || !tempNote.title.trim() || !tempNote.description.trim()) {
            message.error("Please fill in all fields");
            return;
        }

        if (tempNote.description.length > 200) {
            message.error("Description must be 200 characters or less");
            return;
        }

        setLoading(true);
        try {
            const category = categories.find((cat) =>
                cat.items.some((item) => item.id === noteId)
            );

            if (!category) {
                message.error("Category not found");
                return;
            }

            const categoryId = category.category_id || categoryIdMap[category.title];

            const res = await updateNote({
                id: noteId,
                title: tempNote.title,
                description: tempNote.description,
                category_id: categoryId as number,
                hub: tempNote.hub || "FAMILY",
            });

            if (res.data.status === 1) {
                message.success("Note updated successfully");
                await fetchCategoriesAndNotes();
                setEditingNoteId(null);
                setTempNote(null);
            } else {
                message.error("Failed to update note");
            }
        } catch (err) {
            console.error("Error updating note:", err);
            message.error("Failed to update note");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            setLoading(true);
            const res = await deleteNote({ id: noteId });

            if (res.data.status === 1) {
                message.success("Note deleted successfully");
                await fetchCategoriesAndNotes();
            } else {
                message.error("Failed to delete note");
            }
        } catch (err) {
            console.error("Error deleting note:", err);
            message.error("Failed to delete note");
        } finally {
            setLoading(false);
        }
    };

    const handleShareNote = (note: Note, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentShareNote(note);
        setShareModalVisible(true);
        shareForm.resetFields();
    };

    const handleShareSubmit = async () => {
        try {
            const values = await shareForm.validateFields();

            if (!currentShareNote) {
                message.error("No note selected for sharing");
                return;
            }

            setLoading(true);

            const res = await shareNote({
                email: values.email,
                note: {
                    title: currentShareNote.title,
                    description: currentShareNote.description,
                    hub: currentShareNote.hub,
                    created_at: currentShareNote.created_at,
                }
            });
            setShareModalVisible(false);
            shareForm.resetFields();
            setCurrentShareNote(null);

        } catch (err) {
            console.error("Error sharing note:", err);
            message.error("Failed to share note");
        } finally {
            setLoading(false);
        }
    };

    const getNoteActionMenu = (note: Note) => {
        return (
            <Menu>
                <Menu.Item
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        handleStartEdit(note, e.domEvent as any);
                    }}
                >
                    Edit
                </Menu.Item>
                <Menu.Item
                    key="share"
                    icon={<ShareAltOutlined />}
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        handleShareNote(note, e.domEvent as any);
                    }}
                >
                    Share
                </Menu.Item>
                <Menu.Item
                    key="delete"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                    }}
                >
                    <Popconfirm
                        title="Delete Note"
                        description="Are you sure you want to delete this note?"
                        onConfirm={() => handleDeleteNote(note.id!)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        Delete
                    </Popconfirm>
                </Menu.Item>
            </Menu>
        );
    };

    const showAddNoteModal = (categoryId: number, categoryTitle: string) => {
        setCurrentCategoryId(categoryId);
        setCurrentCategoryTitle(categoryTitle);
        setAddNoteModalVisible(true);
        form.resetFields();
        form.setFieldsValue({ hub: "FAMILY" }); // Set default hub
    };

    const handleAddNoteSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (values.description.length > 200) {
                message.error("Description must be 200 characters or less");
                return;
            }

            setLoading(true);
            const user_id = localStorage.getItem("userId") || "";

            if (!currentCategoryId) {
                message.error("Category not selected");
                return;
            }

            // Handle "ALL" hubs option
            if (values.hub === "ALL") {
                const allHubs = ["FAMILY", "FINANCE", "PLANNER", "HEALTH", "HOME"];
                const addNotePromises = allHubs.map(hub =>
                    addNote({
                        title: values.title,
                        description: values.description,
                        category_id: currentCategoryId,
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

                    setAddNoteModalVisible(false);
                    await fetchCategoriesAndNotes();
                    form.resetFields();

                } catch (err) {
                    console.error("Error adding note to all hubs:", err);
                    message.error("Failed to add note to all hubs");
                }
            } else {
                // Handle single hub
                const res = await addNote({
                    title: values.title,
                    description: values.description,
                    category_id: currentCategoryId,
                    user_id,
                    hub: values.hub,
                });

                if (res.data.status === 1) {
                    message.success(`Note added to ${getHubDisplayName(values.hub)} successfully`);
                    setAddNoteModalVisible(false);
                    await fetchCategoriesAndNotes();
                    form.resetFields();
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

    const handleCategorySelection = (value: string) => {
        setSelectedCategoryOption(value);
        if (value !== "Others") {
            setCustomCategoryName("");
        }
    };

    const handleAddCategory = async () => {
        let categoryName = "";
        let categoryIcon = "✍";

        if (selectedCategoryOption === "Others") {
            categoryName = customCategoryName.trim();
            if (!categoryName) {
                message.error("Please enter a custom category name");
                return;
            }
        } else if (selectedCategoryOption) {
            categoryName = selectedCategoryOption;
            const selectedOption = suggestedCategories.find(
                (cat) => cat.value === selectedCategoryOption
            );
            categoryIcon = selectedOption?.icon || "✍";
        } else {
            message.error("Please select a category");
            return;
        }

        if (categories.some((c) => c.title === categoryName)) {
            message.error("Category already exists");
            return;
        }

        setLoading(true);
        try {
            const user_id = localStorage.getItem("userId") || "";
            const res = await addNoteCategory({
                name: categoryName,
                icon: categoryIcon,
                user_id,
            });

            if (res.data.status === 1) {
                message.success("Category added successfully");
                setNewCategoryModal(false);
                setSelectedCategoryOption("");
                setCustomCategoryName("");
                await fetchCategoriesAndNotes();
            } else {
                message.error("Failed to add category");
            }
        } catch (err) {
            console.error("Error adding category:", err);
            message.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.items.some(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const displayedCategories = showAllCategories
        ? filteredCategories
        : filteredCategories.slice(0, 6);

    return (
        <div style={{ minHeight: "100vh", padding: "100px 0", paddingLeft: 0 }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", marginLeft: "60px" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 32,
                    }}
                >
                    <div>
                        <Title level={2} style={{ margin: 0, color: "#333" }}>
                            <FileTextOutlined style={{ marginRight: 12, color: "#1677ff" }} />
                            Notes & Lists
                            {totalNotes > 0 && (
                                <Badge
                                    count={totalNotes}
                                    style={{
                                        backgroundColor: "#1677ff",
                                        marginLeft: 8,
                                        fontSize: 12
                                    }}
                                />
                            )}
                        </Title>
                        <Text style={{ color: "#666", fontSize: 16 }}>
                            Organize your thoughts and keep track of important information across all your hubs
                        </Text>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <Tooltip title="Refresh">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={refreshing}
                                style={{
                                    borderRadius: "12px",
                                }}
                            />
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setNewCategoryModal(true)}
                            style={{
                                borderRadius: "12px",
                                background: "#1890ff",
                                borderColor: "#1890ff",
                                paddingRight: "100"
                            }}
                        >

                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={16}>
                        <Input
                            placeholder="Search categories or notes..."
                            prefix={<SearchOutlined style={{ color: "#999" }} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                borderRadius: 12,
                                height: 44,
                                border: "1px solid #e0e0e0",
                                backgroundColor: "white",
                                fontSize: 14,
                            }}
                        />
                    </Col>
                </Row>

                {/* Loading State */}
                {loading && (
                    <DocklyLoader />
                )}

                {/* Categories Grid */}
                {!loading && (
                    <Row gutter={[20, 20]}>
                        {displayedCategories.map((category, index) => (
                            <Col key={index} xs={24} sm={12} lg={12} xl={8}>
                                <div
                                    style={{
                                        borderRadius: 16,
                                        padding: 20,
                                        border: "1px solid #e0e0e0",
                                        backgroundColor: "white",
                                        cursor: "pointer",
                                        height: 320,
                                        minWidth: 400,
                                        position: "relative",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 12,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                background: `${categoryColorMap[category.title] ||
                                                    stringToColor(category.title)
                                                    }20`,
                                                borderRadius: 14,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                fontSize: 20,
                                            }}
                                        >
                                            {category.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    marginBottom: 4,
                                                    color: "#333",
                                                }}
                                            >
                                                {category.title}
                                                {category.pinned && (
                                                    <PushpinFilled
                                                        style={{
                                                            marginLeft: 8,
                                                            color: "#1677ff",
                                                            fontSize: 12
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div
                                                style={{ display: "flex", alignItems: "center", gap: 6 }}
                                            >
                                                <TagOutlined style={{ fontSize: 12, color: "#999" }} />
                                                <span style={{ color: "#666", fontSize: 12 }}>
                                                    {category.items.length} notes
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 16,
                                            right: 16,
                                            display: "flex",
                                            gap: 8,
                                        }}
                                    >
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showAddNoteModal(
                                                    category.category_id || categoryIdMap[category.title] || 0,
                                                    category.title
                                                );
                                            }}
                                            style={{
                                                borderRadius: "12px",
                                                background: "#1890ff",
                                                borderColor: "#1890ff",
                                            }}
                                        />
                                        <Button
                                            icon={
                                                category.pinned ? <PushpinFilled /> : <PushpinOutlined />
                                            }
                                            onClick={(e) => togglePinCategory(category, e)}
                                            type="text"
                                            style={{
                                                width: 30,
                                                height: 30,
                                                minWidth: 18,
                                                padding: 0,
                                                color: category.pinned ? "#1677ff" : "#999",
                                                borderRadius: 8,
                                            }}
                                        />
                                    </div>

                                    {/* Notes Preview */}
                                    <div style={{ flex: 1, overflow: "hidden", marginBottom: 16 }}>
                                        {category.items.length === 0 ? (

                                            <div
                                                style={{

                                                    textAlign: "center",
                                                    color: "#999",
                                                    height: "100%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <FileTextOutlined
                                                    style={{ fontSize: 24, marginBottom: 8 }}
                                                />
                                                <Text style={{ fontSize: 12, color: "#999" }}>
                                                    No notes yet
                                                </Text>

                                            </div>
                                        ) : (
                                            <div
                                                style={{
                                                    height: "100%",
                                                    overflowY: "auto",
                                                    paddingRight: 4,
                                                }}
                                            >
                                                {category.items.map((note) => (
                                                    <div
                                                        key={note.id}
                                                        style={{
                                                            padding: "8px 12px",
                                                            backgroundColor: "#f8f9fa",
                                                            borderRadius: 8,
                                                            marginBottom: 6,
                                                            fontSize: 12,
                                                            position: "relative",
                                                            border: `1px solid ${getHubColor(note.hub || "FAMILY")}20`,
                                                        }}
                                                        onDoubleClick={(e) => handleStartEdit(note, e)}
                                                    >
                                                        {editingNoteId === note.id ? (
                                                            <div onClick={(e) => e.stopPropagation()}>
                                                                <Input
                                                                    value={tempNote?.title || ""}
                                                                    onChange={(e) =>
                                                                        handleTempNoteChange("title", e.target.value)
                                                                    }
                                                                    style={{ marginBottom: 8 }}
                                                                />
                                                                <Input.TextArea
                                                                    value={tempNote?.description || ""}
                                                                    onChange={(e) =>
                                                                        handleTempNoteChange("description", e.target.value)
                                                                    }
                                                                    maxLength={200}
                                                                    style={{ marginBottom: 8 }}
                                                                    rows={2}
                                                                />
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "flex-end",
                                                                        gap: 8,
                                                                    }}
                                                                >
                                                                    <Button
                                                                        size="small"
                                                                        onClick={(e) => handleCancelEdit(e)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        onClick={(e) => handleSaveEdit(note.id!, e)}
                                                                        loading={loading}
                                                                        disabled={
                                                                            !tempNote?.title.trim() ||
                                                                            !tempNote?.description.trim()
                                                                        }
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "flex-start",
                                                                    }}
                                                                >
                                                                    <div style={{ flex: 1, paddingRight: 8 }}>
                                                                        <div
                                                                            style={{
                                                                                fontWeight: 600,
                                                                                marginBottom: 2,
                                                                                color: "#333"
                                                                            }}
                                                                        >
                                                                            {note.title}
                                                                        </div>
                                                                        <div style={{ color: "#666", lineHeight: 1.4 }}>
                                                                            {note.description.substring(0, 60)}
                                                                            {note.description.length > 60 && "..."}
                                                                        </div>
                                                                        {/* Hub badge */}
                                                                        <div
                                                                            style={{
                                                                                fontSize: 10,
                                                                                marginTop: 4,
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: 4,
                                                                            }}
                                                                        >
                                                                            <span
                                                                                style={{
                                                                                    display: "inline-flex",
                                                                                    alignItems: "center",
                                                                                    gap: 2,
                                                                                    backgroundColor: getHubColor(note.hub || "FAMILY"),
                                                                                    color: "white",
                                                                                    padding: "2px 6px",
                                                                                    borderRadius: 10,
                                                                                    fontSize: 9,
                                                                                    fontWeight: 500,
                                                                                }}
                                                                            >
                                                                                <span style={{ fontSize: 8 }}>
                                                                                    {getHubIcon(note.hub || "FAMILY")}
                                                                                </span>
                                                                                {getHubDisplayName(note.hub || "FAMILY")}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Dropdown
                                                                        overlay={getNoteActionMenu(note)}
                                                                        trigger={["click"]}
                                                                        placement="bottomRight"
                                                                    >
                                                                        <Button
                                                                            type="text"
                                                                            icon={<MoreOutlined />}
                                                                            size="small"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            style={{
                                                                                width: 24,
                                                                                height: 24,
                                                                                minWidth: 24,
                                                                                padding: 0,
                                                                                color: "#999",
                                                                                opacity: 0.7,
                                                                                transition: "all 0.2s ease",
                                                                            }}
                                                                        />
                                                                    </Dropdown>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer with last updated info */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            paddingTop: 12,
                                            borderTop: "1px solid #f0f0f0",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "#999",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                            }}
                                        >
                                            <CalendarOutlined />
                                            {category.items.length > 0 ? (
                                                (() => {
                                                    const latestNote = category.items.reduce((latest, note) => {
                                                        const noteDate = new Date(note.updated_at || note.created_at || 0);
                                                        const latestDate = new Date(latest.updated_at || latest.created_at || 0);
                                                        return noteDate > latestDate ? note : latest;
                                                    });
                                                    return (
                                                        <span>
                                                            Updated: {new Date(latestNote.updated_at || latestNote.created_at || 0).toLocaleDateString()}
                                                        </span>
                                                    );
                                                })()
                                            ) : (
                                                "No activity"
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Show More/Less Button */}
                {!loading && filteredCategories.length > 6 && (
                    <div style={{ textAlign: "center", marginTop: 24 }}>
                        <Button
                            type="text"
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            style={{ color: "#1677ff", fontSize: 14 }}
                        >
                            {showAllCategories
                                ? "Show Less"
                                : `View More (${filteredCategories.length - 6})`}
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredCategories.length === 0 && (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        {searchTerm ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
                                            No results found
                                        </Title>
                                        <Text style={{ color: "#999" }}>
                                            Try adjusting your search criteria
                                        </Text>
                                    </div>
                                }
                            />
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
                                            No notes available
                                        </Title>
                                        <Text style={{ color: "#999" }}>
                                            No notes found across all hubs. Create your first category to get started.
                                        </Text>
                                    </div>
                                }
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setNewCategoryModal(true)}
                                >
                                    Create First Category
                                </Button>
                            </Empty>
                        )}
                    </div>
                )}

                {/* Add Note Modal */}
                <Modal
                    title=
                    {
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>Add New Note to {currentCategoryTitle}</span>
                            <Tooltip title="Select 'All Hubs' to save this note to all 5 hubs simultaneously">
                                <Badge
                                    // count="NEW" 
                                    style={{
                                        backgroundColor: "#722ed1",
                                        fontSize: 10,
                                        height: 16,
                                        lineHeight: "16px",
                                        padding: "0 4px"
                                    }}
                                />
                            </Tooltip>
                        </div>
                    }
                    open={addNoteModalVisible}
                    onCancel={() => {
                        setAddNoteModalVisible(false);
                        form.resetFields();
                    }}
                    onOk={handleAddNoteSubmit}
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
                            name="hub"
                            label={
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span>Hub</span>
                                    <Tooltip title="Choose 'All Hubs' to save this note across all your hubs at once! 🌟">
                                        <span style={{
                                            backgroundColor: "#722ed1",
                                            color: "white",
                                            padding: "2px 6px",
                                            borderRadius: 8,
                                            fontSize: 10,
                                            fontWeight: "bold"
                                        }}>
                                            NEW
                                        </span>
                                    </Tooltip>
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

                {/* Share Note Modal */}
                <Modal
                    title={
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <ShareAltOutlined style={{ color: "#1677ff" }} />
                            <span>Share Note</span>
                        </div>
                    }
                    open={shareModalVisible}
                    onCancel={() => {
                        setShareModalVisible(false);
                        shareForm.resetFields();
                        setCurrentShareNote(null);
                    }}
                    onOk={handleShareSubmit}
                    centered
                    width={500}
                    okText="Share via Email"
                    confirmLoading={loading}
                    destroyOnClose
                >
                    {currentShareNote && (
                        <div style={{ marginBottom: 20 }}>
                            <div
                                style={{
                                    padding: 16,
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: 8,
                                    border: "1px solid #e9ecef",
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: 8, color: "#333" }}>
                                    {currentShareNote.title}
                                </div>
                                <div style={{ color: "#666", marginBottom: 8, lineHeight: 1.4 }}>
                                    {currentShareNote.description}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            backgroundColor: getHubColor(currentShareNote.hub || "FAMILY"),
                                            color: "white",
                                            padding: "4px 8px",
                                            borderRadius: 12,
                                            fontSize: 11,
                                            fontWeight: 500,
                                        }}
                                    >
                                        <span style={{ fontSize: 10 }}>
                                            {getHubIcon(currentShareNote.hub || "FAMILY")}
                                        </span>
                                        {getHubDisplayName(currentShareNote.hub || "FAMILY")}
                                    </span>
                                    <span style={{ fontSize: 11, color: "#999" }}>
                                        Created: {new Date(currentShareNote.created_at || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <Form form={shareForm} layout="vertical">
                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[
                                { required: true, message: "Please enter an email address" },
                                { type: "email", message: "Please enter a valid email address" },
                            ]}
                        >
                            <Input
                                placeholder="Enter recipient's email address"
                                prefix={<MailOutlined style={{ color: "#999" }} />}
                                size="large"
                            />
                        </Form.Item>
                    </Form>

                    <div style={{ fontSize: 12, color: "#666", marginTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                            <span>📧</span>
                            <span>This will open your default email client with the note content</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span>✉</span>
                            <span>You can edit the email before sending</span>
                        </div>
                    </div>
                </Modal>

                {/* New Category Modal */}
                <Modal
                    open={newCategoryModal}
                    onCancel={() => {
                        setNewCategoryModal(false);
                        setSelectedCategoryOption("");
                        setCustomCategoryName("");
                    }}
                    onOk={handleAddCategory}
                    centered
                    width={500}
                    okText="Add Category"
                    closable={false}
                    confirmLoading={loading}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => {
                                setNewCategoryModal(false);
                                setSelectedCategoryOption("");
                                setCustomCategoryName("");
                            }}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleAddCategory}
                            loading={loading}
                        >
                            Add Category
                        </Button>,
                    ]}
                >
                    <div style={{ padding: "24px 0" }}>
                        <Title level={4} style={{ marginBottom: 24, textAlign: "center" }}>
                            Create New Category
                        </Title>

                        <div style={{ marginBottom: 16 }}>
                            <label
                                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                            >
                                Select Category Type:
                            </label>
                            <Select
                                placeholder="Choose a category or select 'Others' for custom"
                                value={selectedCategoryOption}
                                onChange={handleCategorySelection}
                                style={{ width: "100%" }}
                                size="large"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                options={suggestedCategories.filter(
                                    (cat) =>
                                        !categories.some(
                                            (existingCat) => existingCat.title === cat.value
                                        )
                                )}
                            />
                        </div>

                        {selectedCategoryOption === "Others" && (
                            <div style={{ marginBottom: 16 }}>
                                <label
                                    style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                                >
                                    Custom Category Name:
                                </label>
                                <Input
                                    placeholder="Enter your custom category name"
                                    value={customCategoryName}
                                    onChange={(e) => setCustomCategoryName(e.target.value)}
                                    size="large"
                                    style={{ width: "100%" }}
                                />
                            </div>
                        )}

                        {selectedCategoryOption && selectedCategoryOption !== "Others" && (
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: 12,
                                    backgroundColor: "#f6ffed",
                                    border: "1px solid #b7eb8f",
                                    borderRadius: 8,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 20 }}>
                                        {
                                            suggestedCategories.find(
                                                (cat) => cat.value === selectedCategoryOption
                                            )?.icon
                                        }
                                    </span>
                                    <span style={{ fontWeight: 500 }}>
                                        {selectedCategoryOption}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default IntegratedNotes;
