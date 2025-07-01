'use client';
import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Row,
    Col,
    message,
    Tabs,
    Badge,
    Progress,
} from 'antd';
import {
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import {
    addSchoolInfo,
    addActivities,
    getSchoolInfo,
} from '../../../services/family';

const { Title } = Typography;
const { TabPane } = Tabs;

interface SchoolInfo {
    schoolName: string;
    gradeLevel: string;
    studentId: string;
    graduationYear: string;
    homeroomTeacher: string;
    guidanceCounselor: string;
    currentGpa: string;
    attendanceRate: string;
    schoolAddress: string;
    notes: string;
}

interface Activity {
    title: string;
    schedule: string;
    details: { label: string; value: string }[];
    links: { label: string; url: string }[];
}

// Reusable field renderer
const RenderField = ({
    isEditing,
    value,
    onChange,
}: {
    isEditing: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (isEditing ? <Input value={value} onChange={onChange} /> : <div>{value}</div>);

const SchoolActivitiesForm: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
        schoolName: '',
        gradeLevel: '',
        studentId: '',
        graduationYear: '',
        homeroomTeacher: '',
        guidanceCounselor: '',
        currentGpa: '',
        attendanceRate: '',
        schoolAddress: '',
        notes: '',
    });

    const [activities, setActivities] = useState<Activity[]>([
        {
            title: '',
            schedule: '',
            details: [
                { label: 'Coach', value: '' },
                { label: 'Position', value: '' },
                { label: 'Season', value: '' },
                { label: 'Location', value: '' },
            ],
            links: [],
        },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getSchoolInfo({ userId: 'currentUserId' });
                if (response.status === 1 && response.payload.schoolInfo) {
                    setSchoolInfo(response.payload.schoolInfo);
                }
                if (response.status === 1 && response.payload.activities) {
                    setActivities(response.payload.activities);
                }
            } catch (error) {
                message.error('Failed to fetch data');
                console.error('Fetch error:', error);
            }
        };
        fetchData();
    }, []);

    const handleSchoolInfoChange = (field: keyof SchoolInfo, value: string) => {
        setSchoolInfo((prev) => ({ ...prev, [field]: value }));
    };

    const handleActivityChange = (
        index: number,
        field: keyof Activity,
        value:
            | string
            | { label: string; value: string }[]
            | { label: string; url: string }[]
    ) => {
        const updated = [...activities];
        updated[index] = { ...updated[index], [field]: value };
        setActivities(updated);
    };

    const handleLinkChange = (
        activityIndex: number,
        linkIndex: number,
        field: 'label' | 'url',
        value: string
    ) => {
        const updated = [...activities];
        updated[activityIndex].links[linkIndex][field] = value;
        setActivities(updated);
    };

    const addNewLink = (index: number) => {
        const updated = [...activities];
        updated[index].links.push({ label: '', url: '' });
        setActivities(updated);
    };

    const handleSave = async () => {
        try {
            await addSchoolInfo({ school_info: schoolInfo });
            for (const activity of activities) {
                await addActivities({ activity });
            }
            message.success('Saved successfully');
            setIsEditing(false);
        } catch (err) {
            message.error('Failed to save');
            console.error('Save error:', err);
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    return (
        <Card style={{ marginTop: 32 }} bodyStyle={{ padding: 24 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                }}
            >
                <Title level={4}>🎓 School & Activities</Title>
                <Button
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                >
                    Edit
                </Button>
            </div>

            <Tabs defaultActiveKey="school">
                {/* ---------------- SCHOOL INFO TAB ---------------- */}
                <TabPane tab="🏫 School Info" key="school">
                    <Form layout="vertical">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="School Name">
                                    <RenderField
                                        isEditing={isEditing}
                                        value={schoolInfo.schoolName}
                                        onChange={(e) => handleSchoolInfoChange('schoolName', e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Grade Level">
                                    <RenderField
                                        isEditing={isEditing}
                                        value={schoolInfo.gradeLevel}
                                        onChange={(e) => handleSchoolInfoChange('gradeLevel', e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Student ID">
                                    <RenderField
                                        isEditing={isEditing}
                                        value={schoolInfo.studentId}
                                        onChange={(e) => handleSchoolInfoChange('studentId', e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Graduation Year">
                                    <RenderField
                                        isEditing={isEditing}
                                        value={schoolInfo.graduationYear}
                                        onChange={(e) => handleSchoolInfoChange('graduationYear', e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Homeroom Teacher">
                                    <RenderField
                                        isEditing={isEditing}
                                        value={schoolInfo.homeroomTeacher}
                                        onChange={(e) => handleSchoolInfoChange('homeroomTeacher', e.target.value)}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Guidance Counselor">
                                    <RenderField
                                        isEditing={isEditing}
                                        value={schoolInfo.guidanceCounselor}
                                        onChange={(e) =>
                                            handleSchoolInfoChange('guidanceCounselor', e.target.value)
                                        }
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Current GPA">
                                    {isEditing ? (
                                        <Input
                                            value={schoolInfo.currentGpa}
                                            onChange={(e) => handleSchoolInfoChange('currentGpa', e.target.value)}
                                        />
                                    ) : (
                                        <Badge count={schoolInfo.currentGpa} style={{ backgroundColor: '#52c41a' }} />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Attendance Rate">
                                    {isEditing ? (
                                        <Input
                                            value={schoolInfo.attendanceRate}
                                            onChange={(e) =>
                                                handleSchoolInfoChange('attendanceRate', e.target.value)
                                            }
                                        />
                                    ) : (
                                        <Progress
                                            type="circle"
                                            percent={parseFloat(schoolInfo.attendanceRate)}
                                            width={80}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label="School Address">
                            {isEditing ? (
                                <Input.TextArea
                                    value={schoolInfo.schoolAddress}
                                    onChange={(e) => handleSchoolInfoChange('schoolAddress', e.target.value)}
                                    autoSize={{ minRows: 3 }}
                                />
                            ) : (
                                <div
                                    style={{
                                        // background: '#f5f5f5',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {schoolInfo.schoolAddress || '—'}
                                </div>
                            )}
                        </Form.Item>

                        <Form.Item label="Notes">
                            {isEditing ? (
                                <Input.TextArea
                                    value={schoolInfo.notes}
                                    onChange={(e) => handleSchoolInfoChange('notes', e.target.value)}
                                    autoSize={{ minRows: 2 }}
                                />
                            ) : (
                                <div
                                    style={{
                                        // background: '#f5f5f5',
                                        padding: '12px',
                                        borderRadius: '4px',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {schoolInfo.notes || '—'}
                                </div>
                            )}
                        </Form.Item>


                    </Form>
                </TabPane>

                {/* ---------------- ACTIVITIES TAB ---------------- */}
                <TabPane tab="🎯 Activities" key="activities">
                    <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
                        {activities.map((activity, idx) => (
                            <Button
                                key={idx}
                                size="small"
                                onClick={() =>
                                    document
                                        .getElementById(`activity-${idx}`)
                                        ?.scrollIntoView({ behavior: 'smooth' })
                                }
                                style={{ marginRight: 8, marginBottom: 8 }}
                            >
                                {activity.title || `Activity ${idx + 1}`}
                            </Button>
                        ))}
                    </div>

                    {activities.map((activity, index) => (
                        <div
                            key={index}
                            id={`activity-${index}`}
                            style={{
                                marginBottom: 24,
                                border: '1px solid #e2e8f0',
                                padding: 16,
                                borderRadius: 8,
                            }}
                        >
                            <Title level={5}>{activity.title || `Activity ${index + 1}`}</Title>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Title">
                                        <RenderField
                                            isEditing={isEditing}
                                            value={activity.title}
                                            onChange={(e) =>
                                                handleActivityChange(index, 'title', e.target.value)
                                            }
                                        />
                                    </Form.Item>
                                    <Form.Item label="Coach">
                                        <RenderField
                                            isEditing={isEditing}
                                            value={activity.details[0].value}
                                            onChange={(e) => {
                                                const updated = [...activity.details];
                                                updated[0].value = e.target.value;
                                                handleActivityChange(index, 'details', updated);
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Season">
                                        <RenderField
                                            isEditing={isEditing}
                                            value={activity.details[2].value}
                                            onChange={(e) => {
                                                const updated = [...activity.details];
                                                updated[2].value = e.target.value;
                                                handleActivityChange(index, 'details', updated);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Schedule">
                                        <RenderField
                                            isEditing={isEditing}
                                            value={activity.schedule}
                                            onChange={(e) =>
                                                handleActivityChange(index, 'schedule', e.target.value)
                                            }
                                        />
                                    </Form.Item>
                                    <Form.Item label="Position">
                                        <RenderField
                                            isEditing={isEditing}
                                            value={activity.details[1].value}
                                            onChange={(e) => {
                                                const updated = [...activity.details];
                                                updated[1].value = e.target.value;
                                                handleActivityChange(index, 'details', updated);
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Location">
                                        <RenderField
                                            isEditing={isEditing}
                                            value={activity.details[3].value}
                                            onChange={(e) => {
                                                const updated = [...activity.details];
                                                updated[3].value = e.target.value;
                                                handleActivityChange(index, 'details', updated);
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item label="Links">
                                {activity.links.map((link, i) => (
                                    <Row gutter={8} key={i} style={{ marginBottom: 8 }}>
                                        {isEditing ? (
                                            <>
                                                <Col span={10}>
                                                    <Input
                                                        value={link.label}
                                                        onChange={(e) =>
                                                            handleLinkChange(index, i, 'label', e.target.value)
                                                        }
                                                        placeholder="Link Label"
                                                    />
                                                </Col>
                                                <Col span={14}>
                                                    <Input
                                                        value={link.url}
                                                        onChange={(e) =>
                                                            handleLinkChange(index, i, 'url', e.target.value)
                                                        }
                                                        placeholder="Link URL"
                                                    />
                                                </Col>
                                            </>
                                        ) : (
                                            <Button
                                                size="small"
                                                type="default"
                                                onClick={() => window.open(link.url, '_blank')}
                                                style={{ marginRight: 8 }}
                                            >
                                                {link.label}
                                            </Button>
                                        )}
                                    </Row>
                                ))}
                                {isEditing && (
                                    <Button
                                        icon={<PlusOutlined />}
                                        onClick={() => addNewLink(index)}
                                        style={{ marginTop: 8 }}
                                    >
                                        Add Link
                                    </Button>
                                )}
                            </Form.Item>
                        </div>
                    ))}

                    {isEditing && (
                        <Button
                            type="dashed"
                            onClick={() =>
                                setActivities((prev) => [
                                    ...prev,
                                    {
                                        title: '',
                                        schedule: '',
                                        details: [
                                            { label: 'Coach', value: '' },
                                            { label: 'Position', value: '' },
                                            { label: 'Season', value: '' },
                                            { label: 'Location', value: '' },
                                        ],
                                        links: [],
                                    },
                                ])
                            }
                            style={{ width: '100%', marginBottom: 16 }}
                        >
                            + Add Activity
                        </Button>
                    )}
                </TabPane>
            </Tabs>

            {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                        Save
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default SchoolActivitiesForm;
