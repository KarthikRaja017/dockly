// "use client";
// import {
//     EditOutlined,
//     FileTextOutlined,
//     PlusOutlined,
//     RightOutlined,
// } from "@ant-design/icons";
// import { Button, Input, message, Modal } from "antd";
// import { useState, useEffect } from "react";
// import { getAllNotes, updateNote, addNote } from "../../../services/family";
// import { useGlobalLoading } from "../../../app/loadingContext";

// interface Note {
//     title: string;
//     description: string;
//     created_at?: string;
// }

// interface Category {
//     title: string;
//     icon: string;
//     items: Note[];
// }

// const categoryColorMap: Record<string, string> = {
//     "Important Notes": "#ef4444",
//     "House Rules & Routines": "#10b981",
//     "Shopping Lists": "#3b82f6",
//     "Birthday & Gift Ideas": "#ec4899",
//     "Meal Ideas & Recipes": "#8b5cf6",
// };

// const defaultCategories: Category[] = [
//     { title: "Important Notes", icon: "\ud83d\udccc", items: [] },
//     { title: "House Rules & Routines", icon: "\ud83c\udfe0", items: [] },
//     { title: "Shopping Lists", icon: "\ud83d\uded5", items: [] },
//     { title: "Birthday & Gift Ideas", icon: "\ud83c\udf81", items: [] },
//     { title: "Meal Ideas & Recipes", icon: "\ud83c\udf7d", items: [] },
// ];

// const categoryIdMap: Record<string, number> = {
//     "Important Notes": 1,
//     "House Rules & Routines": 3,
//     "Shopping Lists": 4,
//     "Birthday & Gift Ideas": 5,
//     "Meal Ideas & Recipes": 6,
// };

// const categoryIdMapReverse: Record<number, string> = Object.entries(
//     categoryIdMap
// ).reduce((acc, [title, id]) => {
//     acc[id] = title;
//     return acc;
// }, {} as Record<number, string>);

// const FamilyNotes = () => {
//     const [categories, setCategories] = useState<Category[]>(defaultCategories);
//     const [modalOpen, setModalOpen] = useState<boolean>(false);
//     const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
//         null
//     );
//     const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
//     const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
//     const [showNoteForm, setShowNoteForm] = useState<boolean>(false);
//     const { loading, setLoading } = useGlobalLoading();
//     const [newCategoryModal, setNewCategoryModal] = useState<boolean>(false);
//     const [newCategoryName, setNewCategoryName] = useState<string>("");

//     useEffect(() => {
//         getNotes();
//     }, []);

//     const getNotes = async () => {
//         setLoading(true);
//         try {
//             const response = await getAllNotes();
//             const rawNotes = response.data.payload;
//             const grouped: Record<number, Note[]> = {};
//             rawNotes.forEach((note: any) => {
//                 const catId = note.category_id;
//                 if (!catId || !categoryIdMapReverse[catId]) return;
//                 if (!grouped[catId]) grouped[catId] = [];
//                 grouped[catId].unshift({
//                     title: note.title,
//                     description: note.description,
//                     created_at: note.created_at,
//                 });
//             });
//             const updatedCategories = defaultCategories.map((cat) => {
//                 const catId = categoryIdMap[cat.title];
//                 return { ...cat, items: grouped[catId] || [] };
//             });
//             setCategories(updatedCategories);
//         } catch (error) {
//             message.error("Failed to load notes");
//         }
//         setLoading(false);
//     };

//     const openModal = (index: number) => {
//         setActiveCategoryIndex(index);
//         setModalOpen(true);
//         setShowNoteForm(false);
//         setEditingNoteIndex(null);
//         setNewNote({ title: "", description: "" });
//     };

//     const handleEditNote = (note: Note, idx: number) => {
//         setEditingNoteIndex(idx);
//         setNewNote({ ...note });
//         setShowNoteForm(true);
//     };

//     const handleSaveNote = async () => {
//         if (activeCategoryIndex === null) return;
//         const categoryTitle = categories[activeCategoryIndex].title;
//         const category_id = categoryIdMap[categoryTitle];

//         if (!newNote.title.trim() || !newNote.description.trim()) {
//             message.error("Please fill in all fields");
//             return;
//         }

//         setLoading(true);
//         try {
//             if (editingNoteIndex !== null) {
//                 const rawNotes = await getAllNotes();
//                 const fullNote = rawNotes.data.payload.find(
//                     (note: any) =>
//                         note.title ===
//                         categories[activeCategoryIndex].items[editingNoteIndex].title &&
//                         note.description ===
//                         categories[activeCategoryIndex].items[editingNoteIndex]
//                             .description &&
//                         note.category_id === category_id
//                 );
//                 if (!fullNote) {
//                     message.error("Note not found");
//                     setLoading(false);
//                     return;
//                 }
//                 const res = await updateNote({
//                     id: fullNote.id,
//                     title: newNote.title,
//                     description: newNote.description,
//                     category_id,
//                 });
//                 if (res.data.status === 1) {
//                     message.success("Note updated");
//                     await getNotes();
//                 }
//             } else {
//                 const user_id = localStorage.getItem("userId") || "";
//                 const res = await addNote({
//                     title: newNote.title,
//                     description: newNote.description,
//                     category_id,
//                     user_id,
//                 });
//                 if (res.data.status === 1) {
//                     message.success("Note added");
//                     await getNotes();
//                 }
//             }
//             setShowNoteForm(false);
//             setEditingNoteIndex(null);
//             setNewNote({ title: "", description: "" });
//         } catch (err) {
//             message.error("Something went wrong");
//         }
//         setLoading(false);
//     };

//     const handleAddCategory = () => {
//         const name = newCategoryName.trim();
//         if (!name) return;
//         if (categories.some((c) => c.title === name)) {
//             message.error("Category already exists");
//             return;
//         }
//         setCategories([
//             ...categories,
//             { title: name, icon: "\ud83d\udcc1", items: [] },
//         ]);
//         setNewCategoryModal(false);
//         setNewCategoryName("");
//     };

//     return (
//         <>
//             <div
//                 style={{
//                     padding: 24,
//                     backgroundColor: "#fff",
//                     width: 430,
//                     borderRadius: 16,
//                     position: "relative",
//                 }}
//             >
//                 <h2
//                     style={{
//                         fontSize: 18,
//                         fontWeight: 600,
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 8,
//                     }}
//                 >
//                     <FileTextOutlined /> Notes & Lists
//                 </h2>
//                 <div
//                     style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 16,
//                         marginTop: 20,
//                     }}
//                 >
//                     {categories.map((category, index) => (
//                         <div
//                             key={index}
//                             onClick={() => openModal(index)}
//                             style={{
//                                 borderRadius: 12,
//                                 padding: 12,
//                                 border: "1px solid #e0e0e0",
//                                 backgroundColor: "#f9f9f9",
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 alignItems: "center",
//                                 cursor: "pointer",
//                             }}
//                         >
//                             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                                 <div
//                                     style={{
//                                         width: 34,
//                                         height: 34,
//                                         background: `${categoryColorMap[category.title]}20`,
//                                         borderRadius: 10,
//                                         display: "flex",
//                                         justifyContent: "center",
//                                         alignItems: "center",
//                                     }}
//                                 >
//                                     {category.icon}
//                                 </div>
//                                 <span style={{ fontWeight: 600 }}>{category.title}</span>
//                             </div>
//                             <RightOutlined style={{ fontSize: 14, color: "#666" }} />
//                         </div>
//                     ))}
//                 </div>

//                 {/* Floating + button */}
//                 <Button
//                     shape="default"
//                     icon={<PlusOutlined />}
//                     onClick={() => setNewCategoryModal(true)}
//                     style={{
//                         position: "absolute",
//                         top: 24,
//                         right: 24,
//                         width: 44,
//                         height: 44,
//                         borderRadius: 12,
//                         backgroundColor: "#1677ff",
//                         color: "white",
//                         boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//                         border: "none",
//                         zIndex: 10,
//                     }}
//                 />
//             </div>

//             <Modal
//                 open={newCategoryModal}
//                 onCancel={() => setNewCategoryModal(false)}
//                 onOk={handleAddCategory}
//                 centered
//                 width={400}
//                 okText="Add"
//             >
//                 <div style={{ padding: 24 }}>
//                     <Input
//                         placeholder="New Category Name"
//                         value={newCategoryName}
//                         onChange={(e) => setNewCategoryName(e.target.value)}
//                         style={{ marginBottom: 20 }}
//                     />
//                 </div>
//             </Modal>

//             <Modal
//                 open={modalOpen}
//                 footer={[
//                     <Button key="cancel" onClick={() => setModalOpen(false)}>
//                         Cancel
//                     </Button>,
//                 ]}
//                 centered
//                 width={550}
//                 closeIcon={false}
//             >
//                 {activeCategoryIndex !== null && (
//                     <div>
//                         <div
//                             style={{
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 alignItems: "center",
//                                 marginBottom: 15,
//                             }}
//                         >
//                             <span style={{ fontSize: 22, fontWeight: 600 }}>
//                                 {categories[activeCategoryIndex].icon}{" "}
//                                 {categories[activeCategoryIndex].title}
//                             </span>
//                             <Button
//                                 type="primary"
//                                 shape="default"
//                                 icon={<PlusOutlined />}
//                                 onClick={() => {
//                                     setShowNoteForm(true);
//                                     setEditingNoteIndex(null);
//                                     setNewNote({ title: "", description: "" });
//                                 }}
//                                 style={{
//                                     position: "absolute",
//                                     top: 20,
//                                     right: 44,
//                                     width: 34,
//                                     height: 34,
//                                     borderRadius: 12,
//                                     backgroundColor: "#1677ff",
//                                     color: "white",
//                                     boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//                                     border: "none",
//                                 }}
//                             />
//                         </div>

//                         <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
//                             {categories[activeCategoryIndex].items.map((note, idx) => (
//                                 <div
//                                     key={idx}
//                                     style={{
//                                         border: "1px solid #f0f0f0",
//                                         borderRadius: 8,
//                                         padding: 12,
//                                         marginBottom: 12,
//                                         backgroundColor: "#f9fafb",
//                                         display: "flex",
//                                         justifyContent: "space-between",
//                                         alignItems: "center",
//                                     }}
//                                 >
//                                     <div>
//                                         <div>
//                                             <strong>
//                                                 {idx + 1}. {note.title}
//                                             </strong>{" "}
//                                             — {note.description}
//                                         </div>
//                                         {note.created_at && (
//                                             <div style={{ fontSize: 10, color: "#888" }}>
//                                                 {new Date(note.created_at).toLocaleString()}
//                                             </div>
//                                         )}
//                                     </div>

//                                     <Button
//                                         icon={<EditOutlined />}
//                                         size="small"
//                                         onClick={() => handleEditNote(note, idx)}
//                                     />
//                                 </div>
//                             ))}
//                         </div>

//                         {showNoteForm && (
//                             <div style={{ marginTop: 20 }}>
//                                 <Input
//                                     placeholder="Note Title"
//                                     value={newNote.title}
//                                     onChange={(e) =>
//                                         setNewNote({ ...newNote, title: e.target.value })
//                                     }
//                                     style={{ marginBottom: 12 }}
//                                 />
//                                 <Input
//                                     placeholder="Note Description"
//                                     value={newNote.description}
//                                     onChange={(e) =>
//                                         setNewNote({ ...newNote, description: e.target.value })
//                                     }
//                                     style={{ marginBottom: 20 }}
//                                 />
//                                 <Button
//                                     type="primary"
//                                     block
//                                     onClick={handleSaveNote}
//                                     loading={loading}
//                                 >
//                                     {editingNoteIndex !== null ? "Update Note" : "Add Note"}
//                                 </Button>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </Modal>
//         </>
//     );
// };

// export default FamilyNotes;





"use client";
import {
    EditOutlined,
    FileTextOutlined,
    PlusOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Modal } from "antd";
import { useState, useEffect } from "react";
import {
    getAllNotes,
    updateNote,
    addNote,
    addNoteCategory,
    getNoteCategories,
} from "../../../services/family";

interface Note {
    title: string;
    description: string;
    created_at?: string;
}

interface Category {
    title: string;
    icon: string;
    items: Note[];
    category_id?: number;
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
    { title: "Shopping Lists", icon: "🛕", items: [] },
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

const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, "0")}`;
};

const FamilyNotes = () => {
    const [categories, setCategories] = useState<Category[]>(defaultCategories);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
        null
    );
    const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
    const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
    const [showNoteForm, setShowNoteForm] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [newCategoryModal, setNewCategoryModal] = useState<boolean>(false);
    const [newCategoryName, setNewCategoryName] = useState<string>("");

    useEffect(() => {
        fetchCategoriesAndNotes();
    }, []);

    const fetchCategoriesAndNotes = async () => {
        try {
            setLoading(true);
            // Fetch categories and notes in parallel
            const [categoriesRes, notesRes] = await Promise.all([
                getNoteCategories(),
                getAllNotes(),
            ]);

            const categoriesPayload: ApiCategory[] = categoriesRes.data.payload;
            const rawNotes: ApiNote[] = notesRes.data.payload;

            // Process categories
            const customCategories: Category[] = categoriesPayload.map((cat) => ({
                title: cat.title,
                icon: cat.icon || "✍",
                items: [],
                category_id: cat.id,
            }));

            const updatedDefaultCategories = defaultCategories.map((cat) => ({
                ...cat,
                items: [],
            }));

            const allCategories = [...updatedDefaultCategories, ...customCategories];

            // Process notes and group them by category
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
                    title: note.title,
                    description: note.description,
                    created_at: note.created_at,
                });
            });

            // Merge notes with categories
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
                const rawNotes = await getAllNotes();
                const fullNote = rawNotes.data.payload.find(
                    (note: ApiNote) =>
                        note.title ===
                        categories[activeCategoryIndex].items[editingNoteIndex].title &&
                        note.description ===
                        categories[activeCategoryIndex].items[editingNoteIndex]
                            .description &&
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
                    category_id: category_id ?? 0,
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

    return (
        <>
            <div
                style={{
                    padding: 24,
                    backgroundColor: "#fff",
                    width: 430,
                    borderRadius: 16,
                    position: "relative",
                    maxHeight: "70vh",
                    overflowY: "auto",
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
                    <FileTextOutlined /> Notes & Lists
                </h2>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        marginTop: 20,
                    }}
                >
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
                                <RightOutlined style={{ fontSize: 14, color: "#666" }} />
                            </div>
                        </div>
                    ))}
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

            <Modal
                open={newCategoryModal}
                onCancel={() => setNewCategoryModal(false)}
                onOk={handleAddCategory}
                centered
                width={400}
                okText="Add"
                closable={false}
                footer={[
                    <Button key="submit" type="primary" onClick={handleAddCategory}>
                        Add Category
                    </Button>,
                ]}
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
                            {showNoteForm && (
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

export default FamilyNotes;

