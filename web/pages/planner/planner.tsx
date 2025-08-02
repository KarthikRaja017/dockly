'use client';
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
import { addEvents, addPlannerNotes, addWeeklyGoal, addWeeklyTodo, deletePlannerNote, getAllPlannerData, getPlannerNotes, getWeeklyTodos, updatePlannerNote, updateWeeklyGoal, updateWeeklyTodo } from "../../services/planner";
import { Calendar } from "lucide-react";
import { PRIMARY_COLOR } from "../../app/comman";
import { showNotification } from "../../utils/notification";
import CustomCalendar from "../components/customCalendar";
import MiniCalendar from "../components/miniCalendar";
import FamilyTasksComponent from "../components/familyTasksProjects";
import NotesLists from "../family-hub/components/familyNotesLists";
import { useCurrentUser } from "../../app/userContext";
const { Title, Text } = Typography;

// Enhanced Professional color palette with better contrast
const COLORS = {
    primary: '#1a1a1a',
    secondary: '#4a4a4a',
    accent: '#2563eb',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    background: '#fafbfc',
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    surfaceElevated: '#fdfdfd',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderMedium: '#cbd5e1',
    text: '#1a1a1a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowHeavy: 'rgba(0, 0, 0, 0.15)',
    shadowElevated: 'rgba(0, 0, 0, 0.2)',
};

const SPACING = {
    xs: 3,
    sm: 6,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 36,
};

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
                gap: SPACING.xs,
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                background: COLORS.surfaceSecondary,
                borderRadius: '8px',
                border: `1px solid ${COLORS.borderLight}`,
                fontFamily: FONT_FAMILY,
            }}>
                <GoogleOutlined style={{ color: COLORS.textSecondary, fontSize: '14px' }} />
                <Text style={{ color: COLORS.textSecondary, fontSize: '13px', fontWeight: 500, fontFamily: FONT_FAMILY }}>
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
                        borderRadius: '6px',
                        height: '28px',
                        fontWeight: 600,
                        fontSize: '12px',
                        fontFamily: FONT_FAMILY,
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
                gap: SPACING.xs,
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
                                padding: `${SPACING.xs}px ${SPACING.sm}px`,
                                background: isActive ? `${primaryColor}12` : COLORS.surfaceSecondary,
                                border: `1px solid ${isActive ? primaryColor : COLORS.borderLight}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isActive ? 1 : 0.7,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            <Avatar
                                size={20}
                                style={{
                                    backgroundColor: primaryColor,
                                    fontSize: '10px',
                                    fontWeight: 600,
                                }}
                            >
                                {providers[0].provider === 'google' ? <GoogleOutlined /> : 'D'}
                            </Avatar>
                            <Text style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>
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
                            borderRadius: '6px',
                            fontSize: '11px',
                            height: '28px',
                            fontFamily: FONT_FAMILY,
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
                        borderRadius: '6px',
                        fontSize: '11px',
                        height: '28px',
                        fontFamily: FONT_FAMILY,
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
                width={450}
            >
                <div style={{ padding: '12px 0', fontFamily: FONT_FAMILY }}>
                    <div style={{
                        marginBottom: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}>
                        <Button size="small" onClick={handleSelectAll} style={{ fontFamily: FONT_FAMILY }}>
                            Select All
                        </Button>
                        <Button size="small" onClick={handleDeselectAll} style={{ fontFamily: FONT_FAMILY }}>
                            Deselect All
                        </Button>
                    </div>

                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
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
                                        padding: '8px',
                                        background: isActive ? `${primaryColor}10` : COLORS.surfaceSecondary,
                                        borderRadius: '6px',
                                        border: `1px solid ${isActive ? primaryColor : COLORS.borderLight}`,
                                        fontFamily: FONT_FAMILY,
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <Avatar
                                            size={28}
                                            style={{ backgroundColor: primaryColor }}
                                            icon={providers[0].provider === 'google' ? <GoogleOutlined /> : undefined}
                                        >
                                            {providers[0].provider === 'dockly' ? 'D' : email.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <Text strong style={{ fontFamily: FONT_FAMILY, fontSize: '13px' }}>{email}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '11px', fontFamily: FONT_FAMILY }}>
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
            width={450}
            centered
        >
            <div style={{ textAlign: 'center', padding: '18px', fontFamily: FONT_FAMILY }}>
                <CalendarOutlined style={{ fontSize: '48px', color: COLORS.accent, marginBottom: '18px' }} />
                <Title level={4} style={{ marginBottom: '12px', color: COLORS.text, fontFamily: FONT_FAMILY }}>
                    Connect Your Google Calendar
                </Title>
                <Text style={{ display: 'block', marginBottom: '18px', color: COLORS.textSecondary, fontFamily: FONT_FAMILY, fontSize: '14px' }}>
                    To view and manage your calendar events, please connect your Google account.
                    You can connect multiple accounts to see all your events in one place.
                </Text>
                <div style={{
                    background: COLORS.surfaceSecondary,
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '18px'
                }}>
                    <Text style={{ fontSize: '13px', color: COLORS.textSecondary, fontFamily: FONT_FAMILY }}>
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
                            height: '42px',
                            backgroundColor: COLORS.accent,
                            borderColor: COLORS.accent,
                            borderRadius: '6px',
                            fontFamily: FONT_FAMILY,
                        }}
                    >
                        Connect Google Account
                    </Button>
                    <Button
                        type="text"
                        onClick={onClose}
                        style={{ width: '100%', fontFamily: FONT_FAMILY }}
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
            padding: `${SPACING.xs}px ${SPACING.sm}px`,
            borderRadius: '16px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.md,
            }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                    color: 'white',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 20px ${COLORS.accent}30`,
                }}>
                    <Calendar size={22} />
                </div>
                <div>
                    <h1 style={{
                        fontSize: '26px',
                        fontWeight: 600,
                        color: COLORS.text,
                        margin: 0,
                        lineHeight: 1.2,
                        fontFamily: FONT_FAMILY,
                    }}>
                        Planner
                    </h1>
                    <Text style={{
                        color: COLORS.textSecondary,
                        fontSize: '14px',
                        fontWeight: 400,
                        display: 'block',
                        marginTop: '2px',
                        fontFamily: FONT_FAMILY,
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
            borderRadius: '14px',
            padding: SPACING.lg,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: FONT_FAMILY,
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.shadowMedium}`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 16px ${COLORS.shadowLight}`;
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.sm,
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                    color: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${color}30`,
                }}>
                    {icon}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        color: COLORS.text,
                        lineHeight: 1,
                        marginBottom: '2px',
                        fontFamily: FONT_FAMILY,
                    }}>
                        {value}
                        {total && (
                            <span style={{
                                fontSize: '14px',
                                color: COLORS.textSecondary,
                                fontWeight: 400,
                            }}>
                                /{total}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div style={{
                fontSize: '13px',
                color: COLORS.textSecondary,
                fontWeight: 500,
                marginBottom: showProgress ? SPACING.sm : 0,
                fontFamily: FONT_FAMILY,
            }}>
                {title}
            </div>
        </div>
    );
};

const Planner = () => {
    const userId = useCurrentUser()?.uid;
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
    // const [loading, setLoading] = useState(false);
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
    const [notes, setNotes] = useState<
        { id: string; title: string; description: string; created_at: string }[]
    >([]);
    const [editingNote, setEditingNote] = useState<{ id: string; title: string; description: string } | null>(null);
    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
    const [noteForm] = Form.useForm();
    const [expandedSection, setExpandedSection] = useState<"goals" | "todos" | null>("goals");

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
        window.location.href = `/add-googleCalendar?username=user&userId=123`;
    };

    // Statistics calculations
    const filteredGoalsData = getFilteredGoals();
    const filteredTodosData = getFilteredTodos();
    const completedGoals = filteredGoalsData.filter(g => g.completed).length;
    const completedTodos = filteredTodosData.filter(t => t.completed).length;
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.progress === 100).length;
    const totalEvents = getFilteredCalendarEvents().length;

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
            fetchAllPlannerData();
        } catch (err) {
            message.error("Failed to delete note");
        }
    };

    const getAvailableGoals = () => {
        return getFilteredGoals();
    };

    const handleAddEvent = () => {
        // setLoading(true);
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
                await fetchAllPlannerData();
                eventForm.resetFields();
            } catch (err) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                // setLoading(false);
            }
        }).catch(() => {
            // setLoading(false);
        });
    };

    const handleAddProjects = async (project: {
        title: string;
        description: string;
        due_date: string;
        visibility: 'public' | 'private';
    }) => {
        // setLoading(true);
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
        // setLoading(false);
    };

    const handleAddTask = async (projectId: string,
        taskData?: { title: string; due_date: string; assignee?: string }
    ) => {
        if (!taskData) return;
        // setLoading(true);
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
        // setLoading(false);
    };

    const handleToggleTask = async (projectId: string, taskId: number) => {
        // setLoading(true);
        const project = projects.find((p) => p.project_id === projectId);
        const task = project?.tasks.find((t) => t.id === taskId);
        if (!task) return;

        try {
            await updateTask({ task_id: taskId, completed: !task.completed });
            fetchProjects();
        } catch {
            message.error('Failed to toggle task');
        }
        // setLoading(false);
    };

    const handleUpdateTask = (task: Task): void => {
        // setLoading(true);
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
        // setLoading(false);
    };

    const fetchProjects = async () => {
        // setLoading(true);
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
        // setLoading(false);
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
        // setLoading(true);
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
                await fetchAllPlannerData();
                setIsGoalModalVisible(false);
                setEditingGoal(null);
                goalForm.resetFields();
            } catch (error) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                // setLoading(false);
            }
        });
    };

    // Single comprehensive fetch function
    const fetchAllPlannerData = async (preserveView: boolean = false, preservedDate: Date | null = null) => {
        // setLoading(true);
        try {
            // Determine filter parameters
            const show_dockly = true; // Always show Dockly data
            const show_google = connectedAccounts.length > 0; // Show Google if accounts connected

            const response = await getAllPlannerData({
                show_dockly,
                show_google,
                filtered_emails: filteredAccountEmails.length > 0 ? filteredAccountEmails : undefined
            });

            const payload = response.data.payload;

            // Process goals
            const rawGoals = payload.goals || [];
            const formattedGoals = rawGoals.map((item: any) => ({
                id: item.id,
                text: item.goal,
                completed: item.completed ?? item.goal_status === 2,
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
            }));
            setGoals(formattedGoals);

            // Process todos
            const rawTodos = payload.todos || [];
            const formattedTodos = rawTodos.map((item: any) => ({
                id: item.id,
                text: item.text,
                completed: item.completed ?? false,
                priority: item.priority || "medium",
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
                goal_id: item.goal_id,
            }));
            setTodos(formattedTodos);

            // Process events
            const rawEvents = payload.events || [];
            setCalendarEvents(transformEvents(rawEvents));

            // Process connected accounts
            const connectedAccountsData = payload.connected_accounts || [];
            setConnectedAccounts(connectedAccountsData);

            // Set up person colors
            const newPersonColors: { [key: string]: { color: string; email: string } } = {};
            connectedAccountsData.forEach((account: any) => {
                const colorToUse = account.provider === "dockly" ? PRIMARY_COLOR : account.color;
                newPersonColors[account.userName] = {
                    color: colorToUse,
                    email: account.email,
                };
            });
            setPersonColors(newPersonColors);

            // Set backup email
            if (connectedAccountsData.length > 0) {
                setBackup(connectedAccountsData[0].email);
            }

            // Process notes
            const rawNotes = payload.notes || [];
            setNotes(rawNotes);

            // Update filtered account emails if needed
            if (filteredAccountEmails.length === 0) {
                setFilteredAccountEmails(connectedAccountsData.map((acc: any) => acc.email));
            }

            // Show connect modal if no Google accounts connected
            if (connectedAccountsData.filter((acc: any) => acc.provider === 'google').length === 0) {
                setIsConnectAccountModalVisible(true);
            }

            if (preservedDate) {
                setCurrentDate(preservedDate);
            }

        } catch (error) {
            console.error("Error fetching planner data:", error);
            message.error("Failed to load planner data");
        } finally {
            // setLoading(false);
        }
    };

    const handleAddTodo = () => {
        // setLoading(true);
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
                await fetchAllPlannerData();
                setIsTodoModalVisible(false);
                setEditingTodo(null);
                todoForm.resetFields();
            } catch (error) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                // setLoading(false);
            }
        });
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

            await handleAddProjects(newProject);

            projectForm.resetFields();
            setIsProjectModalVisible(false);
        } catch (err) {
            console.error('Validation failed:', err);
        }
    };

    useEffect(() => {
        fetchAllPlannerData();
        fetchProjects();
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
                uid: userId,
                text: todo.text,
                date: todo.date,
                time: todo.time,
                priority: todo.priority,
                goal_id: todo.goal_id,
                completed: updatedCompleted,
                sync_to_google: false,
            });

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

    const filteredGoalsData2 = getFilteredGoals();
    const filteredTodosData2 = getFilteredTodos();
    const filteredCalendarEvents = getFilteredCalendarEvents();

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: COLORS.background,
            marginLeft: "40px",
            marginTop: "50px",
            fontFamily: FONT_FAMILY,
        }}>
            <div style={{
                padding: SPACING.lg,
                backgroundColor: COLORS.background,
                minHeight: "100vh",
            }}>
                <PlannerTitle
                    connectedAccounts={connectedAccounts}
                    onFilterChange={handleAccountFilterChange}
                    onConnectAccount={handleConnectAccount}
                />
                <Row gutter={[SPACING.lg, SPACING.lg]} style={{ marginBottom: SPACING.lg }}>
                    <Col span={6}>
                        <StatisticsCard
                            title="Goals"
                            value={filteredGoalsData2.length}
                            icon={<TrophyOutlined style={{ fontSize: '14px' }} />}
                            color={COLORS.success}
                        />
                    </Col>
                    <Col span={6}>
                        <StatisticsCard
                            title="Tasks Progress"
                            value={completedTodos}
                            total={filteredTodosData2.length}
                            icon={<CheckSquareOutlined style={{ fontSize: '14px' }} />}
                            color={COLORS.warning}
                        />
                    </Col>
                    <Col span={6}>
                        <StatisticsCard
                            title="Active Projects"
                            value={projects.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0)}
                            total={projects.reduce((acc, p) => acc + p.tasks.length, 0)}
                            icon={<ProjectOutlined style={{ fontSize: '14px' }} />}
                            color={COLORS.accent}
                        />
                    </Col>
                    <Col span={6}>
                        <StatisticsCard
                            title={`Calendar Events (${view})`}
                            value={getFilteredCalendarEvents().filter(event => {
                                const { start, end } = getDateRange(currentDate, view);
                                const startDay = dayjs(start).startOf("day");
                                const endDay = dayjs(end).endOf("day");

                                const eventStart = dayjs(event.start_date);
                                const eventEnd = dayjs(event.end_date);

                                return eventStart.isBefore(endDay) && eventEnd.isAfter(startDay);
                            }).length}
                            icon={<CalendarOutlined style={{ fontSize: '14px' }} />}
                            color={COLORS.secondary}
                        />
                    </Col>
                </Row>
                <Row gutter={[SPACING.sm, SPACING.sm]} style={{ marginBottom: SPACING.lg }}>
                    <Col span={17}>
                        <div style={{
                            background: COLORS.surface,
                            borderRadius: '16px',
                            border: `1px solid ${COLORS.borderLight}`,
                            boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
                            overflow: 'hidden',
                        }}>
                            <CustomCalendar
                                data={{ events: filteredCalendarEvents, meals: [] }}
                                personColors={personColors}
                                source="planner"
                                allowMentions={false}
                                fetchEvents={fetchAllPlannerData}
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
                            gap: SPACING.sm,
                        }}>
                            <div style={{
                                background: COLORS.surface,
                                borderRadius: '14px',
                                border: `1px solid ${COLORS.borderLight}`,
                                boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
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
                                borderRadius: '14px',
                                border: `1px solid ${COLORS.borderLight}`,
                                boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
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
                                        gap: SPACING.md,
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}dd)`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 2px 8px ${COLORS.success}20`,
                                        }}>
                                            <TrophyOutlined style={{ color: 'white', fontSize: '16px' }} />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
                                            <Text strong style={{ fontSize: '14px', color: COLORS.text, fontFamily: FONT_FAMILY }}>
                                                {getViewTitle("Goals")}
                                            </Text>
                                            <Badge
                                                count={`${filteredGoalsData2.length}`}
                                                style={{
                                                    backgroundColor: COLORS.success,
                                                    fontSize: '10px',
                                                    fontWeight: 500,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
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
                                                borderRadius: '6px',
                                                width: '28px',
                                                height: '28px',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '12px',
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
                                        padding: SPACING.md,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        fontFamily: FONT_FAMILY,
                                    }}>
                                        {[...filteredGoalsData2,
                                        ...Array(Math.max(3, filteredGoalsData2.length + 1) - filteredGoalsData2.length).fill({})]
                                            .map((goal, index) => (
                                                <div
                                                    key={goal.id || `empty-goal-${index}`}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        padding: SPACING.sm,
                                                        backgroundColor: COLORS.surfaceSecondary,
                                                        borderRadius: '8px',
                                                        border: goal?.id
                                                            ? `1px solid ${COLORS.success}20`
                                                            : `2px dashed ${COLORS.borderMedium}`,
                                                        marginBottom: SPACING.sm,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '22px',
                                                        height: '22px',
                                                        backgroundColor: goal?.id ? COLORS.success : COLORS.borderMedium,
                                                        color: goal?.id ? COLORS.surface : COLORS.textSecondary,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        marginRight: SPACING.xs,
                                                        flexShrink: 0,
                                                    }}>
                                                        {goal?.completed ? '✓' : index + 1}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        {goal?.id ? (
                                                            <>
                                                                <div style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: 500,
                                                                    color: goal.completed ? COLORS.textSecondary : COLORS.text,
                                                                    textDecoration: goal.completed ? 'line-through' : 'none',
                                                                    marginBottom: SPACING.xs,
                                                                    wordBreak: 'break-word',
                                                                    lineHeight: 1.3,
                                                                    fontFamily: FONT_FAMILY,
                                                                }}>
                                                                    {goal.text}
                                                                </div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: COLORS.textSecondary,
                                                                        fontWeight: 500,
                                                                        fontFamily: FONT_FAMILY,
                                                                    }}>
                                                                        {goal.date}
                                                                    </Text>
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        icon={<EditOutlined />}
                                                                        onClick={() => handleEditGoal(goal)}
                                                                        style={{
                                                                            fontSize: '10px',
                                                                            color: COLORS.textSecondary,
                                                                            padding: '2px 4px',
                                                                            borderRadius: '4px',
                                                                            width: '20px',
                                                                            height: '20px',
                                                                        }}
                                                                    />
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <Text
                                                                style={{
                                                                    color: COLORS.textTertiary,
                                                                    fontStyle: "italic",
                                                                    fontSize: '13px',
                                                                    cursor: "pointer",
                                                                    fontWeight: 500,
                                                                    fontFamily: FONT_FAMILY,
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
                                borderRadius: '14px',
                                border: `1px solid ${COLORS.borderLight}`,
                                boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
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
                                        gap: SPACING.md,
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}dd)`,
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 2px 8px ${COLORS.warning}20`,
                                        }}>
                                            <CheckSquareOutlined style={{ color: 'white', fontSize: '16px' }} />
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: '14px', color: COLORS.text, fontFamily: FONT_FAMILY }}>
                                                {getViewTitle("Tasks")}
                                            </Text>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: SPACING.xs,
                                                marginTop: '2px',
                                            }}>
                                                <Badge
                                                    count={`${completedTodos}/${filteredTodosData2.length}`}
                                                    style={{
                                                        backgroundColor: COLORS.warning,
                                                        fontSize: '10px',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                                {filteredTodosData2.length > 0 && (
                                                    <Progress
                                                        percent={Math.round((completedTodos / filteredTodosData2.length) * 100)}
                                                        strokeColor={COLORS.warning}
                                                        trailColor={COLORS.borderLight}
                                                        showInfo={false}
                                                        strokeWidth={3}
                                                        style={{ width: '40px' }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
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
                                                borderRadius: '6px',
                                                width: '28px',
                                                height: '28px',
                                                padding: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        />
                                        <span style={{
                                            fontSize: '12px',
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
                                        padding: SPACING.md,
                                        maxHeight: '220px',
                                        overflowY: 'auto',
                                        fontFamily: FONT_FAMILY,
                                    }}>
                                        {[...filteredTodosData2,
                                        ...Array(Math.max(3, filteredTodosData2.length + 1) - filteredTodosData2.length).fill({})]
                                            .map((todo, index) => (
                                                <div
                                                    key={todo.id || `empty-todo-${index}`}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        padding: SPACING.sm,
                                                        backgroundColor: COLORS.surfaceSecondary,
                                                        borderRadius: '8px',
                                                        border: todo?.id
                                                            ? `1px solid ${getPriorityColor(todo.priority)}20`
                                                            : `2px dashed ${COLORS.borderMedium}`,
                                                        marginBottom: SPACING.xs,
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                >
                                                    {todo?.id ? (
                                                        <>
                                                            <Checkbox
                                                                checked={todo.completed}
                                                                onChange={() => handleToggleTodo(todo.id)}
                                                                style={{
                                                                    marginRight: SPACING.xs,
                                                                    transform: 'scale(0.9)',
                                                                }}
                                                            />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: 500,
                                                                    color: todo.completed ? COLORS.textSecondary : COLORS.text,
                                                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                                                    marginBottom: SPACING.xs,
                                                                    wordBreak: 'break-word',
                                                                    lineHeight: 1.3,
                                                                    fontFamily: FONT_FAMILY,
                                                                }}>
                                                                    {todo.text}
                                                                </div>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: COLORS.textSecondary,
                                                                        fontWeight: 500,
                                                                        fontFamily: FONT_FAMILY,
                                                                    }}>
                                                                        {todo.date}
                                                                    </Text>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: SPACING.xs,
                                                                    }}>
                                                                        <div style={{
                                                                            width: '6px',
                                                                            height: '6px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: getPriorityColor(todo.priority),
                                                                        }} />
                                                                        <Button
                                                                            type="text"
                                                                            size="small"
                                                                            icon={<EditOutlined />}
                                                                            onClick={() => handleEditTodo(todo)}
                                                                            style={{
                                                                                fontSize: '10px',
                                                                                color: COLORS.textSecondary,
                                                                                padding: '2px 4px',
                                                                                borderRadius: '4px',
                                                                                width: '20px',
                                                                                height: '20px',
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
                                                                fontSize: '13px',
                                                                cursor: "pointer",
                                                                paddingLeft: SPACING.sm,
                                                                fontWeight: 500,
                                                                fontFamily: FONT_FAMILY,
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
                <Row gutter={[SPACING.xs, SPACING.xs]}>
                    <Col span={17}>
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
                    <Col span={7}>
                        <NotesLists currentHub="planner" />
                        {/* <div style={{ marginLeft: '0px' }}>
                        </div> */}
                    </Col>
                </Row>

                {/* Modals */}
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
                            gap: SPACING.xs,
                            fontSize: '16px',
                            fontWeight: 600,
                            fontFamily: FONT_FAMILY,
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CalendarOutlined style={{ color: 'white', fontSize: '14px' }} />
                            </div>
                            Add New Event
                        </div>
                    }
                    open={isEventModalVisible}
                    onCancel={() => setIsEventModalVisible(false)}
                    footer={[
                        <Button
                            key="cancel"
                            onClick={() => setIsEventModalVisible(false)}
                            style={{
                                borderRadius: '6px',
                                height: '36px',
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleAddEvent}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '6px',
                                height: '36px',
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            Add Event
                        </Button>,
                    ]}
                    width={500}
                >
                    <Form form={eventForm} layout="vertical" style={{ marginTop: SPACING.sm, fontFamily: FONT_FAMILY }}>
                        <Form.Item
                            name="title"
                            label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Event Title</Text>}
                            rules={[{ required: true, message: "Please enter the event title" }]}
                        >
                            <Input
                                placeholder="Event title"
                                style={{
                                    borderRadius: '6px',
                                    height: '36px',
                                    fontSize: '13px',
                                    fontFamily: FONT_FAMILY,
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="date"
                            label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Date</Text>}
                            rules={[{ required: true, message: "Please select a date" }]}
                            initialValue={dayjs()}
                        >
                            <DatePicker
                                style={{
                                    width: "100%",
                                    borderRadius: '6px',
                                    height: '36px',
                                    fontFamily: FONT_FAMILY,
                                }}
                                disabledDate={(current) => current && current < dayjs().startOf("day")}
                            />
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Time</Text>}
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
                                    borderRadius: '6px',
                                    height: '36px',
                                    fontFamily: FONT_FAMILY,
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
                            gap: SPACING.xs,
                            fontSize: '16px',
                            fontWeight: 600,
                            fontFamily: FONT_FAMILY,
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}dd)`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <TrophyOutlined style={{ color: 'white', fontSize: '14px' }} />
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
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsGoalModalVisible(false);
                            setEditingGoal(null);
                            goalForm.resetFields();
                        }}
                            style={{
                                borderRadius: '6px',
                                height: '36px',
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                            }}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleAddGoal}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '6px',
                                height: '36px',
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            {editingGoal ? "Update Goal" : "Add Goal"}
                        </Button>,
                    ]}
                    width={500}
                >
                    <Form form={goalForm} layout="vertical" style={{ marginTop: SPACING.sm, fontFamily: FONT_FAMILY }}>
                        <Form.Item
                            name="goal"
                            label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Goal</Text>}
                            rules={[{ required: true, message: "Please enter your goal" }]}
                        >
                            <Input
                                placeholder="Enter your Goal.."
                                style={{
                                    borderRadius: '6px',
                                    height: '36px',
                                    fontSize: '13px',
                                    fontFamily: FONT_FAMILY,
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="date"
                            label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Due Date</Text>}
                            rules={[{ required: true, message: "Please select a due date" }]}
                            initialValue={dayjs(getDueDateByView(view, currentDate))}
                        >
                            <DatePicker
                                format="YYYY-MM-DD"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                style={{ borderRadius: '6px', height: '36px', width: '100%', fontFamily: FONT_FAMILY }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: SPACING.xs,
                            fontSize: '16px',
                            fontWeight: 600,
                            fontFamily: FONT_FAMILY,
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}dd)`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <CheckSquareOutlined style={{ color: 'white', fontSize: '14px' }} />
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
                    footer={[
                        <Button key="cancel" onClick={() => {
                            setIsTodoModalVisible(false);
                            setEditingTodo(null);
                            todoForm.resetFields();
                        }}
                            style={{
                                borderRadius: '6px',
                                height: '36px',
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                            }}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleAddTodo}
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '6px',
                                height: '36px',
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                            }}
                        >
                            {editingTodo ? "Update Task" : "Add Task"}
                        </Button>,
                    ]}
                    width={500}
                >
                    <Form form={todoForm} layout="vertical" style={{ marginTop: SPACING.sm, fontFamily: FONT_FAMILY }}>
                        <Form.Item
                            name="text"
                            label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Task</Text>}
                            rules={[{ required: true, message: "Please enter the task" }]}
                        >
                            <Input
                                placeholder="Task title"
                                style={{ borderRadius: '6px', height: '36px', fontSize: '13px', fontFamily: FONT_FAMILY }}
                            />
                        </Form.Item>

                        <Space direction="horizontal" style={{ width: '100%' }}>
                            <Form.Item
                                name="date"
                                label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Due Date</Text>}
                                rules={[{ required: true, message: "Please select due date" }]}
                                initialValue={dayjs(getDueDateByView(view, currentDate))}
                            >
                                <DatePicker
                                    format="YYYY-MM-DD"
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    style={{ borderRadius: '6px', height: '36px', fontFamily: FONT_FAMILY }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="goal_id"
                                label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Goal</Text>}
                            >
                                <Select
                                    placeholder="Select a goal (optional)"
                                    allowClear
                                    style={{ borderRadius: '6px', minWidth: '180px', height: '36px', fontFamily: FONT_FAMILY }}
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
                            label={<Text strong style={{ fontSize: '13px', fontFamily: FONT_FAMILY }}>Priority</Text>}
                            rules={[{ required: true, message: "Please select a priority" }]}
                            initialValue="medium"
                        >
                            <Select style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}>
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