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
import { useGlobalLoading } from "../../app/loadingContext";

// Professional color palette
const COLORS = {
    primary: '#1C1C1E',
    secondary: '#48484A',
    accent: '#1890FF',
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    border: '#E8E8E8',
    borderLight: '#F0F0F0',
    text: '#1C1C1E',
    textSecondary: '#8C8C8C',
    textTertiary: '#BFBFBF',
    overlay: 'rgba(0, 0, 0, 0.45)',
    shadowLight: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
    shadowHeavy: 'rgba(0, 0, 0, 0.12)',
};

const COMPACT_SPACING = {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
};

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
    view: "Day" | "Week" | "Month" | "Year"
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
            color: COLORS.success,
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
            color: COLORS.error,
            description: 'Regular soccer practice session',
            location: 'Central Park Sports Field'
        },
    ],
    meals: [],
};

// Default person colors
const defaultPersonColors: PersonColors = {
    John: { color: COLORS.accent, email: "john@example.com" },
    Sarah: { color: COLORS.warning, email: "sarah@example.com" },
    Emma: { color: COLORS.error, email: "emma@example.com" },
    Liam: { color: COLORS.success, email: "liam@example.com" },
    Family: { color: COLORS.secondary, email: "family@example.com" },
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
    view,
    backup
}) => {
    // console.log("🚀 ~ data:", data)
    const [isNavigating, setIsNavigating] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [previewingEvent, setPreviewingEvent] = useState<any | null>(null);
    const [allEvents, setAllEvents] = useState<Event[] | null>(null);
    const [form] = Form.useForm();
    const { loading, setLoading } = useGlobalLoading();
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
        setLoading(true);
    } else {
        setLoading(false);
    }

    const getPersonData = (person: string): PersonData => {
        return personColors[person] || { color: COLORS.accent, email: "" };
    };

    const finalData: CalendarData = {
        events: allEvents ?? [],
        meals: data?.meals || sampleCalendarData.meals
    };

    const getPersonNames = (): string[] => {
        return Object.keys(personColors);
    };

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isPastDate = (dateStr: string): boolean => {
        const today = new Date();
        const todayStr = formatDateString(today);
        return dateStr < todayStr;
    };

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

    const getGoalsForDate = (date: Date): Goal[] => {
        const dateStr = formatDateString(date);
        return goals.filter(goal => goal.date === dateStr);
    };

    const getTodosForDate = (date: Date): Todo[] => {
        const dateStr = formatDateString(date);
        return todos.filter(todo => todo.date === dateStr);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return COLORS.error;
            case "medium": return COLORS.warning;
            case "low": return COLORS.success;
            default: return COLORS.textSecondary;
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

        const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const endHours = hours + 1;
        const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

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

    const handleEventClick = (event: Event) => {
        setPreviewingEvent({
            ...event,
            is_all_day: event.is_all_day,
            start_date: event.start_date,
            end_date: event.end_date,
        });

        setIsPreviewVisible(true);
    };

    const handleEditFromPreview = () => {
        if (!previewingEvent) return;

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

        const startTime24 = convertTo24Hour(previewingEvent.startTime);
        const endTime24 = previewingEvent.endTime ? convertTo24Hour(previewingEvent.endTime) : addHour(startTime24);

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

                if (editingEvent) {
                    (payload as any).id = editingEvent.id;
                }

                try {
                    const res = await addEvent(payload);
                    const { status, message } = res.data;

                    if (status === 1) {
                        showNotification("Success", message, "success");
                        if (fetchEvents) fetchEvents();
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
        const convertTo24Hour = (time12h: string): string => {
            if (!time12h) return "00:00";
            const [time, modifier] = time12h.split(" ");
            let [hours, minutes] = time.split(":");
            if (hours === "12") hours = "00";
            if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
            return `${hours.padStart(2, "0")}:${minutes || "00"}`;
        };

        const eventDate = event.date;
        const eventStartTime = event.start_time || event.startTime || "12:00 AM";
        const eventTime24 = convertTo24Hour(eventStartTime);

        if (isPastDate(eventDate) || isPastTime(eventDate, eventTime24)) {
            showNotification("Info", "You cannot edit past events.", "info");
            return;
        }

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
                padding: "4px 8px",
                fontSize: "10px",
                borderRadius: "6px",
                borderLeftWidth: "3px",
            },
            normal: {
                padding: "8px 12px",
                fontSize: "12px",
                borderRadius: "8px",
                borderLeftWidth: "4px",
            },
            large: {
                padding: "12px 16px",
                fontSize: "14px",
                borderRadius: "10px",
                borderLeftWidth: "5px",
            },
        };

        const accountInfo = connectedAccounts.find(acc => acc.email === event.source_email);

        return (
            <div
                onClick={onClick}
                onMouseEnter={() => setHoveredEvent(event.id)}
                onMouseLeave={() => setHoveredEvent(null)}
                style={{
                    fontFamily: FONT_FAMILY,
                    background: `linear-gradient(135deg, ${event.color}15, ${event.color}08)`,
                    borderLeft: `${sizeStyles[size].borderLeftWidth} solid ${event.color}`,
                    border: `1px solid ${event.color}20`,
                    ...sizeStyles[size],
                    cursor: "pointer",
                    lineHeight: "1.4",
                    transform: hoveredEvent === event.id ? "translateY(-1px) scale(1.01)" : "scale(1)",
                    boxShadow: hoveredEvent === event.id
                        ? `0 4px 15px ${event.color}25, 0 2px 8px ${event.color}15`
                        : `0 1px 4px ${event.color}10`,
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: size === "small" ? "3px" : "6px",
                    backdropFilter: "blur(8px)",
                }}
            >
                {showTime && (
                    <div
                        style={{
                            fontWeight: "600",
                            color: event.color,
                            marginBottom: size === "small" ? "2px" : "4px",
                            fontSize: size === "small" ? "9px" : sizeStyles[size].fontSize,
                            display: "flex",
                            alignItems: "center",
                            gap: "3px",
                        }}
                    >
                        <Clock size={size === "small" ? 8 : 10} />
                        {event.startTime}
                    </div>
                )}
                <div
                    style={{
                        color: COLORS.text,
                        fontWeight: "600",
                        fontSize: sizeStyles[size].fontSize,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: size === "small" ? "nowrap" : "normal",
                        marginBottom: "2px",
                    }}
                >
                    {event.title}
                </div>
                <div
                    style={{
                        fontSize: size === "small" ? "8px" : "10px",
                        color: COLORS.textSecondary,
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                    }}
                >
                    <User size={size === "small" ? 7 : 8} />
                    {accountInfo?.displayName || event.person}
                    {accountInfo && (
                        <span style={{ fontSize: "7px", opacity: 0.7 }}>
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
                            background: `linear-gradient(45deg, ${event.color}06, transparent)`,
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
                    fontFamily: FONT_FAMILY,
                    background: isToday
                        ? `linear-gradient(135deg, ${COLORS.accent}12, ${COLORS.accent}06)`
                        : `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                    borderRadius: compactMode ? "8px" : "12px",
                    padding: compactMode ? "6px" : "12px",
                    border: isToday
                        ? `1.5px solid ${COLORS.accent}`
                        : `1px solid ${COLORS.borderLight}`,
                    display: "flex",
                    flexDirection: "column",
                    height: compactMode ? "120px" : "300px",
                    boxShadow: isToday
                        ? `0 3px 12px ${COLORS.accent}12, 0 1px 4px ${COLORS.accent}08`
                        : `0 1px 4px ${COLORS.shadowLight}`,
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: isPast ? "not-allowed" : "pointer",
                    position: "relative",
                    overflow: "hidden",
                    opacity: (isCurrentMonth && !isPast) ? 1 : 0.5,
                    backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                    if (isCurrentMonth && !isPast) {
                        e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
                        e.currentTarget.style.boxShadow = isToday
                            ? `0 6px 20px ${COLORS.accent}20, 0 3px 8px ${COLORS.accent}12`
                            : `0 4px 16px ${COLORS.shadowMedium}`;
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = isToday
                        ? `0 3px 12px ${COLORS.accent}12, 0 1px 4px ${COLORS.accent}08`
                        : `0 1px 4px ${COLORS.shadowLight}`;
                }}
            >
                <div
                    style={{
                        fontSize: compactMode ? "14px" : "20px",
                        fontWeight: isToday ? "700" : "600",
                        color: isToday ? COLORS.accent : isPast ? COLORS.textTertiary : COLORS.text,
                        marginBottom: compactMode ? "4px" : "8px",
                        transition: "color 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    {date.getDate()}
                    {isToday && (
                        <div style={{
                            width: "4px",
                            height: "4px",
                            backgroundColor: COLORS.accent,
                            borderRadius: "50%",
                            animation: "pulse 2s infinite"
                        }} />
                    )}
                </div>

                <div
                    style={{
                        flex: 1,
                        marginBottom: showMeals && meals.length > 0 ? "8px" : "0",
                        overflowY: "auto",
                        scrollbarWidth: "thin",
                        scrollbarColor: `${COLORS.border} transparent`,
                        paddingRight: "2px",
                    }}
                >
                    {events.slice(0, compactMode ? 2 : 4).map((event, eventIndex) => (
                        <div
                            key={event.id}
                            style={{
                                animation: `slideInUp 0.3s ease ${eventIndex * 0.05}s both`,
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
                    {events.length > (compactMode ? 2 : 4) && (
                        <div
                            style={{
                                fontSize: "9px",
                                color: COLORS.textSecondary,
                                padding: "3px 6px",
                                fontWeight: "600",
                                backgroundColor: COLORS.surfaceSecondary,
                                borderRadius: "4px",
                                textAlign: "center",
                                animation: "pulse 2s infinite",
                            }}
                        >
                            +{events.length - (compactMode ? 2 : 4)} more
                        </div>
                    )}

                    {dayGoals.length > 0 && (
                        <div style={{ marginTop: "4px" }}>
                            <div style={{
                                fontSize: "8px",
                                fontWeight: "600",
                                color: COLORS.success,
                                marginBottom: "2px",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px"
                            }}>
                                Goals
                            </div>
                            {dayGoals.slice(0, 1).map((goal, index) => (
                                <div
                                    key={goal.id}
                                    style={{
                                        fontSize: "8px",
                                        color: COLORS.success,
                                        padding: "2px 4px",
                                        backgroundColor: `${COLORS.success}12`,
                                        borderRadius: "3px",
                                        marginBottom: "2px",
                                        border: `1px solid ${COLORS.success}25`,
                                        textDecoration: goal.completed ? "line-through" : "none",
                                        opacity: goal.completed ? 0.7 : 1,
                                    }}
                                >
                                    {goal.text}
                                </div>
                            ))}
                        </div>
                    )}

                    {dayTodos.length > 0 && (
                        <div style={{ marginTop: "4px" }}>
                            <div style={{
                                fontSize: "8px",
                                fontWeight: "600",
                                color: COLORS.warning,
                                marginBottom: "2px",
                                textTransform: "uppercase",
                                letterSpacing: "0.3px"
                            }}>
                                To-dos
                            </div>
                            {dayTodos.slice(0, 1).map((todo, index) => (
                                <div
                                    key={todo.id}
                                    style={{
                                        fontSize: "8px",
                                        color: getPriorityColor(todo.priority),
                                        padding: "2px 4px",
                                        backgroundColor: `${getPriorityColor(todo.priority)}12`,
                                        borderRadius: "3px",
                                        marginBottom: "2px",
                                        border: `1px solid ${getPriorityColor(todo.priority)}25`,
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
            return eventStart <= weekDays[6] && eventEnd >= weekDays[0];
        });

        return (
            <div
                style={{
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "translateX(5px)" : "translateX(0)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Week Header */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "60px repeat(7, 1fr)",
                        background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <div style={{ padding: "8px 6px" }}></div>
                    {weekDays.map((day, index) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayGoals = getGoalsForDate(day);
                        const dayTodos = getTodosForDate(day);

                        return (
                            <div
                                key={index}
                                style={{
                                    padding: "8px 6px",
                                    textAlign: "center",
                                    borderLeft: index > 0 ? `1px solid ${COLORS.borderLight}` : "none",
                                    transition: "all 0.2s ease",
                                    background: isToday ? `linear-gradient(135deg, ${COLORS.accent}12, ${COLORS.accent}06)` : "transparent",
                                    position: "relative",
                                }}
                            >
                                <div style={{
                                    fontSize: "10px",
                                    color: COLORS.textSecondary,
                                    marginBottom: "3px",
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.3px"
                                }}>
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div style={{
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    color: isToday ? COLORS.accent : COLORS.text,
                                    position: "relative",
                                    marginBottom: "4px"
                                }}>
                                    {isToday ? (
                                        <div style={{
                                            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                                            color: "white",
                                            borderRadius: "50%",
                                            width: "28px",
                                            height: "28px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            boxShadow: `0 2px 8px ${COLORS.accent}25`,
                                            animation: "pulse 2s infinite"
                                        }}>
                                            {day.getDate()}
                                        </div>
                                    ) : (
                                        day.getDate()
                                    )}
                                </div>

                                <div style={{ display: "flex", justifyContent: "center", gap: "2px" }}>
                                    {dayGoals.length > 0 && (
                                        <div style={{
                                            width: "4px",
                                            height: "4px",
                                            backgroundColor: COLORS.success,
                                            borderRadius: "50%",
                                            animation: "pulse 2s infinite"
                                        }} />
                                    )}
                                    {dayTodos.length > 0 && (
                                        <div style={{
                                            width: "4px",
                                            height: "4px",
                                            backgroundColor: COLORS.warning,
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
                        gridTemplateColumns: "60px repeat(7, 1fr)",
                        backgroundColor: COLORS.surface,
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                        padding: "3px 0",
                    }}
                >
                    <div style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        textAlign: "center",
                        color: COLORS.textSecondary
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
                            <div key={index} style={{ position: "relative", padding: "1px 2px", height: "24px" }}>
                                {eventsForDay.map((event, i) => (
                                    <div
                                        key={`${event.id}-${i}`}
                                        onClick={() => handleEventClick(event)}
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            top: `${i * 14}px`,
                                            backgroundColor: event.color,
                                            color: "#fff",
                                            fontSize: "9px",
                                            padding: "1px 4px",
                                            borderRadius: "4px",
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
                        scrollbarColor: `${COLORS.border} transparent`,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "60px repeat(7, 1fr)",
                            minHeight: `${24 * 50}px`,
                        }}
                    >
                        {/* Time Labels */}
                        <div style={{
                            borderRight: `1px solid ${COLORS.borderLight}`,
                            background: `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`
                        }}>
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    style={{
                                        height: "50px",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "flex-end",
                                        paddingRight: "6px",
                                        paddingTop: "3px",
                                        fontSize: "9px",
                                        color: COLORS.textSecondary,
                                        borderBottom: `1px solid ${COLORS.borderLight}`,
                                        fontWeight: "500"
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
                                        borderLeft: dayIndex > 0 ? `1px solid ${COLORS.borderLight}` : "none",
                                        position: "relative",
                                        background: isToday ? `linear-gradient(180deg, ${COLORS.accent}04, transparent)` : "transparent",
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
                                                    height: "50px",
                                                    borderBottom: `1px solid ${COLORS.borderLight}`,
                                                    cursor: isPastSlot ? "not-allowed" : "pointer",
                                                    position: "relative",
                                                    transition: "background-color 0.2s ease",
                                                    backgroundColor: hour >= 9 && hour <= 17 ? COLORS.surface : COLORS.surfaceSecondary,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isPastSlot) {
                                                        e.currentTarget.style.backgroundColor = `${COLORS.accent}08`;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = hour >= 9 && hour <= 17 ? COLORS.surface : COLORS.surfaceSecondary;
                                                }}
                                            />
                                        );
                                    })}

                                    {/* Events */}
                                    {dayEvents.map((event, eventIndex) => {
                                        const startMinutes = parseTimeToMinutes(event.startTime);
                                        const endMinutes = event.endTime ? parseTimeToMinutes(event.endTime) : startMinutes + 60;
                                        const duration = endMinutes - startMinutes;

                                        const topPosition = (startMinutes / 60) * 50;
                                        const eventHeight = Math.max((duration / 60) * 50 - 2, 20);

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
                                                    left: `${eventIndex * 2 + 2}px`,
                                                    right: "2px",
                                                    height: `${eventHeight}px`,
                                                    background: `linear-gradient(135deg, ${event.color}, ${event.color}dd)`,
                                                    color: "white",
                                                    padding: "3px 6px",
                                                    borderRadius: "5px",
                                                    cursor: "pointer",
                                                    fontSize: "10px",
                                                    fontWeight: "600",
                                                    overflow: "hidden",
                                                    boxShadow: `0 2px 6px ${event.color}30, 0 1px 2px ${event.color}15`,
                                                    transition: "all 0.2s ease",
                                                    zIndex: 5,
                                                    animation: `slideInUp 0.3s ease ${eventIndex * 0.05}s both`,
                                                    border: `1px solid ${event.color}`,
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.02) translateY(-1px)";
                                                    e.currentTarget.style.boxShadow = `0 4px 12px ${event.color}40, 0 2px 6px ${event.color}25`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                                                    e.currentTarget.style.boxShadow = `0 2px 6px ${event.color}30, 0 1px 2px ${event.color}15`;
                                                }}
                                            >
                                                <div style={{
                                                    fontSize: "8px",
                                                    fontWeight: "500",
                                                    marginBottom: "1px",
                                                    opacity: 0.9,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "2px"
                                                }}>
                                                    <Clock size={6} />
                                                    {event.startTime}
                                                </div>
                                                <div style={{
                                                    fontWeight: "600",
                                                    lineHeight: "1.2",
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
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "scale(0.99)" : "scale(1)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    padding: COMPACT_SPACING.md,
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: "1px",
                        background: `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`,
                        borderRadius: "10px",
                        overflow: "hidden",
                        marginBottom: "8px",
                        boxShadow: `0 2px 6px ${COLORS.shadowLight}`,
                    }}
                >
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                        <div
                            key={day}
                            style={{
                                padding: "8px",
                                background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                                textAlign: "center",
                                fontWeight: "600",
                                color: COLORS.text,
                                fontSize: "11px",
                                letterSpacing: "0.3px",
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
                        scrollbarColor: `${COLORS.border} transparent`,
                        paddingRight: "2px",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "3px",
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
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "translateY(5px)" : "translateY(0)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    padding: COMPACT_SPACING.md,
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "16px",
                        background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                        color: "white",
                        borderRadius: "12px",
                        marginBottom: "12px",
                        boxShadow: `0 4px 15px ${COLORS.accent}25`,
                    }}
                >
                    <div
                        style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            animation: "fadeInDown 0.4s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}
                    >
                        <CalendarIcon size={24} />
                        {(currentDate ?? new Date()).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12px", flex: 1, overflow: "hidden" }}>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                                borderRadius: "12px",
                                padding: "16px",
                                border: `1px solid ${COLORS.borderLight}`,
                                height: "100%",
                                boxShadow: `0 4px 15px ${COLORS.shadowLight}`,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 12px 0",
                                    fontSize: "16px",
                                    fontWeight: "700",
                                    color: COLORS.text,
                                    animation: "slideInLeft 0.3s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                📅 Events
                            </h3>
                            <div
                                style={{
                                    flex: 1,
                                    overflowY: "auto",
                                    scrollbarWidth: "thin",
                                    scrollbarColor: `${COLORS.border} transparent`,
                                    paddingRight: "4px",
                                }}
                            >
                                {dayEvents.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "40px 16px",
                                            animation: "fadeIn 0.3s ease",
                                        }}
                                    >
                                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>📅</div>
                                        <p
                                            style={{
                                                color: COLORS.textSecondary,
                                                fontSize: "14px",
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
                                            gap: "8px",
                                        }}
                                    >
                                        {dayEvents.map((event, index) => (
                                            <div
                                                key={event.id}
                                                style={{
                                                    animation: `slideInUp 0.3s ease ${index * 0.05}s both`,
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
                    fontFamily: FONT_FAMILY,
                    height: "100%",
                    opacity: isNavigating ? 0.7 : 1,
                    transform: isNavigating ? "scale(0.98)" : "scale(1)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    overflowY: "auto",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${COLORS.border} transparent`,
                    paddingRight: "4px",
                    padding: COMPACT_SPACING.md,
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "12px",
                        padding: "6px",
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
                                    background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                                    borderRadius: "12px",
                                    padding: "12px",
                                    border: `1px solid ${COLORS.borderLight}`,
                                    boxShadow: `0 4px 15px ${COLORS.shadowLight}`,
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    animation: `fadeInUp 0.4s ease ${index * 0.03}s both`,
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-3px) scale(1.01)";
                                    e.currentTarget.style.boxShadow = `0 8px 20px ${COLORS.shadowMedium}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = `0 4px 15px ${COLORS.shadowLight}`;
                                }}
                            >
                                <div
                                    style={{
                                        textAlign: "center",
                                        fontWeight: "700",
                                        marginBottom: "8px",
                                        color: COLORS.text,
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <CalendarIcon size={16} />
                                    {month.toLocaleDateString("en-US", { month: "long" })}
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(7, 1fr)",
                                        gap: "2px",
                                        fontSize: "10px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                                        <div
                                            key={day}
                                            style={{
                                                textAlign: "center",
                                                fontWeight: "600",
                                                color: COLORS.textSecondary,
                                                padding: "3px",
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
                                                    padding: "3px",
                                                    background: hasContent
                                                        ? `linear-gradient(135deg, ${COLORS.accent}12, ${COLORS.accent}06)`
                                                        : "transparent",
                                                    borderRadius: "4px",
                                                    opacity: isCurrentMonth ? (isPast ? 0.3 : 1) : 0.4,
                                                    fontWeight: isToday ? "700" : "500",
                                                    color: isToday ? COLORS.accent : isPast ? COLORS.textTertiary : COLORS.text,
                                                    cursor: (isCurrentMonth && !isPast) ? "pointer" : "not-allowed",
                                                    transition: "all 0.2s ease",
                                                    position: "relative",
                                                    border: isToday ? `1px solid ${COLORS.accent}` : "1px solid transparent",
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (isCurrentMonth && !isPast) {
                                                        e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.accent}20, ${COLORS.accent}12)`;
                                                        e.currentTarget.style.transform = "scale(1.1)";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (isCurrentMonth && !isPast) {
                                                        e.currentTarget.style.background = hasContent
                                                            ? `linear-gradient(135deg, ${COLORS.accent}12, ${COLORS.accent}06)`
                                                            : "transparent";
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }
                                                }}
                                            >
                                                {day.getDate()}
                                                <div style={{
                                                    position: "absolute",
                                                    top: "1px",
                                                    right: "1px",
                                                    display: "flex",
                                                    gap: "1px"
                                                }}>
                                                    {dayEvents.length > 0 && (
                                                        <div
                                                            style={{
                                                                width: "3px",
                                                                height: "3px",
                                                                backgroundColor: COLORS.accent,
                                                                borderRadius: "50%",
                                                                animation: "pulse 2s infinite",
                                                            }}
                                                        />
                                                    )}
                                                    {dayGoals.length > 0 && (
                                                        <div
                                                            style={{
                                                                width: "3px",
                                                                height: "3px",
                                                                backgroundColor: COLORS.success,
                                                                borderRadius: "50%",
                                                                animation: "pulse 2s infinite",
                                                            }}
                                                        />
                                                    )}
                                                    {dayTodos.length > 0 && (
                                                        <div
                                                            style={{
                                                                width: "3px",
                                                                height: "3px",
                                                                backgroundColor: COLORS.warning,
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

                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    {monthEvents.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: "10px",
                                                color: COLORS.textSecondary,
                                                textAlign: "center",
                                                fontWeight: "600",
                                                padding: "3px 6px",
                                                background: `linear-gradient(135deg, ${COLORS.accent}12, ${COLORS.accent}06)`,
                                                borderRadius: "4px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "3px",
                                            }}
                                        >
                                            📅 {monthEvents.length} event{monthEvents.length > 1 ? "s" : ""}
                                        </div>
                                    )}
                                    {monthGoals.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: "10px",
                                                color: COLORS.textSecondary,
                                                textAlign: "center",
                                                fontWeight: "600",
                                                padding: "3px 6px",
                                                background: `linear-gradient(135deg, ${COLORS.success}12, ${COLORS.success}06)`,
                                                borderRadius: "4px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "3px",
                                            }}
                                        >
                                            🎯 {monthGoals.length} goal{monthGoals.length > 1 ? "s" : ""}
                                        </div>
                                    )}
                                    {monthTodos.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: "10px",
                                                color: COLORS.textSecondary,
                                                textAlign: "center",
                                                fontWeight: "600",
                                                padding: "3px 6px",
                                                background: `linear-gradient(135deg, ${COLORS.warning}12, ${COLORS.warning}06)`,
                                                borderRadius: "4px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "3px",
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

    const SimpleModal = ({ isVisible, onClose, children }: {
        isVisible: boolean;
        onClose: () => void;
        children: React.ReactNode;
    }) => {
        if (!isVisible) return null;

        return (
            <div
                style={{
                    fontFamily: FONT_FAMILY,
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: COLORS.overlay,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(6px)",
                    animation: "fadeIn 0.2s ease",
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                        borderRadius: "16px",
                        padding: "20px",
                        maxWidth: "480px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        boxShadow: `0 15px 35px ${COLORS.shadowHeavy}`,
                        border: `1px solid ${COLORS.borderLight}`,
                        animation: "slideInUp 0.3s ease",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        );
    };

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
                            top: "-6px",
                            right: "-6px",
                            background: `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.border}, ${COLORS.borderLight})`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`;
                        }}
                    >
                        <X size={14} />
                    </button>

                    <div style={{
                        textAlign: "center",
                        marginBottom: "16px",
                        padding: "12px",
                        background: `linear-gradient(135deg, ${previewingEvent.color}12, ${previewingEvent.color}06)`,
                        borderRadius: "10px",
                        border: `1px solid ${previewingEvent.color}25`
                    }}>
                        <h2
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                textAlign: "center",
                                marginBottom: "6px",
                                wordWrap: "break-word",
                                overflowWrap: "break-word",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                maxWidth: "100%",
                                lineHeight: "1.3",
                                color: COLORS.text,
                            }}
                        >
                            {previewingEvent?.title}
                        </h2>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            color: previewingEvent.color,
                            fontWeight: "600",
                            fontSize: "14px"
                        }}>
                            <Clock size={14} />
                            {previewingEvent.startTime} - {previewingEvent.endTime}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px",
                            background: `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`,
                            borderRadius: "8px",
                            border: `1px solid ${COLORS.borderLight}`
                        }}>
                            <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${previewingEvent.color}, ${previewingEvent.color}dd)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "600",
                                fontSize: "14px"
                            }}>
                                {(account?.displayName || account?.email || previewingEvent.person).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: "600", color: COLORS.text, fontSize: "14px" }}>
                                    {account?.displayName || account?.email || previewingEvent.person}
                                </div>
                                <div style={{ color: COLORS.textSecondary, fontSize: "12px" }}>
                                    {account?.provider || previewingEvent.provider || "Google"} Account
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px",
                            background: `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`,
                            borderRadius: "8px",
                            border: `1px solid ${COLORS.borderLight}`
                        }}>
                            <CalendarIcon size={16} color={COLORS.textSecondary} />
                            <div>
                                <div style={{ fontWeight: "600", color: COLORS.text, fontSize: "14px" }}>
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

                        {previewingEvent.location && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "10px",
                                background: `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`,
                                borderRadius: "8px",
                                border: `1px solid ${COLORS.borderLight}`
                            }}>
                                <MapPin size={16} color={COLORS.textSecondary} />
                                <div>
                                    <div style={{ fontWeight: "600", color: COLORS.text, fontSize: "14px" }}>
                                        {previewingEvent.location}
                                    </div>
                                </div>
                            </div>
                        )}

                        {previewingEvent.description && (
                            <div style={{
                                padding: "10px",
                                background: `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`,
                                borderRadius: "8px",
                                border: `1px solid ${COLORS.borderLight}`
                            }}>
                                <div style={{ fontWeight: "600", color: COLORS.text, marginBottom: "4px", fontSize: "14px" }}>
                                    Description
                                </div>
                                <div style={{ color: COLORS.textSecondary, lineHeight: "1.5", fontSize: "13px" }}>
                                    {previewingEvent.description}
                                </div>
                            </div>
                        )}

                        {(() => {
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

                            const isAllDay =
                                previewingEvent.startTime === "12:00 AM" &&
                                previewingEvent.endTime === "11:59 PM";

                            const isPastEvent = (() => {
                                if (isAllDay) {
                                    const endDateStr = previewingEvent.end_date || previewingEvent.date;
                                    const endDate = new Date(endDateStr + "T23:59:59");
                                    const now = new Date();
                                    return now > endDate;
                                } else {
                                    const startTime24 = convertTo24Hour(previewingEvent.startTime);
                                    return (
                                        isPastDate(previewingEvent.date) ||
                                        isPastTime(previewingEvent.date, startTime24)
                                    );
                                }
                            })();

                            if (isPastEvent) return null;

                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "12px",
                                        marginTop: "12px",
                                        paddingTop: "12px",
                                        borderTop: `1px solid ${COLORS.borderLight}`
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            onEditEvent(previewingEvent);
                                            setIsPreviewVisible(false);
                                        }}
                                        style={{
                                            padding: "8px 16px",
                                            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            transition: "all 0.2s ease",
                                            boxShadow: `0 2px 8px ${COLORS.accent}25`,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px"
                                        }}
                                    >
                                        <Edit size={12} />
                                        Edit
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </SimpleModal>
        );
    };

    const getMinDate = () => {
        const today = new Date();
        return formatDateString(today);
    };

    const getMinTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // if (loading) {
    //     return <DocklyLoader />
    // }

    return (
        <div style={{
            fontFamily: FONT_FAMILY,
            background: COLORS.surface,
            // minHeight: "100vh",
            height: '100%',
            borderRadius: 8,
            boxShadow: `0 1px 2px ${COLORS.shadowLight}`,
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            overflow: 'hidden',
        }}>
            <style>
                {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
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
              transform: translateX(-15px);
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
              transform: scale(1.03);
            }
          }

          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, ${COLORS.border}, ${COLORS.textTertiary});
            border-radius: 3px;
            transition: background 0.2s ease;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, ${COLORS.textTertiary}, ${COLORS.textSecondary});
          }
        `}
            </style>

            <div style={{ padding: COMPACT_SPACING.lg }}>
                {/* Enhanced Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button
                            onClick={() => { if (setCurrentDate) setCurrentDate(new Date()); }}
                            style={{
                                padding: "8px 12px",
                                background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                                border: `1px solid ${COLORS.borderLight}`,
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: COLORS.text,
                                transition: "all 0.2s ease",
                                boxShadow: `0 1px 4px ${COLORS.shadowLight}`,
                                fontFamily: FONT_FAMILY,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`;
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = `0 2px 8px ${COLORS.shadowMedium}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`;
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = `0 1px 4px ${COLORS.shadowLight}`;
                            }}
                        >
                            Today
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                                onClick={() => navigateDate("prev")}
                                style={{
                                    padding: "8px",
                                    background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                                    border: `1px solid ${COLORS.borderLight}`,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                    boxShadow: `0 1px 4px ${COLORS.shadowLight}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`;
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`;
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => navigateDate("next")}
                                style={{
                                    padding: "8px",
                                    background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                                    border: `1px solid ${COLORS.borderLight}`,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                    boxShadow: `0 1px 4px ${COLORS.shadowLight}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`;
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`;
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <h3 style={{
                            margin: 0,
                            color: COLORS.text,
                            fontSize: "20px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}>
                            <CalendarIcon size={22} />
                            {view === "Year"
                                ? (currentDate ?? new Date()).getFullYear()
                                : formatDate(currentDate ?? new Date())}
                        </h3>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                        <Select
                            value={view}
                            onChange={(value) => {

                                if (onViewChange) {
                                    onViewChange(value);
                                }
                            }}
                            style={{
                                width: 140,
                                borderRadius: 8,
                                background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                                boxShadow: `0 1px 4px ${COLORS.shadowLight}`,
                                fontWeight: 600,
                                fontSize: 12
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surfaceSecondary}, ${COLORS.borderLight})`;
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = `0 2px 8px ${COLORS.shadowMedium}`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`;
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = `0 1px 4px ${COLORS.shadowLight}`;
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
                            style={{
                                backgroundColor: COLORS.accent,
                                borderColor: COLORS.accent,
                                borderRadius: '6px',
                                height: '32px',
                                width: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                            }}
                        />
                    </div>
                </div>

                {/* Enhanced Quick Add Event */}
                <div style={{ marginTop: '16px' }}>
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
                        background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceSecondary})`,
                        borderRadius: "12px",
                        border: `1px solid ${COLORS.borderLight}`,
                        height: "550px",
                        display: "flex",
                        flexDirection: "column",
                        animation: "fadeInUp 0.4s ease",
                        boxShadow: `0 4px 15px ${COLORS.shadowLight}`,
                        overflow: "hidden",
                    }}
                >
                    {view === "Week" && renderWeekView()}
                    {view === "Month" && renderMonthView()}
                    {view === "Day" && renderDayView()}
                    {view === "Year" && renderYearView()}
                </div>
            </div>

            {/* Event Preview Modal */}
            <EventPreviewModal />

            {/* Enhanced Event Form Modal */}
            <Modal
                title={
                    <Space style={{ fontFamily: FONT_FAMILY }}>
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
                width={520}
                okButtonProps={{
                    style: {
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        fontFamily: FONT_FAMILY,
                    }
                }}
                style={{ fontFamily: FONT_FAMILY }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 12, fontFamily: FONT_FAMILY }}
                    initialValues={{
                        person: getPersonNames()[0] || 'Family'
                    }}
                >
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please enter event title' }]}
                    >
                        <Input placeholder="Add a descriptive title" style={{ fontFamily: FONT_FAMILY }} />
                    </Form.Item>

                    {isAllDay ? (
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item
                                    name="startDate"
                                    label="Start Date"
                                    rules={[{ required: true, message: 'Please select start date' }]}
                                >
                                    <DatePicker style={{ width: '100%', fontFamily: FONT_FAMILY }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="endDate"
                                    label="End Date"
                                    rules={[{ required: true, message: 'Please select end date' }]}
                                >
                                    <DatePicker style={{ width: '100%', fontFamily: FONT_FAMILY }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                                </Form.Item>
                            </Col>
                        </Row>
                    ) : (
                        <Row gutter={8}>
                            <Col span={8}>
                                <Form.Item
                                    name="date"
                                    label="Date"
                                    rules={[{ required: true, message: 'Please select date' }]}
                                >
                                    <DatePicker style={{ width: '100%', fontFamily: FONT_FAMILY }} disabledDate={(current) => current && current < dayjs().startOf('day')} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="startTime"
                                    label={<Space><ClockCircleOutlined />Start Time</Space>}
                                    rules={[{ required: true, message: 'Please select start time' }]}
                                >
                                    <TimePicker style={{ width: '100%', fontFamily: FONT_FAMILY }} format="hh:mm A" use12Hours />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="endTime"
                                    label={<Space><ClockCircleOutlined />End Time</Space>}
                                    rules={[{ required: true, message: 'Please select end time' }]}
                                >
                                    <TimePicker style={{ width: '100%', fontFamily: FONT_FAMILY }} format="hh:mm A" use12Hours />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Form.Item>
                        <Checkbox checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} style={{ fontFamily: FONT_FAMILY }}>
                            All day
                        </Checkbox>
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item
                                name="person"
                                label="Assigned to"
                                rules={[{ required: true, message: 'Please select person' }]}
                            >
                                <Select placeholder="Select person" style={{ fontFamily: FONT_FAMILY }}>
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
                                <Input placeholder="Add email" style={{ fontFamily: FONT_FAMILY }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="location"
                        label={<Space><EnvironmentOutlined />Location</Space>}
                    >
                        <Input placeholder="Add location or meeting link" style={{ fontFamily: FONT_FAMILY }} />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={3} placeholder="Add notes, agenda, or additional details" style={{ fontFamily: FONT_FAMILY }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CustomCalendar;