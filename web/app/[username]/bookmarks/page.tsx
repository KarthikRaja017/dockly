"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Input,
  Button,
  Select,
  Card,
  Typography,
  Space,
  Tag,
  Dropdown,
  Modal,
  Form,
  message,
  Row,
  Col,
  Avatar,
  Empty,
  Tooltip,
  Table,
  TableColumnsType,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  HeartOutlined,
  HeartFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  AppstoreOutlined,
  TableOutlined,
  LinkOutlined,
  BookOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  MailOutlined,
  TagOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  addBookmark,
  getBookmarks,
  deleteBookmark,
  toggleFavorite,
  getCategories,
  getStats,
  shareBookmarks,
} from "../../../services/bookmarks";
import { Bookmark, BookmarkFormData } from "../../../types/bookmarks";
import { useGlobalLoading } from "../../loadingContext";
import ExtensionDownloadModal from "../../../pages/bookmarks/smdownload";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../userContext";
import { getUsersFamilyMembers } from "../../../services/family";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const categoryColors: Record<string, string> = {
  Tech: "#af630bff",
  Design: "#9f0aaaff",
  News: "#fa541c",
  Social: "#52c41a",
  Tools: "#2c0447ff",
  Education: "#13c2c2",
  Entertainment: "#a01010ff",
  Others: "#3a1e1eff",
};

// Updated hub options with icons
const hubOptions = [
  
  { 
    value: "family", 
    label: "Family", 
    color: "#eb2f96",
    icon: <TeamOutlined style={{ fontSize: "12px" }} />
  },
  { 
    value: "planner", 
    label: "Planner", 
    color: "#9254de",
    icon: <CalendarOutlined style={{ fontSize: "12px" }} />
  },
  { 
    value: "finance", 
    label: "Finance", 
    color: "#13c2c2",
    icon: <DollarOutlined style={{ fontSize: "12px" }} />
  },
  { 
    value: "health", 
    label: "Health", 
    color: "#f5222d",
    icon: <HeartOutlined style={{ fontSize: "12px" }} />
  },
  { 
    value: "home", 
    label: "Home", 
    color: "#fa8c16",
    icon: <HomeOutlined style={{ fontSize: "12px" }} />
  },
  { 
    value: "none", 
    label: "None (Utilities)", 
    color: "#faad14",
    icon: <BookOutlined style={{ fontSize: "12px" }} />
  },
];

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const router = useRouter();
  const { loading, setLoading } = useGlobalLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
    null
  );
  const [form] = Form.useForm();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareForm] = Form.useForm();
  const [currentShareBookmark, setCurrentShareBookmark] =
    useState<Bookmark | null>(null);
  const username = useCurrentUser()?.user_name || "";
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [currentTagBookmark, setCurrentTagBookmark] = useState<Bookmark | null>(
    null
  );
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // New states for custom category functionality
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  const showModal = () => {
    router.push(`/${username}/bookmarks/download`);
  };

  useEffect(() => {
    loadBookmarks();
    loadCategories();
    fetchFamilyMembers();
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [searchQuery, selectedCategory, sortBy]);

  const normalizeUrl = (url: string): string => {
    if (!url || typeof url !== "string") return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.match(/^https?:\/\//i)) return trimmedUrl;
    return `https://${trimmedUrl}`;
  };

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await getBookmarks({
        search: searchQuery || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        sortBy: sortBy,
        // Don't pass hub parameter to get bookmarks from all hubs
      });

      const { status, message: msg, payload } = response.data;
      if (status) {
        const normalizedBookmarks = payload.bookmarks
          .filter(
            (bookmark: any) => bookmark.url && typeof bookmark.url === "string"
          )
          .map((bookmark: any) => ({
            ...bookmark,
            isFavorite: bookmark.isFavorite ?? bookmark.is_favorite ?? false,
            createdAt:
              bookmark.createdAt ?? bookmark.created_at ?? bookmark.createdAt,
            url: normalizeUrl(bookmark.url),
            // Ensure hubs is always an array
            hubs: Array.isArray(bookmark.hubs) 
              ? bookmark.hubs 
              : bookmark.hub 
                ? [bookmark.hub] 
                : ["none"],
          }));
        setBookmarks(normalizedBookmarks);
      } else {
        message.error(msg || "Failed to load bookmarks");
      }
    } catch (error) {
      message.error("Failed to load bookmarks");
      console.error("Error loading bookmarks:", error);
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
      message.error("Failed to fetch family members");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      const { status, payload } = response.data;
      if (status) {
        setCategories(["All", ...payload.categories]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;
    if (showOnlyFavorites) {
      filtered = filtered.filter((bookmark) => bookmark.isFavorite);
    }
    return filtered;
  }, [bookmarks, showOnlyFavorites]);

  const handleFavoritesClick = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
    if (!showOnlyFavorites) {
      setSearchQuery("");
      setSelectedCategory("All");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, isFavorite: !bookmark.isFavorite }
          : bookmark
      )
    );

    try {
      const response = await toggleFavorite(id);
      const { status, message: msg, payload } = response.data;

      if (status) {
        const updatedBookmark = {
          ...payload.bookmark,
          isFavorite:
            payload.bookmark.isFavorite ??
            payload.bookmark.is_favorite ??
            false,
        };
        setBookmarks((prev) =>
          prev.map((bookmark) =>
            bookmark.id === id
              ? {
                  ...bookmark,
                  ...updatedBookmark,
                  createdAt: bookmark.createdAt || bookmark.created_at,
                  created_at: bookmark.created_at || bookmark.createdAt,
                }
              : bookmark
          )
        );
        message.success(
          updatedBookmark.isFavorite
            ? `"${updatedBookmark.title}" added to favorites`
            : `"${updatedBookmark.title}" removed from favorites`
        );
      } else {
        message.error(msg || "Failed to update favorite status");
        setBookmarks((prev) =>
          prev.map((bookmark) =>
            bookmark.id === id
              ? { ...bookmark, isFavorite: !bookmark.isFavorite }
              : bookmark
          )
        );
      }
    } catch (error) {
      message.error("Failed to update favorite status");
      console.error("Error toggling favorite:", error);
      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.id === id
            ? { ...bookmark, isFavorite: !bookmark.isFavorite }
            : bookmark
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const bookmark = bookmarks.find((b) => b.id === id);
      const response = await deleteBookmark(bookmark);
      const { status, message: msg } = response.data;

      if (status) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
        if (bookmark) {
          message.success(`"${bookmark.title}" has been deleted`);
        }
        loadCategories();
      } else {
        message.error(msg || "Failed to delete bookmark");
      }
    } catch (error) {
      message.error("Failed to delete bookmark");
      console.error("Error deleting bookmark:", error);
    }
  };

  const handleEdit = (id: string) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (bookmark) {
      setModalMode("edit");
      setEditingBookmarkId(id);
      const displayUrl = bookmark.url.replace(/^https?:\/\//i, "");

      // Check if category is a custom one (not in predefined list)
      const predefinedCategories = [
        "Tech",
        "Design",
        "News",
        "Social",
        "Tools",
        "Education",
        "Entertainment",
        "Others",
      ];
      const isCustomCategory = !predefinedCategories.includes(
        bookmark.category
      );

      // Handle hubs - ensure it's an array and filter out invalid values
      const bookmarkHubs = Array.isArray(bookmark.hubs) 
        ? bookmark.hubs.filter(hub => hubOptions.some(option => option.value === hub))
        : bookmark.hub 
          ? [bookmark.hub].filter(hub => hubOptions.some(option => option.value === hub))
          : ["none"];

      form.setFieldsValue({
        title: bookmark.title,
        url: displayUrl,
        description: bookmark.description,
        category: isCustomCategory ? "Others" : bookmark.category,
        customCategory: isCustomCategory ? bookmark.category : "",
        tags: bookmark.tags?.join(", ") || "",
        hubs: bookmarkHubs.length > 0 ? bookmarkHubs : ["none"], // Set hubs as array
        id: bookmark.id,
      });

      setShowCustomCategory(isCustomCategory);
      setCustomCategory(isCustomCategory ? bookmark.category : "");
      setAddModalVisible(true);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success("URL copied to clipboard");
  };

  const handleShareBookmark = (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentShareBookmark(bookmark);
    setShareModalVisible(true);
    shareForm.resetFields();
  };

  const handleShareSubmit = async () => {
    try {
      const values = await shareForm.validateFields();

      if (!currentShareBookmark) {
        message.error("No bookmark selected for sharing");
        return;
      }

      setLoading(true);

      const res = await shareBookmarks({
        email: values.email,
        bookmark: {
          title: currentShareBookmark.title,
          url: currentShareBookmark.url,
          category: currentShareBookmark.category,
          hub: Array.isArray(currentShareBookmark.hubs) ? currentShareBookmark.hubs.join(",") : currentShareBookmark.hubs,
        },
      });

      message.success("Bookmark shared successfully!");
      setShareModalVisible(false);
      shareForm.resetFields();
      setCurrentShareBookmark(null);
    } catch (err) {
      console.error("Error sharing bookmark:", err);
      message.error("Failed to share bookmark");
    } finally {
      setLoading(false);
    }
  };

  const handleTagSubmit = async () => {
    if (!currentTagBookmark || selectedMemberIds.length === 0) {
      message.warning("Please select family members to tag");
      return;
    }

    const taggedMembers = familyMembers.filter((member: any) =>
      selectedMemberIds.includes(member.id)
    );

    const emails = taggedMembers
      .map((member: any) => member.email)
      .filter((email: string) => !!email);

    try {
      setLoading(true);
      await shareBookmarks({
        email: emails,
        bookmark: {
          id: currentTagBookmark.id,
          title: currentTagBookmark.title,
          url: currentTagBookmark.url,
          category: currentTagBookmark.category,
          hub: Array.isArray(currentTagBookmark.hubs) ? currentTagBookmark.hubs.join(",") : currentTagBookmark.hubs,
        },
        tagged_members: emails,
      });

      message.success("Bookmark tagged successfully!");
      setTagModalVisible(false);
      setCurrentTagBookmark(null);
      setSelectedMemberIds([]);
    } catch (err) {
      console.error("Error tagging bookmark:", err);
      message.error("Failed to tag bookmark");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    form.resetFields();
    setShowCustomCategory(false);
    setCustomCategory("");
    // Set default hubs to ["none"]
    form.setFieldsValue({ hubs: ["family"] });
    setAddModalVisible(true);
  };

  const closeModal = () => {
    setAddModalVisible(false);
    form.resetFields();
    setEditingBookmarkId(null);
    setShowCustomCategory(false);
    setCustomCategory("");
  };

  const handleCategoryChange = (value: string) => {
    if (value === "Others") {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
      form.setFieldsValue({ customCategory: "" });
    }
  };

  const handleAddBookmark = async () => {
    try {
      const values = await form.validateFields();
      const normalizedUrl = normalizeUrl(values.url);
      const favicon = getFaviconFromUrl(normalizedUrl);

      // Determine the final category
      const finalCategory =
        showCustomCategory && customCategory.trim()
          ? customCategory.trim()
          : values.category;

      // Get hubs value, ensure it's an array and filter out "none" if other hubs are selected
      let hubsValue = Array.isArray(values.hubs) ? values.hubs : [values.hubs];
      
      // If multiple hubs are selected and "none" is among them, remove "none"
      if (hubsValue.length > 1 && hubsValue.includes("none")) {
        hubsValue = hubsValue.filter((hub: string) => hub !== "none");
      }
      
      // If no hubs selected or only "none", set to ["none"]
      if (hubsValue.length === 0) {
        hubsValue = ["none"];
      }

      // Prepare the bookmark data with consistent format for both create and edit
      const bookmarkData = {
        title: values.title,
        url: normalizedUrl,
        description: values.description,
        category: finalCategory,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : [],
        favicon,
        // Use consistent format - send hubs as array for both create and edit
        hubs: hubsValue,
        // Also send hub as comma-separated string for backward compatibility
        hub: hubsValue.join(","),
      };

      if (modalMode === "create") {
        const response = await addBookmark(bookmarkData);
        const { status, message: msg } = response.data;
        if (status) {
          const hubLabels = hubsValue.map((hub: string) => 
            hubOptions.find(h => h.value === hub)?.label || "Utilities"
          ).join(", ");
          message.success(msg || `Bookmark added to ${hubLabels} successfully!`);
          loadBookmarks();
          loadCategories();
        } else {
          message.error(msg || "Failed to add bookmark");
        }
      } else {
        // For edit mode, include the bookmark ID and editing flag
        const editBookmarkData = {
          ...bookmarkData,
          id: values.id,
          editing: true,
        };
        
        const response = await addBookmark(editBookmarkData);
        const { status, message: msg } = response.data;
        if (status) {
          message.success(msg || "Bookmark updated successfully!");
          loadBookmarks();
          loadCategories();
        } else {
          message.error(msg || "Failed to update bookmark");
        }
      }
      closeModal();
    } catch (error) {
      console.error("Error saving bookmark:", error);
      message.error("Failed to save bookmark");
    }
  };

  const getFaviconFromUrl = (url: string): string => {
    if (!url || typeof url !== "string") return "";
    const normalizedUrl = normalizeUrl(url);
    try {
      const parsedUrl = new URL(normalizedUrl);
      return `${parsedUrl.origin}/favicon.ico`;
    } catch (err) {
      return "";
    }
  };

  const getDropdownMenu = (bookmark: Bookmark) => ({
    items: [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit",
        onClick: () => handleEdit(bookmark.id),
      },
      
      {
        key: "share",
        icon: <ShareAltOutlined />,
        label: "Share",
        onClick: (e: { domEvent: any }) =>
          handleShareBookmark(bookmark, e.domEvent as any),
      },
      {
        key: "tag",
        icon: <TagOutlined />,
        label: "Tag",
        onClick: (e: { domEvent: any }) => {
          e.domEvent.stopPropagation();
          setCurrentTagBookmark(bookmark);
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
        onClick: () => handleDelete(bookmark.id),
      },
    ],
  });

  const getHubsDisplay = (hubs: string[] | undefined) => {
    if (!hubs || hubs.length === 0) {
      const defaultHub = hubOptions.find(h => h.value === "family");
      return defaultHub ? [{
        label: defaultHub.label,
        color: defaultHub.color,
        icon: defaultHub.icon,
        value: defaultHub.value
      }] : [];
    }
    
    return hubs.map(hub => {
      const hubOption = hubOptions.find(h => h.value === hub);
      return hubOption ? {
        label: hubOption.label,
        color: hubOption.color,
        icon: hubOption.icon,
        value: hubOption.value
      } : {
        label: "Utilities",
        color: "#faad14",
        icon: <BookOutlined style={{ fontSize: "12px" }} />,
        value: "none"
      };
    });
  };

  const renderBookmarkCard = (bookmark: Bookmark) => {
    if (!bookmark.url || !bookmark.url.match(/^https?:\/\//i)) {
      return null;
    }

    const hubsToDisplay = getHubsDisplay(bookmark.hubs);

    return (
      <Card
        key={bookmark.id}
        hoverable
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          border: "1px solid #f0f0f0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#ffffff",
          height: "180px",
          fontFamily: FONT_FAMILY,
        }}
        bodyStyle={{
          padding: "10px",
          height: "calc(100% - 40px)",
          display: "flex",
          flexDirection: "column",
        }}
        actions={[
          <Tooltip title="Edit" key="edit">
            <Button
              type="text"
              icon={<EditOutlined style={{ fontSize: "14px" }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(bookmark.id);
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_FAMILY,
                fontSize: "12px",
                padding: "4px",
              }}
            />
          </Tooltip>,
          <Tooltip title="Share" key="share">
            <Button
              type="text"
              icon={<ShareAltOutlined style={{ fontSize: "14px" }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleShareBookmark(bookmark, e);
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_FAMILY,
                fontSize: "12px",
                padding: "4px",
              }}
            />
          </Tooltip>,
          <Tooltip title="Tag" key="tag">
            <Button
              type="text"
              icon={<TagOutlined style={{ fontSize: "14px" }} />}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentTagBookmark(bookmark);
                setTagModalVisible(true);
                setSelectedMemberIds([]);
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_FAMILY,
                fontSize: "12px",
                padding: "4px",
              }}
            />
          </Tooltip>,
          <Tooltip title="Delete" key="delete">
            <Button
              type="text"
              icon={<DeleteOutlined style={{ fontSize: "14px", color: "#ff4d4f" }} />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(bookmark.id);
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_FAMILY,
                fontSize: "12px",
                padding: "4px",
              }}
            />
          </Tooltip>,
        ]}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flex: "1 0 auto",
          }}
        >
          <div style={{ flex: "0 0 auto", marginBottom: "6px" }}>
            {/* Top row with favicon, category tag, hub tags, and favorite button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={bookmark.favicon || getFaviconFromUrl(bookmark.url)}
                  size={28}
                  style={{
                    marginRight: "8px",
                    backgroundColor: "#f5f5f5",
                    flexShrink: 0,
                  }}
                  icon={<LinkOutlined />}
                />
                <Tag
                  color={categoryColors[bookmark.category] || "#666"}
                  style={{
                    margin: 0,
                    borderRadius: "8px",
                    fontSize: "11px",
                    padding: "2px 6px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {bookmark.category}
                </Tag>
              </div>
              
              {/* Right side: Hub Tags + Favorite Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {/* Hub Tags with icons */}
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  <Tooltip 
                    title={hubsToDisplay.map(hub => hub.label).join(", ")}
                    placement="topRight"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                      {hubsToDisplay.slice(0, 2).map((hub, index) => (
                        <div
                          key={index}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "6px",
                            backgroundColor: hub.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                          }}
                        >
                          {React.cloneElement(hub.icon, { 
                            style: { 
                              fontSize: "10px", 
                              color: "#fff" 
                            } 
                          })}
                        </div>
                      ))}
                      {hubsToDisplay.length > 2 && (
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "6px",
                            backgroundColor: "#f0f0f0",
                            border: "1px solid #e1e8ed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#666",
                            fontSize: "8px",
                            fontWeight: "bold",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          +{hubsToDisplay.length - 2}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </div>

                {/* Favorite Button */}
                <Tooltip
                  title={
                    bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Button
                    type="text"
                    size="small"
                    icon={
                      bookmark.isFavorite ? (
                        <StarFilled
                          style={{ color: "#e6357fff", fontSize: "14px" }}
                        />
                      ) : (
                        <StarOutlined style={{ fontSize: "14px" }} />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(bookmark.id);
                    }}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT_FAMILY,
                      padding: "4px",
                      minWidth: "28px",
                      height: "28px",
                      flexShrink: 0,
                    }}
                  />
                </Tooltip>
              </div>
            </div>
            
            {/* Title */}
            <Title
              level={5}
              style={{
                margin: 0,
                lineHeight: "1.2",
                color: "#1f1f1f",
                fontSize: "15px",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                fontFamily: FONT_FAMILY,
                marginBottom: "3px",
              }}
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1890ff",
                  textDecoration: "none",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {bookmark.title}
              </a>
            </Title>
            
            <Text
              type="secondary"
              style={{
                fontSize: "11px",
                display: "block",
                marginBottom: "6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: FONT_FAMILY,
              }}
            >
              {new URL(bookmark.url).hostname}
            </Text>
          </div>

          <div
            style={{
              flex: "1 0 auto",
              marginBottom: "6px",
              maxHeight: "18px",
            }}
          >
            <Paragraph
              style={{
                margin: 0,
                color: "#595959",
                fontSize: "13px",
                lineHeight: "1.3",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
                fontFamily: FONT_FAMILY,
              }}
            >
              {bookmark.description || " "}
            </Paragraph>
          </div>

          <div style={{ flex: "0 0 auto" }}>
            {Array.isArray(bookmark.tags) && bookmark.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {bookmark.tags.slice(0, 2).map((tag, index) => (
                  <Tag
                    key={index}
                    style={{
                      margin: 0,
                      backgroundColor: "#f6f8fa",
                      border: "1px solid #e1e8ed",
                      borderRadius: "5px",
                      fontSize: "11px",
                      padding: "1px 6px",
                      color: "#586069",
                      maxWidth: "80px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {tag}
                  </Tag>
                ))}
                {bookmark.tags && bookmark.tags.length > 2 && (
                  <Tooltip title={bookmark.tags.slice(2).join(", ")}>
                    <Tag
                      style={{
                        margin: 0,
                        fontSize: "11px",
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #e1e8ed",
                        borderRadius: "5px",
                        padding: "1px 6px",
                        color: "#666",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      +{bookmark.tags.length - 2}
                    </Tag>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const tableColumns: TableColumnsType<Bookmark> = [
    {
      title: "Bookmark",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (_, bookmark) => (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <Avatar
            src={bookmark.favicon || getFaviconFromUrl(bookmark.url)}
            size="large"
            style={{ backgroundColor: "#f5f5f5", marginTop: "4px" }}
            icon={<LinkOutlined />}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: "4px" }}>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1890ff",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: "15px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {bookmark.title}
              </a>
            </div>

            <Text
              type="secondary"
              style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
            >
              {new URL(bookmark.url).hostname}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Sub Category",
      dataIndex: "category",
      key: "category",
      width: "15%",
      render: (category) => (
        <Tag
          color={categoryColors[category] || "#666"}
          style={{
            borderRadius: "12px",
            fontSize: "13px",
            fontFamily: FONT_FAMILY,
          }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: "Hubs",
      dataIndex: "hubs",
      key: "hubs",
      width: "20%",
      render: (hubs) => {
        const hubsToDisplay = getHubsDisplay(hubs);
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
            {hubsToDisplay.slice(0, 3).map((hub, index) => (
              <Tooltip key={index} title={hub.label}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: hub.color,
                    color: "#fff",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY,
                    margin: 0,
                    padding: "4px 8px",
                  }}
                >
                  {React.cloneElement(hub.icon, { 
                    style: { 
                      fontSize: "12px", 
                      color: "#fff" 
                    } 
                  })}
                  <span>{hub.label}</span>
                </div>
              </Tooltip>
            ))}
            {hubsToDisplay.length > 3 && (
              <Tooltip title={hubsToDisplay.slice(3).map(h => h.label).join(", ")}>
                <Tag
                  style={{
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY,
                    margin: 0,
                    backgroundColor: "#f0f0f0",
                    color: "#666",
                  }}
                >
                  +{hubsToDisplay.length - 3}
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Added",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "15%",
      render: (_, bookmark) => {
        const dateValue =
          bookmark.createdAt || bookmark.created_at || bookmark.dateAdded;
        if (!dateValue) {
          return (
            <Text
              type="secondary"
              style={{ fontSize: "16px", fontFamily: FONT_FAMILY }}
            >
              N/A
            </Text>
          );
        }
        try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) {
            return (
              <Text
                type="secondary"
                style={{ fontSize: "16px", fontFamily: FONT_FAMILY }}
              >
                N/A
              </Text>
            );
          }
          return (
            <Text
              type="secondary"
              style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}
            >
              {date.toLocaleDateString()}
            </Text>
          );
        } catch (error) {
          return (
            <Text
              type="secondary"
              style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}
            >
              N/A
            </Text>
          );
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: "12%",
      render: (_, bookmark) => (
        <Space>
          <Tooltip
            title={
              bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Button
              type="text"
              size="large"
              icon={
                bookmark.isFavorite ? (
                  <StarFilled style={{ color: "#e6357fff" }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={() => handleToggleFavorite(bookmark.id)}
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Tooltip>
          <Dropdown menu={getDropdownMenu(bookmark)} trigger={["click"]}>
            <Button
              type="text"
              size="large"
              icon={<MoreOutlined />}
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        marginTop: "70px",
        minHeight: "100vh",
        padding: "24px",
        marginLeft: "40px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "24px" }}
        >
          <Col>
            <Row align="middle" gutter={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: 300,
                }}
              >
                {/* Icon box (square) */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "#2563eb",
                    borderRadius: 12, // Rounded square
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: "#fff",
                    marginRight: 12,
                  }}
                >
                  <BookOutlined />
                </div>

                {/* Text column */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      fontSize: 26,
                      fontFamily: FONT_FAMILY,
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {showOnlyFavorites ? "Favorite Bookmarks" : "Bookmarks"}
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 14,
                      fontFamily: FONT_FAMILY,
                      marginTop: 2,
                    }}
                  >
                    Your saved links from all hubs
                  </Text>
                </div>
              </div>
            </Row>
          </Col>
          <Col>
            <Space>
              {/* Favorites Filter Heart Button */}
              <Tooltip
                title={showOnlyFavorites ? "Show all bookmarks" : "Show only favorites"}
              >
                <Button
                  type={showOnlyFavorites ? "primary" : "default"}
                  icon={
                    showOnlyFavorites ? (
                      <StarFilled style={{ color: "#fff" }} />
                    ) : (
                      <StarOutlined style={{ color: "#ff4d4f" }} />
                    )
                  }
                  size="large"
                  onClick={handleFavoritesClick}
                  style={{
                    borderRadius: "12px",
                    height: "48px", // Match add bookmark button height
                    minWidth: "48px", // Square button
                    borderColor: showOnlyFavorites ? "#ff4d4f" : "#ff4d4f",
                    backgroundColor: showOnlyFavorites ? "#ff4d4f" : "transparent",
                    fontFamily: FONT_FAMILY,
                  }}
                />
              </Tooltip>
              <Tooltip title="Add bookmark">    
                <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                style={{
                  borderRadius: "12px",
                  background: "#2563eb",
                  borderColor: "#1890ff",
                  height: "48px", // Explicit height
                  fontFamily: FONT_FAMILY,
                }}
                onClick={openCreateModal}
              />
              </Tooltip>
              
              
              <Button
                type="default"
                icon={<DownloadOutlined />}
                size="large"
                onClick={showModal}
                style={{
                  borderRadius: "12px",
                  borderColor: "#1890ff",
                  color: "#2563eb",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "600",
                  minWidth: "160px",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                  boxShadow: "0 2px 8px rgba(24, 144, 255, 0.15)",
                  transition: "all 0.3s ease",
                  fontFamily: FONT_FAMILY,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(24, 144, 255, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(24, 144, 255, 0.15)";
                }}
              >
                Download Extension
              </Button>
            </Space>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "24px" }}>
          <Col flex="auto">
            <Input
              placeholder="Search bookmarks..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="large"
              style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
              disabled={showOnlyFavorites}
            />
          </Col>
          <Col>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              size="large"
              style={{ width: 120, fontFamily: FONT_FAMILY }}
              disabled={showOnlyFavorites}
            >
              {categories.map((cat) => (
                <Option
                  key={cat}
                  value={cat}
                  style={{ fontFamily: FONT_FAMILY }}
                >
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              value={sortBy}
              onChange={setSortBy}
              size="large"
              style={{ width: 140, fontFamily: FONT_FAMILY }}
            >
              <Option value="newest" style={{ fontFamily: FONT_FAMILY }}>
                Newest First
              </Option>
              <Option value="oldest" style={{ fontFamily: FONT_FAMILY }}>
                Oldest First
              </Option>
              <Option value="title" style={{ fontFamily: FONT_FAMILY }}>
                Title A-Z
              </Option>
              <Option value="title-desc" style={{ fontFamily: FONT_FAMILY }}>
                Title Z-A
              </Option>
              <Option value="category" style={{ fontFamily: FONT_FAMILY }}>
                Sub Category
              </Option>
            </Select>
          </Col>
          <Col>
            <Tooltip title={viewMode === "grid" ? "Grid View" : "Table View"}>
              <Button
                shape="circle"
                icon={
                  viewMode === "grid" ? <AppstoreOutlined /> : <TableOutlined />
                }
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "table" : "grid")
                }
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Tooltip>
          </Col>
        </Row>
        
        {filteredBookmarks.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
              border: "1px solid #f0f0f0",
              fontFamily: FONT_FAMILY,
            }}
          >
            <Empty
              description={
                <span
                  style={{
                    fontSize: "19px",
                    color: "#999",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {showOnlyFavorites
                    ? "No favorite bookmarks yet. Start adding some bookmarks to favorites!"
                    : searchQuery || selectedCategory !== "All"
                    ? "No bookmarks match your current filters"
                    : "No bookmarks yet. Add your first bookmark to get started!"}
                </span>
              }
            />
          </div>
        ) : viewMode === "grid" ? (
          <Row gutter={[16, 16]}>
            {filteredBookmarks
              .map((bookmark) => renderBookmarkCard(bookmark))
              .filter((card) => card !== null)
              .map((card, index) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={filteredBookmarks[index].id}
                >
                  {card}
                </Col>
              ))}
          </Row>
        ) : (
          <Table
            columns={tableColumns}
            dataSource={filteredBookmarks}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} bookmarks`,
            }}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              fontFamily: FONT_FAMILY,
            }}
            rowHoverable
          />
        )}

        {/* Share Bookmark Modal */}
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
              <ShareAltOutlined style={{ color: "#1677ff" }} />
              <span>Share Bookmark</span>
            </div>
          }
          open={shareModalVisible}
          onCancel={() => {
            setShareModalVisible(false);
            shareForm.resetFields();
            setCurrentShareBookmark(null);
          }}
          onOk={handleShareSubmit}
          centered
          width={500}
          okText="Share via Email"
          confirmLoading={loading}
          destroyOnClose
          style={{ fontFamily: FONT_FAMILY }}
        >
          {currentShareBookmark && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 8,
                  border: "1px solid #e9ecef",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Avatar
                    src={
                      currentShareBookmark.favicon ||
                      getFaviconFromUrl(currentShareBookmark.url)
                    }
                    size={32}
                    style={{ backgroundColor: "#f5f5f5" }}
                    icon={<LinkOutlined />}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        marginBottom: 4,
                        color: "#333",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {currentShareBookmark.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {new URL(currentShareBookmark.url).hostname}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Tag
                      color={
                        categoryColors[currentShareBookmark.category] || "#666"
                      }
                      style={{
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {currentShareBookmark.category}
                    </Tag>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {getHubsDisplay(currentShareBookmark.hubs).slice(0, 2).map((hub, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            backgroundColor: hub.color,
                            color: "#fff",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontFamily: FONT_FAMILY,
                            margin: 0,
                            padding: "2px 4px",
                          }}
                        >
                          {React.cloneElement(hub.icon, { 
                            style: { 
                              fontSize: "8px", 
                              color: "#fff" 
                            } 
                          })}
                          <span>{hub.label}</span>
                        </div>
                      ))}
                      {getHubsDisplay(currentShareBookmark.hubs).length > 2 && (
                        <Tag
                          style={{
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontFamily: FONT_FAMILY,
                            margin: 0,
                            backgroundColor: "#f0f0f0",
                            color: "#666",
                          }}
                        >
                          +{getHubsDisplay(currentShareBookmark.hubs).length - 2}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>

                {currentShareBookmark.description && (
                  <div
                    style={{
                      color: "#666",
                      marginBottom: 8,
                      lineHeight: 1.4,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {currentShareBookmark.description}
                  </div>
                )}

                <div style={{ marginBottom: 8 }}>
                  <a
                    href={currentShareBookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#1890ff",
                      fontSize: 12,
                      wordBreak: "break-all",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {currentShareBookmark.url}
                  </a>
                </div>

                {currentShareBookmark.tags &&
                  currentShareBookmark.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {currentShareBookmark.tags.map((tag, index) => (
                        <Tag
                          key={index}
                          style={{
                            fontSize: 10,
                            padding: "2px 6px",
                            backgroundColor: "#f0f0f0",
                            border: "1px solid #e0e0e0",
                            borderRadius: 4,
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}

          <Form form={shareForm} layout="vertical">
            <Form.Item
              name="email"
              label={
                <span style={{ fontFamily: FONT_FAMILY }}>Email Address</span>
              }
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
                prefix={<MailOutlined style={{ color: "#999" }} />}
                size="large"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>
          </Form>

          <div
            style={{
              fontSize: 12,
              color: "#666",
              marginTop: 16,
              fontFamily: FONT_FAMILY,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <span>📧</span>
              <span>
                This will open your default email client with the bookmark
                details
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span>✉</span>
              <span>You can edit the email before sending</span>
            </div>
          </div>
        </Modal>

        {/* Add/Edit Bookmark Modal */}
        <Modal
          title={
            <span style={{ fontFamily: FONT_FAMILY }}>
              {modalMode === "create" ? "Add New Bookmark" : "Edit Bookmark"}
            </span>
          }
          open={addModalVisible}
          onCancel={closeModal}
          footer={null}
          style={{ top: 20, fontFamily: FONT_FAMILY }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddBookmark}
            style={{ marginTop: "16px" }}
          >
            <Form.Item
              name="title"
              label={<span style={{ fontFamily: FONT_FAMILY }}>Title</span>}
              rules={[
                { required: true, message: "Please enter bookmark title" },
              ]}
            >
              <Input
                placeholder="Enter bookmark title"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>
            <Form.Item
              name="url"
              label={<span style={{ fontFamily: FONT_FAMILY }}>URL</span>}
              normalize={(value) => normalizeUrl(value)}
              rules={[
                { required: true, message: "Please enter URL" },
                {
                  validator: (_, value) =>
                    value &&
                    normalizeUrl(value).match(/^https?:\/\/[\w\-]+(\.[\w\-]+)+/)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Please enter a valid URL, e.g., www.example.com"
                          )
                        ),
                },
              ]}
            >
              <Input
                placeholder="www.example.com"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label={
                <span style={{ fontFamily: FONT_FAMILY }}>Description</span>
              }
            >
              <Input.TextArea
                placeholder="Brief description of the bookmark"
                rows={3}
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>
            <Form.Item
              name="category"
              label={
                <span style={{ fontFamily: FONT_FAMILY }}>Sub Category</span>
              }
              rules={[
                { required: true, message: "Please select Sub Category" },
              ]}
            >
              <Select
                placeholder="Select Sub Category"
                style={{ fontFamily: FONT_FAMILY }}
                onChange={handleCategoryChange}
              >
                <Option value="Tech" style={{ fontFamily: FONT_FAMILY }}>
                  Tech
                </Option>
                <Option value="Design" style={{ fontFamily: FONT_FAMILY }}>
                  Design
                </Option>
                <Option value="News" style={{ fontFamily: FONT_FAMILY }}>
                  News
                </Option>
                <Option value="Social" style={{ fontFamily: FONT_FAMILY }}>
                  Social
                </Option>
                <Option value="Tools" style={{ fontFamily: FONT_FAMILY }}>
                  Tools
                </Option>
                <Option value="Education" style={{ fontFamily: FONT_FAMILY }}>
                  Education
                </Option>
                <Option
                  value="Entertainment"
                  style={{ fontFamily: FONT_FAMILY }}
                >
                  Entertainment
                </Option>
                <Option value="Others" style={{ fontFamily: FONT_FAMILY }}>
                  Others
                </Option>
              </Select>
            </Form.Item>

            {/* Custom Category Input - only shows when "Others" is selected */}
            {showCustomCategory && (
              <Form.Item
                name="customCategory"
                label={
                  <span style={{ fontFamily: FONT_FAMILY }}>
                    Custom Sub Category
                  </span>
                }
                rules={[
                  {
                    required: showCustomCategory,
                    message: "Please enter custom Sub Category",
                  },
                  {
                    max: 50,
                    message: "Sub Category cannot exceed 50 characters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter your custom Sub Category"
                  style={{ fontFamily: FONT_FAMILY }}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </Form.Item>
            )}

            {/* Multi-Hub Selection Field */}
            <Form.Item
              name="hubs"
              label={<span style={{ fontFamily: FONT_FAMILY }}>Hubs</span>}
              rules={[{ required: true, message: "Please select at least one hub" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select one or more hubs"
                style={{ fontFamily: FONT_FAMILY }}
                maxTagCount="responsive"
                optionLabelProp="label"
              >
                {hubOptions.map((hub) => (
                  <Option
                    key={hub.value}
                    value={hub.value}
                    label={hub.label}
                    style={{ fontFamily: FONT_FAMILY }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          backgroundColor: hub.color,
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.cloneElement(hub.icon, { 
                          style: { 
                            fontSize: "10px", 
                            color: "#fff" 
                          } 
                        })}
                      </div>
                      {hub.label}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ fontFamily: FONT_FAMILY }}
                >
                  {modalMode === "create" ? "Add Bookmark" : "Update Bookmark"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Tag Modal */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TagOutlined style={{ color: "#52c41a" }} />
              <span>Tag Bookmark</span>
            </div>
          }
          open={tagModalVisible}
          onCancel={() => {
            setTagModalVisible(false);
            setCurrentTagBookmark(null);
            setSelectedMemberIds([]);
          }}
          onOk={handleTagSubmit}
          okText="Tag"
          centered
          width={500}
          confirmLoading={loading}
          destroyOnClose
        >
          {currentTagBookmark && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 8,
                  border: "1px solid #e9ecef",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Avatar
                    src={
                      currentTagBookmark.favicon ||
                      getFaviconFromUrl(currentTagBookmark.url)
                    }
                    size={32}
                    icon={<LinkOutlined />}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {currentTagBookmark.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      {new URL(currentTagBookmark.url).hostname}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Tag
                      color={
                        categoryColors[currentTagBookmark.category] || "#666"
                      }
                    >
                      {currentTagBookmark.category}
                    </Tag>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {getHubsDisplay(currentTagBookmark.hubs).slice(0, 2).map((hub, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            backgroundColor: hub.color,
                            color: "#fff",
                            borderRadius: "6px",
                            fontSize: "10px",
                            margin: 0,
                            padding: "2px 4px",
                          }}
                        >
                          {React.cloneElement(hub.icon, { 
                            style: { 
                              fontSize: "8px", 
                              color: "#fff" 
                            } 
                          })}
                          <span>{hub.label}</span>
                        </div>
                      ))}
                      {getHubsDisplay(currentTagBookmark.hubs).length > 2 && (
                        <Tag style={{ fontSize: "10px", margin: 0, backgroundColor: "#f0f0f0", color: "#666" }}>
                          +{getHubsDisplay(currentTagBookmark.hubs).length - 2}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ color: "#666", marginBottom: 8 }}>
                  {currentTagBookmark.description}
                </div>
                <a
                  href={currentTagBookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#1890ff" }}
                >
                  {currentTagBookmark.url}
                </a>
              </div>
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Tag to Family Members:
            </label>
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              placeholder="Select family members"
              value={selectedMemberIds}
              onChange={setSelectedMemberIds}
              optionLabelProp="label"
            >
              {familyMembers
                .filter((member: any) => member.relationship !== "me") // exclude self
                .map((member: any) => (
                  <Option key={member.id} value={member.id} label={member.name}>
                    {member.name}
                  </Option>
                ))}
            </Select>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Bookmarks;