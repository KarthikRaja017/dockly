
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
    Tech: "#1890ff",
    Design: "#722ed1",
    News: "#fa541c",
    Social: "#52c41a",
    Tools: "#faad14",
    Education: "#13c2c2",
    Entertainment: "#eb2f96",
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

    // Load initial data
    useEffect(() => {
        loadBookmarks();
        loadCategories();
        loadStats();
    }, []);

    // Reload bookmarks when filters change
    useEffect(() => {
        loadBookmarks();
    }, [searchQuery, selectedCategory, sortBy]);

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
                setBookmarks(payload.bookmarks);
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
        return bookmarks; // Filtering is now done on the backend
    }, [bookmarks]);

    const handleToggleFavorite = async (id: string) => {
        // Optimistically update UI first
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
                    // Normalize snake_case to camelCase if needed
                    isFavorite:
                        payload.bookmark.isFavorite ??
                        payload.bookmark.is_favorite ??
                        false,
                };

                // Update with backend-confirmed bookmark (in case more fields changed)
                setBookmarks((prev) =>
                    prev.map((bookmark) =>
                        bookmark.id === id ? updatedBookmark : bookmark
                    )
                );

                message.success(
                    updatedBookmark.isFavorite
                        ? `"${updatedBookmark.title}" added to favorites`
                        : `"${updatedBookmark.title}" removed from favorites`
                );

                // Reload stats to reflect favorite count change
                loadStats();
            } else {
                message.error(msg || "Failed to update favorite status");

                // Revert UI change if toggle failed
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

            // Revert UI on error
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

                // Reload stats and categories
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
            form.setFieldsValue({
                title: bookmark.title,
                url: bookmark.url,
                description: bookmark.description,
                category: bookmark.category,
                tags: bookmark.tags.join(", "),
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
            const favicon = getFaviconFromUrl(values.url);

            if (modalMode === "create") {
                const bookmarkData: BookmarkFormData = {
                    title: values.title,
                    url: values.url,
                    description: values.description,
                    category: values.category,
                    tags: values.tags
                        ? values.tags.split(",").map((tag: string) => tag.trim())
                        : [],
                    favicon: favicon,
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
                // Edit mode
                const bookmarkData = {
                    id: values.id,
                    editing: true,
                    title: values.title,
                    url: values.url,
                    description: values.description,
                    category: values.category,
                    tags: values.tags
                        ? values.tags.split(",").map((tag: string) => tag.trim())
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
        try {
            const parsedUrl = new URL(url);
            return `${parsedUrl.origin}/favicon.ico`;
        } catch (err) {
            console.error("Invalid URL for favicon:", url);
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

    const renderBookmarkCard = (bookmark: Bookmark) => (
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
                height: "245px", // 💥 Fixed card height
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            actions={[
                <Button
                    type="text"
                    icon={
                        bookmark.isFavorite ? (
                            <HeartFilled style={{ color: "#ff4d4f" }} />
                        ) : (
                            <HeartOutlined />
                        )
                    }
                    onClick={() => handleToggleFavorite(bookmark.id)}
                />,
                <Dropdown menu={getDropdownMenu(bookmark)} trigger={["click"]}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>,
            ]}
        >
            {/* Content wrapper with fixed height */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                }}
            >
                {/* Top Section */}
                <div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                        }}
                    >
                        <Avatar
                            src={bookmark.favicon}
                            size="small"
                            style={{ marginRight: "8px", backgroundColor: "#f5f5f5" }}
                            icon={<LinkOutlined />}
                        />
                        <Tag
                            color={categoryColors[bookmark.category] || "#666"}
                            style={{ margin: 0, borderRadius: "12px", fontSize: "11px" }}
                        >
                            {bookmark.category}
                        </Tag>
                    </div>

                    <Title
                        level={5}
                        style={{
                            margin: "0 0 8px 0",
                            lineHeight: "1.4",
                            color: "#262626",
                            fontSize: "15px",
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

                    <Paragraph
                        style={{
                            margin: "0 0 12px 0",
                            color: "#595959",
                            fontSize: "13px",
                            lineHeight: "1.5",
                        }}
                        ellipsis={{ rows: 2 }}
                    >
                        {bookmark.description || " "}
                    </Paragraph>
                </div>

                {/* Bottom Section */}
                <div>
                    <Text
                        type="secondary"
                        style={{
                            fontSize: "12px",
                            display: "block",
                            marginBottom: "8px",
                        }}
                    >
                        {new URL(bookmark.url).hostname}
                    </Text>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {bookmark.tags.slice(0, 3).map((tag: any) => (
                            <Tag
                                key={tag}
                                style={{
                                    margin: 0,
                                    backgroundColor: "#f6f8fa",
                                    border: "1px solid #e1e8ed",
                                    borderRadius: "8px",
                                    fontSize: "10px",
                                    color: "#586069",
                                }}
                            >
                                {tag}
                            </Tag>
                        ))}
                        {bookmark.tags.length > 3 && (
                            <Tag
                                style={{
                                    margin: 0,
                                    fontSize: "10px",
                                    backgroundColor: "#f0f0f0",
                                    color: "#666",
                                }}
                            >
                                +{bookmark.tags.length - 3}
                            </Tag>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );

    const tableColumns: TableColumnsType<Bookmark> = [
        {
            title: "Bookmark",
            dataIndex: "title",
            key: "title",
            width: "20%",
            render: (_, bookmark) => (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <Avatar
                        src={bookmark.favicon}
                        size="small"
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
                                    fontSize: "14px",
                                }}
                            >
                                {bookmark.title}
                            </a>
                        </div>
                        {bookmark.description && (
                            <div
                                style={{
                                    color: "#666",
                                    fontSize: "12px",
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
                        <Text type="secondary" style={{ fontSize: "11px" }}>
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
                    style={{ borderRadius: "12px", fontSize: "11px" }}
                >
                    {category}
                </Tag>
            ),
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            width: "25%",
            render: (tags: string[]) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {tags.slice(0, 3).map((tag) => (
                        <Tag
                            key={tag}
                            style={{
                                margin: 0,
                                backgroundColor: "#f6f8fa",
                                border: "1px solid #e1e8ed",
                                borderRadius: "6px",
                                fontSize: "10px",
                                color: "#586069",
                            }}
                        >
                            {tag}
                        </Tag>
                    ))}
                    {tags.length > 3 && (
                        <Tooltip title={tags.slice(3).join(", ")}>
                            <Tag
                                style={{
                                    margin: 0,
                                    fontSize: "10px",
                                    backgroundColor: "#f0f0f0",
                                    color: "#666",
                                    cursor: "pointer",
                                }}
                            >
                                +{tags.length - 3}
                            </Tag>
                        </Tooltip>
                    )}
                </div>
            ),
        },
        {
            title: "Added",
            dataIndex: "createdAt",
            key: "createdAt",
            width: "12%",
            render: (created_at) => {
                console.log("🚀 ~ created_at:", created_at)
                const date = new Date(created_at);
                console.log("🚀 ~ date:", date)

                return (
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        {date instanceof Date && !isNaN(date.getTime())
                            ? date.toLocaleDateString()
                            : "N/A"}
                    </Text>
                );
            },
        },
        {
            title: "Actions",
            key: "actions",
            width: "8%",
            render: (_, bookmark) => (
                <Space>
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
                                    <HeartFilled style={{ color: "#ff4d4f" }} />
                                ) : (
                                    <HeartOutlined />
                                )
                            }
                            onClick={() => handleToggleFavorite(bookmark.id)}
                        />
                    </Tooltip>
                    <Dropdown menu={getDropdownMenu(bookmark)} trigger={["click"]}>
                        <Button type="text" size="small" icon={<MoreOutlined />} />
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
                {/* Header */}
                <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: "24px" }}
                >
                    <Col>
                        <Row align="middle" gutter={12}>
                            <Col>
                                <Avatar
                                    style={{
                                        background: "#1890ff",
                                        verticalAlign: "middle",
                                    }}
                                    icon={<BookOutlined />}
                                    size={48}
                                />
                            </Col>
                            <Col>
                                <Title level={3} style={{ margin: 0 }}>
                                    My Bookmarks
                                </Title>
                                <Text type="secondary">{stats.total_bookmarks} bookmarks</Text>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
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
                    </Col>
                </Row>

                {/* Controls */}
                <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "24px" }}>
                    <Col flex="auto">
                        <Input
                            placeholder="Search bookmarks..."
                            prefix={<SearchOutlined />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="large"
                            style={{ borderRadius: "8px" }}
                        />
                    </Col>
                    <Col>
                        <Select
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            size="large"
                            style={{ width: 120 }}
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

                {/* Stats */}
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
                            }}
                        >
                            <Title level={3} style={{ margin: 0, color: "#ff4d4f" }}>
                                {stats.favorite_bookmarks}
                            </Title>
                            <Text type="secondary">Favorites</Text>
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

                {/* Bookmarks Display */}
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
                                <span style={{ fontSize: "16px", color: "#999" }}>
                                    {searchQuery || selectedCategory !== "All"
                                        ? "No bookmarks match your current filters"
                                        : "No bookmarks yet. Add your first bookmark to get started!"}
                                </span>
                            }
                        />
                    </div>
                ) : viewMode === "grid" ? (
                    <Row gutter={[16, 16]}>
                        {filteredBookmarks.map((bookmark) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={bookmark.id}>
                                {renderBookmarkCard(bookmark)}
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
                        }}
                        rowHoverable
                    />
                )}

                {/* Add/Edit Bookmark Modal */}
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
                            rules={[
                                { required: true, message: "Please enter URL" },
                                { type: "url", message: "Please enter valid URL" },
                            ]}
                        >
                            <Input placeholder="https://example.com" />
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
                                <Button onClick={closeModal}>Cancel</Button>
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

