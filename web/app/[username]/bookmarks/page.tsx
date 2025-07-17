
"use client";
import React, { useState, useMemo } from "react";
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
    Divider,
    Empty,
    Tooltip,
    Switch,
    List,
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
    UnorderedListOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    LinkOutlined,
    TagsOutlined,
    CalendarOutlined,
    FolderOutlined,
    BookOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Bookmark {
    id: string;
    title: string;
    url: string;
    description?: string;
    favicon?: string;
    category: string;
    tags: string[];
    isFavorite: boolean;
    createdAt: string;
}

const sampleBookmarks: Bookmark[] = [
    {
        id: "1",
        title: "React Documentation",
        url: "https://react.dev",
        description:
            "The official React documentation with guides, tutorials, and API reference.",
        favicon: "https://react.dev/favicon.ico",
        category: "Tech",
        tags: ["react", "javascript", "frontend", "documentation"],
        isFavorite: true,
        createdAt: "2024-01-15T10:30:00Z",
    },
    {
        id: "2",
        title: "Dribbble - Discover the World's Top Designers",
        url: "https://dribbble.com",
        description:
            "Dribbble is where designers gain inspiration, feedback, community, and jobs.",
        favicon: "https://dribbble.com/favicon.ico",
        category: "Design",
        tags: ["design", "inspiration", "ui", "portfolio"],
        isFavorite: false,
        createdAt: "2024-01-14T15:45:00Z",
    },
    {
        id: "3",
        title: "TechCrunch - Startup and Technology News",
        url: "https://techcrunch.com",
        description:
            "TechCrunch reporting on the business of technology, startups, and entrepreneurship.",
        favicon: "https://techcrunch.com/favicon.ico",
        category: "News",
        tags: ["tech", "news", "startups", "business"],
        isFavorite: false,
        createdAt: "2024-01-13T09:20:00Z",
    },
    {
        id: "4",
        title: "GitHub - Developer Platform",
        url: "https://github.com",
        description:
            "GitHub is where over 100 million developers shape the future of software, together.",
        favicon: "https://github.com/favicon.ico",
        category: "Tech",
        tags: ["git", "code", "development", "collaboration"],
        isFavorite: true,
        createdAt: "2024-01-12T14:10:00Z",
    },
    {
        id: "5",
        title: "Figma - Design Tool",
        url: "https://figma.com",
        description: "Figma is a collaborative interface design tool for teams.",
        favicon: "https://figma.com/favicon.ico",
        category: "Design",
        tags: ["figma", "design", "prototyping", "collaboration"],
        isFavorite: true,
        createdAt: "2024-01-11T11:00:00Z",
    },
    {
        id: "6",
        title: "Twitter - Social Network",
        url: "https://twitter.com",
        description: "From breaking news and entertainment to sports and politics.",
        favicon: "https://twitter.com/favicon.ico",
        category: "Social",
        tags: ["social", "news", "networking"],
        isFavorite: false,
        createdAt: "2024-01-10T16:30:00Z",
    },
    {
        id: "7",
        title: "Stack Overflow - Programming Q&A",
        url: "https://stackoverflow.com",
        description:
            "Stack Overflow is the largest online community for programmers to learn and share knowledge.",
        favicon: "https://stackoverflow.com/favicon.ico",
        category: "Tech",
        tags: ["programming", "qa", "community", "help"],
        isFavorite: false,
        createdAt: "2024-01-09T13:15:00Z",
    },
    {
        id: "8",
        title: "Notion - All-in-one workspace",
        url: "https://notion.so",
        description:
            "Notion is a single space where you can think, write, and plan.",
        favicon: "https://notion.so/favicon.ico",
        category: "Tools",
        tags: ["productivity", "notes", "workspace", "organization"],
        isFavorite: true,
        createdAt: "2024-01-08T08:45:00Z",
    },
];

const categoryColors: Record<string, string> = {
    Tech: "#1890ff",
    Design: "#722ed1",
    News: "#fa541c",
    Social: "#52c41a",
    Tools: "#faad14",
};

const Bookmarks: React.FC = () => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>(sampleBookmarks);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [form] = Form.useForm();

    const categories = useMemo(() => {
        const cats = Array.from(new Set(bookmarks.map((b) => b.category)));
        return ["All", ...cats];
    }, [bookmarks]);

    const filteredBookmarks = useMemo(() => {
        let filtered = bookmarks;

        if (searchQuery) {
            filtered = filtered.filter(
                (bookmark) =>
                    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    bookmark.description
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    bookmark.tags.some((tag) =>
                        tag.toLowerCase().includes(searchQuery.toLowerCase())
                    ) ||
                    bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory !== "All") {
            filtered = filtered.filter(
                (bookmark) => bookmark.category === selectedCategory
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return (
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                case "oldest":
                    return (
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                case "title":
                    return a.title.localeCompare(b.title);
                case "title-desc":
                    return b.title.localeCompare(a.title);
                case "category":
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [bookmarks, searchQuery, selectedCategory, sortBy]);

    const handleToggleFavorite = (id: string) => {
        setBookmarks((prev) =>
            prev.map((bookmark) =>
                bookmark.id === id
                    ? { ...bookmark, isFavorite: !bookmark.isFavorite }
                    : bookmark
            )
        );

        const bookmark = bookmarks.find((b) => b.id === id);
        if (bookmark) {
            message.success(
                bookmark.isFavorite
                    ? `"${bookmark.title}" removed from favorites`
                    : `"${bookmark.title}" added to favorites`
            );
        }
    };

    const handleDelete = (id: string) => {
        const bookmark = bookmarks.find((b) => b.id === id);
        setBookmarks((prev) => prev.filter((b) => b.id !== id));

        if (bookmark) {
            message.success(`"${bookmark.title}" has been deleted`);
        }
    };

    const handleEdit = (id: string) => {
        const bookmark = bookmarks.find((b) => b.id === id);
        if (bookmark) {
            message.info("Edit functionality would open here in a real app.");
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        message.success("URL copied to clipboard");
    };

    const handleAddBookmark = (values: any) => {
        const bookmark: Bookmark = {
            ...values,
            id: Date.now().toString(),
            isFavorite: false,
            createdAt: new Date().toISOString(),
            favicon: `https://www.google.com/s2/favicons?domain=${new URL(values.url).hostname
                }`,
            tags: values.tags
                ? values.tags.split(",").map((tag: string) => tag.trim())
                : [],
        };

        setBookmarks((prev) => [bookmark, ...prev]);
        setAddModalVisible(false);
        form.resetFields();
        message.success("Bookmark added successfully!");
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
            <div style={{ marginBottom: "12px" }}>
                <div
                    style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
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
                    style={{ margin: "0 0 8px 0", lineHeight: "1.4", color: "#262626" }}
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
                    {bookmark.description}
                </Paragraph>

                <Text
                    type="secondary"
                    style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}
                >
                    {new URL(bookmark.url).hostname}
                </Text>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {bookmark.tags.slice(0, 3).map((tag) => (
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
        </Card>
    );

    const renderBookmarkList = (bookmark: Bookmark) => (
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
                height: "320px", // Fixed height
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
            <div
                style={{
                    overflowY: "auto",
                    maxHeight: "240px", // subtract space taken by actions
                    paddingRight: "4px",
                }}
            >
                <div
                    style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
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
                    style={{ margin: "0 0 8px 0", lineHeight: "1.4", color: "#262626" }}
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
                    ellipsis={false} // Disable ellipsis to allow full scrollable content
                >
                    {bookmark.description}
                </Paragraph>

                <Text
                    type="secondary"
                    style={{ fontSize: "12px", display: "block", marginBottom: "8px" }}
                >
                    {new URL(bookmark.url).hostname}
                </Text>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {bookmark.tags.slice(0, 3).map((tag) => (
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
        </Card>
    );

    return (
        <div
            style={{
                marginTop: "40px",
                minHeight: "100vh",
                backgroundColor: "#ffffff",
                padding: "24px",
                // marginRight: '50px'
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
                                <Text type="secondary">{bookmarks.length} bookmarks</Text>
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
                            onClick={() => setAddModalVisible(true)}
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
                        <Tooltip title={viewMode === "grid" ? "Grid View" : "List View"}>
                            <Button
                                shape="circle"
                                icon={
                                    viewMode === "grid" ? (
                                        <AppstoreOutlined />
                                    ) : (
                                        <UnorderedListOutlined />
                                    )
                                }
                                onClick={() =>
                                    setViewMode(viewMode === "grid" ? "list" : "grid")
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
                                {bookmarks.length}
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
                                {bookmarks.filter((b) => b.isFavorite).length}
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
                                {categories.length - 1}
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
                    <div>{filteredBookmarks.map(renderBookmarkList)}</div>
                )}

                {/* Add Bookmark Modal */}
                <Modal
                    title="Add New Bookmark"
                    open={addModalVisible}
                    onCancel={() => {
                        setAddModalVisible(false);
                        form.resetFields();
                    }}
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

                        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setAddModalVisible(false);
                                        form.resetFields();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Add Bookmark
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