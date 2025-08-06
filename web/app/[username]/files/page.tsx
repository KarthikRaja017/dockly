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
    Popconfirm,
    Checkbox,
    Drawer,
    List,
    Statistic,
    Timeline,
    Collapse,
    Alert,
    InputNumber,
    DatePicker,
    Descriptions,
    TreeSelect
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
    FolderAddOutlined,
    UserOutlined,
    EditOutlined,
    CopyOutlined,
    FolderOpenOutlined,
    StarFilled,
    CheckOutlined,
    BarChartOutlined,
    HistoryOutlined,
    BugOutlined,
    InfoCircleOutlined,
    HddOutlined,
    FileOutlined,
    CalendarOutlined,
    TagsOutlined,
    LinkOutlined
} from '@ant-design/icons';
import {
    createDriveFolder,
    deleteDriveFile,
    downloadDriveFile,
    listDriveFiles,
    shareDriveFile,
    uploadDriveFile,
    bulkDownloadFiles,
    bulkDeleteFiles,
    renameDriveFile,
    copyDriveFile,
    moveDriveFile,
    starDriveFile,
    getDriveStorage,
    findDuplicateFiles,
    getStorageAnalytics,
    getActivityLog,
    logActivity,
    getDriveFileInfo,
    bulkShareFiles,
    bulkMoveFiles,
    bulkCopyFiles,
    getAccountColor,
    getFileSource,
    type DriveFile,
    type DriveFolder,
    type StorageInfo,
    type ActivityLog,
    type DuplicateFile
} from '../../../services/files';
import DocklyLoader from '../../../utils/docklyLoader';
import { trimGooglePhotoUrl } from '../../../pages/components/header';

const PRIMARY_COLOR = '#1890ff';
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface UploadProgress {
    [fileName: string]: {
        progress: number;
        status: 'uploading' | 'completed' | 'error';
    };
}

interface AccountFilter {
    email: string;
    displayName: string;
    photoLink?: string;
    provider: string; // Add provider field to distinguish Google vs Outlook
}

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// Enhanced Upload Area Component
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
        <div style={{ marginBottom: '0px', fontFamily: FONT_FAMILY }}>
            <Dragger
                {...uploadProps}
                style={{
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dadce0',
                    borderRadius: '8px',
                    padding: '12px 4px',
                    transition: 'all 0.3s ease',
                    fontFamily: FONT_FAMILY
                }}
            >
                <div style={{ textAlign: 'center', fontFamily: FONT_FAMILY }}>
                    <CloudUploadOutlined style={{
                        fontSize: '32px',
                        color: '#5f6368',
                        marginBottom: '12px',
                        display: 'block'
                    }} />
                    <div style={{
                        fontSize: '14px',
                        color: '#202124',
                        marginBottom: '6px',
                        fontWeight: 500,
                        fontFamily: FONT_FAMILY
                    }}>
                        Drag files here or click to upload
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                        Support for single or bulk upload
                    </div>
                </div>
            </Dragger>

            {Object.keys(uploadProgress).length > 0 && (
                <Card
                    size="small"
                    style={{
                        marginTop: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        fontFamily: FONT_FAMILY
                    }}
                    title={
                        <Space>
                            <CloudUploadOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '13px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Upload Progress</span>
                        </Space>
                    }
                >
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} style={{ marginBottom: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '4px'
                            }}>
                                <Text style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>{filename}</Text>
                                <Space size="small">
                                    {progress.status === 'completed' && (
                                        <Badge status="success" />
                                    )}
                                    {progress.status === 'error' && (
                                        <Badge status="error" />
                                    )}
                                    <Text style={{ fontSize: '11px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
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

// Bulk Actions Toolbar
const BulkActionsToolbar: React.FC<{
    selectedItems: string[];
    onClearSelection: () => void;
    onBulkDownload: () => void;
    onBulkDelete: () => void;
    onBulkMove: () => void;
    onBulkCopy: () => void;
    onBulkShare: () => void;
}> = ({
    selectedItems,
    onClearSelection,
    onBulkDownload,
    onBulkDelete,
    onBulkMove,
    onBulkCopy,
    onBulkShare
}) => {
        if (selectedItems.length === 0) return null;

        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#fff',
                padding: '8px 16px',
                borderRadius: '24px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                border: '1px solid #e8eaed',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: FONT_FAMILY
            }}>
                <Text style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>
                    {selectedItems.length} selected
                </Text>
                <Divider type="vertical" />
                <Space size="small">
                    <Tooltip title="Download">
                        <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={onBulkDownload}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Move">
                        <Button
                            type="text"
                            icon={<FolderOpenOutlined />}
                            onClick={onBulkMove}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Copy">
                        <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={onBulkCopy}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Share">
                        <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            onClick={onBulkShare}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={onBulkDelete}
                            size="small"
                        />
                    </Tooltip>
                    <Divider type="vertical" />
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClearSelection}
                        size="small"
                    />
                </Space>
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
    selectedAccount: string | null;
    onAccountChange: (accountEmail: string | null) => void;
    availableAccounts: AccountFilter[];
    selectedItems: string[];
    onToggleSelectAll: () => void;
    isAllSelected: boolean;
    storageInfo: StorageInfo | null;
    onShowAnalytics: () => void;
    onShowActivity: () => void;
    onShowDuplicates: () => void;
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
    selectedAccount,
    onAccountChange,
    availableAccounts,
    selectedItems,
    onToggleSelectAll,
    isAllSelected,
    storageInfo,
    onShowAnalytics,
    onShowActivity,
    onShowDuplicates
}) => {
        const [showSearch, setShowSearch] = useState(false);

        // Helper function to get provider icon with account-specific colors
        const getProviderIcon = (provider: string, accountIndex: number) => {
            const color = getAccountColor(provider, accountIndex);

            if (provider === 'google') {
                return (
                    <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        backgroundColor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: 'white', fontSize: '7px', fontWeight: 'bold', fontFamily: FONT_FAMILY }}>G</span>
                    </div>
                );
            } else if (provider === 'outlook') {
                return (
                    <div style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        backgroundColor: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ color: 'white', fontSize: '7px', fontWeight: 'bold', fontFamily: FONT_FAMILY }}>O</span>
                    </div>
                );
            }
            return <UserOutlined style={{ fontSize: '10px' }} />;
        };

        const accountFilterOptions = [
            {
                value: null,
                label: (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0', fontFamily: FONT_FAMILY }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#e8f0fe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '6px'
                        }}>
                            <UserOutlined style={{ color: PRIMARY_COLOR, fontSize: '10px' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#202124', fontWeight: 500, fontFamily: FONT_FAMILY }}>All Accounts</span>
                    </div>
                )
            },
            ...availableAccounts.map((account, index) => ({
                value: account.email,
                label: (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0', fontFamily: FONT_FAMILY }}>
                        {account.photoLink ? (
                            <Avatar
                                size={20}
                                src={account.photoLink}
                                style={{
                                    marginRight: '6px',
                                    border: `2px solid ${getAccountColor(account.provider, index)}`
                                }}
                            />
                        ) : (
                            <Avatar
                                size={20}
                                style={{
                                    marginRight: '6px',
                                    backgroundColor: getAccountColor(account.provider, index),
                                    fontSize: '10px',
                                    fontFamily: FONT_FAMILY
                                }}
                            >
                                {(account.displayName || account.email)[0].toUpperCase()}
                            </Avatar>
                        )}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#202124', fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                    {account.displayName || 'Unknown'}
                                </span>
                                {getProviderIcon(account.provider, index)}
                            </div>
                            <div style={{ fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                {account.email}
                            </div>
                        </div>
                    </div>
                )
            }))
        ];

        const selectedAccountData = availableAccounts.find(acc => acc.email === selectedAccount);
        const selectedAccountIndex = availableAccounts.findIndex(acc => acc.email === selectedAccount);

        const breadcrumbItems = [
            {
                title: <HomeOutlined style={{ color: PRIMARY_COLOR }} />,
            },
            ...breadcrumbs.map((crumb, index) => ({
                title: (
                    <Button
                        type="link"
                        onClick={() => onNavigate(index)}
                        style={{
                            padding: 0,
                            height: 'auto',
                            color: index === breadcrumbs.length - 1 ? PRIMARY_COLOR : '#5f6368',
                            fontWeight: index === breadcrumbs.length - 1 ? 500 : 400,
                            fontSize: '13px',
                            fontFamily: FONT_FAMILY
                        }}
                    >
                        {crumb.name}
                    </Button>
                ),
                key: crumb.id,
            })),
        ];

        return (
            <div style={{ fontFamily: FONT_FAMILY }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 20px',
                        backgroundColor: '#f9fafa',
                        flexWrap: 'wrap',
                        gap: '12px',
                        fontFamily: FONT_FAMILY
                    }}
                >
                    {/* Breadcrumbs and Selection on Left */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Checkbox
                                checked={isAllSelected}
                                onChange={onToggleSelectAll}
                                disabled={loading}
                            />
                            <Breadcrumb items={breadcrumbItems} />
                        </div>
                        {selectedItems.length > 0 && (
                            <Badge
                                count={selectedItems.length}
                                style={{ backgroundColor: PRIMARY_COLOR }}
                                showZero={false}
                            />
                        )}
                    </div>

                    {/* Search + Filters on Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Search Section */}
                        {!showSearch ? (
                            <Button
                                icon={<SearchOutlined />}
                                size="small"
                                style={{
                                    borderColor: '#dadce0',
                                    color: '#5f6368',
                                    transition: 'all 0.3s ease',
                                }}
                                onClick={() => setShowSearch(true)}
                            />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Search
                                    placeholder="Search in Drive"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    style={{
                                        width: '280px',
                                        transition: 'all 0.3s ease',
                                        borderRadius: '16px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                    size="small"
                                    allowClear
                                    autoFocus
                                />
                                <Button
                                    icon={<CloseOutlined />}
                                    onClick={() => setShowSearch(false)}
                                    size="small"
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
                            {/* Account Filter */}
                            <Tooltip title="Filter by account">
                                <Select
                                    value={selectedAccount}
                                    onChange={onAccountChange}
                                    style={{
                                        minWidth: 200,
                                        borderRadius: '6px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                    size="small"
                                    placeholder="All Accounts"
                                    optionLabelProp="label"
                                    // dropdownStyle={{
                                    //     borderRadius: '8px',
                                    //     boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                                    //     border: '1px solid #e8eaed',
                                    //     padding: '2px 0'
                                    // }}
                                    suffixIcon={
                                        selectedAccount && selectedAccountData ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                {selectedAccountData.photoLink ? (
                                                    <Avatar
                                                        size={16}
                                                        src={selectedAccountData.photoLink}
                                                        style={{
                                                            border: `2px solid ${getAccountColor(selectedAccountData.provider, selectedAccountIndex)}`
                                                        }}
                                                    />
                                                ) : (
                                                    <Avatar
                                                        size={16}
                                                        style={{
                                                            backgroundColor: getAccountColor(selectedAccountData.provider, selectedAccountIndex),
                                                            fontSize: '9px',
                                                            fontFamily: FONT_FAMILY
                                                        }}
                                                    >
                                                        {(selectedAccountData.displayName || selectedAccountData.email || 'U')[0].toUpperCase()}
                                                    </Avatar>
                                                )}
                                                {getProviderIcon(selectedAccountData.provider, selectedAccountIndex)}
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                backgroundColor: '#e8f0fe',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <UserOutlined style={{ color: PRIMARY_COLOR, fontSize: '9px' }} />
                                            </div>
                                        )
                                    }
                                >
                                    {accountFilterOptions.map(option => (
                                        <Select.Option key={option.value || 'all'} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Tooltip>

                            <Select
                                value={sortBy}
                                onChange={onSortByChange}
                                style={{ width: 100, fontFamily: FONT_FAMILY }}
                                size="small"
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
                                    size="small"
                                    style={{
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        borderRadius: '4px',
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
                                    size="small"
                                    style={{
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        borderRadius: '4px',
                                    }}
                                />
                            </Tooltip>

                            <Tooltip title="Refresh">
                                <Button
                                    icon={<ReloadOutlined spin={loading} />}
                                    onClick={onRefresh}
                                    disabled={loading}
                                    size="small"
                                    style={{
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        borderRadius: '4px',
                                    }}
                                />
                            </Tooltip>
                            {extraIcon}
                        </Space>
                    </div>
                </div>
            </div>
        );
    };

// Enhanced Folders Section Component
const FoldersSection: React.FC<{
    folders: DriveFolder[];
    onFolderClick: (folderId: string, folderName: string) => void;
    onFileAction: (action: string, item: DriveFolder | DriveFile) => void;
    viewMode: 'grid' | 'list';
    selectedItems: string[];
    onItemSelect: (itemId: string, selected: boolean) => void;
    availableAccounts: AccountFilter[];
}> = ({ folders, onFolderClick, onFileAction, viewMode, selectedItems, onItemSelect, availableAccounts }) => {
    const [showAll, setShowAll] = useState(false);
    const displayFolders = showAll
        ? folders
        : folders.slice(0, viewMode === 'list' ? 4 : 8);

    const getMenuItems = (folder: DriveFolder) => [
        {
            key: 'rename',
            label: 'Rename',
            icon: <EditOutlined />,
            onClick: () => onFileAction('rename', folder)
        },
        {
            key: 'copy',
            label: 'Make a copy',
            icon: <CopyOutlined />,
            onClick: () => onFileAction('copy', folder)
        },
        {
            key: 'move',
            label: 'Move',
            icon: <FolderOpenOutlined />,
            onClick: () => onFileAction('move', folder)
        },
        {
            key: 'share',
            label: 'Share',
            icon: <ShareAltOutlined />,
            onClick: () => onFileAction('share', folder)
        },
        {
            key: 'info',
            label: 'Details',
            icon: <InfoCircleOutlined />,
            onClick: () => onFileAction('info', folder)
        },
        {
            key: 'delete',
            label: (
                <Popconfirm
                    title="Delete folder?"
                    description={`Are you sure you want to delete "${folder.name}"?`}
                    okText="Delete"
                    okType="danger"
                    onConfirm={() => onFileAction('delete', folder)}
                >
                    <span style={{ color: 'red', fontFamily: FONT_FAMILY }}>Delete</span>
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

    const getFolderAccentColor = (folder: DriveFolder) => {
        if (!folder.source_email) return PRIMARY_COLOR;

        const accountIndex = availableAccounts.findIndex(acc => acc.email === folder.source_email);
        const provider = getFileSource(folder);
        return getAccountColor(provider, accountIndex >= 0 ? accountIndex : 0);
    };

    if (folders.length === 0) return null;

    return (
        <div style={{ padding: '16px', fontFamily: FONT_FAMILY }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                    <Text style={{ fontSize: '14px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
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
                            fontSize: '12px',
                            height: '24px',
                            fontFamily: FONT_FAMILY
                        }}
                    >
                        {showAll ? 'Show less' : `Show all (${folders.length})`}
                    </Button>
                )}
            </div>

            {viewMode === 'grid' ? (
                <Row gutter={[8, 8]}>
                    {displayFolders.map((folder) => {
                        const accentColor = getFolderAccentColor(folder);
                        return (
                            <Col xs={12} sm={8} md={6} lg={4} xl={3} key={folder.id}>
                                <div
                                    style={{
                                        padding: '8px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: '#fff',
                                        border: `1px solid ${accentColor}20`,
                                        position: 'relative',
                                        fontFamily: FONT_FAMILY
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        e.currentTarget.style.borderColor = accentColor + '40';
                                        e.currentTarget.style.boxShadow = `0 2px 6px ${accentColor}20`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                        e.currentTarget.style.borderColor = accentColor + '20';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                                        <Checkbox
                                            checked={selectedItems.includes(folder.id)}
                                            onChange={(e) => onItemSelect(folder.id, e.target.checked)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ marginRight: '6px' }}
                                        />
                                        <FolderOutlined
                                            style={{
                                                fontSize: '18px',
                                                color: accentColor,
                                                marginRight: '6px'
                                            }}
                                            onClick={() => onFolderClick(folder.id, folder.name)}
                                        />
                                        <Text
                                            style={{
                                                fontSize: '12px',
                                                color: '#202124',
                                                flex: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                fontFamily: FONT_FAMILY
                                            }}
                                            onClick={() => onFolderClick(folder.id, folder.name)}
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
                                                    color: accentColor,
                                                    position: 'absolute',
                                                    top: '6px',
                                                    right: '6px'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Dropdown>
                                    </div>
                                    <Text style={{ fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                        Modified {formatDate(folder.modifiedTime)}
                                    </Text>
                                    {folder.shared && (
                                        <div style={{ marginTop: '3px' }}>
                                            <Tag color="blue" style={{ fontSize: '8px', fontFamily: FONT_FAMILY }}>
                                                <TeamOutlined style={{ marginRight: '2px' }} />
                                                Shared
                                            </Tag>
                                        </div>
                                    )}
                                    {folder.source_email && (
                                        <div style={{ marginTop: '3px' }}>
                                            <Tag
                                                color={getFileSource(folder) === 'google' ? 'green' : 'blue'}
                                                style={{
                                                    fontSize: '8px',
                                                    backgroundColor: accentColor + '15',
                                                    borderColor: accentColor + '40',
                                                    color: accentColor,
                                                    fontFamily: FONT_FAMILY
                                                }}
                                            >
                                                {getFileSource(folder) === 'google' ? 'Google' : 'Outlook'}
                                            </Tag>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <div>
                    {displayFolders.map((folder) => {
                        const accentColor = getFolderAccentColor(folder);
                        return (
                            <div
                                key={folder.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    marginBottom: '4px',
                                    borderLeft: `3px solid ${accentColor}`,
                                    fontFamily: FONT_FAMILY
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = accentColor + '10';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <Checkbox
                                    checked={selectedItems.includes(folder.id)}
                                    onChange={(e) => onItemSelect(folder.id, e.target.checked)}
                                    style={{ marginRight: '8px' }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <FolderOutlined
                                    style={{
                                        fontSize: '16px',
                                        color: accentColor,
                                        marginRight: '12px'
                                    }}
                                    onClick={() => onFolderClick(folder.id, folder.name)}
                                />
                                <div
                                    style={{ flex: 1, minWidth: 0, cursor: 'pointer', fontFamily: FONT_FAMILY }}
                                    onClick={() => onFolderClick(folder.id, folder.name)}
                                >
                                    <Text style={{ fontSize: '13px', color: '#202124', fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                        {folder.name}
                                    </Text>
                                    <div style={{ marginTop: '1px' }}>
                                        <Text style={{ fontSize: '11px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                            Modified {formatDate(folder.modifiedTime)}
                                        </Text>
                                        {folder.shared && (
                                            <Tag color="blue" style={{ marginLeft: '6px', fontSize: '10px', fontFamily: FONT_FAMILY }}>
                                                <TeamOutlined style={{ marginRight: '2px' }} />
                                                Shared
                                            </Tag>
                                        )}
                                        {folder.source_email && (
                                            <Tag
                                                style={{
                                                    marginLeft: '6px',
                                                    fontSize: '10px',
                                                    backgroundColor: accentColor + '15',
                                                    borderColor: accentColor + '40',
                                                    color: accentColor,
                                                    fontFamily: FONT_FAMILY
                                                }}
                                            >
                                                {getFileSource(folder) === 'google' ? 'Google' : 'Outlook'}
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
                        );
                    })}
                </div>
            )}
        </div>
    );
};

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

// Enhanced Files Section Component
const FilesSection: React.FC<{
    files: DriveFile[];
    onFileAction: (action: string, file: DriveFile) => void;
    viewMode: 'grid' | 'list';
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number, size?: number) => void;
    selectedItems: string[];
    onItemSelect: (itemId: string, selected: boolean) => void;
    availableAccounts: AccountFilter[];
}> = ({ files, onFileAction, viewMode, currentPage, pageSize, onPageChange, selectedItems, onItemSelect, availableAccounts }) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayFiles = files.slice(startIndex, endIndex);

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

    const getFileAccentColor = (file: DriveFile) => {
        if (!file.source_email) return PRIMARY_COLOR;

        const accountIndex = availableAccounts.findIndex(acc => acc.email === file.source_email);
        const provider = getFileSource(file);
        return getAccountColor(provider, accountIndex >= 0 ? accountIndex : 0);
    };

    const getMenuItems = (file: DriveFile) => [
        {
            key: 'view',
            label: 'Open',
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
            key: 'rename',
            label: 'Rename',
            icon: <EditOutlined />,
            onClick: () => onFileAction('rename', file),
        },
        {
            key: 'copy',
            label: 'Make a copy',
            icon: <CopyOutlined />,
            onClick: () => onFileAction('copy', file),
        },
        {
            key: 'move',
            label: 'Move',
            icon: <FolderOpenOutlined />,
            onClick: () => onFileAction('move', file),
        },
        ...(file.starred !== undefined ? [{
            key: 'star',
            label: file.starred ? 'Remove star' : 'Add star',
            icon: file.starred ? <StarFilled style={{ color: '#fbbc04' }} /> : <StarOutlined />,
            onClick: () => onFileAction('star', file),
        }] : []),
        {
            key: 'share',
            label: 'Share',
            icon: <ShareAltOutlined />,
            onClick: () => onFileAction('share', file),
        },
        {
            key: 'info',
            label: 'Details',
            icon: <InfoCircleOutlined />,
            onClick: () => onFileAction('info', file),
        },
        {
            key: 'delete',
            label: (
                <Popconfirm
                    title="Delete file?"
                    description={`Are you sure you want to delete "${file.name}"?`}
                    okText="Delete"
                    okType="danger"
                    onConfirm={() => onFileAction('delete', file)}
                >
                    <span style={{ color: 'red', fontFamily: FONT_FAMILY }}>Delete</span>
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
                title: '',
                key: 'select',
                width: 40,
                render: (_: any, record: DriveFile) => (
                    <Checkbox
                        checked={selectedItems.includes(record.id)}
                        onChange={(e) => onItemSelect(record.id, e.target.checked)}
                    />
                )
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                render: (text: string, record: DriveFile) => {
                    const accentColor = getFileAccentColor(record);
                    return (
                        <div
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontFamily: FONT_FAMILY }}
                            onClick={() => onFileAction('view', record)}
                        >
                            <div
                                style={{
                                    marginRight: '8px',
                                    color: getFileIconColor(record.mimeType),
                                    fontSize: '14px',
                                }}
                            >
                                {getFileIcon(record.mimeType)}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Text style={{ fontSize: '12px', color: '#202124', fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                        {text}
                                    </Text>
                                    {record.starred && (
                                        <StarFilled style={{ color: '#fbbc04', fontSize: '10px' }} />
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                                    {record.shared && (
                                        <Tag color="blue" style={{ fontSize: '9px', fontFamily: FONT_FAMILY }}>
                                            <TeamOutlined style={{ marginRight: '2px' }} />
                                            Shared
                                        </Tag>
                                    )}
                                    {record.source_email && (
                                        <Tag
                                            style={{
                                                fontSize: '9px',
                                                backgroundColor: accentColor + '15',
                                                borderColor: accentColor + '40',
                                                color: accentColor,
                                                fontFamily: FONT_FAMILY
                                            }}
                                        >
                                            {getFileSource(record) === 'google' ? 'Google' : 'Outlook'}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
            },
            {
                title: 'Owner',
                dataIndex: 'owners',
                key: 'owners',
                width: 140,
                render: (owners: DriveFile['owners']) => (
                    <div style={{ display: 'flex', alignItems: 'center', fontFamily: FONT_FAMILY }}>
                        {owners[0]?.photoLink ? (
                            <Avatar size="small" src={owners[0].photoLink} style={{ marginRight: '6px' }} />
                        ) : (
                            <Avatar size="small" style={{ marginRight: '6px', backgroundColor: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}>
                                {(owners[0]?.displayName || 'U')[0]}
                            </Avatar>
                        )}
                        <Text style={{ fontSize: '11px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                            {owners[0]?.displayName || 'Unknown'}
                        </Text>
                    </div>
                ),
            },
            {
                title: 'Last modified',
                dataIndex: 'modifiedTime',
                key: 'modifiedTime',
                width: 120,
                render: (text: string) => (
                    <Text style={{ fontSize: '11px', color: '#5f6368', fontFamily: FONT_FAMILY }}>{formatDate(text)}</Text>
                ),
            },
            {
                title: 'File size',
                dataIndex: 'size',
                key: 'size',
                width: 80,
                render: (size?: number) => (
                    <Text style={{ fontSize: '11px', color: '#5f6368', fontFamily: FONT_FAMILY }}>{formatFileSize(size)}</Text>
                ),
            },
            {
                title: '',
                key: 'actions',
                width: 50,
                render: (_: any, record: DriveFile) => (
                    <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} style={{ color: '#5f6368' }} />
                    </Dropdown>
                ),
            },
        ];

        return (
            <div style={{ padding: '0 16px 16px', fontFamily: FONT_FAMILY }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <FileTextOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                    <Text style={{ fontSize: '14px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>Files</Text>
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
                        borderRadius: '6px',
                        overflow: 'hidden',
                        fontFamily: FONT_FAMILY
                    }}
                    className="custom-table"
                />
                {files.length > pageSize && (
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '16px',
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '6px',
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
                            style={{ fontSize: '12px', fontFamily: FONT_FAMILY }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // ------------------ GRID VIEW -------------------
    return (
        <div style={{ padding: '16px', fontFamily: FONT_FAMILY }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <FileTextOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                <Text style={{ fontSize: '14px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>Files</Text>
                <Badge count={files.length} style={{ backgroundColor: '#e8f0fe', color: PRIMARY_COLOR }} />
            </div>
            <Row gutter={[8, 8]}>
                {displayFiles.map((file) => {
                    const accentColor = getFileAccentColor(file);
                    return (
                        <Col xs={12} sm={8} md={6} lg={4} xl={3} key={file.id}>
                            <div
                                style={{
                                    padding: '0',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: '#fff',
                                    border: `1px solid ${accentColor}20`,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    fontFamily: FONT_FAMILY
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 3px 10px ${accentColor}25`;
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.borderColor = accentColor + '40';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = accentColor + '20';
                                }}
                            >
                                <div
                                    style={{
                                        height: '100px',
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
                                        borderBottom: `2px solid ${accentColor}15`
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedItems.includes(file.id)}
                                        onChange={(e) => onItemSelect(file.id, e.target.checked)}
                                        style={{
                                            position: 'absolute',
                                            top: '6px',
                                            left: '6px',
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            borderRadius: '3px',
                                            padding: '1px'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {!file.thumbnailLink && (
                                        <div style={{ fontSize: '28px', color: getFileIconColor(file.mimeType) }}>
                                            {getFileIcon(file.mimeType)}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '6px',
                                            right: '6px',
                                        }}
                                    >
                                        <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<MoreOutlined />}
                                                style={{
                                                    border: 'none',
                                                    color: accentColor,
                                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Dropdown>
                                    </div>
                                </div>
                                <div style={{ padding: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '3px' }}>
                                        <Text
                                            style={{
                                                fontSize: '12px',
                                                color: '#202124',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: 500,
                                                flex: 1,
                                                fontFamily: FONT_FAMILY
                                            }}
                                            onClick={() => onFileAction('view', file)}
                                        >
                                            {file.name}
                                        </Text>
                                        {file.starred && (
                                            <StarFilled style={{ color: '#fbbc04', fontSize: '10px' }} />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
                                        {file.owners[0]?.photoLink ? (
                                            <Avatar size={14} src={file.owners[0].photoLink} style={{ marginRight: '4px' }} />
                                        ) : (
                                            <Avatar
                                                size={14}
                                                style={{
                                                    marginRight: '4px',
                                                    backgroundColor: accentColor,
                                                    fontSize: '8px',
                                                    fontFamily: FONT_FAMILY
                                                }}
                                            >
                                                {(file.owners[0]?.displayName || 'U')[0]}
                                            </Avatar>
                                        )}
                                        <Text style={{ fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                            {formatDate(file.modifiedTime)}
                                        </Text>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                            {formatFileSize(file.size)}
                                        </Text>
                                        <Space size={3}>
                                            {file.shared && (
                                                <Tooltip title="Shared">
                                                    <TeamOutlined style={{ color: accentColor, fontSize: '10px' }} />
                                                </Tooltip>
                                            )}
                                            {file.source_email && (
                                                <Tag
                                                    style={{
                                                        fontSize: '7px',
                                                        margin: 0,
                                                        backgroundColor: accentColor + '15',
                                                        borderColor: accentColor + '40',
                                                        color: accentColor,
                                                        fontFamily: FONT_FAMILY
                                                    }}
                                                >
                                                    {getFileSource(file) === 'google' ? 'G' : 'O'}
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>
            {files.length > pageSize && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
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
                        style={{ fontSize: '12px', fontFamily: FONT_FAMILY }}
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
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [availableAccounts, setAvailableAccounts] = useState<AccountFilter[]>([]);

    // New state for enhanced features
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const [showDuplicates, setShowDuplicates] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showBulkShareModal, setShowBulkShareModal] = useState(false);
    const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
    const [showBulkCopyModal, setShowBulkCopyModal] = useState(false);
    const [showFileInfoModal, setShowFileInfoModal] = useState(false);
    const [currentActionItem, setCurrentActionItem] = useState<DriveFile | DriveFolder | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [duplicateFiles, setDuplicateFiles] = useState<DuplicateFile[]>([]);
    const [storageAnalytics, setStorageAnalytics] = useState<any>(null);

    // Additional state for new modals
    const [fileInfo, setFileInfo] = useState<any>(null);
    const [folderTreeData, setFolderTreeData] = useState<any[]>([]);

    const handleToggleUpload = () => setShowUploadArea(true);
    const handleAddFolder = () => setShowCreateFolder(true);
    const [form] = Form.useForm();
    const [shareForm] = Form.useForm();
    const [renameForm] = Form.useForm();
    const [moveForm] = Form.useForm();
    const [copyForm] = Form.useForm();
    const [bulkShareForm] = Form.useForm();
    const [bulkMoveForm] = Form.useForm();
    const [bulkCopyForm] = Form.useForm();

    // Extract unique accounts from files and folders - Updated to include both Google and Outlook
    const extractAvailableAccounts = useCallback((files: DriveFile[], folders: DriveFolder[]) => {
        const accountsMap = new Map<string, AccountFilter>();

        // Extract from files
        files.forEach(file => {
            if (file.source_email) {
                const provider = file.source_email.includes('gmail') || file.source_email.includes('google') ? 'google' : 'outlook';
                accountsMap.set(file.source_email, {
                    email: file.source_email,
                    displayName: file.account_name || file.source_email.split('@')[0],
                    photoLink: file.owners?.[0]?.photoLink,
                    provider: provider
                });
            }
        });

        // Extract from folders
        folders.forEach(folder => {
            if (folder.source_email) {
                const provider = folder.source_email.includes('gmail') || folder.source_email.includes('google') ? 'google' : 'outlook';
                accountsMap.set(folder.source_email, {
                    email: folder.source_email,
                    displayName: folder.account_name || folder.source_email.split('@')[0],
                    photoLink: folder.owners?.[0]?.photoLink,
                    provider: provider
                });
            }
        });

        return Array.from(accountsMap.values()).sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
        );
    }, []);

    // Build folder tree for move/copy operations
    const buildFolderTree = useCallback((folders: DriveFolder[], currentItemId?: string) => {
        return [
            {
                title: 'My Drive',
                key: 'root',
                value: 'root',
                icon: <HomeOutlined />,
                children: folders
                    .filter(folder => folder.id !== currentItemId) // Exclude current item
                    .map(folder => ({
                        title: folder.name,
                        key: folder.id,
                        value: folder.id,
                        icon: <FolderOutlined />,
                    }))
            }
        ];
    }, []);

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
                const fetchedFiles = response.data.payload.files || [];
                const fetchedFolders = response.data.payload.folders || [];

                setFiles(fetchedFiles);
                setFolders(fetchedFolders);

                // Extract available accounts
                const accounts = extractAvailableAccounts(fetchedFiles, fetchedFolders);
                setAvailableAccounts(accounts);

                // Build folder tree for modals
                const tree = buildFolderTree(fetchedFolders);
                setFolderTreeData(tree);
            }
        } catch (error: any) {
            console.error('Error fetching files:', error);
            message.error('Failed to fetch files. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStorageInfo = async () => {
        try {
            const response = await getDriveStorage();
            if (response?.data) {
                setStorageInfo(response.data.payload);
            }
        } catch (error: any) {
            console.error('Error fetching storage info:', error);
        }
    };

    const fetchActivityLog = async () => {
        try {
            const response = await getActivityLog({ limit: 50 });
            if (response?.data) {
                setActivityLogs(response.data.payload || []);
            }
        } catch (error: any) {
            console.error('Error fetching activity log:', error);
        }
    };

    const fetchDuplicates = async () => {
        try {
            const response = await findDuplicateFiles({ folderId: currentFolder });
            if (response?.data) {
                setDuplicateFiles(response.data.payload || []);
            }
        } catch (error: any) {
            console.error('Error finding duplicates:', error);
            message.error('Failed to find duplicate files.');
        }
    };

    const fetchStorageAnalytics = async () => {
        try {
            const response = await getStorageAnalytics();
            if (response?.data) {
                setStorageAnalytics(response.data.payload);
            }
        } catch (error: any) {
            console.error('Error fetching storage analytics:', error);
        }
    };

    const fetchFileInfo = async (fileId: string) => {
        try {
            const response = await getDriveFileInfo({ fileId });
            if (response?.data) {
                setFileInfo(response.data.payload);
            }
        } catch (error: any) {
            console.error('Error fetching file info:', error);
            message.error('Failed to fetch file information.');
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [currentFolder, sortBy, sortOrder]);

    useEffect(() => {
        fetchStorageInfo();
    }, []);

    const logUserActivity = async (action: string, fileName: string, fileId?: string, details?: string) => {
        try {
            await logActivity({ action, fileName, fileId, details });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

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
            await logUserActivity('upload', file.name, undefined, `Uploaded to ${breadcrumbs[breadcrumbs.length - 1].name}`);
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
        const fileSource = getFileSource(item);

        switch (action) {
            case 'view':
                if ('webViewLink' in item && item.webViewLink) {
                    window.open(item.webViewLink, '_blank');
                    await logUserActivity('view', item.name, item.id);
                }
                break;
            case 'download':
                if ('mimeType' in item) {
                    try {
                        const response = await downloadDriveFile({
                            fileId: item.id,
                            provider: fileSource
                        });
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
                        await logUserActivity('download', item.name, item.id);
                    } catch (error: any) {
                        console.error('Download error:', error);
                        message.error(`Failed to download ${item.name}`);
                    }
                }
                break;
            case 'rename':
                setCurrentActionItem(item);
                setShowRenameModal(true);
                renameForm.setFieldsValue({ newName: item.name });
                break;
            case 'copy':
                setCurrentActionItem(item);
                setShowCopyModal(true);
                copyForm.setFieldsValue({ newName: `Copy of ${item.name}` });
                break;
            case 'move':
                setCurrentActionItem(item);
                setShowMoveModal(true);
                break;
            case 'star':
                if ('starred' in item) {
                    try {
                        await starDriveFile({ fileId: item.id, starred: !item.starred });
                        message.success(`${item.starred ? 'Removed star from' : 'Added star to'} ${item.name}`);
                        await logUserActivity(item.starred ? 'unstar' : 'star', item.name, item.id);
                        fetchFiles();
                    } catch (error: any) {
                        console.error('Star error:', error);
                        message.error(`Failed to ${item.starred ? 'unstar' : 'star'} ${item.name}`);
                    }
                }
                break;
            case 'share':
                setShareFileId(item.id);
                setShowShareModal(true);
                break;
            case 'info':
                setCurrentActionItem(item);
                await fetchFileInfo(item.id);
                setShowFileInfoModal(true);
                break;
            case 'delete':
                try {
                    await deleteDriveFile({
                        fileId: item.id,
                        provider: fileSource
                    });
                    message.success(`${item.name} deleted successfully`);
                    await logUserActivity('delete', item.name, item.id);
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
            await logUserActivity('create_folder', values.folderName, undefined, `Created in ${breadcrumbs[breadcrumbs.length - 1].name}`);
            fetchFiles();
        } catch (error: any) {
            console.error('Create folder error:', error);
            message.error('Failed to create folder');
        }
    };

    const handleShareFile = async (values: any) => {
        try {
            const sharedItem = [...files, ...folders].find(item => item.id === shareFileId);
            const fileSource = sharedItem ? getFileSource(sharedItem) : 'google';

            await shareDriveFile({
                fileId: shareFileId,
                email: values.email,
                role: values.role || 'reader',
                provider: fileSource
            });

            setShowShareModal(false);
            setShareFileId('');
            shareForm.resetFields();
            message.success('File shared successfully');

            if (sharedItem) {
                await logUserActivity('share', sharedItem.name, shareFileId, `Shared with ${values.email}`);
            }
        } catch (error: any) {
            console.error('Share error:', error);
            message.error('Failed to share file');
        }
    };

    const handleRename = async (values: any) => {
        if (!currentActionItem) return;

        try {
            const fileSource = getFileSource(currentActionItem);
            await renameDriveFile({
                fileId: currentActionItem.id,
                newName: values.newName,
                provider: fileSource
            });

            setShowRenameModal(false);
            setCurrentActionItem(null);
            renameForm.resetFields();
            message.success(`Renamed to "${values.newName}" successfully`);
            await logUserActivity('rename', values.newName, currentActionItem.id, `From "${currentActionItem.name}"`);
            fetchFiles();
        } catch (error: any) {
            console.error('Rename error:', error);
            message.error('Failed to rename');
        }
    };

    const handleCopy = async (values: any) => {
        if (!currentActionItem) return;

        try {
            const fileSource = getFileSource(currentActionItem);
            await copyDriveFile({
                fileId: currentActionItem.id,
                parentId: values.targetFolder === 'root' ? undefined : values.targetFolder,
                name: values.newName,
                provider: fileSource
            });

            setShowCopyModal(false);
            setCurrentActionItem(null);
            copyForm.resetFields();
            message.success(`${currentActionItem.name} copied successfully`);
            await logUserActivity('copy', currentActionItem.name, currentActionItem.id);
            fetchFiles();
        } catch (error: any) {
            console.error('Copy error:', error);
            message.error('Failed to copy');
        }
    };

    const handleMove = async (values: any) => {
        if (!currentActionItem) return;

        try {
            const fileSource = getFileSource(currentActionItem);
            await moveDriveFile({
                fileId: currentActionItem.id,
                targetFolderId: values.targetFolder === 'root' ? 'root' : values.targetFolder,
                provider: fileSource
            });

            setShowMoveModal(false);
            setCurrentActionItem(null);
            moveForm.resetFields();
            message.success(`${currentActionItem.name} moved successfully`);
            await logUserActivity('move', currentActionItem.name, currentActionItem.id);
            fetchFiles();
        } catch (error: any) {
            console.error('Move error:', error);
            message.error('Failed to move');
        }
    };

    // Bulk Operations
    const handleBulkDownload = async () => {
        try {
            const response = await bulkDownloadFiles({ fileIds: selectedItems });
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bulk-download.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success(`${selectedItems.length} files downloaded successfully`);
            await logUserActivity('bulk_download', `${selectedItems.length} files`, undefined);
            setSelectedItems([]);
        } catch (error: any) {
            console.error('Bulk download error:', error);
            message.error('Failed to download files');
        }
    };

    const handleBulkDelete = async () => {
        try {
            await bulkDeleteFiles({ fileIds: selectedItems });
            message.success(`${selectedItems.length} items deleted successfully`);
            await logUserActivity('bulk_delete', `${selectedItems.length} items`, undefined);
            setSelectedItems([]);
            fetchFiles();
        } catch (error: any) {
            console.error('Bulk delete error:', error);
            message.error('Failed to delete items');
        }
    };

    const handleBulkMove = () => {
        setShowBulkMoveModal(true);
    };

    const handleBulkCopy = () => {
        setShowBulkCopyModal(true);
    };

    const handleBulkShare = () => {
        setShowBulkShareModal(true);
    };

    // New bulk operation handlers
    const handleBulkMoveSubmit = async (values: any) => {
        try {
            await bulkMoveFiles({
                fileIds: selectedItems,
                targetFolderId: values.targetFolder === 'root' ? 'root' : values.targetFolder
            });

            setShowBulkMoveModal(false);
            bulkMoveForm.resetFields();
            message.success(`${selectedItems.length} items moved successfully`);
            await logUserActivity('bulk_move', `${selectedItems.length} items`, undefined);
            setSelectedItems([]);
            fetchFiles();
        } catch (error: any) {
            console.error('Bulk move error:', error);
            message.error('Failed to move items');
        }
    };

    const handleBulkCopySubmit = async (values: any) => {
        try {
            await bulkCopyFiles({
                fileIds: selectedItems,
                targetFolderId: values.targetFolder === 'root' ? 'root' : values.targetFolder
            });

            setShowBulkCopyModal(false);
            bulkCopyForm.resetFields();
            message.success(`${selectedItems.length} items copied successfully`);
            await logUserActivity('bulk_copy', `${selectedItems.length} items`, undefined);
            setSelectedItems([]);
            fetchFiles();
        } catch (error: any) {
            console.error('Bulk copy error:', error);
            message.error('Failed to copy items');
        }
    };

    const handleBulkShareSubmit = async (values: any) => {
        try {
            await bulkShareFiles({
                fileIds: selectedItems,
                email: values.email,
                role: values.role || 'reader'
            });

            setShowBulkShareModal(false);
            bulkShareForm.resetFields();
            message.success(`${selectedItems.length} items shared successfully`);
            await logUserActivity('bulk_share', `${selectedItems.length} items`, undefined, `Shared with ${values.email}`);
            setSelectedItems([]);
        } catch (error: any) {
            console.error('Bulk share error:', error);
            message.error('Failed to share items');
        }
    };

    const navigateToFolder = (folderId: string, folderName: string) => {
        setCurrentFolder(folderId);
        setCurrentPage(1);
        setSelectedItems([]);
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
        setSelectedItems([]);
    };

    const handleItemSelect = (itemId: string, selected: boolean) => {
        if (selected) {
            setSelectedItems(prev => [...prev, itemId]);
        } else {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
        }
    };

    const handleToggleSelectAll = () => {
        const allItems = [...files.map(f => f.id), ...folders.map(f => f.id)];
        if (selectedItems.length === allItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(allItems);
        }
    };

    const isAllSelected = selectedItems.length > 0 && selectedItems.length === (files.length + folders.length);

    // Filter files and folders by search query and selected account
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAccount = !selectedAccount || file.source_email === selectedAccount;
        return matchesSearch && matchesAccount;
    });

    const filteredFolders = folders.filter(folder => {
        const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAccount = !selectedAccount || folder.source_email === selectedAccount;
        return matchesSearch && matchesAccount;
    });

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
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f9fafa', marginTop: 50, marginLeft: 60, fontFamily: FONT_FAMILY }}>
            <Content style={{ backgroundColor: '#f9fafa', fontFamily: FONT_FAMILY }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: `1px solid ${PRIMARY_COLOR}`,
                    backgroundColor: '#f9fafa',
                    fontFamily: FONT_FAMILY
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: '#e8f0fe',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px'
                        }}>
                            <CloudUploadOutlined style={{
                                fontSize: '18px',
                                color: PRIMARY_COLOR
                            }} />
                        </div>
                        <Title level={4} style={{ margin: 0, color: '#202124', fontSize: '20px', fontFamily: FONT_FAMILY }}>
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
                                style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }}
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
                    selectedAccount={selectedAccount}
                    onAccountChange={setSelectedAccount}
                    availableAccounts={availableAccounts}
                    selectedItems={selectedItems}
                    onToggleSelectAll={handleToggleSelectAll}
                    isAllSelected={isAllSelected}
                    storageInfo={storageInfo}
                    onShowAnalytics={() => {
                        fetchStorageAnalytics();
                        setShowAnalytics(true);
                    }}
                    onShowActivity={() => {
                        fetchActivityLog();
                        setShowActivity(true);
                    }}
                    onShowDuplicates={() => {
                        fetchDuplicates();
                        setShowDuplicates(true);
                    }}
                    extraIcon={
                        <Button
                            type="text"
                            size="small"
                            icon={showUploadArea ? <UpOutlined /> : <DownOutlined />}
                            onClick={handleToggleUploads}
                            style={{
                                color: PRIMARY_COLOR,
                                fontSize: '12px',
                                height: '24px',
                                fontFamily: FONT_FAMILY
                            }}
                        />
                    }
                />

                {/* Upload Area */}
                {showUploadArea && (
                    <div style={{ padding: '16px' }}>
                        <UploadArea
                            onUpload={handleFileUpload}
                            uploadProgress={uploadProgress}
                            isUploading={isUploading}
                        />
                    </div>
                )}

                {/* Bulk Actions Toolbar */}
                <BulkActionsToolbar
                    selectedItems={selectedItems}
                    onClearSelection={() => setSelectedItems([])}
                    onBulkDownload={handleBulkDownload}
                    onBulkDelete={handleBulkDelete}
                    onBulkMove={handleBulkMove}
                    onBulkCopy={handleBulkCopy}
                    onBulkShare={handleBulkShare}
                />

                {/* Content */}
                {loading ? (
                    <DocklyLoader />
                ) : (
                    <>
                        {/* Folders Section */}
                        <FoldersSection
                            folders={filteredFolders}
                            onFolderClick={navigateToFolder}
                            onFileAction={handleFileAction}
                            viewMode={viewMode}
                            selectedItems={selectedItems}
                            onItemSelect={handleItemSelect}
                            availableAccounts={availableAccounts}
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
                            selectedItems={selectedItems}
                            onItemSelect={handleItemSelect}
                            availableAccounts={availableAccounts}
                        />

                        {/* Empty State */}
                        {filteredFiles.length === 0 && filteredFolders.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#5f6368',
                                fontFamily: FONT_FAMILY
                            }}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div>
                                            <Text style={{ fontSize: '16px', color: '#5f6368', display: 'block', marginBottom: '6px', fontFamily: FONT_FAMILY }}>
                                                {searchQuery || selectedAccount ? 'No files found' : 'Your Drive is empty'}
                                            </Text>
                                            <Text style={{ fontSize: '12px', color: '#9aa0a6', fontFamily: FONT_FAMILY }}>
                                                {searchQuery || selectedAccount ? 'Try different search terms or account filter' : 'Upload files to get started'}
                                            </Text>
                                        </div>
                                    }
                                />
                            </div>
                        )}
                    </>
                )}

                {/* All existing modals remain the same, just keeping the structure */}
                {/* Create Folder Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: FONT_FAMILY }}>New folder</span>
                        </div>
                    }
                    open={showCreateFolder}
                    onCancel={() => {
                        setShowCreateFolder(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={350}
                    style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={form}
                        onFinish={handleCreateFolder}
                        layout="vertical"
                        style={{ marginTop: '16px', fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="folderName"
                            label={<span style={{ fontFamily: FONT_FAMILY }}>Folder name</span>}
                            rules={[{ required: true, message: 'Please enter a folder name' }]}
                        >
                            <Input
                                placeholder="Untitled folder"
                                style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                autoFocus
                            />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '16px' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowCreateFolder(false);
                                        form.resetFields();
                                    }}
                                    style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '4px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Create
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Share Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <ShareAltOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Share</span>
                        </div>
                    }
                    open={showShareModal}
                    onCancel={() => {
                        setShowShareModal(false);
                        setShareFileId('');
                        shareForm.resetFields();
                    }}
                    footer={null}
                    width={450}
                    style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={shareForm}
                        onFinish={handleShareFile}
                        layout="vertical"
                        style={{ marginTop: '16px', fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="email"
                            label={<span style={{ fontFamily: FONT_FAMILY }}>Add people</span>}
                            rules={[
                                { required: true, message: 'Please enter an email address' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input
                                placeholder="Enter email address"
                                style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="role"
                            label={<span style={{ fontFamily: FONT_FAMILY }}>Permission</span>}
                            initialValue="reader"
                        >
                            <Select style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}>
                                <Select.Option value="reader">Viewer</Select.Option>
                                <Select.Option value="commenter">Commenter</Select.Option>
                                <Select.Option value="writer">Editor</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '16px' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setShareFileId('');
                                        shareForm.resetFields();
                                    }}
                                    style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '4px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Send
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Rename Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <EditOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Rename</span>
                        </div>
                    }
                    open={showRenameModal}
                    onCancel={() => {
                        setShowRenameModal(false);
                        setCurrentActionItem(null);
                        renameForm.resetFields();
                    }}
                    footer={null}
                    width={350}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={renameForm}
                        onFinish={handleRename}
                        layout="vertical"
                        style={{ marginTop: '16px', fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="newName"
                            label={<span style={{ fontFamily: FONT_FAMILY }}>New name</span>}
                            rules={[{ required: true, message: 'Please enter a new name' }]}
                        >
                            <Input autoFocus style={{ fontFamily: FONT_FAMILY }} />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '16px' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowRenameModal(false);
                                        setCurrentActionItem(null);
                                        renameForm.resetFields();
                                    }}
                                    style={{ fontFamily: FONT_FAMILY }}
                                >
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit" style={{ fontFamily: FONT_FAMILY }}>
                                    Rename
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Move Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FolderOpenOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Move to
                                </span>
                                {currentActionItem && (
                                    <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    open={showMoveModal}
                    onCancel={() => {
                        setShowMoveModal(false);
                        setCurrentActionItem(null);
                        moveForm.resetFields();
                    }}
                    footer={null}
                    width={450}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    styles={{
                        header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' },
                        body: { paddingTop: '16px' }
                    }}
                >
                    <Form
                        form={moveForm}
                        onFinish={handleMove}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Select destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                size="middle"
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Moving files
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                The file will be moved to the selected location. This action cannot be undone automatically.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowMoveModal(false);
                                        setCurrentActionItem(null);
                                        moveForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Move
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Copy Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CopyOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Make a copy
                                </span>
                                {currentActionItem && (
                                    <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    open={showCopyModal}
                    onCancel={() => {
                        setShowCopyModal(false);
                        setCurrentActionItem(null);
                        copyForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    styles={{
                        header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' },
                        body: { paddingTop: '16px' }
                    }}
                >
                    <Form
                        form={copyForm}
                        onFinish={handleCopy}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="newName"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <EditOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Name</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please enter a name for the copy' }]}
                        >
                            <Input
                                size="middle"
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                placeholder="Enter name for the copy"
                            />
                        </Form.Item>
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                size="middle"
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose destination folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Creating copy
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                A copy of the file will be created in the selected location with the specified name.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowCopyModal(false);
                                        setCurrentActionItem(null);
                                        copyForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Create copy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Bulk Share Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ShareAltOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Share files
                                </span>
                                <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                                </div>
                            </div>
                        </div>
                    }
                    open={showBulkShareModal}
                    onCancel={() => {
                        setShowBulkShareModal(false);
                        bulkShareForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    styles={{
                        header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' },
                        body: { paddingTop: '16px' }
                    }}
                >
                    <Form
                        form={bulkShareForm}
                        onFinish={handleBulkShareSubmit}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="email"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <UserOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Add people</span>
                                </div>
                            }
                            rules={[
                                { required: true, message: 'Please enter an email address' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input
                                size="middle"
                                placeholder="Enter email address"
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                prefix={<UserOutlined style={{ color: '#5f6368' }} />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="role"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <TeamOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Permission level</span>
                                </div>
                            }
                            initialValue="reader"
                        >
                            <Select size="middle" style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}>
                                <Select.Option value="reader">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                        <EyeOutlined style={{ color: '#5f6368' }} />
                                        <div style={{ fontFamily: FONT_FAMILY }}>Viewer</div>
                                        <div style={{ fontSize: '9px', color: '#5f6368', fontFamily: FONT_FAMILY }}>*Can view and comment</div>
                                    </div>
                                </Select.Option>
                                <Select.Option value="commenter">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                        <EditOutlined style={{ color: '#5f6368' }} />
                                        <div style={{ fontFamily: FONT_FAMILY }}>Commenter</div>
                                        <div style={{ fontSize: '9px', color: '#5f6368', fontFamily: FONT_FAMILY }}>*Can view and comment</div>
                                    </div>
                                </Select.Option>
                                <Select.Option value="writer">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                        <EditOutlined style={{ color: '#5f6368' }} />
                                        <div style={{ fontFamily: FONT_FAMILY }}>Editor</div>
                                        <div style={{ fontSize: '9px', color: '#5f6368', fontFamily: FONT_FAMILY }}>*Can view, comment and edit</div>
                                    </div>
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Bulk sharing
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                All selected files will be shared with the specified email address with the chosen permission level.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowBulkShareModal(false);
                                        bulkShareForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Share files
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Bulk Move Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FolderOpenOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Move files
                                </span>
                                <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                                </div>
                            </div>
                        </div>
                    }
                    open={showBulkMoveModal}
                    onCancel={() => {
                        setShowBulkMoveModal(false);
                        bulkMoveForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    styles={{
                        header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' },
                        body: { paddingTop: '16px' }
                    }}
                >
                    <Form
                        form={bulkMoveForm}
                        onFinish={handleBulkMoveSubmit}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Select destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                size="middle"
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose destination folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#e67e22', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#d68910', fontFamily: FONT_FAMILY }}>
                                    Bulk move operation
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#b7950b', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                All selected items will be moved to the chosen location. This action cannot be undone automatically.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowBulkMoveModal(false);
                                        bulkMoveForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Move files
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Bulk Copy Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CopyOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Copy files
                                </span>
                                <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                                </div>
                            </div>
                        </div>
                    }
                    open={showBulkCopyModal}
                    onCancel={() => {
                        setShowBulkCopyModal(false);
                        bulkCopyForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    styles={{
                        header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' },
                        body: { paddingTop: '16px' }
                    }}
                >
                    <Form
                        form={bulkCopyForm}
                        onFinish={handleBulkCopySubmit}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Select destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                size="middle"
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose destination folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Bulk copy operation
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                Copies of all selected items will be created in the chosen destination folder.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowBulkCopyModal(false);
                                        bulkCopyForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Copy files
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* File Info Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <InfoCircleOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    File Details
                                </span>
                                {currentActionItem && (
                                    <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    open={showFileInfoModal}
                    onCancel={() => {
                        setShowFileInfoModal(false);
                        setCurrentActionItem(null);
                        setFileInfo(null);
                    }}
                    footer={null}
                    width={550}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    styles={{
                        header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' },
                        body: { paddingTop: '16px' }
                    }}
                >
                    {fileInfo && currentActionItem && (
                        <div style={{ fontFamily: FONT_FAMILY }}>
                            {/* File Preview */}
                            {fileInfo.thumbnailLink && (
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '16px',
                                    padding: '16px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '6px'
                                }}>
                                    <img
                                        src={fileInfo.thumbnailLink}
                                        alt={currentActionItem.name}
                                        style={{
                                            maxWidth: '180px',
                                            maxHeight: '180px',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </div>
                            )}

                            {/* File Information */}
                            <Descriptions
                                column={1}
                                bordered
                                size="small"
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '6px',
                                    fontFamily: FONT_FAMILY
                                }}
                                labelStyle={{
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 500,
                                    color: '#202124',
                                    width: '130px',
                                    fontFamily: FONT_FAMILY
                                }}
                            >
                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                            <FileOutlined style={{ color: PRIMARY_COLOR }} />
                                            Name
                                        </div>
                                    }
                                >
                                    <Text copyable style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </Text>
                                </Descriptions.Item>

                                {'mimeType' in currentActionItem && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <TagsOutlined style={{ color: PRIMARY_COLOR }} />
                                                Type
                                            </div>
                                        }
                                    >
                                        <Tag color="blue" style={{ fontFamily: FONT_FAMILY }}>{currentActionItem.mimeType}</Tag>
                                    </Descriptions.Item>
                                )}

                                {'size' in currentActionItem && currentActionItem.size && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <HddOutlined style={{ color: PRIMARY_COLOR }} />
                                                Size
                                            </div>
                                        }
                                    >
                                        <Text style={{ fontFamily: FONT_FAMILY }}>{formatFileSize(currentActionItem.size)}</Text>
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                            <CalendarOutlined style={{ color: PRIMARY_COLOR }} />
                                            Modified
                                        </div>
                                    }
                                >
                                    <Text style={{ fontFamily: FONT_FAMILY }}>{new Date(currentActionItem.modifiedTime).toLocaleString()}</Text>
                                </Descriptions.Item>

                                {'createdTime' in currentActionItem && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <CalendarOutlined style={{ color: PRIMARY_COLOR }} />
                                                Created
                                            </div>
                                        }
                                    >
                                        <Text style={{ fontFamily: FONT_FAMILY }}>{new Date(currentActionItem.createdTime).toLocaleString()}</Text>
                                    </Descriptions.Item>
                                )}

                                {'owners' in currentActionItem && currentActionItem.owners && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <UserOutlined style={{ color: PRIMARY_COLOR }} />
                                                Owner
                                            </div>
                                        }
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {currentActionItem.owners[0]?.photoLink ? (
                                                <Avatar size={20} src={currentActionItem.owners[0].photoLink} />
                                            ) : (
                                                <Avatar size={20} style={{ backgroundColor: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}>
                                                    {(currentActionItem.owners[0]?.displayName || 'U')[0]}
                                                </Avatar>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                                    {currentActionItem.owners[0]?.displayName || 'Unknown'}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                                    {currentActionItem.owners[0]?.emailAddress}
                                                </div>
                                            </div>
                                        </div>
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                            <ShareAltOutlined style={{ color: PRIMARY_COLOR }} />
                                            Sharing
                                        </div>
                                    }
                                >
                                    <Space>
                                        <Tag color={currentActionItem.shared ? 'green' : 'default'} style={{ fontFamily: FONT_FAMILY }}>
                                            {currentActionItem.shared ? 'Shared' : 'Private'}
                                        </Tag>
                                        {'starred' in currentActionItem && currentActionItem.starred && (
                                            <Tag color="gold" icon={<StarOutlined />} style={{ fontFamily: FONT_FAMILY }}>
                                                Starred
                                            </Tag>
                                        )}
                                    </Space>
                                </Descriptions.Item>

                                {'webViewLink' in currentActionItem && currentActionItem.webViewLink && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <LinkOutlined style={{ color: PRIMARY_COLOR }} />
                                                Link
                                            </div>
                                        }
                                    >
                                        <Button
                                            type="link"
                                            icon={<LinkOutlined />}
                                            onClick={() => window.open(currentActionItem.webViewLink, '_blank')}
                                            style={{ padding: 0, fontFamily: FONT_FAMILY }}
                                        >
                                            Open in Cloud Drive
                                        </Button>
                                    </Descriptions.Item>
                                )}

                                {fileInfo.description && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <FileTextOutlined style={{ color: PRIMARY_COLOR }} />
                                                Description
                                            </div>
                                        }
                                    >
                                        <Text style={{ fontFamily: FONT_FAMILY }}>{fileInfo.description}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {/* Quick Actions */}
                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Space size="middle">
                                    {'webViewLink' in currentActionItem && (
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined />}
                                            onClick={() => window.open(currentActionItem.webViewLink, '_blank')}
                                            style={{
                                                backgroundColor: PRIMARY_COLOR,
                                                borderColor: PRIMARY_COLOR,
                                                borderRadius: '4px',
                                                fontFamily: FONT_FAMILY
                                            }}
                                        >
                                            Open
                                        </Button>
                                    )}
                                    <Button
                                        icon={<ShareAltOutlined />}
                                        onClick={() => {
                                            setShowFileInfoModal(false);
                                            setShareFileId(currentActionItem.id);
                                            setShowShareModal(true);
                                        }}
                                        style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                    >
                                        Share
                                    </Button>
                                    {'mimeType' in currentActionItem && (
                                        <Button
                                            icon={<DownloadOutlined />}
                                            onClick={() => handleFileAction('download', currentActionItem)}
                                            style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                        >
                                            Download
                                        </Button>
                                    )}
                                </Space>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Analytics Drawer */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <BarChartOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontFamily: FONT_FAMILY }}>Storage Analytics</span>
                        </div>
                    }
                    placement="right"
                    onClose={() => setShowAnalytics(false)}
                    open={showAnalytics}
                    width={350}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    {storageAnalytics && (
                        <div style={{ fontFamily: FONT_FAMILY }}>
                            <Card size="small" style={{ marginBottom: '12px', fontFamily: FONT_FAMILY }}>
                                <Statistic
                                    title="Total Files"
                                    value={storageAnalytics.totalFiles || 0}
                                    prefix={<FileOutlined />}
                                    style={{ fontFamily: FONT_FAMILY }}
                                />
                            </Card>
                            <Card size="small" style={{ marginBottom: '12px', fontFamily: FONT_FAMILY }}>
                                <Statistic
                                    title="Total Folders"
                                    value={storageAnalytics.totalFolders || 0}
                                    prefix={<FolderOutlined />}
                                    style={{ fontFamily: FONT_FAMILY }}
                                />
                            </Card>
                            {storageAnalytics.byType && (
                                <Card size="small" title="Files by Type" style={{ fontFamily: FONT_FAMILY }}>
                                    {Object.entries(storageAnalytics.byType).map(([type, count]: [string, any]) => (
                                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <Text style={{ fontFamily: FONT_FAMILY }}>{type}</Text>
                                            <Text strong style={{ fontFamily: FONT_FAMILY }}>{count}</Text>
                                        </div>
                                    ))}
                                </Card>
                            )}
                        </div>
                    )}
                </Drawer>

                {/* Activity Drawer */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <HistoryOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontFamily: FONT_FAMILY }}>Activity Log</span>
                        </div>
                    }
                    placement="right"
                    onClose={() => setShowActivity(false)}
                    open={showActivity}
                    width={450}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    <Timeline style={{ fontFamily: FONT_FAMILY }}>
                        {activityLogs.map((log) => (
                            <Timeline.Item
                                key={log.id}
                                dot={
                                    log.action === 'upload' ? <UploadOutlined style={{ color: '#52c41a' }} /> :
                                        log.action === 'download' ? <DownloadOutlined style={{ color: '#1890ff' }} /> :
                                            log.action === 'delete' ? <DeleteOutlined style={{ color: '#ff4d4f' }} /> :
                                                <ClockCircleOutlined style={{ color: '#faad14' }} />
                                }
                            >
                                <div style={{ fontFamily: FONT_FAMILY }}>
                                    <Text strong style={{ fontFamily: FONT_FAMILY }}>{log.action.replace('_', ' ').toUpperCase()}</Text>
                                    <br />
                                    <Text style={{ fontFamily: FONT_FAMILY }}>{log.fileName}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '10px', fontFamily: FONT_FAMILY }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </Text>
                                    {log.details && (
                                        <>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '10px', fontFamily: FONT_FAMILY }}>
                                                {log.details}
                                            </Text>
                                        </>
                                    )}
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </Drawer>

                {/* Duplicates Drawer */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <BugOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontFamily: FONT_FAMILY }}>Duplicate Files</span>
                        </div>
                    }
                    placement="right"
                    onClose={() => setShowDuplicates(false)}
                    open={showDuplicates}
                    width={550}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    {duplicateFiles.length === 0 ? (
                        <Empty description="No duplicate files found" style={{ fontFamily: FONT_FAMILY }} />
                    ) : (
                        <div style={{ fontFamily: FONT_FAMILY }}>
                            <Alert
                                message="Duplicate Files Found"
                                description={`Found ${duplicateFiles.length} sets of duplicate files. Review and clean up to free storage space.`}
                                type="info"
                                style={{ marginBottom: '12px', fontFamily: FONT_FAMILY }}
                            />
                            <Collapse style={{ fontFamily: FONT_FAMILY }}>
                                {duplicateFiles.map((duplicate, index) => (
                                    <Panel
                                        header={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FONT_FAMILY }}>
                                                <Text strong style={{ fontFamily: FONT_FAMILY }}>{duplicate.name}</Text>
                                                <div>
                                                    <Badge count={duplicate.files.length} style={{ backgroundColor: '#faad14' }} />
                                                    <Text style={{ marginLeft: '6px', fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                                        {(duplicate.totalSize / (1024 * 1024)).toFixed(2)} MB
                                                    </Text>
                                                </div>
                                            </div>
                                        }
                                        key={index}
                                    >
                                        <List
                                            dataSource={duplicate.files}
                                            renderItem={(file) => (
                                                <List.Item
                                                    actions={[
                                                        <Button
                                                            key="delete"
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleFileAction('delete', file)}
                                                            style={{ fontFamily: FONT_FAMILY }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <div style={{ fontSize: '14px', color: getFileIconColor(file.mimeType) }}>
                                                                {getFileIcon(file.mimeType)}
                                                            </div>
                                                        }
                                                        title={<span style={{ fontFamily: FONT_FAMILY }}>{file.name}</span>}
                                                        description={
                                                            <div style={{ fontFamily: FONT_FAMILY }}>
                                                                <Text type="secondary" style={{ fontFamily: FONT_FAMILY }}>
                                                                    Modified {new Date(file.modifiedTime).toLocaleDateString()}
                                                                </Text>
                                                                <br />
                                                                <Text type="secondary" style={{ fontFamily: FONT_FAMILY }}>
                                                                    {formatFileSize(file.size)}
                                                                </Text>
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Panel>
                                ))}
                            </Collapse>
                        </div>
                    )}
                </Drawer>
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

                .ant-select-dropdown {
                    border-radius: 8px !important;
                    padding: 2px 0 !important;
                }

                .ant-select-item {
                    border-radius: 6px !important;  
                    margin: 1px 6px !important;
                }

                .ant-select-item-option-selected {
                    background-color: #e8f0fe !important;
                    color: ${PRIMARY_COLOR} !important;
                }

                .ant-select-item:hover {
                    background-color: #f8f9fa !important;
                }

                * {
                    font-family: ${FONT_FAMILY} !important;
                }
            `}</style>
        </Layout>
    );
};

export default GoogleDriveManager;