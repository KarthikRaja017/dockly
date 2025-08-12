'use client';
import React, { useEffect, useState } from 'react';
import { Card, Space, Avatar, Tag, Button, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { getAllPlannerData } from '../../../services/planner';
import { useCurrentUser } from '../../../app/userContext';
import { useRouter } from 'next/navigation';

const { Text } = Typography;
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface ScheduleItem {
    time: string;
    title: string;
    subtitle?: string;
    person: string;
    location?: string;
    avatar: string;
    avatarColor: string;
    tag: string;
    tagColor: string;
}

interface FamilyMember {
    id: number;
    name: string;
    color: string;
    initials: string;
    status?: 'pending' | 'accepted';
    user_id?: string;
}

interface Props {
    familyMembers?: FamilyMember[]; // Optional with fallback
}

const TodaysSchedule: React.FC<Props> = ({ familyMembers = [] }) => {
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const currentUser = useCurrentUser();
    const [username, setUsername] = useState<string | null>(null);
    const duser = currentUser?.duser;
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllPlannerData({ show_dockly: true });
                const events = response.data?.payload?.events || [];
                console.log("All Events:", events);

                const today = new Date();
                const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD

                const todaysEvents = events.filter((event: any) => {
                    const rawDate = event.start?.dateTime || event.start?.date || event.date || null;
                    if (!rawDate) return false;

                    const eventDate = new Date(rawDate);
                    const eventDateStr = eventDate.toLocaleDateString('en-CA');

                    return eventDateStr === todayStr;
                });

                const transformed = todaysEvents.map((event: any) => {
                    const eventTime = event.start?.dateTime
                        ? new Date(event.start.dateTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                        : 'All Day';

                    const member = familyMembers.find(fm => fm.user_id === event.user_id);

                    return {
                        time: eventTime,
                        title: event.summary || 'Untitled Event',
                        subtitle: member?.name || currentUser?.name || 'You',
                        person: member?.name || currentUser?.name || 'You',
                        avatar: member?.initials || currentUser?.name?.substring(0, 2) || 'U',
                        avatarColor: member?.color || '#3b82f6',
                        location: event.location || '—',
                        tag: 'Event',
                        tagColor: '#8b5cf6',
                    };
                });

                setScheduleItems(transformed);
            } catch (err) {
                console.error('Error fetching planner data:', err);
            }
        };

        if (duser) fetchData();
    }, [duser, familyMembers]);

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleOk = () => {
        if (username) {
            router.push(`/${username}/planner`);
        } else {
            console.error("Username not found in localStorage");
        }
    };

    const filteredSchedule = activeFilter === 'All'
        ? scheduleItems
        : scheduleItems.filter(item => item.person === activeFilter);

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                        <CalendarOutlined style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Today's Schedule</span>
                    </Space>
                    <Button type="link" size="small" onClick={handleOk}>
                        View in Planner →
                    </Button>
                </div>
            }
            bodyStyle={{ padding: '18px' }}
            headStyle={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}
            style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
        >
            {/* Filter Buttons */}
            <div style={{ marginBottom: '12px' }}>
                <Space wrap size={6}>
                    <Button
                        size="small"
                        style={{
                            backgroundColor: activeFilter === 'All' ? '#3b82f6' : '#f8fafc',
                            color: activeFilter === 'All' ? 'white' : '#64748b',
                            border: activeFilter === 'All' ? 'none' : '1px solid #e2e8f0',
                            borderRadius: '14px',
                            height: '24px',
                            padding: '0 10px',
                            fontWeight: 500,
                            fontSize: '11px',
                            fontFamily: FONT_FAMILY,
                        }}
                        onClick={() => setActiveFilter('All')}
                    >
                        👥 All
                    </Button>

                    {Array.isArray(familyMembers) &&
                        familyMembers
                            .filter(fm => fm.status !== 'pending')
                            .map((member) => (
                                <Button
                                    key={member.id}
                                    size="small"
                                    style={{
                                        backgroundColor: activeFilter === member.name ? `${member.color}20` : '#f8fafc',
                                        color: activeFilter === member.name ? member.color : '#64748b',
                                        border: activeFilter === member.name ? 'none' : '1px solid #e2e8f0',
                                        borderRadius: '14px',
                                        height: '24px',
                                        padding: '0 10px',
                                        fontWeight: 500,
                                        fontSize: '11px',
                                        fontFamily: FONT_FAMILY,
                                    }}
                                    onClick={() => setActiveFilter(member.name)}
                                >
                                    {member.name}
                                </Button>
                            ))}
                </Space>
            </div>

            {/* Schedule List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '300px', maxHeight: '300px', overflow: 'auto' }}>
                {filteredSchedule.length === 0 ? (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        No events scheduled for today.
                    </Text>
                ) : (
                    filteredSchedule.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ minWidth: '50px', textAlign: 'left' }}>
                                <Text style={{ fontSize: '12px', fontWeight: 500 }}>{item.time}</Text>
                            </div>

                            <div style={{ flex: 1 }}>
                                <Text strong style={{ fontSize: '13px', display: 'block' }}>{item.title}</Text>
                                <Avatar size={16} style={{ backgroundColor: item.avatarColor, fontSize: '8px' }}>
                                    {item.avatar}
                                </Avatar>
                                <Text style={{ fontSize: '11px', color: '#6b7280', fontFamily: FONT_FAMILY, marginLeft: '4px' }}>{item.subtitle}</Text>
                                {item.location && item.location.trim() !== '—' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '10px' }}>📍</span>
                                        <Text style={{ fontSize: '11px', color: '#6b7280' }}>{item.location}</Text>
                                    </div>
                                )}
                            </div>
                            <Tag style={{ backgroundColor: item.tagColor, color: 'white', fontSize: '10px' }}>
                                {item.tag}
                            </Tag>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default TodaysSchedule;
