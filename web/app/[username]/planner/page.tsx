
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
    Space,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CalendarComponent from "../../../pages/components/customCalendar";
import { useEffect } from "react";
import { } from "../../../services/family";
import dayjs from "dayjs";
import {
    addEvents,
    addWeeklyGoal,
    addWeeklyTodo,
    getWeeklyGoals,
    getWeeklyTodos,
    addWeeklyFocus,
    getWeeklyFocus,
} from "../../../services/planner";
import { getCalendarEvents } from "../../../services/google";
import DocklyLoader from "../../../utils/docklyLoader";
import { Calendar } from "lucide-react";
import { showNotification } from "../../../utils/notification";
import { FamilyTasks } from "../../../pages/family-hub/family-hub";
const { Title, Text } = Typography;
const { TextArea } = Input;

const Planner = () => {
    const [events, setEvents] = useState<
        {
            id: string;
            title: string;
            time: string;
            type: "personal" | "work" | "custom";
            date: string;
        }[]
    >([]);
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
        }[]
    >([]);
    const [focus, setFocus] = useState<
        {
            map: any;
            id: string;
            focus: string;
        }[]
    >([]);


    const [projects, setProjects] = useState<
        {
            id: string;
            title: string;
            category: string;
            dueDate: string;
            progress: number;
            deliverables: {
                id: string;
                title: string;
                status: "complete" | "progress" | "planning" | "todo";
                dueDate: string;
            }[];
        }[]
    >([]);
    const [weeklyFocus, setWeeklyFocus] = useState("");
    const [showAddButton, setShowAddButton] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [isEventModalVisible, setIsEventModalVisible] = useState(false);
    const [isTodoModalVisible, setIsTodoModalVisible] = useState(false);
    const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
    const [isFocusModalVisible, setIsFocusModalVisible] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState<
        {
            id: string;
            title: string;
            startTime: string;
            date: string;
            person: string;
            color: string;
        }[]
    >([]);

    const [personColors, setPersonColors] = useState<{ [person: string]: { color: string; email: string } }>({});
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

    const [eventForm] = Form.useForm();
    const [goalForm] = Form.useForm();
    const [todoForm] = Form.useForm();
    const [projectForm] = Form.useForm();
    const [focusForm] = Form.useForm();

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "error";
            case "medium":
                起身: return "warning";
            case "low":
                return "default";
            default:
                return "default";
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
                setLoading(false); // ✅ Now inside async flow and will wait
            }
        }).catch(() => {
            setLoading(false); // ❗In case validation fails
        });
    };



    const handleAddFocus = async () => {
        setLoading(true);
        focusForm.validateFields().then(async (values) => {
            const response = await addWeeklyFocus({ ...values });
            focusForm.resetFields();
            setIsFocusModalVisible(false);
            getFocus();
            setLoading(false);
        });
    };

    const getFocus = async () => {
        try {
            const response = await getWeeklyFocus({});
            const rawFocus = response.data.payload;

            const formattedFocus = rawFocus.map((item: any) => ({
                id: item.id,
                focus: item.focus,
            }));

            setFocus(formattedFocus);
        } catch (error) {
            console.error("Error fetching focus:", error);
        }
    };

    useEffect(() => {
        getFocus();
    }, []);



    const handleAddGoal = async () => {
        setLoading(true);
        goalForm.validateFields().then(async (values) => {
            try {
                values.date = values.date.format("YYYY-MM-DD");
                values.time = values.time.format("h:mm A");

                const response = await addWeeklyGoal({ ...values });
                const { message, status } = response.data;

                if (status) {
                    showNotification("Success", message, "success");
                } else {
                    showNotification("Error", message, "error");
                }

                getGoals();
                setIsGoalModalVisible(false);
                fetchEvents();
                goalForm.resetFields();
            } catch (error) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                setLoading(false); // ✅ Ensures it's called after everything
            }
        }).catch(() => {
            setLoading(false); // ❗In case validation fails
        });
    };
    const getGoals = async () => {
        setLoading(true);
        try {
            const response = await getWeeklyGoals({});
            const rawGoals = response.data.payload;

            const formattedGoals = rawGoals.map((item: any) => ({
                id: item.id,
                text: item.goal,
                completed: item.goal_status === 1,
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
            }));

            // console.log("Formatted Goals:", formattedGoals);
            setGoals(formattedGoals);
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

                const response = await addWeeklyTodo({ ...values });
                const { message, status } = response.data;

                if (status) {
                    showNotification("Success", message, "success");
                } else {
                    showNotification("Error", message, "error");
                }

                getTodo();
                setIsTodoModalVisible(false);
                fetchEvents();
                todoForm.resetFields();
            } catch (error) {
                showNotification("Error", "Something went wrong", "error");
            } finally {
                setLoading(false); // ✅ Ensures loading ends after everything
            }
        }).catch(() => {
            setLoading(false); // ❗Reset loading if validation fails
        });
    };
    const getTodo = async () => {
        setLoading(true)
        try {
            const response = await getWeeklyTodos({});
            const rawTodos = response.data.payload;

            const formattedTodos = rawTodos.map((item: any) => ({
                id: item.id,
                text: item.text,
                completed: item.todo_status,
                priority: item.priority || "medium",
                date: dayjs(item.date).format("YYYY-MM-DD"),
                time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
            }));

            // console.log("Formatted Todos:", formattedTodos);
            setTodos(formattedTodos);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
        setLoading(false);
    };
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await getCalendarEvents({});
            const rawEvents = response?.data?.payload?.events;
            const connectedAccounts = response?.data?.payload?.connected_accounts || [];
            if (rawEvents) {
                // localStorage.setItem('calendar', '1');
                // setStep(5);
                setPersonColors({ [connectedAccounts[0].userName]: { color: rawEvents[0].account_color, email: connectedAccounts[0].email } });
                setCalendarEvents(transformEvents(rawEvents));
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const transformEvents = (rawEvents: any[]): any[] => {
        return rawEvents.map((event, index) => {
            const startDateTime = event.start?.dateTime;
            const endDateTime = event.end?.dateTime;
            const creatorEmail = event.creator?.email || 'Unknown';

            // Use dayjs to parse and manipulate time
            const start = startDateTime ? dayjs(startDateTime) : null;
            const end = endDateTime ? dayjs(endDateTime) : (start ? start.add(1, 'hour') : null);

            return {
                id: event.id || index.toString(), // fallback to index if no id
                title: event.summary || 'No Title',
                startTime: start ? start.format('hh:mm A') : 'N/A',
                endTime: end ? end.format('hh:mm A') : 'N/A',
                date: start ? start.format('YYYY-MM-DD') : 'N/A',
                person: creatorEmail.split('@')[0], // part before @
                color: event.account_color || '#10B981', // fallback color
            };
        });
    };

    useEffect(() => {
        fetchEvents();
        getGoals();
        getTodo();
    }, []);

    const handleAddProject = () => {
        projectForm.validateFields().then((values) => {
            setProjects([
                ...projects,
                {
                    id: Date.now().toString(),
                    title: values.title,
                    category: values.category,
                    dueDate: values.dueDate.format("YYYY-MM-DD"),
                    progress: 0,
                    deliverables: [],
                },
            ]);
            projectForm.resetFields();
            setIsProjectModalVisible(false);
        });
    };

    const handleAddWeeklyFocus = () => {
        if (weeklyFocus.trim()) {
            setWeeklyFocus(weeklyFocus.trim());
            setShowAddButton(false);
        }
    };

    const handleCancelEvent = () => {
        eventForm.resetFields();
        setIsEventModalVisible(false);
    };

    const handleCancelGoal = () => {
        goalForm.resetFields();
        setIsGoalModalVisible(false);
    };

    const handleCancelTodo = () => {
        todoForm.resetFields();
        setIsTodoModalVisible(false);
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

    if (loading) {
        return <DocklyLoader />;
    }
    function handleCancelFocus(e: React.MouseEvent<HTMLButtonElement>): void {
        focusForm.resetFields();
        setIsFocusModalVisible(false);
    }

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
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsEventModalVisible(true)}
                    >
                        Add Event
                    </Button>
                </div>
                <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                    <Col span={16}>
                        {/* <Card
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                height: "900px",
                                overflow: "hidden",
                            }}
                        > */}
                        <div
                            style={{
                                // padding: "12px 16px",
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <CalendarComponent data={{ events: calendarEvents, meals: [] }} personColors={personColors} source="planner" allowMentions={false} fetchEvents={fetchEvents} />
                        </div>
                        {/* </Card> */}
                    </Col>
                    <Col span={8}>
                        <Card
                            title="Weekly Focus"
                            extra={
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsFocusModalVisible(true)}
                                />
                            }
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                backgroundColor: "white",
                                border: "1px solid rgb(235, 236, 243)",
                                height: "300px",
                                marginBottom: 8,
                                display: "flex",
                                flexDirection: "column",
                                // marginTop: "px",
                            }}
                        >
                            <div
                                style={{
                                    padding: "12px 16px",
                                    overflowY: "auto",
                                    height: "220px",
                                    paddingBottom: 24, // ✅ bottom padding
                                }}
                            >
                                {[
                                    ...focus,
                                    ...Array(Math.max(3, focus.length + 1) - focus.length).fill(
                                        {}
                                    ),
                                ].map((focusItem, index) => (
                                    <div
                                        key={focusItem.id || `empty-focus-${index}`}
                                        style={{
                                            backgroundColor: focusItem.focus ? "#e5e7eb" : "#f5f5f5",
                                            padding: "16px",
                                            borderRadius: 8,
                                            marginBottom: 8,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: focusItem.focus ? "black" : "#9ca3af",
                                                fontStyle: focusItem.focus ? "normal" : "italic",
                                                paddingLeft: 6,
                                            }}
                                        >
                                            {focusItem.focus
                                                ? `${index + 1}. ${focusItem.focus}`
                                                : `Focus ${index + 1}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card
                            title="Weekly Goals"
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
                                height: "300px",
                                marginBottom: 8,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    padding: "12px 16px",
                                    overflowY: "auto",
                                    height: "220px",
                                    paddingBottom: 24, // ✅ bottom padding
                                }}
                            >
                                {[
                                    ...goals,
                                    ...Array(Math.max(3, goals.length + 1) - goals.length).fill(
                                        {}
                                    ),
                                ].map((goal, index) => (
                                    <div
                                        key={goal.id || `empty-goal-${index}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            padding: 12,
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
                                                            padding: "2px 6px", // ✅ text padding
                                                        }}
                                                    />
                                                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                                                        {goal.date} {goal.time}
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
                                                    Add goal {index + 1}
                                                </Text>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card
                            title="Weekly To-Do List"
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
                                height: "350px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    padding: "12px 16px",
                                    overflowY: "auto",
                                    height: "220px",
                                    paddingBottom: 24, // ✅ bottom padding
                                }}
                            >
                                {[
                                    ...todos,
                                    ...Array(Math.max(3, todos.length + 1) - todos.length).fill(
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
                                                            padding: "2px 6px", // ✅ text padding
                                                        }}
                                                    >
                                                        {todo.text}
                                                    </Text>
                                                    <div>
                                                        <Text style={{ fontSize: 12, color: "#6b7280" }}>
                                                            {todo.date} {todo.time}
                                                        </Text>
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
                                                    paddingLeft: 6, // ✅ placeholder padding
                                                }}
                                            >
                                                Add To-do {index + 1}
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
                        <FamilyTasks isPlanner={true} />
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
                    title="Add Weekly Focus"
                    open={isFocusModalVisible}
                    onOk={handleAddFocus}
                    onCancel={handleCancelFocus}
                    okText="Add Focus"
                    cancelText="Cancel"
                >
                    <Form form={focusForm} layout="vertical">
                        <Form.Item
                            name="focus"
                            label="Focus"
                            rules={[
                                { required: true, message: "Please enter your weekly focus" },
                            ]}
                        >
                            <Input placeholder="Enter your weekly focus..." />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Add Weekly Goal"
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
                            Add Goal
                        </Button>,
                    ]}
                >
                    <Form form={goalForm} layout="vertical">
                        <Form.Item
                            name="goal"
                            label="Goal"
                            rules={[
                                { required: true, message: "Please enter your weekly goal" },
                            ]}
                        >
                            <Input placeholder="Enter your weekly goal..." />
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
                    title="Add New To-Do"
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
                            Add Task
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

