

// "use client";

// import React, { ForwardRefExoticComponent, RefAttributes, useEffect, useState } from "react";
// import {
//     Card,
//     Button,
//     Input,
//     Select,
//     Dropdown,
//     Menu,
//     Tag,
//     Typography,
//     Space,
//     Row,
//     Col,
//     Modal,
//     Form,
//     message,
//     DatePicker,
// } from "antd";
// import {
//     HomeOutlined,
//     PlusOutlined,
//     EditOutlined,
//     DeleteOutlined,
//     SearchOutlined,
//     TagOutlined,
//     CalendarOutlined,
//     FileTextOutlined,
//     RightOutlined,
//     ClockCircleOutlined,
//     ExclamationCircleOutlined,
//     PlayCircleOutlined,
//     CheckCircleOutlined,
// } from "@ant-design/icons";
// import {
//     getAllNotes,
//     updateNote,
//     addNote,
//     addNoteCategory,
//     getNoteCategories,
// } from "../../../services/family";
// import { addNotes, getNotes } from "../../../services/notes";
// import { showNotification } from "../../../utils/notification";
// import dayjs from "dayjs";
// import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";

// const { Title, Text } = Typography;
// const { TextArea } = Input;
// const { Option } = Select;

// // Types
// interface StickyNoteData {
//     id: number;
//     title: string;
//     description: string;
//     reminderDate: string;
//     status: number;
// }

// interface Note {
//     id?: number;
//     title: string;
//     description: string;
//     created_at?: string;
// }

// interface Category {
//     title: string;
//     icon: string;
//     items: Note[];
//     category_id?: number;
//     id?: number;
// }

// interface ApiCategory {
//     id: number;
//     title: string;
//     icon: string;
// }

// interface ApiNote {
//     id: number;
//     title: string;
//     description: string;
//     category_id: number;
//     category_name?: string;
//     created_at: string;
// }

// interface StatusConfig {
//     [key: number]: {
//         label: string;
//         color: string;
//         icon: ForwardRefExoticComponent<Omit<AntdIconProps, "ref"> & RefAttributes<HTMLSpanElement>>;
//         bgColor: string;
//         borderColor: string;
//     };
// }
// // Status configuration for Sticky Notes
// const statusConfig: StatusConfig = {
//     3: {
//         label: "Yet to Start",
//         color: "#fa8c16",
//         icon: ClockCircleOutlined,
//         bgColor: "#fff7e6",
//         borderColor: "#ffd591",
//     },
//     0: {
//         label: "Due",
//         color: "#f5222d",
//         icon: ExclamationCircleOutlined,
//         bgColor: "#fff2f0",
//         borderColor: "#ffccc7",
//     },
//     1: {
//         label: "In Progress",
//         color: "#1890ff",
//         icon: PlayCircleOutlined,
//         bgColor: "#f0f5ff",
//         borderColor: "#adc6ff",
//     },
//     2: {
//         label: "Done",
//         color: "#52c41a",
//         icon: CheckCircleOutlined,
//         bgColor: "#f6ffed",
//         borderColor: "#b7eb8f",
//     },
// };

// // Status mapping for backend
// const statusMap: Record<"Done" | "In Progress" | "Yet to Start" | "Due", number> = {
//     Done: 2,
//     "In Progress": 1,
//     Due: 0,
//     "Yet to Start": 3,
// };

// const numberToStatusMap: Record<number, string> = Object.entries(statusMap).reduce(
//     (acc, [key, value]) => {
//         acc[value] = key;
//         return acc;
//     },
//     {} as Record<number, string>
// );

// // Category configurations
// const categoryColorMap: Record<string, { color: string; background: string }> = {
//     "Important Notes": { color: "#ef4444", background: "#fef2f2" },
//     "House Rules & Routines": { color: "#10b981", background: "#f0fdf4" },
//     "Shopping Lists": { color: "#3b82f6", background: "#eff6ff" },
//     "Birthday & Gift Ideas": { color: "#ec4899", background: "#fdf2f8" },
//     "Meal Ideas & Recipes": { color: "#8b5cf6", background: "#f3f4f6" },
// };

// const defaultCategories: Category[] = [
//     { title: "Important Notes", icon: "📌", items: [] },
//     { title: "House Rules & Routines", icon: "🏠", items: [] },
//     { title: "Shopping Lists", icon: "🛒", items: [] },
//     { title: "Birthday & Gift Ideas", icon: "🎁", items: [] },
//     { title: "Meal Ideas & Recipes", icon: "🍽", items: [] },
// ];

// const categoryIdMap: Record<string, number> = {
//     "Important Notes": 1,
//     "House Rules & Routines": 3,
//     "Shopping Lists": 4,
//     "Birthday & Gift Ideas": 5,
//     "Meal Ideas & Recipes": 6,
// };

// const categoryIdMapReverse: Record<number, string> = Object.entries(categoryIdMap).reduce(
//     (acc, [title, id]) => {
//         acc[id] = title;
//         return acc;
//     },
//     {} as Record<number, string>
// );

// const stringToColor = (str: string): { color: string; background: string } => {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//         hash = str.charCodeAt(i) + ((hash << 5) - hash);
//     }
//     const color = Math.abs(hash).toString(16).substring(0, 6);
//     const colorHex = `#${color.padStart(6, "0")}`;
//     return {
//         color: colorHex,
//         background: `${colorHex}15`,
//     };
// };

// const IntegratedFamilyNotes = () => {
//     // State
//     const [categories, setCategories] = useState<Category[]>(defaultCategories);
//     const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
//     const [activeTab, setActiveTab] = useState("notes");
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("All");
//     const [loading, setLoading] = useState(false);

//     // Modal states
//     const [categoryModalOpen, setCategoryModalOpen] = useState(false);
//     const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
//     const [newNote, setNewNote] = useState<Note>({ title: "", description: "" });
//     const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
//     const [showNoteForm, setShowNoteForm] = useState(false);
//     const [newCategoryModal, setNewCategoryModal] = useState(false);
//     const [newCategoryName, setNewCategoryName] = useState("");
//     const [editingSticky, setEditingSticky] = useState<number | null>(null);

//     // Sticky Notes Modal states
//     const [stickyModalOpen, setStickyModalOpen] = useState(false);
//     const [stickyModalMode, setStickyModalMode] = useState<"create" | "edit">("create");
//     const [editingStickyId, setEditingStickyId] = useState<number | null>(null);

//     const [form] = Form.useForm();
//     const [stickyForm] = Form.useForm();

//     useEffect(() => {
//         fetchCategoriesAndNotes();
//         fetchStickyNotes();
//     }, []);

//     // Fetch sticky notes from backend
//     const fetchStickyNotes = async () => {
//         try {
//             const response = await getNotes({});
//             const { status, message: msg, payload } = response.data;
//             if (status) {
//                 setStickyNotes(payload.notes);
//             } else {
//                 showNotification("Error", msg, "error");
//             }
//         } catch (error) {
//             console.error("Error fetching sticky notes:", error);
//             showNotification("Error", "Failed to fetch sticky notes", "error");
//         }
//     };

//     const fetchCategoriesAndNotes = async () => {
//         try {
//             setLoading(true);
//             const [categoriesRes, notesRes] = await Promise.all([
//                 getNoteCategories(),
//                 getAllNotes(),
//             ]);

//             const categoriesPayload: ApiCategory[] = categoriesRes.data.payload;
//             const rawNotes: ApiNote[] = notesRes.data.payload;

//             const customCategories: Category[] = categoriesPayload.map((cat) => ({
//                 title: cat.title,
//                 icon: cat.icon || "✍",
//                 items: [],
//                 category_id: cat.id,
//                 id: cat.id,
//             }));

//             const updatedDefaultCategories = defaultCategories.map((cat) => ({
//                 ...cat,
//                 items: [],
//             }));

//             const allCategories = [...updatedDefaultCategories, ...customCategories];

//             const groupedNotes: Record<string, Note[]> = {};

//             rawNotes.forEach((note) => {
//                 let catTitle = categoryIdMapReverse[note.category_id];
//                 if (!catTitle && note.category_name) {
//                     catTitle = note.category_name;
//                 }
//                 if (!catTitle) {
//                     catTitle = "Others";
//                 }

//                 if (!groupedNotes[catTitle]) groupedNotes[catTitle] = [];

//                 groupedNotes[catTitle].unshift({
//                     id: note.id,
//                     title: note.title,
//                     description: note.description,
//                     created_at: note.created_at,
//                 });
//             });

//             const finalCategories = allCategories.map((cat) => ({
//                 ...cat,
//                 items: groupedNotes[cat.title] || [],
//             }));

//             setCategories(finalCategories);
//         } catch (err) {
//             message.error("Failed to load data");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Sticky Notes Functions
//     const addStickyNote = (status: number) => {
//         setStickyModalMode("create");
//         stickyForm.setFieldsValue({
//             reminderDate: dayjs(),
//             status: numberToStatusMap[status],
//         });
//         setStickyModalOpen(true);
//     };

//     const updateStickyNote = (note: StickyNoteData) => {
//         setStickyModalMode("edit");
//         setEditingStickyId(note.id);
//         stickyForm.setFieldsValue({
//             title: note.title,
//             description: note.description,
//             reminderDate: dayjs(note.reminderDate),
//             status: numberToStatusMap[note.status],
//             id: note.id,
//         });
//         setStickyModalOpen(true);
//     };

//     const deleteStickyNote = async (id: number) => {
//         try {
//             setStickyNotes((notes) => notes.filter((note) => note.id !== id));
//             showNotification("Success", "Note deleted successfully", "success");
//         } catch (error) {
//             showNotification("Error", "Failed to delete note", "error");
//         }
//     };

//     const handleSaveStickyNote = async () => {
//         setLoading(true);
//         try {
//             const values = await stickyForm.validateFields();
//             const statusNumber = statusMap[values.status as keyof typeof statusMap] ?? -1;

//             if (stickyModalMode === "create") {
//                 values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
//                 values.status = statusNumber;
//                 const response = await addNotes(values);
//                 const { status, message } = response.data;
//                 if (status) {
//                     showNotification("Success", message, "success");
//                     fetchStickyNotes();
//                 }
//             } else {
//                 values.reminderDate = values.reminderDate.format("YYYY-MM-DD");
//                 values.status = statusNumber;
//                 const response = await addNotes({
//                     id: values.id,
//                     editing: true,
//                     ...values,
//                 });
//                 const { status, message } = response.data;
//                 if (status) {
//                     showNotification("Success", message, "success");
//                     fetchStickyNotes();
//                 }
//             }
//             setStickyModalOpen(false);
//             stickyForm.resetFields();
//             setEditingStickyId(null);
//         } catch (error) {
//             console.error("Validation failed:", error);
//         }
//         setLoading(false);
//     };

//     const closeStickyModal = () => {
//         setStickyModalOpen(false);
//         stickyForm.resetFields();
//         setEditingStickyId(null);
//     };

//     const getNotesByStatus = (status: number) => {
//         return stickyNotes.filter((note) => note.status === status);
//     };

//     // Category modal functions
//     const openCategoryModal = (index: number) => {
//         setActiveCategoryIndex(index);
//         setCategoryModalOpen(true);
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
//         const category_id = categoryIdMap[categoryTitle] || categories[activeCategoryIndex].category_id;

//         if (!newNote.title.trim() || !newNote.description.trim()) {
//             message.error("Please fill in all fields");
//             return;
//         }

//         setLoading(true);
//         try {
//             if (editingNoteIndex !== null) {
//                 const rawNotes = await getAllNotes();
//                 const fullNote = rawNotes.data.payload.find(
//                     (note: ApiNote) =>
//                         note.title === categories[activeCategoryIndex].items[editingNoteIndex].title &&
//                         note.description === categories[activeCategoryIndex].items[editingNoteIndex].description &&
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
//                     category_id: category_id as number,
//                 });
//                 if (res.data.status === 1) {
//                     message.success("Note updated");
//                     await fetchCategoriesAndNotes();
//                 }
//             } else {
//                 const user_id = localStorage.getItem("userId") || "";
//                 const res = await addNote({
//                     title: newNote.title,
//                     description: newNote.description,
//                     category_id: category_id as number,
//                     user_id,
//                 });
//                 if (res.data.status === 1) {
//                     message.success("Note added");
//                     await fetchCategoriesAndNotes();
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

//     const handleAddCategory = async () => {
//         const name = newCategoryName.trim();
//         if (!name) return;
//         if (categories.some((c) => c.title === name)) {
//             message.error("Category already exists");
//             return;
//         }

//         setLoading(true);
//         try {
//             const user_id = localStorage.getItem("userId") || "";
//             const res = await addNoteCategory({ name, icon: "✍", user_id });

//             if (res.data.status === 1) {
//                 message.success("Category added");
//                 setNewCategoryModal(false);
//                 setNewCategoryName("");
//                 await fetchCategoriesAndNotes();
//             } else {
//                 message.error("Failed to add category");
//             }
//         } catch (err) {
//             message.error("Something went wrong");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Filtered categories
//     const filteredCategories = categories.filter((category) => {
//         const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase());
//         return matchesSearch;
//     });

//     // Render Sticky Note
//     const renderStickyNote = (note: StickyNoteData) => {
//         const config = statusConfig[note.status];
//         const Icon = config.icon;

//         const statusMenu = (
//             <Menu
//                 onClick={({ key }) => {
//                     const updatedNote = { ...note, status: parseInt(key) };
//                     updateStickyNote(updatedNote);
//                 }}
//             >
//                 {Object.entries(statusConfig).map(([status, cfg]) => {
//                     const StatusIcon = cfg.icon;
//                     return (
//                         <Menu.Item key={status} icon={<StatusIcon style={{ color: cfg.color }} />}>
//                             {cfg.label}
//                         </Menu.Item>
//                     );
//                 })}
//             </Menu>
//         );

//         return (
//             <Card
//                 key={note.id}
//                 size="small"
//                 style={{
//                     backgroundColor: config.bgColor,
//                     marginBottom: 12,
//                     borderRadius: 8,
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                     transition: "all 0.3s ease",
//                 }}
//                 bodyStyle={{ padding: 12 }}
//                 onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = "translateY(-2px)";
//                     e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
//                 }}
//                 onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = "translateY(0)";
//                     e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
//                 }}
//             >
//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "flex-start",
//                         marginBottom: 8,
//                     }}
//                 >
//                     <Dropdown overlay={statusMenu} trigger={["click"]}>
//                         <Button
//                             size="small"
//                             type="text"
//                             icon={<Icon style={{ color: config.color }} />}
//                             style={{
//                                 backgroundColor: "rgba(255,255,255,0.6)",
//                                 border: "none",
//                                 borderRadius: 4,
//                             }}
//                         />
//                     </Dropdown>

//                     <Space>
//                         <Button
//                             size="small"
//                             type="text"
//                             icon={<EditOutlined />}
//                             onClick={() => updateStickyNote(note)}
//                             style={{ color: "#666" }}
//                         />
//                         <Button
//                             size="small"
//                             type="text"
//                             icon={<DeleteOutlined />}
//                             onClick={() => deleteStickyNote(note.id)}
//                             style={{ color: "#ff4d4f" }}
//                         />
//                     </Space>
//                 </div>

//                 <div style={{ minHeight: 60 }}>
//                     <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{note.title}</div>
//                     <Text style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "#666" }}>
//                         {note.description}
//                     </Text>
//                     {note.reminderDate && (
//                         <div
//                             style={{
//                                 fontSize: 11,
//                                 color: "#999",
//                                 marginTop: 4,
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 4,
//                             }}
//                         >
//                             <CalendarOutlined />
//                             {dayjs(note.reminderDate).format("MMM DD, YYYY")}
//                         </div>
//                     )}
//                 </div>
//             </Card>
//         );
//     };

//     // Render category card
//     const renderCategoryCard = (category: Category, index: number) => {
//         const categoryColor = categoryColorMap[category.title] || stringToColor(category.title);

//         return (
//             <Card
//                 key={index}
//                 style={{
//                     marginBottom: 16,
//                     borderRadius: 12,
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                     transition: "all 0.3s ease",
//                     height: 300,
//                     display: "flex",
//                     flexDirection: "column",
//                     cursor: "pointer",
//                 }}
//                 bodyStyle={{
//                     padding: 20,
//                     flex: 1,
//                     display: "flex",
//                     flexDirection: "column",
//                     overflow: "hidden",
//                 }}
//                 onClick={() => openCategoryModal(index)}
//                 onMouseEnter={(e) => {
//                     e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
//                     e.currentTarget.style.transform = "translateY(-2px)";
//                 }}
//                 onMouseLeave={(e) => {
//                     e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
//                     e.currentTarget.style.transform = "translateY(0)";
//                 }}
//             >
//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "flex-start",
//                         marginBottom: 16,
//                     }}
//                 >
//                     <div style={{ flex: 1 }}>
//                         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
//                             <div
//                                 style={{
//                                     width: 40,
//                                     height: 40,
//                                     background: categoryColor.background,
//                                     borderRadius: 12,
//                                     display: "flex",
//                                     justifyContent: "center",
//                                     alignItems: "center",
//                                     fontSize: 20,
//                                 }}
//                             >
//                                 {category.icon}
//                             </div>
//                             <Title level={4} style={{ margin: 0, color: "#333" }}>
//                                 {category.title}
//                             </Title>
//                         </div>

//                         <Tag
//                             color={categoryColor.color}
//                             style={{
//                                 backgroundColor: categoryColor.background,
//                                 border: `1px solid ${categoryColor.color}`,
//                                 borderRadius: 12,
//                                 color: categoryColor.color,
//                             }}
//                         >
//                             <TagOutlined /> {category.items.length} notes
//                         </Tag>
//                     </div>

//                     <RightOutlined style={{ fontSize: 16, color: "#999" }} />
//                 </div>

//                 <div
//                     style={{
//                         flex: 1,
//                         overflowY: "auto",
//                         marginBottom: 16,
//                         paddingRight: 8,
//                         maxHeight: 150,
//                     }}
//                 >
//                     {category.items.length === 0 ? (
//                         <div style={{ textAlign: "center", color: "#999", padding: 20 }}>
//                             <FileTextOutlined style={{ fontSize: 32, marginBottom: 8 }} />
//                             <div>No notes yet</div>
//                             <div style={{ fontSize: 12 }}>Click to add your first note</div>
//                         </div>
//                     ) : (
//                         <div>
//                             {category.items.slice(0, 3).map((note, idx) => (
//                                 <div
//                                     key={idx}
//                                     style={{
//                                         padding: 8,
//                                         backgroundColor: "#f8f9fa",
//                                         borderRadius: 6,
//                                         marginBottom: 6,
//                                         fontSize: 12,
//                                     }}
//                                 >
//                                     <div style={{ fontWeight: 600 }}>{note.title}</div>
//                                     <div style={{ color: "#666", marginTop: 2 }}>
//                                         {note.description.substring(0, 50)}
//                                         {note.description.length > 50 && "..."}
//                                     </div>
//                                 </div>
//                             ))}
//                             {category.items.length > 3 && (
//                                 <div style={{ fontSize: 12, color: "#999", textAlign: "center" }}>
//                                     +{category.items.length - 3} more notes
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                         marginTop: "auto",
//                     }}
//                 >
//                     <Space style={{ color: "#999", fontSize: 12 }}>
//                         <CalendarOutlined />
//                         {category.items.length > 0 && category.items[0].created_at
//                             ? new Date(category.items[0].created_at).toLocaleDateString()
//                             : "No activity"}
//                     </Space>
//                 </div>
//             </Card>
//         );
//     };

//     return (
//         <div
//             style={{
//                 minHeight: "100vh",
//                 padding: 24,
//                 background: "#F5F5F5",
//                 paddingRight: 10,
//                 paddingLeft: 100,
//             }}
//         >
//             <div style={{ maxWidth: 1280, margin: "0 auto" }}>
//                 {/* Header */}
//                 <div style={{ textAlign: "center", marginBottom: 32 }}>
//                     <div
//                         style={{
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             gap: 12,
//                             marginBottom: 16,
//                             marginLeft: 0,
//                             marginRight: "auto",
//                         }}
//                     >
//                         <HomeOutlined style={{ fontSize: 32, color: "#6366f1" }} />
//                     </div>
//                 </div>

//                 {/* Professional Tabs */}
//                 <div
//                     style={{
//                         display: "flex",
//                         justifyContent: "center",
//                         marginBottom: 32,
//                     }}
//                 >
//                     <div
//                         style={{
//                             backgroundColor: "white",
//                             borderRadius: 16,
//                             padding: 6,
//                             boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
//                             border: "1px solid rgba(255,255,255,0.2)",
//                             backdropFilter: "blur(10px)",
//                         }}
//                     >
//                         <Button.Group>
//                             <Button
//                                 type={activeTab === "sticky-notes" ? "primary" : "text"}
//                                 icon={<TagOutlined />}
//                                 onClick={() => setActiveTab("sticky-notes")}
//                                 style={{
//                                     borderRadius: 12,
//                                     fontWeight: 600,
//                                     fontSize: 15,
//                                     padding: "12px 24px",
//                                     height: "auto",
//                                     backgroundColor: activeTab === "sticky-notes" ? "#6366f1" : "transparent",
//                                     borderColor: activeTab === "sticky-notes" ? "#6366f1" : "transparent",
//                                     color: activeTab === "sticky-notes" ? "white" : "#6b7280",
//                                     boxShadow: activeTab === "sticky-notes" ? "0 4px 12px #6366f140" : "none",
//                                 }}
//                             >
//                                 Sticky Notes
//                             </Button>
//                             <Button
//                                 type={activeTab === "notes" ? "primary" : "text"}
//                                 icon={<FileTextOutlined />}
//                                 onClick={() => setActiveTab("notes")}
//                                 style={{
//                                     borderRadius: 12,
//                                     fontWeight: 600,
//                                     fontSize: 15,
//                                     padding: "12px 24px",
//                                     height: "auto",
//                                     backgroundColor: activeTab === "notes" ? "#8b5cf6" : "transparent",
//                                     borderColor: activeTab === "notes" ? "#8b5cf6" : "transparent",
//                                     color: activeTab === "notes" ? "white" : "#6b7280",
//                                     boxShadow: activeTab === "notes" ? "0 4px 12px #8b5cf640" : "none",
//                                 }}
//                             >
//                                 Notes
//                             </Button>
//                         </Button.Group>
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div
//                     style={{
//                         opacity: 1,
//                         transform: "translateY(0)",
//                         transition: "all 0.3s ease-in-out",
//                     }}
//                 >
//                     {activeTab === "sticky-notes" && (
//                         <div>
//                             <div
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     alignItems: "center",
//                                     marginBottom: 24,
//                                 }}
//                             >
//                                 <Title level={2} style={{ margin: 0, color: "#333" }}>
//                                     Sticky Notes
//                                 </Title>
//                             </div>

//                             <Row gutter={24}>
//                                 {Object.entries(statusConfig).map(([status, config]) => {
//                                     const Icon = config.icon;
//                                     const notes = getNotesByStatus(parseInt(status));

//                                     return (
//                                         <Col key={status} xs={24} sm={12} lg={6}>
//                                             <Card
//                                                 title={
//                                                     <div
//                                                         style={{
//                                                             display: "flex",
//                                                             alignItems: "center",
//                                                             justifyContent: "space-between",
//                                                         }}
//                                                     >
//                                                         <div
//                                                             style={{
//                                                                 display: "flex",
//                                                                 alignItems: "center",
//                                                                 gap: 8,
//                                                             }}
//                                                         >
//                                                             <Icon style={{ color: config.color }} />
//                                                             <span style={{ color: config.color, fontWeight: 600 }}>
//                                                                 {config.label}
//                                                             </span>
//                                                             <Tag color={config.color} style={{ minWidth: 20, textAlign: "center" }}>
//                                                                 {notes.length}
//                                                             </Tag>
//                                                         </div>
//                                                         <Button
//                                                             size="small"
//                                                             type="text"
//                                                             icon={<PlusOutlined />}
//                                                             onClick={() => addStickyNote(parseInt(status))}
//                                                             style={{ color: config.color }}
//                                                         />
//                                                     </div>
//                                                 }
//                                                 style={{
//                                                     backgroundColor: config.bgColor,
//                                                     borderWidth: 2,
//                                                     borderRadius: 12,
//                                                     height: 400,
//                                                     overflowY: "auto",
//                                                 }}
//                                                 bodyStyle={{
//                                                     padding: 16,
//                                                 }}
//                                             >
//                                                 {notes.length === 0 ? (
//                                                     <div
//                                                         style={{
//                                                             textAlign: "center",
//                                                             color: "#999",
//                                                             padding: 20,
//                                                             cursor: "pointer",
//                                                         }}
//                                                         onClick={() => addStickyNote(parseInt(status))}
//                                                     >
//                                                         <TagOutlined style={{ fontSize: 32, marginBottom: 8 }} />
//                                                         <div>No notes yet</div>
//                                                         <div style={{ fontSize: 12 }}>Click to add your first note</div>
//                                                     </div>
//                                                 ) : (
//                                                     notes.map(renderStickyNote)
//                                                 )}
//                                             </Card>
//                                         </Col>
//                                     );
//                                 })}
//                             </Row>
//                         </div>
//                     )}

//                     {activeTab === "notes" && (
//                         <div>
//                             {/* Notes Section */}
//                             <div
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     alignItems: "center",
//                                     marginBottom: 24,
//                                 }}
//                             >
//                                 <Title level={2} style={{ margin: 0, color: "#333" }}>
//                                     Notes Categories
//                                 </Title>
//                                 <Button
//                                     type="primary"
//                                     icon={<PlusOutlined />}
//                                     onClick={() => setNewCategoryModal(true)}
//                                     style={{ borderRadius: 8, marginRight: 20 }}
//                                 >
//                                 </Button>
//                             </div>

//                             {/* Search */}
//                             <Row gutter={16} style={{ marginBottom: 24 }}>
//                                 <Col xs={24} sm={16}>
//                                     <Input
//                                         placeholder="Search categories..."
//                                         prefix={<SearchOutlined />}
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                         style={{ borderRadius: 8 }}
//                                     />
//                                 </Col>
//                             </Row>

//                             {/* Categories Grid */}
//                             <Row gutter={16}>
//                                 {filteredCategories.map((category, index) => (
//                                     <Col key={index} xs={24} md={12} lg={8}>
//                                         {renderCategoryCard(category, index)}
//                                     </Col>
//                                 ))}
//                             </Row>

//                             {filteredCategories.length === 0 && (
//                                 <div style={{ textAlign: "center", padding: 48 }}>
//                                     <SearchOutlined style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }} />
//                                     <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
//                                         No categories found
//                                     </Title>
//                                     <Text style={{ color: "#999" }}>
//                                         {searchTerm ? "Try adjusting your search criteria" : "Create your first category to get started"}
//                                     </Text>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* Sticky Note Create/Edit Modal */}
//                 <Modal
//                     open={stickyModalOpen}
//                     onCancel={closeStickyModal}
//                     footer={null}
//                     width={500}
//                     closable={false}
//                     style={{ top: "50px" }}
//                     styles={{
//                         body: {
//                             padding: 0,
//                             borderRadius: "12px",
//                             overflow: "hidden",
//                         },
//                     }}
//                 >
//                     <div
//                         style={{
//                             background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
//                             padding: "16px",
//                             color: "white",
//                             textAlign: "center",
//                         }}
//                     >
//                         <div
//                             style={{
//                                 width: "25px",
//                                 height: "25px",
//                                 background: "rgba(255, 255, 255, 0.2)",
//                                 borderRadius: "50%",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 margin: "0 auto 8px",
//                             }}
//                         >
//                             {stickyModalMode === "create" ? (
//                                 <PlusOutlined style={{ fontSize: "14px", color: "white" }} />
//                             ) : (
//                                 <EditOutlined style={{ fontSize: "14px", color: "white" }} />
//                             )}
//                         </div>
//                         <Title
//                             level={4}
//                             style={{
//                                 color: "white",
//                                 margin: 0,
//                                 fontSize: "20px",
//                                 fontWeight: 600,
//                             }}
//                         >
//                             {stickyModalMode === "create" ? "New Sticky Note" : "Edit Sticky Note"}
//                         </Title>
//                         <Text
//                             style={{
//                                 color: "rgba(255, 255, 255, 0.8)",
//                                 fontSize: "12px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 gap: "4px",
//                                 marginTop: "4px",
//                             }}
//                         >
//                             {stickyModalMode === "create" ? "Get organized" : "Update note"}
//                         </Text>
//                     </div>
//                     <div
//                         style={{
//                             padding: "16px",
//                             background: "white",
//                             minHeight: "300px",
//                             display: "flex",
//                             flexDirection: "column",
//                         }}
//                     >
//                         <Form
//                             form={stickyForm}
//                             layout="vertical"
//                             initialValues={{
//                                 reminderDate: dayjs(),
//                                 status: "Yet to Start",
//                             }}
//                             style={{ width: "100%", flex: 1 }}
//                             onFinish={handleSaveStickyNote}
//                         >
//                             <Form.Item
//                                 label={
//                                     <span
//                                         style={{
//                                             fontSize: "14px",
//                                             fontWeight: 500,
//                                             color: "#1f2937",
//                                         }}
//                                     >
//                                         Title
//                                     </span>
//                                 }
//                                 name="title"
//                                 rules={[{ required: true, message: "Enter a title" }]}
//                             >
//                                 <Input
//                                     placeholder="Note title..."
//                                     size="middle"
//                                     style={{
//                                         borderRadius: "8px",
//                                         border: "1px solid #e5e7eb",
//                                         fontSize: "14px",
//                                     }}
//                                 />
//                             </Form.Item>
//                             <Form.Item
//                                 label={
//                                     <span
//                                         style={{
//                                             fontSize: "14px",
//                                             fontWeight: 500,
//                                             color: "#1f2937",
//                                         }}
//                                     >
//                                         Description
//                                     </span>
//                                 }
//                                 name="description"
//                             >
//                                 <TextArea
//                                     placeholder="Note details..."
//                                     rows={3}
//                                     style={{
//                                         borderRadius: "8px",
//                                         border: "1px solid #e5e7eb",
//                                         fontSize: "14px",
//                                         resize: "none",
//                                     }}
//                                 />
//                             </Form.Item>
//                             <Row gutter={12}>
//                                 <Col span={12}>
//                                     <Form.Item
//                                         label={
//                                             <span
//                                                 style={{
//                                                     fontSize: "14px",
//                                                     fontWeight: 500,
//                                                     color: "#1f2937",
//                                                 }}
//                                             >
//                                                 Reminder Date
//                                             </span>
//                                         }
//                                         name="reminderDate"
//                                         rules={[{ required: true, message: "Select a date" }]}
//                                     >
//                                         <DatePicker
//                                             style={{
//                                                 width: "100%",
//                                                 borderRadius: "8px",
//                                                 border: "1px solid #e5e7eb",
//                                                 fontSize: "14px",
//                                             }}
//                                             size="middle"
//                                         />
//                                     </Form.Item>
//                                 </Col>
//                                 <Col span={12}>
//                                     <Form.Item
//                                         label={
//                                             <span
//                                                 style={{
//                                                     fontSize: "14px",
//                                                     fontWeight: 500,
//                                                     color: "#1f2937",
//                                                 }}
//                                             >
//                                                 Status
//                                             </span>
//                                         }
//                                         name="status"
//                                     >
//                                         <Select
//                                             size="middle"
//                                             style={{
//                                                 borderRadius: "8px",
//                                                 fontSize: "14px",
//                                             }}
//                                         >
//                                             <Option value="Yet to Start">Yet to Start</Option>
//                                             <Option value="In Progress">In Progress</Option>
//                                             <Option value="Done">Done</Option>
//                                             <Option value="Due">Due</Option>
//                                         </Select>
//                                     </Form.Item>
//                                     <Form.Item name="id" hidden>
//                                         <Input />
//                                     </Form.Item>
//                                 </Col>
//                             </Row>
//                             <Row gutter={12} style={{ marginTop: "16px" }}>
//                                 <Col span={12}>
//                                     <Button
//                                         size="middle"
//                                         block
//                                         onClick={closeStickyModal}
//                                         style={{
//                                             borderRadius: "8px",
//                                             height: "36px",
//                                             fontSize: "14px",
//                                             fontWeight: 500,
//                                             border: "1px solid #e5e7eb",
//                                             color: "#374151",
//                                         }}
//                                     >
//                                         Cancel
//                                     </Button>
//                                 </Col>
//                                 <Col span={12}>
//                                     <Button
//                                         type="primary"
//                                         size="middle"
//                                         block
//                                         onClick={handleSaveStickyNote}
//                                         style={{
//                                             background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
//                                             border: "none",
//                                             borderRadius: "8px",
//                                             height: "36px",
//                                             fontSize: "14px",
//                                             fontWeight: 500,
//                                             boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
//                                         }}
//                                         loading={loading}
//                                     >
//                                         {stickyModalMode === "create" ? "Create" : "Update"}
//                                     </Button>
//                                 </Col>
//                             </Row>
//                         </Form>
//                     </div>
//                 </Modal>

//                 {/* Add Category Modal */}
//                 <Modal
//                     open={newCategoryModal}
//                     onCancel={() => setNewCategoryModal(false)}
//                     onOk={handleAddCategory}
//                     centered
//                     width={400}
//                     okText="Add"
//                     closable={false}
//                     footer={[
//                         <Button key="cancel" onClick={() => setNewCategoryModal(false)}>
//                             Cancel
//                         </Button>,
//                         <Button key="submit" type="primary" onClick={handleAddCategory} loading={loading}>
//                             Add Category
//                         </Button>,
//                     ]}
//                 >
//                     <div style={{ padding: 24 }}>
//                         <Title level={4}>Create New Category</Title>
//                         <Input
//                             placeholder="Category Name"
//                             value={newCategoryName}
//                             onChange={(e) => setNewCategoryName(e.target.value)}
//                             style={{ marginBottom: 20 }}
//                         />
//                     </div>
//                 </Modal>

//                 {/* Category Notes Modal */}
//                 <Modal
//                     open={categoryModalOpen}
//                     onCancel={() => setCategoryModalOpen(false)}
//                     footer={null}
//                     centered
//                     width={550}
//                     closable={false}
//                 >
//                     {activeCategoryIndex !== null && (
//                         <div>
//                             <div
//                                 style={{
//                                     display: "flex",
//                                     justifyContent: "space-between",
//                                     alignItems: "center",
//                                     marginBottom: 15,
//                                 }}
//                             >
//                                 <span style={{ fontSize: 22, fontWeight: 600 }}>
//                                     {categories[activeCategoryIndex].icon} {categories[activeCategoryIndex].title}
//                                 </span>
//                                 <Button
//                                     type="primary"
//                                     shape="default"
//                                     icon={<PlusOutlined />}
//                                     onClick={() => {
//                                         setShowNoteForm(true);
//                                         setEditingNoteIndex(null);
//                                         setNewNote({ title: "", description: "" });
//                                     }}
//                                     style={{
//                                         position: "absolute",
//                                         top: 20,
//                                         right: 44,
//                                         width: 34,
//                                         height: 34,
//                                         borderRadius: 12,
//                                         backgroundColor: "#1677ff",
//                                         color: "white",
//                                         boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
//                                         border: "none",
//                                     }}
//                                 />
//                             </div>

//                             <div style={{ maxHeight: 300, overflowY: "auto", paddingRight: 8 }}>
//                                 {categories[activeCategoryIndex].items.length === 0 && !showNoteForm ? (
//                                     <div
//                                         style={{
//                                             border: "1px dashed #d9d9d9",
//                                             borderRadius: 8,
//                                             padding: 24,
//                                             textAlign: "center",
//                                             marginBottom: 16,
//                                             backgroundColor: "#fffbfbff",
//                                             cursor: "pointer",
//                                         }}
//                                         onClick={() => {
//                                             setShowNoteForm(true);
//                                             setEditingNoteIndex(null);
//                                             setNewNote({ title: "", description: "" });
//                                         }}
//                                     >
//                                         <PlusOutlined style={{ fontSize: 20, color: "#1677ff" }} />
//                                         <div style={{ marginTop: 8, color: "#1677ff" }}>
//                                             Add your first note
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     categories[activeCategoryIndex].items.map((note, idx) => (
//                                         <div
//                                             key={idx}
//                                             style={{
//                                                 border: "1px solid #f0f0f0",
//                                                 borderRadius: 8,
//                                                 padding: 12,
//                                                 marginBottom: 12,
//                                                 backgroundColor: "#fffbfbff",
//                                                 display: "flex",
//                                                 justifyContent: "space-between",
//                                                 alignItems: "center",
//                                             }}
//                                         >
//                                             <div
//                                                 style={{
//                                                     display: "flex",
//                                                     alignItems: "flex-start",
//                                                     gap: 8,
//                                                 }}
//                                             >
//                                                 <div style={{ marginTop: 4 }}>📍</div>
//                                                 <div>
//                                                     <div style={{ fontSize: "15px" }}>
//                                                         <strong>{note.title}</strong> — {note.description}
//                                                     </div>
//                                                     {note.created_at && (
//                                                         <div style={{ fontSize: 11, color: "#333" }}>
//                                                             {new Date(note.created_at).toLocaleString()}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                             <Button
//                                                 icon={<EditOutlined />}
//                                                 size="small"
//                                                 onClick={() => handleEditNote(note, idx)}
//                                             />
//                                         </div>
//                                     ))
//                                 )}
//                             </div>

//                             {showNoteForm && (
//                                 <div style={{ marginTop: 20 }}>
//                                     <Input
//                                         placeholder="Note Title"
//                                         value={newNote.title}
//                                         onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
//                                         style={{ marginBottom: 12 }}
//                                     />
//                                     <Input
//                                         placeholder="Note Description"
//                                         value={newNote.description}
//                                         onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
//                                         style={{ marginBottom: 20 }}
//                                     />
//                                 </div>
//                             )}
//                             <div style={{ marginTop: 20, textAlign: "right" }}>
//                                 <Button onClick={() => setCategoryModalOpen(false)} style={{ marginRight: 8 }}>
//                                     Cancel
//                                 </Button>
//                                 {showNoteForm && (
//                                     <Button type="primary" onClick={handleSaveNote} loading={loading}>
//                                         {editingNoteIndex !== null ? "Update Note" : "Add Note"}
//                                     </Button>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </Modal>
//             </div>
//         </div>
//     );
// };

// export default IntegratedFamilyNotes;


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
} from "@ant-design/icons";
import {
    getAllNotes,
    updateNote,
    addNote,
    addNoteCategory,
    getNoteCategories,
    updateNoteCategory,
} from "../../../services/family";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Note {
    id?: number;
    title: string;
    description: string;
    created_at?: string;
    updated_at?: string;
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
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${color.padStart(6, "0")}`;
};

const IntegratedNotes = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
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
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategoriesAndNotes();
    }, []);

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
                pinned: cat.pinned === true,
            }));

            const mergedCategories: Category[] = [...customCategories];
            defaultCategories.forEach((defCat) => {
                const exists = mergedCategories.some((c) => c.title === defCat.title);
                if (!exists) {
                    mergedCategories.push({ ...defCat });
                }
            });

            const groupedNotes: Record<string, Note[]> = {};
            rawNotes.forEach((note) => {
                let catTitle = categoryIdMapReverse[note.category_id];
                if (!catTitle && note.category_name) catTitle = note.category_name;
                if (!catTitle) catTitle = "Others";

                if (!groupedNotes[catTitle]) groupedNotes[catTitle] = [];
                groupedNotes[catTitle].unshift({
                    id: note.id,
                    title: note.title,
                    description: note.description,
                    created_at: note.created_at,
                    updated_at: note.updated_at,
                });
            });

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
            });

            if (res.data.status === 1) {
                message.success("Note updated");
                await fetchCategoriesAndNotes();
                setEditingNoteId(null);
                setTempNote(null);
            }
        } catch (err) {
            message.error("Failed to update note");
        } finally {
            setLoading(false);
        }
    };

    const showAddNoteModal = (categoryId: number) => {
        setCurrentCategoryId(categoryId);
        setAddNoteModalVisible(true);
        form.resetFields();
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

            const res = await addNote({
                title: values.title,
                description: values.description,
                category_id: currentCategoryId,
                user_id,
            });

            if (res.data.status === 1) {
                message.success("Note added");
                setAddNoteModalVisible(false);
                await fetchCategoriesAndNotes();
            }
        } catch (err) {
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
                message.success("Category added");
                setNewCategoryModal(false);
                setSelectedCategoryOption("");
                setCustomCategoryName("");
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

    const filteredCategories = categories.filter((category) =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedCategories = showAllCategories
        ? filteredCategories
        : filteredCategories.slice(0, 6);

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: 100,
                // background: "#F5F5F5",
                paddingLeft: 0,

            }}
        >
            <div style={{ maxWidth: 1280, margin: "0 auto", marginLeft: '60px' }}>
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
                        </Title>
                        <Text style={{ color: "#666", fontSize: 16 }}>
                            Organize your thoughts and keep track of important information
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setNewCategoryModal(true)}
                        style={{
                            borderRadius: "12px",
                            background: "#1890ff",
                            borderColor: "#1890ff",
                        }}
                    ></Button>
                </div>

                {/* Search Bar */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={16}>
                        <Input
                            placeholder="Search categories..."
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

                {/* Categories Grid */}
                <Row gutter={[20, 20]}>
                    {displayedCategories.map((category, index) => (
                        <Col key={index} xs={24} sm={12} lg={12} xl={8}>
                            {" "}
                            {/* Adjusted grid props */}
                            <div
                                style={{
                                    borderRadius: 16,
                                    padding: 20,
                                    border: "1px solid #e0e0e0",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                    height: 300,
                                    minWidth: 400, // Increased minWidth for wider cards
                                    position: "relative",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow =
                                        "0 8px 25px rgba(0,0,0,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                        "0 2px 8px rgba(0,0,0,0.06)";
                                }}
                            >
                                {/* Rest of the card content remains unchanged */}
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

                                {/* Pin and Add buttons */}
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
                                                category.category_id ||
                                                categoryIdMap[category.title] ||
                                                0
                                            );
                                        }}
                                        style={{
                                            borderRadius: "12px",
                                            background: "#1890ff",
                                            borderColor: "#1890ff",
                                        }}
                                    ></Button>
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
                                            color: category.pinned ? "#db3030ff" : "#999",
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
                                                    }}
                                                    onDoubleClick={(e) => handleStartEdit(note, e)}
                                                >
                                                    {editingNoteId === note.id ? (
                                                        <div>
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
                                                                    handleTempNoteChange(
                                                                        "description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                maxLength={200}
                                                                style={{ marginBottom: 8 }}
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
                                                            <div style={{ fontWeight: 600, marginBottom: 2 }}>
                                                                {note.title}
                                                            </div>
                                                            <div style={{ color: "#666" }}>
                                                                {note.description.substring(0, 40)}
                                                                {note.description.length > 40 && "..."}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
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
                                        {category.items.length > 0 &&
                                            category.items[0].created_at ? (
                                            <>
                                                {category.items[0].updated_at && (
                                                    <span style={{ marginLeft: 8 }}>
                                                        Last Updated:{" "}
                                                        {new Date(
                                                            category.items[0].updated_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            "No activity"
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
                {/* Show More/Less Button */}
                {filteredCategories.length > 6 && (
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
                {filteredCategories.length === 0 && (
                    <div style={{ textAlign: "center", padding: 48 }}>
                        <SearchOutlined
                            style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                        />
                        <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
                            No categories found
                        </Title>
                        <Text style={{ color: "#999" }}>
                            {searchTerm
                                ? "Try adjusting your search criteria"
                                : "Create your first category to get started"}
                        </Text>
                    </div>
                )}

                {/* Add Note Modal */}
                <Modal
                    title="Add New Note"
                    open={addNoteModalVisible}
                    onCancel={() => setAddNoteModalVisible(false)}
                    onOk={handleAddNoteSubmit}
                    centered
                    width={600}
                    okText="Add Note"
                    confirmLoading={loading}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: "Please enter a title" }]}
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
                                placeholder="Enter note description "
                                showCount
                                maxLength={200}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Text type="secondary">
                                Category:{" "}
                                {
                                    categories.find(
                                        (cat) =>
                                            cat.category_id === currentCategoryId ||
                                            categoryIdMap[cat.title] === currentCategoryId
                                    )?.title
                                }
                            </Text>
                        </Form.Item>
                    </Form>
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
