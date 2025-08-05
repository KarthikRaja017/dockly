'use client';

import React, { useEffect, useState } from 'react';
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
    Radio,
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
    LeftOutlined,
    RightOutlined
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
}

const FamilyTasksComponent: React.FC<Props> = ({
    title = 'Projects & Tasks',
    projects = [],
    onAddProject,
    onAddTask,
    onToggleTask,
    onUpdateTask,
    familyMembers,
    showAssigneeInputInEdit = true,
    showAvatarInTask = true,
    showVisibilityToggle = false,
    showAssigneeField = false
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [assignees, setAssignees] = useState<{ label: string; value: string }[]>([]);
    const [editTaskModal, setEditTaskModal] = useState(false);
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

    const [loadingProject, setLoadingProject] = useState(false);
    const [loadingTask, setLoadingTask] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const filledProjects = projects.filter(p => p.title.trim());
    const showTemplateProjects = filledProjects.length < 2;

    const templateProjects = Array.from({ length: 2 - filledProjects.length }, (_, i) => ({
        project_id: `template-${i + 1}`,
        title: '',
        description: '',
        due_date: dayjs().format('YYYY-MM-DD'),
        progress: 0,
        tasks: [],
    }));

    const getTemplateTasks = (projectId: string): Task[] => {
        return Array.from({ length: 3 }, (_, i) => ({
            id: i + 1,
            title: '',
            assignee: 'all',
            type: 'default',
            completed: false,
            due: dayjs().format('MMM D'), // optional: make the task more realistic with today's date
        }));
    };
    useEffect(() => {
        if (familyMembers && familyMembers.length > 0) {
            const currentUserName = (localStorage.getItem("userName") || "").toLowerCase();

            const accepted = familyMembers
                .filter(
                    (member) =>
                        member.status?.toLowerCase() === "accepted" &&
                        member.name.toLowerCase() !== currentUserName
                )
                .map((member) => ({
                    label: member.name,
                    value: member.name.toLowerCase(),
                }));

            setAssignees(accepted);
        }
    }, [familyMembers]);


    const displayedProjects = [...filledProjects, ...(showTemplateProjects ? templateProjects : [])];
    const [currentPage, setCurrentPage] = useState(0);
    const projectsPerPage = 2;
    const totalPages = Math.ceil(displayedProjects.length / projectsPerPage);
    const paginatedProjects = displayedProjects.slice(
        currentPage * projectsPerPage,
        currentPage * projectsPerPage + projectsPerPage
    );


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
                borderRadius: '12px',
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: `0 2px 8px ${COLORS.shadowLight}`,
                // width: "950px"
            }}
            // bodyStyle={{ padding: '12px' }}
            styles={{
                body: {
                    padding: '12px',
                }
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.accent}10)`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${COLORS.accent}30`,
                    }}>
                        <ProjectOutlined style={{ fontSize: '16px', color: COLORS.accent }} />
                    </div>
                    <div>
                        <Title level={3} style={{
                            margin: 0,
                            color: COLORS.text,
                            fontSize: '16px',
                            fontWeight: 600,
                        }}>
                            {title}
                        </Title>
                        <Text style={{ color: COLORS.textSecondary, fontSize: '11px' }}>
                            {filledProjects.length} active projects
                        </Text>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalVisible(true)}
                    style={{
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        fontSize: '12px',
                    }}
                >

                </Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md }}>
                <Button
                    icon={<LeftOutlined />}
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    style={{
                        borderRadius: '50%',
                        backgroundColor: COLORS.surface,
                        boxShadow: `0 1px 4px ${COLORS.shadowMedium}`,
                        border: `1px solid ${COLORS.borderLight}`,
                    }}
                />
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    flex: 1,
                }}>
                    {paginatedProjects.map((proj) => {
                        const isTemplate = !proj.title;
                        const isEmptyRealProject = proj.title && proj.tasks.length === 0;
                        const sortedTasks = isTemplate || isEmptyRealProject
                            ? getTemplateTasks(proj.project_id)
                            : [...proj.tasks].sort((a, b) => b.id - a.id);
                        const visibleTasks = sortedTasks.slice(0, 2); // limit to 2
                        const status = getStatusBadge(proj.progress);
                        const completedTasks = sortedTasks.filter(t => t.completed).length;
                        const totalTasks = sortedTasks.length;

                        return (
                            <Card
                                key={proj.project_id}
                                style={{
                                    background: COLORS.surface,
                                    borderRadius: '12px',
                                    border: `1px solid ${COLORS.borderLight}`,
                                    boxShadow: `0 2px 8px ${COLORS.shadowLight}`,
                                    transition: 'all 0.3s ease',
                                    cursor: proj.title ? 'default' : 'pointer',
                                    height: '280px',
                                    overflowY: 'auto',         // 👈 Set fixed height
                                    display: 'flex',            // 👈 These help with consistent layout
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                                bodyStyle={{ padding: '10px' }}
                                hoverable={!proj.title}
                                onClick={() => !proj.title && setModalVisible(true)}
                            >
                                {/* Title + Progress */}
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '8px',
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Title level={4} style={{
                                                    margin: 0,
                                                    color: proj.title ? COLORS.text : COLORS.textSecondary,
                                                    fontStyle: proj.title ? 'normal' : 'italic',
                                                    fontSize: '12px',
                                                }}>
                                                    {proj.title || 'Add New Project'}
                                                </Title>
                                                {proj.title && (
                                                    <Badge
                                                        color={status.color}
                                                        text={status.text}
                                                        style={{ fontSize: '9px' }}
                                                    />
                                                )}
                                            </div>
                                            <Text style={{
                                                color: proj.description ? COLORS.textSecondary : COLORS.textTertiary,
                                                fontSize: '10px',
                                                fontStyle: proj.description ? 'normal' : 'italic',
                                                display: 'block',
                                                marginTop: '4px',
                                            }}>
                                                {proj.description || 'Project description...'}
                                            </Text>
                                        </div>
                                        {proj.title && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Button
                                                    type="primary"
                                                    shape="circle"
                                                    size="small"
                                                    icon={<PlusOutlined />}
                                                    loading={loadingTask}
                                                    onClick={async () => {
                                                        setLoadingTask(true);
                                                        setEditingTask({ projectId: proj.project_id, task: null });
                                                        setEditTaskModal(true);
                                                    }}
                                                    style={{
                                                        backgroundColor: COLORS.accent,
                                                        borderColor: COLORS.accent,
                                                        boxShadow: `0 2px 6px ${COLORS.shadowLight}`,
                                                        marginLeft: '6px',
                                                        width: '24px',
                                                        height: '24px',
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {proj.due_date && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            marginBottom: '6px',
                                        }}>
                                            <CalendarOutlined style={{ color: COLORS.textSecondary, fontSize: '10px' }} />
                                            <Text style={{ color: COLORS.textSecondary, fontSize: '10px' }}>
                                                Due: {dayjs(proj.due_date).format('MMM D, YYYY')}
                                            </Text>
                                        </div>
                                    )}
                                    {proj.progress >= 0 && (
                                        <div style={{ marginBottom: '10px' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '4px',
                                            }}>
                                                {/* Move task count next to "Progress" */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Text style={{ fontSize: '10px', color: COLORS.textSecondary, fontWeight: 600 }}>
                                                        Progress
                                                    </Text>
                                                    <Text style={{ fontSize: '9px', color: COLORS.textSecondary }}>
                                                        {completedTasks}/{totalTasks} tasks
                                                    </Text>
                                                </div>

                                                {/* Percentage & Add (+) button */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Text style={{
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        color: getProgressColor(proj.progress),
                                                    }}>
                                                        {proj.progress}%
                                                    </Text>
                                                </div>
                                            </div>
                                            <Progress
                                                percent={proj.progress}
                                                strokeColor={getProgressColor(proj.progress)}
                                                trailColor={COLORS.borderLight}
                                                showInfo={false}
                                                strokeWidth={6}
                                                style={{ marginBottom: '6px' }}
                                            />
                                        </div>
                                    )}

                                </div>

                                {/* Tasks */}
                                <div
                                    style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        marginBottom: '8px',
                                        paddingRight: '4px',
                                        minHeight: '0', // ensures flex layout respects overflow
                                    }}
                                >
                                    {sortedTasks.length === 0 ? (
                                        <Empty
                                            description={<Text style={{ color: COLORS.textSecondary, fontSize: '10px' }}>No tasks yet</Text>}
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            style={{ margin: 0 }}
                                        />
                                    ) : (
                                        visibleTasks.map((task) => (

                                            <div
                                                key={task.id}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '6px',
                                                    minHeight: 32, // ✅ ensures it's not too small
                                                    background: task.completed
                                                        ? `${COLORS.success}08`
                                                        : task.title
                                                            ? COLORS.surfaceSecondary
                                                            : `${COLORS.borderLight}30`,
                                                    borderRadius: '10px',
                                                    marginBottom: '6px',
                                                    border: `1px solid ${task.completed
                                                        ? `${COLORS.success}20`
                                                        : task.title
                                                            ? COLORS.borderLight
                                                            : `${COLORS.borderLight}80`
                                                        }`,
                                                    borderLeft: task.title
                                                        ? `3px solid ${priorityColor[task.type] || COLORS.textSecondary}`
                                                        : `3px solid ${COLORS.borderLight}`,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                                                    {task.title && (
                                                        <Checkbox
                                                            checked={task.completed}
                                                            onChange={() => proj.title && onToggleTask?.(proj.project_id, task.id)}
                                                            style={{ transform: 'scale(0.9)', color: COLORS.accent }}
                                                        />
                                                    )}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '11px',
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
                                                                fontSize: '9px',
                                                                color: COLORS.textSecondary,
                                                                marginTop: '2px',
                                                            }}>
                                                                <ClockCircleOutlined style={{ marginRight: '2px' }} />
                                                                {task.due}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {showAvatarInTask && task.title && (
                                                        <Tooltip title={task.assignee}>
                                                            <Avatar
                                                                size={16}
                                                                style={{
                                                                    backgroundColor: priorityColor[task.type] || COLORS.textSecondary,
                                                                    color: COLORS.surface,
                                                                    fontSize: '8px',
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
                                                                    fontSize: '10px',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        ))

                                    )}
                                    {sortedTasks.filter(task => task.title).length > 2 && proj.title && (
                                        <Button
                                            type="link"
                                            size="small"
                                            onClick={() => {
                                                setViewMoreProject(proj);
                                                setViewMoreModalVisible(true);
                                            }}
                                            style={{ padding: 0, color: COLORS.accent, fontSize: '10px' }}
                                        >
                                            View More
                                        </Button>
                                    )}
                                </div>

                                {/* Footer */}
                                {/* <div style={{
                                        marginTop: 'auto', // 👈 locks the footer to bottom in flex column
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
                                                <Text style={{ fontSize: '11px', color: COLORS.textSecondary }}>
                                                    {completedTasks} of {totalTasks} done
                                                </Text>
                                            </div>
                                        )}
                                    </div> */}
                            </Card>
                        );
                    })}
                </div>

                <Button
                    icon={<RightOutlined />}
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    style={{
                        borderRadius: '50%',
                        backgroundColor: COLORS.surface,
                        boxShadow: `0 1px 4px ${COLORS.shadowMedium}`,
                        border: `1px solid ${COLORS.borderLight}`,
                    }}
                />
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
                        {showVisibilityToggle && (
                            <div>
                                <Text strong style={{ color: COLORS.text, marginBottom: SPACING.sm, display: 'block' }}>
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
                        setLoadingEdit(true);
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
            <Modal
                title={viewMoreProject?.title || 'Project Tasks'}
                open={viewMoreModalVisible}
                onCancel={() => setViewMoreModalVisible(false)}
                footer={null}
                width={600}
            >
                {viewMoreProject?.tasks.map((task) => (
                    <div
                        key={task.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: SPACING.sm,
                            marginBottom: SPACING.sm,
                            borderRadius: '8px',
                            backgroundColor: task.completed ? `${COLORS.success}10` : COLORS.surfaceSecondary,
                            border: `1px solid ${task.completed ? COLORS.success : COLORS.borderLight}`,
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm, flex: 1 }}>
                            <Checkbox
                                checked={task.completed}
                                onChange={() => {
                                    if (viewMoreProject?.project_id) {
                                        onToggleTask?.(viewMoreProject.project_id, task.id);
                                    }
                                }}
                            />
                            <div>
                                <Text
                                    style={{
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        color: task.completed ? COLORS.textSecondary : COLORS.text,
                                    }}
                                >
                                    {task.title}
                                </Text>
                                <div style={{ fontSize: 12, color: COLORS.textTertiary }}>
                                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                                    {task.due}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
                            {showAvatarInTask && (
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
                            )}
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingTask({ projectId: viewMoreProject.project_id, task });
                                    setEditTaskModal(true);
                                    setViewMoreModalVisible(false);
                                }}
                            />
                        </div>
                    </div>
                ))}
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
                    style={{ marginBottom: 12 }}
                />

                <DatePicker
                    value={taskDueDate}
                    onChange={(date) => setTaskDueDate(date)}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    style={{ width: '100%', marginBottom: 12 }}
                />

                {showAssigneeField && (
                    <Select
                        placeholder="Select assignee"
                        value={taskAssignee}
                        onChange={(value) => setTaskAssignee(value)}
                        style={{ width: '100%' }}
                        options={assignees}

                    />
                    // <Select
                    //     placeholder="Select assignee"
                    //     value={editingTask.task?.assignee}
                    //     onChange={(val) =>
                    //         setEditingTask((prev) => ({
                    //             ...prev,
                    //             task: prev.task && { ...prev.task, assignee: val, type: val },
                    //             }))
                    //            }
                    //     options={assignees}
                    //     style={{ width: '100%', borderRadius: '8px' }}
                    // />
                )}
            </Modal>


        </Card>
    );
};

export default FamilyTasksComponent;