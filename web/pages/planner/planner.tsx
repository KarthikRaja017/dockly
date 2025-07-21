"use client";
import React, { useState, useEffect } from "react";
import {
    DatePicker,
    Form,
    Modal,
    Select,
    TimePicker,
    Input,
    Button,
    Checkbox,
    Typography,
    Card,
    Row,
    Col,
    Tag,
    message,
    Avatar,
    Switch,
    Space,
    Badge,
    Progress,
    Divider,
} from "antd";
import {
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    FilterOutlined,
    GoogleOutlined,
    MailOutlined,
    PlusOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ProjectOutlined,
    FileTextOutlined,
    TrophyOutlined,
    CheckSquareOutlined
} from "@ant-design/icons";
import { addProject, addTask, getProjects, getTasks, updateTask } from "../../services/family";
import dayjs from "dayjs";
import { addEvents, addPlannerNotes, addWeeklyGoal, addWeeklyTodo, deletePlannerNote, getPlanner, getPlannerNotes, getWeeklyTodos, updatePlannerNote, updateWeeklyGoal, updateWeeklyTodo } from "../../services/planner";
import { getCalendarEvents } from "../../services/google";
import DocklyLoader from "../../utils/docklyLoader";
import { Calendar } from "lucide-react";
import { showNotification } from "../../utils/notification";
import MiniCalendar from "../../pages/components/miniCalendar";
import CustomCalendar from "../../pages/components/customCalendar";
import FamilyTasksComponent from "../../pages/components/familyTasksProjects";
import { useCurrentUser } from "../../app/userContext";
import { PRIMARY_COLOR } from "../../app/comman";
import { API_URL } from "../../services/apiConfig";
import { useParams, useRouter } from "next/navigation";
import FamilyNotes from "../family-hub/components/familyNotesLists";

const { Title, Text } = Typography;

// Enhanced Professional color palette
const COLORS = {
    primary: '#1C1C1E',
    secondary: '#48484A',
    accent: '#1890FF',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    background: '#FAFBFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    surfaceElevated: '#FDFDFD',
    border: '#E8E8E8',
    borderLight: '#F0F0F0',
    borderMedium: '#D9D9D9',
    text: '#1C1C1E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    overlay: 'rgba(0, 0, 0, 0.45)',
    shadowLight: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
    shadowHeavy: 'rgba(0, 0, 0, 0.12)',
    shadowElevated: 'rgba(0, 0, 0, 0.16)',
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

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
    visibility: string;
    source: string;
};

interface ConnectedAccount {
    userName: string;
    email: string;
    displayName: string;
    accountType: string;
    provider: string;
    color: string;
}

interface ConnectedAccountType {
    email: string;
    provider: 'google' | 'dockly';
    color: string;
}

const groupAccountsByEmail = (accounts: ConnectedAccountType[]) => {
    const map: Record<string, ConnectedAccountType[]> = {};
    accounts.forEach((acc) => {
        if (!map[acc.email]) {
            map[acc.email] = [];
        }
        map[acc.email].push(acc);
    });
    return Object.entries(map).map(([email, providers]) => ({ email, providers }));
};

const CalendarAccountFilter: React.FC<{
    connectedAccounts: ConnectedAccount[];
    onFilterChange: (filteredAccounts: string[]) => void;
    onConnectAccount: () => void;
}> = ({ connectedAccounts, onFilterChange, onConnectAccount }) => {
    const [activeFilters, setActiveFilters] = useState<string[]>(
        connectedAccounts.map((acc) => acc.email)
    );
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const user = useCurrentUser();

    const groupedAccounts = groupAccountsByEmail(connectedAccounts as ConnectedAccountType[]);

    const handleFilterToggle = (email: string) => {
        const newFilters = activeFilters.includes(email)
            ? activeFilters.filter((f) => f !== email)
            : [...activeFilters, email];

        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSelectAll = () => {
        const allEmails = groupedAccounts.map((group) => group.email);
        setActiveFilters(allEmails);
        onFilterChange(allEmails);
    };

    const handleDeselectAll = () => {
        setActiveFilters([]);
        onFilterChange([]);
    };

    if (connectedAccounts.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.sm,
                padding: `${SPACING.md}px ${SPACING.lg}px`,
                background: COLORS.surfaceSecondary,
                borderRadius: '12px',
                border: `1px solid ${COLORS.borderLight}`,
            }}>
                <GoogleOutlined style={{ color: COLORS.textSecondary, fontSize: '16px' }} />
                <Text style={{ color: COLORS.textSecondary, fontSize: '14px', fontWeight: 500 }}>
                    No accounts connected
                </Text>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={onConnectAccount}
                    style={{
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: '8px',
                        height: '32px',
                        fontWeight: 600,
                    }}
                >
                    Connect
                </Button>
            </div>
        );
    }

    return (
        <>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.sm,
                flexWrap: 'wrap',
            }}>
                {groupedAccounts.slice(0, 3).map(({ email, providers }) => {
                    const isActive = activeFilters.includes(email);
                    const primaryColor = providers.find((p) => p.provider === 'dockly')
                        ? PRIMARY_COLOR
                        : providers.find((p) => p.provider === 'google')?.color || providers[0].color;

                    return (
                        <div
                            key={email}
                            onClick={() => handleFilterToggle(email)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: SPACING.xs,
                                padding: `${SPACING.sm}px ${SPACING.md}px`,
                                background: isActive ? `${primaryColor}12` : COLORS.surfaceSecondary,
                                border: `1px solid ${isActive ? primaryColor : COLORS.borderLight}`,
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isActive ? 1 : 0.7,
                            }}
                        >
                            <Avatar
                                size={24}
                                style={{
                                    backgroundColor: primaryColor,
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}
                            >
                                {providers[0].provider === 'google' ? <GoogleOutlined /> : 'D'}
                            </Avatar>
                            <Text style={{ fontSize: '13px', fontWeight: 500 }}>
                                {email.split('@')[0]}
                            </Text>
                        </div>
                    );
                })}

                {groupedAccounts.length > 3 && (
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => setIsFilterModalVisible(true)}
                        style={{
                            borderRadius: '8px',
                            fontSize: '12px',
                            height: '32px',
                        }}
                    >
                        +{groupedAccounts.length - 3}
                    </Button>
                )}

                <Button
                    size="small"
                    icon={<FilterOutlined />}
                    onClick={() => setIsFilterModalVisible(true)}
                    style={{
                        borderRadius: '8px',
                        fontSize: '12px',
                        height: '32px',
                    }}
                >
                    Filter
                </Button>
            </div>

            <Modal
                title="Account Filters"
                open={isFilterModalVisible}
                onCancel={() => setIsFilterModalVisible(false)}
                footer={null}
                width={500}
            >
                <div style={{ padding: '16px 0' }}>
                    <div style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                        <Button size="small" onClick={handleSelectAll}>
                            Select All
                        </Button>
                        <Button size="small" onClick={handleDeselectAll}>
                            Deselect All
                        </Button>
                    </div>

                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {groupedAccounts.map(({ email, providers }) => {
                            const isActive = activeFilters.includes(email);
                            const primaryColor = providers.find((p) => p.provider === 'dockly')
                                ? PRIMARY_COLOR
                                : providers.find((p) => p.provider === 'google')?.color || providers[0].color;

                            return (
                                <div
                                    key={email}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px',
                                        background: isActive ? `${primaryColor}10` : COLORS.surfaceSecondary,
                                        borderRadius: '8px',
                                        border: `1px solid ${isActive ? primaryColor : COLORS.borderLight}`,
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <Avatar
                                            size={32}
                                            style={{ backgroundColor: primaryColor }}
                                            icon={providers[0].provider === 'google' ? <GoogleOutlined /> : undefined}
                                        >
                                            {providers[0].provider === 'dockly' ? 'D' : email.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <Text strong>{email}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {providers.map(p => p.provider.charAt(0).toUpperCase() + p.provider.slice(1)).join(', ')}
                                            </Text>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isActive}
                                        onChange={() => handleFilterToggle(email)}
                                        style={{
                                            backgroundColor: isActive ? primaryColor : undefined,
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </Space>
                </div>
            </Modal>
        </>
    );
};

const ConnectAccountModal: React.FC<{
    isVisible: boolean;
    onClose: () => void;
    onConnect: () => void;
}> = ({ isVisible, onClose, onConnect }) => {
    return (
        <Modal
            open={isVisible}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
        >
            <div style={{ textAlign: 'center', padding: '24px' }}>
                <CalendarOutlined style={{ fontSize: '64px', color: COLORS.accent, marginBottom: '24px' }} />
                <Title level={3} style={{ marginBottom: '16px', color: COLORS.text }}>
                    Connect Your Google Calendar
                </Title>
                <Text style={{ display: 'block', marginBottom: '24px', color: COLORS.textSecondary }}>
                    To view and manage your calendar events, please connect your Google account.
                    You can connect multiple accounts to see all your events in one place.
                </Text>
                <div style={{
                    background: COLORS.surfaceSecondary,
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px'
                }}>
                    <Text style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                        🔒 Your data is secure and we only access your calendar events
                    </Text>
                </div>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<GoogleOutlined />}
                        onClick={onConnect}
                        style={{
                            width: '100%',
                            height: '48px',
                            backgroundColor: COLORS.accent,
                            borderColor: COLORS.accent,
                            borderRadius: '8px',
                        }}
                    >
                        Connect Google Account
                    </Button>
                    <Button
                        type="text"
                        onClick={onClose}
                        style={{ width: '100%' }}
                    >
                        Maybe Later
                    </Button>
                </Space>
            </div>
        </Modal>
    );
};

const PlannerTitle: React.FC<{
    connectedAccounts: ConnectedAccount[];
    onFilterChange: (filteredAccounts: string[]) => void;
    onConnectAccount: () => void;
}> = ({ connectedAccounts, onFilterChange, onConnectAccount }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: SPACING.xl,
            padding: `${SPACING.sm}px ${SPACING.md}px`,
            borderRadius: '24px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.lg,
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                    color: 'white',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 24px ${COLORS.accent}30`,
                }}>
                    <Calendar size={26} />
                </div>
                <div>
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: 500,
                        color: COLORS.text,
                        margin: 0,
                        lineHeight: 1.2,
                        background: `linear-gradient(135deg, ${COLORS.text}, ${COLORS.textSecondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}>
                        Planner
                    </h1>
                    <Text style={{
                        color: COLORS.textSecondary,
                        fontSize: '16px',
                        fontWeight: 300,
                        display: 'block',
                        marginTop: '4px',
                    }}>
                        Organize your life efficiently
                    </Text>
                </div>
            </div>
            <CalendarAccountFilter
                connectedAccounts={connectedAccounts}
                onFilterChange={onFilterChange}
                onConnectAccount={onConnectAccount}
            />
        </div>
    );
};

const StatisticsCard: React.FC<{
    title: string;
    value: number;
    total?: number;
    icon: React.ReactNode;
    color: string;
    showProgress?: boolean;
}> = ({ title, value, total, icon, color, showProgress = false }) => {
    const percentage = total ? Math.round((value / total) * 100) : 0;

    return (
        <div style={{
            background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceElevated})`,
            borderRadius: '20px',
            padding: SPACING.md,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: `0 8px 32px ${COLORS.shadowLight}`,
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 16px 48px ${COLORS.shadowMedium}`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 8px 32px ${COLORS.shadowLight}`;
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.md,
            }}>
                <div style={{
                    width: '38px',
                    height: '38px',
                    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                    color: 'white',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 24px ${color}30`,
                }}>
                    {icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '25px',
                        fontWeight: 500,
                        color: COLORS.text,
                        lineHeight: 1,
                        marginBottom: '4px',
                    }}>
                        {value}
                        {total && (
                            <span style={{
                                fontSize: '16px',
                                color: COLORS.textSecondary,
                                fontWeight: 300,
                            }}>
                                /{total}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div style={{
                fontSize: '16px',
                color: COLORS.textSecondary,
                fontWeight: 600,
                marginBottom: showProgress ? SPACING.md : 0,
            }}>
                {title}
            </div>
        </div>
    );
};

const Planner = () => {
    const [goals, setGoals] = useState<
        {
            id: string;
            text: string;
            completed: boolean;
            date: string;
            time: string;
        }[]
    >([]);
    const [todos, setTodos] = useState<
        {
            id: string;
            text: string;
            completed: boolean;
            priority: "high" | "medium" | "low";
            date: string;
            time: string;
            goal_id?: string;
        }[]
    >([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [backup, setBackup] = useState(null);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [isEventModalVisible, setIsEventModalVisible] = useState(false);
    const [isTodoModalVisible, setIsTodoModalVisible] = useState(false);
    const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
    const [isConnectAccountModalVisible, setIsConnectAccountModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<any>(null);
    const [editingTodo, setEditingTodo] = useState<any>(null);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [filteredAccountEmails, setFilteredAccountEmails] = useState<string[]>([]);
    const [personColors, setPersonColors] = useState<{ [person: string]: { color: string; email: string } }>({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"Day" | "Week" | "Month" | "Year">("Week");
    const [eventForm] = Form.useForm();
    const [goalForm] = Form.useForm();
    const [todoForm] = Form.useForm();
    const [projectForm] = Form.useForm();
    const user = useCurrentUser();
    const router = useRouter();
    const [notes, setNotes] = useState<
        { id: string; title: string; description: string; created_at: string }[]
    >([]);
    const [editingNote, setEditingNote] = useState<{ id: string; title: string; description: string } | null>(null);
    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
    const [noteForm] = Form.useForm();
    const [expandedSection, setExpandedSection] = useState<"goals" | "todos" | null>("goals");
    const params = useParams();
    const username = params?.username;

    // Helper functions
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return COLORS.error;
            case "medium": return COLORS.warning;
            case "low": return COLORS.success;
            default: return COLORS.textSecondary;
        }
    };

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDateRange = (date: Date, viewType: string) => {
        const start = new Date(date);
        const end = new Date(date);

        switch (viewType) {
            case "Day":
                break;
            case "Week":
                const dayOfWeek = start.getDay();
                start.setDate(start.getDate() - dayOfWeek);
                end.setDate(start.getDate() + 6);
                break;
            case "Month":
                start.setDate(1);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                break;
            case "Year":
                start.setMonth(0, 1);
                end.setMonth(11, 31);
                break;
        }

        return { start, end };
    };

    const getFilteredGoals = () => {
        const { start, end } = getDateRange(currentDate, view);
        const startStr = formatDateString(start);
        const endStr = formatDateString(end);
        return goals.filter(goal => goal.date >= startStr && goal.date <= endStr);
    };

    const getFilteredTodos = () => {
        const { start, end } = getDateRange(currentDate, view);
        const startStr = formatDateString(start);
        const endStr = formatDateString(end);
        return todos.filter(todo => todo.date >= startStr && todo.date <= endStr);
    };

    const getViewTitle = (type: 'Goals' | 'Tasks') => {
        switch (view) {
            case "Day": return `Daily ${type}`;
            case "Week": return `Weekly ${type}`;
            case "Month": return `Monthly ${type}`;
            case "Year": return `Yearly ${type}`;
            default: return `Weekly ${type}`;
        }
    };

    const getFilteredCalendarEvents = () => {
        if (filteredAccountEmails.length === 0) {
            return calendarEvents;
        }
        return calendarEvents.filter(event =>
            filteredAccountEmails.includes(event.source_email || '')
        );
    };

    const handleAccountFilterChange = (filteredEmails: string[]) => {
        setFilteredAccountEmails(filteredEmails);
    };

    const handleConnectAccount = () => {
        window.location.href = `${API_URL}/add-googleCalendar?username=${user?.user_name}&userId=${user?.uid}`;
    };

    // Statistics calculations
    const filteredGoalsData = getFilteredGoals();
    const filteredTodosData = getFilteredTodos();
    const completedGoals = filteredGoalsData.filter(g => g.completed).length;
    const completedTodos = filteredTodosData.filter(t => t.completed).length;
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.progress === 100).length;
    const totalEvents = getFilteredCalendarEvents().length;

    const fetchNotes = async () => {
        try {
            const res = await getPlannerNotes();
            if (res.data.status === 1) {
                setNotes(res.data.payload || []);
            } else {
                setNotes([]);
                message.error("Failed to fetch notes");
            }
        } catch (err) {
            console.error(err);
            setNotes([]);
            message.error("Something went wrong");
        }
    };

    const handleEditNote = (note: { id: string; title: string; description: string }) => {
        noteForm.setFieldsValue({ title: note.title, description: note.description });
        setEditingNote(note);
        setIsNoteModalVisible(true);
    };

    const publicProjects = projects.filter(p => p.visibility === 'public');

    const filteredProjects = projects.filter(
        (proj) => proj.source === 'planner'
    );


    const handleDeleteNote = async (id: string) => {
        try {
            await deletePlannerNote(id);
            message.success("Note deleted");
            fetchNotes();
        } catch (err) {
            message.error("Failed to delete note");
        }
    };

    const getAvailableGoals = () => {
        return getFilteredGoals();
    };

    const handleAddEvent = () => {
        setLoading(true);
        eventForm.validateFields().then(async (values) => {
            try {
                values.date = values.date.format("YYYY-MM-DD");
                values.time = values.time.format("h:mm A");

                const response = await addEvents({ ...values });
                const { message, status } = response.data;

                if (status) {
                    showNotification("Success", message, "success");
                } else {
                    showNotification("Error", message, "error");
                }

                setIsEventModalVisible(false);
                await fetchEvents();
                eventForm.resetFields();
            } catch (err) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                setLoading(false);
            }
        }).catch(() => {
            setLoading(false);
        });
    };

    const handleAddProjects = async (project: {
        title: string;
        description: string;
        due_date: string;
        visibility: 'public' | 'private';
    }) => {
        setLoading(true);
        try {
            await addProject({
                ...project,
                source: 'planner',
                meta: { visibility: project.visibility }
            });
            fetchProjects();
        } catch {
            // Handle error
        }
        setLoading(false);
    };

    const handleAddTask = async (projectId: string,
        taskData?: { title: string; due_date: string; assignee?: string }
    ) => {
        if (!taskData) return;
        setLoading(true);
        try {
            await addTask({
                project_id: projectId,
                title: taskData.title,
                assignee: taskData.assignee || 'All',
                type: 'low',
                due_date: taskData.due_date,
                completed: false,
            });
            fetchProjects();
        } catch {
            message.error('Failed to add task');
        }
        setLoading(false);
    };

    const handleToggleTask = async (projectId: string, taskId: number) => {
        setLoading(true);
        const project = projects.find((p) => p.project_id === projectId);
        const task = project?.tasks.find((t) => t.id === taskId);
        if (!task) return;

        try {
            await updateTask({ task_id: taskId, completed: !task.completed });
            fetchProjects();
        } catch {
            message.error('Failed to toggle task');
        }
        setLoading(false);
    };

    const handleUpdateTask = (task: Task): void => {
        setLoading(true);
        updateTask({
            task_id: task.id,
            title: task.title,
            due_date: task.dueDate,
            assignee: task.assignee,
            type: task.type,
        })
            .then(() => {
                message.success('Task updated');
                fetchProjects();
            })
            .catch(() => {
                message.error('Failed to update task');
            });
        setLoading(false);
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const projRes = await getProjects({ source: 'planner' });
            const rawProjects = projRes.data.payload.projects || [];

            const projectsWithTasks = await Promise.all(
                rawProjects.map(async (proj: any) => {
                    const taskRes = await getTasks({ project_id: proj.project_id });
                    const rawTasks = taskRes.data.payload.tasks || [];

                    const tasks = rawTasks.map((task: any, i: number): Task => ({
                        id: typeof task.task_id === 'number' ? task.task_id : parseInt(task.task_id) || i + 1,
                        title: task.title,
                        assignee: task.assignee,
                        type: task.type,
                        completed: task.completed,
                        due: task.completed ? 'Completed' : `Due ${dayjs(task.due_date).format('MMM D')}`,
                        dueDate: task.due_date ? String(task.due_date) : '',
                    }));

                    return {
                        project_id: proj.project_id,
                        title: proj.title,
                        description: proj.description,
                        due_date: proj.due_date,
                        color: proj.color || COLORS.accent,
                        progress: tasks.length
                            ? Math.round((tasks.filter((t: Task) => t.completed).length / tasks.length) * 100)
                            : 0,
                        tasks,
                        visibility: proj.meta?.visibility || 'public',
                        source: proj.source || '',
                    };
                })
            );

            setProjects(projectsWithTasks);
        } catch (err) {
            // Handle error
        }
        setLoading(false);
    };

    const getDueDateByView = (activeView: string, activeDate: Date) => {
        const formatted = (date: Date) => dayjs(date).format("YYYY-MM-DD");

        const getWeekEndDate = () => {
            const day = activeDate.getDay();
            const diff = 6 - day;
            const weekend = new Date(activeDate);
            weekend.setDate(activeDate.getDate() + diff);
            return formatted(weekend);
        };

        const getMonthEndDate = () => {
            const year = activeDate.getFullYear();
            const month = activeDate.getMonth();
            return formatted(new Date(year, month + 1, 0));
        };

        const getYearEndDate = () => {
            const year = activeDate.getFullYear();
            return formatted(new Date(year, 11, 31));
        };

        switch (activeView) {
            case "Day":
                return formatted(activeDate);
            case "Week":
                return getWeekEndDate();
            case "Month":
                return getMonthEndDate();
            case "Year":
                return getYearEndDate();
            default:
                return getWeekEndDate();
        }
    };

    const handleAddGoal = async () => {
        setLoading(true);
        goalForm.validateFields().then(async (values) => {
            try {
                const formattedDate = dayjs(values.date).format("YYYY-MM-DD");
                const time = dayjs().format("h:mm A");

                const goalPayload = {
                    ...values,
                    date: formattedDate,
                    time,
                    backup: backup,
                };

                let response;
                if (editingGoal) {
                    response = await updateWeeklyGoal({ id: editingGoal.id, ...goalPayload });
                } else {
                    response = await addWeeklyGoal(goalPayload);
                }
                const { message: msg, status } = response.data;
                const prefix = view === "Day" ? "Daily"
                    : view === "Month" ? "Monthly"
                        : view === "Year" ? "Yearly"
                            : "Weekly";

                const fullMessage = status ? `${prefix} ${editingGoal ? "goal updated" : "goal added"} successfully` : msg;
                showNotification(status ? "Success" : "Error", fullMessage, status ? "success" : "error");
                getUserPlanner(true, currentDate);
                setIsGoalModalVisible(false);
                setEditingGoal(null);
                fetchEvents();
                goalForm.resetFields();
            } catch (error) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                setLoading(false);
            }
        }).catch(() => setLoading(false));
    };

    const getUserPlanner = async (preserveView: boolean = false, preservedDate: Date | null = null) => {
        setLoading(true);
        try {
            const response = await getPlanner({});

            const rawGoals = response.data.payload.goals;
            const rawTodos = response.data.payload.todos;

            const formattedGoals = rawGoals.map((item: any) => ({
                id: item.id,
                text: item.goal,
                completed: item.completed ?? item.todo_status ?? false,
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
            }));

            const formattedTodos = rawTodos.map((item: any) => ({
                id: item.id,
                text: item.text,
                completed: item.todo_status ?? item.todo_status ?? false,
                priority: item.priority || "medium",
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
                goal_id: item.goal_id,
            }));

            setGoals(formattedGoals);
            setTodos(formattedTodos);
            if (preservedDate) {
                setCurrentDate(preservedDate);
            }
        } catch (error) {
            console.error("Error fetching goals:", error);
        }
        setLoading(false);
    };

    const handleAddTodo = () => {
        setLoading(true);
        todoForm.validateFields().then(async (values) => {
            try {
                const formattedDate = dayjs(values.date).format("YYYY-MM-DD");
                const time = dayjs().format("h:mm A");

                const todoPayload = {
                    ...values,
                    date: formattedDate,
                    time,
                    backup: backup,
                };

                let response;
                if (editingTodo) {
                    response = await updateWeeklyTodo({ id: editingTodo.id, ...todoPayload });
                } else {
                    response = await addWeeklyTodo(todoPayload);
                }

                const { status, message: backendMsg } = response.data;

                const prefix = view === "Day" ? "Daily"
                    : view === "Month" ? "Monthly"
                        : view === "Year" ? "Yearly"
                            : "Weekly";

                const action = editingTodo ? "task updated" : "task added";
                const msg = status ? `${prefix} ${action} successfully` : backendMsg;

                showNotification(status ? "Success" : "Error", msg, status ? "success" : "error");
                await getWeeklyTodos({});
                getUserPlanner(true, currentDate);
                setIsTodoModalVisible(false);
                setEditingTodo(null);
                fetchEvents();
                todoForm.resetFields();
            } catch (error) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                setLoading(false);
            }
        }).catch(() => setLoading(false));
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await getCalendarEvents({});
            const rawEvents = response?.data?.payload?.events || [];
            const connectedAccountsData = response?.data?.payload?.connected_accounts || [];

            setConnectedAccounts(connectedAccountsData);

            if (filteredAccountEmails.length === 0) {
                setFilteredAccountEmails(connectedAccountsData.map((acc: any) => acc.email));
            }

            const newPersonColors: { [key: string]: { color: string; email: string } } = {};
            connectedAccountsData.forEach((account: any) => {
                const colorToUse = account.provider === "dockly" ? PRIMARY_COLOR : account.color;

                newPersonColors[account.userName] = {
                    color: colorToUse,
                    email: account.email,
                };
            });

            setPersonColors(newPersonColors);

            if (connectedAccountsData.length > 0) {
                setBackup(connectedAccountsData[0].email);
            }

            if (rawEvents.length > 0) {
                const transformedEvents = transformEvents(rawEvents);
                setCalendarEvents(transformedEvents);
            }

            if (connectedAccountsData.length === 0) {
                setIsConnectAccountModalVisible(true);
            }

        } catch (error) {
            console.error('Error fetching events:', error);
            setIsConnectAccountModalVisible(true);
        } finally {
            setLoading(false);
        }
    };


    const transformEvents = (rawEvents: any[]): any[] => {
        return rawEvents.map((event, index) => {
            // Attempt to extract standard Google Calendar fields
            const startDateTime = event.start?.dateTime ?? null;
            const endDateTime = event.end?.dateTime ?? null;
            const startDate = event.start?.date ?? null;
            const endDate = event.end?.date ?? null;
            const creatorEmail = event.creator?.email || event.source_email || "Unknown";
            const isGoogleEvent = event.kind === "calendar#event";

            // Fallback: if manual event was added via Planner modal
            const manualDate = event.date;
            const manualTime = event.time;

            // Determine start
            const start = startDateTime
                ? dayjs(startDateTime)
                : startDate
                    ? dayjs(startDate)
                    : manualDate
                        ? dayjs(`${manualDate} ${manualTime || '00:00'}`)
                        : null;

            // Determine end
            let end: dayjs.Dayjs | null = null;
            if (endDateTime) {
                end = dayjs(endDateTime);
            } else if (endDate) {
                end = isGoogleEvent
                    ? dayjs(endDate).subtract(1, "day") // Google all-day events end on the *next* day
                    : dayjs(endDate);
            } else if (start) {
                end = start.add(1, "hour");
            }

            const formattedStart = start?.format("YYYY-MM-DD") ?? "";
            const formattedEnd = end?.format("YYYY-MM-DD") ?? "";
            const isAllDay = formattedStart !== formattedEnd;

            return {
                id: event.id || index.toString(),
                title: event.summary || event.title || "Untitled Event",
                startTime: isAllDay ? "12:00 AM" : start?.format("hh:mm A") ?? "12:00 AM",
                endTime: isAllDay ? "11:59 PM" : end?.format("hh:mm A") ?? "11:59 PM",
                date: formattedStart || "N/A",
                person: creatorEmail.split("@")[0],
                color: event.account_color || event.color || COLORS.accent,
                is_all_day: isAllDay,
                start_date: formattedStart,
                end_date: formattedEnd,
                source_email: event.source_email || creatorEmail,
                provider: event.provider || "google",
            };
        });
    };
    const handleAddProject = async () => {
        try {
            const values = await projectForm.validateFields();

            const newProject = {
                title: values.title,
                description: values.category,
                due_date: values.dueDate.format("YYYY-MM-DD"),
                visibility: values.visibility || 'private',
            };

            await handleAddProjects(newProject); // ✅ This sends it to backend with meta.visibility

            projectForm.resetFields();
            setIsProjectModalVisible(false);
        } catch (err) {
            console.error('Validation failed:', err);
        }
    };


    useEffect(() => {
        fetchEvents();
        getUserPlanner(true, currentDate);
        fetchProjects();
        fetchNotes();
    }, []);


    const handleToggleTodo = async (id: string) => {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        const updatedCompleted = !todo.completed;

        try {
            // Optimistically update the UI
            setTodos((prevTodos) =>
                prevTodos.map((t) =>
                    t.id === id ? { ...t, completed: updatedCompleted } : t
                )
            );

            // Send update to backend
            await updateWeeklyTodo({
                id: todo.id,
                uid: user.uid,
                text: todo.text,
                date: todo.date,
                time: todo.time,
                priority: todo.priority,
                goal_id: todo.goal_id,
                completed: updatedCompleted,
                sync_to_google: false,
            });


            // Optional: fetch updated todos again to ensure sync
            // getUserPlanner(true, currentDate);

        } catch (err) {
            // Revert UI on failure
            setTodos((prevTodos) =>
                prevTodos.map((t) =>
                    t.id === id ? { ...t, completed: !updatedCompleted } : t
                )
            );
            showNotification("Error", "Failed to update task status", "error");
        }
    };



    const handleEditGoal = (goal: any) => {
        setEditingGoal(goal);
        goalForm.setFieldsValue({
            goal: goal.text,
            date: dayjs(goal.date),
            time: dayjs(goal.time, "h:mm A"),
        });
        setIsGoalModalVisible(true);
    };

    const handleEditTodo = (todo: any) => {
        setEditingTodo(todo);
        todoForm.setFieldsValue({
            text: todo.text,
            priority: todo.priority,
            date: dayjs(todo.date),
            time: dayjs(todo.time, "h:mm A"),
            goal_id: todo.goal_id,
        });
        setIsTodoModalVisible(true);
    };

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date);
    };

    const handleMiniCalendarMonthChange = (date: Date) => {
        setCurrentDate(date);
    };

    const handleMainCalendarDateChange = (date: Date) => {
        setCurrentDate(date);
    };

    const handleMainCalendarViewChange = (newView: "Day" | "Week" | "Month" | "Year") => {
        setView(newView);
        const newDate = new Date(currentDate);
        if (newView === "Month") {
            newDate.setDate(1);
        } else if (newView === "Week") {
            const day = newDate.getDay();
            newDate.setDate(newDate.getDate() - day);
        }
        setCurrentDate(newDate);
    };

    if (loading) {
        return <DocklyLoader />;
    }

    const filteredGoalsData2 = getFilteredGoals();
    const filteredTodosData2 = getFilteredTodos();
    const filteredCalendarEvents = getFilteredCalendarEvents();

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: COLORS.background,
            marginLeft: "50px",
            marginTop: "60px",
        }}>
            <div style={{
                padding: SPACING.xl,
                backgroundColor: COLORS.background,
                minHeight: "100vh",
            }}>
                <PlannerTitle
                    connectedAccounts={connectedAccounts}
                    onFilterChange={handleAccountFilterChange}
                    onConnectAccount={handleConnectAccount}
                />
                <Row gutter={[SPACING.xl, SPACING.xl]} style={{ marginBottom: SPACING.xl }}>
                    <Col span={6}>
                        <StatisticsCard
                            title="Goals"
                            value={filteredGoalsData2.length}
                            icon={<TrophyOutlined style={{ fontSize: '18px' }} />}
                            color={COLORS.success}
                        />
                    </Col>
                    <Col span={6}>
                        <StatisticsCard
                            title="Tasks Progress"
                            value={completedTodos}
                            total={filteredTodosData2.length}
                            icon={<CheckSquareOutlined style={{ fontSize: '18px' }} />}
                            color={COLORS.warning}
                        />
                    </Col>
                    <Col span={6}>
                        <StatisticsCard
                            title="Active Projects"
                            value={projects.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0)} // completed tasks
                            total={projects.reduce((acc, p) => acc + p.tasks.length, 0)} // total tasks
                            icon={<ProjectOutlined style={{ fontSize: '18px' }} />}
                            color={COLORS.accent}
                        // showProgress
                        />
                    </Col>
                    <Col span={6}>
                        <StatisticsCard
                            title={`Calender Events (${view})`}
                            value={getFilteredCalendarEvents().filter(event => {
                                const { start, end } = getDateRange(currentDate, view);
                                const startDay = dayjs(start).startOf("day");
                                const endDay = dayjs(end).endOf("day");

                                const eventStart = dayjs(event.start_date);
                                const eventEnd = dayjs(event.end_date);

                                return eventStart.isBefore(endDay) && eventEnd.isAfter(startDay);
                            }).length}
                            icon={<CalendarOutlined style={{ fontSize: '18px' }} />}
                            color={COLORS.secondary}
                        />
                    </Col>
                </Row>
                <Row gutter={[SPACING.md, SPACING.md]} style={{ marginBottom: SPACING.xl }}>
                    <Col span={17}>
                        <div style={{
                            background: COLORS.surface,
                            borderRadius: '24px',
                            border: `1px solid ${COLORS.borderLight}`,
                            boxShadow: `0 8px 32px ${COLORS.shadowLight}`,
                            overflow: 'hidden',
                        }}>
                            <CustomCalendar
                                data={{ events: filteredCalendarEvents, meals: [] }}
                                personColors={personColors}
                                source="planner"
                                allowMentions={false}
                                fetchEvents={fetchEvents}
                                view={view}
                                onViewChange={setView}
                                goals={filteredGoalsData2}
                                todos={filteredTodosData2}
                                onToggleTodo={handleToggleTodo}
                                onAddGoal={() => setIsGoalModalVisible(true)}
                                onAddTodo={() => setIsTodoModalVisible(true)}
                                enabledHashmentions={false}
                                currentDate={currentDate}
                                onDateChange={handleMainCalendarDateChange}
                                setCurrentDate={setCurrentDate}
                                setBackup={setBackup}
                                backup={backup}
                                connectedAccounts={connectedAccounts || []}
                            />
                        </div>
                    </Col>
                    <Col span={7} >
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: SPACING.md,
                        }}>
                            <div style={{
                                background: COLORS.surface,
                                borderRadius: '20px',
                                border: `1px solid ${COLORS.borderLight}`,
                                boxShadow: `0 8px 32px ${COLORS.shadowLight}`,
                                overflow: 'hidden',
                            }}>
                                <MiniCalendar
                                    currentDate={currentDate}
                                    onDateSelect={handleDateSelect}
                                    onMonthChange={handleMiniCalendarMonthChange}
                                    events={filteredCalendarEvents}
                                    view={view}
                                />
                            </div>
                            <div style={{
                                background: COLORS.surface,
                                borderRadius: '20px',
                                border: `1px solid ${COLORS.borderLight}`,
                                boxShadow: `0 8px 32px ${COLORS.shadowLight}`,
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: SPACING.md,
                                    borderBottom: `1px solid ${COLORS.borderLight}`,
                                    cursor: 'pointer',
                                    background: COLORS.surfaceElevated,
                                }} onClick={() =>
                                    setExpandedSection(expandedSection === "goals" ? null : "goals")
                                }>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: SPACING.sm,
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}dd)`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 4px 16px ${COLORS.success}20`,
                                        }}>
                                            <TrophyOutlined style={{ color: 'white', fontSize: '20px' }} />
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <Text strong style={{ fontSize: '16px', color: COLORS.text }}>
                                                {getViewTitle("Goals")}
                                            </Text>
                                            <div style={{ marginTop: '2px', marginLeft: 7 }}>
                                                <Badge
                                                    count={`${filteredGoalsData2.length}`}
                                                    style={{
                                                        backgroundColor: COLORS.success,
                                                        fontSize: '12px',
                                                        fontWeight: 400,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsGoalModalVisible(true);
                                            }}
                                            style={{
                                                backgroundColor: COLORS.accent,
                                                borderColor: COLORS.accent,
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '14px',
                                            color: COLORS.textSecondary,
                                            transform: expandedSection === "goals" ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                        }}>
                                            ▼
                                        </span>
                                    </div>
                                </div>
                                {expandedSection === "goals" && (
                                    <div style={{
                                        padding: SPACING.lg,
                                        maxHeight: '250px',
                                        overflowY: 'auto',
                                    }}>
                                        {[...filteredGoalsData2,
                                        ...Array(Math.max(3, filteredGoalsData2.length + 1) - filteredGoalsData2.length).fill({})]
                                            .map((goal, index) => (
                                                <div
                                                    key={goal.id || `empty-goal-${index}`}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        padding: SPACING.md,
                                                        backgroundColor: COLORS.surfaceSecondary,
                                                        borderRadius: '12px',
                                                        border: goal?.id
                                                            ? `1px solid ${COLORS.success}20`
                                                            : `2px dashed ${COLORS.borderMedium}`,
                                                        marginBottom: SPACING.md,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        backgroundColor: goal?.id ? COLORS.success : COLORS.borderMedium,
                                                        color: goal?.id ? COLORS.surface : COLORS.textSecondary,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: 700,
                                                        marginRight: SPACING.md,
                                                        flexShrink: 0,
                                                    }}>
                                                        {goal?.completed ? '✓' : index + 1}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        {goal?.id ? (
                                                            <>
                                                                <div style={{
                                                                    fontSize: '15px',
                                                                    fontWeight: 600,
                                                                    color: goal.completed ? COLORS.textSecondary : COLORS.text,
                                                                    textDecoration: goal.completed ? 'line-through' : 'none',
                                                                    marginBottom: SPACING.sm,
                                                                    wordBreak: 'break-word',
                                                                    lineHeight: 1.4,
                                                                }}>
                                                                    {goal.text}
                                                                </div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '12px',
                                                                        color: COLORS.textSecondary,
                                                                        fontWeight: 500,
                                                                    }}>
                                                                        {goal.date}
                                                                    </Text>
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<EditOutlined />}
                                                                        onClick={() => handleEditGoal(goal)}
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            color: COLORS.textSecondary,
                                                                            padding: '4px 6px',
                                                                            borderRadius: '6px',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <Text
                                                                style={{
                                                                    color: COLORS.textTertiary,
                                                                    fontStyle: "italic",
                                                                    fontSize: '15px',
                                                                    cursor: "pointer",
                                                                    fontWeight: 500,
                                                                }}
                                                                onClick={() => setIsGoalModalVisible(true)}
                                                            >
                                                                Add Goal {index + 1}
                                                            </Text>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                            <div style={{
                                background: COLORS.surface,
                                borderRadius: '20px',
                                border: `1px solid ${COLORS.borderLight}`,
                                boxShadow: `0 8px 32px ${COLORS.shadowLight}`,
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: SPACING.md,
                                    borderBottom: `1px solid ${COLORS.borderLight}`,
                                    cursor: 'pointer',
                                    background: COLORS.surfaceElevated,
                                }} onClick={() =>
                                    setExpandedSection(expandedSection === "todos" ? null : "todos")
                                }>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: SPACING.sm,
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}dd)`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 4px 16px ${COLORS.warning}20`,
                                        }}>
                                            <CheckSquareOutlined style={{ color: 'white', fontSize: '20px' }} />
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: '16px', color: COLORS.text }}>
                                                {getViewTitle("Tasks")}
                                            </Text>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: SPACING.sm,
                                                marginTop: '2px',
                                            }}>
                                                <Badge
                                                    count={`${completedTodos}/${filteredTodosData2.length}`}
                                                    style={{
                                                        backgroundColor: COLORS.warning,
                                                        fontSize: '12px',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                                {filteredTodosData2.length > 0 && (
                                                    <Progress
                                                        percent={Math.round((completedTodos / filteredTodosData2.length) * 100)}
                                                        strokeColor={COLORS.warning}
                                                        trailColor={COLORS.borderLight}
                                                        showInfo={false}
                                                        strokeWidth={4}
                                                        style={{ width: '50px' }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsTodoModalVisible(true);
                                            }}
                                            style={{
                                                backgroundColor: COLORS.accent,
                                                borderColor: COLORS.accent,
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '14px',
                                            color: COLORS.textSecondary,
                                            transform: expandedSection === "todos" ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                        }}>
                                            ▼
                                        </span>
                                    </div>
                                </div>
                                {expandedSection === "todos" && (
                                    <div style={{
                                        padding: SPACING.lg,
                                        maxHeight: '280px',
                                        overflowY: 'auto',
                                    }}>
                                        {[...filteredTodosData2,
                                        ...Array(Math.max(3, filteredTodosData2.length + 1) - filteredTodosData2.length).fill({})]
                                            .map((todo, index) => (
                                                <div
                                                    key={todo.id || `empty-todo-${index}`}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        padding: SPACING.md,
                                                        backgroundColor: COLORS.surfaceSecondary,
                                                        borderRadius: '12px',
                                                        border: todo?.id
                                                            ? `1px solid ${getPriorityColor(todo.priority)}20`
                                                            : `2px dashed ${COLORS.borderMedium}`,
                                                        marginBottom: SPACING.md,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    {todo?.id ? (
                                                        <>
                                                            <Checkbox
                                                                checked={todo.completed}
                                                                onChange={() => handleToggleTodo(todo.id)}
                                                                style={{
                                                                    marginRight: SPACING.md,
                                                                    transform: 'scale(1.1)',
                                                                }}
                                                            />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{
                                                                    fontSize: '15px',
                                                                    fontWeight: 600,
                                                                    color: todo.completed ? COLORS.textSecondary : COLORS.text,
                                                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                                                    marginBottom: SPACING.sm,
                                                                    wordBreak: 'break-word',
                                                                    lineHeight: 1.4,
                                                                }}>
                                                                    {todo.text}
                                                                </div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '12px',
                                                                        color: COLORS.textSecondary,
                                                                        fontWeight: 500,
                                                                    }}>
                                                                        {todo.date}
                                                                    </Text>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: SPACING.sm,
                                                                    }}>
                                                                        <div style={{
                                                                            width: '8px',
                                                                            height: '8px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: getPriorityColor(todo.priority),
                                                                        }} />
                                                                        <Button
                                                                            type="text"
                                                                            size="small"
                                                                            icon={<EditOutlined />}
                                                                            onClick={() => handleEditTodo(todo)}
                                                                            style={{
                                                                                fontSize: '12px',
                                                                                color: COLORS.textSecondary,
                                                                                padding: '4px 6px',
                                                                                borderRadius: '6px',
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <Text
                                                            style={{
                                                                color: COLORS.textTertiary,
                                                                fontStyle: "italic",
                                                                fontSize: '15px',
                                                                cursor: "pointer",
                                                                paddingLeft: SPACING.lg,
                                                                fontWeight: 500,
                                                            }}
                                                            onClick={() => setIsTodoModalVisible(true)}
                                                        >
                                                            Add Task {index + 1}
                                                        </Text>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[SPACING.md, SPACING.md]}>
                    <Col span={16}>
                        <FamilyTasksComponent
                            title="Projects"
                            projects={filteredProjects}
                            onAddProject={handleAddProjects}
                            onAddTask={handleAddTask}
                            onToggleTask={handleToggleTask}
                            onUpdateTask={handleUpdateTask}
                            showAssigneeInputInEdit={false}
                            showAvatarInTask={false}
                            showVisibilityToggle={true}
                            showAssigneeField={false}
                        />
                    </Col>
                    <Col span={8}>
                        <FamilyNotes />
                    </Col>
                </Row>
                <ConnectAccountModal
                    isVisible={isConnectAccountModalVisible}
                    onClose={() => setIsConnectAccountModalVisible(false)}
                    onConnect={handleConnectAccount}
                />
                <Modal
                    title={
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: SPACING.sm,
                            fontSize: '20px',
                            fontWeight: 700,
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CalendarOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            Add New Event
                        </div>
                    }
                    open={isEventModalVisible}
                    onCancel={() => setIsEventModalVisible(false)}
                    maskClosable={!loading}
                    closable={!loading}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => setIsEventModalVisible(false)}
                            disabled={loading}
                            style={{
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleAddEvent}
                            disabled={loading}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}
                        >
                            Add Event
                        </Button>,
                    ]}
                    width={600}
                >
                    <Form form={eventForm} layout="vertical" style={{ marginTop: SPACING.lg }}>
                        <Form.Item
                            name="title"
                            label={<Text strong style={{ fontSize: '15px' }}>Event Title</Text>}
                            rules={[{ required: true, message: "Please enter the event title" }]}
                        >
                            <Input
                                placeholder="Event title"
                                style={{
                                    borderRadius: '10px',
                                    height: '44px',
                                    fontSize: '15px',
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="date"
                            label={<Text strong style={{ fontSize: '15px' }}>Date</Text>}
                            rules={[{ required: true, message: "Please select a date" }]}
                            initialValue={dayjs()}
                        >
                            <DatePicker
                                style={{
                                    width: "100%",
                                    borderRadius: '10px',
                                    height: '44px',
                                }}
                                disabledDate={(current) => current && current < dayjs().startOf("day")}
                            />
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label={<Text strong style={{ fontSize: '15px' }}>Time</Text>}
                            rules={[{ required: true, message: "Please select a time" }]}
                            initialValue={dayjs().add(10, "minute").startOf("minute")}
                        >
                            <TimePicker
                                use12Hours
                                format="h:mm A"
                                minuteStep={10}
                                showSecond={false}
                                style={{
                                    width: "100%",
                                    borderRadius: '10px',
                                    height: '44px',
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title={
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: SPACING.sm,
                            fontSize: '20px',
                            fontWeight: 700,
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <FileTextOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            {editingNote ? "Edit Note" : "Add New Note"}
                        </div>
                    }
                    open={isNoteModalVisible}
                    onCancel={() => {
                        noteForm.resetFields();
                        setIsNoteModalVisible(false);
                    }}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => {
                                noteForm.resetFields();
                                setIsNoteModalVisible(false);
                            }}
                            style={{
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={() => {
                                noteForm.validateFields().then(async (values) => {
                                    if (editingNote) {
                                        await updatePlannerNote({ id: editingNote.id, ...values });
                                        message.success("Note updated");
                                    } else {
                                        await addPlannerNotes(values);
                                        message.success("Note added");
                                    }
                                    fetchNotes();
                                    noteForm.resetFields();
                                    setEditingNote(null);
                                    setIsNoteModalVisible(false);
                                });
                            }}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}
                        >
                            {editingNote ? "Update Note" : "Add Note"}
                        </Button>
                    ]}
                    width={600}
                >
                    <Form form={noteForm} layout="vertical" style={{ marginTop: SPACING.lg }}>
                        <Form.Item
                            name="title"
                            label={<Text strong style={{ fontSize: '15px' }}>Note Title</Text>}
                            rules={[{ required: true, message: "Please enter the note title" }]}
                        >
                            <Input
                                placeholder="Note title"
                                style={{
                                    borderRadius: '10px',
                                    height: '44px',
                                    fontSize: '15px',
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label={<Text strong style={{ fontSize: '15px' }}>Description</Text>}
                            rules={[{ required: true, message: "Please enter the note description" }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Note description"
                                style={{
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: SPACING.sm,
                            fontSize: '20px',
                            fontWeight: 700,
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}dd)`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <TrophyOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            {editingGoal ? "Edit Goal" : "Add New Goal"}
                        </div>
                    }
                    open={isGoalModalVisible}
                    onCancel={() => {
                        setIsGoalModalVisible(false);
                        setEditingGoal(null);
                        goalForm.resetFields();
                    }}
                    maskClosable={!loading}
                    closable={!loading}
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsGoalModalVisible(false);
                            setEditingGoal(null);
                            goalForm.resetFields();
                        }} disabled={loading}
                            style={{
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleAddGoal}
                            disabled={loading}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}
                        >
                            {editingGoal ? "Update Goal" : "Add Goal"}
                        </Button>,
                    ]}
                    width={600}
                >
                    <Form form={goalForm} layout="vertical" style={{ marginTop: SPACING.lg }}>
                        <Form.Item
                            name="goal"
                            label={<Text strong style={{ fontSize: '15px' }}>Goal</Text>}
                            rules={[{ required: true, message: "Please enter your goal" }]}
                        >
                            <Input
                                placeholder="Enter your Goal.."
                                style={{
                                    borderRadius: '10px',
                                    height: '44px',
                                    fontSize: '15px',
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="date"
                            label={<Text strong style={{ fontSize: '15px' }}>Due Date</Text>}
                            rules={[{ required: true, message: "Please select a due date" }]}
                            initialValue={dayjs(getDueDateByView(view, currentDate))} // default value
                        >
                            <DatePicker
                                format="YYYY-MM-DD"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                style={{ borderRadius: '10px', height: '44px', width: '100%' }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title={
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: SPACING.sm,
                            fontSize: '20px',
                            fontWeight: 700,
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}dd)`,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CheckSquareOutlined style={{ color: 'white', fontSize: '18px' }} />
                            </div>
                            {editingTodo ? "Edit Task" : "Add New Task"}
                        </div>
                    }
                    open={isTodoModalVisible}
                    onCancel={() => {
                        setIsTodoModalVisible(false);
                        setEditingTodo(null);
                        todoForm.resetFields();
                    }}
                    maskClosable={!loading}
                    closable={!loading}
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsTodoModalVisible(false);
                            setEditingTodo(null);
                            todoForm.resetFields();
                        }} disabled={loading}
                            style={{
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleAddTodo}
                            disabled={loading}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '10px',
                                height: '44px',
                                fontWeight: 600,
                            }}
                        >
                            {editingTodo ? "Update Task" : "Add Task"}
                        </Button>,
                    ]}
                    width={600}
                >
                    <Form form={todoForm} layout="vertical" style={{ marginTop: SPACING.lg }}>
                        <Form.Item
                            name="text"
                            label={<Text strong style={{ fontSize: '15px' }}>Task</Text>}
                            rules={[{ required: true, message: "Please enter the task" }]}
                        >
                            <Input
                                placeholder="Task title"
                                style={{ borderRadius: '10px', height: '44px', fontSize: '15px' }}
                            />
                        </Form.Item>

                        <Space direction="horizontal" style={{ width: '100%' }}>
                            <Form.Item
                                name="date"
                                label={<Text strong style={{ fontSize: '15px' }}>Due Date</Text>}
                                rules={[{ required: true, message: "Please select due date" }]}
                                initialValue={dayjs(getDueDateByView(view, currentDate))}
                            >
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    style={{ borderRadius: '10px', height: '44px' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="goal_id"
                                label={<Text strong style={{ fontSize: '15px' }}>Goal</Text>}
                            >
                                <Select
                                    placeholder="Select a goal (optional)"
                                    allowClear
                                    style={{ borderRadius: '10px', minWidth: '200px', height: '44px' }}
                                >
                                    {getAvailableGoals().map((goal) => (
                                        <Select.Option key={goal.id} value={goal.id}>
                                            {goal.text}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Space>

                        <Form.Item
                            name="priority"
                            label={<Text strong style={{ fontSize: '15px' }}>Priority</Text>}
                            rules={[{ required: true, message: "Please select a priority" }]}
                            initialValue="medium"
                        >
                            <Select style={{ borderRadius: '10px' }}>
                                <Select.Option value="low">Low</Select.Option>
                                <Select.Option value="medium">Medium</Select.Option>
                                <Select.Option value="high">High</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default Planner;