import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, Calendar as CalendarIcon, Edit, X } from "lucide-react";
import { Avatar, Button, Card, Checkbox, Col, DatePicker, Divider, Form, Input, Modal, Popover, Row, Select, Space, Spin, Tag, TimePicker, Typography } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, LinkOutlined, MailOutlined, PlusOutlined, EditOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import SmartInputBox from "./smartInput";
import { addEvents } from "../../services/planner";
import { showNotification } from "../../utils/notification";
import DocklyLoader from "../../utils/docklyLoader";
import { addEvent } from "../../services/google";
import { PRIMARY_COLOR } from "../../app/comman";
import { useCurrentUser } from "../../app/userContext";

interface Event {
    id: string;
    title: string;
    startTime: string;
    date: string;
    person: string;
    color: string;
    endTime?: string;
    description?: string;
    location?: string;
    end_date?: string;
    start_date?: string;
    is_all_day?: boolean;
    source_email?: string;
    provider?: string;
}

interface Meal {
    id: string;
    name: string;
    emoji: string;
    date: string;
}

export interface CalendarData {
    events: Event[];
    meals: Meal[];
}

interface PersonData {
    color: string;
    email?: string;
}

interface PersonColors {
    [key: string]: PersonData;
}

interface ConnectedAccount {
    userName: string;
    email: string;
    displayName: string;
    accountType: string;
    provider: string;
    color: string;
}

interface Goal {
    id: string;
    text: string;
    completed: boolean;
    date: string;
    time: string;
}

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    priority: "high" | "medium" | "low";
    date: string;
    time: string;
}

interface CalendarProps {
    data?: CalendarData;
    personColors?: PersonColors;
    onAddEvent?: (event: Omit<Event, "id">) => void;
    onEventClick?: (event: Event) => void;
    connectedAccounts?: ConnectedAccount[];
    source?: string;
    allowMentions?: boolean;
    fetchEvents?: () => void;
    goals?: Goal[];
    todos?: Todo[];
    onToggleTodo?: (id: string) => void;
    onAddGoal?: () => void;
    onAddTodo?: () => void;
    enabledHashmentions?: boolean;
    familyMembers?: { name: string; email?: string }[];
    onDateChange?: (date: Date) => void;
    onViewChange?: (view: 'Day' | 'Week' | 'Month' | 'Year') => void;
    currentDate?: Date;
    setCurrentDate?: (date: Date) => void;
    setBackup?: (data: any) => void;
    backup?: any;
}

// Default sample data
export const sampleCalendarData: CalendarData = {
    events: [
        {
            id: '1',
            title: 'Family Brunch',
            startTime: '10:00 AM',
            endTime: '11:30 AM',
            date: '2025-01-08',
            person: 'Family',
            color: '#10B981',
            description: 'Weekly family brunch at the local cafe',
            location: 'Sunny Side Cafe'
        },
        {
            id: '2',
            title: 'Emma - Soccer Practice',
            startTime: '2:00 PM',
            endTime: '4:00 PM',
            date: '2025-01-08',
            person: 'Emma',
            color: '#EC4899',
            description: 'Regular soccer practice session',
            location: 'Central Park Sports Field'
        },
        {
            id: '3',
            title: 'John - Team Meeting',
            startTime: '9:00 AM',
            endTime: '10:00 AM',
            date: '2025-01-09',
            person: 'John',
            color: '#3B82F6',
            description: 'Weekly team sync meeting',
            location: 'Conference Room A'
        },
        {
            id: '4',
            title: 'Liam - Piano Lesson',
            startTime: '3:30 PM',
            endTime: '4:30 PM',
            date: '2025-01-09',
            person: 'Liam',
            color: '#F59E0B',
            description: 'Piano lessons with Mrs. Johnson',
            location: 'Music Academy'
        },
        {
            id: '5',
            title: 'Sarah - Book Club',
            startTime: '7:00 PM',
            endTime: '9:00 PM',
            date: '2025-01-09',
            person: 'Sarah',
            color: '#8B5CF6',
            description: 'Monthly book club meeting',
            location: 'City Library'
        },
        {
            id: '6',
            title: 'Liam - Dentist',
            startTime: '2:00 PM',
            endTime: '3:00 PM',
            date: '2025-01-10',
            person: 'Liam',
            color: '#F59E0B',
            description: 'Regular dental checkup',
            location: 'Downtown Dental Clinic'
        },
        {
            id: '7',
            title: 'Emma - Math Tutoring',
            startTime: '4:00 PM',
            endTime: '5:00 PM',
            date: '2025-01-10',
            person: 'Emma',
            color: '#EC4899',
            description: 'Weekly math tutoring session',
            location: 'Learning Center'
        },
        {
            id: '8',
            title: 'Family Game Night',
            startTime: '6:30 PM',
            endTime: '9:00 PM',
            date: '2025-01-11',
            person: 'Family',
            color: '#10B981',
            description: 'Weekly family game night with board games',
            location: 'Home - Living Room'
        },
    ],
    meals: [
        {
            id: 'm1',
            name: 'Pancakes & Eggs',
            emoji: '🥞',
            date: '2025-01-08',
        },
        {
            id: 'm2',
            name: 'Pizza Night',
            emoji: '🍕',
            date: '2025-01-08',
        },
        {
            id: 'm3',
            name: 'Spaghetti Bolognese',
            emoji: '🍝',
            date: '2025-01-09',
        },
        {
            id: 'm4',
            name: 'Taco Tuesday',
            emoji: '🌮',
            date: '2025-01-10',
        },
    ],
};

// Default person colors
const defaultPersonColors: PersonColors = {
    John: { color: "#3B82F6", email: "john@example.com" },
    Sarah: { color: "#8B5CF6", email: "sarah@example.com" },
    Emma: { color: "#EC4899", email: "emma@example.com" },
    Liam: { color: "#F59E0B", email: "liam@example.com" },
    Family: { color: "#10B981", email: "family@example.com" },
};

const { Text } = Typography;
const { TextArea } = Input;

const CustomCalendar: React.FC<CalendarProps> = ({
    data,
    personColors = defaultPersonColors,
    connectedAccounts = [],
    source,
    allowMentions,
    enabledHashmentions,
    fetchEvents,
    goals = [],
    todos = [],
    familyMembers,
    onDateChange,
    onViewChange,
    currentDate,
    setCurrentDate,
    setBackup,
    backup
}) => {
    const [view, setView] = useState<"Day" | "Week" | "Month" | "Year">("Week");
    const [isNavigating, setIsNavigating] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [previewingEvent, setPreviewingEvent] = useState<any | null>(null);
    const [allEvents, setAllEvents] = useState<Event[] | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isAllDay, setIsAllDay] = useState(false);
    const user = useCurrentUser();

    useEffect(() => {
        if (data?.events) {
            setAllEvents(data.events);
        } else {
            setAllEvents(sampleCalendarData.events);
        }
    }, [data?.events]);

    if (allEvents === null || allEvents.length === 0) {
        return <DocklyLoader />
    }

    const getPersonData = (person: string): PersonData => {
        return personColors[person] || { color: "#1976d2", email: "" };
    };

    const finalData: CalendarData = {
        events: allEvents,
        meals: data?.meals || sampleCalendarData.meals
    };

    // Helper function to get all person names
    const getPersonNames = (): string[] => {
        return Object.keys(personColors);
    };

    // Helper function to format date consistently without timezone issues
    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Helper function to check if a date is in the past
    const isPastDate = (dateStr: string): boolean => {
        const today = new Date();
        const todayStr = formatDateString(today);
        return dateStr < todayStr;
    };

    // Helper function to check if a time is in the past for today
    const isPastTime = (dateStr: string, timeStr: string): boolean => {
        const today = new Date();
        const todayStr = formatDateString(today);

        if (dateStr !== todayStr) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const [timeHour, timeMinute] = timeStr.split(':').map(Number);

        return timeHour < currentHour || (timeHour === currentHour && timeMinute <= currentMinute);
    };

    // Helper function to get goals for a specific date
    const getGoalsForDate = (date: Date): Goal[] => {
        const dateStr = formatDateString(date);
        return goals.filter(goal => goal.date === dateStr);
    };

    // Helper function to get todos for a specific date
    const getTodosForDate = (date: Date): Todo[] => {
        const dateStr = formatDateString(date);
        return todos.filter(todo => todo.date === dateStr);
    };

    // Helper function to get priority color for todos
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "#ef4444";
            case "medium":
                return "#f59e0b";
            case "low":
                return "#10b981";
            default:
                return "#6b7280";
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    };

    const getWeekDays = (date: Date) => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            week.push(currentDay);
        }
        return week;
    };

    const getMonthDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        while (current <= lastDay || current.getDay() !== 0) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
            if (days.length >= 42) break;
        }

        return days;
    };

    const navigateDate = (direction: "prev" | "next") => {
        setIsNavigating(true);
        const newDate = new Date(currentDate ?? new Date());

        switch (view) {
            case "Day":
                newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
                break;
            case "Week":
                newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
                break;
            case "Month":
                newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
                break;
            case "Year":
                newDate.setFullYear(
                    newDate.getFullYear() + (direction === "next" ? 1 : -1)
                );
                break;
        }

        setTimeout(() => {
            if (setCurrentDate) {
                setCurrentDate(newDate ?? new Date());
            }
            // Notify parent component about date change
            if (onDateChange) {
                onDateChange(newDate);
            }
            setIsNavigating(false);
        }, 150);
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = formatDateString(date);
        return finalData.events.filter((event) => event.date === dateStr);
    };

    const getMealsForDate = (date: Date) => {
        const dateStr = formatDateString(date);
        return finalData.meals.filter((meal) => meal.date === dateStr);
    };

    const handleTimeSlotClick = (date: string, time: string) => {
        // Check if the selected date/time is in the past
        if (isPastDate(date)) {
            alert("Cannot schedule events in the past. Please select a future date.");
            return;
        }

        const timeIn24Hour = time.padStart(5, '0');
        const [hours, minutes] = timeIn24Hour.split(':').map(Number);

        if (isPastTime(date, timeIn24Hour)) {
            alert("Cannot schedule events in the past. Please select a future time.");
            return;
        }

        // Convert time to proper format for prefilling
        const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const endHours = hours + 1;
        const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Set form values for prefilling
        form.setFieldsValue({
            title: '',
            date: dayjs(date),
            startTime: dayjs(startTime, 'HH:mm'),
            endTime: dayjs(endTime, 'HH:mm'),
            person: getPersonNames()[0] || 'Family',
            location: '',
            description: ''
        });

        setEditingEvent(null);
        setIsModalVisible(true);
    };

    // Modified to show preview instead of edit form
    const handleEventClick = (event: Event) => {
        setPreviewingEvent({
            ...event,
            is_all_day: event.is_all_day,
            start_date: event.start_date,
            end_date: event.end_date,
        });

        setIsPreviewVisible(true);
    };

    // New function to handle edit from preview
    const handleEditFromPreview = () => {
        if (!previewingEvent) return;

        const startTime24 = convertTo24Hour(previewingEvent.startTime);
        const endTime24 = previewingEvent.endTime ? convertTo24Hour(previewingEvent.endTime) : addHour(startTime24);

        // Set form values for editing
        form.setFieldsValue({
            title: previewingEvent.title,
            date: dayjs(previewingEvent.date),
            startTime: dayjs(startTime24, 'HH:mm'),
            endTime: dayjs(endTime24, 'HH:mm'),
            person: previewingEvent.person,
            location: previewingEvent.location || '',
            description: previewingEvent.description || ''
        });

        setEditingEvent(previewingEvent);
        setIsPreviewVisible(false);
        setIsModalVisible(true);
    };

    const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = (parseInt(hours, 10) + 12).toString();
        }
        return `${hours.padStart(2, '0')}:${minutes || '00'}`;
    };

    const addHour = (time24h: string): string => {
        const [hours, minutes] = time24h.split(':').map(Number);
        const newHours = (hours + 1) % 24;
        return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const getConnectedAccount = (userName: string): ConnectedAccount | null => {
        return connectedAccounts.find(account => account.userName === userName) || null;
    };

    const handleModalSave = () => {
        setLoading(true);

        form.validateFields()
            .then(async (values) => {
                const {
                    title,
                    date,
                    startTime,
                    endTime,
                    startDate,
                    endDate,
                    person,
                    location,
                    description,
                    invitee,
                } = values;

                const payload =
                    isAllDay
                        ? {
                            is_all_day: true,
                            title,
                            start_date: startDate.format("YYYY-MM-DD"),
                            end_date: endDate.format("YYYY-MM-DD"),
                            location,
                            description,
                            person,
                            invitee,
                        }
                        : {
                            is_all_day: false,
                            title,
                            date: date.format("YYYY-MM-DD"),
                            start_time: startTime.format("h:mm A"),
                            end_time: endTime.format("h:mm A"),
                            location,
                            description,
                            person,
                            invitee,
                        };

                // Add ID for editing case only
                if (editingEvent) {
                    (payload as any).id = editingEvent.id;
                }

                try {
                    const res = await addEvent(payload);
                    const { status, message } = res.data;

                    if (status === 1) {
                        showNotification("Success", message, "success");
                        if (fetchEvents) fetchEvents(); // refresh calendar
                    } else {
                        showNotification("Error", message, "error");
                    }

                    setIsModalVisible(false);
                    form.resetFields();
                    setIsAllDay(false);
                    setEditingEvent(null);
                } catch (err) {
                    console.error("Save error:", err);
                    showNotification("Error", "Something went wrong.", "error");
                }

                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onEditEvent = (event: any) => {
        console.log("Editing event:", event);

        const isAllDay =
            event.start_time === "12:00 AM" && event.end_time === "11:59 PM";

        setEditingEvent(event);
        setIsAllDay(isAllDay);

        const convertToDayjsTime = (time: string) => {
            const parsed = dayjs(time, ["h:mm A", "hh:mm A", "H:mm"]);
            return parsed.isValid() ? parsed : null;
        };

        form.setFieldsValue({
            title: event.title || "",
            location: event.location || "",
            description: event.description || "",
            person: event.person || "",
            ...(isAllDay
                ? {
                    startDate: dayjs(event.date),
                    endDate: dayjs(event.end_date || event.date),
                }
                : {
                    date: dayjs(event.date),
                    startTime: convertToDayjsTime(event.start_time || event.startTime),
                    endTime: convertToDayjsTime(event.end_time || event.endTime),
                }),
        });

        setIsModalVisible(true);
    };

    const parseTimeToMinutes = (timeStr: string) => {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let totalHours = hours;

        if (period === 'PM' && hours !== 12) totalHours += 12;
        if (period === 'AM' && hours === 12) totalHours = 0;

        return totalHours * 60 + (minutes || 0);
    };

    const EventCard = ({
        event,
        size = "normal",
        showTime = true,
        onClick,
    }: {
        event: Event;
        size?: "small" | "normal" | "large";
        showTime?: boolean;
        onClick?: () => void;
    }) => {
        const sizeStyles = {
            small: {
                padding: "8px 12px",
                fontSize: "11px",
                borderRadius: "8px",
                borderLeftWidth: "4px",
            },
            normal: {
                padding: "14px 16px",
                fontSize: "13px",
                borderRadius: "12px",
                borderLeftWidth: "5px",
            },
            large: {
                padding: "18px 22px",
                fontSize: "16px",
                borderRadius: "16px",
                borderLeftWidth: "6px",
            },
        };

        // Get account info for this event
        const accountInfo = connectedAccounts.find(acc => acc.email === event.source_email);

        return (
            <div
                onClick={onClick}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
                style={{
                    background: `linear-gradient(135deg, ${event.color}15, ${event.color}08)`,
                    borderLeft: `${sizeStyles[size].borderLeftWidth} solid ${event.color}`,
                    border: `1px solid ${event.color}20`,
                    ...sizeStyles[size],
                    cursor: "pointer",
                    lineHeight: "1.5",
                    transform: hoveredEvent === event.id ? "translateY(-2px) scale(1.02)" : "scale(1)",
                    boxShadow: hoveredEvent === event.id
                        ? `0 8px 25px ${event.color}30, 0 4px 12px ${event.color}20`
                        : `0 2px 8px ${event.color}15`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: size === "small" ? "6px" : "10px",
                    backdropFilter: "blur(10px)",
                }}
            >
                {showTime && (
                    <div
                        style={{
                            fontWeight: "700",
                            color: event.color,
                            marginBottom: size === "small" ? "3px" : "6px",
                            fontSize: size === "small" ? "10px" : sizeStyles[size].fontSize,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}
                    >
                        <Clock size={size === "small" ? 10 : 12} />
                        {event.startTime}
                    </div>
                )}
                <div
                    style={{
                        color: "#1f2937",
                        fontWeight: "600",
                        fontSize: sizeStyles[size].fontSize,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: size === "small" ? "nowrap" : "normal",
                        marginBottom: "4px",
                    }}
                >
                    {event.title}
                </div>
                <div
                    style={{
                        fontSize: size === "small" ? "9px" : "11px",
                        color: "#6b7280",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <User size={size === "small" ? 8 : 10} />
                    {accountInfo?.displayName || event.person}
                    {accountInfo && (
                        <span style={{ fontSize: "8px", opacity: 0.7 }}>
                            ({accountInfo.provider})
                        </span>
                    )}
                </div>
                {hoveredEvent === event.id && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(45deg, ${event.color}08, transparent)`,
                            pointerEvents: "none",
                        }}
                    />
                )}
            </div>
        );
    };

    const DayCard = ({
        date,
        events,
        meals,
        isCurrentMonth = true,
        showMeals = true,
        compactMode = false,
        onClick,
    }: {
        date: Date;
        events: Event[];
        meals: Meal[];
        isCurrentMonth?: boolean;
        showMeals?: boolean;
        compactMode?: boolean;
        onClick?: () => void;
    }) => {
        const isToday = date.toDateString() === new Date().toDateString();
        const isPast = isPastDate(formatDateString(date));
        const dayGoals = getGoalsForDate(date);
        const dayTodos = getTodosForDate(date);

        return (
            <div
                onClick={onClick}
                style={{
                    background: isToday
                        ? "linear-gradient(135deg, #3b82f615, #3b82f608)"
                        : "linear-gradient(135deg, #ffffff, #f8fafc)",
                    borderRadius: compactMode ? "12px" : "16px",
                    padding: compactMode ? "12px" : "20px",
                    border: isToday
                        ? "2px solid #3b82f6"
                        : "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    height: compactMode ? "160px" : "450px",
                    boxShadow: isToday
                        ? "0 8px 25px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(59, 130, 246, 0.1)"
                        : "0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: isPast ? "not-allowed" : "pointer",
                    position: "relative",
                    overflow: "hidden",
                    opacity: (isCurrentMonth && !isPast) ? 1 : 0.5,
                    backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                    if (isCurrentMonth && !isPast) {
                        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                        e.currentTarget.style.boxShadow = isToday
                            ? "0 12px 35px rgba(59, 130, 246, 0.25), 0 8px 20px rgba(59, 130, 246, 0.15)"
                            : "0 12px 35px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.08)";
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = isToday
                        ? "0 8px 25px rgba(59, 130, 246, 0.15), 0 4px 12px rgba(59, 130, 246, 0.1)"
                        : "0 4px 12px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02)";
                }}
            >
                <div
                    style={{
                        fontSize: compactMode ? "16px" : "28px",
                        fontWeight: isToday ? "800" : "700",
                        color: isToday ? "#3B82F6" : isPast ? "#9ca3af" : "#1f2937",
                        marginBottom: compactMode ? "8px" : "16px",
                        transition: "color 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    {date.getDate()}
                    {isToday && (
                        <div style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "#3B82F6",
                            borderRadius: "50%",
                            animation: "pulse 2s infinite"
                        }} />
                    )}
                </div>

                <div
                    style={{
                        flex: 1,
                        marginBottom: showMeals && meals.length > 0 ? "16px" : "0",
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#e5e7eb transparent",
                        paddingRight: "4px",
                    }}
                >
                    {events.slice(0, compactMode ? 2 : 6).map((event, eventIndex) => (
                        <div
                            key={event.id}
                            style={{
                                animation: `slideInUp 0.4s ease ${eventIndex * 0.1}s both`,
                            }}
                        >
                            <EventCard
                                event={event}
                                size="small"
                                showTime={!compactMode}
                                onClick={() => handleEventClick(event)}
                            />
                        </div>
                    ))}
                    {events.length > (compactMode ? 2 : 6) && (
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                padding: "6px 12px",
                                fontWeight: "600",
                                backgroundColor: "#f1f5f9",
                                borderRadius: "8px",
                                textAlign: "center",
                                animation: "pulse 2s infinite",
                            }}
                        >
                            +{events.length - (compactMode ? 2 : 6)} more events
                        </div>
                    )}

                    {/* Show goals for this specific date */}
                    {dayGoals.length > 0 && (
                        <div style={{ marginTop: "8px" }}>
                            <div style={{
                                fontSize: "10px",
                                fontWeight: "700",
                                color: "#10b981",
                                marginBottom: "4px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                Goals
                            </div>
                            {dayGoals.slice(0, 2).map((goal, index) => (
                                <div
                                    key={goal.id}
                                    style={{
                                        fontSize: "10px",
                                        color: "#10b981",
                                        padding: "4px 8px",
                                        backgroundColor: "#ecfdf5",
                                        borderRadius: "6px",
                                        marginBottom: "4px",
                                        border: "1px solid #bbf7d0",
                                        textDecoration: goal.completed ? "line-through" : "none",
                                        opacity: goal.completed ? 0.7 : 1,
                                    }}
                                >
                                    {goal.text}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Show todos for this specific date */}
                    {dayTodos.length > 0 && (
                        <div style={{ marginTop: "8px" }}>
                            <div style={{
                                fontSize: "10px",
                                fontWeight: "700",
                                color: "#f59e0b",
                                marginBottom: "4px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                To-dos
                            </div>
                            {dayTodos.slice(0, 2).map((todo, index) => (
                                <div
                                    key={todo.id}
                                    style={{
                                        fontSize: "10px",
                                        color: getPriorityColor(todo.priority),
                                        padding: "4px 8px",
                                        backgroundColor: `${getPriorityColor(todo.priority)}15`,
                                        borderRadius: "6px",
                                        marginBottom: "4px",
                                        border: `1px solid ${getPriorityColor(todo.priority)}30`,
                                        textDecoration: todo.completed ? "line-through" : "none",
                                        opacity: todo.completed ? 0.7 : 1,
                                    }}
                                >
                                    {todo.text}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate ?? new Date());
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const allDayEventsForWeek = finalData.events.filter(event => {
            if (!event.is_all_day) return false;
            const eventStart = new Date(event.start_date || event.date);
            const eventEnd = new Date(event.end_date || event.date);
            return eventStart <= weekDays[6] && eventEnd >= weekDays[0]; // spans current week
        });

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "translateX(10px)" : "translateX(0)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Week Header */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "80px repeat(7, 1fr)",
                        background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                        borderBottom: "2px solid #e2e8f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <div style={{ padding: "16px 12px" }}></div>
                    {weekDays.map((day, index) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayGoals = getGoalsForDate(day);
                        const dayTodos = getTodosForDate(day);

                        return (
                            <div
                                key={index}
                                style={{
                                    padding: "16px 12px",
                                    textAlign: "center",
                                    borderLeft: index > 0 ? "1px solid #e2e8f0" : "none",
                                    transition: "all 0.2s ease",
                                    background: isToday ? "linear-gradient(135deg, #3b82f615, #3b82f608)" : "transparent",
                                    position: "relative",
                                }}
                            >
                                <div style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    marginBottom: "6px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }}>
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div style={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    color: isToday ? "#3b82f6" : "#1f2937",
                                    position: "relative",
                                    marginBottom: "8px"
                                }}>
                                    {isToday ? (
                                        <div style={{
                                            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                            color: "white",
                                            borderRadius: "50%",
                                            width: "36px",
                                            height: "36px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto",
                                            fontSize: "16px",
                                            fontWeight: "700",
                                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                                            animation: "pulse 2s infinite"
                                        }}>
                                            {day.getDate()}
                                        </div>
                                    ) : (
                                        day.getDate()
                                    )}
                                </div>

                                {/* Show indicators for goals and todos */}
                                <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
                                    {dayGoals.length > 0 && (
                                        <div style={{
                                            width: "6px",
                                            height: "6px",
                                            backgroundColor: "#10b981",
                                            borderRadius: "50%",
                                            animation: "pulse 2s infinite"
                                        }} />
                                    )}
                                    {dayTodos.length > 0 && (
                                        <div style={{
                                            width: "6px",
                                            height: "6px",
                                            backgroundColor: "#f59e0b",
                                            borderRadius: "50%",
                                            animation: "pulse 2s infinite"
                                        }} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* All Day Events Row */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "80px repeat(7, 1fr)",
                        backgroundColor: "#fff",
                        borderBottom: "1px solid #e2e8f0",
                        padding: "6px 0",
                    }}
                >
                    <div style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        textAlign: "center",
                        color: "#6b7280"
                    }}>
                        All Day
                    </div>

                    {weekDays.map((day, index) => {
                        const eventsForDay = allDayEventsForWeek.filter(event => {
                            const start = new Date(event.start_date || event.date);
                            const end = new Date(event.end_date || event.date);
                            return start <= day && end >= day;
                        });

                        return (
                            <div key={index} style={{ position: "relative", padding: "2px 4px", height: "36px" }}>
                                {eventsForDay.map((event, i) => (
                                    <div
                                        key={`${event.id}-${i}`}
                                        onClick={() => handleEventClick(event)}
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            top: `${i * 22}px`,
                                            backgroundColor: event.color,
                                            color: "#fff",
                                            fontSize: "11px",
                                            padding: "2px 6px",
                                            borderRadius: "6px",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            cursor: "pointer",
                                            zIndex: 5
                                        }}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {/* Time Grid */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cbd5e1 transparent",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "80px repeat(7, 1fr)",
                            minHeight: `${24 * 60}px`,
                        }}
                    >
                        {/* Time Labels */}
                        <div style={{
                            borderRight: "2px solid #e2e8f0",
                            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)"
                        }}>
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    style={{
                                        height: "60px",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "flex-end",
                                        paddingRight: "12px",
                                        paddingTop: "6px",
                                        fontSize: "11px",
                                        color: "#64748b",
                                        borderBottom: "1px solid #e2e8f0",
                                        fontWeight: "600"
                                    }}
                                >
                                    {hour === 0 ? '' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {weekDays.map((day, dayIndex) => {
                            const dayEvents = getEventsForDate(day).filter(e => !e.is_all_day);
                            const isToday = day.toDateString() === new Date().toDateString();
                            const isPast = isPastDate(formatDateString(day));
                            return (
                                <div
                                    key={dayIndex}
                                    style={{
                                        borderLeft: dayIndex > 0 ? "1px solid #e2e8f0" : "none",
                                        position: "relative",
                                        background: isToday ? "linear-gradient(180deg, #3b82f605, transparent)" : "transparent",
                                        opacity: isPast ? 0.5 : 1
                                    }}
                                >
                                    {hours.map((hour) => {
                                        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                                        const isPastSlot = isPast || isPastTime(formatDateString(day), timeStr);

                                        return (
                                            <div
                                                key={hour}
                                                onClick={() => {
                                                    if (!isPastSlot) {
                                                        handleTimeSlotClick(
                                                            formatDateString(day),
                                                            timeStr
                                                        );
                                                    }
                                                }}
                                                style={{
                                                    height: "60px",
                                                    borderBottom: "1px solid #e2e8f0",
                                                    cursor: isPastSlot ? "not-allowed" : "pointer",
                                                    position: "relative",
                                                    transition: "background-color 0.2s ease",
                                                    backgroundColor: hour >= 9 && hour <= 17 ? "#ffffff" : "#f8fafc",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isPastSlot) {
                                                        e.currentTarget.style.backgroundColor = "#e0f2fe";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = hour >= 9 && hour <= 17 ? "#ffffff" : "#f8fafc";
                                                }}
                                            />
                                        );
                                    })}

                                    {/* Events */}
                                    {dayEvents.map((event, eventIndex) => {
                                        const startMinutes = parseTimeToMinutes(event.startTime);
                                        const endMinutes = event.endTime ? parseTimeToMinutes(event.endTime) : startMinutes + 60;
                                        const duration = endMinutes - startMinutes;

                                        const topPosition = (startMinutes / 60) * 60;
                                        const eventHeight = Math.max((duration / 60) * 60 - 4, 24);

                                        return (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEventClick(event);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: `${topPosition}px`,
                                                    left: `${eventIndex * 3 + 4}px`,
                                                    right: "4px",
                                                    height: `${eventHeight}px`,
                                                    background: `linear-gradient(135deg, ${event.color}, ${event.color}dd)`,
                                                    color: "white",
                                                    padding: "6px 10px",
                                                    borderRadius: "8px",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    overflow: "hidden",
                                                    boxShadow: `0 4px 12px ${event.color}40, 0 2px 4px ${event.color}20`,
                                                    transition: "all 0.3s ease",
                                                    zIndex: 5,
                                                    animation: `slideInUp 0.4s ease ${eventIndex * 0.1}s both`,
                                                    border: `1px solid ${event.color}`,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.03) translateY(-2px)";
                                                    e.currentTarget.style.boxShadow = `0 8px 25px ${event.color}50, 0 4px 12px ${event.color}30`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                                                    e.currentTarget.style.boxShadow = `0 4px 12px ${event.color}40, 0 2px 4px ${event.color}20`;
                                                }}
                                            >
                                                <div style={{
                                                    fontSize: "10px",
                                                    fontWeight: "500",
                                                    marginBottom: "2px",
                                                    opacity: 0.9,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px"
                                                }}>
                                                    <Clock size={8} />
                                                    {event.startTime}
                                                </div>
                                                <div style={{
                                                    fontWeight: "700",
                                                    lineHeight: "1.3",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {event.title}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthDays = getMonthDays(currentDate ?? new Date());
        const currentMonth = (currentDate ?? new Date()).getMonth();

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "scale(0.98)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "2px",
                        background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        marginBottom: "16px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    }}
                >
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                        <div
                            key={day}
                            style={{
                                padding: "16px",
                                background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                                textAlign: "center",
                                fontWeight: "700",
                                color: "#374151",
                                fontSize: "13px",
                                letterSpacing: "0.5px",
                            }}
                        >
                            {day.slice(0, 3)}
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cbd5e1 transparent",
                        paddingRight: "4px",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "6px",
                            minHeight: "fit-content",
                        }}
                    >
                        {monthDays.map((day, index) => {
                            const dayEvents = getEventsForDate(day);
                            const dayMeals = getMealsForDate(day);
                            const isCurrentMonth = day.getMonth() === currentMonth;

                            return (
                                <DayCard
                                    key={index}
                                    date={day}
                                    events={dayEvents}
                                    meals={dayMeals}
                                    isCurrentMonth={isCurrentMonth}
                                    showMeals={false}
                                    compactMode={true}
                                    onClick={() => {
                                        if (isCurrentMonth && !isPastDate(formatDateString(day))) {
                                            handleTimeSlotClick(
                                                formatDateString(day),
                                                '12:00'
                                            );
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayEvents = getEventsForDate(currentDate ?? new Date());

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "translateY(10px)" : "translateY(0)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "24px",
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        color: "white",
                        borderRadius: "20px",
                        marginBottom: "20px",
                        boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                    }}
                >
                    <div
                        style={{
                            fontSize: "28px",
                            fontWeight: "800",
                            animation: "fadeInDown 0.6s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                        }}
                    >
                        <CalendarIcon size={32} />
                        {(currentDate ?? new Date()).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "20px", flex: 1, overflow: "hidden" }}>
                    {/* Events Section */}
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                                borderRadius: "20px",
                                padding: "24px",
                                border: "1px solid #e2e8f0",
                                height: "100%",
                                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 20px 0",
                                    fontSize: "22px",
                                    fontWeight: "800",
                                    color: "#1f2937",
                                    animation: "slideInLeft 0.5s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                📅 Events
                            </h3>
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "#cbd5e1 transparent",
                                    paddingRight: "8px",
                                }}
                            >
                                {dayEvents.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "60px 20px",
                                            animation: "fadeIn 0.5s ease",
                                        }}
                                    >
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📅</div>
                                        <p
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "16px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            No events scheduled for today
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "16px",
                                        }}
                                    >
                                        {dayEvents.map((event, index) => (
                                            <div
                                                key={event.id}
                                                style={{
                                                    animation: `slideInUp 0.5s ease ${index * 0.1}s both`,
                                                }}
                                            >
                                                <EventCard
                                                    event={event}
                                                    size="normal"
                                                    onClick={() => handleEventClick(event)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderYearView = () => {
        const currentYear = (currentDate ?? new Date()).getFullYear();
        const months = [];

        for (let i = 0; i < 12; i++) {
            months.push(new Date(currentYear, i, 1));
        }

        return (
            <div
                style={{
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "scale(0.95)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#cbd5e1 transparent",
                    paddingRight: "8px",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                        padding: "12px",
                    }}
                >
                    {months.map((month, index) => {
                        const monthDays = getMonthDays(month);
                        const monthEvents = finalData.events.filter((event) => {
                            const eventDate = new Date(event.date);
                            return (
                                eventDate.getFullYear() === currentYear &&
                                eventDate.getMonth() === index
                            );
                        });

                        const monthGoals = goals.filter((goal) => {
                            const goalDate = new Date(goal.date);
                            return (
                                goalDate.getFullYear() === currentYear &&
                                goalDate.getMonth() === index
                            );
                        });

                        const monthTodos = todos.filter((todo) => {
                            const todoDate = new Date(todo.date);
                            return (
                                todoDate.getFullYear() === currentYear &&
                                todoDate.getMonth() === index
                            );
                        });

                        return (
                            <div
                                key={index}
                                style={{
                                    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                                    borderRadius: "20px",
                                    padding: "20px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    animation: `fadeInUp 0.6s ease ${index * 0.05}s both`,
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 16px 35px rgba(0, 0, 0, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.08)";
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "800",
                                        marginBottom: "16px",
                                        color: "#1f2937",
                                        fontSize: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <CalendarIcon size={20} />
                                    {month.toLocaleDateString("en-US", { month: "long" })}
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(7, 1fr)",
                                        gap: "3px",
                                        fontSize: "12px",
                                        marginBottom: "16px",
                                    }}
                                >
                                    {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                                        <div
                                            key={day}
                                            style={{
                                                textAlign: "center",
                                                fontWeight: "700",
                                                color: "#6b7280",
                                                padding: "6px",
                                            }}
                                        >
                                            {day}
                                        </div>
                                    ))}

                                    {monthDays.slice(0, 35).map((day, dayIndex) => {
                                        const dayEvents = getEventsForDate(day);
                                        const dayGoals = getGoalsForDate(day);
                                        const dayTodos = getTodosForDate(day);
                                        const isCurrentMonth = day.getMonth() === index;
                                        const isToday = day.toDateString() === new Date().toDateString();
                                        const isPast = isPastDate(formatDateString(day));

                                        const hasContent = dayEvents.length > 0 || dayGoals.length > 0 || dayTodos.length > 0;

                                        return (
                                            <div
                                                key={dayIndex}
                                                onClick={() => {
                                                    if (isCurrentMonth && !isPast) {
                                                        handleTimeSlotClick(
                                                            formatDateString(day),
                                                            '12:00'
                                                        );
                                                    }
                                                }}
                                                style={{
                                                    textAlign: "center",
                                                    padding: "6px",
                                                    background: hasContent
                                                        ? "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                                        : "transparent",
                                                    borderRadius: "6px",
                                                    opacity: isCurrentMonth ? (isPast ? 0.3 : 1) : 0.4,
                                                    fontWeight: isToday ? "800" : "500",
                                                    color: isToday ? "#3B82F6" : isPast ? "#9ca3af" : "#1f2937",
                                                    cursor: (isCurrentMonth && !isPast) ? "pointer" : "not-allowed",
                                                    transition: "all 0.2s ease",
                                                    position: "relative",
                                                    border: isToday ? "2px solid #3B82F6" : "1px solid transparent",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (isCurrentMonth && !isPast) {
                                                        e.currentTarget.style.background = "linear-gradient(135deg, #bfdbfe, #93c5fd)";
                                                        e.currentTarget.style.transform = "scale(1.15)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (isCurrentMonth && !isPast) {
                                                        e.currentTarget.style.background = hasContent
                                                            ? "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                                            : "transparent";
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }
                                                }}
                                            >
                                                {day.getDate()}
                                                {/* Indicators for different types of content */}
                                                <div style={{
                                                    position: "absolute",
                                                    top: "2px",
                                                    right: "2px",
                                                    display: "flex",
                                                    gap: "1px"
                                                }}>
                                                    {dayEvents.length > 0 && (
                                                        <div
                                                            style={{
                                                                width: "4px",
                                                                height: "4px",
                                                                backgroundColor: "#3B82F6",
                                                                borderRadius: "50%",
                                                                animation: "pulse 2s infinite",
                                                            }}
                                                        />
                                                    )}
                                                    {dayGoals.length > 0 && (
                                                        <div
                                                            style={{
                                                                width: "4px",
                                                                height: "4px",
                                                                backgroundColor: "#10b981",
                                                                borderRadius: "50%",
                                                                animation: "pulse 2s infinite",
                                                            }}
                                                        />
                                                    )}
                                                    {dayTodos.length > 0 && (
                                                        <div
                                                            style={{
                                                                width: "4px",
                                                                height: "4px",
                                                                backgroundColor: "#f59e0b",
                                                                borderRadius: "50%",
                                                                animation: "pulse 2s infinite",
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {monthEvents.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                textAlign: "center",
                                                fontWeight: "600",
                                                padding: "6px 12px",
                                                background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            📅 {monthEvents.length} event{monthEvents.length > 1 ? "s" : ""}
                                        </div>
                                    )}
                                    {monthGoals.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                textAlign: "center",
                                                fontWeight: "600",
                                                padding: "6px 12px",
                                                background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            🎯 {monthGoals.length} goal{monthGoals.length > 1 ? "s" : ""}
                                        </div>
                                    )}
                                    {monthTodos.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                textAlign: "center",
                                                fontWeight: "600",
                                                padding: "6px 12px",
                                                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                                                borderRadius: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            ✅ {monthTodos.length} todo{monthTodos.length > 1 ? "s" : ""}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const { Option } = Select;

    const viewOptions = ["Day", "Week", "Month", "Year"] as const;

    // Enhanced Modal Components
    const SimpleModal = ({ isVisible, onClose, children }: {
        isVisible: boolean;
        onClose: () => void;
        children: React.ReactNode;
    }) => {
        if (!isVisible) return null;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(8px)",
                    animation: "fadeIn 0.3s ease",
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                        borderRadius: "20px",
                        padding: "32px",
                        maxWidth: "550px",
                        width: "90%",
                        maxHeight: "85vh",
                        overflowY: "auto",
                        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                        border: "1px solid #e2e8f0",
                        animation: "slideInUp 0.4s ease",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        );
    };

    // Event Preview Modal Component
    const EventPreviewModal = () => {
        if (!isPreviewVisible || !previewingEvent) return null;

        const account = getConnectedAccount(previewingEvent.person) ||
            connectedAccounts.find(acc => acc.email === previewingEvent.source_email);

        return (
            <SimpleModal isVisible={isPreviewVisible} onClose={() => setIsPreviewVisible(false)}>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setIsPreviewVisible(false)}
                        style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                            border: "1px solid #d1d5db",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #e5e7eb, #d1d5db)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
                        }}
                    >
                        <X size={16} />
                    </button>

                    <div style={{
                        textAlign: "center",
                        marginBottom: "24px",
                        padding: "20px",
                        background: `linear-gradient(135deg, ${previewingEvent.color}15, ${previewingEvent.color}08)`,
                        borderRadius: "16px",
                        border: `2px solid ${previewingEvent.color}30`
                    }}>
                        <h2 style={{
                            margin: "0 0 12px 0",
                            fontSize: "24px",
                            fontWeight: "800",
                            color: "#1f2937",
                            lineHeight: "1.3"
                        }}>
                            {previewingEvent.title}
                        </h2>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            color: previewingEvent.color,
                            fontWeight: "600",
                            fontSize: "16px"
                        }}>
                            <Clock size={18} />
                            {previewingEvent.startTime} - {previewingEvent.endTime}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Person Info */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "16px",
                            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0"
                        }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${previewingEvent.color}, ${previewingEvent.color}dd)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "700",
                                fontSize: "16px"
                            }}>
                                {(account?.displayName || account?.email || previewingEvent.person).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "16px" }}>
                                    {account?.displayName || account?.email || previewingEvent.person}
                                </div>
                                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                                    {account?.provider || previewingEvent.provider || "Google"} Account
                                </div>
                            </div>
                        </div>

                        {/* Date Info */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "16px",
                            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0"
                        }}>
                            <CalendarIcon size={20} color="#6b7280" />
                            <div>
                                <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                    {previewingEvent.is_all_day
                                        ? `${new Date(previewingEvent.start_date ?? previewingEvent.date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric"
                                        })} - ${new Date(
                                            new Date(previewingEvent.end_date ?? previewingEvent.date).setDate(
                                                new Date(previewingEvent.end_date ?? previewingEvent.date).getDate() - 1
                                            )
                                        ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric"
                                        })}`
                                        : new Date(previewingEvent.date).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric"
                                        })}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        {previewingEvent.location && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "16px",
                                background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0"
                            }}>
                                <MapPin size={20} color="#6b7280" />
                                <div>
                                    <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                        {previewingEvent.location}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {previewingEvent.description && (
                            <div style={{
                                padding: "16px",
                                background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0"
                            }}>
                                <div style={{ fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                                    Description
                                </div>
                                <div style={{ color: "#6b7280", lineHeight: "1.6" }}>
                                    {previewingEvent.description}
                                </div>
                            </div>
                        )}

                        {/* Edit Button */}
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "16px",
                            marginTop: "20px",
                            paddingTop: "20px",
                            borderTop: "1px solid #e2e8f0"
                        }}>
                            <button
                                onClick={() => {
                                    onEditEvent(previewingEvent);
                                    setIsPreviewVisible(false);
                                }}
                                style={{
                                    padding: "12px 24px",
                                    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #1d4ed8, #1e40af)";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #3b82f6, #1d4ed8)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <Edit size={16} />
                                Edit Event
                            </button>
                        </div>
                    </div>
                </div>
            </SimpleModal>
        );
    };

    // Get minimum date for inputs (today's date)
    const getMinDate = () => {
        const today = new Date();
        return formatDateString(today);
    };

    // Get minimum time for today
    const getMinTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    if (loading) {
        return <DocklyLoader />
    }

    return (
        <Card
            style={{
                background: "white",
                minHeight: "100vh",
                borderRadius: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                backgroundColor: "white",
                border: "1px solid rgb(235, 236, 243)",
            }}
        >
            <style>
                {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.05);
            }
          }

          /* Enhanced Scrollbar Styles */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #cbd5e1, #94a3b8);
            border-radius: 4px;
            transition: background 0.3s ease;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #94a3b8, #64748b);
          }
        `}
            </style>

            {/* Enhanced Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "20px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <button
                        onClick={() => { if (setCurrentDate) setCurrentDate(new Date()); }}
                        style={{
                            padding: "12px 20px",
                            background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#374151",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #ffffff, #f8fafc)";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                        }}
                    >
                        Today
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                            onClick={() => navigateDate("prev")}
                            style={{
                                padding: "12px",
                                background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, #ffffff, #f8fafc)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => navigateDate("next")}
                            style={{
                                padding: "12px",
                                background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "linear-gradient(135deg, #ffffff, #f8fafc)";
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <h3 style={{
                        margin: 0,
                        color: "#1f2937",
                        fontSize: "26px",
                        fontWeight: "700",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}>
                        <CalendarIcon size={28} />
                        {view === "Year"
                            ? (currentDate ?? new Date()).getFullYear()
                            : formatDate(currentDate ?? new Date())}
                    </h3>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                    <Select
                        value={view}
                        onChange={(value) => {
                            setView(value);
                            // Notify parent component about view change
                            if (onViewChange) {
                                onViewChange(value);
                            }
                        }}
                        style={{
                            width: 180,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                            fontWeight: 600,
                            fontSize: 14
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #ffffff, #f8fafc)";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                        }}
                        prefix={<CalendarOutlined />}
                    >
                        {viewOptions.map((option) => (
                            <Option key={option} value={option}>
                                {option}
                            </Option>
                        ))}
                    </Select>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    />
                </div>
            </div>

            {/* Enhanced Quick Add Event */}
            <div style={{ marginTop: '24px' }}>
                <SmartInputBox
                    source={source}
                    allowMentions={allowMentions}
                    enableHashMentions={enabledHashmentions}
                    familyMembers={familyMembers}
                    personColors={personColors}
                    setBackup={setBackup}
                    backup={backup}
                />
            </div>

            {/* Enhanced Calendar Views */}
            <div
                style={{
                    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    height: "650px",
                    display: "flex",
                    flexDirection: "column",
                    animation: "fadeInUp 0.6s ease",
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                    overflow: "hidden",
                }}
            >
                {view === "Week" && renderWeekView()}
                {view === "Month" && renderMonthView()}
                {view === "Day" && renderDayView()}
                {view === "Year" && renderYearView()}
            </div>

            {/* Enhanced Person Legend */}
            {/* <Card style={{ marginTop: 16 }}>
                <Space wrap>
                    <Text strong>Connected Accounts:</Text>
                    {Object.entries(personColors).map(([userName, personData]) => {
                        const account = getConnectedAccount(userName) ||
                            connectedAccounts.find(acc => acc.email === personData.email);
                        return (
                            <Popover
                                key={userName}
                                content={
                                    <div style={{ maxWidth: 250 }}>
                                        <Space direction="vertical" size="small">
                                            <div>
                                                <Text strong>{account?.displayName || userName}</Text>
                                                <br />
                                                <Text type="secondary">@{userName}</Text>
                                            </div>
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Space>
                                                <MailOutlined />
                                                <Text copyable>{personData.email}</Text>
                                            </Space>
                                            {account?.provider && (
                                                <Space>
                                                    <LinkOutlined />
                                                    <Tag color="blue">{account.provider}</Tag>
                                                </Space>
                                            )}
                                        </Space>
                                    </div>
                                }
                                title="Account Information"
                            >
                                <Tag
                                    style={{
                                        cursor: 'pointer',
                                        padding: '4px 12px',
                                        border: `1px solid ${personData.color}`,
                                        borderRadius: '12px',
                                    }}
                                >
                                    <Space>
                                        <Avatar
                                            size="small"
                                            style={{ backgroundColor: personData.color, marginRight: 8 }}
                                        >
                                            {(account?.displayName || userName).charAt(0).toUpperCase()}
                                        </Avatar>
                                        {account?.displayName || userName}
                                    </Space>
                                </Tag>
                            </Popover>
                        );
                    })}
                </Space>
            </Card> */}

            {/* Event Preview Modal */}
            <EventPreviewModal />

            {/* Enhanced Event Form Modal */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        {editingEvent ? 'Edit Event' : 'Create New Event'}
                    </Space>
                }
                open={isModalVisible}
                onOk={handleModalSave}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingEvent(null);
                    form.resetFields();
                    setIsAllDay(false);
                }}
                okText={editingEvent ? 'Update Event' : 'Create Event'}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                    initialValues={{
                        person: getPersonNames()[0] || 'Family'
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please enter event title' }]}
                    >
                        <Input placeholder="Add a descriptive title" />
                    </Form.Item>

                    {isAllDay ? (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="startDate"
                                    label="Start Date"
                                    rules={[{ required: true, message: 'Please select start date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="endDate"
                                    label="End Date"
                                    rules={[{ required: true, message: 'Please select end date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                                </Form.Item>
                            </Col>
                        </Row>
                    ) : (
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="date"
                                    label="Date"
                                    rules={[{ required: true, message: 'Please select date' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="startTime"
                                    label={<Space><ClockCircleOutlined />Start Time</Space>}
                                    rules={[{ required: true, message: 'Please select start time' }]}
                                >
                                    <TimePicker style={{ width: '100%' }} format="hh:mm A" use12Hours />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="endTime"
                                    label={<Space><ClockCircleOutlined />End Time</Space>}
                                    rules={[{ required: true, message: 'Please select end time' }]}
                                >
                                    <TimePicker style={{ width: '100%' }} format="hh:mm A" use12Hours />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Form.Item>
                        <Checkbox checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)}>
                            All day
                        </Checkbox>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="person"
                                label="Assigned to"
                                rules={[{ required: true, message: 'Please select person' }]}
                            >
                                <Select placeholder="Select person">
                                    {Object.keys(personColors).map(userName => {
                                        const account = getConnectedAccount(userName) ||
                                            connectedAccounts.find(acc => acc.email === getPersonData(userName).email);
                                        return (
                                            <Option key={userName} value={userName}>
                                                <Space>
                                                    <Avatar size="small" style={{ backgroundColor: getPersonData(userName).color }}>
                                                        {(account?.displayName || userName).charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    {account?.displayName || userName}
                                                </Space>
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="invitee" label="Invite">
                                <Input placeholder="Add email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="location"
                        label={<Space><EnvironmentOutlined />Location</Space>}
                    >
                        <Input placeholder="Add location or meeting link" />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={4} placeholder="Add notes, agenda, or additional details" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CustomCalendar;