
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
} from "antd";
import { EditOutlined, MailOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { addProject, addTask, getProjects, getTasks, updateTask } from "../../services/family";
import dayjs from "dayjs";
import { addEvents, addWeeklyGoal, addWeeklyTodo, getPlanner, updateWeeklyGoal, updateWeeklyTodo } from "../../services/planner";
import { getCalendarEvents } from "../../services/google";
import DocklyLoader from "../../utils/docklyLoader";
import { Calendar } from "lucide-react";
import { showNotification } from "../../utils/notification";

import MiniCalendar from "../../pages/components/miniCalendar";
import CustomCalendar from "../../pages/components/customCalendar";
import FamilyTasksComponent from "../../pages/components/familyTasksProjects";
import { useCurrentUser } from "../../app/userContext";
import { PRIMARY_COLOR } from "../../app/comman";

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
        }[]
    >([]);



    const [personColors, setPersonColors] = useState<{ [person: string]: { color: string; email: string } }>({});

    // New state for mini calendar integration
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"Day" | "Week" | "Month" | "Year">("Week");
    const [eventForm] = Form.useForm();
    const [goalForm] = Form.useForm();
    const [todoForm] = Form.useForm();
    const [projectForm] = Form.useForm();
    const user = useCurrentUser();

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

    const handleAddGoal = async () => {
        setLoading(true);
        goalForm.validateFields().then(async (values) => {
            try {
                values.date = values.date.format("YYYY-MM-DD");
                values.time = values.time.format("h:mm A");

                if (editingGoal) {
                    // Update existing goal
                    const response = await updateWeeklyGoal({
                        id: editingGoal.id,
                        ...values,
                        backup: backup
                    });
                    const { message, status } = response.data;

                    if (status) {
                        showNotification("Success", message, "success");
                    } else {
                        showNotification("Error", message, "error");
                    }
                } else {
                    // Add new goal
                    const response = await addWeeklyGoal({ ...values, backup: backup });
                    const { message, status } = response.data;

                    if (status) {
                        showNotification("Success", message, "success");
                    } else {
                        showNotification("Error", message, "error");
                    }
                }

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
        }).catch(() => {
            setLoading(false);
        });
    };

    const getUserPlanner = async () => {
        setLoading(true);
        try {
            const response = await getPlanner({});

            const rawGoals = response.data.payload.goals;
            const rawTodos = response.data.payload.todos;
            const rawEvents = response.data.payload.events;

            setCalendarEvents(prev => [
                ...(prev),
                ...transformEvents(rawEvents),
            ]);
            const s = transformEvents(rawEvents)
            console.log("🚀 ~ getUserPlanner ~ s :", s)
            setPersonColors(prev => ({
                ...prev,
                [user.user_name]: {
                    // color: rawEvents[0].account_color,
                    email: user.email,
                },
            }));

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
                values.date = values.date.format("YYYY-MM-DD");
                values.time = values.time.format("h:mm A");

                if (editingTodo) {
                    // Update existing todo
                    const response = await updateWeeklyTodo({
                        id: editingTodo.id,
                        ...values,
                        backup: backup
                    });
                    const { message, status } = response.data;

                    if (status) {
                        showNotification("Success", message, "success");
                    } else {
                        showNotification("Error", message, "error");
                    }
                } else {
                    // Add new todo
                    const response = await addWeeklyTodo({ ...values, backup: backup });
                    const { message, status } = response.data;

                    if (status) {
                        showNotification("Success", message, "success");
                    } else {
                        showNotification("Error", message, "error");
                    }
                }

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
        }).catch(() => {
            setLoading(false);
        });
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await getCalendarEvents({});
            const rawEvents = response?.data?.payload?.events;
            const connectedAccounts = response?.data?.payload?.connected_accounts || [];
            if (rawEvents) {
                setPersonColors(prev => ({
                    ...prev,
                    [connectedAccounts[0].userName]: {
                        // color: rawEvents[0].account_color,
                        email: connectedAccounts[0].email,
                    },
                }));
                setBackup(connectedAccounts[0].email);
                setCalendarEvents(prev => [
                    ...(prev),
                    ...transformEvents(rawEvents),
                ]);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
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
            const creatorEmail = event.creator?.email || "Unknown";

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
                    ? dayjs(endDate).subtract(1, "day")  // fix Google exclusive end.date
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
            };
        });
    };



    useEffect(() => {
        fetchEvents();
        getUserPlanner();
        fetchProjects();
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
    };

    if (loading) {
        return <DocklyLoader />;
    }

    // Get filtered data based on current view
    const filteredGoals = getFilteredGoals();
    const filteredTodos = getFilteredTodos();

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
                <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                    <Col span={16}>
                        <div
                            style={{
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <CustomCalendar
                                data={{ events: calendarEvents, meals: [] }}
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
                                events={calendarEvents}
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
                                height: "330px",
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
                                height: "320px",
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
                    <Col span={24}>
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
                </Row>

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