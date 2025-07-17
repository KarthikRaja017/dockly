'use client';

import React, { useState } from 'react';
import {
    Button,
    Card,
    Checkbox,
    Modal,
    Progress,
    Tag,
    Input,
    DatePicker,
    Space,
    Avatar,
    Select,
    Empty,
    Typography,
    Tooltip,
    Badge,
    Divider,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    CheckSquareOutlined,
    ProjectOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    MoreOutlined,
    StarOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

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
    color?: string;
    project_id: string;
    title: string;
    description: string;
    due_date: string;
    progress: number;
    tasks: Task[];
};

// Professional color palette
const COLORS = {
    primary: '#1C1C1E',
    secondary: '#48484A',
    accent: '#007AFF',
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

const assignees = [
    { label: 'John', value: 'john' },
    { label: 'Sarah', value: 'sarah' },
    { label: 'Emma', value: 'emma' },
    { label: 'Liam', value: 'liam' },
    { label: 'All', value: 'all' },
];

interface Props {
    title?: string;
    projects?: Project[];
    onAddProject?: (project: {
        title: string;
        description: string;
        due_date: string;
    }) => void;
    onAddTask?: (projectId: string) => void;
    onToggleTask?: (projectId: string, taskId: number) => void;
    onUpdateTask?: (task: Task) => void;
    showAssigneeInputInEdit?: boolean;
    showAvatarInTask?: boolean;
}

const FamilyTasksComponent: React.FC<Props> = ({
    title = 'Projects & Tasks',
    projects = [],
    onAddProject,
    onAddTask,
    onToggleTask,
    onUpdateTask,
    showAssigneeInputInEdit = true,
    showAvatarInTask = true,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        due_date: '',
    });
    const [editingTask, setEditingTask] = useState<{
        projectId: string;
        task: Task | null;
    }>({ projectId: '', task: null });

    const filledProjects = projects.filter(p => p.title.trim());
    const showTemplateProjects = filledProjects.length < 2;

    const templateProjects = Array.from({ length: 2 - filledProjects.length }, (_, i) => ({
        project_id: `template-${i + 1}`,
        title: '',
        description: '',
        due_date: '',
        progress: 0,
        tasks: [],
    }));

    const getTemplateTasks = (projectId: string): Task[] => {
        return [
            {
                id: 1,
                title: '',
                assignee: 'all',
                type: 'default',
                completed: false,
                due: '',
            },
            {
                id: 2,
                title: '',
                assignee: 'all',
                type: 'default',
                completed: false,
                due: '',
            },
        ];
    };

    const displayedProjects = [...filledProjects, ...(showTemplateProjects ? templateProjects : [])];

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

    return (
        <Card
            style={{
                background: COLORS.surface,
                borderRadius: '16px',
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: `0 2px 8px ${COLORS.shadowLight}`,
            }}
            bodyStyle={{ padding: SPACING.lg }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.lg,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.accent}10)`,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${COLORS.accent}30`,
                    }}>
                        <ProjectOutlined style={{ fontSize: '20px', color: COLORS.accent }} />
                    </div>
                    <div>
                        <Title level={3} style={{
                            margin: 0,
                            color: COLORS.text,
                            fontSize: '20px',
                            fontWeight: 700,
                        }}>
                            {title}
                        </Title>
                        <Text style={{ color: COLORS.textSecondary, fontSize: '14px' }}>
                            {filledProjects.length} active projects
                        </Text>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                    style={{
                        // height: '40px',
                        borderRadius: '10px',
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        // fontWeight: 600,
                    }}
                >

                </Button>
            </div>

            {filledProjects.length === 0 ? (
                <Empty
                    description={
                        <div style={{ textAlign: 'center', padding: SPACING.xl }}>
                            <ProjectOutlined style={{
                                fontSize: '48px',
                                color: COLORS.textTertiary,
                                marginBottom: SPACING.md,
                            }} />
                            <Text style={{
                                color: COLORS.textSecondary,
                                fontSize: '16px',
                                display: 'block',
                                marginBottom: SPACING.sm,
                            }}>
                                No projects yet
                            </Text>
                            <Text style={{ color: COLORS.textTertiary, fontSize: '14px' }}>
                                Create your first project to get started
                            </Text>
                        </div>
                    }
                    image={null}
                />
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: SPACING.lg,
                }}>
                    {displayedProjects.map((proj) => {
                        const tasksToDisplay = proj.title ? proj.tasks : getTemplateTasks(proj.project_id);
                        const status = getStatusBadge(proj.progress);
                        const completedTasks = tasksToDisplay.filter(t => t.completed).length;
                        const totalTasks = tasksToDisplay.length;

                        return (
                            <Card
                                key={proj.project_id}
                                style={{
                                    background: COLORS.surface,
                                    borderRadius: '14px',
                                    border: `1px solid ${COLORS.borderLight}`,
                                    boxShadow: `0 2px 8px ${COLORS.shadowLight}`,
                                    transition: 'all 0.3s ease',
                                    cursor: proj.title ? 'default' : 'pointer',
                                }}
                                bodyStyle={{ padding: SPACING.md }}
                                hoverable={!proj.title}
                                onClick={() => !proj.title && setModalVisible(true)}
                            >
                                <div style={{ marginBottom: SPACING.md }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: SPACING.sm,
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                                                <Title level={4} style={{
                                                    margin: 0,
                                                    color: proj.title ? COLORS.text : COLORS.textSecondary,
                                                    fontStyle: proj.title ? 'normal' : 'italic',
                                                    fontSize: '16px',
                                                }}>
                                                    {proj.title || 'Add New Project'}
                                                </Title>
                                                {proj.title && (
                                                    <Badge
                                                        color={status.color}
                                                        text={status.text}
                                                        style={{ fontSize: '11px' }}
                                                    />
                                                )}
                                            </div>
                                            <Text style={{
                                                color: proj.description ? COLORS.textSecondary : COLORS.textTertiary,
                                                fontSize: '13px',
                                                fontStyle: proj.description ? 'normal' : 'italic',
                                                display: 'block',
                                                marginTop: SPACING.xs,
                                            }}>
                                                {proj.description || 'Project description...'}
                                            </Text>
                                        </div>
                                        {proj.title && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
                                                <Text style={{
                                                    fontSize: '24px',
                                                    fontWeight: 700,
                                                    color: getProgressColor(proj.progress),
                                                }}>
                                                    {proj.progress}%
                                                </Text>
                                            </div>
                                        )}
                                    </div>

                                    {proj.due_date && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: SPACING.xs,
                                            marginBottom: SPACING.sm,
                                        }}>
                                            <CalendarOutlined style={{
                                                color: COLORS.textSecondary,
                                                fontSize: '12px',
                                            }} />
                                            <Text style={{
                                                color: COLORS.textSecondary,
                                                fontSize: '12px',
                                            }}>
                                                Due: {dayjs(proj.due_date).format('MMM D, YYYY')}
                                            </Text>
                                        </div>
                                    )}

                                    {proj.progress > 0 && (
                                        <div style={{ marginBottom: SPACING.md }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: SPACING.xs,
                                            }}>
                                                <Text style={{
                                                    fontSize: '12px',
                                                    color: COLORS.textSecondary,
                                                    fontWeight: 600,
                                                }}>
                                                    Progress
                                                </Text>
                                                <Text style={{
                                                    fontSize: '12px',
                                                    color: COLORS.textSecondary,
                                                }}>
                                                    {completedTasks}/{totalTasks} tasks
                                                </Text>
                                            </div>
                                            <Progress
                                                percent={proj.progress}
                                                strokeColor={getProgressColor(proj.progress)}
                                                trailColor={COLORS.borderLight}
                                                showInfo={false}
                                                strokeWidth={6}
                                                style={{ marginBottom: SPACING.sm }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    marginBottom: SPACING.md,
                                }}>
                                    {tasksToDisplay.length === 0 ? (
                                        <Empty
                                            description={
                                                <Text style={{ color: COLORS.textSecondary, fontSize: '12px' }}>
                                                    No tasks yet
                                                </Text>
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            style={{ margin: 0 }}
                                        />
                                    ) : (
                                        tasksToDisplay.map((task) => (
                                            <div
                                                key={task.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: SPACING.sm,
                                                    background: task.completed ?
                                                        `${COLORS.success}08` :
                                                        task.title ? COLORS.surfaceSecondary : `${COLORS.borderLight}50`,
                                                    borderRadius: '10px',
                                                    marginBottom: SPACING.sm,
                                                    border: `1px solid ${task.completed ?
                                                        `${COLORS.success}20` :
                                                        task.title ? COLORS.borderLight : `${COLORS.borderLight}80`
                                                        }`,
                                                    borderLeft: task.title ?
                                                        `3px solid ${priorityColor[task.type] || COLORS.textSecondary}` :
                                                        `3px solid ${COLORS.borderLight}`,
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: SPACING.sm,
                                                    flex: 1,
                                                }}>
                                                    {task.title && (
                                                        <Checkbox
                                                            checked={task.completed}
                                                            onChange={() => proj.title && onToggleTask?.(proj.project_id, task.id)}
                                                            style={{
                                                                transform: 'scale(0.9)',
                                                                color: COLORS.accent,
                                                            }}
                                                        />
                                                    )}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            color: !task.title ? COLORS.textTertiary :
                                                                task.completed ? COLORS.textSecondary : COLORS.text,
                                                            fontStyle: !task.title ? 'italic' : 'normal',
                                                            textDecoration: task.completed ? 'line-through' : 'none',
                                                        }}>
                                                            {task.title || 'New task'}
                                                        </div>
                                                        {task.due && (
                                                            <div style={{
                                                                fontSize: '11px',
                                                                color: COLORS.textSecondary,
                                                                marginTop: SPACING.xs,
                                                            }}>
                                                                <ClockCircleOutlined style={{ marginRight: SPACING.xs }} />
                                                                {task.due}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: SPACING.xs,
                                                }}>
                                                    {showAvatarInTask && task.title && (
                                                        <Tooltip title={task.assignee}>
                                                            <Avatar
                                                                size={20}
                                                                style={{
                                                                    backgroundColor: priorityColor[task.type] || COLORS.textSecondary,
                                                                    color: COLORS.surface,
                                                                    fontSize: '10px',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {task.assignee ? task.assignee[0].toUpperCase() : '?'}
                                                            </Avatar>
                                                        </Tooltip>
                                                    )}
                                                    {task.title && (
                                                        <Tooltip title="Edit task">
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                icon={<EditOutlined />}
                                                                onClick={() => {
                                                                    setEditingTask({ projectId: proj.project_id, task });
                                                                    setEditTaskModal(true);
                                                                }}
                                                                style={{
                                                                    color: COLORS.textSecondary,
                                                                    fontSize: '12px',
                                                                    width: '24px',
                                                                    height: '24px',
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: SPACING.sm,
                                    borderTop: `1px solid ${COLORS.borderLight}`,
                                }}>
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        onClick={() => proj.title ? onAddTask?.(proj.project_id) : setModalVisible(true)}
                                        style={{
                                            color: COLORS.accent,
                                            fontWeight: 500,
                                            fontSize: '13px',
                                            padding: 0,
                                        }}
                                    >
                                        {proj.title ? 'Add Task' : 'Add Project'}
                                    </Button>
                                    {proj.title && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
                                            <Text style={{
                                                fontSize: '11px',
                                                color: COLORS.textSecondary,
                                            }}>
                                                {completedTasks} of {totalTasks} done
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

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
                onOk={() => {
                    if (newProject.title && onAddProject) {
                        onAddProject(newProject);
                        setModalVisible(false);
                        setNewProject({ title: '', description: '', due_date: '' });
                    }
                }}
                okText="Create Project"
                cancelText="Cancel"
                okButtonProps={{
                    style: {
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: '8px',
                    }
                }}
                style={{ borderRadius: '12px' }}
            >
                <div style={{ padding: `${SPACING.md}px 0` }}>
                    <Space direction="vertical" size={SPACING.md} style={{ width: '100%' }}>
                        <div>
                            <Text strong style={{ color: COLORS.text, marginBottom: SPACING.sm, display: 'block' }}>
                                Project Name
                            </Text>
                            <Input
                                placeholder="Enter project name"
                                value={newProject.title}
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <Text strong style={{ color: COLORS.text, marginBottom: SPACING.sm, display: 'block' }}>
                                Description
                            </Text>
                            <Input.TextArea
                                placeholder="Describe your project"
                                rows={4}
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <Text strong style={{ color: COLORS.text, marginBottom: SPACING.sm, display: 'block' }}>
                                Due Date
                            </Text>
                            <DatePicker
                                placeholder="Select due date"
                                style={{ width: '100%', borderRadius: '8px' }}
                                value={newProject.due_date ? dayjs(newProject.due_date) : null}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                onChange={(_, dateString) => {
                                    const dateStr = Array.isArray(dateString) ? dateString[0] ?? '' : dateString;
                                    setNewProject({ ...newProject, due_date: dateStr });
                                }}
                            />
                        </div>
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
                open={editTaskModal}
                onCancel={() => setEditTaskModal(false)}
                onOk={() => {
                    if (editingTask.task && onUpdateTask) {
                        onUpdateTask(editingTask.task);
                        setEditTaskModal(false);
                    }
                }}
                okText="Save Changes"
                cancelText="Cancel"
                okButtonProps={{
                    style: {
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: '8px',
                    }
                }}
                style={{ borderRadius: '12px' }}
            >
                <div style={{ padding: `${SPACING.md}px 0` }}>
                    <Space direction="vertical" size={SPACING.md} style={{ width: '100%' }}>
                        <div>
                            <Text strong style={{ color: COLORS.text, marginBottom: SPACING.sm, display: 'block' }}>
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
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <Text strong style={{ color: COLORS.text, marginBottom: SPACING.sm, display: 'block' }}>
                                Due Date
                            </Text>
                            <DatePicker
                                placeholder="Select due date"
                                style={{ width: '100%', borderRadius: '8px' }}
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
                                <Text strong style={{ color: COLORS.text, marginBottom: SPACING.sm, display: 'block' }}>
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
                                    style={{ width: '100%', borderRadius: '8px' }}
                                />
                            </div>
                        )}
                    </Space>
                </div>
            </Modal>
        </Card>
    );
};

export default FamilyTasksComponent;