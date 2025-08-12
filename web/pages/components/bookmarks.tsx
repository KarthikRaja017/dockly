
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Typography,
    Space,
    Tag,
    Dropdown,
    Modal,
    Form,
    message,
    Avatar,
    Empty,
    Button,
    Input,
    Select,
    Row,
    Col,
} from "antd";
import {
    PlusOutlined,
    HeartOutlined,
    HeartFilled,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    CopyOutlined,
    ShareAltOutlined,
    TagOutlined,
    LinkOutlined,
    MailOutlined,
    BookOutlined,
    RightOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import {
    addBookmark,
    getBookmarks,
    deleteBookmark,
    toggleFavorite,
    shareBookmarks,
} from "../../services/bookmarks";
import { Bookmark, BookmarkFormData } from "../../types/bookmarks";
import { useGlobalLoading } from "../../app/loadingContext";
import { useCurrentUser } from "../../app/userContext";
import { getUsersFamilyMembers } from "../../services/family";

const { Title, Text } = Typography;
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

interface BookmarkHubProps {
    title?: string;
    icon?: React.ReactNode;
    category?: string;
    maxItems?: number;
    showAddButton?: boolean;
    onBookmarkAdded?: () => void;
}

const BookmarkHub: React.FC<BookmarkHubProps> = ({
    title = "Bookmarks",
    icon = <BookOutlined />,
    category,
    maxItems = 1000000000000,
    showAddButton = true,
    onBookmarkAdded,
}) => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const { loading, setLoading } = useGlobalLoading();
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
        null
    );
    const [form] = Form.useForm();
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [shareForm] = Form.useForm();
    const [currentShareBookmark, setCurrentShareBookmark] =
        useState<Bookmark | null>(null);
    const [tagModalVisible, setTagModalVisible] = useState(false);
    const [currentTagBookmark, setCurrentTagBookmark] = useState<Bookmark | null>(
        null
    );
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState("");
    const [expandedBookmarks, setExpandedBookmarks] = useState<Set<string>>(
        new Set()
    );

    useEffect(() => {
        loadBookmarks();
        fetchFamilyMembers();
    }, [category]);

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
                category: category !== "All" ? category : undefined,
                sortBy: "newest",
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
                    }))
                    .slice(0, maxItems);
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

    const handleToggleExpand = (bookmarkId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedBookmarks((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(bookmarkId)) {
                newSet.delete(bookmarkId);
            } else {
                newSet.add(bookmarkId);
            }
            return newSet;
        });
    };

    const handleTitleClick = (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, "_blank");
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
                loadBookmarks();
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

            // Check if it's a custom category
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

            if (isCustomCategory) {
                setShowCustomCategory(true);
                setCustomCategory(bookmark.category);
                form.setFieldsValue({
                    title: bookmark.title,
                    url: displayUrl,
                    description: bookmark.description,
                    category: "Others",
                    tags: bookmark.tags?.join(", ") || "",
                    id: bookmark.id,
                });
            } else {
                setShowCustomCategory(false);
                setCustomCategory("");
                form.setFieldsValue({
                    title: bookmark.title,
                    url: displayUrl,
                    description: bookmark.description,
                    category: bookmark.category,
                    tags: bookmark.tags?.join(", ") || "",
                    id: bookmark.id,
                });
            }
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
        setShowCustomCategory(false);
        setCustomCategory("");
        form.resetFields();
        setAddModalVisible(true);
    };

    const closeModal = () => {
        setAddModalVisible(false);
        setShowCustomCategory(false);
        setCustomCategory("");
        form.resetFields();
        setEditingBookmarkId(null);
    };

    const handleCategoryChange = (value: string) => {
        if (value === "Others") {
            setShowCustomCategory(true);
        } else {
            setShowCustomCategory(false);
            setCustomCategory("");
        }
    };

    const handleAddBookmark = async () => {
        try {
            const values = await form.validateFields();
            const normalizedUrl = normalizeUrl(values.url);
            const favicon = getFaviconFromUrl(normalizedUrl);

            // Use custom category if "Others" is selected and custom category is provided
            const finalCategory =
                values.category === "Others" && customCategory.trim()
                    ? customCategory.trim()
                    : values.category;

            if (modalMode === "create") {
                const bookmarkData: BookmarkFormData = {
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
                };
                const response = await addBookmark(bookmarkData);
                const { status, message: msg } = response.data;
                if (status) {
                    message.success(msg || "Bookmark added successfully!");
                    loadBookmarks();
                    onBookmarkAdded?.();
                } else {
                    message.error(msg || "Failed to add bookmark");
                }
            } else {
                const bookmarkData = {
                    id: values.id,
                    editing: true,
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
                };
                const response = await addBookmark(bookmarkData);
                const { status, message: msg } = response.data;
                if (status) {
                    message.success(msg || "Bookmark updated successfully!");
                    loadBookmarks();
                    onBookmarkAdded?.();
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
                key: "copy",
                icon: <CopyOutlined />,
                label: "Copy URL",
                onClick: () => handleCopyUrl(bookmark.url),
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

    return (
        <div style={{ fontFamily: FONT_FAMILY }}>
            <Card
                style={{
                    padding: 0, // let body handle padding
                    backgroundColor: "#ffffff",
                    width: 380,
                    borderRadius: 12,
                    position: "relative",
                    height: "360px", // Fixed height
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
                            icon={icon}
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
                                {title}
                            </Title>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: "13px",
                                    fontFamily: FONT_FAMILY,
                                }}
                            >
                                {bookmarks.length} items
                            </Text>
                        </div>
                    </div>

                    {showAddButton && (
                        <Button
                            type="primary"
                            shape="default"
                            icon={<PlusOutlined />}
                            size="large"
                            onClick={openCreateModal}
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
                    )}
                </div>

                {/* Scrollable Content */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        paddingRight: "6px",
                    }}
                >
                    {bookmarks.length === 0 ? (
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
                                        No bookmarks yet. Add your first bookmark!
                                    </span>
                                }
                            />
                        </div>
                    ) : (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                        >
                            {bookmarks.map((bookmark) => {
                                const isExpanded = expandedBookmarks.has(bookmark.id);

                                return (
                                    <div
                                        key={bookmark.id}
                                        style={{
                                            backgroundColor: "#fafafa",
                                            borderRadius: "12px",
                                            border: "1px solid #f0f0f0",
                                            transition: "all 0.2s ease",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Collapsed Header */}
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "12px 16px",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.parentElement!.style.backgroundColor =
                                                    "#f5f5f5";
                                                e.currentTarget.parentElement!.style.borderColor =
                                                    "#d9d9d9";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.parentElement!.style.backgroundColor =
                                                    "#fafafa";
                                                e.currentTarget.parentElement!.style.borderColor =
                                                    "#f0f0f0";
                                            }}
                                        >
                                            {/* Favicon */}
                                            <Avatar
                                                src={
                                                    bookmark.favicon || getFaviconFromUrl(bookmark.url)
                                                }
                                                size={32}
                                                style={{
                                                    backgroundColor: "#f5f5f5",
                                                    marginRight: "12px",
                                                    flexShrink: 0,
                                                }}
                                                icon={<LinkOutlined />}
                                            />

                                            {/* Title */}
                                            <div
                                                style={{ flex: 1, minWidth: 0 }}
                                                onClick={(e) => handleTitleClick(bookmark.url, e)}
                                            >
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
                                                        cursor: "pointer",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color = "#1890ff";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color = "#262626";
                                                    }}
                                                >
                                                    {bookmark.title}
                                                </Text>
                                            </div>

                                            {/* Expand/Collapse */}
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                                                onClick={(e) => handleToggleExpand(bookmark.id, e)}
                                                style={{
                                                    width: "28px",
                                                    height: "28px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    marginLeft: "8px",
                                                }}
                                            />
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && (
                                            <div
                                                style={{
                                                    borderTop: "1px solid #f0f0f0",
                                                    backgroundColor: "#ffffff",
                                                    padding: "16px",
                                                }}
                                            >
                                                {bookmark.description && (
                                                    <div style={{ marginBottom: "12px" }}>
                                                        <Text
                                                            type="secondary"
                                                            style={{
                                                                fontSize: "13px",
                                                                lineHeight: "1.5",
                                                                fontFamily: FONT_FAMILY,
                                                            }}
                                                        >
                                                            {bookmark.description}
                                                        </Text>
                                                    </div>
                                                )}

                                                <div style={{ marginBottom: "12px" }}>
                                                    <Text
                                                        type="secondary"
                                                        style={{
                                                            fontSize: "12px",
                                                            fontFamily: FONT_FAMILY,
                                                        }}
                                                    >
                                                        {new URL(bookmark.url).hostname}
                                                    </Text>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                        marginBottom: "16px",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <Tag
                                                        color={categoryColors[bookmark.category] || "#666"}
                                                        style={{
                                                            fontSize: "11px",
                                                            padding: "2px 6px",
                                                            borderRadius: "6px",
                                                            margin: 0,
                                                            fontFamily: FONT_FAMILY,
                                                        }}
                                                    >
                                                        {bookmark.category}
                                                    </Tag>

                                                    {bookmark.tags && bookmark.tags.length > 0 && (
                                                        <>
                                                            {bookmark.tags
                                                                .slice(0, 3)
                                                                .map((tag: string, index: number) => (
                                                                    <Tag
                                                                        key={index}
                                                                        style={{
                                                                            fontSize: "10px",
                                                                            padding: "2px 6px",
                                                                            backgroundColor: "#f0f0f0",
                                                                            border: "1px solid #e0e0e0",
                                                                            borderRadius: "4px",
                                                                            margin: 0,
                                                                            fontFamily: FONT_FAMILY,
                                                                        }}
                                                                    >
                                                                        {tag}
                                                                    </Tag>
                                                                ))}
                                                            {bookmark.tags.length > 3 && (
                                                                <Text
                                                                    type="secondary"
                                                                    style={{
                                                                        fontSize: "11px",
                                                                        fontFamily: FONT_FAMILY,
                                                                    }}
                                                                >
                                                                    +{bookmark.tags.length - 3} more
                                                                </Text>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        justifyContent: "flex-end",
                                                    }}
                                                >
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={
                                                            bookmark.isFavorite ? (
                                                                <HeartFilled
                                                                    style={{
                                                                        color: "#e6357fff",
                                                                        fontSize: "14px",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <HeartOutlined style={{ fontSize: "14px" }} />
                                                            )
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleFavorite(bookmark.id);
                                                        }}
                                                        style={{
                                                            width: "28px",
                                                            height: "28px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    />
                                                    <Dropdown
                                                        menu={getDropdownMenu(bookmark)}
                                                        trigger={["click"]}
                                                        placement="bottomRight"
                                                    >
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={
                                                                <MoreOutlined style={{ fontSize: "14px" }} />
                                                            }
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{
                                                                width: "28px",
                                                                height: "28px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        />
                                                    </Dropdown>
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

            {/* Add/Edit Modal */}
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
                        rules={[{ required: true, message: "Please enter bookmark title" }]}
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
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Description</span>}
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
                            <span style={{ fontFamily: FONT_FAMILY }}>ResourceType</span>
                        }
                        rules={[{ required: true, message: "Please select ResourceType" }]}
                    >
                        <Select
                            placeholder="Select ResourceType"
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
                            <Option value="Entertainment" style={{ fontFamily: FONT_FAMILY }}>
                                Entertainment
                            </Option>
                            <Option value="Others" style={{ fontFamily: FONT_FAMILY }}>
                                Others
                            </Option>
                        </Select>
                    </Form.Item>
                    {showCustomCategory && (
                        <Form.Item
                            label={
                                <span style={{ fontFamily: FONT_FAMILY }}>
                                    Custom ResourceType
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter custom resource type",
                                },
                                {
                                    max: 50,
                                    message: "Resource type name cannot exceed 50 characters",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Enter custom resource type name"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                style={{ fontFamily: FONT_FAMILY }}
                            />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="tags"
                        label={<span style={{ fontFamily: FONT_FAMILY }}>Labels</span>}
                    >
                        <Input
                            placeholder="Enter labels separated by commas (e.g., react, frontend, tutorial)"
                            style={{ fontFamily: FONT_FAMILY }}
                        />
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

            {/* Share Modal */}
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
                                        {currentShareBookmark.tags.map(
                                            (
                                                tag:
                                                    | string
                                                    | number
                                                    | bigint
                                                    | boolean
                                                    | React.ReactElement<
                                                        any,
                                                        string | React.JSXElementConstructor<any>
                                                    >
                                                    | Iterable<React.ReactNode>
                                                    | React.ReactPortal
                                                    | Promise<React.AwaitedReactNode>
                                                    | null
                                                    | undefined,
                                                index: React.Key | null | undefined
                                            ) => (
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
                                            )
                                        )}
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
                            { type: "email", message: "Please enter a valid email address" },
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
                            This will open your default email client with the bookmark details
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>✉</span>
                        <span>You can edit the email before sending</span>
                    </div>
                </div>
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
                                <Tag
                                    color={categoryColors[currentTagBookmark.category] || "#666"}
                                >
                                    {currentTagBookmark.category}
                                </Tag>
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
                            .filter((member: any) => member.relationship !== "me")
                            .map((member: any) => (
                                <Option key={member.id} value={member.id} label={member.name}>
                                    {member.name}
                                </Option>
                            ))}
                    </Select>
                </div>
            </Modal>
        </div>
    );
};

export default BookmarkHub;

