import React, { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Plus, MapPin, Clock, User, Calendar as CalendarIcon, Edit, X } from "lucide-react";
import { Avatar, Card, Col, DatePicker, Divider, Form, Input, Modal, Popover, Row, Select, Space, Spin, Tag, TimePicker, Typography } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, LinkOutlined, MailOutlined, PlusOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import SmartInputBox from "./smartInput";
import { addEvents } from "../../services/planner";
import { showNotification } from "../../utils/notification";
import DocklyLoader from "../../utils/docklyLoader";

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

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CustomCalendar: React.FC<CalendarProps> = ({
    data,
    personColors = defaultPersonColors,
    onAddEvent,
    onEventClick,
    connectedAccounts = [],
    source,
    allowMentions,
    fetchEvents
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"Day" | "Week" | "Month" | "Year">("Week");
    const [newEventText, setNewEventText] = useState("");
    const [isNavigating, setIsNavigating] = useState(false);
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [previewingEvent, setPreviewingEvent] = useState<Event | null>(null);
    const [allEvents, setAllEvents] = useState<Event[] | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [modalData, setModalData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        person: Object.keys(personColors)[0] || 'Family',
        location: '',
        description: ''
    });

    useEffect(() => {
        if (data?.events) {
            setAllEvents(data.events);
        } else {
            setAllEvents(sampleCalendarData.events);
        }
    }, [data?.events]);

    if (!allEvents) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
                <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500' }}>Loading calendar...</p>
            </div>
        );
    }

    const getPersonData = (person: string): PersonData => {
        return personColors[person] || { color: "#1976d2", email: "" };
    };

    const finalData: CalendarData = {
        events: allEvents,
        meals: data?.meals || sampleCalendarData.meals
    };

    // Helper function to get person color
    const getPersonColor = (person: string): string => {
        return personColors[person]?.color || "#10B981";
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

    const parseEventText = (text: string) => {
        const today = new Date();
        let eventDate = new Date(today);
        let eventTime = "12:00 PM";
        let eventTitle = text;
        let eventPerson = getPersonNames()[0] || "Family";

        const cleanText = text.toLowerCase().trim();

        const personNames = getPersonNames().map((p) => p.toLowerCase());
        for (const person of personNames) {
            if (cleanText.includes(person.toLowerCase())) {
                eventPerson = getPersonNames().find(p => p.toLowerCase() === person) || eventPerson;
                break;
            }
        }

        const timePatterns = [
            /(\d{1,2}):(\d{2})\s*(am|pm)/i,
            /(\d{1,2})\s*(am|pm)/i,
            /at\s+(\d{1,2}):(\d{2})\s*(am|pm)/i,
            /at\s+(\d{1,2})\s*(am|pm)/i,
            /@\s*(\d{1,2}):(\d{2})\s*(am|pm)/i,
            /@\s*(\d{1,2})\s*(am|pm)/i,
        ];

        for (const pattern of timePatterns) {
            const match = cleanText.match(pattern);
            if (match) {
                let hours = parseInt(match[1]);
                const minutes = match[2] ? parseInt(match[2]) : 0;
                const period = match[3] || match[2];

                if (period && period.toLowerCase() === "pm" && hours !== 12) {
                    hours += 12;
                } else if (period && period.toLowerCase() === "am" && hours === 12) {
                    hours = 0;
                }

                eventTime = `${hours > 12 ? hours - 12 : hours || 12}:${minutes
                    .toString()
                    .padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
                break;
            }
        }

        const datePatterns = [
            {
                pattern:
                    /\b(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
                type: "weekday",
            },
            { pattern: /\b(tomorrow)\b/i, type: "tomorrow" },
            { pattern: /\b(today)\b/i, type: "today" },
            { pattern: /\b(next\s+week)\b/i, type: "next_week" },
            { pattern: /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/, type: "date" },
            { pattern: /\b(\d{1,2})\/(\d{1,2})\b/, type: "short_date" },
            {
                pattern:
                    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/i,
                type: "month_day",
            },
        ];

        for (const { pattern, type } of datePatterns) {
            const match = cleanText.match(pattern);
            if (match) {
                switch (type) {
                    case "weekday": {
                        const weekdays = [
                            "sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                        ];
                        const targetDay = weekdays.indexOf(match[2].toLowerCase());
                        const currentDay = today.getDay();
                        const isNext = match[1] && match[1].toLowerCase().includes("next");

                        let daysToAdd = targetDay - currentDay;
                        if (daysToAdd <= 0 || isNext) {
                            daysToAdd += 7;
                        }

                        eventDate = new Date(today);
                        eventDate.setDate(today.getDate() + daysToAdd);
                        break;
                    }

                    case "tomorrow":
                        eventDate = new Date(today);
                        eventDate.setDate(today.getDate() + 1);
                        break;

                    case "today":
                        eventDate = new Date(today);
                        break;

                    case "next_week":
                        eventDate = new Date(today);
                        eventDate.setDate(today.getDate() + 7);
                        break;

                    case "date":
                        eventDate = new Date(
                            parseInt(match[3]),
                            parseInt(match[1]) - 1,
                            parseInt(match[2])
                        );
                        break;

                    case "short_date":
                        eventDate = new Date(
                            today.getFullYear(),
                            parseInt(match[1]) - 1,
                            parseInt(match[2])
                        );
                        break;

                    case "month_day": {
                        const months = [
                            "january",
                            "february",
                            "march",
                            "april",
                            "may",
                            "june",
                            "july",
                            "august",
                            "september",
                            "october",
                            "november",
                            "december",
                        ];
                        const monthIndex = months.indexOf(match[1].toLowerCase());
                        eventDate = new Date(
                            today.getFullYear(),
                            monthIndex,
                            parseInt(match[2])
                        );
                        break;
                    }
                }
                break;
            }
        }

        eventTitle = text
            .replace(
                /\b(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
                ""
            )
            .replace(/\b(tomorrow|today|next\s+week)\b/gi, "")
            .replace(/(\d{1,2}):(\d{2})\s*(am|pm)/gi, "")
            .replace(/(\d{1,2})\s*(am|pm)/gi, "")
            .replace(/at\s+(\d{1,2}):(\d{2})\s*(am|pm)/gi, "")
            .replace(/at\s+(\d{1,2})\s*(am|pm)/gi, "")
            .replace(/@\s*(\d{1,2}):(\d{2})\s*(am|pm)/gi, "")
            .replace(/@\s*(\d{1,2})\s*(am|pm)/gi, "")
            .replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, "")
            .replace(/\b(\d{1,2})\/(\d{1,2})\b/g, "")
            .replace(
                /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/gi,
                ""
            )
            .replace(new RegExp(`\\b(for|with)\\s+(${getPersonNames().join('|')})\\b`, 'gi'), "")
            .replace(/\s+/g, " ")
            .trim();

        return {
            title: eventTitle || "New Event",
            startTime: eventTime,
            date: formatDateString(eventDate),
            person: eventPerson,
            color: getPersonColor(eventPerson),
        };
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
        const newDate = new Date(currentDate);

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
            setCurrentDate(newDate);
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

    const handleAddEvent = () => {
        if (newEventText.trim()) {
            const parsedEvent = parseEventText(newEventText);

            // Check if the parsed date is in the past
            if (isPastDate(parsedEvent.date)) {
                alert("Cannot schedule events in the past. Please select a future date.");
                return;
            }

            const newEvent = {
                ...parsedEvent,
                id: Date.now().toString(),
            };

            setAllEvents(prev => [...(prev ?? []), newEvent]);

            if (onAddEvent) {
                onAddEvent(parsedEvent);
            }
            setNewEventText("");
        }
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

        setSelectedSlot({ date, time });
        setEditingEvent(null);
        setIsModalVisible(true);
    };

    // Modified to show preview instead of edit form
    const handleEventClick = (event: Event) => {
        setPreviewingEvent(event);
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

    const convertTo12Hour = (time24h: string): string => {
        const [hours, minutes] = time24h.split(':').map(Number);
        const modifier = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${modifier}`;
    };

    const getConnectedAccount = (userName: string): ConnectedAccount | null => {
        return connectedAccounts.find(account => account.userName === userName) || null;
    };

    const handleModalSave = () => {
        setLoading(true);

        form.validateFields()
            .then(async (values) => {
                const { title, date, startTime, endTime, person, location, description } = values;

                // Validate date and time
                if (isPastDate(date.format('YYYY-MM-DD'))) {
                    alert("Cannot schedule events in the past. Please select a future date.");
                    setLoading(false);
                    return;
                }

                if (isPastTime(date.format('YYYY-MM-DD'), startTime.format('HH:mm'))) {
                    alert("Cannot schedule events in the past. Please select a future time.");
                    setLoading(false);
                    return;
                }

                if (endTime.isSameOrBefore(startTime)) {
                    alert("End time must be after start time.");
                    setLoading(false);
                    return;
                }

                const newEvent = {
                    id: editingEvent ? editingEvent.id : undefined,
                    title: title.trim(),
                    date: date.format('YYYY-MM-DD'),
                    startTime: startTime.format('h:mm A'),
                    endTime: endTime.format('h:mm A'),
                    person,
                    color: getPersonColor(person),
                    description: description || '',
                    location: location || '',
                };

                try {
                    const response = await addEvents({ ...values });
                    const { message, status } = response.data;

                    if (status) {
                        if (fetchEvents) fetchEvents();
                        showNotification("Success", message, "success");
                    } else {
                        showNotification("Error", message, "error");
                    }

                    // Optional local update
                    // if (editingEvent) {
                    //     setAllEvents(prev => (prev ?? []).map(event =>
                    //         event.id === editingEvent.id ? newEvent : event
                    //     ));
                    // } else {
                    //     setAllEvents(prev => [...(prev ?? []), newEvent]);
                    // }

                    if (onAddEvent) onAddEvent(newEvent);

                    setIsModalVisible(false);
                    setEditingEvent(null);
                    form.resetFields();
                } catch (error) {
                    console.error("Failed to save event:", error);
                    showNotification("Error", "Failed to save event.", "error");
                }

                setLoading(false);
            })
            .catch((error) => {
                console.log('Validation failed:', error);
                setLoading(false);
            });
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
                    {event.person}
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
                </div>

                {showMeals && meals.length > 0 && (
                    <div
                        style={{
                            borderTop: "1px solid #e2e8f0",
                            paddingTop: "12px",
                            maxHeight: "80px",
                            overflowY: "auto",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "10px",
                                fontWeight: "800",
                                color: "#6b7280",
                                marginBottom: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            🍽️ MEALS
                        </div>
                        {meals.slice(0, 2).map((meal, mealIndex) => (
                            <div
                                key={meal.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    fontSize: "11px",
                                    color: "#4b5563",
                                    marginBottom: "6px",
                                    padding: "6px 8px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    animation: `fadeInLeft 0.5s ease ${mealIndex * 0.1}s both`,
                                }}
                            >
                                <span style={{ fontSize: "14px" }}>{meal.emoji}</span>
                                <span style={{ fontWeight: "600" }}>{meal.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };
    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);

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
                        return (
                            <div
                                key={index}
                                style={{
                                    padding: "16px 12px",
                                    textAlign: "center",
                                    borderLeft: index > 0 ? "1px solid #e2e8f0" : "none",
                                    transition: "all 0.2s ease",
                                    background: isToday ? "linear-gradient(135deg, #3b82f615, #3b82f608)" : "transparent",
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
                                    position: "relative"
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
                            const dayEvents = getEventsForDate(day);
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
        const monthDays = getMonthDays(currentDate);
        const currentMonth = currentDate.getMonth();

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
        const dayEvents = getEventsForDate(currentDate);
        const dayMeals = getMealsForDate(currentDate);

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
                        {currentDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                </div>

                <div
                    style={{ display: "flex", gap: "20px", flex: 1, overflow: "hidden" }}
                >
                    <div style={{ flex: 2 }}>
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
                                    animation: "slideInRight 0.5s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                🍽️ Meals
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
                                {dayMeals.length === 0 ? (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "60px 20px",
                                            animation: "fadeIn 0.5s ease",
                                        }}
                                    >
                                        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍽️</div>
                                        <p
                                            style={{
                                                color: "#6b7280",
                                                fontSize: "16px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            No meals planned for today
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "12px",
                                        }}
                                    >
                                        {dayMeals.map((meal, index) => (
                                            <div
                                                key={meal.id}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "16px",
                                                    padding: "16px",
                                                    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                                                    borderRadius: "16px",
                                                    transition: "all 0.3s ease",
                                                    animation: `slideInRight 0.5s ease ${index * 0.1}s both`,
                                                    cursor: "pointer",
                                                    border: "1px solid #e2e8f0",
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = "linear-gradient(135deg, #e2e8f0, #cbd5e1)";
                                                    e.currentTarget.style.transform = "translateX(4px) scale(1.02)";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = "linear-gradient(135deg, #f8fafc, #f1f5f9)";
                                                    e.currentTarget.style.transform = "translateX(0) scale(1)";
                                                }}
                                            >
                                                <span style={{ fontSize: "24px" }}>{meal.emoji}</span>
                                                <span
                                                    style={{
                                                        fontSize: "16px",
                                                        color: "#1f2937",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {meal.name}
                                                </span>
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
        const currentYear = currentDate.getFullYear();
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
                                        const isCurrentMonth = day.getMonth() === index;
                                        const isToday = day.toDateString() === new Date().toDateString();
                                        const isPast = isPastDate(formatDateString(day));

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
                                                    background: dayEvents.length > 0
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
                                                        e.currentTarget.style.background = dayEvents.length > 0
                                                            ? "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                                            : "transparent";
                                                        e.currentTarget.style.transform = "scale(1)";
                                                    }
                                                }}
                                            >
                                                {day.getDate()}
                                                {dayEvents.length > 0 && (
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            top: "2px",
                                                            right: "2px",
                                                            width: "6px",
                                                            height: "6px",
                                                            backgroundColor: "#3B82F6",
                                                            borderRadius: "50%",
                                                            animation: "pulse 2s infinite",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {monthEvents.length > 0 && (
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#6b7280",
                                            textAlign: "center",
                                            fontWeight: "600",
                                            padding: "8px 12px",
                                            background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        📅 {monthEvents.length} event{monthEvents.length > 1 ? "s" : ""}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

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

    // New Preview Modal Component
    const EventPreviewModal = () => {
        if (!isPreviewVisible || !previewingEvent) return null;

        const account = getConnectedAccount(previewingEvent.person);

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
                            {previewingEvent.startTime}
                            {previewingEvent.endTime && ` - ${previewingEvent.endTime}`}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                                {(account?.displayName || previewingEvent.person).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: "600", color: "#1f2937", fontSize: "16px" }}>
                                    {account?.displayName || previewingEvent.person}
                                </div>
                                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                                    {getPersonData(previewingEvent.person).email}
                                </div>
                            </div>
                        </div>

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
                                    {new Date(previewingEvent.date).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                        </div>

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

                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "16px",
                            marginTop: "20px",
                            paddingTop: "20px",
                            borderTop: "1px solid #e2e8f0"
                        }}>
                            <button
                                onClick={handleEditFromPreview}
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
                        onClick={() => setCurrentDate(new Date())}
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
                            ? currentDate.getFullYear()
                            : formatDate(currentDate)}
                    </h3>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                    {(["Day", "Week", "Month", "Year"] as const).map((viewType) => (
                        <button
                            key={viewType}
                            onClick={() => setView(viewType)}
                            style={{
                                padding: "12px 20px",
                                background: view === viewType
                                    ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                                    : "linear-gradient(135deg, #ffffff, #f8fafc)",
                                color: view === viewType ? "white" : "#374151",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600",
                                transition: "all 0.3s ease",
                                boxShadow: view === viewType
                                    ? "0 4px 12px rgba(59, 130, 246, 0.3)"
                                    : "0 2px 8px rgba(0, 0, 0, 0.05)",
                            }}
                            onMouseEnter={(e) => {
                                if (view !== viewType) {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9, #e2e8f0)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (view !== viewType) {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #ffffff, #f8fafc)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            {viewType}
                        </button>
                    ))}
                </div>
            </div>

            {/* Enhanced Quick Add Event */}
            <div style={{ marginTop: "24px" }}>
                <SmartInputBox />
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
            <Card style={{ marginTop: 16 }}>
                <Space wrap>
                    <Text strong>Connected Accounts:</Text>
                    {Object.entries(personColors).map(([userName, personData]) => {
                        const account = getConnectedAccount(userName);
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
                                            {account?.accountType && (
                                                <Space>
                                                    <LinkOutlined />
                                                    <Tag color="blue">{account.accountType}</Tag>
                                                </Space>
                                            )}
                                        </Space>
                                    </div>
                                }
                                title="Account Information"
                            >
                                <Tag
                                    style={{ cursor: 'pointer', padding: '4px 12px', border: `1px solid ${personData.color}`, borderRadius: '12px', }}
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
            </Card>

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

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Date"
                                rules={[{ required: true, message: 'Please select date' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="person"
                                label="Assigned to"
                                rules={[{ required: true, message: 'Please select person' }]}
                            >
                                <Select placeholder="Select person">
                                    {Object.keys(personColors).map(userName => {
                                        const account = getConnectedAccount(userName);
                                        return (
                                            <Option key={userName} value={userName}>
                                                <Space>
                                                    <Avatar
                                                        size="small"
                                                        style={{ backgroundColor: getPersonData(userName).color }}
                                                    >
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
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startTime"
                                label={<Space><ClockCircleOutlined />Start Time</Space>}
                                rules={[{ required: true, message: 'Please select start time' }]}
                            >
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format="hh:mm A"
                                    use12Hours
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endTime"
                                label={<Space><ClockCircleOutlined />End Time</Space>}
                                rules={[{ required: true, message: 'Please select end time' }]}
                            >
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format="hh:mm A"
                                    use12Hours
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="location"
                        label={<Space><EnvironmentOutlined />Location</Space>}
                    >
                        <Input placeholder="Add location or meeting link" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Add notes, agenda, or additional details"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CustomCalendar;