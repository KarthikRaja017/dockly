
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
                    padding: 24,
                    backgroundColor: "#fff",
                    width: 400,
                    borderRadius: 16,
                    position: "relative",
                    maxHeight: "70vh",
                }}
            >
                <h2
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <FileTextOutlined />  Notes & Lists
                    {showAllHubs && (
                        <span style={{ fontSize: 14, color: "#666" }}> (All Hubs)</span>
                    )}
                </h2>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        marginTop: 20,
                        maxHeight: "400px",
                        overflowY: "auto",
                        paddingRight: 4,
                    }}
                >
                    {displayedCategories.map((category, index) => (
                        <div
                            key={`${category.title}-${index}`}
                            onClick={() => openModal(index)}
                            style={{
                                borderRadius: 12,
                                padding: 12,
                                border: "1px solid #e0e0e0",
                                backgroundColor: "#f9f9f9",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                minHeight: 60,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        background: `${categoryColorMap[category.title] ||
                                            stringToColor(category.title)
                                            }20`,
                                        borderRadius: 10,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    {category.icon}
                                </div>
                                <span style={{ fontWeight: 600 }}>{category.title}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "#666", fontSize: 12 }}>
                                    {category.items.length} notes
                                </span>
                                <Button
                                    icon={
                                        category.pinned ? <PushpinFilled /> : <PushpinOutlined />
                                    }
                                    onClick={(e) => togglePinCategory(category, e)}
                                    type="text"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        minWidth: 24,
                                        padding: 0,
                                        color: category.pinned ? "#1677ff" : "#999",
                                    }}
                                />
                                <RightOutlined style={{ fontSize: 14, color: "#666" }} />
                            </div>
                        </div>
                    ))}

                    {categories.length > 5 && !showAllCategories && (
                        <Button
                            type="text"
                            onClick={() => setShowAllCategories(true)}
                            style={{ textAlign: "center", color: "#1677ff" }}
                        >
                            View More ({categories.length - 5})
                        </Button>
                    )}

                    {showAllCategories && (
                        <Button
                            type="text"
                            onClick={() => setShowAllCategories(false)}
                            style={{ textAlign: "center", color: "#1677ff" }}
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
                        top: 24,
                        right: 24,
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        backgroundColor: "#1677ff",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        border: "none",
                        zIndex: 10,
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
                width={450}
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

            {/* Notes Modal - Hub-aware */}
            <Modal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
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
                                {categories[activeCategoryIndex].icon}{" "}
                                {categories[activeCategoryIndex].title}
                                {!showAllHubs && (
                                    <span style={{ fontSize: 14, color: "#666", marginLeft: 8 }}>
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
                            {categories[activeCategoryIndex].items.length === 0 &&
                                !showNoteForm ? (
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
                                    onClick={() => setShowNoteForm(true)}
                                >
                                    <PlusOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                                    <div style={{ marginTop: 8, color: "#1677ff" }}>
                                        Add your first note
                                        {!showAllHubs && ` to ${getHubDisplayName(activeHub)}`}
                                    </div>
                                </div>
                            ) : (
                                categories[activeCategoryIndex].items.map((note, idx) => (
                                    <div
                                        key={`note-${idx}`}
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
                                                    {showAllHubs && (note as any).hub && (
                                                        <span
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#666",
                                                                marginLeft: 8,
                                                                backgroundColor: "#f0f0f0",
                                                                padding: "2px 6px",
                                                                borderRadius: 4,
                                                            }}
                                                        >
                                                            {getHubDisplayName(
                                                                (note as any).hub.toLowerCase()
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                {note.created_at && (
                                                    <div style={{ fontSize: 11, color: "#333" }}>
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
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {showNoteForm && !showAllHubs && (
                            <div style={{ marginTop: 20 }}>
                                <Input
                                    placeholder="Note Title"
                                    value={newNote.title}
                                    onChange={(e) =>
                                        setNewNote({ ...newNote, title: e.target.value })
                                    }
                                    style={{ marginBottom: 12 }}
                                />
                                <Input
                                    placeholder="Note Description"
                                    value={newNote.description}
                                    onChange={(e) =>
                                        setNewNote({ ...newNote, description: e.target.value })
                                    }
                                    style={{ marginBottom: 20 }}
                                />
                            </div>
                        )}
                        <div style={{ marginTop: 20, textAlign: "right" }}>
                            <Button
                                onClick={() => setModalOpen(false)}
                                style={{ marginRight: 8 }}
                            >
                                Cancel
                            </Button>
                            {showNoteForm && !showAllHubs && (
                                <Button
                                    type="primary"
                                    onClick={handleSaveNote}
                                    loading={loading}
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

