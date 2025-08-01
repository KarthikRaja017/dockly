'use client';
import React, { useState } from 'react';
import { Card, Space, Avatar, Tag, Button, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
const { Text } = Typography;

const TodaysSchedule: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const filterButtons = [
        { key: 'All', label: 'All', color: '#3b82f6', bgColor: '#3b82f6' },
        { key: 'John', label: 'John', color: '#3b82f6', bgColor: '#e0f2fe', textColor: '#0369a1' },
        { key: 'Sarah', label: 'Sarah', color: '#8b5cf6', bgColor: '#f3e8ff', textColor: '#7c3aed' },
        { key: 'Emma', label: 'Emma', color: '#8b5cf6', bgColor: '#f3e8ff', textColor: '#7c3aed' },
        { key: 'Liam', label: 'Liam', color: '#ec4899', bgColor: '#fce7f3', textColor: '#be185d' }
    ];

    const scheduleItems = [
        {
            time: '9:00 AM',
            title: 'Team Meeting',
            subtitle: "John's Work",
            location: 'Video Conference - Zoom',
            avatar: 'JS',
            avatarColor: '#3b82f6',
            tag: 'Important',
            tagColor: '#ef4444'
        },
        {
            time: '2:00 PM',
            title: "Doctor's Appointment",
            subtitle: "Sarah's Checkup",
            location: 'Springfield Medical Center',
            avatar: 'SS',
            avatarColor: '#8b5cf6',
            tag: 'Health',
            tagColor: '#10b981'
        },
        {
            time: '3:30 PM',
            title: 'Piano Lesson',
            subtitle: "Liam's Music Class",
            location: "Mrs. Anderson's Studio",
            avatar: 'LS',
            avatarColor: '#ec4899',
            tag: 'Activity',
            tagColor: '#8b5cf6'
        },
        {
            time: '4:00 PM',
            title: 'Soccer Practice',
            subtitle: "Emma's Team Practice",
            location: 'School Athletic Field',
            avatar: 'ES',
            avatarColor: '#8b5cf6',
            tag: 'Sports',
            tagColor: '#8b5cf6'
        },
        {
            time: '7:00 PM',
            title: 'Book Club Meeting',
            subtitle: "Sarah's Monthly Meetup",
            location: 'Community Center - Room 204',
            avatar: 'SS',
            avatarColor: '#8b5cf6',
            tag: 'Social',
            tagColor: '#f59e0b'
        }
    ];

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                        <CalendarOutlined style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>Today's Schedule</span>
                    </Space>
                    <Button type="link" size="small" style={{ color: '#3b82f6', padding: 0, fontSize: '12px' }}>
                        View in Planner →
                    </Button>
                </div>
            }
            bodyStyle={{ padding: '12px' }}
            headStyle={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}
            style={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
        >
            {/* Filter Buttons */}
            <div style={{ marginBottom: '12px' }}>
                <Space wrap size={6}>
                    {filterButtons.map((filter) => (
                        <Button
                            key={filter.key}
                            size="small"
                            style={{
                                backgroundColor: activeFilter === filter.key ? filter.bgColor : '#f8fafc',
                                color: activeFilter === filter.key ? (filter.key === 'All' ? 'white' : filter.textColor) : '#64748b',
                                border: activeFilter === filter.key ? 'none' : '1px solid #e2e8f0',
                                borderRadius: '14px',
                                height: '24px',
                                padding: '0 10px',
                                fontWeight: 500,
                                fontSize: '11px'
                            }}
                            onClick={() => setActiveFilter(filter.key)}
                        >
                            {filter.key === 'All' && '👥 '}
                            {filter.label}
                        </Button>
                    ))}
                </Space>
            </div>

            {/* Schedule Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scheduleItems.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        {/* Time */}
                        <div style={{ minWidth: '50px', textAlign: 'left' }}>
                            <Text style={{ fontSize: '11px', fontWeight: 500, color: '#374151' }}>
                                {item.time}
                            </Text>
                        </div>

                        {/* Avatar */}
                        <Avatar
                            size={28}
                            style={{
                                backgroundColor: item.avatarColor,
                                fontSize: '11px',
                                fontWeight: 600,
                                flexShrink: 0
                            }}
                        >
                            {item.avatar}
                        </Avatar>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ marginBottom: '1px' }}>
                                <Text strong style={{ fontSize: '12px', color: '#111827', display: 'block', lineHeight: 1.3 }}>
                                    {item.title}
                                </Text>
                                <Text style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>
                                    {item.subtitle}
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <span style={{ color: '#ef4444', fontSize: '10px' }}>📍</span>
                                <Text style={{ fontSize: '10px', color: '#6b7280' }}>
                                    {item.location}
                                </Text>
                            </div>
                        </div>

                        {/* Tag */}
                        <Tag
                            style={{
                                backgroundColor: item.tagColor,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '9px',
                                fontWeight: 500,
                                padding: '2px 6px',
                                margin: 0
                            }}
                        >
                            {item.tag}
                        </Tag>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default TodaysSchedule;