'use client';

import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Checkbox,
    Modal,
    Progress,
    Input,
    DatePicker,
    Space,
    Avatar,
    Select,
    Empty,
    Typography,
    Tooltip,
    Badge,
    Radio,
    message,
    Collapse,
    List,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    ProjectOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    TagOutlined,
    EyeOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getProjects, getUsersFamilyMembers, shareProject, updateProject } from '../../services/family';

const { Text, Title } = Typography;

type Task = {
    id: number;
    title: string;
    assignee: string;
    type: string;
    completed: boolean;
    due: string;
    dueDate?: string;
};

type Project = {
    id: string,
    color?: string;
    title: string;
    description: string;
    due_date: string;
    progress: number;
    tasks: Task[];
    status?: string;
};

// Professional color palette
const COLORS = {
    primary: '#1C1C1E',
    secondary: '#48484A',
    accent: '#2563eb',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceSecondary: '#F9F9FB',
    border: '#E5E5EA',
    borderLight: '#F1F1F5',
    text: '#1C1C1E',
    textSecondary: '#6D6D80',
    textTertiary: '#8E8E93',
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowHeavy: 'rgba(0, 0, 0, 0.15)',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

const priorityColor: { [key: string]: string } = {
    high: COLORS.error,
    medium: COLORS.warning,
    low: COLORS.success,
    default: COLORS.textSecondary,
};

interface Props {
    title?: string;
    projects?: Project[];
    onAddProject?: (project: {
        title: string;
        description: string;
        due_date: string;
        visibility: 'public' | 'private';
    }) => void;
    onAddTask?: (projectId: string, taskData?: { title: string; due_date: string }) => void;
    onToggleTask?: (projectId: string, taskId: number) => void;
    onUpdateTask?: (task: Task) => void;
    showAssigneeInputInEdit?: boolean;
    showAvatarInTask?: boolean;
    familyMembers?: { name: string; email?: string; status?: string }[];
    showVisibilityToggle?: boolean;
    showAssigneeField?: boolean;
    source: "familyhub" | "planner";
}

const FamilyTasksComponent: React.FC<Props> = ({
    title = 'Projects & Tasks',
    projects = [],
    onAddProject,
    onAddTask,
    onToggleTask,
    onUpdateTask,
    familyMembers,
    source,
    showAssigneeInputInEdit = true,
    showAvatarInTask = true,
    showVisibilityToggle = false,
    showAssigneeField = false
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [assignees, setAssignees] = useState<{ label: string; value: string }[]>([]);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [project, setProject] = useState<any[]>([]);
    const [newProject, setNewProject] = useState<{
        title: string;
        description: string;
        due_date: string;
        visibility: 'public' | 'private';
    }>({
        title: '',
        description: '',
        due_date: '',
        visibility: 'private',
    });

    const [editingTask, setEditingTask] = useState<{
        projectId: string;
        task: Task | null;
    }>({ projectId: '', task: null });
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDueDate, setTaskDueDate] = useState<dayjs.Dayjs | null>(null);
    const [taskAssignee, setTaskAssignee] = useState<string>('All');

    const [viewMoreProject, setViewMoreProject] = useState<Project | null>(null);
    const [viewMoreModalVisible, setViewMoreModalVisible] = useState(false);
    const [showAllProjects, setShowAllProjects] = useState(false);

    const [loadingProject, setLoadingProject] = useState(false);
    const [loadingTask, setLoadingTask] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [tagModalOpen, setTagModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [tagLoading, setTagLoading] = useState(false);
    const [familyMember, setFamilyMember] = useState<any[]>([]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
    const filledProjects = projects.filter(p => p.title.trim());
    const [editProjectModal, setEditProjectModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

    const toggleProjectExpansion = (projectId: string) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
        }
        setExpandedProjects(newExpanded);
    };

    useEffect(() => {
        const accepted = familyMember
            .filter(m => m.email && m.status?.toLowerCase() !== "pending")
            .map(m => ({
                label: m.name,
                value: m.email,
            }));
        setAssignees(accepted);
    }, [familyMember]);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await getProjects({source}); 
            setProject(res.data?.payload?.projects || []);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await getUsersFamilyMembers({});
            if (res?.payload?.members) {
                const filtered = res.payload.members.filter((m: any) => m.relationship !== "me" && m.status?.toLowerCase() !== "pending");
                setFamilyMember(filtered);
            }
        } catch (err) {
            console.error("Failed to fetch family members", err);
        }
    };

    const handleShareProject = async (selectedIds: number[]) => {
        setSelectedMemberIds(selectedIds);

        if (!selectedProject) return;

        const emails = familyMember
            .filter((m: any) => selectedIds.includes(m.id) && m.status?.toLowerCase() !== "pending")
            .map((m: any) => m.email)
            .filter(Boolean);

        try {
            await shareProject({
                email: emails,
                tagged_members: emails,
                project: {
                    project_id: selectedProject.id,
                    title: selectedProject.title,
                    description: selectedProject.description,
                    deadline: selectedProject.due_date,
                    status: selectedProject.status,
                },
            });

            message.success("Project shared successfully!");
            setSelectedMemberIds([]);
        } catch (err) {
            console.error("Share project failed:", err);
            message.error("Failed to share project.");
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high":
                return <ExclamationCircleOutlined style={{ color: COLORS.error }} />;
            case "medium":
                return <ClockCircleOutlined style={{ color: COLORS.warning }} />;
            case "low":
                return <CheckCircleOutlined style={{ color: COLORS.success }} />;
            default:
                return <CheckCircleOutlined style={{ color: COLORS.textSecondary }} />;
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return COLORS.success;
        if (progress >= 50) return COLORS.warning;
        return COLORS.accent;
    };

    const getStatusBadge = (progress: number) => {
        if (progress === 100) return { text: 'Completed', color: COLORS.success };
        if (progress >= 80) return { text: 'Almost Done', color: COLORS.success };
        if (progress >= 50) return { text: 'In Progress', color: COLORS.warning };
        if (progress > 0) return { text: 'Started', color: COLORS.accent };
        return { text: 'Not Started', color: COLORS.textSecondary };
    };

    // Show up to 4 projects initially
    const displayedProjects = showAllProjects ? filledProjects : filledProjects.slice(0, 4);
    const hasMoreProjects = filledProjects.length > 4;

    const renderProjectHeader = (proj: Project) => {
        const completedTasks = proj.tasks.filter(t => t.completed).length;
        const totalTasks = proj.tasks.length;
        const isExpanded = expandedProjects.has(proj.id);
        
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    width: '100%',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    marginBottom: '8px',
                    cursor: 'pointer',
                }}
                onClick={() => toggleProjectExpansion(proj.id)}
            >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Project Icon */}
                    <div style={{
                        width: '23px',
                        height: '23px',
                        borderRadius: '4px',
                        backgroundColor: '#4CAF50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                    }}>
                        📋
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        {/* Project Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <Text strong style={{ 
                                color: COLORS.text, 
                                fontSize: '14px',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                {proj.title}
                            </Text>
                            {proj.progress === 100 && (
                                <span style={{ 
                                    fontSize: '12px',
                                    color: COLORS.success,
                                }}>
                                    ✅
                                </span>
                            )}
                        </div>
                        
                        {/* Description and Due Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text style={{ 
                                color: COLORS.textSecondary, 
                                fontSize: '12px',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                {proj.description}
                            </Text>
                            <Text style={{ 
                                color: COLORS.textSecondary, 
                                fontSize: '12px',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                • Due {dayjs(proj.due_date).format('MMM D')}
                            </Text>
                            {totalTasks > 0 && (
                                <Text style={{ 
                                    color: COLORS.textSecondary, 
                                    fontSize: '12px',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}>
                                    • {completedTasks}/{totalTasks} tasks
                                </Text>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tooltip title="Tag project">
                        <Button
                            shape="circle"
                            icon={<TagOutlined />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProject(proj);
                                setTagModalOpen(true);
                            }}
                            style={{
                                backgroundColor: 'transparent',
                                color: COLORS.accent,
                                border: 'none',
                                width: '24px',
                                height: '24px',
                                fontSize: '12px',
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit project">
                        <Button
                            shape="circle"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingProject(proj);
                                setEditProjectModal(true);
                            }}
                            style={{
                                backgroundColor: 'transparent',
                                color: COLORS.accent,
                                border: 'none',
                                width: '24px',
                                height: '24px',
                                fontSize: '12px',
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Add Task">
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingTask({ projectId: proj.id, task: null });
                                setEditTaskModal(true);
                            }}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                width: '24px',
                                height: '24px',
                                fontSize: '12px',
                            }}
                        />
                    </Tooltip>
                    {/* Expand/Collapse Icon */}
                    <div style={{ marginLeft: '8px' }}>
                        {isExpanded ? (
                            <UpOutlined style={{ color: COLORS.text, fontSize: '14px' }} />
                        ) : (
                            <DownOutlined style={{ color: COLORS.text, fontSize: '14px' }} />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderExpandedContent = (proj: Project) => {
        const status = getStatusBadge(proj.progress);
        const completedTasks = proj.tasks.filter(t => t.completed).length;
        const totalTasks = proj.tasks.length;

        return (
            <div style={{ 
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                marginBottom: '8px',
                marginTop: '-8px',
            }}>
                {/* Progress and Status - Only shown when expanded */}
                <div style={{ marginBottom: '1px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <Badge
                            color={status.color}
                            text={status.text}
                            style={{ fontSize: '7px' }}
                        />

                        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarOutlined style={{ color: COLORS.textSecondary, fontSize: '10px' }} />
                            <Text style={{ color: COLORS.textSecondary, fontSize: '10px' }}>
                                {dayjs(proj.due_date).format('MMM D')}
                            </Text>
                        </div>
                        <Text style={{ color: COLORS.textSecondary, fontSize: '10px' }}>
                            {completedTasks}/{totalTasks} tasks
                        </Text> */}

                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Progress
                            percent={proj.progress}
                            strokeColor={getProgressColor(proj.progress)}
                            trailColor={COLORS.borderLight}
                            showInfo={false}
                            strokeWidth={3}
                            style={{ flex: 1 }}
                        />
                        <Text style={{ fontSize: '10px', color: getProgressColor(proj.progress), fontWeight: 600 }}>
                            {proj.progress}%
                        </Text>
                    </div>
                </div>

                {/* Tasks */}
                {proj.tasks.length === 0 ? (
                <Text style={{ color: COLORS.textSecondary, fontSize: '11px', padding: '4px 6px' }}>
                    No tasks yet
                </Text>
                ) : (
                <div style={{ maxHeight: '100px', overflowY: 'auto', paddingRight: '4px' }}>
                    {proj.tasks.map((task) => (
                    <div
                        key={task.id}
                        style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 6px',
                        marginBottom: '2px',
                        background: task.completed ? `${COLORS.success}08` : COLORS.surface,
                        borderRadius: '6px',
                        border: `1px solid ${task.completed ? `${COLORS.success}20` : COLORS.borderLight}`,
                        borderLeft: `2px solid ${priorityColor[task.type] || COLORS.textSecondary}`,
                        }}
                    >
                        {/* Checkbox */}
                        <Checkbox
                        checked={task.completed}
                        onChange={() => onToggleTask?.(proj.id, task.id)}
                        style={{ marginRight: '6px', transform: 'scale(0.8)' }}
                        />

                        {/* Title + Due date in one row */}
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                        <Text
                            style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: task.completed ? COLORS.textSecondary : COLORS.text,
                            textDecoration: task.completed ? 'line-through' : 'none',
                            }}
                        >
                            {task.title}
                        </Text>

                        {task.due && (
                            <Text style={{ fontSize: '10px', color: COLORS.textSecondary }}>
                            <ClockCircleOutlined style={{ marginRight: '2px' }} />
                            {task.due}
                            </Text>
                        )}
                        </div>

                        {/* Assignee + Edit button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {showAvatarInTask && (
                            <Tooltip title={task.assignee}>
                            <Avatar
                                size={14}
                                style={{
                                backgroundColor: priorityColor[task.type] || COLORS.textSecondary,
                                color: COLORS.surface,
                                fontSize: '7px',
                                fontWeight: 600,
                                }}
                            >
                                {task.assignee ? task.assignee[0].toUpperCase() : '?'}
                            </Avatar>
                            </Tooltip>
                        )}

                        <Tooltip title="Edit task">
                            <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingTask({ projectId: proj.id, task });
                                setEditTaskModal(true);
                            }}
                            style={{
                                color: COLORS.textSecondary,
                                width: '16px',
                                height: '16px',
                                fontSize: '10px',
                            }}
                            />
                        </Tooltip>
                        </div>
                    </div>
                    ))}
                </div>
                )}

            </div>
        );
    };

    return (
        <Card
            style={{
                background: COLORS.surface,
                borderRadius: '16px',
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: `0 2px 8px ${COLORS.shadowLight}`,
                height: '360px',
                width: '100%',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            }}
            styles={{
                body: {
                    padding: '16px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                    <div style={{
                        width: '26px',
                        height: '26px',
                        background: `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.accent}10)`,
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${COLORS.accent}30`,
                    }}>
                        <ProjectOutlined style={{ fontSize: '19px', color: COLORS.accent }} />
                    </div>
                    <div>
                        <Title level={3} style={{
                            margin: 0,
                            color: COLORS.text,
                            fontSize: '16px',
                            fontWeight: 600,
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}>
                            {title}
                        </Title>
                        <Text style={{ 
                            color: COLORS.textSecondary, 
                            fontSize: '10px',
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}>
                            {filledProjects.length} active projects
                        </Text>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                    style={{
                        height: '24px',
                        width: '24px',
                        borderRadius: '6px',
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        fontSize: '11px',
                    }}
                />
            </div>

            {/* Projects List */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {filledProjects.length === 0 ? (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            textAlign: 'center',
                            padding: '20px',
                        }}
                    >
                        <div
                            onClick={() => setModalVisible(true)}
                            style={{
                                padding: '16px',
                                border: `2px dashed ${COLORS.borderLight}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                width: '100%',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = COLORS.accent + '60';
                                e.currentTarget.style.background = COLORS.accent + '05';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = COLORS.borderLight;
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <PlusOutlined style={{ fontSize: '20px', color: COLORS.textSecondary, marginBottom: '6px' }} />
                            <Text style={{ color: COLORS.textSecondary, fontSize: '12px', display: 'block' }}>
                                Add New Project
                            </Text>
                            <Text style={{ 
                                color: COLORS.textTertiary, 
                                fontSize: '10px',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                Project description...
                            </Text>
                        </div>
                    </div>
                ) : (
                    <div style={{ 
                        height: '100%', 
                        overflow: 'auto',
                        paddingRight: '4px',
                    }}>
                        {displayedProjects.map((proj) => {
                            const isExpanded = expandedProjects.has(proj.id);
                            return (
                                <div key={proj.id}>
                                    {renderProjectHeader(proj)}
                                    {isExpanded && renderExpandedContent(proj)}
                                </div>
                            );
                        })}
                        
                        {hasMoreProjects && !showAllProjects && (
                            <div style={{ 
                                textAlign: 'center', 
                                marginTop: '4px',
                                paddingTop: '4px',
                                borderTop: `1px solid ${COLORS.borderLight}`
                            }}>
                                <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={() => setShowAllProjects(true)}
                                    style={{
                                        color: COLORS.accent,
                                        fontSize: '11px',
                                        fontWeight: 500,
                                        padding: '0px 4px',
                                        height: '20px',
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                >
                                    View More ({filledProjects.length - 4})
                                </Button>
                            </div>
                        )}
                        
                        {showAllProjects && hasMoreProjects && (
                            <div style={{ 
                                textAlign: 'center', 
                                marginTop: '4px',
                                paddingTop: '4px',
                                borderTop: `1px solid ${COLORS.borderLight}`
                            }}>
                                <Button
                                    type="link"
                                    onClick={() => setShowAllProjects(false)}
                                    style={{
                                        color: COLORS.textSecondary,
                                        fontSize: '10px',
                                        height: '20px',
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                >
                                    Show Less
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Enhanced Add Project Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                        <ProjectOutlined style={{ color: COLORS.accent }} />
                        <span>Create New Project</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={async () => {
                    if (newProject.title && onAddProject) {
                        setLoadingProject(true);
                        await onAddProject(newProject);
                        setLoadingProject(false);
                        setModalVisible(false);
                        setNewProject({ title: '', description: '', due_date: '', visibility: 'private' });
                    }
                }}
                confirmLoading={loadingProject}
                okText="Create Project"
                cancelText="Cancel"
                okButtonProps={{
                    style: {
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: '8px',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }
                }}
                style={{ 
                    borderRadius: '12px',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
            >
                <div style={{ padding: `${SPACING.md}px 0` }}>
                    <Space direction="vertical" size={SPACING.md} style={{ width: '100%' }}>
                        <div>
                            <Text strong style={{ 
                                color: COLORS.text, 
                                marginBottom: SPACING.sm, 
                                display: 'block',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                Project Name
                            </Text>
                            <Input
                                placeholder="Enter project name"
                                value={newProject.title}
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                style={{ 
                                    borderRadius: '8px',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            />
                        </div>
                        <div>
                            <Text strong style={{ 
                                color: COLORS.text, 
                                marginBottom: SPACING.sm, 
                                display: 'block',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                Description
                            </Text>
                            <Input.TextArea
                                placeholder="Describe your project"
                                rows={4}
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                style={{ 
                                    borderRadius: '8px',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            />
                        </div>
                        <div>
                            <Text strong style={{ 
                                color: COLORS.text, 
                                marginBottom: SPACING.sm, 
                                display: 'block',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                Due Date
                            </Text>
                            <DatePicker
                                placeholder="Select due date"
                                style={{ 
                                    width: '100%', 
                                    borderRadius: '8px',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                                value={newProject.due_date ? dayjs(newProject.due_date) : null}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                onChange={(_, dateString) => {
                                    const dateStr = Array.isArray(dateString) ? dateString[0] ?? '' : dateString;
                                    setNewProject({ ...newProject, due_date: dateStr });
                                }}
                            />
                        </div>
                        {showVisibilityToggle && (
                            <div>
                                <Text strong style={{ 
                                    color: COLORS.text, 
                                    marginBottom: SPACING.sm, 
                                    display: 'block',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}>
                                    Visibility
                                </Text>
                                <Radio.Group
                                    onChange={(e) => setNewProject({ ...newProject, visibility: e.target.value })}
                                    value={newProject.visibility}
                                    style={{ display: 'flex', gap: SPACING.md }}
                                >
                                    <Radio.Button value="private" style={{ borderRadius: '8px' }}>
                                        Only Me
                                    </Radio.Button>
                                    <Radio.Button value="public" style={{ borderRadius: '8px' }}>
                                        Family
                                    </Radio.Button>
                                </Radio.Group>
                            </div>
                        )}
                    </Space>
                </div>
            </Modal>

            {/* Enhanced Edit Task Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                        <EditOutlined style={{ color: COLORS.accent }} />
                        <span>Edit Task</span>
                    </div>
                }
                open={editTaskModal && editingTask?.task !== null}
                onCancel={() => setEditTaskModal(false)}
                onOk={async () => {
                    if (editingTask.task && onUpdateTask) {
                        setLoadingEdit(true);
                        await onUpdateTask(editingTask.task);
                        setLoadingEdit(false);
                        setEditTaskModal(false);
                    }
                }}
                confirmLoading={loadingEdit}
                okText="Save Changes"
                cancelText="Cancel"
                okButtonProps={{
                    style: {
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: '8px',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }
                }}
                style={{ 
                    borderRadius: '12px',
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                }}
            >
                <div style={{ padding: `${SPACING.md}px 0` }}>
                    <Space direction="vertical" size={SPACING.md} style={{ width: '100%' }}>
                        <div>
                            <Text strong style={{ 
                                color: COLORS.text, 
                                marginBottom: SPACING.sm, 
                                display: 'block',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                Task Name
                            </Text>
                            <Input
                                placeholder="Enter task name"
                                value={editingTask.task?.title}
                                onChange={(e) =>
                                    setEditingTask((prev) => ({
                                        ...prev,
                                        task: prev.task && { ...prev.task, title: e.target.value },
                                    }))
                                }
                                style={{ 
                                    borderRadius: '8px',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            />
                        </div>
                        <div>
                            <Text strong style={{ 
                                color: COLORS.text, 
                                marginBottom: SPACING.sm, 
                                display: 'block',
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>
                                Due Date
                            </Text>
                            <DatePicker
                                placeholder="Select due date"
                                style={{ 
                                    width: '100%', 
                                    borderRadius: '8px',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                                value={editingTask.task?.dueDate ? dayjs(editingTask.task.dueDate) : null}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                onChange={(_, dateString) => {
                                    const dateStr = Array.isArray(dateString) ? dateString[0] ?? '' : dateString;
                                    setEditingTask((prev) => ({
                                        ...prev,
                                        task: prev.task && {
                                            ...prev.task,
                                            dueDate: dateStr,
                                            due: dateStr ? `Due ${dayjs(dateStr).format('MMM D')}` : '',
                                        },
                                    }));
                                }}
                            />
                        </div>
                        {showAssigneeInputInEdit && (
                            <div>
                                <Text strong style={{ 
                                    color: COLORS.text, 
                                    marginBottom: SPACING.sm, 
                                    display: 'block',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}>
                                    Assignee
                                </Text>
                                <Select
                                    placeholder="Select assignee"
                                    value={editingTask.task?.assignee}
                                    onChange={(val) =>
                                        setEditingTask((prev) => ({
                                            ...prev,
                                            task: prev.task && { ...prev.task, assignee: val, type: val },
                                        }))
                                    }
                                    options={assignees}
                                    style={{ 
                                        width: '100%', 
                                        borderRadius: '8px',
                                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                    }}
                                />
                            </div>
                        )}
                    </Space>
                </div>
            </Modal>

            {/* Add Task Modal */}
            <Modal
                title="Add New Task"
                open={editTaskModal && editingTask?.task === null}
                onCancel={() => {
                    setEditTaskModal(false);
                    setTaskTitle('');
                    setTaskDueDate(null);
                    setTaskAssignee('All');
                }}
                onOk={async () => {
                    if (!taskTitle || !taskDueDate || !editingTask?.projectId) return;

                    const payload = {
                        title: taskTitle,
                        due_date: dayjs(taskDueDate).format('YYYY-MM-DD'),
                        assignee: showAssigneeField ? taskAssignee : 'All',
                    };

                    setLoadingTask(true);
                    await onAddTask?.(editingTask.projectId, payload);
                    setLoadingTask(false);
                    setEditTaskModal(false);
                    setTaskTitle('');
                    setTaskDueDate(null);
                    setTaskAssignee('All');
                }}
            >
                <Input
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    style={{ 
                        marginBottom: 12,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                />

                <DatePicker
                    value={taskDueDate}
                    onChange={(date) => setTaskDueDate(date)}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    style={{ 
                        width: '100%', 
                        marginBottom: 12,
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }}
                />

                {showAssigneeField && (
                    <Select
                        placeholder="Select assignee"
                        value={taskAssignee}
                        onChange={(value) => setTaskAssignee(value)}
                        style={{ 
                            width: '100%',
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                        options={assignees}
                    />
                )}
            </Modal>

            <Modal
                title="Tag Project with Family"
                open={tagModalOpen}
                onCancel={() => {
                    setTagModalOpen(false);
                    setSelectedProject(null);
                    setSelectedEmails([]);
                    setSelectedMemberIds([]);
                }}
                onOk={async () => {
                    setTagLoading(true);
                    await handleShareProject(selectedMemberIds);
                    setTagLoading(false);
                    setTagModalOpen(false);
                    setSelectedEmails([]);
                    setSelectedMemberIds([]);
                }}
                confirmLoading={tagLoading}
                okText="Tag"
            >
                <p>Select family members to tag:</p>
                <div>
                    <Select
                        mode="multiple"
                        style={{ 
                            width: "100%",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                        }}
                        placeholder="Select members"
                        value={selectedMemberIds}
                        onChange={setSelectedMemberIds}
                    >
                        {familyMember
                            .filter((m: any) => m.relationship !== "me")
                            .map((member: any) => (
                                <Select.Option key={member.id} value={member.id}>
                                    {member.name}
                                </Select.Option>
                            ))}
                    </Select>
                </div>
            </Modal>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                        <EditOutlined style={{ color: COLORS.accent }} />
                        <span>Edit Project</span>
                    </div>
                }
                open={editProjectModal}
                onCancel={() => {
                    setEditProjectModal(false);
                    setEditingProject(null);
                }}
                onOk={async () => {
                    if (editingProject) {
                        await updateProject({
                            id: editingProject.id,
                            title: editingProject.title,
                            description: editingProject.description,
                            due_date: editingProject.due_date,
                        });
                        await fetchProjects();
                        message.success("Project updated!");
                        setEditProjectModal(false);
                    }
                }}
                okText="Save Changes"
                cancelText="Cancel"
                okButtonProps={{
                    style: {
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: '8px',
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    }
                }}
            >
                {editingProject && (
                    <Space direction="vertical" size={SPACING.md} style={{ width: '100%' }}>
                        <div>
                            <Text strong style={{
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>Project Name</Text>
                            <Input
                                value={editingProject.title}
                                onChange={(e) =>
                                    setEditingProject({ ...editingProject, title: e.target.value })
                                }
                                style={{
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            />
                        </div>
                        <div>
                            <Text strong style={{
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>Description</Text>
                            <Input.TextArea
                                rows={3}
                                value={editingProject.description}
                                onChange={(e) =>
                                    setEditingProject({ ...editingProject, description: e.target.value })
                                }
                                style={{
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                            />
                        </div>
                        <div>
                            <Text strong style={{
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                            }}>Due Date</Text>
                            <DatePicker
                                value={editingProject.due_date ? dayjs(editingProject.due_date) : null}
                                onChange={(_, dateString) =>
                                    setEditingProject({
                                        ...editingProject,
                                        due_date: Array.isArray(dateString) ? dateString[0] ?? '' : dateString
                                    })
                                }
                                style={{ 
                                    width: '100%',
                                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                                }}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </div>
                    </Space>
                )}
            </Modal>
        </Card>
    );
};

export default FamilyTasksComponent;