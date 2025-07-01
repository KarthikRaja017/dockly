'use client';
import React, { useEffect, useState } from 'react';
import {
  FileText,
  Star,
  Clock,
  Folder,
  Bell,
  Check,
  X,
  Eye,
  Filter,
  Search,
  MoreVertical,
  Archive,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Activity as ActivityIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getRecentActivities, respondToNotification } from '../../services/dashboard';
import DocklyLoader from '../../utils/docklyLoader';

const RecentActivity: React.FC = () => {
  const [filter, setFilter] = useState('Notifications');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('time');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  type Activity = {
    id: number;
    name: string;
    time: string;
    hub: string;
    type: string;
    isFavorite: boolean;
    bgColor: string;
    iconColor: string;
    priority?: 'high' | 'medium' | 'low';
    category?: string;
    size?: string;
    lastModified?: string;
  };

  type Notification = {
    id: number;
    message: string;
    time?: string;
    hub?: string;
    status?: string;
    actionRequired?: boolean;
    taskType?: string;
    isFavorite?: boolean;
    priority?: 'high' | 'medium' | 'low';
    category?: string;
    isRead?: boolean;
    [key: string]: any;
  };

  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const filters = ['All', 'Activities', 'Notifications', 'Favorites', 'Unread', 'Action Required'];

  useEffect(() => {
    fetchActivities();
    fetchNotifications();
  }, []);

  const fetchActivities = async () => {
    const mockData = [
      {
        id: 1,
        name: 'Tax Return 2024.pdf',
        time: '2 hours ago',
        hub: 'Finance Hub',
        type: 'pdf',
        isFavorite: false,
        bgColor: '#eff6ff',
        iconColor: '#3b82f6',
        priority: 'high' as const,
        category: 'Documents',
        size: '2.4 MB',
        lastModified: '2024-01-15'
      },
      {
        id: 2,
        name: 'Project Proposal.docx',
        time: '4 hours ago',
        hub: 'Work Hub',
        type: 'docx',
        isFavorite: true,
        bgColor: '#f0fdf4',
        iconColor: '#22c55e',
        priority: 'medium' as const,
        category: 'Work',
        size: '1.8 MB',
        lastModified: '2024-01-14'
      },
      {
        id: 3,
        name: 'Family Photos.zip',
        time: '1 day ago',
        hub: 'Personal Hub',
        type: 'zip',
        isFavorite: false,
        bgColor: '#fef3c7',
        iconColor: '#f59e0b',
        priority: 'low' as const,
        category: 'Media',
        size: '45.2 MB',
        lastModified: '2024-01-13'
      },
      {
        id: 4,
        name: 'Meeting Notes.txt',
        time: '2 days ago',
        hub: 'Work Hub',
        type: 'txt',
        isFavorite: false,
        bgColor: '#f3e8ff',
        iconColor: '#8b5cf6',
        priority: 'medium' as const,
        category: 'Notes',
        size: '12 KB',
        lastModified: '2024-01-12'
      },
      {
        id: 5,
        name: 'Budget Spreadsheet.xlsx',
        time: '3 days ago',
        hub: 'Finance Hub',
        type: 'xlsx',
        isFavorite: true,
        bgColor: '#ecfdf5',
        iconColor: '#10b981',
        priority: 'high' as const,
        category: 'Finance',
        size: '890 KB',
        lastModified: '2024-01-11'
      }
    ];
    setActivities(mockData);
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await getRecentActivities({});
      if (res?.data?.payload?.notifications) {
        const enriched = res.data.payload.notifications.map((n: Notification) => ({
          ...n,
          isFavorite: n.isFavorite ?? false,
          isRead: n.status !== 'pending',
          priority: n.priority || 'medium'
        }));
        setNotifications(enriched);
        if (res.data.payload.notifications.length === 0) {
          setFilter("All"); // Clear notifications if none found
        }
      } else {
        // Mock notifications for demo
        const mockNotifications = [
          {
            id: 101,
            message: 'John Doe wants to join your Family Hub',
            time: '5 minutes ago',
            hub: 'Family Hub',
            status: 'pending',
            actionRequired: true,
            taskType: 'family_request',
            isFavorite: false,
            priority: 'high' as const,
            category: 'Family',
            isRead: false
          },
          {
            id: 102,
            message: 'Your backup completed successfully',
            time: '1 hour ago',
            hub: 'System',
            status: 'completed',
            actionRequired: false,
            isFavorite: false,
            priority: 'low' as const,
            category: 'System',
            isRead: true
          },
          {
            id: 103,
            message: 'New document shared in Work Hub',
            time: '3 hours ago',
            hub: 'Work Hub',
            status: 'pending',
            actionRequired: false,
            isFavorite: true,
            priority: 'medium' as const,
            category: 'Work',
            isRead: false
          },
          {
            id: 104,
            message: 'Storage space is running low',
            time: '5 hours ago',
            hub: 'System',
            status: 'pending',
            actionRequired: true,
            taskType: 'storage_warning',
            isFavorite: false,
            priority: 'high' as const,
            category: 'System',
            isRead: false
          },
          {
            id: 105,
            message: 'Weekly report is ready for review',
            time: '1 day ago',
            hub: 'Work Hub',
            status: 'pending',
            actionRequired: false,
            isFavorite: false,
            priority: 'medium' as const,
            category: 'Work',
            isRead: false
          },
          {
            id: 106,
            message: 'Security scan completed',
            time: '2 days ago',
            hub: 'System',
            status: 'completed',
            actionRequired: false,
            isFavorite: false,
            priority: 'low' as const,
            category: 'Security',
            isRead: true
          },
          {
            id: 107,
            message: 'New team member added to project',
            time: '3 days ago',
            hub: 'Work Hub',
            status: 'pending',
            actionRequired: false,
            isFavorite: false,
            priority: 'medium' as const,
            category: 'Team',
            isRead: false
          }
        ];
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchActivities(), fetchNotifications()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  const toggleFavorite = (id: number, isNotif: boolean = false) => {
    if (isNotif) {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id ? { ...notification, isFavorite: !notification.isFavorite } : notification
        )
      );
    } else {
      setActivities(prev =>
        prev.map(activity =>
          activity.id === id ? { ...activity, isFavorite: !activity.isFavorite } : activity
        )
      );
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true, status: 'read' } : notification
      )
    );
  };

  const handleResponse = async (id: number, response: 'accept' | 'decline') => {
    setIsLoading(true);
    try {
      await respondToNotification({ id: id, response: response });
      markAsRead(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Error responding to notification:', error);
    }
    setIsLoading(false);
  };

  const toggleSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getFilteredContent = () => {
    let content: any[] = [];

    switch (filter) {
      case 'Activities':
        content = activities;
        break;
      case 'Notifications':
        content = notifications;
        break;
      case 'Favorites':
        content = [...activities.filter(a => a.isFavorite), ...notifications.filter(n => n.isFavorite)];
        break;
      case 'Unread':
        content = notifications.filter(n => !n.isRead);
        break;
      case 'Action Required':
        content = notifications.filter(n => n.actionRequired);
        break;
      default:
        content = [...activities, ...notifications];
    }

    if (searchTerm) {
      content = content.filter(item =>
        (item.name || item.message).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hub?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return content.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      }
      return 0; // Default time sorting
    });
  };

  const unseenCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;
  const favoriteCount = [...activities, ...notifications].filter(item => item.isFavorite).length;

  const getTabBadge = (filterName: string) => {
    switch (filterName) {
      case 'Notifications':
        return unseenCount > 0 ? unseenCount : null;
      case 'Action Required':
        return actionRequiredCount > 0 ? actionRequiredCount : null;
      case 'Favorites':
        return favoriteCount > 0 ? favoriteCount : null;
      case 'Unread':
        return unseenCount > 0 ? unseenCount : null;
      default:
        return null;
    }
  };

  // Pagination logic
  const contentList = getFilteredContent();
  const totalPages = Math.ceil(contentList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = contentList.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const renderCompactCard = (item: any, isNotification: boolean = false) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <div
        key={item.id}
        onClick={() => isNotification && !item.isRead && markAsRead(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: '8px',
          backgroundColor: isSelected ? '#f0f9ff' : 'white',
          boxShadow: isSelected ? '0 2px 8px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
          border: `1px solid ${isSelected ? '#3b82f6' : '#f1f5f9'}`,
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
          }
        }}
      >
        {/* Priority Indicator */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          backgroundColor: getPriorityColor(item.priority),
          opacity: 0.8
        }} />

        {/* Icon */}
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: isNotification ? '#e0f2fe' : item.bgColor,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          position: 'relative',
          flexShrink: 0
        }}>
          {isNotification ? (
            <Bell size={16} style={{ color: '#0284c7' }} />
          ) : (
            <FileText size={16} style={{ color: item.iconColor }} />
          )}

          {/* Unread Indicator */}
          {isNotification && !item.isRead && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '1px solid white'
            }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <p style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0,
              opacity: isNotification && !item.isRead ? 1 : 0.9,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1
            }}>
              {item.message || item.name}
            </p>

            {/* Category Tag */}
            {item.category && (
              <span style={{
                fontSize: '9px',
                padding: '1px 4px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                borderRadius: '3px',
                fontWeight: '500',
                flexShrink: 0
              }}>
                {item.category}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={10} />
              <span>{item.time || 'Just now'}</span>
            </div>

            {item.hub && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Folder size={10} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                  {item.hub}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isNotification && item.actionRequired && item.taskType === 'family_request' ? (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResponse(item.id, 'accept');
                }}
                style={{
                  backgroundColor: '#22c55e',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              >
                <Check size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResponse(item.id, 'decline');
                }}
                style={{
                  backgroundColor: '#ef4444',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id, isNotification);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                color: item.isFavorite ? '#f59e0b' : '#9ca3af'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Star
                size={12}
                fill={item.isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderDetailedCard = (item: any, isNotification: boolean = false) => {
    const isSelected = selectedItems.includes(item.id);

    return (
      <div
        key={item.id}
        onClick={() => isNotification && !item.isRead && markAsRead(item.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: '12px',
          backgroundColor: isSelected ? '#f0f9ff' : 'white',
          boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
          border: `2px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
          transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          }
        }}
      >
        {/* Priority Indicator */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: getPriorityColor(item.priority),
          opacity: 0.8
        }} />

        {/* Selection Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleSelection(item.id);
          }}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {isSelected && <Check size={12} color="white" />}
        </div>

        {/* Icon */}
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: isNotification ? '#e0f2fe' : item.bgColor,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
          position: 'relative'
        }}>
          {isNotification ? (
            <Bell size={20} style={{ color: '#0284c7' }} />
          ) : (
            <FileText size={20} style={{ color: item.iconColor }} />
          )}

          {/* Unread Indicator */}
          {isNotification && !item.isRead && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid white'
            }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0,
              opacity: isNotification && !item.isRead ? 1 : 0.9
            }}>
              {item.message || item.name}
            </p>

            {/* Category Tag */}
            {item.category && (
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                borderRadius: '4px',
                fontWeight: '500'
              }}>
                {item.category}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span>{item.time || 'Just now'}</span>
            </div>

            {item.hub && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Folder size={12} />
                <span>{item.hub}</span>
              </div>
            )}

            {item.size && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} />
                <span>{item.size}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isNotification && item.actionRequired && item.taskType === 'family_request' && !item.isRead ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResponse(item.id, 'accept');
                }}
                style={{
                  backgroundColor: '#22c55e',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
              >
                <Check size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResponse(item.id, 'decline');
                }}
                style={{
                  backgroundColor: '#ef4444',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              {/* Mark as Read Button for Notifications */}
              {isNotification && !item.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(item.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    color: '#64748b',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Mark as read"
                >
                  <Eye size={16} />
                </button>
              )}

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.id, isNotification);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  color: item.isFavorite ? '#f59e0b' : '#9ca3af'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Star
                  size={16}
                  fill={item.isFavorite ? 'currentColor' : 'none'}
                />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <DocklyLoader />;
  }

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -60%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          
          .card-hover:hover {
            transform: translateY(-2px);
          }
          
          .filter-tab {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .filter-tab:hover {
            transform: translateY(-1px);
          }
          
          .pagination-button {
            transition: all 0.2s ease;
          }
          
          .pagination-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.12);
          }
          
          .expand-button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .expand-button:hover {
            transform: scale(1.05);
          }
        `}
      </style>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        height: isExpanded ? 'auto' : '685px',
        transition: 'height 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#6366f1',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={18} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  Recent Activity
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  {contentList.length} items • Page {currentPage} of {totalPages}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
                <button
                  onClick={() => setViewMode('compact')}
                  style={{
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'compact' ? 'white' : 'transparent',
                    color: viewMode === 'compact' ? '#374151' : '#64748b',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <List size={14} />
                  Compact
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  style={{
                    padding: '6px 8px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'detailed' ? 'white' : 'transparent',
                    color: viewMode === 'detailed' ? '#374151' : '#64748b',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Grid3X3 size={14} />
                  Detailed
                </button>
              </div> */}

              {/* Expand/Collapse Button */}
              {/* <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="expand-button"
                style={{
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button> */}

              {/* <button
                onClick={() => setShowQuickView(true)}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <Eye size={14} />
                Quick View
              </button> */}

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  padding: '8px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  backgroundColor: '#f1f5f9',
                  color: '#6366f1',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !refreshing && (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                onMouseLeave={(e) => !refreshing && (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    transformOrigin: 'center'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {/* <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }}
            />
            <input
              type="text"
              placeholder="Search activities and notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: 'white',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div> */}

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {filters.map((f) => {
              const badge = getTabBadge(f);
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="filter-tab"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: filter === f ? '#3b82f6' : 'white',
                    color: filter === f ? 'white' : '#64748b',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: filter === f ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {f}
                  {badge && (
                    <span style={{
                      backgroundColor: filter === f ? 'rgba(255,255,255,0.2)' : '#ef4444',
                      color: 'white',
                      fontSize: '9px',
                      padding: '1px 4px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      minWidth: '14px',
                      height: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && viewMode === 'detailed' && (
            <div style={{
              marginTop: '12px',
              padding: '10px 12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '500' }}>
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    selectedItems.forEach(id => {
                      const isNotif = notifications.some(n => n.id === id);
                      toggleFavorite(id, isNotif);
                    });
                    setSelectedItems([]);
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <Star size={10} />
                  Favorite
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          padding: '20px 24px',
          height: isExpanded ? 'auto' : '600px',
          overflowY: isExpanded ? 'visible' : 'auto'
        }}>
          {currentItems.length > 0 ? (
            <div>
              {/* Items List */}
              <div style={{ marginBottom: '16px' }}>
                {currentItems.map((item, idx) =>
                  viewMode === 'compact'
                    ? renderCompactCard(item, notifications.some(n => n.id === item.id))
                    : renderDetailedCard(item, notifications.some(n => n.id === item.id))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Showing {startIndex + 1}-{Math.min(endIndex, contentList.length)} of {contentList.length}
                    </span>

                    {/* Items per page selector */}
                    {/* <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                    >
                      <option value={4}>4 per page</option>
                      <option value={6}>6 per page</option>
                      <option value={8}>8 per page</option>
                      <option value={12}>12 per page</option>
                    </select> */}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-button"
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        backgroundColor: 'white',
                        color: currentPage === 1 ? '#9ca3af' : '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ChevronLeft size={14} />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            style={{
                              width: '28px',
                              height: '28px',
                              fontSize: '12px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: currentPage === pageNum ? '#3b82f6' : '#f8fafc',
                              color: currentPage === pageNum ? 'white' : '#374151',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pagination-button"
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        backgroundColor: 'white',
                        color: currentPage === totalPages ? '#9ca3af' : '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#f1f5f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Folder size={32} style={{ opacity: 0.5 }} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                No {filter.toLowerCase()} found
              </h4>
              <p style={{ fontSize: '14px', margin: 0, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                {searchTerm
                  ? `No items match your search "${searchTerm}"`
                  : `You don't have any ${filter.toLowerCase()} at the moment.`
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer'
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentActivity;