
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
} from "@ant-design/icons";
import {
    addBookmark,
    getBookmarks,
    deleteBookmark,
    toggleFavorite,
    getCategories,
    getStats,
} from "../../../services/bookmarks";
import { Bookmark, BookmarkFormData } from "../../../types/bookmarks";
import { useGlobalLoading } from "../../loadingContext";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

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

const Bookmarks: React.FC = () => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const { loading, setLoading } = useGlobalLoading();
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [stats, setStats] = useState({
        total_bookmarks: 0,
        favorite_bookmarks: 0,
        categories_count: 0,
    });
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
        null
    );
    const [form] = Form.useForm();
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    useEffect(() => {
        loadBookmarks();
        loadCategories();
        loadStats();
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

    const loadStats = async () => {
        try {
            const response = await getStats();
            const { status, payload } = response.data;
            if (status) {
                setStats(payload);
            }
        } catch (error) {
            console.error("Error loading stats:", error);
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
                loadStats();
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
                loadStats();
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
            form.setFieldsValue({
                title: bookmark.title,
                url: displayUrl,
                description: bookmark.description,
                category: bookmark.category,
                tags: bookmark.tags?.join(", ") || "",
                id: bookmark.id,
            });
            setAddModalVisible(true);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        message.success("URL copied to clipboard");
    };

    const openCreateModal = () => {
        setModalMode("create");
        form.resetFields();
        setAddModalVisible(true);
    };

    const closeModal = () => {
        setAddModalVisible(false);
        form.resetFields();
        setEditingBookmarkId(null);
    };

    const handleAddBookmark = async () => {
        try {
            const values = await form.validateFields();
            const normalizedUrl = normalizeUrl(values.url);
            const favicon = getFaviconFromUrl(normalizedUrl);

            if (modalMode === "create") {
                const bookmarkData: BookmarkFormData = {
                    title: values.title,
                    url: normalizedUrl,
                    description: values.description,
                    category: values.category,
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
                    loadStats();
                    loadCategories();
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
                    category: values.category,
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
                    loadStats();
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
                key: "copy",
                icon: <CopyOutlined />,
                label: "Copy URL",
                onClick: () => handleCopyUrl(bookmark.url),
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

    const renderBookmarkCard = (bookmark: Bookmark) => {
        if (!bookmark.url || !bookmark.url.match(/^https?:\/\//i)) {
            return null;
        }
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
                    height: "235px",
                }}
                bodyStyle={{
                    padding: "12px",
                    height: "calc(100% - 40px)",
                    display: "flex",
                    flexDirection: "column",
                }}
                actions={[
                    <Tooltip
                        title={
                            bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"
                        }
                        key="favorite"
                    >
                        <Button
                            type="text"
                            icon={
                                bookmark.isFavorite ? (
                                    <HeartFilled
                                        style={{ color: "#e6357fff", fontSize: "16px" }}
                                    />
                                ) : (
                                    <HeartOutlined style={{ fontSize: "16px" }} />
                                )
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(bookmark.id);
                            }}
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        />
                    </Tooltip>,
                    <Dropdown
                        menu={getDropdownMenu(bookmark)}
                        trigger={["click"]}
                        key="more"
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined style={{ fontSize: "16px" }} />}
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>,
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
                    <div style={{ flex: "0 0 auto", marginBottom: "8px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                            }}
                        >
                            <Avatar
                                src={bookmark.favicon || getFaviconFromUrl(bookmark.url)}
                                size={32}
                                style={{
                                    marginRight: "10px",
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
                                    fontSize: "12px",
                                    padding: "2px 8px",
                                }}
                            >
                                {bookmark.category}
                            </Tag>
                        </div>
                        <Title
                            level={5}
                            style={{
                                margin: "0 0 4px 0",
                                lineHeight: "1.3",
                                color: "#1f1f1f",
                                fontSize: "16px",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                            }}
                        >
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#1890ff", textDecoration: "none" }}
                            >
                                {bookmark.title}
                            </a>
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: "12px",
                                display: "block",
                                marginBottom: "8px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {new URL(bookmark.url).hostname}
                        </Text>
                    </div>

                    <div
                        style={{
                            flex: "1 0 auto",
                            marginBottom: "8px",
                            minHeight: "20px", // Ensure consistent space even when empty
                        }}
                    >
                        <Paragraph
                            style={{
                                margin: 0,
                                color: "#595959",
                                fontSize: "14px",
                                lineHeight: "1.4",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                wordBreak: "break-word", // Ensure long words don't break layout
                            }}
                        >
                            {bookmark.description || " "}
                        </Paragraph>
                    </div>

                    <div style={{ flex: "0 0 auto" }}>
                        {bookmark.tags?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {/* Show first 2 tags */}
                                {bookmark.tags.slice(0, 2).map((tag, index) => (
                                    <Tag
                                        key={index}
                                        style={{
                                            margin: 0,
                                            backgroundColor: "#f6f8fa",
                                            border: "1px solid #e1e8ed",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            padding: "2px 8px",
                                            color: "#586069",
                                            maxWidth: "100px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                                {/* Show +n if there are more than 2 tags */}
                                {bookmark.tags.length > 2 && (
                                    <Tooltip title={bookmark.tags.slice(2).join(", ")}>
                                        <Tag
                                            style={{
                                                margin: 0,
                                                fontSize: "12px",
                                                backgroundColor: "#f0f0f0",
                                                border: "1px solid #e1e8ed",
                                                borderRadius: "6px",
                                                padding: "2px 8px",
                                                color: "#666",
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
            width: "30%",
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
                                }}
                            >
                                {bookmark.title}
                            </a>
                        </div>
                        {bookmark.description && (
                            <div
                                style={{
                                    color: "#666",
                                    fontSize: "15px",
                                    lineHeight: "1.4",
                                    marginBottom: "4px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                }}
                            >
                                {bookmark.description}
                            </div>
                        )}
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                            {new URL(bookmark.url).hostname}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: "20%",
            render: (category) => (
                <Tag
                    color={categoryColors[category] || "#666"}
                    style={{ borderRadius: "12px", fontSize: "13px" }}
                >
                    {category}
                </Tag>
            ),
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
                        <Text type="secondary" style={{ fontSize: "16px" }}>
                            N/A
                        </Text>
                    );
                }
                try {
                    const date = new Date(dateValue);
                    if (isNaN(date.getTime())) {
                        return (
                            <Text type="secondary" style={{ fontSize: "16px" }}>
                                N/A
                            </Text>
                        );
                    }
                    return (
                        <Text type="secondary" style={{ fontSize: "14px" }}>
                            {date.toLocaleDateString()}
                        </Text>
                    );
                } catch (error) {
                    return (
                        <Text type="secondary" style={{ fontSize: "14px" }}>
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
                                    <HeartFilled style={{ color: "#e6357fff" }} />
                                ) : (
                                    <HeartOutlined />
                                )
                            }
                            onClick={() => handleToggleFavorite(bookmark.id)}
                        />
                    </Tooltip>
                    <Dropdown menu={getDropdownMenu(bookmark)} trigger={["click"]}>
                        <Button type="text" size="large" icon={<MoreOutlined />} />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <div
            style={{
                marginTop: "40px",
                minHeight: "100vh",
                backgroundColor: "#ffffff",
                padding: "24px",
                marginLeft: "40px",
            }}
        >
            <div
                style={{
                    maxWidth: "1400px",
                    margin: "0 auto",
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
            >
                <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: "24px" }}
                >
                    <Col>
                        <Row align="middle" gutter={12}>
                            <Col>
                                <Avatar
                                    style={{ background: "#1890ff", verticalAlign: "middle" }}
                                    icon={<BookOutlined />}
                                    size={48}
                                />
                            </Col>
                            <Col>
                                <Title level={3} style={{ margin: 0, fontSize: 30 }}>
                                    {showOnlyFavorites ? "Favorites" : "Bookmarks"}
                                </Title>
                                <Text type="secondary">{/* Bookmark count */}</Text>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                style={{
                                    borderRadius: "12px",
                                    background: "#1890ff",
                                    borderColor: "#1890ff",
                                }}
                                onClick={openCreateModal}
                            ></Button>
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
                            style={{ borderRadius: "8px" }}
                            disabled={showOnlyFavorites}
                        />
                    </Col>
                    <Col>
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            size="large"
                            style={{ width: 120 }}
                            disabled={showOnlyFavorites}
                        >
                            {categories.map((cat) => (
                                <Option key={cat} value={cat}>
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
                            style={{ width: 140 }}
                        >
                            <Option value="newest">Newest First</Option>
                            <Option value="oldest">Oldest First</Option>
                            <Option value="title">Title A-Z</Option>
                            <Option value="title-desc">Title Z-A</Option>
                            <Option value="category">Category</Option>
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
                            />
                        </Tooltip>
                    </Col>
                </Row>
                <Row gutter={16} style={{ marginBottom: "24px" }}>
                    <Col span={6}>
                        <Card
                            style={{
                                textAlign: "center",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                                {stats.total_bookmarks}
                            </Title>
                            <Text type="secondary">Total Bookmarks</Text>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card
                            style={{
                                textAlign: "center",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                                cursor: "pointer",
                                border: showOnlyFavorites
                                    ? "2px solid #1890ff"
                                    : "1px solid #f0f0f0",
                                transition: "all 0.3s ease",
                            }}
                            hoverable
                            onClick={handleFavoritesClick}
                            onMouseEnter={(e) => {
                                if (!showOnlyFavorites) {
                                    e.currentTarget.style.borderColor = "#1890ff";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!showOnlyFavorites) {
                                    e.currentTarget.style.borderColor = "#f0f0f0";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            <Title level={3} style={{ margin: 0, color: "#ec06b6ff" }}>
                                {stats.favorite_bookmarks}
                            </Title>
                            <Text type="secondary">
                                {showOnlyFavorites ? "Showing Favorites" : "Favorites"}
                            </Text>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card
                            style={{
                                textAlign: "center",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                                {stats.categories_count}
                            </Title>
                            <Text type="secondary">Categories</Text>
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card
                            style={{
                                textAlign: "center",
                                borderRadius: "8px",
                                backgroundColor: "#ffffff",
                            }}
                        >
                            <Title level={3} style={{ margin: 0, color: "#faad14" }}>
                                {filteredBookmarks.length}
                            </Title>
                            <Text type="secondary">Filtered Results</Text>
                        </Card>
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
                        }}
                    >
                        <Empty
                            description={
                                <span style={{ fontSize: "19px", color: "#999" }}>
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
                        style={{ backgroundColor: "#ffffff", borderRadius: "8px" }}
                        rowHoverable
                    />
                )}
                <Modal
                    title={modalMode === "create" ? "Add New Bookmark" : "Edit Bookmark"}
                    open={addModalVisible}
                    onCancel={closeModal}
                    footer={null}
                    style={{ top: 20 }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAddBookmark}
                        style={{ marginTop: "16px" }}
                    >
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[
                                { required: true, message: "Please enter bookmark title" },
                            ]}
                        >
                            <Input placeholder="Enter bookmark title" />
                        </Form.Item>
                        <Form.Item
                            name="url"
                            label="URL"
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
                            <Input placeholder="www.example.com" />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <Input.TextArea
                                placeholder="Brief description of the bookmark"
                                rows={3}
                            />
                        </Form.Item>
                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[{ required: true, message: "Please select category" }]}
                        >
                            <Select placeholder="Select category">
                                <Option value="Tech">Tech</Option>
                                <Option value="Design">Design</Option>
                                <Option value="News">News</Option>
                                <Option value="Social">Social</Option>
                                <Option value="Tools">Tools</Option>
                                <Option value="Education">Education</Option>
                                <Option value="Entertainment">Entertainment</Option>
                                <Option value="Others">Others</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="tags" label="Tags">
                            <Input placeholder="Enter tags separated by commas (e.g., react, frontend, tutorial)" />
                        </Form.Item>
                        <Form.Item name="id" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    {modalMode === "create" ? "Add Bookmark" : "Update Bookmark"}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default Bookmarks;