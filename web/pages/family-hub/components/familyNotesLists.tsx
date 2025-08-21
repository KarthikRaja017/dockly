"use client";
import {
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    MoreOutlined,
    DeleteOutlined,
    ShareAltOutlined,
    TagOutlined,
    MailOutlined,
    DownOutlined,
    UpOutlined,
    PushpinOutlined,
    PushpinFilled,
} from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Typography, Form, Dropdown, Avatar, Empty, Card, Space, Tag, Popconfirm } from "antd";
import { useState, useEffect } from "react";
import {
    getAllNotes,
    updateNote,
    addNote,
    addNoteCategory,
    getNoteCategories,
    updateNoteCategory,
    deleteNoteCategory,
    deleteNote,
    shareNote,
    getUsersFamilyMembers,
} from "../../../services/family";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../../app/userContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface Note {
    title: string;
    description: string;
    created_at?: string;
    updated_at?: string;
    id?: number;
    hub?: string;
    hubs?: string[];
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
    hub?: string;
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

interface NotesListsProps {
    currentHub?: string;
    showAllHubs?: boolean;
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
    "Budget & Finance": "#af630bff",
    "Health & Medical": "#9f0aaaff", 
    "Car & Maintenance": "#fa541c",
    "Goals & Plans": "#52c41a",
    "Books & Movies": "#2c0447ff",
    "Fitness & Exercise": "#13c2c2",
    "Cleaning & Chores": "#a01010ff",
    "Family Events": "#eb2f96",
    "Hobbies & Crafts": "#8b5cf6",
    "Contacts & Info": "#3a1e1eff",
    "Garden & Plants": "#10b981",
    "Education & Learning": "#2563eb",
    "Technology & Apps": "#ec4899",
    "Travel & Vacation": "#f97316",
    "Home Improvement": "#dc2626",
    "Work & Projects": "#7c3aed",
    "Party Planning": "#059669",
    "Pet Care": "#ea580c",
    "Kids Activities": "#0891b2",
    "Ideas & Inspiration": "#be185d",
    "Others": "#6b7280",
};

const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, "0")}`;
};

const getHubDisplayName = (hub: string): string => {
    const hubNames: Record<string, string> = {
        family: "Family",
        finance: "Finance",
        planner: "Planner",
        health: "Health",
        home: "Home",
    };
    return hubNames[hub] || hub.charAt(0).toUpperCase() + hub.slice(1);
};

const getHubColor = (hub: string): string => {
    const hubColors: Record<string, string> = {
        family: "#eb2f96",
        finance: "#13c2c2",
        planner: "#9254de",
        health: "#f5222d",
        home: "#fa8c16",
    };
    return hubColors[hub] || "#6b7280";
};

const NotesLists: React.FC<NotesListsProps> = ({
    currentHub,
    showAllHubs = false,
}) => {
    const [activeHub, setActiveHub] = useState<string>(currentHub || "family");
    const router = useRouter();
    const username = useCurrentUser()?.user_name || "";

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    
    // Note form states
    const [showNoteForm, setShowNoteForm] = useState<string | null>(null);
    const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
    const [editingNote, setEditingNote] = useState<{ note: Note; categoryId: string } | null>(null);
    
    // Combined modal states
    const [combinedModalVisible, setCombinedModalVisible] = useState(false);
    const [categoryType, setCategoryType] = useState<"existing" | "new">("existing");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>("");
    const [customCategoryName, setCustomCategoryName] = useState<string>("");
    
    const [form] = Form.useForm();
    
    // Modal states
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [shareForm] = Form.useForm();
    const [currentShareNote, setCurrentShareNote] = useState<Note | null>(null);
    const [tagModalVisible, setTagModalVisible] = useState(false);
    const [currentTagItem, setCurrentTagItem] = useState<any>(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    useEffect(() => {
        fetchCategoriesAndNotes();
        fetchFamilyMembers();
    }, [activeHub, showAllHubs]);

    useEffect(() => {
        if (!currentHub) {
            const getCurrentHub = (): string => {
                if (typeof window !== "undefined") {
                    const path = window.location.pathname;
                    const hubMatch = path.match(/\/(family|finance|planner|health|home)/);
                    if (hubMatch) return hubMatch[1];

                    const urlParams = new URLSearchParams(window.location.search);
                    const hubFromParams = urlParams.get("hub");
                    if (
                        hubFromParams &&
                        ["family", "finance", "planner", "health", "home"].includes(hubFromParams)
                    )
                        return hubFromParams;

                    const storedHub = localStorage.getItem("currentHub");
                    if (
                        storedHub &&
                        ["family", "finance", "planner", "health", "home"].includes(storedHub)
                    )
                        return storedHub;
                }
                return "family";
            };
            setActiveHub(getCurrentHub());
        }
    }, [currentHub]);

    const fetchCategoriesAndNotes = async () => {
        try {
            setLoading(true);
            const [categoriesRes, notesRes] = await Promise.all([
                getNoteCategories(),
                getAllNotes(showAllHubs ? "ALL" : activeHub.toUpperCase()),
            ]);

            const categoriesPayload: ApiCategory[] = categoriesRes.data.payload;
            const rawNotes: ApiNote[] = notesRes.data.payload;

            // Build categories from API only - NO DEFAULT CATEGORIES
            const customCategories: Category[] = categoriesPayload.map((cat) => ({
                title: cat.title,
                icon: cat.icon || "✍",
                items: [],
                category_id: cat.id,
                pinned: cat.pinned === true,
            }));

            // Process notes and group by category
            const groupedNotes: Record<string, Note[]> = {};
            rawNotes.forEach((note) => {
                let catTitle = "Others";
                
                // Find category by ID first
                const foundCategory = categoriesPayload.find(cat => cat.id === note.category_id);
                if (foundCategory) {
                    catTitle = foundCategory.title;
                } else if (note.category_name) {
                    catTitle = note.category_name;
                }

                if (!groupedNotes[catTitle]) groupedNotes[catTitle] = [];

                const noteItem: Note = {
                    id: note.id,
                    title: note.title,
                    description: note.description,
                    created_at: note.created_at,
                    updated_at: note.updated_at,
                    hub: note.hub || activeHub.toUpperCase(),
                };

                if (showAllHubs) {
                    (noteItem as any).hub = note.hub || "FAMILY";
                }

                groupedNotes[catTitle].unshift(noteItem);
            });

            // Attach notes to categories and sort
            const finalCategories = customCategories
                .map((cat) => ({
                    ...cat,
                    items: groupedNotes[cat.title] || [],
                }))
                .filter(cat => cat.items.length > 0 || cat.pinned) // Only show categories with notes or pinned ones
                .sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    return a.title.localeCompare(b.title);
                });

            setCategories(finalCategories);
        } catch (err) {
            message.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchFamilyMembers = async () => {
        try {
            const res = await getUsersFamilyMembers({});
            if (res.status) {
                setFamilyMembers(res.payload.members || []);
            }
        } catch (error) {
            console.error("Failed to fetch family members:", error);
        }
    };

    // Pin/Unpin Category functionality
    const togglePinCategory = async (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPinnedStatus = !category.pinned;
        const categoryId = category.category_id;

        if (!categoryId) {
            message.error("Category ID not found");
            return;
        }

        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    // Delete Category functionality
    const handleDeleteNoteCategory = async (category: Category) => {
        const categoryId = category.category_id;

        if (!categoryId) {
            message.error("Category ID not found");
            return;
        }

        try {
            setLoading(true);

            const res = await deleteNoteCategory({ id: categoryId });

            if (res?.data?.status === 1) {
                message.success(
                    `Category "${category.title}" and its notes deleted successfully`
                );
                await fetchCategoriesAndNotes();
            } else {
                message.error(res?.data?.message || "Failed to delete category");
            }
        } catch (err) {
            console.error("Error deleting category:", err);
            message.error("Failed to delete category");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleExpand = (categoryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            setLoading(true);
            const res = await deleteNote({ id: noteId });

            if (res?.data?.status === 1) {
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
                    hub: currentShareNote.hub || activeHub.toUpperCase(),
                    created_at: currentShareNote.created_at,
                },
            });

            if (res?.data?.status === 1) {
                message.success("Note shared successfully!");
            } else {
                message.error("Failed to share note");
            }
            
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
                    email,
                    note: {
                        title: currentTagItem.title,
                        description: currentTagItem.description,
                        hub: currentTagItem.hub || activeHub.toUpperCase(),
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

    const getNoteActionMenu = (note: Note) => ({
        items: [
            {
                key: "edit",
                icon: <EditOutlined />,
                label: "Edit",
                onClick: () => {
                    const category = categories.find(cat => cat.items.some(item => item.id === note.id));
                    if (category) {
                        setEditingNote({ note, categoryId: String(category.category_id) });
                        setNewNote({ ...note });
                        setShowNoteForm(String(category.category_id));
                    }
                },
            },
            {
                key: "share",
                icon: <ShareAltOutlined />,
                label: "Share",
                onClick: (e: { domEvent: any }) =>
                    handleShareNote(note, e.domEvent as any),
            },
            {
                key: "tag",
                icon: <TagOutlined />,
                label: "Tag",
                onClick: (e: { domEvent: any }) => {
                    e.domEvent?.stopPropagation();
                    setCurrentTagItem(note);
                    setTagModalVisible(true);
                    setSelectedMemberIds([]);
                },
            },
            {
                type: "divider" as const,
            },
            {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Delete",
                danger: true,
                onClick: () => handleDeleteNote(note.id!),
            },
        ],
    });

    const handleSaveNote = async (categoryId: string) => {
        const category = categories.find(cat => String(cat.category_id) === categoryId);
        if (!category) return;

        if (!newNote.title.trim() || !newNote.description.trim()) {
            message.error("Please fill in all fields");
            return;
        }

        if (newNote.description.length > 200) {
            message.error("Description must be 200 characters or less");
            return;
        }

        setLoading(true);
        try {
            if (editingNote) {
                // Editing existing note
                const res = await updateNote({
                    id: editingNote.note.id!,
                    title: newNote.title,
                    description: newNote.description,
                    category_id: category.category_id as number,
                    hub: activeHub.toUpperCase(),
                });

                if (res.data.status === 1) {
                    message.success("Note updated");
                    await fetchCategoriesAndNotes();
                }
            } else {
                // Adding new note
                const user_id = localStorage.getItem("userId") || "";

                const res = await addNote({
                    title: newNote.title,
                    description: newNote.description,
                    category_id: category.category_id as number,
                    user_id,
                    hub: activeHub.toUpperCase(),
                });

                if (res.data.status === 1) {
                    message.success(
                        showAllHubs
                            ? "Note added"
                            : `Note added to ${getHubDisplayName(activeHub)} 📝`
                    );
                    await fetchCategoriesAndNotes();
                }
            }

            setShowNoteForm(null);
            setEditingNote(null);
            setNewNote({ title: "", description: "" });
        } catch (err) {
            message.error("Something went wrong");
        }

        setLoading(false);
    };

    const handleCancelNoteForm = () => {
        setShowNoteForm(null);
        setEditingNote(null);
        setNewNote({ title: "", description: "" });
    };

    // Combined Modal Functions
    const showCombinedModal = (categoryId?: number) => {
        if (categoryId) {
            setCategoryType("existing");
            setSelectedCategoryId(categoryId);
        } else {
            setCategoryType("new");
            setSelectedCategoryId(null);
        }
        setCombinedModalVisible(true);
        form.resetFields();
        setSelectedCategoryOption("");
        setCustomCategoryName("");
    };

    const handleCategorySelection = (value: string) => {
        setSelectedCategoryOption(value);
        if (value !== "Others") {
            setCustomCategoryName("");
        }
    };

    const handleCombinedSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (values.description.length > 200) {
                message.error("Description must be 200 characters or less");
                return;
            }

            setLoading(true);
            const user_id = localStorage.getItem("userId") || "";
            let categoryId = selectedCategoryId;

            // Create new category if needed
            if (categoryType === "new") {
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

                try {
                    const categoryRes = await addNoteCategory({
                        name: categoryName,
                        icon: categoryIcon,
                        user_id,
                    });

                    if (categoryRes.data.status === 1) {
                        categoryId = categoryRes.data.payload.id;
                        message.success("Category created successfully");
                    } else {
                        message.error("Failed to create category");
                        return;
                    }
                } catch (err) {
                    console.error("Error creating category:", err);
                    message.error("Failed to create category");
                    return;
                }
            }

            if (!categoryId) {
                message.error("Category not selected");
                return;
            }

            // Add note to current hub
            try {
                const res = await addNote({
                    title: values.title,
                    description: values.description,
                    category_id: categoryId,
                    user_id,
                    hub: activeHub.toUpperCase(),
                });

                if (res.data.status === 1) {
                    message.success(
                        showAllHubs
                            ? "Note added successfully! 📝"
                            : `Note added to ${getHubDisplayName(activeHub)} 📝`
                    );
                    setCombinedModalVisible(false);
                    await fetchCategoriesAndNotes();
                    form.resetFields();
                    setSelectedCategoryOption("");
                    setCustomCategoryName("");
                } else {
                    message.error("Failed to add note");
                }
            } catch (err) {
                console.error("Error adding note:", err);
                message.error("Failed to add note");
            }
        } catch (err) {
            console.error("Error in combined submit:", err);
            message.error("Failed to process request");
        } finally {
            setLoading(false);
        }
    };

    const handleViewMoreClick = () => {
        router.push(`/${username}/notes`);
    };

    return (
        <div style={{ fontFamily: FONT_FAMILY }}>
            <Card
                style={{
                    padding: 0,
                    backgroundColor: "#ffffff",
                    width: 380,
                    borderRadius: 12,
                    position: "relative",
                    height: "360px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    flexDirection: "column",
                }}
                bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                    height: "100%",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar
                            style={{
                                backgroundColor: "#1890ff",
                                color: "#fff",
                                fontSize: "18px",
                            }}
                            size={40}
                            icon={<FileTextOutlined />}
                        />
                        <div>
                            <Title
                                level={4}
                                style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    color: "#262626",
                                    fontFamily: FONT_FAMILY,
                                }}
                            >
                                Notes & Lists
                            </Title>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: "13px",
                                    fontFamily: FONT_FAMILY,
                                }}
                            >
                                {categories.length} categories •{" "}
                                {showAllHubs ? "All Hubs" : `${getHubDisplayName(activeHub)} Hub`}
                            </Text>
                        </div>
                    </div>

                    <Button
                        type="primary"
                        shape="default"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => showCombinedModal()}
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
                </div>

                {/* Scrollable Content */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        paddingRight: "6px",
                    }}
                >
                    {categories.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <Empty
                                description={
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            color: "#999",
                                            fontFamily: FONT_FAMILY,
                                        }}
                                    >
                                        No Notes yet. Add your first Note to get started!
                                    </span>
                                }
                            />
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {categories.map((category) => {
                                const categoryId = String(category.category_id);
                                const isExpanded = expandedCategories.has(categoryId);

                                return (
                                    <div
                                        key={categoryId}
                                        style={{
                                            backgroundColor: "#fafafa",
                                            borderRadius: "12px",
                                            border: "1px solid #f0f0f0",
                                            transition: "all 0.2s ease",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Simplified Category Header */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "10px 12px",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.parentElement!.style.backgroundColor = "#f5f5f5";
                                                e.currentTarget.parentElement!.style.borderColor = "#d9d9d9";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.parentElement!.style.backgroundColor = "#fafafa";
                                                e.currentTarget.parentElement!.style.borderColor = "#f0f0f0";
                                            }}
                                        >
                                            {/* Category Icon */}
                                            <div
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    background: `${categoryColorMap[category.title] || stringToColor(category.title)}15`,
                                                    borderRadius: 6,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    fontSize: 14,
                                                    marginRight: "12px",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {category.icon}
                                            </div>

                                            {/* Category Title & Count */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <Text
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: "14px",
                                                        color: "#262626",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                        display: "block",
                                                        fontFamily: FONT_FAMILY,
                                                    }}
                                                >
                                                    {category.title}
                                                    {category.pinned && (
                                                        <PushpinFilled
                                                            style={{
                                                                marginLeft: 6,
                                                                color: "#52c41a",
                                                                fontSize: 11,
                                                            }}
                                                        />
                                                    )}
                                                </Text>
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: "12px",
                                                        fontFamily: FONT_FAMILY,
                                                    }}
                                                >
                                                    {category.items.length} notes
                                                </Text>
                                            </div>

                                            {/* Add Note Button (Right Corner) */}
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showCombinedModal(category.category_id);
                                                }}
                                                style={{
                                                    borderRadius: 6,
                                                    background: "#2563eb",
                                                    borderColor: "#2563eb",
                                                    fontSize: 11,
                                                    height: 24,
                                                    width: 24,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: 0,
                                                    marginRight: "8px",
                                                }}
                                            />

                                            {/* Expand/Collapse Arrow */}
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                                                onClick={(e) => handleToggleExpand(categoryId, e)}
                                                style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            />
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div
                                                style={{
                                                    borderTop: "1px solid #f0f0f0",
                                                    backgroundColor: "#ffffff",
                                                }}
                                            >
                                                {/* Notes List */}
                                                {category.items.length > 0 && (
                                                    <div style={{ padding: "16px" }}>
                                                        {category.items.map((note, idx) => (
                                                            <div
                                                                key={`note-${note.id}`}
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "flex-start",
                                                                    gap: "8px",
                                                                    padding: "8px 0",
                                                                    borderBottom: idx < category.items.length - 1 ? "1px solid #f0f0f0" : "none",
                                                                }}
                                                            >
                                                                <div style={{ marginTop: 2, fontSize: 10 }}>📍</div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}>
                                                                        <strong style={{ color: "#374151" }}>
                                                                            {note.title}
                                                                        </strong>
                                                                        <span style={{ color: "#6b7280" }}>
                                                                            {" "} — {note.description}
                                                                        </span>
                                                                        {showAllHubs && (note as any).hub && (
                                                                            <Tag
                                                                                color={getHubColor((note as any).hub.toLowerCase())}
                                                                                style={{
                                                                                    fontSize: 9,
                                                                                    padding: "1px 4px",
                                                                                    marginLeft: 6,
                                                                                    fontFamily: FONT_FAMILY,
                                                                                }}
                                                                            >
                                                                                {getHubDisplayName((note as any).hub.toLowerCase())}
                                                                            </Tag>
                                                                        )}
                                                                    </div>
                                                                    {note.created_at && (
                                                                        <div
                                                                            style={{
                                                                                fontSize: 10,
                                                                                color: "#9ca3af",
                                                                                marginTop: 2,
                                                                                fontFamily: FONT_FAMILY,
                                                                            }}
                                                                        >
                                                                            {note.updated_at
                                                                                ? `Updated: ${new Date(note.updated_at).toLocaleDateString()}`
                                                                                : `Created: ${new Date(note.created_at).toLocaleDateString()}`
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Dropdown
                                                                    menu={getNoteActionMenu(note)}
                                                                    trigger={["click"]}
                                                                    placement="bottomRight"
                                                                >
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<MoreOutlined style={{ fontSize: "12px" }} />}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        style={{
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                        }}
                                                                    />
                                                                </Dropdown>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Add Note Form */}
                                                {showNoteForm === categoryId && (
                                                    <div style={{ padding: "16px", borderTop: category.items.length > 0 ? "1px solid #f0f0f0" : "none" }}>
                                                        <div style={{ marginBottom: 12 }}>
                                                            <Input
                                                                placeholder="Enter note title"
                                                                value={newNote.title}
                                                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                                                style={{ marginBottom: 8, fontFamily: FONT_FAMILY }}
                                                            />
                                                            <TextArea
                                                                placeholder="Enter note description"
                                                                value={newNote.description}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value.length <= 200) {
                                                                        setNewNote({ ...newNote, description: value });
                                                                    }
                                                                }}
                                                                autoSize={{ minRows: 2, maxRows: 4 }}
                                                                maxLength={200}
                                                                showCount
                                                                style={{ fontFamily: FONT_FAMILY }}
                                                            />
                                                        </div>
                                                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                            <Button size="small" onClick={handleCancelNoteForm}>
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                onClick={() => handleSaveNote(categoryId)}
                                                                loading={loading}
                                                            >
                                                                {editingNote ? "Update" : "Add"} Note
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Footer Action Buttons (Only when expanded) */}
                                                <div
                                                    style={{
                                                        borderTop: "1px solid #f0f0f0",
                                                        backgroundColor: "#f8f9fa",
                                                        padding: "10px 12px",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", gap: "8px" }}>
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
                                                                color: category.pinned ? "#52c41a" : "#9ca3af",
                                                                fontSize: 11,
                                                            }}
                                                        >
                                                            {category.pinned ? "Unpin" : "Pin"}
                                                        </Button>

                                                        <Popconfirm
                                                            title="Delete Category"
                                                            description={
                                                                <div>
                                                                    <p style={{ margin: 0, marginBottom: 8 }}>
                                                                        Are you sure you want to delete this category?
                                                                    </p>
                                                                    {category.items.length > 0 && (
                                                                        <p
                                                                            style={{
                                                                                margin: 0,
                                                                                color: "#f56565",
                                                                                fontSize: 12,
                                                                            }}
                                                                        >
                                                                            ⚠️ This will also delete all{" "}
                                                                            {category.items.length} notes in this category!
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            }
                                                            onConfirm={() => handleDeleteNoteCategory(category)}
                                                            okText="Yes, Delete"
                                                            cancelText="Cancel"
                                                            okButtonProps={{ danger: true }}
                                                            placement="topRight"
                                                        >
                                                            <Button
                                                                icon={<DeleteOutlined />}
                                                                type="text"
                                                                size="small"
                                                                style={{
                                                                    color: "#ef4444",
                                                                    fontSize: 11,
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Popconfirm>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            {/* Combined Add Note/Category Modal */}
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
                        <span>Add New Note</span>
                    </div>
                }
                open={combinedModalVisible}
                onCancel={() => {
                    setCombinedModalVisible(false);
                    form.resetFields();
                    setSelectedCategoryOption("");
                    setCustomCategoryName("");
                    setCategoryType("existing");
                    setSelectedCategoryId(null);
                }}
                onOk={handleCombinedSubmit}
                centered
                width={500}
                okText="Add Note"
                confirmLoading={loading}
                destroyOnClose
                style={{ fontFamily: FONT_FAMILY }}
            >
                <Form form={form} layout="vertical">
                    {/* Category Selection */}
                    <Form.Item label="">
                        <div style={{ marginBottom: 12, fontWeight: 500 }}>Category</div>

                        {categoryType === "existing" && (
                            <Select
                                placeholder="Select an existing category"
                                value={selectedCategoryId}
                                onChange={setSelectedCategoryId}
                                style={{ width: "100%", fontFamily: FONT_FAMILY }}
                                disabled={categories.length === 0}
                            >
                                {categories.map((cat) => (
                                    <Select.Option
                                        key={cat.category_id}
                                        value={cat.category_id}
                                    >
                                        <span style={{ marginRight: 8 }}>{cat.icon}</span>
                                        {cat.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}

                        {categoryType === "new" && (
                            <>
                                <Select
                                    placeholder="Choose a category or select 'Others' for custom"
                                    value={selectedCategoryOption}
                                    onChange={handleCategorySelection}
                                    style={{
                                        width: "100%",
                                        fontFamily: FONT_FAMILY,
                                        marginBottom: 12,
                                    }}
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

                                {selectedCategoryOption === "Others" && (
                                    <Input
                                        placeholder="Enter your custom category name"
                                        value={customCategoryName}
                                        onChange={(e) => setCustomCategoryName(e.target.value)}
                                        style={{ width: "100%", fontFamily: FONT_FAMILY }}
                                    />
                                )}

                                {selectedCategoryOption &&
                                    selectedCategoryOption !== "Others" && (
                                        <div
                                            style={{
                                                padding: 10,
                                                backgroundColor: "#f0fdf4",
                                                border: "1px solid #bbf7d0",
                                                borderRadius: 8,
                                                marginTop: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8,
                                                }}
                                            >
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
                            </>
                        )}

                        
                    </Form.Item>

                    {/* Note Details */}
                    <Form.Item
                        name="title"
                        label="Note Title"
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
                        label="Note Description"
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

                    {/* Hub Info */}
                    <div
                        style={{
                            padding: 12,
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: 8,
                            marginTop: 16,
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 500,
                                marginBottom: 8,
                                fontSize: 13,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            📝 Note will be added to: {showAllHubs ? "All Hubs" : `${getHubDisplayName(activeHub)} Hub`}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div
                        style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 16,
                            fontFamily: FONT_FAMILY,
                            padding: "10px 12px",
                            backgroundColor: "#f8fafc",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                        }}
                    >
                        <div style={{ marginBottom: 8 }}>
                            💡 <strong>Quick Add:</strong>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                            <li>Select existing category or create a new one</li>
                            <li>Categories are shared across all hubs for easy organization</li>
                            <li>You can pin important categories to keep them at the top</li>
                        </ul>
                    </div>
                </Form>
            </Modal>

            {/* Share Note Modal */}
            <Modal
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
            >
                {currentShareNote && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                            <div style={{ fontWeight: 600, marginBottom: 6, color: "#1e293b", fontSize: 13 }}>
                                {currentShareNote.title}
                            </div>
                            <div style={{ color: "#64748b", marginBottom: 6, lineHeight: 1.4, fontSize: 12 }}>
                                {currentShareNote.description}
                            </div>
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>
                                Hub: {getHubDisplayName(activeHub)} • Created: {new Date(currentShareNote.created_at || "").toLocaleDateString()}
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
                            prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                        />
                    </Form.Item>
                </Form>

                <div style={{ fontSize: 11, color: "#64748b", marginTop: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                        <span>📧</span>
                        <span>This will open your default email client with the note content</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>✉</span>
                        <span>You can edit the email before sending</span>
                    </div>
                </div>
            </Modal>

            {/* Tag Modal */}
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
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                                {currentTagItem?.title || "Untitled"}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                                {currentTagItem?.description}
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>
                        Tag to Family Members:
                    </label>
                    <Select
                        mode="multiple"
                        style={{ width: "100%" }}
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
    );
};

export default NotesLists;