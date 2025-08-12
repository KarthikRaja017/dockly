"use client";
import {
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    RightOutlined,
    PushpinOutlined,
    PushpinFilled,
    MoreOutlined,
    DeleteOutlined,
    ShareAltOutlined,
    TagOutlined,
    MailOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Typography, Form, Dropdown, Menu, Popconfirm, Checkbox } from "antd";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../../app/userContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

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

const categoryColorMap: Record<string, string> = {
    "Important Notes": "#ef4444",
    "House Rules & Routines": "#10b981",
    "Shopping Lists": "#2563eb",
    "Birthday & Gift Ideas": "#ec4899",
    "Meal Ideas & Recipes": "#8b5cf6",
};

// Hub-specific default categories
const getDefaultCategoriesForHub = (hub: string): Category[] => {
    const baseCategories = [
        { title: "Important Notes", icon: "📌", items: [], pinned: true },
    ];

    const hubSpecificCategories: Record<string, Category[]> = {
        family: [
            { title: "House Rules & Routines", icon: "🏠", items: [], pinned: false },
            { title: "Shopping Lists", icon: "🛒", items: [], pinned: false },
            { title: "Birthday & Gift Ideas", icon: "🎁", items: [], pinned: false },
            { title: "Meal Ideas & Recipes", icon: "🍽", items: [], pinned: false },
        ],
        finance: [
            { title: "House Rules & Routines", icon: "🏠", items: [], pinned: false },
            { title: "Shopping Lists", icon: "🛒", items: [], pinned: false },
            { title: "Birthday & Gift Ideas", icon: "🎁", items: [], pinned: false },
            { title: "Meal Ideas & Recipes", icon: "🍽", items: [], pinned: false },
        ],
        planner: [
            { title: "House Rules & Routines", icon: "🏠", items: [], pinned: false },
            { title: "Shopping Lists", icon: "🛒", items: [], pinned: false },
            { title: "Birthday & Gift Ideas", icon: "🎁", items: [], pinned: false },
            { title: "Meal Ideas & Recipes", icon: "🍽", items: [], pinned: false },
        ],
        health: [
            { title: "House Rules & Routines", icon: "🏠", items: [], pinned: false },
            { title: "Shopping Lists", icon: "🛒", items: [], pinned: false },
            { title: "Birthday & Gift Ideas", icon: "🎁", items: [], pinned: false },
            { title: "Meal Ideas & Recipes", icon: "🍽", items: [], pinned: false },
        ],
        home: [
            { title: "House Rules & Routines", icon: "🏠", items: [], pinned: false },
            { title: "Shopping Lists", icon: "🛒", items: [], pinned: false },
            { title: "Birthday & Gift Ideas", icon: "🎁", items: [], pinned: false },
            { title: "Meal Ideas & Recipes", icon: "🍽", items: [], pinned: false },
        ],
    };

    return [...baseCategories, ...(hubSpecificCategories[hub] || [])];
};

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
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, "0")}`;
};

// Function to determine current hub from URL or other sources
const getCurrentHub = (): string => {
    // Method 1: From URL path
    const path = window.location.pathname;
    const hubMatch = path.match(/\/(family|finance|planner|health|home)/);
    if (hubMatch) {
        return hubMatch[1];
    }

    // Method 2: From URL search params
    const urlParams = new URLSearchParams(window.location.search);
    const hubFromParams = urlParams.get("hub");
    if (
        hubFromParams &&
        ["family", "finance", "planner", "health", "home"].includes(hubFromParams)
    ) {
        return hubFromParams;
    }

    // Method 3: From localStorage (if stored)
    const storedHub = localStorage.getItem("currentHub");
    if (
        storedHub &&
        ["family", "finance", "planner", "health", "home"].includes(storedHub)
    ) {
        return storedHub;
    }

    // Default fallback
    return "family";
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
    // Determine the active hub
    const [activeHub, setActiveHub] = useState<string>(currentHub || "family");
    const router = useRouter();
    const username = useCurrentUser()?.user_name || "";

    const [categories, setCategories] = useState<Category[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
        null
    );
    const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
    const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
    const [showNoteForm, setShowNoteForm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [newCategoryModal, setNewCategoryModal] = useState<boolean>(false);
    const [selectedCategoryOption, setSelectedCategoryOption] =
        useState<string>("");
    const [customCategoryName, setCustomCategoryName] = useState<string>("");

    // New state for menu actions
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
                        ["family", "finance", "planner", "health", "home"].includes(
                            hubFromParams
                        )
                    )
                        return hubFromParams;

                    const storedHub = localStorage.getItem("currentHub");
                    if (
                        storedHub &&
                        ["family", "finance", "planner", "health", "home"].includes(
                            storedHub
                        )
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

            // Step 1: Build all categories (shared across hubs)
            const customCategories: Category[] = categoriesPayload.map((cat) => ({
                title: cat.title,
                icon: cat.icon || "✍",
                items: [],
                category_id: cat.id,
                pinned: cat.pinned === true,
            }));

            // Step 2: Add default categories if they're missing from backend
            const defaultCategories = getDefaultCategoriesForHub("family");
            const mergedCategories: Category[] = [...customCategories];

            defaultCategories.forEach((defCat) => {
                const exists = mergedCategories.some((c) => c.title === defCat.title);
                if (!exists) {
                    mergedCategories.push({ ...defCat });
                }
            });

            // Step 3: Process notes and group by category title
            const groupedNotes: Record<string, Note[]> = {};
            rawNotes.forEach((note) => {
                let catTitle = categoryIdMapReverse[note.category_id];
                if (!catTitle && note.category_name) catTitle = note.category_name;
                if (!catTitle) catTitle = "Others";

                if (!groupedNotes[catTitle]) groupedNotes[catTitle] = [];

                const noteItem: Note = {
                    id: note.id,
                    title: note.title,
                    description: note.description,
                    created_at: note.created_at,
                    updated_at: note.updated_at,
                    hub: note.hub || activeHub.toUpperCase(),
                };

                // Add hub info for utility page display
                if (showAllHubs) {
                    (noteItem as any).hub = note.hub || "FAMILY";
                }

                groupedNotes[catTitle].unshift(noteItem);
            });

            // Step 4: Attach notes to categories
            const finalCategories = mergedCategories
                .map((cat) => ({
                    ...cat,
                    items: groupedNotes[cat.title] || [],
                }))
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

    const togglePinCategory = async (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPinnedStatus = !category.pinned;
        const categoryId = category.category_id || categoryIdMap[category.title];

        if (!categoryId) return;

        try {
            const res = await updateNoteCategory({
                id: categoryId,
                pinned: newPinnedStatus,
            });
            if (res.data.status === 1) {
                fetchCategoriesAndNotes();
            }
        } catch (err) {
            message.error("Failed to update pin status");
        }
    };

    const openModal = (index: number) => {
        setActiveCategoryIndex(index);
        setModalOpen(true);
        setShowNoteForm(false);
        setEditingNoteIndex(null);
        setNewNote({ title: "", description: "" });
    };

    const handleEditNote = (note: Note, idx: number) => {
        setEditingNoteIndex(idx);
        setNewNote({ ...note });
        setShowNoteForm(true);
    };

    // Add double-click handler for direct editing
    const handleNoteDoubleClick = (note: Note, idx: number) => {
        if (!showAllHubs) {
            handleEditNote(note, idx);
        }
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

    const getNoteActionMenu = (note: Note) => {
        return (
            <Menu>
                <Menu.Item
                    key="edit"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        const categoryIndex = categories.findIndex(cat =>
                            cat.items.some(item => item.id === note.id)
                        );
                        const noteIndex = categories[categoryIndex]?.items.findIndex(item => item.id === note.id);
                        if (categoryIndex !== -1 && noteIndex !== -1) {
                            setActiveCategoryIndex(categoryIndex);
                            handleEditNote(note, noteIndex);
                        }
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
                        setCurrentTagItem(note);
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

    const handleSaveNote = async () => {
        if (activeCategoryIndex === null) return;
        const categoryTitle = categories[activeCategoryIndex].title;
        const category_id =
            categoryIdMap[categoryTitle] ||
            categories[activeCategoryIndex].category_id;

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
            if (editingNoteIndex !== null) {
                // Editing existing note
                const noteToEdit =
                    categories[activeCategoryIndex].items[editingNoteIndex];

                if (!noteToEdit.id) {
                    message.error("Note ID not found");
                    setLoading(false);
                    return;
                }

                const res = await updateNote({
                    id: noteToEdit.id,
                    title: newNote.title,
                    description: newNote.description,
                    category_id: category_id as number,
                    hub: activeHub.toUpperCase(),
                });

                if (res.data.status === 1) {
                    message.success("Note updated");
                    await fetchCategoriesAndNotes();
                }
            } else {
                // Adding new note - only add to current hub
                const user_id = localStorage.getItem("userId") || "";

                const res = await addNote({
                    title: newNote.title,
                    description: newNote.description,
                    category_id: category_id as number,
                    user_id,
                    hub: activeHub.toUpperCase(), // Only add to the current hub
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

            setShowNoteForm(false);
            setEditingNoteIndex(null);
            setNewNote({ title: "", description: "" });
        } catch (err) {
            message.error("Something went wrong");
        }

        setLoading(false);
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
                message.success("Category added");
                setNewCategoryModal(false);
                setSelectedCategoryOption("");
                setCustomCategoryName("");

                // Refresh categories for current hub
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

    // Updated logic for constant height: show max 4 categories + "View More" if there are 5+ categories
    const displayedCategories =
        categories.length > 4 ? categories.slice(0, 4) : categories;
    const hasMoreCategories = categories.length > 4;

    const handleViewMoreClick = () => {
        // ADD YOUR NAVIGATION ROUTE HERE
        // Example: navigate('/notes/all-categories') or window.location.href = '/notes/categories'
        console.log("../../../app/[username]/notes/page.tsx");
        router.push(`/${username}/notes`);
    };

    return (
        <>
            <div
                style={{
                    padding: 16,
                    backgroundColor: "#ffffff",
                    width: 380,
                    borderRadius: 12,
                    position: "relative",
                    height: "360px", // Fixed height to maintain consistency
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
            >
                <h2
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        margin: 0,
                        marginBottom: 12,
                        color: "#1f2937",
                        fontFamily:
                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                >
                    <FileTextOutlined style={{ fontSize: 16 }} />
                    Notes & Lists
                    {showAllHubs && (
                        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400 }}>
                            {" "}
                            (All Hubs)
                        </span>
                    )}
                </h2>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginTop: 16,
                        height: "280px", // Fixed height for categories container
                        overflowY: "hidden", // Hide overflow to maintain height
                        paddingRight: 2,
                    }}
                >
                    {displayedCategories.map((category, index) => (
                        <div
                            key={`${category.title}-${index}`}
                            onClick={() => openModal(index)}
                            style={{
                                borderRadius: 8,
                                padding: "10px 12px",
                                border: "1px solid #f1f5f9",
                                backgroundColor: "#fafbfc",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                minHeight: 48,
                                maxHeight: 48, // Fixed height for each category item
                                transition: "all 0.2s ease",
                                fontFamily:
                                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f8fafc";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#fafbfc";
                                e.currentTarget.style.borderColor = "#f1f5f9";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                    style={{
                                        width: 28,
                                        height: 28,
                                        background: `${categoryColorMap[category.title] ||
                                            stringToColor(category.title)
                                            }15`,
                                        borderRadius: 6,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontSize: 12,
                                    }}
                                >
                                    {category.icon}
                                </div>
                                <span
                                    style={{
                                        fontWeight: 500,
                                        fontSize: 14,
                                        color: "#374151",
                                        fontFamily:
                                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                >
                                    {category.title}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span
                                    style={{
                                        color: "#9ca3af",
                                        fontSize: 11,
                                        fontFamily:
                                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                >
                                    {category.items.length}
                                </span>
                                <Button
                                    icon={
                                        category.pinned ? <PushpinFilled /> : <PushpinOutlined />
                                    }
                                    onClick={(e) => togglePinCategory(category, e)}
                                    type="text"
                                    style={{
                                        width: 20,
                                        height: 20,
                                        minWidth: 20,
                                        padding: 0,
                                        color: category.pinned ? "#2563eb" : "#9ca3af",
                                        fontSize: 11,
                                    }}
                                />
                                <RightOutlined style={{ fontSize: 10, color: "#9ca3af" }} />
                            </div>
                        </div>
                    ))}

                    {/* View More button in the 5th position when there are 5+ categories */}
                    {hasMoreCategories && (
                        <div
                            onClick={handleViewMoreClick} // ADD YOUR NAVIGATION ROUTE IN THIS FUNCTION
                            style={{
                                borderRadius: 8,
                                padding: "10px 12px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#f8fafc",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                minHeight: 48,
                                maxHeight: 48,
                                transition: "all 0.2s ease",
                                fontFamily:
                                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e2e8f0";
                                e.currentTarget.style.borderColor = "#cbd5e1";
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#f8fafc";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 500,
                                    fontSize: 14,
                                    color: "#2563eb",
                                    fontFamily:
                                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            >
                                View More ({categories.length - 4})
                            </span>
                        </div>
                    )}
                </div>

                <Button
                    shape="default"
                    icon={<PlusOutlined />}
                    onClick={() => setNewCategoryModal(true)}
                    style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: "#2563eb",
                        color: "white",
                        boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                        border: "none",
                        zIndex: 10,
                        fontSize: 12,
                    }}
                />
            </div>

            {/* Enhanced New Category Modal with Selection */}
            <Modal
                open={newCategoryModal}
                onCancel={() => {
                    setNewCategoryModal(false);
                    setSelectedCategoryOption("");
                    setCustomCategoryName("");
                }}
                onOk={handleAddCategory}
                centered
                width={420}
                okText="Add Category"
                closable={false}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setNewCategoryModal(false);
                            setSelectedCategoryOption("");
                            setCustomCategoryName("");
                        }}
                        style={{
                            fontFamily:
                                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleAddCategory}
                        loading={loading}
                        style={{
                            fontFamily:
                                "-apple-system, BlinkMacSystemFont, 'Segue UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                    >
                        Add Category
                    </Button>,
                ]}
                style={{
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
            >
                <div style={{ padding: "16px 0" }}>
                    <Title
                        level={4}
                        style={{
                            marginBottom: 16,
                            textAlign: "center",
                            fontSize: 16,
                            fontFamily:
                                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                                fontSize: 13,
                                fontFamily:
                                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                        >
                            Select Category Type:
                        </label>
                        <Select
                            placeholder="Choose a category or select 'Others' for custom"
                            value={selectedCategoryOption}
                            onChange={handleCategorySelection}
                            style={{ width: "100%" }}
                            size="middle"
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
                                    fontSize: 13,
                                    fontFamily:
                                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            >
                                Custom Category Name:
                            </label>
                            <Input
                                placeholder="Enter your custom category name"
                                value={customCategoryName}
                                onChange={(e) => setCustomCategoryName(e.target.value)}
                                size="middle"
                                style={{ width: "100%" }}
                            />
                        </div>
                    )}

                    {selectedCategoryOption && selectedCategoryOption !== "Others" && (
                        <div
                            style={{
                                marginTop: 12,
                                padding: 10,
                                backgroundColor: "#f0f9ff",
                                border: "1px solid #bae6fd",
                                borderRadius: 6,
                                fontFamily:
                                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                                        fontSize: 14,
                                        fontFamily:
                                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                >
                                    {selectedCategoryOption}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Notes Modal - Hub-aware with Menu Actions */}
            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                centered
                width={520}
                closable={false}
                style={{
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
            >
                {activeCategoryIndex !== null && (
                    <div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                                fontFamily:
                                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: "#1f2937",
                                    fontFamily:
                                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            >
                                {categories[activeCategoryIndex].icon}{" "}
                                {categories[activeCategoryIndex].title}
                                {!showAllHubs && (
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: "#6b7280",
                                            marginLeft: 6,
                                            fontWeight: 400,
                                            fontFamily:
                                                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                        }}
                                    >
                                        ({getHubDisplayName(activeHub)})
                                    </span>
                                )}
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
                                    top: 16,
                                    right: 40,
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    backgroundColor: "#2563eb",
                                    color: "white",
                                    boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                                    border: "none",
                                    fontSize: 12,
                                }}
                            />
                        </div>

                        <div style={{ maxHeight: 280, overflowY: "auto", paddingRight: 4 }}>
                            {categories[activeCategoryIndex].items.length === 0 &&
                                !showNoteForm ? (
                                <div
                                    style={{
                                        border: "1px dashed #d1d5db",
                                        borderRadius: 6,
                                        padding: 16,
                                        textAlign: "center",
                                        marginBottom: 12,
                                        backgroundColor: "#fafbfc",
                                        cursor: "pointer",
                                        fontFamily:
                                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                    onClick={() => setShowNoteForm(true)}
                                >
                                    <PlusOutlined style={{ fontSize: 16, color: "#2563eb" }} />
                                    <div
                                        style={{
                                            marginTop: 6,
                                            color: "#2563eb",
                                            fontSize: 13,
                                            fontFamily:
                                                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                        }}
                                    >
                                        Add your first note
                                        {!showAllHubs && ` to ${getHubDisplayName(activeHub)}`}
                                    </div>
                                </div>
                            ) : (
                                categories[activeCategoryIndex].items.map((note, idx) => (
                                    <div
                                        key={`note-${idx}`}
                                        style={{
                                            border: "1px solid #f1f5f9",
                                            borderRadius: 6,
                                            padding: 10,
                                            marginBottom: 8,
                                            backgroundColor: "#fafbfc",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            fontFamily:
                                                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                        }}
                                        onDoubleClick={() => handleNoteDoubleClick(note, idx)}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 6,
                                                flex: 1,
                                            }}
                                        >
                                            <div style={{ marginTop: 2, fontSize: 12 }}>📍</div>
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontSize: "13px",
                                                        fontFamily:
                                                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                                    }}
                                                >
                                                    <strong style={{ color: "#374151" }}>
                                                        {note.title}
                                                    </strong>
                                                    <span style={{ color: "#6b7280" }}>
                                                        {" "}
                                                        — {note.description}
                                                    </span>
                                                    {showAllHubs && (note as any).hub && (
                                                        <span
                                                            style={{
                                                                fontSize: 10,
                                                                color: "white",
                                                                marginLeft: 6,
                                                                backgroundColor: getHubColor((note as any).hub.toLowerCase()),
                                                                padding: "2px 6px",
                                                                borderRadius: 4,
                                                                fontWeight: 500,
                                                                fontFamily:
                                                                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                                            }}
                                                        >
                                                            {getHubDisplayName(
                                                                (note as any).hub.toLowerCase()
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                {note.created_at && (
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#9ca3af",
                                                            marginTop: 4,
                                                            fontFamily:
                                                                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                                        }}
                                                    >
                                                        {note.updated_at
                                                            ? `Updated: ${new Date(note.updated_at).toLocaleString()}`
                                                            : `Created: ${new Date(note.created_at).toLocaleString()}`
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Add menu actions dropdown */}
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
                                                    color: "#6b7280",
                                                    fontSize: 12,
                                                }}
                                            />
                                        </Dropdown>
                                    </div>
                                ))
                            )}
                        </div>

                        {showNoteForm && !showAllHubs && (
                            <div style={{ marginTop: 16, padding: "16px 0 0 0" }}>
                                <div style={{ marginBottom: 16 }}>
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: 600,
                                        color: "#1f2937",
                                        display: "block",
                                        marginBottom: 16
                                    }}>
                                        {editingNoteIndex !== null
                                            ? `Edit Note in ${categories[activeCategoryIndex].title}`
                                            : `Add New Note to ${categories[activeCategoryIndex].title}`
                                        }
                                    </Text>
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <Text style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: "#374151"
                                    }}>
                                        <span style={{ color: "#ef4444", marginRight: 4 }}>*</span>
                                        Title
                                    </Text>
                                    <Input
                                        placeholder="Enter note title"
                                        value={newNote.title}
                                        onChange={(e) =>
                                            setNewNote({ ...newNote, title: e.target.value })
                                        }
                                        size="large"
                                        style={{
                                            borderRadius: 8,
                                            border: "1px solid #d1d5db",
                                            fontSize: 14
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <Text style={{
                                        display: "block",
                                        marginBottom: 8,
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: "#374151"
                                    }}>
                                        <span style={{ color: "#ef4444", marginRight: 4 }}>*</span>
                                        Description
                                    </Text>
                                    <TextArea
                                        placeholder="Enter note description"
                                        value={newNote.description}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value.length <= 200) {
                                                setNewNote({ ...newNote, description: value });
                                            }
                                        }}
                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                        maxLength={200}
                                        showCount={{
                                            formatter: ({ count, maxLength }) => `${count} / ${maxLength}`
                                        }}
                                        style={{
                                            borderRadius: 8,
                                            border: "1px solid #d1d5db",
                                            fontSize: 14,
                                            resize: "none"
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 16, textAlign: "right" }}>
                            <Button
                                onClick={() => {
                                    setModalOpen(false);
                                    setShowNoteForm(false);
                                    setEditingNoteIndex(null);
                                    setNewNote({ title: "", description: "" });
                                }}
                                style={{
                                    marginRight: 8,
                                    fontSize: 13,
                                    fontFamily:
                                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            >
                                Close
                            </Button>
                            {showNoteForm && !showAllHubs && (
                                <Button
                                    type="primary"
                                    onClick={handleSaveNote}
                                    loading={loading}
                                    style={{
                                        fontSize: 13,
                                        fontFamily:
                                            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                >
                                    {editingNoteIndex !== null ? "Update Note" : "Add Note"}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
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
                                    fontSize: 12,
                                }}
                            >
                                {currentShareNote.description}
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: "#9ca3af",
                                }}
                            >
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
        </>
    );
};

export default NotesLists;