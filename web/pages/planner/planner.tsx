"use client";
import React, { useState } from "react";
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
} from "antd";
import { CalendarOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FilterOutlined, GoogleOutlined, MailOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { addProject, addTask, getProjects, getTasks, updateTask } from "../../services/family";
import dayjs from "dayjs";
import { addEvents, addPlannerNotes, addWeeklyGoal, addWeeklyTodo, deletePlannerNote, getPlanner, getPlannerNotes, updatePlannerNote, updateWeeklyGoal, updateWeeklyTodo } from "../../services/planner";
import { getCalendarEvents } from "../../services/google";
import DocklyLoader from "../../utils/docklyLoader";
import { Calendar } from "lucide-react";
import { showNotification } from "../../utils/notification";

import MiniCalendar from "../../pages/components/miniCalendar";
import CustomCalendar from "../../pages/components/customCalendar";
import FamilyTasksComponent from "../../pages/components/familyTasksProjects";
// import CalendarAccountFilter from "../components/CalendarAccountFilter";
// import ConnectAccountModal from "../components/ConnectAccountModal";
import { useCurrentUser } from "../../app/userContext";
import { PRIMARY_COLOR } from "../../app/comman";
import { API_URL } from "../../services/apiConfig";
import { useParams, useRouter } from "next/navigation";

const { Title, Text } = Typography;

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

const PlannerTitle: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
            }}
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#ecfdf5',
                    color: '#10b981',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '6px',
                }}
            >
                <Calendar size={24} />
            </div>
            <h1
                style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0,
                }}
            >
                Planner
            </h1>
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
    const [editingGoal, setEditingGoal] = useState<
        | ({
            id: string;
            text: string;
            completed: boolean;
            priority: "high" | "medium" | "low";
            date: string;
            time: string;
            goal_id?: string;
        })
        | null
    >(null);
    const [editingTodo, setEditingTodo] = useState<
        | ({
            id: string;
            text: string;
            completed: boolean;
            priority: "high" | "medium" | "low";
            date: string;
            time: string;
            goal_id?: string;
        })
        | null
    >(null);
    const [calendarEvents, setCalendarEvents] = useState<
        {
            id: string;
            title: string;
            startTime: string;
            endTime: string;
            date: string;
            person: string;
            color: string;
            is_all_day?: boolean;
            start_date?: string;
            end_date?: string;
            source_email?: string;
            provider?: string;
        }[]
    >([]);

    const [connectedAccounts, setConnectedAccounts] = useState<
        {
            userName: string;
            email: string;
            displayName: string;
            accountType: string;
            provider: string;
            color: string;
        }[]
    >([]);

    const [filteredAccountEmails, setFilteredAccountEmails] = useState<string[]>([]);
    const [personColors, setPersonColors] = useState<{ [person: string]: { color: string; email: string } }>({});

    // New state for mini calendar integration
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
    const [showAllNotes, setShowAllNotes] = useState(false);
    const [editingNote, setEditingNote] = useState<{ id: string; title: string; description: string } | null>(null);
    // Handle edit
    const handleEditNote = (note: { id: string; title: string; description: string }) => {
        noteForm.setFieldsValue({ title: note.title, description: note.description });
        setEditingNote(note);
        setIsNoteModalVisible(true);
    };

    // Handle delete
    const handleDeleteNote = async (id: string) => {
        try {
            await deletePlannerNote(id); // assumes you have this API
            message.success("Note deleted");
            fetchNotes(); // refresh
        } catch (err) {
            message.error("Failed to delete note");
        }
    };
    const params = useParams();
    const username = params?.username;
    // Filter notes to show
    const visibleNotes = showAllNotes ? notes : notes.slice(0, 3);

    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
    const [noteForm] = Form.useForm();


    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "error";
            case "medium":
                return "warning";
            case "low":
                return "default";
            default:
                return "default";
        }
    };

    // Helper function to format date consistently
    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to get start and end dates based on view
    const getDateRange = (date: Date, viewType: string) => {
        const start = new Date(date);
        const end = new Date(date);

        switch (viewType) {
            case "Day":
                // Same day
                break;
            case "Week":
                // Start of week (Sunday) to end of week (Saturday)
                const dayOfWeek = start.getDay();
                start.setDate(start.getDate() - dayOfWeek);
                end.setDate(start.getDate() + 6);
                break;
            case "Month":
                // Start of month to end of month
                start.setDate(1);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                break;
            case "Year":
                // Start of year to end of year
                start.setMonth(0, 1);
                end.setMonth(11, 31);
                break;
        }

        return { start, end };
    };

    // Filter goals based on current view and date
    const getFilteredGoals = () => {
        const { start, end } = getDateRange(currentDate, view);
        const startStr = formatDateString(start);
        const endStr = formatDateString(end);

        return goals.filter(goal => {
            return goal.date >= startStr && goal.date <= endStr;
        });
    };

    // Filter todos based on current view and date
    const getFilteredTodos = () => {
        const { start, end } = getDateRange(currentDate, view);
        const startStr = formatDateString(start);
        const endStr = formatDateString(end);

        return todos.filter(todo => {
            return todo.date >= startStr && todo.date <= endStr;
        });
    };

    const fetchNotes = async () => {
        try {
            const res = await getPlannerNotes();
            if (res.data.status === 1) {
                setNotes(res.data.payload || []);
            } else {
                setNotes([]); // fallback
                message.error("Failed to fetch notes");
            }
        } catch (err) {
            console.error(err);
            setNotes([]); // fallback
            message.error("Something went wrong");
        }
    };

    // Get available goals for todo selection based on current view
    const getAvailableGoals = () => {
        return getFilteredGoals();
    };

    // Get view title for goals and todos sections
    const getViewTitle = (type: 'Goals' | 'Tasks') => {
        switch (view) {
            case "Day":
                return `Daily ${type}`;
            case "Week":
                return `Weekly ${type}`;
            case "Month":
                return `Monthly ${type}`;
            default:
                return `Weekly ${type}`;
        }
    };

    // Filter calendar events based on selected accounts
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
        // Redirect to Google OAuth
        window.location.href = `${API_URL}/add-googleCalendar?username=${user?.user_name}&userId=${user?.uid}`;
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
                fetchEvents();
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
    }) => {
        setLoading(true);
        try {
            await addProject({ ...project, source: 'planner' });
            fetchProjects();
        } catch {
            // Handle error
        }
        setLoading(false);
    };

    const handleAddTask = async (projectId: string) => {
        setLoading(true);
        try {
            await addTask({
                project_id: projectId,
                title: 'New Task',
                assignee: 'All',
                type: 'low',
                due_date: dayjs().format('YYYY-MM-DD'),
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
                        color: proj.color || '#667eea',
                        progress: tasks.length
                            ? Math.round((tasks.filter((t: Task) => t.completed).length / tasks.length) * 100)
                            : 0,
                        tasks,
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
        const getWeekEndDate = () => {
            const day = activeDate.getDay();
            const diff = 6 - day;
            const weekend = new Date(activeDate);
            weekend.setDate(activeDate.getDate() + diff);
            return dayjs(weekend).format("YYYY-MM-DD");
        };

        const getMonthEndDate = () => {
            const year = activeDate.getFullYear();
            const month = activeDate.getMonth();
            const lastDay = new Date(year, month + 1, 0);
            return dayjs(lastDay).format("YYYY-MM-DD");
        };

        return activeView === "Month" ? getMonthEndDate() : getWeekEndDate();
    };



    const handleAddGoal = async () => {
        setLoading(true);
        goalForm.validateFields().then(async (values) => {
            try {
                const date = getDueDateByView(view, currentDate);  // 👈 pass explicitly
                const time = dayjs().format("h:mm A");

                const goalPayload = {
                    ...values,
                    date,
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
                showNotification(status ? "Success" : "Error", msg, status ? "success" : "error");

                getUserPlanner();
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
    const getUserPlanner = async () => {
        setLoading(true);
        try {
            const response = await getPlanner({});

            const rawGoals = response.data.payload.goals;
            const rawTodos = response.data.payload.todos;
            const rawEvents = response.data.payload.events;

            // setCalendarEvents(prev => [
            //     ...(prev),
            //     ...transformEvents(rawEvents),
            // ]);

            // setPersonColors(prev => ({
            //     ...prev,
            //     [user.user_name]: {
            //         email: user.email,
            //     },
            // }));

            const formattedGoals = rawGoals.map((item: any) => ({
                id: item.id,
                text: item.goal,
                completed: item.goal_status === 1,
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
            }));

            const formattedTodos = rawTodos.map((item: any) => ({
                id: item.id,
                text: item.text,
                completed: item.todo_status,
                priority: item.priority || "medium",
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
                goal_id: item.goal_id,
            }));

            setGoals(formattedGoals);
            setTodos(formattedTodos);
        } catch (error) {
            console.error("Error fetching goals:", error);
        }
        setLoading(false);
    };

    const handleAddTodo = () => {
        setLoading(true);
        todoForm.validateFields().then(async (values) => {
            try {
                const date = getDueDateByView(view, currentDate); // Week or month end
                const time = dayjs().format("h:mm A");

                const todoPayload = {
                    ...values,
                    date,
                    time,
                    backup: backup,
                };

                let response;
                if (editingTodo) {
                    response = await updateWeeklyTodo({ id: editingTodo.id, ...todoPayload });
                } else {
                    response = await addWeeklyTodo(todoPayload);
                }

                const { message: msg, status } = response.data;
                showNotification(status ? "Success" : "Error", msg, status ? "success" : "error");

                getUserPlanner();
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

            console.log("🚀 ~ fetchEvents ~ response:", response);
            console.log("🚀 ~ fetchEvents ~ connectedAccounts:", connectedAccountsData);

            // Set connected accounts
            setConnectedAccounts(connectedAccountsData);

            // Initialize filtered emails with all accounts
            if (filteredAccountEmails.length === 0) {
                setFilteredAccountEmails(connectedAccountsData.map((acc: any) => acc.email));
            }

            // Update person colors for each connected account
            const newPersonColors: { [key: string]: { color: string; email: string } } = {};
            connectedAccountsData.forEach((account: any) => {
                newPersonColors[account.userName] = {
                    color: account.color,
                    email: account.email,
                };
            });

            setPersonColors(prev => ({
                ...prev,
                ...newPersonColors,
            }));

            // Set backup if we have connected accounts
            if (connectedAccountsData.length > 0) {
                setBackup(connectedAccountsData[0].email);
            }

            // Transform and set events
            if (rawEvents.length > 0) {
                const transformedEvents = transformEvents(rawEvents);
                setCalendarEvents(prev => [
                    // ...prev,
                    ...transformedEvents,
                ]);
            }

            // Show connect account modal if no accounts connected
            if (connectedAccountsData.length === 0) {
                setIsConnectAccountModalVisible(true);
            }

        } catch (error) {
            console.error('Error fetching events:', error);
            // Show connect account modal on error (likely no accounts)
            setIsConnectAccountModalVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const transformEvents = (rawEvents: any[]): any[] => {
        return rawEvents.map((event, index) => {
            const startDateTime = event.start?.dateTime ?? null;
            const endDateTime = event.end?.dateTime ?? null;
            const startDate = event.start?.date ?? null;
            const endDate = event.end?.date ?? null;
            const creatorEmail = event.creator?.email || event.source_email || "Unknown";

            const isGoogleEvent = event.kind === "calendar#event";

            const start = startDateTime
                ? dayjs(startDateTime)
                : startDate
                    ? dayjs(startDate)
                    : null;

            let end: dayjs.Dayjs | null = null;

            if (endDateTime) {
                end = dayjs(endDateTime);
            } else if (endDate) {
                end = isGoogleEvent
                    ? dayjs(endDate).subtract(1, "day")
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
                color: event.account_color || event.color || "#10B981",
                is_all_day: isAllDay,
                start_date: formattedStart,
                end_date: formattedEnd,
                source_email: event.source_email || creatorEmail,
                provider: event.provider || "google",
            };
        });
    };

    useEffect(() => {
        fetchEvents();
        getUserPlanner();
        fetchProjects();
        fetchNotes();
    }, []);

    const handleAddProject = () => {
        projectForm.validateFields().then((values) => {
            setProjects([
                ...projects,
                {
                    project_id: Date.now().toString(),
                    title: values.title,
                    description: values.category,
                    due_date: values.dueDate.format("YYYY-MM-DD"),
                    color: "#667eea",
                    progress: 0,
                    tasks: [],
                },
            ]);
            projectForm.resetFields();
            setIsProjectModalVisible(false);
        });
    };

    const handleCancelEvent = () => {
        eventForm.resetFields();
        setIsEventModalVisible(false);
    };

    const handleCancelGoal = () => {
        goalForm.resetFields();
        setIsGoalModalVisible(false);
        setEditingGoal(null);
    };

    const handleCancelTodo = () => {
        todoForm.resetFields();
        setIsTodoModalVisible(false);
        setEditingTodo(null);
    };

    const handleCancelProject = () => {
        projectForm.resetFields();
        setIsProjectModalVisible(false);
    };

    const handleToggleTodo = (id: string) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
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

    // Handler for mini calendar date selection
    const handleDateSelect = (date: Date) => {
        setCurrentDate(date);
    };

    // Handler for mini calendar month change
    const handleMiniCalendarMonthChange = (date: Date) => {
        setCurrentDate(date);
    };

    // Handler for main calendar date change
    const handleMainCalendarDateChange = (date: Date) => {
        setCurrentDate(date);
    };

    // Handler for main calendar view change
    const handleMainCalendarViewChange = (newView: "Day" | "Week" | "Month" | "Year") => {
        setView(newView);

        // 👇 Update currentDate context when switching view
        const newDate = new Date(currentDate);
        if (newView === "Month") {
            newDate.setDate(1); // Start of month
        } else if (newView === "Week") {
            const day = newDate.getDay();
            newDate.setDate(newDate.getDate() - day); // Start of week (Sunday)
        }
        setCurrentDate(newDate);
    };


    if (loading) {
        return <DocklyLoader />;
    }

    // Get filtered data based on current view
    const filteredGoals = getFilteredGoals();
    const filteredTodos = getFilteredTodos();
    const filteredCalendarEvents = getFilteredCalendarEvents();

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#f7f8fa",
                marginLeft: "50px",
                marginTop: "60px",
            }}
        >
            <div
                style={{
                    padding: "16px",
                    backgroundColor: "#f7f8fa",
                    minHeight: "100vh",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                    }}
                >
                    <PlannerTitle />
                </div>

                {/* Account Filter Component */}
                <CalendarAccountFilter
                    connectedAccounts={connectedAccounts}
                    onFilterChange={handleAccountFilterChange}
                    onConnectAccount={handleConnectAccount}
                />

                <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                    <Col span={16}>
                        <div
                            style={{
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <CustomCalendar
                                data={{ events: filteredCalendarEvents, meals: [] }}
                                personColors={personColors}
                                source="planner"
                                allowMentions={false}
                                fetchEvents={fetchEvents}
                                goals={filteredGoals}
                                todos={filteredTodos}
                                onToggleTodo={handleToggleTodo}
                                onAddGoal={() => setIsGoalModalVisible(true)}
                                onAddTodo={() => setIsTodoModalVisible(true)}
                                enabledHashmentions={false}
                                currentDate={currentDate}
                                onDateChange={handleMainCalendarDateChange}
                                onViewChange={handleMainCalendarViewChange}
                                setCurrentDate={setCurrentDate}
                                setBackup={setBackup}
                                backup={backup}
                                connectedAccounts={connectedAccounts || []}
                            />
                        </div>
                    </Col>
                    <Col span={8}>
                        <div
                            style={{
                                padding: "12px 2px",
                                marginTop: "-13px",
                            }}
                        >
                            <MiniCalendar
                                currentDate={currentDate}
                                onDateSelect={handleDateSelect}
                                onMonthChange={handleMiniCalendarMonthChange}
                                events={filteredCalendarEvents}
                                view={view}
                            />
                        </div>

                        <Card
                            title={getViewTitle("Goals")}
                            extra={
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsGoalModalVisible(true)}
                                />
                            }
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                height: "260px",
                                marginBottom: 8,
                                display: "flex",
                                flexDirection: "column",
                                marginTop: "-5px",
                            }}
                        >
                            <div
                                style={{
                                    overflowY: "auto",
                                    height: "220px",
                                    paddingBottom: 24,
                                }}
                            >
                                {[
                                    ...filteredGoals,
                                    ...Array(Math.max(3, filteredGoals.length + 1) - filteredGoals.length).fill(
                                        {}
                                    ),
                                ].map((goal, index) => (
                                    <div
                                        key={goal.id || `empty-goal-${index}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            padding: 8,
                                            backgroundColor: goal?.id ? "white" : "#f5f5f5",
                                            borderRadius: 8,
                                            borderLeft: goal?.id
                                                ? "3px solid #10b981"
                                                : "1px dashed #d1d5db",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 24,
                                                height: 24,
                                                backgroundColor: goal?.id ? "#10b981" : "#d1d5db",
                                                color: goal?.id ? "white" : "#6b7280",
                                                borderRadius: "50%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 12,
                                                fontWeight: 600,
                                                marginRight: 12,
                                            }}
                                        >
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            {goal?.id ? (
                                                <>
                                                    <Input
                                                        value={goal.text}
                                                        onChange={(e) =>
                                                            setGoals(
                                                                goals.map((g) =>
                                                                    g.id === goal.id
                                                                        ? { ...g, text: e.target.value }
                                                                        : g
                                                                )
                                                            )
                                                        }
                                                        style={{
                                                            border: "none",
                                                            backgroundColor: "transparent",
                                                            fontSize: 14,
                                                            padding: "2px 6px",
                                                        }}
                                                    />
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Text style={{ fontSize: 12, color: "#6b7280" }}>
                                                            {goal.date} {goal.time}
                                                        </Text>
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<EditOutlined />}
                                                            onClick={() => handleEditGoal(goal)}
                                                            style={{ fontSize: 10 }}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <Text
                                                    style={{
                                                        color: "#9ca3af",
                                                        fontStyle: "italic",
                                                        paddingLeft: 6,
                                                        cursor: "pointer",
                                                        marginTop: 4
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
                        </Card>
                        <Card
                            title={getViewTitle("Tasks")}
                            extra={
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsTodoModalVisible(true)}
                                />
                            }
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                height: "260px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    overflowY: "auto",
                                    height: "220px",
                                    paddingBottom: 24,
                                }}
                            >
                                {[
                                    ...filteredTodos,
                                    ...Array(Math.max(3, filteredTodos.length + 1) - filteredTodos.length).fill(
                                        {}
                                    ),
                                ].map((todo, index) => (
                                    <div
                                        key={todo.id || `empty-todo-${index}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "8px 0",
                                            borderBottom: "1px solid #f3f4f6",
                                            backgroundColor: todo?.id ? "white" : "#f5f5f5",
                                            paddingLeft: 8,
                                            borderRadius: 6,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {todo?.id ? (
                                            <>
                                                <Checkbox
                                                    checked={todo.completed}
                                                    onChange={() => handleToggleTodo(todo.id)}
                                                    style={{ marginRight: 12 }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <Text
                                                        style={{
                                                            fontSize: 14,
                                                            color: "#374151",
                                                            textDecoration: todo.completed
                                                                ? "line-through"
                                                                : "none",
                                                            opacity: todo.completed ? 0.6 : 1,
                                                            padding: "2px 6px",
                                                        }}
                                                    >
                                                        {todo.text}
                                                    </Text>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Text style={{ fontSize: 12, color: "#6b7280" }}>
                                                            {todo.date} {todo.time}
                                                        </Text>
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={<EditOutlined />}
                                                            onClick={() => handleEditTodo(todo)}
                                                            style={{ fontSize: 10 }}
                                                        />
                                                    </div>
                                                </div>
                                                <Tag color={getPriorityColor(todo.priority)}>
                                                    {todo.priority}
                                                </Tag>
                                            </>
                                        ) : (
                                            <Text
                                                style={{
                                                    color: "#9ca3af",
                                                    fontStyle: "italic",
                                                    fontSize: 14,
                                                    paddingLeft: 6,
                                                    cursor: "pointer",
                                                    marginTop: 4
                                                }}
                                                onClick={() => setIsTodoModalVisible(true)}
                                            >
                                                Add Task {index + 1}
                                            </Text>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[8, 8]}>
                    <Col span={16}>
                        <FamilyTasksComponent
                            title="Projects"
                            projects={projects}
                            onAddProject={handleAddProjects}
                            onAddTask={handleAddTask}
                            onToggleTask={handleToggleTask}
                            onUpdateTask={handleUpdateTask}
                            showAssigneeInputInEdit={false}
                            showAvatarInTask={false}
                        />
                    </Col>
                    <Col span={8}>
                        <Card
                            title="Notes"
                            extra={
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setEditingNote(null); // clear editing state
                                        setIsNoteModalVisible(true);
                                    }}
                                />
                            }
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                height: showAllNotes ? "auto" : "430px", // dynamic height if expanded
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    overflowY: "auto",
                                    maxHeight: showAllNotes ? "none" : "320px",
                                    paddingBottom: 24,
                                }}
                            >
                                {[...notes]
                                    .sort(
                                        (a, b) =>
                                            new Date(b.created_at || "").getTime() -
                                            new Date(a.created_at || "").getTime()
                                    )
                                    .slice(0, 3)
                                    .concat(Array(Math.max(0, 3 - notes.length)).fill({}))
                                    .map((note, index) => (
                                        <div
                                            key={note.id || `empty-note-${index}`}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                padding: 8,
                                                backgroundColor: note?.id ? "white" : "#f5f5f5",
                                                borderRadius: 8,
                                                borderLeft: note?.id
                                                    ? "3px solid #10b981"
                                                    : "1px dashed #d1d5db",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    backgroundColor: note?.id ? "#10b981" : "#d1d5db",
                                                    color: note?.id ? "white" : "#6b7280",
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    marginRight: 12,
                                                }}
                                            >
                                                {index + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                {note?.id ? (
                                                    <>
                                                        <Text
                                                            style={{
                                                                fontSize: 14,
                                                                color: "#374151",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {note.title}
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                fontSize: 12,
                                                                color: "#6b7280",
                                                                display: "block",
                                                            }}
                                                        >
                                                            {note.description}
                                                        </Text>
                                                    </>
                                                ) : (
                                                    <Text
                                                        style={{
                                                            color: "#9ca3af",
                                                            fontStyle: "italic",
                                                            paddingLeft: 6,
                                                        }}
                                                    >
                                                        Add Note {index + 1}
                                                    </Text>
                                                )}
                                            </div>
                                            {/* {note?.id && (
                        <div style={{ marginLeft: 8, display: "flex", gap: 8 }}>
                            <EditOutlined
                            onClick={() => handleEditNote(note)}
                            style={{ color: "#1890ff", cursor: "pointer" }}
                            />
                            <DeleteOutlined
                            onClick={() => handleDeleteNote(note.id)}
                            style={{ color: "#f5222d", cursor: "pointer" }}
                            />
                        </div>
                        )} */}
                                        </div>
                                    ))}
                            </div>


                            {/* View More / View Less toggle */}
                            {notes.length > 0 && (
                                <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                                    <Button
                                        type="link"
                                        icon={<EyeOutlined />}
                                        onClick={() => router.push(`/${username}/notes?category=PLANNER`)}
                                        style={{ fontWeight: 500 }}
                                    >
                                        View More
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>


                {/* Connect Account Modal */}
                <ConnectAccountModal
                    isVisible={isConnectAccountModalVisible}
                    onClose={() => setIsConnectAccountModalVisible(false)}
                    onConnect={handleConnectAccount}
                />

                {/* Existing modals remain the same */}
                <Modal
                    title="Add New Event"
                    open={isEventModalVisible}
                    onCancel={handleCancelEvent}
                    maskClosable={!loading}
                    closable={!loading}
                    footer={[
                        <Button key="cancel" onClick={handleCancelEvent} disabled={loading}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleAddEvent}
                            disabled={loading}
                        >
                            Add Event
                        </Button>,
                    ]}
                >
                    <Form form={eventForm} layout="vertical">
                        <Form.Item
                            name="title"
                            label="Event Title"
                            rules={[
                                { required: true, message: "Please enter the event title" },
                            ]}
                        >
                            <Input placeholder="Event title" />
                        </Form.Item>
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: "Please select a date" }]}
                            initialValue={dayjs()}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                disabledDate={(current) => current && current < dayjs().startOf("day")}
                            />
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label="Time"
                            rules={[{ required: true, message: "Please select a time" }]}
                            initialValue={dayjs().add(10, "minute").startOf("minute")}
                        >
                            <TimePicker
                                use12Hours
                                format="h:mm A"
                                minuteStep={10}
                                showSecond={false}
                                style={{ width: "100%" }}
                                disabledTime={() => {
                                    const selectedDate = eventForm.getFieldValue("date");
                                    const now = dayjs();

                                    if (selectedDate && dayjs(selectedDate).isSame(now, 'day')) {
                                        const currentHour = now.hour();
                                        const currentMinute = now.minute();

                                        return {
                                            disabledHours: () =>
                                                Array.from({ length: 24 }, (_, i) => i).filter((h) => h < currentHour),
                                            disabledMinutes: (selectedHour: number) => {
                                                if (selectedHour === currentHour) {
                                                    return Array.from({ length: 60 }, (_, i) => i).filter((m) => m < currentMinute);
                                                }
                                                return [];
                                            },
                                        };
                                    }

                                    return {
                                        disabledHours: () => [],
                                        disabledMinutes: () => [],
                                    };
                                }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Add New Note"
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
                        >
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
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

                        >
                            Add Note
                        </Button>


                    ]}
                >
                    <Form form={noteForm} layout="vertical">
                        <Form.Item
                            name="title"
                            label="Note Title"
                            rules={[{ required: true, message: "Please enter the note title" }]}
                        >
                            <Input placeholder="Note title" />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[
                                { required: true, message: "Please enter the note description" },
                            ]}
                        >
                            <Input.TextArea rows={3} placeholder="Note description" />
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    open={showAllNotes}
                    onCancel={() => setShowAllNotes(false)}
                    footer={null}
                    title="All Notes"
                    width={600}
                >
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {notes.map((note, index) => (
                            <div
                                key={note.id}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    padding: 8,
                                    backgroundColor: "white",
                                    borderRadius: 8,
                                    borderLeft: "3px solid #10b981",
                                    marginBottom: 8,
                                }}
                            >
                                <div
                                    style={{
                                        width: 24,
                                        height: 24,
                                        backgroundColor: "#10b981",
                                        color: "white",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        marginRight: 12,
                                    }}
                                >
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
                                        {note.title}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: "#6b7280", display: "block" }}>
                                        {note.description}
                                    </Text>
                                </div>
                                <div style={{ marginLeft: 8, display: "flex", gap: 8 }}>
                                    <EditOutlined
                                        onClick={() => {
                                            setShowAllNotes(false);
                                            handleEditNote(note);
                                        }}
                                        style={{ color: "#1890ff", cursor: "pointer" }}
                                    />
                                    <DeleteOutlined
                                        onClick={() => handleDeleteNote(note.id)}
                                        style={{ color: "#f5222d", cursor: "pointer" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal>
                <Modal
                    title={editingGoal ? "Edit Goal" : "Add New Goal"}
                    open={isGoalModalVisible}
                    onCancel={handleCancelGoal}
                    maskClosable={!loading}
                    closable={!loading}
                    footer={[
                        <Button key="cancel" onClick={handleCancelGoal} disabled={loading}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleAddGoal}
                            disabled={loading}
                        >
                            {editingGoal ? "Update Goal" : "Add Goal"}
                        </Button>,
                    ]}
                >
                    <Form form={goalForm} layout="vertical">
                        <Form.Item
                            name="goal"
                            label="goal"
                            rules={[
                                { required: true, message: "Please enter your goal" },
                            ]}
                        >
                            <Input placeholder="Enter your Goal.." />
                        </Form.Item>

                    </Form>
                </Modal>

                <Modal
                    title={editingTodo ? "Edit Task" : "Add New Task"}
                    open={isTodoModalVisible}
                    onCancel={handleCancelTodo}
                    maskClosable={!loading}
                    closable={!loading}
                    footer={[
                        <Button key="cancel" onClick={handleCancelTodo} disabled={loading}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleAddTodo}
                            disabled={loading}
                        >
                            {editingTodo ? "Update Task" : "Add Task"}
                        </Button>,
                    ]}
                >
                    <Form form={todoForm} layout="vertical">
                        <Form.Item
                            name="text"
                            label="Task"
                            rules={[{ required: true, message: "Please enter the task" }]}
                        >
                            <Input placeholder="Task title" />
                        </Form.Item>
                        <Form.Item
                            name="Goal_Id"
                            label="Goal_Id"
                            rules={[{ required: false, message: "Please select a goal" }]}
                        >
                            <Select placeholder="Select a goal (optional)" allowClear>
                                {getAvailableGoals().map((goal) => (
                                    <Select.Option key={goal.id} value={goal.id}>
                                        {goal.text}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="priority"
                            label="Priority"
                            rules={[{ required: true, message: "Please select a priority" }]}
                            initialValue="medium"
                        >
                            <Select>
                                <Select.Option value="low">Low</Select.Option>
                                <Select.Option value="medium">Medium</Select.Option>
                                <Select.Option value="high">High</Select.Option>
                            </Select>
                        </Form.Item>

                    </Form>
                </Modal>

                <Modal
                    title="Add New Project"
                    open={isProjectModalVisible}
                    onCancel={handleCancelProject}
                    footer={[
                        <Button key="cancel" onClick={handleCancelProject}>
                            Cancel
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleAddProject}
                            disabled={loading}
                        >
                            Add Project
                        </Button>,
                    ]}
                >
                    <Form form={projectForm} layout="vertical">
                        <Form.Item
                            name="title"
                            label="Project Title"
                            rules={[
                                { required: true, message: "Please enter the project title" },
                            ]}
                        >
                            <Input placeholder="Project title" />
                        </Form.Item>
                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[{ required: true, message: "Please enter the category" }]}
                        >
                            <Input placeholder="Category (e.g., Work, Personal)" />
                        </Form.Item>
                        <Form.Item
                            name="dueDate"
                            label="Due Date"
                            rules={[{ required: true, message: "Please select a due date" }]}
                            initialValue={dayjs()}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                disabledDate={(current) => current && current < dayjs().startOf("day")}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default Planner;



interface ConnectedAccount {
    provider: string;
    email: string;
    color: string;
    userName: string;
}

interface CalendarAccountFilterProps {
    connectedAccounts: ConnectedAccount[];
    onFilterChange: (filteredAccounts: string[]) => void;
    onConnectAccount: () => void;
}

const CalendarAccountFilter: React.FC<CalendarAccountFilterProps> = ({
    connectedAccounts,
    onFilterChange,
    onConnectAccount
}) => {
    const [activeFilters, setActiveFilters] = useState<string[]>(
        connectedAccounts.map(acc => acc.email)
    );
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const user = useCurrentUser();

    const handleFilterToggle = (email: string) => {
        const newFilters = activeFilters.includes(email)
            ? activeFilters.filter(f => f !== email)
            : [...activeFilters, email];

        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSelectAll = () => {
        const allEmails = connectedAccounts.map(acc => acc.email);
        setActiveFilters(allEmails);
        onFilterChange(allEmails);
    };

    const handleDeselectAll = () => {
        setActiveFilters([]);
        onFilterChange([]);
    };

    const FilterModalContent = () => (
        <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Button size="small" onClick={handleSelectAll}>Select All</Button>
                <Button size="small" onClick={handleDeselectAll}>Deselect All</Button>
            </div>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {connectedAccounts.map((account) => (
                    <div
                        key={account.email}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            background: activeFilters.includes(account.email) ?
                                `${account.color}10` : '#f8f9fa',
                            borderRadius: '8px',
                            border: `1px solid ${activeFilters.includes(account.email) ?
                                account.color : '#e9ecef'}`,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Avatar
                                size={32}
                                style={{ backgroundColor: account.color }}
                                icon={<GoogleOutlined />}
                            >
                                {account.email.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                                <Text strong>{account.email}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                                </Text>
                            </div>
                        </div>
                        <Switch
                            checked={activeFilters.includes(account.email)}
                            onChange={() => handleFilterToggle(account.email)}
                            style={{
                                backgroundColor: activeFilters.includes(account.email) ?
                                    account.color : undefined
                            }}
                        />
                    </div>
                ))}
            </Space>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={onConnectAccount}
                    style={{ width: '100%' }}
                >
                    Connect Another Account
                </Button>
            </div>
        </div>
    );

    if (connectedAccounts.length === 0) {
        return (
            <Card style={{ marginBottom: '16px', textAlign: 'center' }}>
                <GoogleOutlined style={{ fontSize: '48px', color: '#4285f4', marginBottom: '16px' }} />
                <Text style={{ display: 'block', marginBottom: '8px' }}>No Google accounts connected</Text>
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                    Connect your Google Calendar to see events
                </Text>
                <Button type="primary" icon={<GoogleOutlined />} onClick={onConnectAccount}>
                    Connect Google Account
                </Button>
            </Card>
        );
    }

    return (
        <Card style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text strong style={{ fontSize: '16px' }}>Connected Accounts</Text>
                <Space>
                    <Button
                        size="small"
                        icon={<FilterOutlined />}
                        onClick={() => setIsFilterModalVisible(true)}
                    >
                        Filter ({activeFilters.length})
                    </Button>
                    <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={onConnectAccount}
                    >
                        Add Account
                    </Button>
                </Space>
            </div>

            <Space wrap>
                {connectedAccounts.map((account) => (
                    <Tag
                        key={account.email}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: `2px solid ${account.color}`,
                            backgroundColor: activeFilters.includes(account.email) ?
                                `${account.color}15` : '#f8f9fa',
                            opacity: activeFilters.includes(account.email) ? 1 : 0.5,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => handleFilterToggle(account.email)}
                    >
                        <Avatar
                            size={20}
                            style={{ backgroundColor: account.color, marginRight: '8px' }}
                        >
                            {account.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text style={{ fontWeight: '500' }}>{account.email}</Text>
                    </Tag>
                ))}
            </Space>

            <Modal
                title={
                    <Space>
                        <SettingOutlined />
                        Account Filters
                    </Space>
                }
                open={isFilterModalVisible}
                onCancel={() => setIsFilterModalVisible(false)}
                footer={null}
                width={500}
            >
                <FilterModalContent />
            </Modal>
        </Card>
    );
};



interface ConnectAccountModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConnect: () => void;
}

const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
    isVisible,
    onClose,
    onConnect
}) => {
    const user = useCurrentUser();

    return (
        <Modal
            open={isVisible}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
        >
            <div style={{ textAlign: 'center', padding: '24px' }}>
                <CalendarOutlined style={{ fontSize: '64px', color: '#4285f4', marginBottom: '24px' }} />

                <Title level={3} style={{ marginBottom: '16px' }}>
                    Connect Your Google Calendar
                </Title>

                <Text style={{ display: 'block', marginBottom: '24px', color: '#666' }}>
                    To view and manage your calendar events, please connect your Google account.
                    You can connect multiple accounts to see all your events in one place.
                </Text>

                <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px'
                }}>
                    <Text style={{ fontSize: '14px' }}>
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
                            background: '#4285f4',
                            borderColor: '#4285f4'
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