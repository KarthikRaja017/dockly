import React, { useState, useEffect } from 'react';
import {
    Button,
    Input,
    Checkbox,
    Modal,
    Form,
    DatePicker,
    TimePicker,
    Select,
    Space,
    Divider,
    Avatar,
    Tag,
    Tooltip,
    Badge
} from 'antd';
import {
    PlusOutlined,
    LeftOutlined,
    RightOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    UserOutlined,
    MoreOutlined,
    SearchOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    StarOutlined,
    BellOutlined,
    TeamOutlined,
    HomeOutlined,
    HeartOutlined,
    BookOutlined,
    CoffeeOutlined,
    CarOutlined,
    ShoppingOutlined,
    MedicineBoxOutlined,
    BankOutlined,
    GiftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface Event {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    calendar: string;
    color: string;
    description?: string;
    location?: string;
    priority?: 'low' | 'medium' | 'high';
    attendees?: string[];
    category?: string;
}

interface Calendar {
    id: string;
    name: string;
    color: string;
    enabled: boolean;
    type: 'personal' | 'other';
    icon?: string;
    gradient?: string;
}

// Enhanced sample data with more colorful events
const sampleEvents: Event[] = [
    {
        id: '1',
        title: 'Morning Standup Meeting',
        startTime: '09:00',
        endTime: '09:30',
        date: '2025-01-08',
        calendar: 'work',
        color: '#6366f1',
        description: 'Daily team sync and planning',
        location: 'Conference Room A',
        priority: 'high',
        category: 'meeting',
        attendees: ['John', 'Sarah', 'Mike']
    },
    {
        id: '2',
        title: 'Yoga & Meditation',
        startTime: '07:00',
        endTime: '08:00',
        date: '2025-01-08',
        calendar: 'health',
        color: '#10b981',
        description: 'Morning wellness routine',
        location: 'Home Studio',
        priority: 'medium',
        category: 'wellness'
    },
    {
        id: '3',
        title: 'Client Presentation',
        startTime: '14:00',
        endTime: '15:30',
        date: '2025-01-08',
        calendar: 'work',
        color: '#6366f1',
        description: 'Q4 results presentation to stakeholders',
        location: 'Main Conference Hall',
        priority: 'high',
        category: 'presentation',
        attendees: ['Client Team', 'Management']
    },
    {
        id: '4',
        title: 'Coffee with Emma',
        startTime: '16:00',
        endTime: '17:00',
        date: '2025-01-08',
        calendar: 'personal',
        color: '#f59e0b',
        description: 'Catch up over coffee',
        location: 'Starbucks Downtown',
        priority: 'low',
        category: 'social'
    },
    {
        id: '5',
        title: 'Grocery Shopping',
        startTime: '10:00',
        endTime: '11:30',
        date: '2025-01-09',
        calendar: 'personal',
        color: '#f59e0b',
        description: 'Weekly grocery run',
        location: 'Whole Foods Market',
        priority: 'medium',
        category: 'shopping'
    },
    {
        id: '6',
        title: 'Doctor Appointment',
        startTime: '15:00',
        endTime: '16:00',
        date: '2025-01-09',
        calendar: 'health',
        color: '#10b981',
        description: 'Annual health checkup',
        location: 'City Medical Center',
        priority: 'high',
        category: 'medical'
    },
    {
        id: '7',
        title: 'Book Club Meeting',
        startTime: '19:00',
        endTime: '21:00',
        date: '2025-01-09',
        calendar: 'hobbies',
        color: '#8b5cf6',
        description: 'Discussing "The Great Gatsby"',
        location: 'Central Library',
        priority: 'medium',
        category: 'hobby'
    },
    {
        id: '8',
        title: 'Team Building Event',
        startTime: '13:00',
        endTime: '17:00',
        date: '2025-01-10',
        calendar: 'work',
        color: '#6366f1',
        description: 'Quarterly team building activities',
        location: 'Adventure Park',
        priority: 'medium',
        category: 'team-building',
        attendees: ['Entire Team']
    },
    {
        id: '9',
        title: 'Date Night',
        startTime: '19:30',
        endTime: '22:00',
        date: '2025-01-10',
        calendar: 'personal',
        color: '#ec4899',
        description: 'Romantic dinner at favorite restaurant',
        location: 'La Bernardin',
        priority: 'high',
        category: 'romance'
    },
    {
        id: '10',
        title: 'Weekend Hiking',
        startTime: '08:00',
        endTime: '16:00',
        date: '2025-01-11',
        calendar: 'hobbies',
        color: '#8b5cf6',
        description: 'Mountain trail hiking adventure',
        location: 'Blue Ridge Mountains',
        priority: 'medium',
        category: 'outdoor'
    },
    {
        id: '11',
        title: 'Family Brunch',
        startTime: '11:00',
        endTime: '13:00',
        date: '2025-01-12',
        calendar: 'family',
        color: '#f97316',
        description: 'Sunday family gathering',
        location: 'Mom\'s House',
        priority: 'high',
        category: 'family'
    }
];

const sampleCalendars: Calendar[] = [
    {
        id: 'work',
        name: 'Work & Career',
        color: '#6366f1',
        enabled: true,
        type: 'personal',
        icon: '💼',
        gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)'
    },
    {
        id: 'personal',
        name: 'Personal Life',
        color: '#f59e0b',
        enabled: true,
        type: 'personal',
        icon: '🏠',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
        id: 'health',
        name: 'Health & Fitness',
        color: '#10b981',
        enabled: true,
        type: 'personal',
        icon: '💪',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
        id: 'hobbies',
        name: 'Hobbies & Fun',
        color: '#8b5cf6',
        enabled: true,
        type: 'personal',
        icon: '🎨',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
        id: 'family',
        name: 'Family Time',
        color: '#f97316',
        enabled: true,
        type: 'personal',
        icon: '👨‍👩‍👧‍👦',
        gradient: 'linear-gradient(135deg, #f97316, #ea580c)'
    },
    {
        id: 'birthdays',
        name: 'Birthdays & Events',
        color: '#ec4899',
        enabled: true,
        type: 'personal',
        icon: '🎂',
        gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
    },
    {
        id: 'holidays',
        name: 'Holidays & Festivals',
        color: '#ef4444',
        enabled: true,
        type: 'other',
        icon: '🎉',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
        id: 'travel',
        name: 'Travel & Adventures',
        color: '#06b6d4',
        enabled: true,
        type: 'other',
        icon: '✈️',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
    }
];

const App: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [events, setEvents] = useState<Event[]>(sampleEvents);
    const [calendars, setCalendars] = useState<Calendar[]>(sampleCalendars);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEventModalVisible, setIsEventModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [form] = Form.useForm();

    // Helper functions
    const formatDateString = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const parseTime = (timeStr: string): { hour: number; minute: number } => {
        const [hour, minute] = timeStr.split(':').map(Number);
        return { hour, minute };
    };

    const formatTime = (hour: number, minute: number): string => {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    const getWeekDays = (date: Date): Date[] => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - day);

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }
        return weekDays;
    };

    const getMonthDays = (date: Date): Date[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    };

    const getEventsForDate = (date: Date): Event[] => {
        const dateStr = formatDateString(date);
        const enabledCalendarIds = calendars.filter(cal => cal.enabled).map(cal => cal.id);
        return events.filter(event =>
            event.date === dateStr && enabledCalendarIds.includes(event.calendar)
        );
    };

    const getCalendarById = (id: string): Calendar | undefined => {
        return calendars.find(cal => cal.id === id);
    };

    // Navigation functions
    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);

        switch (view) {
            case 'day':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
                break;
            case 'month':
                newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
                break;
            case 'year':
                newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
                break;
        }

        setCurrentDate(newDate);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    // Event handlers
    const handleCreateEvent = () => {
        setIsCreateModalVisible(true);
        form.resetFields();
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setIsEventModalVisible(true);
    };

    const handleTimeSlotClick = (date: Date, hour: number) => {
        const newEvent: Partial<Event> = {
            date: formatDateString(date),
            startTime: formatTime(hour, 0),
            endTime: formatTime(hour + 1, 0),
            calendar: 'work'
        };

        form.setFieldsValue({
            title: '',
            date: dayjs(date),
            startTime: dayjs().hour(hour).minute(0),
            endTime: dayjs().hour(hour + 1).minute(0),
            calendar: 'work',
            description: '',
            location: '',
            priority: 'medium'
        });

        setIsCreateModalVisible(true);
    };

    const handleSaveEvent = (values: any) => {
        const newEvent: Event = {
            id: Date.now().toString(),
            title: values.title,
            date: values.date.format('YYYY-MM-DD'),
            startTime: values.startTime.format('HH:mm'),
            endTime: values.endTime.format('HH:mm'),
            calendar: values.calendar,
            color: getCalendarById(values.calendar)?.color || '#6366f1',
            description: values.description || '',
            location: values.location || '',
            priority: values.priority || 'medium',
            category: values.category || 'general'
        };

        setEvents([...events, newEvent]);
        setIsCreateModalVisible(false);
        form.resetFields();
    };

    const handleCalendarToggle = (calendarId: string) => {
        setCalendars(calendars.map(cal =>
            cal.id === calendarId ? { ...cal, enabled: !cal.enabled } : cal
        ));
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: { [key: string]: string } = {
            meeting: '👥',
            presentation: '📊',
            social: '☕',
            shopping: '🛒',
            medical: '🏥',
            hobby: '🎨',
            'team-building': '🤝',
            romance: '💕',
            outdoor: '🏔️',
            family: '👨‍👩‍👧‍👦',
            wellness: '🧘',
            general: '📅'
        };
        return icons[category || 'general'] || '📅';
    };

    // Render mini calendar
    const renderMiniCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const current = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        const today = new Date();
        const isToday = (date: Date) => date.toDateString() === today.toDateString();
        const isCurrentMonth = (date: Date) => date.getMonth() === month;

        return (
            <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '16px',
                margin: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <span style={{
                        fontWeight: 700,
                        fontSize: '16px',
                        color: '#1e293b',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <div>
                        <Button
                            type="text"
                            size="small"
                            icon={<LeftOutlined />}
                            onClick={() => navigateMonth('prev')}
                            style={{
                                marginRight: '4px',
                                borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: 'none',
                                color: '#6366f1'
                            }}
                        />
                        <Button
                            type="text"
                            size="small"
                            icon={<RightOutlined />}
                            onClick={() => navigateMonth('next')}
                            style={{
                                borderRadius: '8px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: 'none',
                                color: '#6366f1'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} style={{
                            textAlign: 'center',
                            padding: '8px 4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#64748b'
                        }}>
                            {day}
                        </div>
                    ))}

                    {days.map((date, index) => {
                        const hasEvents = getEventsForDate(date).length > 0;
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    setCurrentDate(date);
                                    setSelectedDate(date);
                                }}
                                style={{
                                    textAlign: 'center',
                                    padding: '8px 4px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    background: isToday(date)
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : hasEvents
                                            ? 'rgba(99, 102, 241, 0.1)'
                                            : 'transparent',
                                    color: isToday(date)
                                        ? 'white'
                                        : isCurrentMonth(date)
                                            ? '#1e293b'
                                            : '#94a3b8',
                                    fontWeight: isToday(date) ? 700 : hasEvents ? 600 : 400,
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isToday(date)) {
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isToday(date)) {
                                        e.currentTarget.style.background = hasEvents ? 'rgba(99, 102, 241, 0.1)' : 'transparent';
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }
                                }}
                            >
                                {date.getDate()}
                                {hasEvents && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '2px',
                                        right: '2px',
                                        width: '6px',
                                        height: '6px',
                                        background: isToday(date) ? 'white' : '#6366f1',
                                        borderRadius: '50%'
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Enhanced Event Card Component
    const EventCard = ({ event, size = 'normal', showDetails = true }: {
        event: Event;
        size?: 'small' | 'normal' | 'large';
        showDetails?: boolean;
    }) => {
        const calendar = getCalendarById(event.calendar);

        return (
            <div
                onClick={() => handleEventClick(event)}
                style={{
                    background: calendar?.gradient || `linear-gradient(135deg, ${event.color}, ${event.color}dd)`,
                    borderRadius: size === 'small' ? '8px' : '12px',
                    padding: size === 'small' ? '8px 12px' : '12px 16px',
                    color: 'white',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                }}
            >
                {/* Decorative gradient overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '30px',
                    height: '30px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '0 12px 0 30px'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        fontSize: size === 'small' ? '10px' : '11px',
                        fontWeight: 600,
                        opacity: 0.9
                    }}>
                        <span>{getCategoryIcon(event.category || 'general')}</span>
                        <span>{event.startTime}</span>
                        {event.priority && <span>{getPriorityIcon(event.priority)}</span>}
                    </div>

                    <div style={{
                        fontSize: size === 'small' ? '12px' : '14px',
                        fontWeight: 700,
                        marginBottom: showDetails ? '4px' : '0',
                        lineHeight: '1.2'
                    }}>
                        {event.title}
                    </div>

                    {showDetails && event.location && (
                        <div style={{
                            fontSize: '10px',
                            opacity: 0.8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <EnvironmentOutlined style={{ fontSize: '8px' }} />
                            {event.location}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render Day View
    const renderDayView = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const dayEvents = getEventsForDate(currentDate);
        const isToday = currentDate.toDateString() === new Date().toDateString();

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Day Header */}
                <div style={{
                    background: isToday
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    padding: '20px',
                    borderRadius: '16px 16px 0 0',
                    marginBottom: '1px'
                }}>
                    <div style={{
                        textAlign: 'center',
                        color: isToday ? 'white' : '#1e293b'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            marginBottom: '8px',
                            opacity: 0.8
                        }}>
                            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </div>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 800
                        }}>
                            {currentDate.getDate()}
                        </div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            opacity: 0.9
                        }}>
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Time Grid */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    background: 'white',
                    borderRadius: '0 0 16px 16px'
                }}>
                    {/* Time labels */}
                    <div style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
                        {hours.map(hour => (
                            <div key={hour} style={{
                                height: '60px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-end',
                                paddingRight: '12px',
                                paddingTop: '8px',
                                fontSize: '12px',
                                color: '#64748b',
                                borderBottom: '1px solid #e2e8f0',
                                fontWeight: 600
                            }}>
                                {hour === 0 ? '' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                            </div>
                        ))}
                    </div>

                    {/* Day column */}
                    <div style={{
                        position: 'relative',
                        borderLeft: '2px solid #e2e8f0'
                    }}>
                        {hours.map(hour => (
                            <div
                                key={hour}
                                onClick={() => handleTimeSlotClick(currentDate, hour)}
                                style={{
                                    height: '60px',
                                    borderBottom: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease',
                                    background: hour >= 9 && hour <= 17 ? '#ffffff' : '#fafbfc'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = hour >= 9 && hour <= 17 ? '#ffffff' : '#fafbfc';
                                }}
                            />
                        ))}

                        {/* Events */}
                        {dayEvents.map((event, eventIndex) => {
                            const startTime = parseTime(event.startTime);
                            const endTime = parseTime(event.endTime);
                            const topPosition = startTime.hour * 60 + (startTime.minute / 60) * 60;
                            const height = Math.max(
                                ((endTime.hour - startTime.hour) * 60 + ((endTime.minute - startTime.minute) / 60) * 60),
                                40
                            );

                            return (
                                <div
                                    key={event.id}
                                    style={{
                                        position: 'absolute',
                                        top: `${topPosition}px`,
                                        left: `${eventIndex * 4 + 8}px`,
                                        right: '8px',
                                        height: `${height}px`,
                                        zIndex: 10
                                    }}
                                >
                                    <EventCard event={event} size="normal" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Render week view
    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px repeat(7, 1fr)',
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderRadius: '16px 16px 0 0',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px 12px' }}></div>
                    {weekDays.map((day, index) => {
                        const isToday = day.toDateString() === new Date().toDateString();
                        const dayEvents = getEventsForDate(day);

                        return (
                            <div key={index} style={{
                                padding: '16px 12px',
                                textAlign: 'center',
                                borderLeft: index > 0 ? '1px solid #e2e8f0' : 'none',
                                background: isToday ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                                color: isToday ? 'white' : '#1e293b',
                                position: 'relative'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    marginBottom: '8px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    opacity: 0.8
                                }}>
                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 800,
                                    position: 'relative'
                                }}>
                                    {day.getDate()}
                                    {dayEvents.length > 0 && (
                                        <Badge
                                            count={dayEvents.length}
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                background: isToday ? 'white' : '#6366f1',
                                                color: isToday ? '#6366f1' : 'white',
                                                fontSize: '10px',
                                                minWidth: '18px',
                                                height: '18px',
                                                lineHeight: '18px'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Time grid */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: '80px repeat(7, 1fr)',
                    background: 'white',
                    borderRadius: '0 0 16px 16px'
                }}>
                    {/* Time labels */}
                    <div style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
                        {hours.map(hour => (
                            <div key={hour} style={{
                                height: '60px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-end',
                                paddingRight: '12px',
                                paddingTop: '8px',
                                fontSize: '12px',
                                color: '#64748b',
                                borderBottom: '1px solid #e2e8f0',
                                fontWeight: 600
                            }}>
                                {hour === 0 ? '' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {weekDays.map((day, dayIndex) => {
                        const dayEvents = getEventsForDate(day);
                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                            <div key={dayIndex} style={{
                                position: 'relative',
                                borderLeft: '1px solid #e2e8f0',
                                background: isToday ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.02), transparent)' : 'transparent'
                            }}>
                                {hours.map(hour => (
                                    <div
                                        key={hour}
                                        onClick={() => handleTimeSlotClick(day, hour)}
                                        style={{
                                            height: '60px',
                                            borderBottom: '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease',
                                            background: hour >= 9 && hour <= 17 ? 'transparent' : 'rgba(248, 250, 252, 0.5)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08))';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = hour >= 9 && hour <= 17 ? 'transparent' : 'rgba(248, 250, 252, 0.5)';
                                        }}
                                    />
                                ))}

                                {/* Events */}
                                {dayEvents.map((event, eventIndex) => {
                                    const startTime = parseTime(event.startTime);
                                    const endTime = parseTime(event.endTime);
                                    const topPosition = startTime.hour * 60 + (startTime.minute / 60) * 60;
                                    const height = Math.max(
                                        ((endTime.hour - startTime.hour) * 60 + ((endTime.minute - startTime.minute) / 60) * 60),
                                        40
                                    );

                                    return (
                                        <div
                                            key={event.id}
                                            style={{
                                                position: 'absolute',
                                                top: `${topPosition}px`,
                                                left: `${eventIndex * 3 + 4}px`,
                                                right: '4px',
                                                height: `${height}px`,
                                                zIndex: 10
                                            }}
                                        >
                                            <EventCard event={event} size="small" showDetails={false} />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render Month View
    const renderMonthView = () => {
        const monthDays = getMonthDays(currentDate);
        const currentMonth = currentDate.getMonth();
        const today = new Date();

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Month Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderRadius: '16px 16px 0 0',
                    overflow: 'hidden'
                }}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                        <div key={day} style={{
                            padding: '16px 8px',
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#1e293b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderLeft: day !== 'Sunday' ? '1px solid #e2e8f0' : 'none'
                        }}>
                            {day.slice(0, 3)}
                        </div>
                    ))}
                </div>

                {/* Month Grid */}
                <div style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridTemplateRows: 'repeat(6, 1fr)',
                    background: 'white',
                    borderRadius: '0 0 16px 16px',
                    overflow: 'hidden'
                }}>
                    {monthDays.map((day, index) => {
                        const isCurrentMonth = day.getMonth() === currentMonth;
                        const isToday = day.toDateString() === today.toDateString();
                        const dayEvents = getEventsForDate(day);

                        return (
                            <div
                                key={index}
                                onClick={() => handleTimeSlotClick(day, 12)}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderTop: 'none',
                                    borderLeft: index % 7 === 0 ? '1px solid #e2e8f0' : 'none',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    background: isToday
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
                                        : 'white',
                                    minHeight: '120px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isToday) {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isToday) {
                                        e.currentTarget.style.background = 'white';
                                    }
                                }}
                            >
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: isToday ? 800 : 600,
                                    color: isToday ? 'white' : (isCurrentMonth ? '#1e293b' : '#94a3b8'),
                                    marginBottom: '8px',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    background: isToday ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent'
                                }}>
                                    {day.getDate()}
                                </div>

                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            size="small"
                                            showDetails={false}
                                        />
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#6366f1',
                                            fontWeight: 600,
                                            padding: '4px 8px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: '6px',
                                            textAlign: 'center'
                                        }}>
                                            +{dayEvents.length - 3} more
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

    // Render Year View
    const renderYearView = () => {
        const currentYear = currentDate.getFullYear();
        const months = [];

        for (let i = 0; i < 12; i++) {
            months.push(new Date(currentYear, i, 1));
        }

        return (
            <div style={{
                padding: '20px',
                overflowY: 'auto',
                height: '100%',
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '16px'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px'
                }}>
                    {months.map((month, monthIndex) => {
                        const monthDays = getMonthDays(month);
                        const monthEvents = events.filter(event => {
                            const eventDate = new Date(event.date);
                            return eventDate.getFullYear() === currentYear &&
                                eventDate.getMonth() === monthIndex;
                        });

                        return (
                            <div
                                key={monthIndex}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => {
                                    setCurrentDate(month);
                                    setView('month');
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                }}
                            >
                                <div style={{
                                    textAlign: 'center',
                                    fontWeight: 700,
                                    marginBottom: '16px',
                                    color: '#1e293b',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {month.toLocaleDateString('en-US', { month: 'long' })}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '2px',
                                    fontSize: '11px',
                                    marginBottom: '12px'
                                }}>
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                        <div key={day} style={{
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            color: '#64748b',
                                            padding: '4px'
                                        }}>
                                            {day}
                                        </div>
                                    ))}

                                    {monthDays.slice(0, 35).map((day, dayIndex) => {
                                        const isCurrentMonth = day.getMonth() === monthIndex;
                                        const isToday = day.toDateString() === new Date().toDateString();
                                        const hasEvents = getEventsForDate(day).length > 0;

                                        return (
                                            <div
                                                key={dayIndex}
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '4px',
                                                    color: isCurrentMonth ? (isToday ? '#6366f1' : '#1e293b') : '#94a3b8',
                                                    fontWeight: isToday ? 700 : hasEvents ? 600 : 400,
                                                    background: hasEvents
                                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))'
                                                        : 'transparent',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    position: 'relative'
                                                }}
                                            >
                                                {day.getDate()}
                                                {hasEvents && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '1px',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: '4px',
                                                        height: '4px',
                                                        background: '#6366f1',
                                                        borderRadius: '50%'
                                                    }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {monthEvents.length > 0 && (
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#6366f1',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        padding: '8px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        borderRadius: '8px'
                                    }}>
                                        🎉 {monthEvents.length} event{monthEvents.length > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getViewTitle = () => {
        switch (view) {
            case 'day':
                return currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
            case 'week':
                const weekDays = getWeekDays(currentDate);
                const startWeek = weekDays[0];
                const endWeek = weekDays[6];
                if (startWeek.getMonth() === endWeek.getMonth()) {
                    return `${startWeek.toLocaleDateString('en-US', { month: 'long' })} ${startWeek.getDate()} – ${endWeek.getDate()}, ${startWeek.getFullYear()}`;
                } else {
                    return `${startWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startWeek.getFullYear()}`;
                }
            case 'month':
                return currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });
            case 'year':
                return currentDate.getFullYear().toString();
            default:
                return '';
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            padding: '20px',
            gap: '20px'
        }}>
            {/* Sidebar */}
            <div style={{
                width: '320px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Create button */}
                <div style={{ padding: '20px' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateEvent}
                        style={{
                            width: '100%',
                            height: '56px',
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        Create Event
                    </Button>
                </div>

                {/* Mini calendar */}
                {renderMiniCalendar()}

                {/* Search */}
                <div style={{ padding: '0 20px 20px' }}>
                    <Input
                        placeholder="Search events..."
                        prefix={<SearchOutlined style={{ color: '#6366f1' }} />}
                        style={{
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                            border: '1px solid #e2e8f0',
                            height: '44px'
                        }}
                    />
                </div>

                {/* My calendars */}
                <div style={{ padding: '0 20px', flex: 1, overflowY: 'auto' }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1e293b',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        My Calendars
                        <Button type="text" size="small" icon={<MoreOutlined />} />
                    </div>

                    {calendars.filter(cal => cal.type === 'personal').map(calendar => (
                        <div key={calendar.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Checkbox
                                checked={calendar.enabled}
                                onChange={() => handleCalendarToggle(calendar.id)}
                                style={{ marginRight: '12px' }}
                            />
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: calendar.gradient || calendar.color,
                                marginRight: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }} />
                            <span style={{
                                fontSize: '14px',
                                color: '#1e293b',
                                flex: 1,
                                fontWeight: 500
                            }}>
                                {calendar.icon} {calendar.name}
                            </span>
                        </div>
                    ))}

                    <Divider style={{ margin: '20px 0' }} />

                    {/* Other calendars */}
                    <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1e293b',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        Other Calendars
                        <Button type="text" size="small" icon={<PlusOutlined />} />
                    </div>

                    {calendars.filter(cal => cal.type === 'other').map(calendar => (
                        <div key={calendar.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 0',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            marginBottom: '4px',
                            transition: 'all 0.2s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Checkbox
                                checked={calendar.enabled}
                                onChange={() => handleCalendarToggle(calendar.id)}
                                style={{ marginRight: '12px' }}
                            />
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: calendar.gradient || calendar.color,
                                marginRight: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }} />
                            <span style={{
                                fontSize: '14px',
                                color: '#1e293b',
                                flex: 1,
                                fontWeight: 500
                            }}>
                                {calendar.icon} {calendar.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 30px',
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <Button
                            onClick={goToToday}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: 600,
                                height: '40px',
                                color: 'white',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            Today
                        </Button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Button
                                type="text"
                                icon={<LeftOutlined />}
                                onClick={() => navigateDate('prev')}
                                style={{
                                    color: '#6366f1',
                                    borderRadius: '8px',
                                    background: 'rgba(99, 102, 241, 0.1)'
                                }}
                            />
                            <Button
                                type="text"
                                icon={<RightOutlined />}
                                onClick={() => navigateDate('next')}
                                style={{
                                    color: '#6366f1',
                                    borderRadius: '8px',
                                    background: 'rgba(99, 102, 241, 0.1)'
                                }}
                            />
                        </div>

                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 800,
                            color: '#1e293b',
                            margin: 0,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {getViewTitle()}
                        </h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Button type="text" icon={<SearchOutlined />} style={{ color: '#6366f1' }} />
                        <Button type="text" icon={<BellOutlined />} style={{ color: '#6366f1' }} />
                        <Button type="text" icon={<SettingOutlined />} style={{ color: '#6366f1' }} />
                        <Select
                            value={view}
                            onChange={setView}
                            style={{ width: '120px' }}
                            bordered={false}
                        >
                            <Option value="day">📅 Day</Option>
                            <Option value="week">📊 Week</Option>
                            <Option value="month">🗓️ Month</Option>
                            <Option value="year">📆 Year</Option>
                        </Select>
                    </div>
                </div>

                {/* Calendar content */}
                <div style={{ flex: 1, overflow: 'hidden', padding: '20px' }}>
                    {view === 'day' && renderDayView()}
                    {view === 'week' && renderWeekView()}
                    {view === 'month' && renderMonthView()}
                    {view === 'year' && renderYearView()}
                </div>
            </div>

            {/* Create Event Modal */}
            <Modal
                title={
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        ✨ Create New Event
                    </div>
                }
                open={isCreateModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsCreateModalVisible(false)}
                width={700}
                okText="Create Event"
                okButtonProps={{
                    style: {
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '8px',
                        height: '40px',
                        fontWeight: 600
                    }
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveEvent}
                    style={{ marginTop: '20px' }}
                >
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please enter event title' }]}
                    >
                        <Input
                            placeholder="What's the event about?"
                            style={{ borderRadius: '8px', height: '44px' }}
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="date"
                            label="Date"
                            rules={[{ required: true, message: 'Please select date' }]}
                            style={{ flex: 1 }}
                        >
                            <DatePicker style={{ width: '100%', borderRadius: '8px', height: '44px' }} />
                        </Form.Item>

                        <Form.Item
                            name="startTime"
                            label="Start time"
                            rules={[{ required: true, message: 'Please select start time' }]}
                            style={{ flex: 1 }}
                        >
                            <TimePicker style={{ width: '100%', borderRadius: '8px', height: '44px' }} format="HH:mm" />
                        </Form.Item>

                        <Form.Item
                            name="endTime"
                            label="End time"
                            rules={[{ required: true, message: 'Please select end time' }]}
                            style={{ flex: 1 }}
                        >
                            <TimePicker style={{ width: '100%', borderRadius: '8px', height: '44px' }} format="HH:mm" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="calendar"
                            label="Calendar"
                            rules={[{ required: true, message: 'Please select calendar' }]}
                            style={{ flex: 1 }}
                        >
                            <Select style={{ borderRadius: '8px', height: '44px' }}>
                                {calendars.filter(cal => cal.type === 'personal').map(cal => (
                                    <Option key={cal.id} value={cal.id}>
                                        <Space>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: cal.gradient || cal.color
                                            }} />
                                            {cal.icon} {cal.name}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="priority"
                            label="Priority"
                            style={{ flex: 1 }}
                        >
                            <Select style={{ borderRadius: '8px', height: '44px' }} defaultValue="medium">
                                <Option value="high">🔴 High Priority</Option>
                                <Option value="medium">🟡 Medium Priority</Option>
                                <Option value="low">🟢 Low Priority</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="location" label="Location">
                        <Input
                            placeholder="Where is this happening?"
                            style={{ borderRadius: '8px', height: '44px' }}
                        />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea
                            rows={4}
                            placeholder="Add any additional details..."
                            style={{ borderRadius: '8px' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Event Details Modal */}
            <Modal
                title={
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📅 Event Details
                    </div>
                }
                open={isEventModalVisible}
                onCancel={() => setIsEventModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedEvent && (
                    <div style={{ padding: '20px 0' }}>
                        <div style={{
                            background: getCalendarById(selectedEvent.calendar)?.gradient || `linear-gradient(135deg, ${selectedEvent.color}, ${selectedEvent.color}dd)`,
                            borderRadius: '16px',
                            padding: '24px',
                            color: 'white',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{getCategoryIcon(selectedEvent.category || 'general')}</span>
                                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{selectedEvent.title}</h3>
                                <span style={{ fontSize: '20px' }}>{getPriorityIcon(selectedEvent.priority || 'medium')}</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 600, opacity: 0.9 }}>
                                🕒 {selectedEvent.startTime} - {selectedEvent.endTime}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CalendarOutlined style={{ color: '#6366f1', fontSize: '18px' }} />
                                <span><strong>Date:</strong> {selectedEvent.date}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: getCalendarById(selectedEvent.calendar)?.gradient || selectedEvent.color
                                }} />
                                <span><strong>Calendar:</strong> {getCalendarById(selectedEvent.calendar)?.name}</span>
                            </div>

                            {selectedEvent.location && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <EnvironmentOutlined style={{ color: '#6366f1', fontSize: '18px' }} />
                                    <span><strong>Location:</strong> {selectedEvent.location}</span>
                                </div>
                            )}

                            {selectedEvent.description && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    marginTop: '8px'
                                }}>
                                    <strong>Description:</strong>
                                    <p style={{ margin: '8px 0 0 0', lineHeight: '1.6' }}>{selectedEvent.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default App;