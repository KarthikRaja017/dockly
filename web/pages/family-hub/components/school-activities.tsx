'use client';
import React, { useState } from 'react';
import {
    Button,
    Card,
    Typography,
    Tabs,
    Row,
    Col,
    Input,
    Space,
    Modal,
    message,
} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    BookOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface CustomField {
    label: string;
    value: string;
}

interface ResourceLink {
    label: string;
    url: string;
}

interface SchoolInfo {
    id?: string;
    name: string;
    grade: string;
    studentId?: string;
    customFields: CustomField[];
    links: ResourceLink[];
}

interface Activity {
    id?: string;
    emoji: string;
    title: string;
    schedule: string;
    customFields: CustomField[];
    links: ResourceLink[];
}

interface SchoolActivitiesProps {
    isEditing?: boolean;
}

export default function SchoolActivities({ isEditing = false }: SchoolActivitiesProps) {
    const [schools, setSchools] = useState<SchoolInfo[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);

    const [schoolModalVisible, setSchoolModalVisible] = useState(false);
    const [activityModalVisible, setActivityModalVisible] = useState(false);
    const [customFieldModalVisible, setCustomFieldModalVisible] = useState<null | string>(null);
    const [linkModalVisible, setLinkModalVisible] = useState<null | string>(null);

    const [newSchool, setNewSchool] = useState({ name: '', grade: '', studentId: '' });
    const [newActivity, setNewActivity] = useState({ emoji: '🎯', title: '', schedule: '' });
    const [fieldInput, setFieldInput] = useState({ label: '', value: '' });
    const [linkInput, setLinkInput] = useState({ label: '', url: '' });

    const addSchool = () => {
        if (!newSchool.name || !newSchool.grade) {
            message.error('School name and grade are required');
            return;
        }
        setSchools(prev => [
            ...prev,
            {
                name: newSchool.name,
                grade: newSchool.grade,
                studentId: newSchool.studentId,
                customFields: [],
                links: [],
            },
        ]);
        setNewSchool({ name: '', grade: '', studentId: '' });
        setSchoolModalVisible(false);
    };

    const addActivity = () => {
        if (!newActivity.title || !newActivity.schedule) {
            message.error('Activity title and schedule are required');
            return;
        }
        setActivities(prev => [
            ...prev,
            {
                emoji: newActivity.emoji,
                title: newActivity.title,
                schedule: newActivity.schedule,
                customFields: [],
                links: [],
            },
        ]);
        setNewActivity({ emoji: '🎯', title: '', schedule: '' });
        setActivityModalVisible(false);
    };

    const handleAddCustomField = (target: 'school' | 'activity', index: number) => {
        const field = { ...fieldInput };
        if (!field.label) return message.error('Label is required');

        if (target === 'school') {
            const updated = [...schools];
            updated[index].customFields.push(field);
            setSchools(updated);
        } else {
            const updated = [...activities];
            updated[index].customFields.push(field);
            setActivities(updated);
        }
        setFieldInput({ label: '', value: '' });
        setCustomFieldModalVisible(null);
    };

    const handleAddLink = (target: 'school' | 'activity', index: number) => {
        const link = { ...linkInput };
        if (!link.label || !link.url) return message.error('Link title and URL are required');

        if (target === 'school') {
            const updated = [...schools];
            updated[index].links.push(link);
            setSchools(updated);
        } else {
            const updated = [...activities];
            updated[index].links.push(link);
            setActivities(updated);
        }
        setLinkInput({ label: '', url: '' });
        setLinkModalVisible(null);
    };

    const schoolInfoTab = (
        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {schools.map((school, index) => (
                <Card key={index} style={{ marginBottom: 8, border: '1px solid #d1d5db', borderRadius: 8 }} bodyStyle={{ padding: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            backgroundColor: '#4338ca', color: 'white',
                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            🏫
                        </div>
                        <div style={{ flex: 1 }}>
                            <Title level={4} style={{ margin: '0 0 2px 0', fontSize: 14 }}>{school.name}</Title>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                                {school.grade} {school.studentId && `• Student ID: ${school.studentId}`}
                            </Text>

                            <Row gutter={[8, 6]} style={{ marginTop: 8 }}>
                                {school.customFields.map((field, i) => (
                                    <Col xs={24} sm={12} key={i}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 1 }}>{field.label}</Text>
                                            <Input
                                                size="small"
                                                value={field.value}
                                                readOnly={!isEditing}
                                                onChange={(e) => {
                                                    const updated = [...schools];
                                                    updated[index].customFields[i].value = e.target.value;
                                                    setSchools(updated);
                                                }} />
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {school.links.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <Text strong style={{ fontSize: 10, color: '#595959' }}>Resources & Links</Text>
                                    <Space wrap style={{ marginTop: 4 }}>
                                        {school.links.map((link, i) => (
                                            <a key={i} href={link.url} style={{ fontSize: 10, padding: '1px 4px', backgroundColor: '#f0f0f0', borderRadius: 3, textDecoration: 'none' }} target="_blank" rel="noreferrer">
                                                {link.label}
                                            </a>
                                        ))}
                                    </Space>
                                </div>
                            )}

                            {isEditing && (
                                <div style={{ marginTop: 8 }}>
                                    <span
                                        style={{ fontSize: 10, color: '#1890ff', cursor: 'pointer', marginRight: 8 }}
                                        onClick={() => setCustomFieldModalVisible(`school-${index}`)}
                                    >
                                        + Add custom field
                                    </span>
                                    <span
                                        style={{ fontSize: 10, color: '#1890ff', cursor: 'pointer' }}
                                        onClick={() => setLinkModalVisible(`school-${index}`)}
                                    >
                                        + Add link
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}

            {isEditing && (
                <Button type="dashed" block onClick={() => setSchoolModalVisible(true)} style={{ borderRadius: 8 }}>
                    + Add School
                </Button>
            )}
        </div>
    );

    const activitiesTab = (
        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {activities.map((activity, index) => (
                <Card key={index} style={{ marginBottom: 8, border: '1px solid #d1d5db', borderRadius: 8 }} bodyStyle={{ padding: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            backgroundColor: '#10b981', color: 'white',
                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {activity.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                            <Title level={4} style={{ margin: '0 0 2px 0', fontSize: 14 }}>{activity.title}</Title>
                            <Text type="secondary" style={{ fontSize: 11 }}>{activity.schedule}</Text>

                            <Row gutter={[8, 6]} style={{ marginTop: 8 }}>
                                {activity.customFields.map((field, i) => (
                                    <Col xs={24} sm={12} key={i}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 1 }}>{field.label}</Text>
                                            <Input
                                                size="small"
                                                value={field.value}
                                                readOnly={!isEditing}
                                                onChange={(e) => {
                                                    const updated = [...activities];
                                                    updated[index].customFields[i].value = e.target.value;
                                                    setActivities(updated);
                                                }} />
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {activity.links.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <Text strong style={{ fontSize: 10, color: '#595959' }}>Resources & Links</Text>
                                    <Space wrap style={{ marginTop: 4 }}>
                                        {activity.links.map((link, i) => (
                                            <a key={i} href={link.url} style={{ fontSize: 10, padding: '1px 4px', backgroundColor: '#f0f0f0', borderRadius: 3, textDecoration: 'none' }} target="_blank" rel="noreferrer">
                                                {link.label}
                                            </a>
                                        ))}
                                    </Space>
                                </div>
                            )}

                            {isEditing && (
                                <div style={{ marginTop: 8 }}>
                                    <span
                                        style={{ fontSize: 10, color: '#1890ff', cursor: 'pointer', marginRight: 8 }}
                                        onClick={() => setCustomFieldModalVisible(`activity-${index}`)}
                                    >
                                        + Add custom field
                                    </span>
                                    <span
                                        style={{ fontSize: 10, color: '#1890ff', cursor: 'pointer' }}
                                        onClick={() => setLinkModalVisible(`activity-${index}`)}
                                    >
                                        + Add link
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}

            {isEditing && (
                <Button type="dashed" block onClick={() => setActivityModalVisible(true)} style={{ borderRadius: 8 }}>
                    + Add Activity
                </Button>
            )}
        </div>
    );

    return (
        <>
            <Card
                title={
                    <span>
                        <BookOutlined style={{ marginRight: 8 }} />
                        School & Activities
                    </span>
                }
                style={{ borderRadius: 12 }}
                bodyStyle={{ padding: 12 }}
            >
                <Tabs
                    items={[
                        {
                            key: 'school-info',
                            label: 'School Info',
                            children: schoolInfoTab,
                        },
                        {
                            key: 'activities',
                            label: 'Activities',
                            children: activitiesTab,
                        },
                    ]}
                />
            </Card>

            {/* Add School Modal */}
            <Modal open={schoolModalVisible} title="Add School" onOk={addSchool} onCancel={() => setSchoolModalVisible(false)}>
                <Input
                    placeholder="School Name"
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                    style={{ marginBottom: 8 }}
                />
                <Input
                    placeholder="Grade"
                    value={newSchool.grade}
                    onChange={(e) => setNewSchool({ ...newSchool, grade: e.target.value })}
                    style={{ marginBottom: 8 }}
                />
                <Input
                    placeholder="Student ID (optional)"
                    value={newSchool.studentId}
                    onChange={(e) => setNewSchool({ ...newSchool, studentId: e.target.value })}
                />
            </Modal>

            {/* Add Activity Modal */}
            <Modal open={activityModalVisible} title="Add Activity" onOk={addActivity} onCancel={() => setActivityModalVisible(false)}>
                <Input
                    placeholder="Activity Title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    style={{ marginBottom: 8 }}
                />
                <Input
                    placeholder="Schedule"
                    value={newActivity.schedule}
                    onChange={(e) => setNewActivity({ ...newActivity, schedule: e.target.value })}
                />
            </Modal>

            {/* Add Custom Field Modal */}
            <Modal
                open={customFieldModalVisible !== null}
                title="Add Custom Field"
                onOk={() => {
                    const [type, indexStr] = (customFieldModalVisible ?? '').split('-');
                    handleAddCustomField(type as 'school' | 'activity', parseInt(indexStr));
                }}
                onCancel={() => setCustomFieldModalVisible(null)}
            >
                <Input
                    placeholder="Label"
                    value={fieldInput.label}
                    onChange={(e) => setFieldInput(prev => ({ ...prev, label: e.target.value }))}
                    style={{ marginBottom: 8 }}
                />
                <Input
                    placeholder="Value"
                    value={fieldInput.value}
                    onChange={(e) => setFieldInput(prev => ({ ...prev, value: e.target.value }))}
                />
            </Modal>

            {/* Add Link Modal */}
            <Modal
                open={linkModalVisible !== null}
                title="Add Link"
                onOk={() => {
                    const [type, indexStr] = (linkModalVisible ?? '').split('-');
                    handleAddLink(type as 'school' | 'activity', parseInt(indexStr));
                }}
                onCancel={() => setLinkModalVisible(null)}
            >
                <Input
                    placeholder="Link Title"
                    value={linkInput.label}
                    onChange={(e) => setLinkInput(prev => ({ ...prev, label: e.target.value }))}
                    style={{ marginBottom: 8 }}
                />
                <Input
                    placeholder="URL"
                    value={linkInput.url}
                    onChange={(e) => setLinkInput(prev => ({ ...prev, url: e.target.value }))}
                />
            </Modal>
        </>
    );
}
