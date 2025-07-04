
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
import CalendarComponent, { sampleCalendarData } from "../../../pages/components/customCalendar";
import { useEffect } from "react";
import { } from "../../../services/family";
import dayjs from "dayjs";
import {
    addWeeklyGoal,
    addWeeklyTodo,
    getWeeklyGoals,
    getWeeklyTodos,
} from "../../../services/planner";
import { getCalendarEvents } from "../../../services/google";
import DocklyLoader from "../../../utils/docklyLoader";
import { Calendar } from "lucide-react";
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
        eventForm.validateFields().then((values) => {
            setEvents([
                ...events,
                {
                    id: Date.now().toString(),
                    title: values.title,
                    time: values.time.format("h:mm A"),
                    type: "custom",
                    date: values.date.format("YYYY-MM-DD"),
                },
            ]);
            eventForm.resetFields();
            setIsEventModalVisible(false);
        });
    };

    const handleAddGoal = async () => {
        goalForm.validateFields().then(async (values) => {
            // setGoals([
            //   ...goals,
            // {
            //   id: Date.now().toString(),
            //   text: values.goal,
            //   completed: false,
            //   date: values.date.format("YYYY-MM-DD"),
            //   time: values.time.format("h:mm A"),
            // },
            // ]);
            values.date = values.date.format("YYYY-MM-DD");
            values.time = values.time.format("h:mm A");
            const response = await addWeeklyGoal({ ...values });
            goalForm.resetFields();
            getGoals();
            setIsGoalModalVisible(false);
        });
    };
    const getGoals = async () => {
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
    };

    const handleAddTodo = () => {
        todoForm.validateFields().then(async (values) => {
            // setTodos([
            //   ...todos,
            //   {
            //     id: Date.now().toString(),
            //     text: values.text,
            //     completed: false,
            //     priority: values.priority,
            //     date: values.date.format("YYYY-MM-DD"),
            //     time: values.time.format("h:mm A"),
            //   },
            // ]);
            //     todoForm.resetFields();
            //     setIsTodoModalVisible(false);
            //   });
            // };
            values.date = values.date.format("YYYY-MM-DD");
            values.time = values.time.format("h:mm A");
            const response = await addWeeklyTodo({ ...values });
            todoForm.resetFields();
            getTodo();
            setIsTodoModalVisible(false);
        });
    };
    const getTodo = async () => {
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
            const creatorEmail = event.creator?.email || 'Unknown';

            return {
                id: event.id || index.toString(), // fallback to index if no id
                title: event.summary || 'No Title',
                startTime: startDateTime ? dayjs(startDateTime).format('hh:mm A') : 'N/A',
                date: startDateTime ? dayjs(startDateTime).format('YYYY-MM-DD') : 'N/A',
                person: creatorEmail.split('@')[0], // use the part before '@' as name
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
                                padding: "12px 16px",
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <CalendarComponent data={{ events: calendarEvents, meals: [] }} personColors={personColors} />
                        </div>
                        {/* </Card> */}
                    </Col>
                    <Col span={8}>
                        <Card
                            title="Weekly Focus"
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                height: "300px",
                                marginBottom: 8,
                                display: "flex",
                                flexDirection: "column",
                                marginTop: 30
                            }}
                        >
                            <TextArea
                                value={weeklyFocus}
                                onChange={(e) => setWeeklyFocus(e.target.value)}
                                placeholder="What's your main focus this week?"
                                style={{
                                    padding: 12,
                                    backgroundColor: "#f9fafb",
                                    borderRadius: 8,
                                    border: "none",
                                    flex: 1,
                                }}
                            />
                            {showAddButton && (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="small"
                                    onClick={handleAddWeeklyFocus}
                                    style={{ alignSelf: "flex-end", marginTop: 8 }}
                                >
                                    Add
                                </Button>
                            )}
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
                            <div style={{ padding: "12px 16px", overflowY: "auto", height: "220px" }}>
                                {goals.map((goal, index) => (
                                    <div
                                        key={goal.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            padding: 12,
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
                                                    padding: 0,
                                                }}
                                            />
                                            <Text style={{ fontSize: 12, color: "#6b7280" }}>
                                                {goal.date} {goal.time}
                                            </Text>
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
                                height: "300px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div style={{ padding: "12px 16px", overflowY: "auto", height: "220px" }}>
                                {todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "8px 0",
                                            borderBottom: "1px solid #f3f4f6",
                                        }}
                                    >
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
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Card
                            title="Tasks & Projects"
                            extra={
                                <Space>
                                    <Space>
                                        {["All", "Personal", "Work", "Custom"].map((filter) => (
                                            <Button
                                                key={filter}
                                                type={filter === "All" ? "primary" : "default"}
                                                size="small"
                                            >
                                                {filter}
                                            </Button>
                                        ))}
                                    </Space>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setIsProjectModalVisible(true)}
                                    />
                                </Space>
                            }
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <Row
                                gutter={[8, 8]}
                                wrap={true}
                                style={{
                                    padding: "12px 16px", overflowY: "auto", height: "220px"
                                }}
                            >
                                {projects.map((project) => (
                                    <Col key={project.id} span={12}>
                                        <Card
                                            style={{
                                                borderRadius: 12,
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                                backgroundColor: "white",
                                                border: "1px solid #e5e7eb",
                                                height: "180px",
                                            }}
                                        >
                                            <div style={{ marginBottom: 12 }}>
                                                <Title
                                                    level={4}
                                                    style={{
                                                        margin: 0,
                                                        fontSize: 16,
                                                        fontWeight: 600,
                                                        color: "#374151",
                                                    }}
                                                >
                                                    {project.title}
                                                </Title>
                                                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                                                    {project.category} • Due {project.dueDate}
                                                </Text>
                                            </div>
                                            <Button
                                                style={{
                                                    width: "100%",
                                                    padding: 8,
                                                    border: "2px dashed #e5e7eb",
                                                    backgroundColor: "transparent",
                                                    borderRadius: 6,
                                                    color: "#6b7280",
                                                    fontSize: 13,
                                                }}
                                            >
                                                + Add deliverable
                                            </Button>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title="Add New Event"
                    open={isEventModalVisible}
                    onOk={handleAddEvent}
                    onCancel={handleCancelEvent}
                    okText="Add Event"
                    cancelText="Cancel"
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
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label="Time"
                            rules={[{ required: true, message: "Please select a time" }]}
                            initialValue={dayjs().hour(12).minute(0)}
                        >
                            <TimePicker
                                use12Hours
                                format="h:mm A"
                                minuteStep={10}
                                showSecond={false}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Add Weekly Goal"
                    open={isGoalModalVisible}
                    onOk={handleAddGoal}
                    onCancel={handleCancelGoal}
                    okText="Add Goal"
                    cancelText="Cancel"
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
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label="Time"
                            rules={[{ required: true, message: "Please select a time" }]}
                            initialValue={dayjs().hour(12).minute(0)}
                        >
                            <TimePicker
                                use12Hours
                                format="h:mm A"
                                minuteStep={10}
                                showSecond={false}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Add New To-Do"
                    open={isTodoModalVisible}
                    onOk={handleAddTodo}
                    onCancel={handleCancelTodo}
                    okText="Add Task"
                    cancelText="Cancel"
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
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item
                            name="time"
                            label="Time"
                            rules={[{ required: true, message: "Please select a time" }]}
                            initialValue={dayjs().hour(12).minute(0)}
                        >
                            <TimePicker
                                use12Hours
                                format="h:mm A"
                                minuteStep={10}
                                showSecond={false}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Add New Project"
                    open={isProjectModalVisible}
                    onOk={handleAddProject}
                    onCancel={handleCancelProject}
                    okText="Add Project"
                    cancelText="Cancel"
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
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default Planner;

