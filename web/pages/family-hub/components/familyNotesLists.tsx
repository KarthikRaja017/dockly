
import {
    DeleteOutlined,
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Modal, Space } from "antd";
import { useState, useEffect } from "react";
import { addNote, getAllNotes, updateNote } from "../../../services/family";

interface Note {
    title: string;
    description: string;
}

interface Category {
    title: string;
    icon: string;
    items: Note[];
}

const categoryColorMap: Record<string, string> = {
    "Important Notes": "#ef4444",
    "House Rules & Routines": "#10b981",
    "Shopping Lists": "#3b82f6",
    "Birthday & Gift Ideas": "#ec4899",
    "Meal Ideas & Recipes": "#8b5cf6",
};

const defaultCategories: Category[] = [
    { title: "Important Notes", icon: "📌", items: [] },
    { title: "House Rules & Routines", icon: "🏠", items: [] },
    { title: "Shopping Lists", icon: "🛍", items: [] },
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

const categoryIdMapReverse: Record<number, string> = Object.entries(
    categoryIdMap
).reduce((acc, [title, id]) => {
    acc[id] = title;
    return acc;
}, {} as Record<number, string>);

const FamilyNotes = () => {
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
        null
    );
    const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
    const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
    const [newCategoryModal, setNewCategoryModal] = useState<boolean>(false);
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = async () => {
        setLoading(true);
        try {
            const response = await getAllNotes();
            const rawNotes = response.data.payload;
            const grouped: Record<number, Note[]> = {};
            rawNotes.forEach((note: any) => {
                const catId = note.category_id;
                if (!catId || !categoryIdMapReverse[catId]) return;
                if (!grouped[catId]) grouped[catId] = [];
                grouped[catId].unshift({
                    title: note.title,
                    description: note.description,
                });
            });
            const updatedCategories = defaultCategories.map((cat) => {
                const catId = categoryIdMap[cat.title];
                return { ...cat, items: grouped[catId] || [] };
            });
            setCategories(updatedCategories);
        } catch (error) {
            message.error("Failed to load notes");
        }
        setLoading(false);
    };

    const openModal = (index: number | null) => {
        setActiveCategoryIndex(index);
        setEditingNoteIndex(null);
        setNewNote({ title: "", description: "" });
        setModalOpen(true);
    };

    const handleSaveNote = async () => {
        setLoading(true);
        if (
            !newNote.title.trim() ||
            !newNote.description.trim() ||
            activeCategoryIndex === null
        ) {
            message.error("Please fill in all fields");
            setLoading(false);
            return;
        }

        const categoryTitle = categories[activeCategoryIndex].title;
        const category_id = categoryIdMap[categoryTitle];

        try {
            if (editingNoteIndex !== null) {
                const rawNotes = await getAllNotes();
                const fullNote = rawNotes.data.payload.find(
                    (note: any) =>
                        note.title ===
                        categories[activeCategoryIndex].items[editingNoteIndex].title &&
                        note.description ===
                        categories[activeCategoryIndex].items[editingNoteIndex]
                            .description &&
                        note.category_id === category_id
                );
                if (!fullNote) {
                    message.error("Original note not found for update");
                    setLoading(false);
                    return;
                }
                const res = await updateNote({
                    id: fullNote.id,
                    title: newNote.title,
                    description: newNote.description,
                    category_id,
                });
                if (res.data.status === 1) {
                    message.success("Note updated");
                    await getNotes();
                    setModalOpen(false);
                } else {
                    message.error(res.data.message || "Failed to update");
                }
            } else {
                const user_id =
                    typeof window !== "undefined"
                        ? localStorage.getItem("userId") || ""
                        : "";
                const res = await addNote({
                    title: newNote.title,
                    description: newNote.description,
                    category_id,
                    user_id,
                });
                if (res.data.status === 1) {
                    message.success("Note added");
                    await getNotes();
                    setModalOpen(false);
                } else {
                    message.error(res.data.message || "Failed to add");
                }
            }
        } catch (err) {
            message.error("Something went wrong");
        }
        setNewNote({ title: "", description: "" });
        setEditingNoteIndex(null);
        setLoading(false);
    };

    const handleDeleteNote = (idx: number) => {
        if (activeCategoryIndex === null) return;
        const updated = [...categories];
        updated[activeCategoryIndex].items.splice(idx, 1);
        setCategories(updated);
    };

    const handleEditNote = (note: Note, idx: number) => {
        setEditingNoteIndex(idx);
        setNewNote({ ...note });
        setModalOpen(true);
    };

    const handleAddCategory = () => {
        const name = newCategoryName.trim();
        if (!name) return;
        if (categories.some((c) => c.title === name)) {
            message.error("Category already exists");
            return;
        }
        setCategories([...categories, { title: name, icon: "📁", items: [] }]);
        setNewCategoryModal(false);
        setNewCategoryName("");
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
            <div
                style={{
                    padding: 24,
                    backgroundColor: "#fff",
                    width: 430,
                    borderRadius: 16,
                    boxShadow: "0 0 10px rgba(0,0,0,0.06)",
                    position: "relative",
                    overflowY: "auto",
                    maxHeight: 520,
                }}
            >
                <div
                    style={{
                        marginBottom: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h2
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                        }}
                    >
                        <FileTextOutlined />
                        Notes & Lists
                    </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {categories.map((category, index) => (
                        <div
                            key={index}
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
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        background: `${categoryColorMap[category.title] || "#ccc"
                                            }20`,
                                        borderRadius: 10,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 16,
                                    }}
                                >
                                    {category.icon}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>
                                    {category.title}
                                </span>
                            </div>
                            <RightOutlined style={{ fontSize: 14, color: "#666" }} />
                        </div>
                    ))}
                </div>

                {/* Floating "+" Button */}
                <Button
                    shape="default"
                    icon={<PlusOutlined />}
                    onClick={() => setNewCategoryModal(true)}
                    style={{
                        position: "absolute",
                        top: 24,
                        right: 24,
                        // width: 44,
                        // height: 44,
                        borderRadius: 12,
                        backgroundColor: "#1677ff",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        border: "none",
                        zIndex: 10,
                    }}
                />
            </div>

            {/* Add/Edit Note Modal */}


            <Modal
                open={modalOpen}
                footer={null}
                onCancel={() => setModalOpen(false)}
                centered
                width={550}
            >
                <div style={{ padding: 20, fontWeight: 600, fontSize: 16 }}>
                    {activeCategoryIndex !== null && (
                        <>
                            {categories[activeCategoryIndex].icon} {categories[activeCategoryIndex].title}
                        </>
                    )}
                </div>
                <div style={{ padding: 24 }}>
                    <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 16 }}>
                        {activeCategoryIndex !== null &&
                            categories[activeCategoryIndex].items.map((note, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 8,
                                        padding: 12,
                                        marginBottom: 12,
                                        backgroundColor: "#f9fafb",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{ fontSize: 14 }}>
                                        <strong>
                                            {idx + 1}. {note.title}
                                        </strong>{" "}
                                        — <span style={{ fontWeight: 400 }}>{note.description}</span>
                                    </div>
                                    <Button
                                        icon={<EditOutlined />}
                                        size="small"
                                        onClick={() => handleEditNote(note, idx)}
                                    />
                                </div>
                            ))}
                    </div>
                    <Input
                        placeholder="Note Title"
                        value={newNote.title}
                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
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
                    <Button
                        type="primary"
                        block
                        icon={<PlusOutlined />}
                        onClick={handleSaveNote}
                    >
                        {editingNoteIndex !== null ? "Update Note" : "Add Note"}
                    </Button>
                </div>
            </Modal>

            <Modal
                open={newCategoryModal}
                onCancel={() => setNewCategoryModal(false)}
                onOk={handleAddCategory}
                centered
                width={400}
            >
                <div style={{ padding: 24 }}>
                    <Input
                        placeholder="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        style={{ marginBottom: 20 }}
                    />
                </div>
            </Modal>
        </>
    );
};

export default FamilyNotes;