"use client";
import {
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    RightOutlined,
    PushpinOutlined,
    PushpinFilled,
} from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Typography } from "antd";
import { useState, useEffect } from "react";
import {
    getAllNotes,
    updateNote,
    addNote,
    addNoteCategory,
    getNoteCategories,
    updateNoteCategory,
} from "../../../services/family";

const { Title } = Typography;

interface Note {
    title: string;
    description: string;
    created_at?: string;
    id?: number;
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
    "Shopping Lists": "#3b82f6",
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

const NotesLists: React.FC<NotesListsProps> = ({
    currentHub,
    showAllHubs = false,
}) => {
    // Determine the active hub
    const [activeHub, setActiveHub] = useState<string>(currentHub || "family");

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
    const [showAllCategories, setShowAllCategories] = useState<boolean>(false);

    useEffect(() => {
        fetchCategoriesAndNotes();
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
                    ) return hubFromParams;

                    const storedHub = localStorage.getItem("currentHub");
                    if (
                        storedHub &&
                        ["family", "finance", "planner", "health", "home"].includes(storedHub)
                    ) return storedHub;
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
                // Adding new note
                const user_id = localStorage.getItem("userId") || "";

                const res = await addNote({
                    title: newNote.title,
                    description: newNote.description,
                    category_id: category_id as number,
                    user_id,
                    hub: activeHub.toUpperCase(),
                });

                if (res.data.status === 1) {
                    message.success(
                        showAllHubs
                            ? "Note added"
                            : `Note added to ${getHubDisplayName(activeHub)}`
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

    const displayedCategories = showAllCategories
        ? categories
        : categories.slice(0, 5);

    // Get hub display name
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

    return (
        <>
            <div
                style={{
                    padding: 16,
                    backgroundColor: "#ffffff",
                    maxWidth: 420,
                    borderRadius: 12,
                    position: "relative",
                    maxHeight: "70vh",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                >
                    <FileTextOutlined style={{ fontSize: 16 }} />
                    Notes & Lists
                    {showAllHubs && (
                        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 400 }}> (All Hubs)</span>
                    )}
                </h2>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginTop: 16,
                        maxHeight: "400px",
                        overflowY: "auto",
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
                                transition: "all 0.2s ease",
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                                <span style={{
                                    fontWeight: 500,
                                    fontSize: 14,
                                    color: "#374151",
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}>
                                    {category.title}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{
                                    color: "#9ca3af",
                                    fontSize: 11,
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}>
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
                                        color: category.pinned ? "#3b82f6" : "#9ca3af",
                                        fontSize: 11,
                                    }}
                                />
                                <RightOutlined style={{ fontSize: 10, color: "#9ca3af" }} />
                            </div>
                        </div>
                    ))}

                    {categories.length > 5 && !showAllCategories && (
                        <Button
                            type="text"
                            onClick={() => setShowAllCategories(true)}
                            style={{
                                textAlign: "center",
                                color: "#3b82f6",
                                fontSize: 13,
                                height: 32,
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                        >
                            View More ({categories.length - 5})
                        </Button>
                    )}

                    {showAllCategories && (
                        <Button
                            type="text"
                            onClick={() => setShowAllCategories(false)}
                            style={{
                                textAlign: "center",
                                color: "#3b82f6",
                                fontSize: 13,
                                height: 32,
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                        >
                            Show Less
                        </Button>
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
                        backgroundColor: "#3b82f6",
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
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                    >
                        Add Category
                    </Button>,
                ]}
                style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
            >
                <div style={{ padding: "16px 0" }}>
                    <Title level={4} style={{
                        marginBottom: 16,
                        textAlign: "center",
                        fontSize: 16,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}>
                        Create New Category
                    </Title>

                    <div style={{ marginBottom: 12 }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: 6,
                                fontWeight: 500,
                                fontSize: 13,
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                                <span style={{
                                    fontWeight: 500,
                                    fontSize: 14,
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}>
                                    {selectedCategoryOption}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Notes Modal - Hub-aware */}
            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                centered
                width={520}
                closable={false}
                style={{
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}
                        >
                            <span style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#1f2937",
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                {categories[activeCategoryIndex].icon}{" "}
                                {categories[activeCategoryIndex].title}
                                {!showAllHubs && (
                                    <span style={{
                                        fontSize: 12,
                                        color: "#6b7280",
                                        marginLeft: 6,
                                        fontWeight: 400,
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}>
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
                                    backgroundColor: "#3b82f6",
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
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                    onClick={() => setShowNoteForm(true)}
                                >
                                    <PlusOutlined style={{ fontSize: 16, color: "#3b82f6" }} />
                                    <div style={{
                                        marginTop: 6,
                                        color: "#3b82f6",
                                        fontSize: 13,
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}>
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
                                            alignItems: "center",
                                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 6,
                                            }}
                                        >
                                            <div style={{ marginTop: 2, fontSize: 12 }}>📍</div>
                                            <div>
                                                <div style={{
                                                    fontSize: "13px",
                                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                                }}>
                                                    <strong style={{ color: "#374151" }}>{note.title}</strong>
                                                    <span style={{ color: "#6b7280" }}> — {note.description}</span>
                                                    {showAllHubs && (note as any).hub && (
                                                        <span
                                                            style={{
                                                                fontSize: 10,
                                                                color: "#6b7280",
                                                                marginLeft: 6,
                                                                backgroundColor: "#f3f4f6",
                                                                padding: "1px 4px",
                                                                borderRadius: 3,
                                                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                                            }}
                                                        >
                                                            {getHubDisplayName(
                                                                (note as any).hub.toLowerCase()
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                {note.created_at && (
                                                    <div style={{
                                                        fontSize: 10,
                                                        color: "#9ca3af",
                                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                                    }}>
                                                        {new Date(note.created_at).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!showAllHubs && (
                                            <Button
                                                icon={<EditOutlined />}
                                                size="small"
                                                onClick={() => handleEditNote(note, idx)}
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    fontSize: 11
                                                }}
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {showNoteForm && !showAllHubs && (
                            <div style={{ marginTop: 16 }}>
                                <Input
                                    placeholder="Note Title"
                                    value={newNote.title}
                                    onChange={(e) =>
                                        setNewNote({ ...newNote, title: e.target.value })
                                    }
                                    style={{ marginBottom: 8 }}
                                    size="middle"
                                />
                                <Input
                                    placeholder="Note Description"
                                    value={newNote.description}
                                    onChange={(e) =>
                                        setNewNote({ ...newNote, description: e.target.value })
                                    }
                                    style={{ marginBottom: 16 }}
                                    size="middle"
                                />
                            </div>
                        )}
                        <div style={{ marginTop: 16, textAlign: "right" }}>
                            <Button
                                onClick={() => setModalOpen(false)}
                                style={{
                                    marginRight: 6,
                                    fontSize: 13,
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            >
                                Cancel
                            </Button>
                            {showNoteForm && !showAllHubs && (
                                <Button
                                    type="primary"
                                    onClick={handleSaveNote}
                                    loading={loading}
                                    style={{
                                        fontSize: 13,
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                >
                                    {editingNoteIndex !== null ? "Update Note" : "Add Note"}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default NotesLists;