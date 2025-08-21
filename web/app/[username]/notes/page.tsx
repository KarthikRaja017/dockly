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
  Empty,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  PushpinOutlined,
  PushpinFilled,
  FileTextOutlined,
  SearchOutlined,
  TagOutlined,
  MoreOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  MailOutlined,
  ReloadOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  HeartOutlined,
} from "@ant-design/icons";
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
import DocklyLoader from "../../../utils/docklyLoader";

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

const categoryColors = { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };

const hubOptions = [
  { label: "👨‍👩‍👧‍👦 Family", value: "FAMILY" },
  { label: "💰 Finance", value: "FINANCE" },
  { label: "📅 Planner", value: "PLANNER" },
  { label: "🏥 Health", value: "HEALTH" },
  { label: "🏠 Home", value: "HOME" },
  { label: "⚙️ Utilities", value: "NONE" },
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

const getHubIcon = (hub: string, size: number = 14) => {
  const iconStyle = { fontSize: size };
  const hubIcons: Record<string, React.ReactElement> = {
    FAMILY: <TeamOutlined style={{ ...iconStyle, color: "#eb2f96" }} />,
    FINANCE: <DollarOutlined style={{ ...iconStyle, color: "#13c2c2" }} />,
    PLANNER: <CalendarOutlined style={{ ...iconStyle, color: "#9254de" }} />,
    HEALTH: <HeartOutlined style={{ ...iconStyle, color: "#f5222d" }} />,
    HOME: <HomeOutlined style={{ ...iconStyle, color: "#fa8c16" }} />,
    NONE: <FileTextOutlined style={{ ...iconStyle, color: "#722ed1" }} />,
  };
  return hubIcons[hub] || <FileTextOutlined style={{ ...iconStyle, color: "#722ed1" }} />;
};

const getCategoryColors = (categoryTitle: string) => {
  return categoryColors;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const IntegratedNotes = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tempNote, setTempNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // Combined modal states
  const [combinedModalVisible, setCombinedModalVisible] = useState(false);
  const [categoryType, setCategoryType] = useState<"existing" | "new">(
    "existing"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedCategoryOption, setSelectedCategoryOption] =
    useState<string>("");
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const [selectedHubs, setSelectedHubs] = useState<string[]>([]);

  const [form] = Form.useForm();
  const [totalNotes, setTotalNotes] = useState<number>(0);
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
  }, []);

  const fetchCategoriesAndNotes = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log("🚀 Fetching all notes and categories...");

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
              const existingNote = noteMap.get(noteKey)!;
              if (!existingNote.hubs.includes(hub)) {
                existingNote.hubs.push(hub);
              }
            } else {
              noteMap.set(noteKey, {
                ...note,
                hub: hub,
                hubs: [hub],
              });
            }
          });
        }
      });

      noteMap.forEach((note) => {
        allNotes.push(note);
      });

      console.log("📋 Categories:", categoriesPayload);
      console.log("📝 All Notes:", allNotes);

      // Process categories - only use API categories, no defaults
      const apiCategories: Category[] = categoriesPayload.map((cat) => ({
        title: cat.title,
        icon: cat.icon || "✍",
        items: [],
        category_id: cat.id,
        pinned: cat.pinned === true,
      }));

      // Group notes by category
      const groupedNotes: Record<string, Note[]> = {};

      allNotes.forEach((note) => {
        let catTitle = "Others";

        const foundCategory = categoriesPayload.find(
          (cat) => cat.id === note.category_id
        );
        if (foundCategory) {
          catTitle = foundCategory.title;
        } else if (note.category_name) {
          catTitle = note.category_name;
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
      const finalCategories = apiCategories
        .map((cat) => ({
          ...cat,
          items: groupedNotes[cat.title] || [],
        }))
        .sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (b.items.length !== a.items.length) {
            return b.items.length - a.items.length;
          }
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
    const categoryId = category.category_id;

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

    if (tempNote.description.length > 500) {
      message.error("Description must be 500 characters or less");
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

      const categoryId = category.category_id;

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

      const noteToDelete = categories
        .flatMap((cat) => cat.items)
        .find((note) => note.id === noteId);

      if (!noteToDelete) {
        message.error("Note not found");
        return;
      }

      // For multi-hub notes, we need to delete using title and description
      // since they are stored as separate records in each hub
      const deletePayload = {
        id: noteId,
        title: noteToDelete.title,
        description: noteToDelete.description,
      };

      const res = await deleteNote(deletePayload);

      if (res?.data?.status === 1) {
        const hubNames = (noteToDelete.hubs || [noteToDelete.hub || "NONE"])
          .map((hub) => getHubDisplayName(hub))
          .join(", ");
        message.success(
          `Note deleted from all hubs (${hubNames}) successfully`
        );
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
            description="Are you sure you want to delete this note from all hubs?"
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
    setSelectedHubs([]);
  };

  const handleCombinedSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (values.description.length > 500) {
        message.error("Description must be 500 characters or less");
        return;
      }

      if (!selectedHubs || selectedHubs.length === 0) {
        message.error("Please select at least one hub");
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

      // Add note to all selected hubs
      try {
        const addNotePromises = selectedHubs.map((hub) =>
          addNote({
            title: values.title,
            description: values.description,
            category_id: categoryId,
            user_id,
            hub: hub,
          })
        );

        const results = await Promise.all(addNotePromises);
        const successfulHubs: string[] = [];
        const failedHubs: string[] = [];

        results.forEach((result: { data: { status: number; }; }, index: number) => {
          if (result.data.status === 1) {
            successfulHubs.push(getHubDisplayName(selectedHubs[index]));
          } else {
            failedHubs.push(getHubDisplayName(selectedHubs[index]));
          }
        });

        if (successfulHubs.length > 0) {
          message.success(
            `Note added to ${successfulHubs.join(", ")} successfully! 📝`
          );
        }

        if (failedHubs.length > 0) {
          message.warning(`Failed to add note to ${failedHubs.join(", ")}`);
        }

        if (successfulHubs.length > 0) {
          setCombinedModalVisible(false);
          await fetchCategoriesAndNotes();
          form.resetFields();
          setSelectedHubs([]);
          setSelectedCategoryOption("");
          setCustomCategoryName("");
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

  const renderHubIcons = (note: Note) => {
    const noteHubs = note.hubs || [note.hub || "NONE"];
    
    // If note is in all 6 hubs or more than 3 hubs, show Notes icon with tooltip
    if (noteHubs.length >= 4) {
      const hubNames = noteHubs.map(hub => getHubDisplayName(hub)).join(", ");
      return (
        <Tooltip title={`Available in: ${hubNames}`} placement="top">
          <span style={{ cursor: "help", display: "flex", alignItems: "center" }}>
            <FileTextOutlined style={{ fontSize: 12, color: "#722ed1" }} />
          </span>
        </Tooltip>
      );
    }
    
    // Otherwise show individual hub icons
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {noteHubs.slice(0, 3).map((hub) => (
          <Tooltip key={hub} title={getHubDisplayName(hub)} placement="top">
            <span style={{ display: "flex", alignItems: "center" }}>
              {getHubIcon(hub, 12)}
            </span>
          </Tooltip>
        ))}
        {noteHubs.length > 3 && (
          <Tooltip title={`+${noteHubs.length - 3} more hubs`} placement="top">
            <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 2 }}>
              +{noteHubs.length - 3}
            </span>
          </Tooltip>
        )}
      </div>
    );
  };

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
          <div
            style={{
              flex: 1,
              minWidth: 300,
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: "#2563eb",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                color: "#fff",
                marginRight: 12,
                flexShrink: 0,
              }}
            >
              <FileTextOutlined />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "#1a1a1a",
                    fontSize: 26,
                    fontFamily: FONT_FAMILY,
                    fontWeight: 600,
                  }}
                >
                  Notes & Lists
                </Title>
              </div>
              <Text
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  fontFamily: FONT_FAMILY,
                  marginTop: 2,
                }}
              >
                Organize your life efficiently
              </Text>
            </div>
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
            <Tooltip title="Add note">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showCombinedModal()}
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
                          showCombinedModal(category.category_id);
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
                          color: category.pinned ? "#2563eb" : "#9ca3af",
                          borderRadius: 6,
                          fontSize: 11,
                        }}
                      />
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
                        placement="bottomRight"
                      >
                        <Button
                          icon={<DeleteOutlined />}
                          type="text"
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            padding: 0,
                            color: "#ef4444",
                            borderRadius: 6,
                            fontSize: 11,
                          }}
                        />
                      </Popconfirm>
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
                                    maxLength={500}
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
                                      marginBottom: 6,
                                    }}
                                  >
                                    <div style={{ flex: 1, paddingRight: 8 }}>
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
                                        }}
                                      >
                                        {note.description.substring(0, 50)}
                                        {note.description.length > 50 && "..."}
                                      </div>
                                    </div>
                                    
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      {renderHubIcons(note)}
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
                                  </div>

                                  {/* Note timestamp - moved to bottom */}
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      marginTop: 6,
                                      paddingTop: 4,
                                      borderTop: "1px solid #f1f5f9",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 8,
                                        color: "#9ca3af",
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      {note.updated_at
                                        ? `Updated: ${formatDateTime(note.updated_at)}`
                                        : `Created: ${formatDateTime(note.created_at)}`}
                                    </span>
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
                                  Last activity: {formatDateTime(latestNote.updated_at || latestNote.created_at)}
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
                      No notes found across all hubs. Create your first note to
                      get started.
                    </Text>
                  </div>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showCombinedModal()}
                  style={{
                    fontFamily: FONT_FAMILY,
                    borderRadius: 8,
                  }}
                >
                  Create First Note
                </Button>
              </Empty>
            )}
          </div>
        )}

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
            setSelectedHubs([]);
            setSelectedCategoryOption("");
            setCustomCategoryName("");
            setCategoryType("existing");
            setSelectedCategoryId(null);
          }}
          onOk={handleCombinedSubmit}
          centered
          width={600}
          okText="Add Note"
          confirmLoading={loading}
          destroyOnHidden
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
                  max: 500,
                  message: "Description must be 500 characters or less",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter note description"
                showCount
                maxLength={500}
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            {/* Multi-Hub Selection */}
            <Form.Item
              label="Select Hubs"
              rules={[
                { required: true, message: "Please select at least one hub" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Choose hubs for this note (select multiple)"
                value={selectedHubs}
                onChange={setSelectedHubs}
                options={hubOptions}
                style={{
                  width: "100%",
                  fontFamily: FONT_FAMILY,
                }}
                maxTagCount="responsive"
                showArrow
              />
            </Form.Item>

            {/* Selected Hubs Preview */}
            {selectedHubs && selectedHubs.length > 0 && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 8,
                  marginTop: -16,
                  marginBottom: 16,
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
                  📝 Note will be added to:
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {selectedHubs.map((hub) => (
                    <span
                      key={hub}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: "#2563eb",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {getHubIcon(hub, 10)}
                      {getHubDisplayName(hub)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginTop: 16,
                fontFamily: FONT_FAMILY,
                padding: "12px 16px",
                backgroundColor: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                💡 <strong>Multi-Hub Feature:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li>
                  Select multiple hubs to add the note to all of them
                  simultaneously
                </li>
                <li>
                  Categories are shared across all hubs for easy organization
                </li>
                <li>
                  Notes will appear in each selected hub with the same category
                </li>
                <li>
                  You can edit or delete notes from any hub they belong to
                </li>
              </ul>
            </div>
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
                  {renderHubIcons(currentShareNote)}
                  <span
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Created: {formatDate(currentShareNote.created_at)}
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