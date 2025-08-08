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
    Checkbox,
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
    getUsersFamilyMembers,
} from "../../../services/family";
import DocklyLoader from "../../../utils/docklyLoader";
import { shareBookmarks } from "../../../services/bookmarks";

const FONT_FAMILY =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Note {
    id?: number;
    title: string;
    description: string;
    created_at?: string;
    updated_at?: string;
    hub?: string;
    hubs?: string[]; // Array of hubs for multi-hub notes
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
    {
        label: "🎓 Education & Learning",
        value: "Education & Learning",
        icon: "🎓",
    },
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

// Unified colors for all categories
const categoryColors = { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };

const hubOptions = [
    { label: " Family", value: "FAMILY" },
    { label: " Finance", value: "FINANCE" },
    { label: " Planner", value: "PLANNER" },
    { label: " Health", value: "HEALTH" },
    { label: " Home", value: "HOME" },
    { label: " None (Utilities)", value: "NONE" },
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

const getHubIcon = (hub: string): string => {
    const hubIcons: Record<string, string> = {
        FAMILY: "",
        FINANCE: "",
        PLANNER: "",
        HEALTH: "",
        HOME: "",
        NONE: "",
    };
    return hubIcons[hub] || "";
};

const getHubColor = (hub: string): string => {
    const hubColors: Record<string, string> = {
        FAMILY: "#eb2f96",
        FINANCE: "#13c2c2",
        PLANNER: "#9254de",
        HEALTH: "#f5222d",
        HOME: "#fa8c16",
        NONE: "#6b7280",
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

const getCategoryColors = (categoryTitle: string) => {
    return categoryColors; // Return same colors for all categories
};

const IntegratedNotes = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [newCategoryModal, setNewCategoryModal] = useState<boolean>(false);
    const [selectedCategoryOption, setSelectedCategoryOption] =
        useState<string>("");
    const [customCategoryName, setCustomCategoryName] = useState<string>("");
    const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [tempNote, setTempNote] = useState<Note | null>(null);
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(
        null
    );
    const [currentCategoryTitle, setCurrentCategoryTitle] = useState<string>("");
    const [form] = Form.useForm();
    const [totalNotes, setTotalNotes] = useState<number>(0);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [shareForm] = Form.useForm();
    const [currentShareNote, setCurrentShareNote] = useState<Note | null>(null);
    const [tagModalVisible, setTagModalVisible] = useState(false);
    const [currentTagItem, setCurrentTagItem] = useState<any>(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [selectedHubs, setSelectedHubs] = useState<string[]>([]);

    useEffect(() => {
        fetchCategoriesAndNotes();
        fetchFamilyMembers();
    }, []);

    const fetchCategoriesAndNotes = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            console.log("🚀 Fetching all notes and categories...");

            // Fetch from all hubs including utilities (NONE)
            const hubsToFetch = [
                "FAMILY",
                "FINANCE",
                "PLANNER",
                "HEALTH",
                "HOME",
                "NONE",
            ];

            const [categoriesRes, ...notesResponses] = await Promise.all([
                getNoteCategories(),
                ...hubsToFetch.map((hub) => getAllNotes(hub)),
            ]);

            console.log("📊 API Responses:", { categoriesRes, notesResponses });

            // Validate API responses
            if (!categoriesRes?.data?.status || categoriesRes.data.status !== 1) {
                throw new Error("Failed to fetch categories");
            }

            const categoriesPayload: ApiCategory[] = categoriesRes.data.payload || [];

            // Combine all notes from all hubs and group by title and description to merge duplicates
            const allNotes: ApiNote[] = [];
            const noteMap = new Map<string, ApiNote & { hubs: string[] }>();

            hubsToFetch.forEach((hub, index) => {
                const response = notesResponses[index];
                if (response?.data?.status === 1 && response.data.payload) {
                    response.data.payload.forEach((note: ApiNote) => {
                        const noteKey = `${note.title}-${note.description}`;

                        if (noteMap.has(noteKey)) {
                            // Add hub to existing note
                            const existingNote = noteMap.get(noteKey)!;
                            if (!existingNote.hubs.includes(hub)) {
                                existingNote.hubs.push(hub);
                            }
                        } else {
                            // Create new note entry
                            noteMap.set(noteKey, {
                                ...note,
                                hub: hub,
                                hubs: [hub],
                            });
                        }
                    });
                }
            });

            // Convert map back to array
            noteMap.forEach((note) => {
                allNotes.push(note);
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
                    const foundCategory = categoriesPayload.find(
                        (cat) => cat.id === note.category_id
                    );
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
                    hub: note.hub || "NONE",
                    hubs: (note as any).hubs || [note.hub || "NONE"],
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

    const fetchFamilyMembers = async () => {
        try {
            const res = await getUsersFamilyMembers({});
            if (res.status) {
                setFamilyMembers(res.payload.members || []);
            }
        } catch (error) {
            message.error("Failed to fetch family members");
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
                message.success(`Category ${newPinnedStatus ? "pinned" : "unpinned"}`);
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
                hub: tempNote.hub || "NONE",
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
                },
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
            <Menu style={{ fontFamily: FONT_FAMILY }}>
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
                    key="tag"
                    icon={<TagOutlined />}
                    onClick={(e: any) => {
                        e.domEvent?.stopPropagation();
                        setCurrentTagItem(note); // or record/item depending on your variable
                        setTagModalVisible(true);
                        setSelectedMemberIds([]);
                    }}
                >
                    Tag
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
        setSelectedHubs([]); // Reset selected hubs
    };

    const handleAddNoteSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (values.description.length > 200) {
                message.error("Description must be 200 characters or less");
                return;
            }

            if (selectedHubs.length === 0) {
                message.error(
                    "Please select at least one hub or choose 'None' for utilities"
                );
                return;
            }

            setLoading(true);
            const user_id = localStorage.getItem("userId") || "";

            if (!currentCategoryId) {
                message.error("Category not selected");
                return;
            }

            try {
                const addNotePromises = selectedHubs.map((hub) =>
                    addNote({
                        title: values.title,
                        description: values.description,
                        category_id: currentCategoryId,
                        user_id,
                        hub: hub,
                    })
                );

                const responses = await Promise.all(addNotePromises);
                const successCount = responses.filter(
                    (res) => res.data.status === 1
                ).length;
                const failureCount = selectedHubs.length - successCount;

                if (successCount === selectedHubs.length) {
                    const hubNames = selectedHubs
                        .map((hub) => getHubDisplayName(hub))
                        .join(", ");
                    message.success(`Note added to ${hubNames} successfully! 📝`);
                } else if (successCount > 0) {
                    message.warning(
                        `Note added to ${successCount} hubs, but failed for ${failureCount} hubs. Please check and try again.`
                    );
                } else {
                    message.error("Failed to add note to any hub");
                    return;
                }

                setAddNoteModalVisible(false);
                await fetchCategoriesAndNotes();
                form.resetFields();
                setSelectedHubs([]);
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

    const handleTagSubmit = async () => {
        if (!currentTagItem || selectedMemberIds.length === 0) {
            message.warning("Please select members to tag.");
            return;
        }

        const taggedMembers = familyMembers.filter((m: any) =>
            selectedMemberIds.includes(m.id)
        );

        const emails = taggedMembers
            .map((m: any) => m.email)
            .filter((email: string) => !!email);

        try {
            setLoading(true);
            for (const email of emails) {
                await shareNote({
                    email, // ✅ string
                    note: {
                        title: currentTagItem.title,
                        description: currentTagItem.description,
                        hub: currentTagItem.hub,
                        created_at: currentTagItem.created_at,
                    },
                });
            }
            message.success("Note tagged successfully!");
            setTagModalVisible(false);
            setCurrentTagItem(null);
            setSelectedMemberIds([]);
        } catch (err) {
            console.error("Tag failed:", err);
            message.error("Failed to tag note.");
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

    const filteredCategories = categories.filter(
        (category) =>
            category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.items.some(
                (note) =>
                    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    note.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    const displayedCategories = showAllCategories
        ? filteredCategories
        : filteredCategories.slice(0, 6);

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "75px 10px 20px 70px",
                fontFamily: FONT_FAMILY,
                maxWidth: "100%",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                    paddingLeft: 0,
                    paddingRight: 0,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                        flexWrap: "wrap",
                        gap: 16,
                    }}
                >
                    <div style={{ flex: 1, minWidth: 300 }}>
                        <Title
                            level={2}
                            style={{
                                margin: 0,
                                color: "#1a1a1a",
                                fontSize: 28,
                                fontFamily: FONT_FAMILY,
                                fontWeight: 600,
                            }}
                        >
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    backgroundColor: "#2563eb",
                                    borderRadius: 12,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 12,
                                    fontSize: 18,
                                }}
                            >
                                📝
                            </div>
                            Notes & Lists
                            {totalNotes > 0 && (
                                <Badge
                                    count={totalNotes}
                                    style={{
                                        backgroundColor: "#2563eb",
                                        marginLeft: 8,
                                        fontSize: 11,
                                    }}
                                />
                            )}
                        </Title>
                        <Text
                            style={{
                                color: "#6b7280",
                                fontSize: 14,
                                fontFamily: FONT_FAMILY,
                                display: "block",
                                marginTop: 4,
                            }}
                        >
                            Organize your life efficiently
                        </Text>
                    </div>
                </div>

                {/* Search Bar and Action Buttons Row */}
                <Row gutter={16} style={{ marginBottom: 16, alignItems: "center" }}>
                    <Col xs={24} sm={24} md={16} lg={18} xl={18}>
                        <Input
                            placeholder="Search categories or notes..."
                            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                borderRadius: 8,
                                height: 40,
                                border: "1px solid #e5e7eb",
                                backgroundColor: "white",
                                fontSize: 14,
                                fontFamily: FONT_FAMILY,
                            }}
                        />
                    </Col>
                    <Col
                        xs={24}
                        sm={24}
                        md={8}
                        lg={6}
                        xl={6}
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                        }}
                    >
                        <Tooltip title="Refresh">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={refreshing}
                                style={{
                                    borderRadius: 8,
                                    height: 40,
                                    border: "1px solid #e5e7eb",
                                    fontFamily: FONT_FAMILY,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            />
                        </Tooltip>
                        <Tooltip title="Add category">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setNewCategoryModal(true)}
                                style={{
                                    borderRadius: 8,
                                    height: 40,
                                    background: "#2563eb",
                                    borderColor: "#4f46e5",
                                    fontFamily: FONT_FAMILY,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            />
                        </Tooltip>
                    </Col>
                </Row>

                {/* Loading State */}
                {loading && <DocklyLoader />}

                {/* Categories Grid */}
                {!loading && (
                    <Row gutter={[16, 16]}>
                        {displayedCategories.map((category, index) => {
                            const colors = getCategoryColors(category.title);
                            return (
                                <Col key={index} xs={24} sm={12} lg={12} xl={8}>
                                    <div
                                        style={{
                                            borderRadius: 12,
                                            padding: 16,
                                            border: `1px solid ${colors.border}`,
                                            backgroundColor: colors.bg,
                                            cursor: "pointer",
                                            height: 280,
                                            position: "relative",
                                            transition: "all 0.2s ease",
                                            display: "flex",
                                            flexDirection: "column",
                                            fontFamily: FONT_FAMILY,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 4px 12px rgba(0,0,0,0.08)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 10,
                                                marginBottom: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    background: "white",
                                                    borderRadius: 10,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    fontSize: 16,
                                                    border: `1px solid ${colors.border}`,
                                                }}
                                            >
                                                {category.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 15,
                                                        marginBottom: 2,
                                                        color: colors.text,
                                                        fontFamily: FONT_FAMILY,
                                                    }}
                                                >
                                                    {category.title}
                                                    {category.pinned && (
                                                        <PushpinFilled
                                                            style={{
                                                                marginLeft: 6,
                                                                color: colors.text,
                                                                fontSize: 11,
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                    }}
                                                >
                                                    <TagOutlined
                                                        style={{ fontSize: 11, color: "#9ca3af" }}
                                                    />
                                                    <span
                                                        style={{
                                                            color: "#6b7280",
                                                            fontSize: 11,
                                                            fontFamily: FONT_FAMILY,
                                                        }}
                                                    >
                                                        {category.items.length} notes
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 12,
                                                right: 12,
                                                display: "flex",
                                                gap: 6,
                                            }}
                                        >
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showAddNoteModal(
                                                        category.category_id ||
                                                        categoryIdMap[category.title] ||
                                                        0,
                                                        category.title
                                                    );
                                                }}
                                                style={{
                                                    borderRadius: 6,
                                                    background: "#2563eb",
                                                    borderColor: "#2563eb",
                                                    fontSize: 11,
                                                    height: 28,
                                                    width: 28,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: 0,
                                                }}
                                            />
                                            <Button
                                                icon={
                                                    category.pinned ? (
                                                        <PushpinFilled />
                                                    ) : (
                                                        <PushpinOutlined />
                                                    )
                                                }
                                                onClick={(e) => togglePinCategory(category, e)}
                                                type="text"
                                                size="small"
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    minWidth: 28,
                                                    padding: 0,
                                                    color: category.pinned ? colors.text : "#9ca3af",
                                                    borderRadius: 6,
                                                    fontSize: 11,
                                                }}
                                            />
                                        </div>

                                        {/* Notes Preview */}
                                        <div
                                            style={{ flex: 1, overflow: "hidden", marginBottom: 12 }}
                                        >
                                            {category.items.length === 0 ? (
                                                <div
                                                    style={{
                                                        textAlign: "center",
                                                        color: "#9ca3af",
                                                        height: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <FileTextOutlined
                                                        style={{ fontSize: 20, marginBottom: 6 }}
                                                    />
                                                    <Text
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#9ca3af",
                                                            fontFamily: FONT_FAMILY,
                                                        }}
                                                    >
                                                        No notes yet
                                                    </Text>
                                                </div>
                                            ) : (
                                                <div
                                                    style={{
                                                        height: "100%",
                                                        overflowY: "auto",
                                                        paddingRight: 2,
                                                    }}
                                                >
                                                    {category.items.map((note) => (
                                                        <div
                                                            key={note.id}
                                                            style={{
                                                                padding: "8px 10px",
                                                                backgroundColor: "rgba(255,255,255,0.8)",
                                                                borderRadius: 6,
                                                                marginBottom: 4,
                                                                fontSize: 11,
                                                                position: "relative",
                                                                border: `1px solid #e5e7eb`,
                                                                fontFamily: FONT_FAMILY,
                                                            }}
                                                            onDoubleClick={(e) => handleStartEdit(note, e)}
                                                        >
                                                            {editingNoteId === note.id ? (
                                                                <div onClick={(e) => e.stopPropagation()}>
                                                                    <Input
                                                                        value={tempNote?.title || ""}
                                                                        onChange={(e) =>
                                                                            handleTempNoteChange(
                                                                                "title",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        style={{
                                                                            marginBottom: 6,
                                                                            fontSize: 11,
                                                                            fontFamily: FONT_FAMILY,
                                                                        }}
                                                                        size="small"
                                                                    />
                                                                    <Input.TextArea
                                                                        value={tempNote?.description || ""}
                                                                        onChange={(e) =>
                                                                            handleTempNoteChange(
                                                                                "description",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        maxLength={200}
                                                                        style={{
                                                                            marginBottom: 6,
                                                                            fontSize: 11,
                                                                            fontFamily: FONT_FAMILY,
                                                                        }}
                                                                        rows={2}
                                                                    />
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            justifyContent: "flex-end",
                                                                            gap: 6,
                                                                        }}
                                                                    >
                                                                        <Button
                                                                            size="small"
                                                                            onClick={(e) => handleCancelEdit(e)}
                                                                            style={{
                                                                                fontSize: 10,
                                                                                fontFamily: FONT_FAMILY,
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            type="primary"
                                                                            size="small"
                                                                            onClick={(e) =>
                                                                                handleSaveEdit(note.id!, e)
                                                                            }
                                                                            loading={loading}
                                                                            disabled={
                                                                                !tempNote?.title.trim() ||
                                                                                !tempNote?.description.trim()
                                                                            }
                                                                            style={{
                                                                                fontSize: 10,
                                                                                fontFamily: FONT_FAMILY,
                                                                            }}
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
                                                                        <div style={{ flex: 1, paddingRight: 6 }}>
                                                                            <div
                                                                                style={{
                                                                                    fontWeight: 600,
                                                                                    marginBottom: 2,
                                                                                    color: "#374151",
                                                                                    fontFamily: FONT_FAMILY,
                                                                                    fontSize: 11,
                                                                                }}
                                                                            >
                                                                                {note.title}
                                                                            </div>
                                                                            <div
                                                                                style={{
                                                                                    color: "#6b7280",
                                                                                    lineHeight: 1.3,
                                                                                    fontFamily: FONT_FAMILY,
                                                                                    fontSize: 10,
                                                                                    marginBottom: 4,
                                                                                }}
                                                                            >
                                                                                {note.description.substring(0, 50)}
                                                                                {note.description.length > 50 && "..."}
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
                                                                                    width: 20,
                                                                                    height: 20,
                                                                                    minWidth: 20,
                                                                                    padding: 0,
                                                                                    color: "#070707ff",
                                                                                    opacity: 0.7,
                                                                                    transition: "all 0.2s ease",
                                                                                    fontSize: 13,
                                                                                }}
                                                                            />
                                                                        </Dropdown>
                                                                    </div>

                                                                    {/* Hub badges at the bottom */}
                                                                    <div
                                                                        style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 3,
                                                                            flexWrap: "wrap",
                                                                            marginTop: 4,
                                                                            justifyContent: "flex-start",
                                                                        }}
                                                                    >
                                                                        {note.hubs && note.hubs.length > 0 ? (
                                                                            note.hubs.map((hub) => (
                                                                                <span
                                                                                    key={hub}
                                                                                    style={{
                                                                                        display: "inline-flex",
                                                                                        alignItems: "center",
                                                                                        gap: 2,
                                                                                        backgroundColor: getHubColor(hub),
                                                                                        color: "white",
                                                                                        padding: "2px 5px",
                                                                                        borderRadius: 8,
                                                                                        fontSize: 8,
                                                                                        fontWeight: 500,
                                                                                        fontFamily: FONT_FAMILY,
                                                                                    }}
                                                                                >
                                                                                    <span style={{ fontSize: 7 }}>
                                                                                        {getHubIcon(hub)}
                                                                                    </span>
                                                                                    {getHubDisplayName(hub)}
                                                                                </span>
                                                                            ))
                                                                        ) : (
                                                                            <span
                                                                                style={{
                                                                                    display: "inline-flex",
                                                                                    alignItems: "center",
                                                                                    gap: 2,
                                                                                    backgroundColor: getHubColor(
                                                                                        note.hub || "NONE"
                                                                                    ),
                                                                                    color: "white",
                                                                                    padding: "2px 5px",
                                                                                    borderRadius: 8,
                                                                                    fontSize: 8,
                                                                                    fontWeight: 500,
                                                                                    fontFamily: FONT_FAMILY,
                                                                                }}
                                                                            >
                                                                                <span style={{ fontSize: 7 }}>
                                                                                    {getHubIcon(note.hub || "NONE")}
                                                                                </span>
                                                                                {getHubDisplayName(note.hub || "NONE")}
                                                                            </span>
                                                                        )}
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
                                                paddingTop: 8,
                                                borderTop: `1px solid ${colors.border}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 9,
                                                    color: "#9ca3af",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 3,
                                                    fontFamily: FONT_FAMILY,
                                                }}
                                            >
                                                <CalendarOutlined style={{ fontSize: 9 }} />
                                                {category.items.length > 0
                                                    ? (() => {
                                                        const latestNote = category.items.reduce(
                                                            (latest, note) => {
                                                                const noteDate = new Date(
                                                                    note.updated_at || note.created_at || 0
                                                                );
                                                                const latestDate = new Date(
                                                                    latest.updated_at || latest.created_at || 0
                                                                );
                                                                return noteDate > latestDate ? note : latest;
                                                            }
                                                        );
                                                        return (
                                                            <span>
                                                                Updated:{" "}
                                                                {new Date(
                                                                    latestNote.updated_at ||
                                                                    latestNote.created_at ||
                                                                    0
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        );
                                                    })()
                                                    : "No activity"}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {/* Show More/Less Button */}
                {!loading && filteredCategories.length > 6 && (
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                        <Button
                            type="text"
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            style={{
                                color: "#4f46e5",
                                fontSize: 13,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            {showAllCategories
                                ? "Show Less"
                                : `View More (${filteredCategories.length - 6})`}
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredCategories.length === 0 && (
                    <div style={{ textAlign: "center", padding: 40 }}>
                        {searchTerm ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <Title
                                            level={3}
                                            style={{
                                                color: "#9ca3af",
                                                marginBottom: 6,
                                                fontFamily: FONT_FAMILY,
                                                fontSize: 18,
                                            }}
                                        >
                                            No results found
                                        </Title>
                                        <Text
                                            style={{
                                                color: "#9ca3af",
                                                fontFamily: FONT_FAMILY,
                                                fontSize: 13,
                                            }}
                                        >
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
                                        <Title
                                            level={3}
                                            style={{
                                                color: "#9ca3af",
                                                marginBottom: 6,
                                                fontFamily: FONT_FAMILY,
                                                fontSize: 18,
                                            }}
                                        >
                                            No notes available
                                        </Title>
                                        <Text
                                            style={{
                                                color: "#9ca3af",
                                                fontFamily: FONT_FAMILY,
                                                fontSize: 13,
                                            }}
                                        >
                                            No notes found across all hubs. Create your first category
                                            to get started.
                                        </Text>
                                    </div>
                                }
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setNewCategoryModal(true)}
                                    style={{
                                        fontFamily: FONT_FAMILY,
                                        borderRadius: 8,
                                    }}
                                >
                                    Create First Category
                                </Button>
                            </Empty>
                        )}
                    </div>
                )}

                {/* Add Note Modal */}
                <Modal
                    title={
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            <span>Add New Note to {currentCategoryTitle}</span>
                        </div>
                    }
                    open={addNoteModalVisible}
                    onCancel={() => {
                        setAddNoteModalVisible(false);
                        form.resetFields();
                        setSelectedHubs([]);
                    }}
                    onOk={handleAddNoteSubmit}
                    centered
                    width={500}
                    okText="Add Note"
                    confirmLoading={loading}
                    destroyOnClose
                    style={{ fontFamily: FONT_FAMILY }}
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
                            <Input
                                placeholder="Enter note title"
                                style={{ fontFamily: FONT_FAMILY }}
                            />
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
                                style={{ fontFamily: FONT_FAMILY }}
                            />
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
                                style={{
                                    width: "100%",
                                    fontFamily: FONT_FAMILY,
                                }}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "#6b7280",
                                    marginTop: 8,
                                    fontFamily: FONT_FAMILY,
                                    padding: "8px 12px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: 6,
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                💡 <strong>Multi-Hub Support:</strong> Select multiple hubs to
                                add this note across all selected hubs simultaneously!
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Share Note Modal */}
                <Modal
                    title={
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            <ShareAltOutlined style={{ color: "#4f46e5" }} />
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
                    width={450}
                    okText="Share via Email"
                    confirmLoading={loading}
                    destroyOnClose
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    {currentShareNote && (
                        <div style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    padding: 12,
                                    backgroundColor: "#f8fafc",
                                    borderRadius: 8,
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        marginBottom: 6,
                                        color: "#1e293b",
                                        fontFamily: FONT_FAMILY,
                                        fontSize: 13,
                                    }}
                                >
                                    {currentShareNote.title}
                                </div>
                                <div
                                    style={{
                                        color: "#64748b",
                                        marginBottom: 6,
                                        lineHeight: 1.4,
                                        fontFamily: FONT_FAMILY,
                                        fontSize: 12,
                                    }}
                                >
                                    {currentShareNote.description}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {currentShareNote.hubs && currentShareNote.hubs.length > 0 ? (
                                        currentShareNote.hubs.map((hub) => (
                                            <span
                                                key={hub}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 3,
                                                    backgroundColor: getHubColor(hub),
                                                    color: "white",
                                                    padding: "3px 6px",
                                                    borderRadius: 10,
                                                    fontSize: 10,
                                                    fontWeight: 500,
                                                    fontFamily: FONT_FAMILY,
                                                }}
                                            >
                                                <span style={{ fontSize: 9 }}>{getHubIcon(hub)}</span>
                                                {getHubDisplayName(hub)}
                                            </span>
                                        ))
                                    ) : (
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 3,
                                                backgroundColor: getHubColor(
                                                    currentShareNote.hub || "NONE"
                                                ),
                                                color: "white",
                                                padding: "3px 6px",
                                                borderRadius: 10,
                                                fontSize: 10,
                                                fontWeight: 500,
                                                fontFamily: FONT_FAMILY,
                                            }}
                                        >
                                            <span style={{ fontSize: 9 }}>
                                                {getHubIcon(currentShareNote.hub || "NONE")}
                                            </span>
                                            {getHubDisplayName(currentShareNote.hub || "NONE")}
                                        </span>
                                    )}
                                    <span
                                        style={{
                                            fontSize: 10,
                                            color: "#9ca3af",
                                            fontFamily: FONT_FAMILY,
                                        }}
                                    >
                                        Created:{" "}
                                        {new Date(
                                            currentShareNote.created_at || Date.now()
                                        ).toLocaleDateString()}
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
                                {
                                    type: "email",
                                    message: "Please enter a valid email address",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Enter recipient's email address"
                                prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                                style={{ fontFamily: FONT_FAMILY }}
                            />
                        </Form.Item>
                    </Form>

                    <div
                        style={{
                            fontSize: 11,
                            color: "#64748b",
                            marginTop: 12,
                            fontFamily: FONT_FAMILY,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                marginBottom: 3,
                            }}
                        >
                            <span>📧</span>
                            <span>
                                This will open your default email client with the note content
                            </span>
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
                    width={450}
                    okText="Add Category"
                    closable={false}
                    confirmLoading={loading}
                    style={{ fontFamily: FONT_FAMILY }}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => {
                                setNewCategoryModal(false);
                                setSelectedCategoryOption("");
                                setCustomCategoryName("");
                            }}
                            style={{ fontFamily: FONT_FAMILY }}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleAddCategory}
                            loading={loading}
                            style={{ fontFamily: FONT_FAMILY }}
                        >
                            Add Category
                        </Button>,
                    ]}
                >
                    <div style={{ padding: "20px 0" }}>
                        <Title
                            level={4}
                            style={{
                                marginBottom: 20,
                                textAlign: "center",
                                fontFamily: FONT_FAMILY,
                                fontSize: 16,
                            }}
                        >
                            Create New Category
                        </Title>

                        <div style={{ marginBottom: 12 }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: 6,
                                    fontWeight: 500,
                                    fontFamily: FONT_FAMILY,
                                    fontSize: 13,
                                }}
                            >
                                Select Category Type:
                            </label>
                            <Select
                                placeholder="Choose a category or select 'Others' for custom"
                                value={selectedCategoryOption}
                                onChange={handleCategorySelection}
                                style={{ width: "100%", fontFamily: FONT_FAMILY }}
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
                            <div style={{ marginBottom: 12 }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: 6,
                                        fontWeight: 500,
                                        fontFamily: FONT_FAMILY,
                                        fontSize: 13,
                                    }}
                                >
                                    Custom Category Name:
                                </label>
                                <Input
                                    placeholder="Enter your custom category name"
                                    value={customCategoryName}
                                    onChange={(e) => setCustomCategoryName(e.target.value)}
                                    style={{ width: "100%", fontFamily: FONT_FAMILY }}
                                />
                            </div>
                        )}

                        {selectedCategoryOption && selectedCategoryOption !== "Others" && (
                            <div
                                style={{
                                    marginTop: 12,
                                    padding: 10,
                                    backgroundColor: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 8,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 16 }}>
                                        {
                                            suggestedCategories.find(
                                                (cat) => cat.value === selectedCategoryOption
                                            )?.icon
                                        }
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: 500,
                                            fontFamily: FONT_FAMILY,
                                            fontSize: 13,
                                        }}
                                    >
                                        {selectedCategoryOption}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>

                <Modal
                    title="Tag Item"
                    open={tagModalVisible}
                    onCancel={() => {
                        setTagModalVisible(false);
                        setCurrentTagItem(null);
                        setSelectedMemberIds([]);
                    }}
                    onOk={handleTagSubmit}
                    okText="Tag"
                    centered
                    confirmLoading={loading}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    {currentTagItem && (
                        <div style={{ marginBottom: 16 }}>
                            <div
                                style={{
                                    padding: 10,
                                    backgroundColor: "#f8fafc",
                                    borderRadius: 6,
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontFamily: FONT_FAMILY,
                                        fontSize: 13,
                                    }}
                                >
                                    {currentTagItem?.title || "Untitled"}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#64748b",
                                        fontFamily: FONT_FAMILY,
                                    }}
                                >
                                    {currentTagItem?.url}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontFamily: FONT_FAMILY,
                                fontSize: 13,
                            }}
                        >
                            Tag to Family Members:
                        </label>
                        <Select
                            mode="multiple"
                            style={{ width: "100%", fontFamily: FONT_FAMILY }}
                            placeholder="Select members"
                            value={selectedMemberIds}
                            onChange={setSelectedMemberIds}
                        >
                            {familyMembers
                                .filter((m: any) => m.relationship !== "me")
                                .map((member: any) => (
                                    <Select.Option key={member.id} value={member.id}>
                                        {member.name} ({member.relationship})
                                    </Select.Option>
                                ))}
                        </Select>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default IntegratedNotes;
