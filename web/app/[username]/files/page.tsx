'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Input,
    Button,
    Card,
    Avatar,
    Typography,
    Space,
    Row,
    Col,
    Dropdown,
    Tooltip,
    Upload,
    Progress,
    Modal,
    Form,
    Select,
    message,
    Spin,
    Empty,
    Badge,
    Tag,
    Breadcrumb,
    Divider,
    Table,
    Pagination,
    MenuProps,
    Popconfirm
} from 'antd';
import {
    SearchOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    MoreOutlined,
    FolderOutlined,
    FileTextOutlined,
    FileExcelOutlined,
    PlayCircleOutlined,
    FileZipOutlined,
    FilePptOutlined,
    FilePdfOutlined,
    PictureOutlined,
    MinusOutlined,
    DownloadOutlined,
    DeleteOutlined,
    ShareAltOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    HomeOutlined,
    CloudUploadOutlined,
    StarOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    FilterOutlined,
    DownOutlined,
    UpOutlined,
    CloseOutlined,
    UploadOutlined,
    FolderAddOutlined
} from '@ant-design/icons';
import { createDriveFolder, deleteDriveFile, downloadDriveFile, listDriveFiles, shareDriveFile, uploadDriveFile } from '../../../services/files';
import { PRIMARY_COLOR } from '../../comman';
import { trimGooglePhotoUrl } from '../../../pages/components/header';


interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: number;
    modifiedTime: string;
    owners: Array<{ displayName?: string; photoLink?: string }>;
    webViewLink?: string;
    thumbnailLink?: string;
    shared?: boolean;
    starred?: boolean;
}

interface DriveFolder {
    id: string;
    name: string;
    modifiedTime: string;
    shared?: boolean;
}

interface UploadProgress {
    [fileName: string]: {
        progress: number;
        status: 'uploading' | 'completed' | 'error';
    };
}

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

// Upload Area Component
const UploadArea: React.FC<{
    onUpload: (file: File) => void;
    uploadProgress: UploadProgress;
    isUploading: boolean;
}> = ({ onUpload, uploadProgress, isUploading }) => {
    const uploadProps = {
        name: 'file',
        multiple: true,
        showUploadList: false,
        beforeUpload: (file: File) => {
            onUpload(file);
            return false;
        }
    };

    return (
        <div style={{ marginBottom: '0px' }}>
            <Dragger
                {...uploadProps}
                style={{
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dadce0',
                    borderRadius: '8px',
                    padding: '16px 4px',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <CloudUploadOutlined style={{
                        fontSize: '38px',
                        color: '#5f6368',
                        marginBottom: '16px',
                        display: 'block'
                    }} />
                    <div style={{
                        fontSize: '16px',
                        color: '#202124',
                        marginBottom: '8px',
                        fontWeight: 500
                    }}>
                        Drag files here or click to upload
                    </div>
                    <div style={{ fontSize: '14px', color: '#5f6368' }}>
                        Support for single or bulk upload
                    </div>
                </div>
            </Dragger>

            {Object.keys(uploadProgress).length > 0 && (
                <Card
                    size="small"
                    style={{
                        marginTop: '16px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    title={
                        <Space>
                            <CloudUploadOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '14px', fontWeight: 500 }}>Upload Progress</span>
                        </Space>
                    }
                >
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} style={{ marginBottom: '12px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px'
                            }}>
                                <Text style={{ fontSize: '13px', fontWeight: 500 }}>{filename}</Text>
                                <Space size="small">
                                    {progress.status === 'completed' && (
                                        <Badge status="success" />
                                    )}
                                    {progress.status === 'error' && (
                                        <Badge status="error" />
                                    )}
                                    <Text style={{ fontSize: '12px', color: '#5f6368' }}>
                                        {progress.progress}%
                                    </Text>
                                </Space>
                            </div>
                            <Progress
                                percent={progress.progress}
                                status={progress.status === 'error' ? 'exception' : progress.status === 'completed' ? 'success' : 'active'}
                                strokeColor={PRIMARY_COLOR}
                                size="small"
                                showInfo={false}
                            />
                        </div>
                    ))}
                </Card>
            )}
        </div>
    );
};
const HeaderBar: React.FC<{
    breadcrumbs: Array<{ id: string; name: string }>;
    onNavigate: (index: number) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortByChange: (value: string) => void;
    sortOrder: string;
    onSortOrderChange: () => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: () => void;
    onRefresh: () => void;
    loading: boolean;
    extraIcon?: React.ReactNode;
}> = ({
    breadcrumbs,
    onNavigate,
    searchQuery,
    onSearchChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    viewMode,
    onViewModeChange,
    onRefresh,
    loading,
    extraIcon,
}) => {
        const [showSearch, setShowSearch] = useState(false);

        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    backgroundColor: '#f9fafa',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}
            >
                {/* Breadcrumbs on Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <HomeOutlined style={{ color: PRIMARY_COLOR }} />
                        </Breadcrumb.Item>
                        {breadcrumbs.map((crumb, index) => (
                            <Breadcrumb.Item key={crumb.id}>
                                <Button
                                    type="link"
                                    onClick={() => onNavigate(index)}
                                    style={{
                                        padding: 0,
                                        height: 'auto',
                                        color:
                                            index === breadcrumbs.length - 1
                                                ? PRIMARY_COLOR
                                                : '#5f6368',
                                        fontWeight: index === breadcrumbs.length - 1 ? 500 : 400,
                                        fontSize: '14px'
                                    }}
                                >
                                    {crumb.name}
                                </Button>
                            </Breadcrumb.Item>
                        ))}
                    </Breadcrumb>
                </div>

                {/* Search + Filters on Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Search Section */}
                    {!showSearch ? (
                        <Button
                            icon={<SearchOutlined />}
                            size="middle"
                            style={{
                                borderColor: '#dadce0',
                                color: '#5f6368',
                                transition: 'all 0.3s ease',
                            }}
                            onClick={() => setShowSearch(true)}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Search
                                placeholder="Search in Drive"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                style={{
                                    width: '250px',
                                    transition: 'all 0.3s ease',
                                    borderRadius: '20px',
                                }}
                                size="middle"
                                allowClear
                                autoFocus
                            />
                            <Button
                                icon={<CloseOutlined />}
                                onClick={() => setShowSearch(false)}
                                size="middle"
                                style={{
                                    borderColor: '#dadce0',
                                    color: '#5f6368',
                                    borderRadius: '50%',
                                }}
                            />
                        </div>
                    )}

                    {/* Filters */}
                    <Space size="small">
                        <Select
                            value={sortBy}
                            onChange={onSortByChange}
                            style={{ width: 120 }}
                            size="middle"
                        >
                            <Select.Option value="modifiedTime">Modified</Select.Option>
                            <Select.Option value="name">Name</Select.Option>
                            <Select.Option value="size">Size</Select.Option>
                        </Select>

                        <Tooltip title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                            <Button
                                icon={
                                    sortOrder === 'asc'
                                        ? <SortAscendingOutlined />
                                        : <SortDescendingOutlined />
                                }
                                onClick={onSortOrderChange}
                                size="middle"
                                style={{
                                    borderColor: '#dadce0',
                                    color: '#5f6368',
                                    borderRadius: '6px',
                                }}
                            />
                        </Tooltip>

                        <Tooltip title={`Switch to ${viewMode === 'grid' ? 'List' : 'Grid'} view`}>
                            <Button
                                icon={
                                    viewMode === 'grid'
                                        ? <UnorderedListOutlined />
                                        : <AppstoreOutlined />
                                }
                                onClick={onViewModeChange}
                                size="middle"
                                style={{
                                    borderColor: '#dadce0',
                                    color: '#5f6368',
                                    borderRadius: '6px',
                                }}
                            />
                        </Tooltip>

                        <Tooltip title="Refresh">
                            <Button
                                icon={<ReloadOutlined spin={loading} />}
                                onClick={onRefresh}
                                disabled={loading}
                                size="middle"
                                style={{
                                    borderColor: '#dadce0',
                                    color: '#5f6368',
                                    borderRadius: '6px',
                                }}
                            />
                        </Tooltip>
                        {extraIcon}
                    </Space>
                </div>
            </div>
        );
    };

// Folders Section Component
const FoldersSection: React.FC<{
    folders: DriveFolder[];
    onFolderClick: (folderId: string, folderName: string) => void;
    onFileAction: (action: string, item: DriveFolder | DriveFile) => void;
    viewMode: 'grid' | 'list';
}> = ({ folders, onFolderClick, onFileAction, viewMode }) => {
    const [showAll, setShowAll] = useState(false);
    const displayFolders = showAll
        ? folders
        : folders.slice(0, viewMode === 'list' ? 4 : 8);

    const getMenuItems = (folder: DriveFolder) => [
        {
            key: 'share',
            label: 'Share',
            icon: <ShareAltOutlined />,
            onClick: () => onFileAction('share', folder)
        },
        {
            key: 'delete',
            label: (
                <Popconfirm
                    title={`Delete ${'mimeType' in folder ? 'file' : 'folder'}?`}
                    description={`Are you sure you want to delete "${folder.name}"?`}
                    okText="Delete"
                    okType="danger"
                    onConfirm={() => onFileAction('delete', folder)}
                >
                    <span style={{ color: 'red' }}>Delete</span>
                </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true,
        }
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    if (folders.length === 0) return null;

    return (
        <div style={{ padding: '24px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                    <Text style={{ fontSize: '16px', fontWeight: 500, color: '#202124' }}>
                        Folders
                    </Text>
                    <Badge
                        count={folders.length}
                        style={{ backgroundColor: '#e8f0fe', color: PRIMARY_COLOR }}
                    />
                </div>
                {folders.length > 8 && (
                    <Button
                        type="text"
                        size="small"
                        icon={showAll ? <UpOutlined /> : <DownOutlined />}
                        onClick={() => setShowAll(!showAll)}
                        style={{
                            color: PRIMARY_COLOR,
                            fontSize: '13px',
                            height: '28px'
                        }}
                    >
                        {showAll ? 'Show less' : `Show all (${folders.length})`}
                    </Button>
                )}
            </div>

            {viewMode === 'grid' ? (
                <Row gutter={[12, 12]}>
                    {displayFolders.map((folder) => (
                        <Col xs={12} sm={8} md={6} lg={4} xl={3} key={folder.id}>
                            <div
                                onClick={() => onFolderClick(folder.id, folder.name)}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: '#fff',
                                    border: '1px solid transparent',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.borderColor = '#dadce0';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                    e.currentTarget.style.borderColor = 'transparent';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <FolderOutlined style={{
                                        fontSize: '20px',
                                        color: PRIMARY_COLOR,
                                        marginRight: '8px'
                                    }} />
                                    <Text
                                        style={{
                                            fontSize: '14px',
                                            color: '#202124',
                                            flex: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontWeight: 500
                                        }}
                                    >
                                        {folder.name}
                                    </Text>
                                    <Dropdown
                                        menu={{ items: getMenuItems(folder) }}
                                        trigger={['click']}
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<MoreOutlined />}
                                            style={{
                                                opacity: 0,
                                                transition: 'opacity 0.2s ease',
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px'
                                            }}
                                            className="folder-menu-btn"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Dropdown>
                                </div>
                                <Text style={{ fontSize: '12px', color: '#5f6368' }}>
                                    Modified {formatDate(folder.modifiedTime)}
                                </Text>
                                {folder.shared && (
                                    <div style={{ marginTop: '4px' }}>
                                        <Tag color="blue" style={{ fontSize: '11px' }}>
                                            <TeamOutlined style={{ marginRight: '2px' }} />
                                            Shared
                                        </Tag>
                                    </div>
                                )}
                            </div>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div>
                    {displayFolders.map((folder) => (
                        <div
                            key={folder.id}
                            onClick={() => onFolderClick(folder.id, folder.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                                marginBottom: '4px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <FolderOutlined style={{
                                fontSize: '18px',
                                color: PRIMARY_COLOR,
                                marginRight: '16px'
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Text style={{ fontSize: '14px', color: '#202124', fontWeight: 500 }}>
                                    {folder.name}
                                </Text>
                                <div style={{ marginTop: '2px' }}>
                                    <Text style={{ fontSize: '12px', color: '#5f6368' }}>
                                        Modified {formatDate(folder.modifiedTime)}
                                    </Text>
                                    {folder.shared && (
                                        <Tag color="blue" style={{ marginLeft: '8px', fontSize: '11px' }}>
                                            <TeamOutlined style={{ marginRight: '2px' }} />
                                            Shared
                                        </Tag>
                                    )}
                                </div>
                            </div>
                            <Dropdown
                                menu={{ items: getMenuItems(folder) }}
                                trigger={['click']}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<MoreOutlined />}
                                    style={{ color: '#5f6368' }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </Dropdown>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
// Files Section Component
const FilesSection: React.FC<{
    files: DriveFile[];
    onFileAction: (action: string, file: DriveFile) => void;
    viewMode: 'grid' | 'list';
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number, size?: number) => void;
}> = ({ files, onFileAction, viewMode, currentPage, pageSize, onPageChange }) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayFiles = files.slice(startIndex, endIndex);

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('image')) return <PictureOutlined />;
        if (mimeType.includes('video')) return <PlayCircleOutlined />;
        if (mimeType.includes('pdf')) return <FilePdfOutlined />;
        if (mimeType.includes('document')) return <FileTextOutlined />;
        if (mimeType.includes('spreadsheet')) return <FileExcelOutlined />;
        if (mimeType.includes('presentation')) return <FilePptOutlined />;
        if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileZipOutlined />;
        return <FileTextOutlined />;
    };

    const getFileIconColor = (mimeType: string) => {
        if (mimeType.includes('image')) return '#34a853';
        if (mimeType.includes('video')) return '#ea4335';
        if (mimeType.includes('pdf')) return '#ea4335';
        if (mimeType.includes('document')) return '#4285f4';
        if (mimeType.includes('spreadsheet')) return '#34a853';
        if (mimeType.includes('presentation')) return '#ff9900';
        if (mimeType.includes('zip') || mimeType.includes('archive')) return '#9aa0a6';
        return '#5f6368';
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    const getMenuItems = (file: DriveFile) => [
        {
            key: 'view',
            label: 'View',
            icon: <EyeOutlined />,
            onClick: () => onFileAction('view', file),
        },
        {
            key: 'download',
            label: 'Download',
            icon: <DownloadOutlined />,
            onClick: () => onFileAction('download', file),
        },
        {
            key: 'share',
            label: 'Share',
            icon: <ShareAltOutlined />,
            onClick: () => onFileAction('share', file),
        },
        {
            key: 'delete',
            label: (
                <Popconfirm
                    title={`Delete ${'mimeType' in file ? 'file' : 'folder'}?`}
                    description={`Are you sure you want to delete "${file.name}"?`}
                    okText="Delete"
                    okType="danger"
                    onConfirm={() => onFileAction('delete', file)}
                >
                    <span style={{ color: 'red' }}>Delete</span>
                </Popconfirm>
            ),
            icon: <DeleteOutlined style={{ color: 'red' }} />,
        }
    ];

    if (files.length === 0) return null;

    // ------------------ LIST VIEW -------------------
    if (viewMode === 'list') {
        const columns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                render: (text: string, record: DriveFile) => {
                    return (
                        <div
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => onFileAction('view', record)}
                        >
                            <div
                                style={{
                                    marginRight: '12px',
                                    color: getFileIconColor(record.mimeType),
                                    fontSize: '16px',
                                }}
                            >
                                {getFileIcon(record.mimeType)}
                            </div>
                            <div>
                                <Text style={{ fontSize: '14px', color: '#202124', fontWeight: 500 }}
                                >
                                    {text}
                                </Text>
                                {record.shared && (
                                    <div style={{ marginTop: '2px' }}>
                                        <Tag color="blue" style={{ fontSize: '11px' }}>
                                            <TeamOutlined style={{ marginRight: '2px' }} />
                                            Shared
                                        </Tag>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }
            },
            {
                title: 'Owner',
                dataIndex: 'owners',
                key: 'owners',
                width: 180,
                render: (owners: DriveFile['owners']) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {owners[0]?.photoLink ? (
                            <Avatar size="small" src={owners[0].photoLink} style={{ marginRight: '8px' }} />
                        ) : (
                            <Avatar size="small" style={{ marginRight: '8px', backgroundColor: PRIMARY_COLOR }}>
                                {(owners[0]?.displayName || 'U')[0]}
                            </Avatar>
                        )}
                        <Text style={{ fontSize: '13px', color: '#5f6368' }}>
                            {owners[0]?.displayName || 'Unknown'}
                        </Text>
                    </div>
                ),
            },
            {
                title: 'Last modified',
                dataIndex: 'modifiedTime',
                key: 'modifiedTime',
                width: 150,
                render: (text: string) => (
                    <Text style={{ fontSize: '13px', color: '#5f6368' }}>{formatDate(text)}</Text>
                ),
            },
            {
                title: 'File size',
                dataIndex: 'size',
                key: 'size',
                width: 100,
                render: (size?: number) => (
                    <Text style={{ fontSize: '13px', color: '#5f6368' }}>{formatFileSize(size)}</Text>
                ),
            },
            {
                title: '',
                key: 'actions',
                width: 60,
                render: (_: any, record: DriveFile) => (
                    <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} style={{ color: '#5f6368' }} />
                    </Dropdown>
                ),
            },
        ];

        return (
            <div style={{ padding: '0 24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <FileTextOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                    <Text style={{ fontSize: '16px', fontWeight: 500, color: '#202124' }}>Files</Text>
                    <Badge count={files.length} style={{ backgroundColor: '#e8f0fe', color: PRIMARY_COLOR }} />
                </div>
                <Table
                    columns={columns}
                    dataSource={displayFiles}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                    }}
                    className="custom-table"
                />
                {files.length > pageSize && (
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '24px',
                            padding: '16px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                        }}
                    >
                        <Pagination
                            current={currentPage}
                            total={files.length}
                            pageSize={pageSize}
                            onChange={onPageChange}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} files`}
                            style={{ fontSize: '14px' }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // ------------------ GRID VIEW -------------------
    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FileTextOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                <Text style={{ fontSize: '16px', fontWeight: 500, color: '#202124' }}>Files</Text>
                <Badge count={files.length} style={{ backgroundColor: '#e8f0fe', color: PRIMARY_COLOR }} />
            </div>
            <Row gutter={[12, 12]}>
                {displayFiles.map((file) => (
                    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={file.id}>
                        <div
                            style={{
                                padding: '0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                backgroundColor: '#fff',
                                border: '1px solid #e8eaed',
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                            onClick={() => onFileAction('view', file)} // <-- open on click
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div
                                style={{
                                    height: '120px',
                                    backgroundColor: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundImage: file.thumbnailLink
                                        ? `url(${trimGooglePhotoUrl(file.thumbnailLink)})`
                                        : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    position: 'relative',
                                }}
                            >
                                {!file.thumbnailLink && (
                                    <div style={{ fontSize: '32px', color: getFileIconColor(file.mimeType) }}>
                                        {getFileIcon(file.mimeType)}
                                    </div>
                                )}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease',
                                    }}
                                    className="file-menu-btn"
                                >
                                    <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                                        <Button
                                            type="primary"
                                            size="small"
                                            shape="circle"
                                            icon={<MoreOutlined />}
                                            style={{
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                border: 'none',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                            }}
                                            onClick={(e) => e.stopPropagation()} // prevent open on dropdown click
                                        />
                                    </Dropdown>
                                </div>
                            </div>
                            <div style={{ padding: '12px' }}>
                                <Text
                                    style={{
                                        fontSize: '14px',
                                        color: '#202124',
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        marginBottom: '4px',
                                        fontWeight: 500,
                                    }}
                                >
                                    {file.name}
                                </Text>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                    {file.owners[0]?.photoLink ? (
                                        <Avatar size={16} src={file.owners[0].photoLink} style={{ marginRight: '6px' }} />
                                    ) : (
                                        <Avatar
                                            size={16}
                                            style={{
                                                marginRight: '6px',
                                                backgroundColor: PRIMARY_COLOR,
                                                fontSize: '10px',
                                            }}
                                        >
                                            {(file.owners[0]?.displayName || 'U')[0]}
                                        </Avatar>
                                    )}
                                    <Text style={{ fontSize: '12px', color: '#5f6368' }}>
                                        {formatDate(file.modifiedTime)}
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: '12px', color: '#5f6368' }}>
                                        {formatFileSize(file.size)}
                                    </Text>
                                    <Space size={4}>
                                        {file.shared && (
                                            <Tooltip title="Shared">
                                                <TeamOutlined style={{ color: PRIMARY_COLOR, fontSize: '12px' }} />
                                            </Tooltip>
                                        )}
                                        {file.starred && (
                                            <Tooltip title="Starred">
                                                <StarOutlined style={{ color: '#fbbc04', fontSize: '12px' }} />
                                            </Tooltip>
                                        )}
                                    </Space>
                                </div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
            {files.length > pageSize && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '24px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                    }}
                >
                    <Pagination
                        current={currentPage}
                        total={files.length}
                        pageSize={pageSize}
                        onChange={onPageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} files`}
                        style={{ fontSize: '14px' }}
                    />
                </div>
            )}
        </div>
    );
};

// Main Google Drive Manager Component
const GoogleDriveManager: React.FC = () => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [folders, setFolders] = useState<DriveFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'modifiedTime' | 'size'>('modifiedTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentFolder, setCurrentFolder] = useState<string>('root');
    const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([
        { id: 'root', name: 'My Drive' }
    ]);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
    const [isUploading, setIsUploading] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareFileId, setShareFileId] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(16);
    const [showUploadArea, setShowUploadArea] = useState(true);
    const handleToggleUpload = () => setShowUploadArea(true);
    const handleAddFolder = () => setShowCreateFolder(true);
    const [form] = Form.useForm();
    const [shareForm] = Form.useForm();
    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await listDriveFiles({
                folderId: currentFolder,
                sortBy,
                sortOrder,
                pageSize: 100,
            });

            if (response?.data) {
                setFiles(response.data.payload.files || []);
                setFolders(response.data.payload.folders || []);
            }
        } catch (error: any) {
            console.error('Error fetching files:', error);
            message.error('Failed to fetch files. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [currentFolder, sortBy, sortOrder]);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(prev => ({
            ...prev,
            [file.name]: { progress: 0, status: 'uploading' }
        }));

        try {
            await uploadDriveFile({
                file,
                parentId: currentFolder === 'root' ? undefined : currentFolder
            });

            setUploadProgress(prev => ({
                ...prev,
                [file.name]: { progress: 100, status: 'completed' }
            }));

            message.success(`${file.name} uploaded successfully`);
            fetchFiles();
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadProgress(prev => ({
                ...prev,
                [file.name]: { progress: 0, status: 'error' }
            }));
            message.error(`Failed to upload ${file.name}`);
        } finally {
            setIsUploading(false);
            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[file.name];
                    return newProgress;
                });
            }, 3000);
        }
    };

    const handleFileAction = async (action: string, item: DriveFile | DriveFolder) => {
        switch (action) {
            case 'view':
                if ('webViewLink' in item && item.webViewLink) {
                    window.open(item.webViewLink, '_blank');
                }
                break;
            case 'download':
                if ('mimeType' in item) {
                    try {
                        const response = await downloadDriveFile({ fileId: item.id });
                        const blob = new Blob([response.data]);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = item.name;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        message.success(`${item.name} downloaded successfully`);
                    } catch (error: any) {
                        console.error('Download error:', error);
                        message.error(`Failed to download ${item.name}`);
                    }
                }
                break;
            case 'share':
                setShareFileId(item.id);
                setShowShareModal(true);
                break;
            case 'delete':
                try {
                    await deleteDriveFile({ fileId: item.id });
                    message.success(`${item.name} deleted successfully`);
                    fetchFiles();
                } catch (error: any) {
                    console.error('Delete error:', error);
                    message.error(`Failed to delete ${item.name}`);
                }
                break;
        }
    };

    const handleCreateFolder = async (values: any) => {
        try {
            await createDriveFolder({
                name: values.folderName,
                parentId: currentFolder === 'root' ? undefined : currentFolder
            });

            setShowCreateFolder(false);
            form.resetFields();
            message.success(`Folder "${values.folderName}" created successfully`);
            fetchFiles();
        } catch (error: any) {
            console.error('Create folder error:', error);
            message.error('Failed to create folder');
        }
    };

    const handleShareFile = async (values: any) => {
        try {
            await shareDriveFile({
                fileId: shareFileId,
                email: values.email,
                role: values.role || 'reader'
            });

            setShowShareModal(false);
            setShareFileId('');
            shareForm.resetFields();
            message.success('File shared successfully');
        } catch (error: any) {
            console.error('Share error:', error);
            message.error('Failed to share file');
        }
    };

    const navigateToFolder = (folderId: string, folderName: string) => {
        setCurrentFolder(folderId);
        setCurrentPage(1);
        if (folderId === 'root') {
            setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
        } else {
            setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName }]);
        }
    };

    const navigateToBreadcrumb = (index: number) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        setCurrentFolder(newBreadcrumbs[newBreadcrumbs.length - 1].id);
        setCurrentPage(1);
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleSortByChange = (value: string) => {
        if (value === "name" || value === "size" || value === "modifiedTime") {
            setSortBy(value as "name" | "size" | "modifiedTime");
        }
    };
    const items: MenuProps['items'] = [
        {
            key: 'upload',
            icon: <UploadOutlined />,
            label: 'Upload files',
        },
        {
            key: 'folder',
            icon: <FolderAddOutlined />,
            label: 'Create folder',
        },
    ];

    const onClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'upload') handleToggleUpload();
        if (key === 'folder') handleAddFolder();
    };
    const handleToggleUploads = () => setShowUploadArea(prev => !prev);

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f9fafa', marginTop: 70, marginLeft: 60 }}>
            <Content style={{ backgroundColor: '#f9fafa' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom: `1px solid ${PRIMARY_COLOR}`,
                    backgroundColor: '#f9fafa',
                    // boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#e8f0fe',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                        }}>
                            <CloudUploadOutlined style={{
                                fontSize: '20px',
                                color: PRIMARY_COLOR
                            }} />
                        </div>
                        <Title level={4} style={{ margin: 0, color: '#202124', fontSize: '22px' }}>
                            Files
                        </Title>
                    </div>
                    <Dropdown
                        menu={{ items, onClick }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Tooltip title="Quick actions">
                            <CloudUploadOutlined
                                style={{ fontSize: 20, color: '#1890ff', cursor: 'pointer' }}
                            />
                        </Tooltip>
                    </Dropdown>
                </div>

                {/* Search and Filters */}
                <HeaderBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortByChange={handleSortByChange}
                    sortOrder={sortOrder}
                    onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    viewMode={viewMode}
                    onViewModeChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    onRefresh={fetchFiles}
                    loading={loading}
                    breadcrumbs={breadcrumbs}
                    onNavigate={navigateToBreadcrumb}
                    extraIcon={ // <-- Pass icon as extra prop
                        <Button
                            type="text"
                            size="small"
                            icon={showUploadArea ? <UpOutlined /> : <DownOutlined />}
                            onClick={handleToggleUploads}
                            style={{
                                color: PRIMARY_COLOR,
                                fontSize: '13px',
                                height: '28px'
                            }}
                        >
                        </Button>
                    }
                />
                {/* Upload Area */}
                {showUploadArea && (
                    <div style={{ padding: '24px' }}>
                        <UploadArea
                            onUpload={handleFileUpload}
                            uploadProgress={uploadProgress}
                            isUploading={isUploading}
                        />
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px',
                        gap: '16px'
                    }}>
                        <Spin size="large" />
                        <Text style={{ fontSize: '16px', color: '#5f6368' }}>Loading your files...</Text>
                    </div>
                ) : (
                    <>
                        {/* Folders Section */}
                        <FoldersSection
                            folders={filteredFolders}
                            onFolderClick={navigateToFolder}
                            onFileAction={handleFileAction}
                            viewMode={viewMode}
                        />

                        {/* Files Section */}
                        <FilesSection
                            files={filteredFiles}
                            onFileAction={handleFileAction}
                            viewMode={viewMode}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={(page, size) => {
                                setCurrentPage(page);
                                if (size) setPageSize(size);
                            }}
                        />

                        {/* Empty State */}
                        {filteredFiles.length === 0 && filteredFolders.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '80px 20px',
                                color: '#5f6368'
                            }}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div>
                                            <Text style={{ fontSize: '18px', color: '#5f6368', display: 'block', marginBottom: '8px' }}>
                                                {searchQuery ? 'No files found' : 'Your Drive is empty'}
                                            </Text>
                                            <Text style={{ fontSize: '14px', color: '#9aa0a6' }}>
                                                {searchQuery ? 'Try different search terms' : 'Upload files to get started'}
                                            </Text>
                                        </div>
                                    }
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Create Folder Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '16px', fontWeight: 500 }}>New folder</span>
                        </div>
                    }
                    open={showCreateFolder}
                    onCancel={() => {
                        setShowCreateFolder(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={400}
                    style={{ borderRadius: '8px' }}
                >
                    <Form
                        form={form}
                        onFinish={handleCreateFolder}
                        layout="vertical"
                        style={{ marginTop: '20px' }}
                    >
                        <Form.Item
                            name="folderName"
                            label="Folder name"
                            rules={[{ required: true, message: 'Please enter a folder name' }]}
                        >
                            <Input
                                placeholder="Untitled folder"
                                style={{ borderRadius: '4px' }}
                                autoFocus
                            />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowCreateFolder(false);
                                        form.resetFields();
                                    }}
                                    style={{ borderRadius: '4px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '4px'
                                    }}
                                >
                                    Create
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Share File Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShareAltOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '16px', fontWeight: 500 }}>Share</span>
                        </div>
                    }
                    open={showShareModal}
                    onCancel={() => {
                        setShowShareModal(false);
                        setShareFileId('');
                        shareForm.resetFields();
                    }}
                    footer={null}
                    width={500}
                    style={{ borderRadius: '8px' }}
                >
                    <Form
                        form={shareForm}
                        onFinish={handleShareFile}
                        layout="vertical"
                        style={{ marginTop: '20px' }}
                    >
                        <Form.Item
                            name="email"
                            label="Add people"
                            rules={[
                                { required: true, message: 'Please enter an email address' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input
                                placeholder="Enter email address"
                                style={{ borderRadius: '4px' }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="role"
                            label="Permission"
                            initialValue="reader"
                        >
                            <Select style={{ borderRadius: '4px' }}>
                                <Select.Option value="reader">Viewer</Select.Option>
                                <Select.Option value="commenter">Commenter</Select.Option>
                                <Select.Option value="writer">Editor</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setShareFileId('');
                                        shareForm.resetFields();
                                    }}
                                    style={{ borderRadius: '4px' }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '4px'
                                    }}
                                >
                                    Send
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>

            <style jsx>{`
                .folder-menu-btn {
                    opacity: 0 !important;
                    transition: opacity 0.2s ease !important;
                }
                
                .folder-menu-btn:hover,
                *:hover > .folder-menu-btn {
                    opacity: 1 !important;
                }
                
                .file-menu-btn {
                    opacity: 0 !important;
                    transition: opacity 0.2s ease !important;
                }
                
                *:hover .file-menu-btn {
                    opacity: 1 !important;
                }
                
                .ant-upload-drag:hover {
                    border-color: #4285f4 !important;
                }
                
                .ant-table-tbody > tr:hover > td {
                    background: #f8f9fa !important;
                }
                
                .ant-pagination-item-active {
                    border-color: ${PRIMARY_COLOR} !important;
                }
                
                .ant-pagination-item-active a {
                    color: ${PRIMARY_COLOR} !important;
                }
                
                .ant-select-focused .ant-select-selector {
                    border-color: ${PRIMARY_COLOR} !important;
                    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
                }
                
                .ant-input:focus {
                    border-color: ${PRIMARY_COLOR} !important;
                    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
                }
            `}</style>
        </Layout>
    );
};

export default GoogleDriveManager;