
// "use client";

// import React, { useEffect, useState } from "react";
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
// } from "antd";
// import {
//     HomeOutlined,
//     PlusOutlined,
//     EditOutlined,
//     DeleteOutlined,
//     SearchOutlined,
//     MoreOutlined,
//     ClockCircleOutlined,
//     ExclamationCircleOutlined,
//     PlayCircleOutlined,
//     CheckCircleOutlined,
//     CalendarOutlined,
//     FileTextOutlined,
//     TagOutlined,
// } from "@ant-design/icons";
// import { useSearchParams } from "next/navigation";
// import {
//     addPlannerNotes,
//     deletePlannerNote,
//     getPlannerNotes,
//     updatePlannerNote,
// } from "../../../services/planner";
// const { Title, Text, Paragraph } = Typography;
// const { TextArea } = Input;
// const { Option } = Select;

// // Types
// interface StickyNoteData {
//     id: string;
//     text: string;
//     status: "yet-to-start" | "due" | "in-progress" | "done";
// }

// interface NoteData {
//     id: string;
//     title: string;
//     content: string;
//     createdAt: Date;
//     category: string;
// }

// const FamilyHubComplete = () => {
//     // Sticky Notes State
//     const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([
//         {
//             id: "1",
//             text: "Pick up groceries:\n• Milk\n• Bread\n• Eggs\n• Apples",
//             status: "yet-to-start",
//         },
//         {
//             id: "2",
//             text: "Soccer practice\nSaturday 3PM\nDon't forget water bottle!",
//             status: "due",
//         },
//         {
//             id: "3",
//             text: "Mom's birthday\nApril 15th\nBook restaurant",
//             status: "in-progress",
//         },
//         {
//             id: "4",
//             text: "Dentist appointment\nNext Tuesday 2PM\nCall to confirm",
//             status: "done",
//         },
//     ]);

//     // Notes State
//     const [notes, setNotes] = useState<NoteData[]>([
//         {
//             id: "1",
//             title: "Grocery Shopping List",
//             content:
//                 "Weekly groceries needed:\n• Fresh vegetables (broccoli, carrots, spinach)\n• Dairy products (milk, cheese, yogurt)\n• Proteins (chicken, fish, eggs)\n• Pantry items (rice, pasta, canned goods)",
//             createdAt: new Date(2024, 5, 25),
//             category: "HOME",
//         },
//         {
//             id: "2",
//             title: "Vacation Planning",
//             content:
//                 "Summer vacation to the beach house:\n• Book accommodation for July 15-22\n• Research local restaurants and activities\n• Pack sunscreen, beach toys, and summer clothes\n• Arrange pet care while away",
//             createdAt: new Date(2024, 5, 20),
//             category: "FAMILY",
//         },
//         {
//             id: "3",
//             title: "Kids' School Schedule",
//             content:
//                 "Important school dates:\n• Parent-teacher conference: June 10th\n• Science fair: June 15th\n• Last day of school: June 28th\n• Summer camp starts: July 1st",
//             createdAt: new Date(2024, 5, 18),
//             category: "HEALTH",
//         },
//         {
//             id: "4",
//             title: "Budget Review",
//             content:
//                 "Monthly finance check:\n• Review bank statements\n• Adjust savings plan for Q3\n• Pay utility bills by July 5\n• Plan investment allocation",
//             createdAt: new Date(2024, 6, 1),
//             category: "FINANCE",
//         },
//     ]);

//     const fetchPlannerNotes = async () => {
//         try {
//             const res = await getPlannerNotes();
//             if (res.data.status === 1) {
//                 const plannerNotes = res.data.payload.map((note: any) => ({
//                     id: note.id,
//                     title: note.title,
//                     content: note.description,
//                     createdAt: new Date(note.created_at),
//                     category: "PLANNER",
//                 }));
//                 plannerNotes.sort(
//                     (a: NoteData, b: NoteData) =>
//                         b.createdAt.getTime() - a.createdAt.getTime()
//                 );
//                 setNotes(plannerNotes);
//             }
//         } catch (err) {
//             console.error("Error fetching planner notes", err);
//         }
//     };

//     // UI State
//     const [activeTab, setActiveTab] = useState("sticky-notes");
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedCategory, setSelectedCategory] = useState("All");
//     const [editingNote, setEditingNote] = useState<string | null>(null);
//     const [editingSticky, setEditingSticky] = useState<string | null>(null);
//     const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
//     const [form] = Form.useForm();

//     const searchParams = useSearchParams();

//     useEffect(() => {
//         if (selectedCategory === "PLANNER") {
//             fetchPlannerNotes();
//         }
//     }, [selectedCategory]);

//     useEffect(() => {
//         const cat = searchParams?.get("category");
//         if (cat && categories.includes(cat)) {
//             setActiveTab("notes");
//             setSelectedCategory(cat);
//         }
//     }, []);

//     // Status Configuration
//     const statusConfig = {
//         "yet-to-start": {
//             label: "Yet to Start",
//             color: "#fa8c16",
//             icon: ClockCircleOutlined,
//             bgColor: "#fff7e6",
//             borderColor: "#ffd591",
//         },
//         due: {
//             label: "Due",
//             color: "#f5222d",
//             icon: ExclamationCircleOutlined,
//             bgColor: "#fff2f0",
//             borderColor: "#ffccc7",
//         },
//         "in-progress": {
//             label: "In Progress",
//             color: "#1890ff",
//             icon: PlayCircleOutlined,
//             bgColor: "#f0f5ff",
//             borderColor: "#adc6ff",
//         },
//         done: {
//             label: "Done",
//             color: "#52c41a",
//             icon: CheckCircleOutlined,
//             bgColor: "#f6ffed",
//             borderColor: "#b7eb8f",
//         },
//     };

//     const categories = ["All", "FAMILY", "FINANCE", "HOME", "HEALTH", "PLANNER"];
//     const categoryColors = {
//         FAMILY: { color: "#52c41a", background: "#f6ffed" },
//         FINANCE: { color: "#1890ff", background: "#f0f5ff" },
//         HOME: { color: "#faad14", background: "#fffbe6" },
//         HEALTH: { color: "#722ed1", background: "#f9f0ff" },
//         PLANNER: { color: "#4096ff", background: "#e6f4ff" },
//     };

//     // Sticky Notes Functions
//     const addStickyNote = (status: StickyNoteData["status"]) => {
//         const newNote: StickyNoteData = {
//             id: Date.now().toString(),
//             text: "New note...",
//             status,
//         };
//         setStickyNotes([...stickyNotes, newNote]);
//         setEditingSticky(newNote.id);
//     };

//     const updateStickyNote = (id: string, updates: Partial<StickyNoteData>) => {
//         setStickyNotes((notes) =>
//             notes.map((note) => (note.id === id ? { ...note, ...updates } : note))
//         );
//     };

//     const deleteStickyNote = (id: string) => {
//         setStickyNotes((notes) => notes.filter((note) => note.id !== id));
//     };

//     // Notes Functions
//     const addNote = () => {
//         setIsNoteModalVisible(true);
//     };

//     const handleNoteModalOk = async () => {
//         try {
//             const values = await form.validateFields();

//             const newNotePayload = {
//                 title: values.title || "New Note",
//                 description: values.content || "Start writing your note here...",
//                 date: new Date().toISOString().slice(0, 10), // today's date in YYYY-MM-DD
//             };

//             const res = await addPlannerNotes(newNotePayload);

//             if (res.data.status === 1) {
//                 const backendNote = res.data.payload;

//                 const newNote: NoteData = {
//                     id: backendNote.id,
//                     title: backendNote.title,
//                     content: backendNote.description,
//                     createdAt: new Date(backendNote.created_at || new Date()),
//                     category: "PLANNER",
//                 };

//                 setNotes((prev) => [newNote, ...prev]);
//                 setIsNoteModalVisible(false);
//                 setEditingNote(newNote.id);
//                 form.resetFields();
//                 message.success("Note created successfully!");
//             } else {
//                 message.error("Failed to add note");
//             }
//         } catch (err) {
//             console.error(err);
//             message.error("Please fill in all required fields");
//         }
//     };

//     const handleNoteModalCancel = () => {
//         setIsNoteModalVisible(false);
//         form.resetFields();
//     };

//     const updateNote = (id: string, updates: Partial<NoteData>) => {
//         setNotes((notes) =>
//             notes.map((note) => (note.id === id ? { ...note, ...updates } : note))
//         );
//     };

//     const deleteNote = (id: string) => {
//         setNotes((notes) => notes.filter((note) => note.id !== id));
//     };

//     // Filtered Notes
//     const filteredNotes = notes.filter((note) => {
//         const matchesSearch =
//             note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             note.content.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesCategory =
//             selectedCategory === "All" || note.category === selectedCategory;
//         return matchesSearch && matchesCategory;
//     });

//     // Get Notes by Status
//     const getNotesByStatus = (status: StickyNoteData["status"]) => {
//         return stickyNotes.filter((note) => note.status === status);
//     };

//     // Render Sticky Note
//     const renderStickyNote = (note: StickyNoteData) => {
//         const config = statusConfig[note.status];
//         const Icon = config.icon;

//         const statusMenu = (
//             <Menu
//                 onClick={({ key }) =>
//                     updateStickyNote(note.id, { status: key as StickyNoteData["status"] })
//                 }
//             >
//                 {Object.entries(statusConfig).map(([status, cfg]) => {
//                     const StatusIcon = cfg.icon;
//                     return (
//                         <Menu.Item
//                             key={status}
//                             icon={<StatusIcon style={{ color: cfg.color }} />}
//                         >
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
//                         marginLeft: "40px",
//                         marginTop: "40px",
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
//                             onClick={() =>
//                                 setEditingSticky(editingSticky === note.id ? null : note.id)
//                             }
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

//                 {editingSticky === note.id ? (
//                     <TextArea
//                         value={note.text}
//                         onChange={(e) =>
//                             updateStickyNote(note.id, { text: e.target.value })
//                         }
//                         onBlur={() => setEditingSticky(null)}
//                         autoSize={{ minRows: 3 }}
//                         style={{
//                             backgroundColor: "rgba(255,255,255,0.8)",
//                             border: "1px solid #d9d9d9",
//                             borderRadius: 4,
//                         }}
//                         autoFocus
//                     />
//                 ) : (
//                     <div style={{ minHeight: 60 }}>
//                         <Text
//                             style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#333" }}
//                         >
//                             {note.text}
//                         </Text>
//                     </div>
//                 )}
//             </Card>
//         );
//     };

//     // Render Note Card
//     const renderNoteCard = (note: NoteData) => {
//         const categoryColor = categoryColors[
//             note.category as keyof typeof categoryColors
//         ] || {
//             color: "#666",
//             background: "#f5f5f5",
//         };

//         const isPlannerNote = note.category === "PLANNER";
//         const updateNote = async (id: string, updates: Partial<NoteData>) => {
//             try {
//                 setNotes((prev) =>
//                     prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
//                 );

//                 // Only call backend if category is PLANNER
//                 if (selectedCategory === "PLANNER") {
//                     await updatePlannerNote({ id, ...updates });
//                     message.success("Planner note updated successfully");
//                 }
//             } catch (err) {
//                 console.error("Update failed", err);
//                 message.error("Failed to update note");
//             }
//         };

//         const deleteNote = async (id: string) => {
//             try {
//                 setNotes((prev) => prev.filter((n) => n.id !== id));

//                 // Only call backend if category is PLANNER
//                 if (selectedCategory === "PLANNER") {
//                     await deletePlannerNote(id);
//                     fetchPlannerNotes();
//                     message.success("Planner note deleted");
//                 }
//             } catch (err) {
//                 console.error("Delete failed", err);
//                 message.error("Failed to delete note");
//             }
//         };

//         const noteMenuItems = [
//             {
//                 key: "edit",
//                 icon: <EditOutlined />,
//                 label: "Edit",
//                 onClick: () => setEditingNote(editingNote === note.id ? null : note.id),
//             },
//             {
//                 key: "delete",
//                 icon: <DeleteOutlined />,
//                 label: <span style={{ color: "#ff4d4f" }}>Delete</span>,
//                 onClick: () => deleteNote(note.id),
//             },
//         ];

//         const noteMenu = isPlannerNote ? (
//             <Menu>
//                 <Menu.Item
//                     key="edit"
//                     icon={<EditOutlined />}
//                     onClick={() =>
//                         setEditingNote(editingNote === note.id ? null : note.id)
//                     }
//                 >
//                     Edit
//                 </Menu.Item>
//                 <Menu.Item
//                     key="delete"
//                     icon={<DeleteOutlined />}
//                     onClick={() => deleteNote(note.id)}
//                     style={{ color: "#ff4d4f" }}
//                 >
//                     Delete
//                 </Menu.Item>
//             </Menu>
//         ) : null;

//         return (
//             <Card
//                 key={note.id}
//                 style={{
//                     marginBottom: 16,
//                     borderRadius: 12,
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//                     transition: "all 0.3s ease",
//                     height: 300,
//                     display: "flex",
//                     flexDirection: "column",
//                 }}
//                 bodyStyle={{
//                     padding: 20,
//                     flex: 1,
//                     display: "flex",
//                     flexDirection: "column",
//                     overflow: "hidden",
//                 }}
//                 onMouseEnter={(e) => {
//                     e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
//                 }}
//                 onMouseLeave={(e) => {
//                     e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
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
//                         {editingNote === note.id ? (
//                             <Input
//                                 value={note.title}
//                                 onChange={(e) => updateNote(note.id, { title: e.target.value })}
//                                 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}
//                                 autoFocus
//                             />
//                         ) : (
//                             <Title level={4} style={{ margin: "0 0 8px 0", color: "#333" }}>
//                                 {note.title}
//                             </Title>
//                         )}

//                         <Tag
//                             color={categoryColor.color}
//                             style={{
//                                 backgroundColor: categoryColor.background,
//                                 border: `1px solid ${categoryColor.color}`,
//                                 borderRadius: 12,
//                                 color: categoryColor.color,
//                             }}
//                         >
//                             <TagOutlined /> {note.category}
//                         </Tag>
//                     </div>

//                     {isPlannerNote && (
//                         <Dropdown menu={{ items: noteMenuItems }} trigger={["click"]}>
//                             <Button type="text" icon={<MoreOutlined />} />
//                         </Dropdown>
//                     )}
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
//                     {editingNote === note.id ? (
//                         <TextArea
//                             value={note.content}
//                             onChange={(e) => updateNote(note.id, { content: e.target.value })}
//                             autoSize={{ minRows: 4 }}
//                             style={{ borderRadius: 8, height: "100%" }}
//                         />
//                     ) : (
//                         <Paragraph
//                             style={{ whiteSpace: "pre-wrap", color: "#666", margin: 0 }}
//                         >
//                             {note.content}
//                         </Paragraph>
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
//                         {note.createdAt.toLocaleDateString()}
//                     </Space>

//                     {editingNote === note.id && isPlannerNote && (
//                         <Space>
//                             <Button size="small" onClick={() => setEditingNote(null)}>
//                                 Cancel
//                             </Button>
//                             <Button
//                                 size="small"
//                                 type="primary"
//                                 onClick={() => {
//                                     setEditingNote(null);
//                                     message.success("Note saved successfully!");
//                                 }}
//                             >
//                                 Save
//                             </Button>
//                         </Space>
//                     )}
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
//                 paddingRight: 10, // ⬅ remove right padding
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
//                             marginLeft: 0, // ⬅ align to left
//                             marginRight: "auto", // ⬅ push content to left
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
//                                     backgroundColor:
//                                         activeTab === "sticky-notes" ? "#6366f1" : "transparent",
//                                     borderColor:
//                                         activeTab === "sticky-notes" ? "#6366f1" : "transparent",
//                                     color: activeTab === "sticky-notes" ? "white" : "#6b7280",
//                                     boxShadow:
//                                         activeTab === "sticky-notes"
//                                             ? "0 4px 12px #6366f140"
//                                             : "none",
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
//                                     backgroundColor:
//                                         activeTab === "notes" ? "#8b5cf6" : "transparent",
//                                     borderColor:
//                                         activeTab === "notes" ? "#8b5cf6" : "transparent",
//                                     color: activeTab === "notes" ? "white" : "#6b7280",
//                                     boxShadow:
//                                         activeTab === "notes" ? "0 4px 12px #8b5cf640" : "none",
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
//                                     const notes = getNotesByStatus(
//                                         status as StickyNoteData["status"]
//                                     );

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
//                                                             <span
//                                                                 style={{ color: config.color, fontWeight: 600 }}
//                                                             >
//                                                                 {config.label}
//                                                             </span>
//                                                             <Tag
//                                                                 color={config.color}
//                                                                 style={{ minWidth: 20, textAlign: "center" }}
//                                                             >
//                                                                 {notes.length}
//                                                             </Tag>
//                                                         </div>
//                                                         <Button
//                                                             size="small"
//                                                             type="text"
//                                                             icon={<PlusOutlined />}
//                                                             onClick={() =>
//                                                                 addStickyNote(
//                                                                     status as StickyNoteData["status"]
//                                                                 )
//                                                             }
//                                                             style={{ color: config.color }}
//                                                         />
//                                                     </div>
//                                                 }
//                                                 style={{
//                                                     backgroundColor: config.bgColor,
//                                                     borderWidth: 2,
//                                                     borderRadius: 12,
//                                                     minHeight: 400,
//                                                 }}
//                                                 bodyStyle={{ padding: 16 }}
//                                             >
//                                                 {notes.map(renderStickyNote)}
//                                             </Card>
//                                         </Col>
//                                     );
//                                 })}
//                             </Row>
//                         </div>
//                     )}

//                     {activeTab === "notes" && (
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
//                                     Notes
//                                 </Title>
//                                 <Button
//                                     type="primary"
//                                     icon={<PlusOutlined />}
//                                     onClick={addNote}
//                                     style={{ borderRadius: 8 }}
//                                 >
//                                     Add Note
//                                 </Button>
//                             </div>

//                             {/* Search and Filter */}
//                             <Row gutter={16} style={{ marginBottom: 24 }}>
//                                 <Col xs={24} sm={16}>
//                                     <Input
//                                         placeholder="Search notes..."
//                                         prefix={<SearchOutlined />}
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                         style={{ borderRadius: 8 }}
//                                     />
//                                 </Col>
//                                 <Col xs={24} sm={8}>
//                                     <Select
//                                         value={selectedCategory}
//                                         onChange={setSelectedCategory}
//                                         style={{ width: "100%", borderRadius: 8 }}
//                                     >
//                                         {categories.map((category) => (
//                                             <Option key={category} value={category}>
//                                                 {category}
//                                             </Option>
//                                         ))}
//                                     </Select>
//                                 </Col>
//                             </Row>

//                             {/* Notes Grid */}
//                             <Row gutter={16}>
//                                 {filteredNotes.map((note) => (
//                                     <Col key={note.id} xs={24} md={12} lg={8}>
//                                         {renderNoteCard(note)}
//                                     </Col>
//                                 ))}
//                             </Row>

//                             {filteredNotes.length === 0 && (
//                                 <div style={{ textAlign: "center", padding: 48 }}>
//                                     <SearchOutlined
//                                         style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
//                                     />
//                                     <Title level={3} style={{ color: "#999", marginBottom: 8 }}>
//                                         No notes found
//                                     </Title>
//                                     <Text style={{ color: "#999" }}>
//                                         {searchTerm || selectedCategory !== "All"
//                                             ? "Try adjusting your search or filter criteria"
//                                             : "Create your first note to get started"}
//                                     </Text>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* New Note Modal */}
//                     <Modal
//                         title="Create New Note"
//                         visible={isNoteModalVisible}
//                         onOk={handleNoteModalOk}
//                         onCancel={handleNoteModalCancel}
//                         okText="Create"
//                         cancelText="Cancel"
//                         style={{ top: 20 }}
//                     >
//                         <Form form={form} layout="vertical">
//                             <Form.Item
//                                 name="title"
//                                 label="Title"
//                                 rules={[{ required: true, message: "Please enter a title" }]}
//                             >
//                                 <Input placeholder="Note title" />
//                             </Form.Item>
//                             <Form.Item
//                                 name="category"
//                                 label="Category"
//                                 rules={[
//                                     { required: true, message: "Please select a category" },
//                                 ]}
//                             >
//                                 <Select placeholder="Select a category">
//                                     {categories
//                                         .filter((cat) => cat !== "All")
//                                         .map((category) => (
//                                             <Option key={category} value={category}>
//                                                 {category}
//                                             </Option>
//                                         ))}
//                                 </Select>
//                             </Form.Item>
//                             <Form.Item name="content" label="Content">
//                                 <TextArea
//                                     rows={4}
//                                     placeholder="Start writing your note here..."
//                                 />
//                             </Form.Item>
//                         </Form>
//                     </Modal>
//                 </div>
//             </div>
//         </div>

//     );
// };

// export default FamilyHubComplete;









"use client";

import React, { useEffect, useState } from "react";
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
    MoreOutlined,
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

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Types
interface StickyNoteData {
    id: string;
    text: string;
    status: "yet-to-start" | "due" | "in-progress" | "done";
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

// Status Configuration for Sticky Notes
const statusConfig = {
    "yet-to-start": {
        label: "Yet to Start",
        color: "#fa8c16",
        icon: ClockCircleOutlined,
        bgColor: "#fff7e6",
        borderColor: "#ffd591",
    },
    due: {
        label: "Due",
        color: "#f5222d",
        icon: ExclamationCircleOutlined,
        bgColor: "#fff2f0",
        borderColor: "#ffccc7",
    },
    "in-progress": {
        label: "In Progress",
        color: "#1890ff",
        icon: PlayCircleOutlined,
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
    },
    done: {
        label: "Done",
        color: "#52c41a",
        icon: CheckCircleOutlined,
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
    },
};

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

const categoryIdMapReverse: Record<number, string> = Object.entries(
    categoryIdMap
).reduce((acc, [title, id]) => {
    acc[id] = title;
    return acc;
}, {} as Record<number, string>);

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
    const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([
        {
            id: "1",
            text: "Pick up groceries:\n• Milk\n• Bread\n• Eggs\n• Apples",
            status: "yet-to-start",
        },
        {
            id: "2",
            text: "Soccer practice\nSaturday 3PM\nDon't forget water bottle!",
            status: "due",
        },
        {
            id: "3",
            text: "Mom's birthday\nApril 15th\nBook restaurant",
            status: "in-progress",
        },
        {
            id: "4",
            text: "Dentist appointment\nNext Tuesday 2PM\nCall to confirm",
            status: "done",
        },
    ]);
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
    const [editingSticky, setEditingSticky] = useState<string | null>(null);

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
    const addStickyNote = (status: StickyNoteData["status"]) => {
        const newNote: StickyNoteData = {
            id: Date.now().toString(),
            text: "New note...",
            status,
        };
        setStickyNotes([...stickyNotes, newNote]);
        setEditingSticky(newNote.id);
    };

    const updateStickyNote = (id: string, updates: Partial<StickyNoteData>) => {
        setStickyNotes((notes) =>
            notes.map((note) => (note.id === id ? { ...note, ...updates } : note))
        );
    };

    const deleteStickyNote = (id: string) => {
        setStickyNotes((notes) => notes.filter((note) => note.id !== id));
    };

    const getNotesByStatus = (status: StickyNoteData["status"]) => {
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

    // Filtered categories
    const filteredCategories = categories.filter((category) => {
        const matchesSearch = category.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Render Sticky Note
    const renderStickyNote = (note: StickyNoteData) => {
        const config = statusConfig[note.status];
        const Icon = config.icon;

        const statusMenu = (
            <Menu
                onClick={({ key }) =>
                    updateStickyNote(note.id, { status: key as StickyNoteData["status"] })
                }
            >
                {Object.entries(statusConfig).map(([status, cfg]) => {
                    const StatusIcon = cfg.icon;
                    return (
                        <Menu.Item
                            key={status}
                            icon={<StatusIcon style={{ color: cfg.color }} />}
                        >
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
                            onClick={() =>
                                setEditingSticky(editingSticky === note.id ? null : note.id)
                            }
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

                {editingSticky === note.id ? (
                    <TextArea
                        value={note.text}
                        onChange={(e) =>
                            updateStickyNote(note.id, { text: e.target.value })
                        }
                        onBlur={() => setEditingSticky(null)}
                        autoSize={{ minRows: 3 }}
                        style={{
                            backgroundColor: "rgba(255,255,255,0.8)",
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                        }}
                        autoFocus
                    />
                ) : (
                    <div style={{ minHeight: 60 }}>
                        <Text
                            style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#333" }}
                        >
                            {note.text}
                        </Text>
                    </div>
                )}
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
                                    backgroundColor:
                                        activeTab === "sticky-notes" ? "#6366f1" : "transparent",
                                    borderColor:
                                        activeTab === "sticky-notes" ? "#6366f1" : "transparent",
                                    color: activeTab === "sticky-notes" ? "white" : "#6b7280",
                                    boxShadow:
                                        activeTab === "sticky-notes"
                                            ? "0 4px 12px #6366f140"
                                            : "none",
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
                                    backgroundColor:
                                        activeTab === "notes" ? "#8b5cf6" : "transparent",
                                    borderColor:
                                        activeTab === "notes" ? "#8b5cf6" : "transparent",
                                    color: activeTab === "notes" ? "white" : "#6b7280",
                                    boxShadow:
                                        activeTab === "notes" ? "0 4px 12px #8b5cf640" : "none",
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
                                    const notes = getNotesByStatus(
                                        status as StickyNoteData["status"]
                                    );

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
                                                            <span
                                                                style={{ color: config.color, fontWeight: 600 }}
                                                            >
                                                                {config.label}
                                                            </span>
                                                            <Tag
                                                                color={config.color}
                                                                style={{ minWidth: 20, textAlign: "center" }}
                                                            >
                                                                {notes.length}
                                                            </Tag>
                                                        </div>
                                                        <Button
                                                            size="small"
                                                            type="text"
                                                            icon={<PlusOutlined />}
                                                            onClick={() =>
                                                                addStickyNote(
                                                                    status as StickyNoteData["status"]
                                                                )
                                                            }
                                                            style={{ color: config.color }}
                                                        />
                                                    </div>
                                                }
                                                style={{
                                                    backgroundColor: config.bgColor,
                                                    borderWidth: 2,
                                                    borderRadius: 12,
                                                    minHeight: 400,
                                                }}
                                                bodyStyle={{ padding: 16 }}
                                            >
                                                {notes.map(renderStickyNote)}
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
                                    Family Notes Categories
                                </Title>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setNewCategoryModal(true)}
                                    style={{ borderRadius: 8 }}
                                >
                                    Add Category
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
                        </div>
                    )}
                </div>

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
                                    onClick={() => setCategoryModalOpen(false)}
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
            </div>
        </div>
    );
};

export default IntegratedFamilyNotes;

