import React, { useState } from 'react';
import { Layout, Menu, Avatar, Button, Space, Typography, Card, Form, Input, Select, Checkbox, Row, Col, Alert, Tabs, List, Tag } from 'antd';
import {
    HomeOutlined,
    AppstoreOutlined,
    CalendarOutlined,
    TeamOutlined,
    DollarOutlined,
    HeartOutlined,
    ProjectOutlined,
    ArrowLeftOutlined,
    ShareAltOutlined,
    ExportOutlined,
    SaveOutlined,
    EditOutlined,
    FileTextOutlined,
    MedicineBoxOutlined,
    BookOutlined,
    PlusOutlined,
    DownloadOutlined,
    EyeOutlined,
    CopyOutlined,
    LaptopOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const FamilyMembers: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();




    const handleMenuClick = (key: string) => {
        console.log('Menu clicked:', key);
    };

    const handleBack = () => {
        console.log('Navigate back to Family Hub');
    };

    const handleShare = () => {
        console.log('Share family member profile');
    };

    const handleExport = () => {
        console.log('Export member data as PDF');
    };

    const handleSave = () => {
        console.log('Profile changes saved successfully!');
    };

    const handleEdit = () => {
        console.log('Edit profile mode');
    };

    const handleAddDocument = () => {
        console.log('Add new document');
    };

    const handleAddAccountAsset = () => {
        console.log('Add new account or asset');
    };

    const handleAddActivity = () => {
        console.log('Add new activity');
    };

    const handleAddProvider = () => {
        console.log('Add provider');
    };

    const handleAddRecord = () => {
        console.log('Add medical record');
    };

    const handleAddCustomField = (section: string) => {
        console.log(`Add custom field to ${section}`);
    };

    const vaccinationRecords = [
        {
            name: 'COVID-19 (Pfizer)',
            date: 'Full series completed: June 15, 2024',
            status: 'Up to date',
            statusColor: 'green'
        },
        {
            name: 'Flu Shot',
            date: 'Last dose: October 10, 2024',
            status: 'Current',
            statusColor: 'green'
        },
        {
            name: 'Tdap (Tetanus, Diphtheria, Pertussis)',
            date: 'Last booster: August 5, 2023',
            status: 'Current',
            statusColor: 'green'
        },
        {
            name: 'MMR (Measles, Mumps, Rubella)',
            date: 'Completed series: Age 4',
            status: 'Complete',
            statusColor: 'green'
        },
        {
            name: 'HPV',
            date: 'Series started: January 2024',
            status: 'In progress',
            statusColor: 'orange'
        }
    ];

    const medicalExams = [
        {
            name: 'Annual Physical Exam',
            date: 'December 15, 2024 - Dr. Emily Chen',
            icon: '🩺'
        },
        {
            name: 'Dental Check-up',
            date: 'January 5, 2025 - Dr. Michael Wilson',
            icon: '🦷'
        },
        {
            name: 'Eye Exam',
            date: 'September 20, 2024 - Dr. Sarah Martinez',
            icon: '👁️'
        },
        {
            name: 'Sports Physical',
            date: 'August 1, 2024 - Dr. Emily Chen',
            icon: '🏃‍♀️'
        }
    ];

    const schoolAccounts = [
        {
            name: 'School Portal',
            username: 'emma.smith2029',
            password: '••••••••••',
            hasLink: true
        },
        {
            name: 'Google for Education',
            username: 'emma.smith2029@schooldistrict.edu',
            password: '••••••••••',
            hasLink: true
        },
        {
            name: 'Khan Academy',
            username: 'emma_smith_shs',
            password: '••••••••••',
            hasLink: true
        }
    ];

    const personalAccounts = [
        {
            name: 'Apple ID',
            username: 'emma.smith@family.com',
            password: '••••••••••',
            hasLink: true
        },
        {
            name: 'Instagram',
            username: '@emma_smith2011',
            password: '••••••••••',
            hasLink: true
        }
    ];

    const entertainmentAccounts = [
        {
            name: 'Spotify Family',
            username: 'Family member account',
            password: 'Linked to parent account',
            hasLink: true
        },
        {
            name: 'Disney+',
            username: 'Kids profile - Emma',
            password: 'Managed by parent account',
            hasLink: true
        }
    ];

    const otherAccounts = [
        {
            name: 'Library Card',
            username: 'Card #: 2145678901',
            password: '••••',
            hasLink: false
        },
        {
            name: 'School WiFi',
            username: 'Network: SHS-Student',
            password: '••••••••••',
            hasLink: false
        }
    ];

    const devices = [
        {
            name: 'iPhone 14 (Personal)',
            meta: 'Phone: (555) 123-4567 • Screen Time: Enabled',
            icon: '📱',
            action: 'Manage'
        },
        {
            name: 'MacBook Air (School)',
            meta: 'Serial: C02XR4JTHH28 • Parental Controls: Active',
            icon: '💻',
            action: 'Settings'
        },
        {
            name: 'Nintendo Switch',
            meta: 'Shared family device • Play time: 2 hrs/day',
            icon: '🎮',
            action: 'Time Limits'
        },
        {
            name: 'Apple Watch SE',
            meta: 'Family Setup • Location Sharing: On',
            icon: '⌚',
            action: 'Settings'
        },
        {
            name: 'AirPods (3rd Gen)',
            meta: 'Find My: Enabled',
            icon: '🎧',
            action: 'Locate'
        }
    ];

    const documents = [
        {
            name: 'Birth Certificate',
            meta: 'Uploaded Jan 15, 2025 • PDF • 2.1 MB',
            icon: '📜',
            color: '#dc2626'
        },
        {
            name: 'School Photos (2024-25)',
            meta: 'Uploaded Oct 10, 2024 • JPG • 4.7 MB',
            icon: '📷',
            color: '#4338ca'
        },
        {
            name: 'Report Cards (2023-24)',
            meta: 'Uploaded Jun 15, 2024 • PDF • 1.8 MB',
            icon: '📄',
            color: '#374151'
        },
        {
            name: 'Physical Exam Form',
            meta: 'Uploaded Aug 1, 2024 • PDF • 850 KB',
            icon: '🏥',
            color: '#d97706'
        },
        {
            name: 'Vaccination Records',
            meta: 'Updated Dec 20, 2024 • PDF • 1.5 MB',
            icon: '💉',
            color: '#16a34a'
        },
        {
            name: 'School Enrollment Forms',
            meta: 'Uploaded Aug 25, 2024 • PDF • 3.2 MB',
            icon: '🏫',
            color: '#d97706'
        }
    ];

    const renderAccountSection = (title: string, accounts: any[]) => (
        <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>
                {title}
            </Title>
            {accounts.map((account, index) => (
                <Card
                    key={index}
                    size="small"
                    style={{
                        marginBottom: 8,
                        backgroundColor: '#fafafa',
                        border: '1px solid #d9d9d9'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                <Text strong style={{ fontSize: 14 }}>
                                    {account.name}
                                </Text>
                                {account.hasLink && (
                                    <span style={{ marginLeft: 4, color: '#1890ff', fontSize: 11 }}>
                                        ↗
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2, wordBreak: 'break-all' }}>
                                {account.username}
                            </div>
                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                Password: {account.password}
                            </div>
                        </div>
                        <Space size={4} style={{ flexShrink: 0 }}>
                            <Button size="small" type="text" icon={<EyeOutlined />}>
                                Show
                            </Button>
                            <Button size="small" type="text" icon={<CopyOutlined />}>
                                Copy
                            </Button>
                            <Button size="small" type="text" icon={<EditOutlined />}>
                                Edit
                            </Button>
                        </Space>
                    </div>
                </Card>
            ))}
        </div>
    );

    const generalTab = (
        <Form form={form} layout="vertical">
            <Title level={5} style={{ marginBottom: 16 }}>Basic Medical Information</Title>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Blood Type" name="bloodType">
                        <Input value="O+" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Height" name="height">
                        <Input value="5" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Weight" name="weight">
                        <Input value="115 lbs" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Eye Color" name="eyeColor">
                        <Input value="Brown" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Insurance Information</Title>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Insurance Provider" name="insuranceProvider">
                        <Input value="Blue Cross Blue Shield" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Member ID" name="memberId">
                        <Input value="JS789456-02" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Group Number" name="groupNumber">
                        <Input value="GRP123456" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Last Checkup" name="lastCheckup">
                        <Input type="date" value="2024-12-15" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Allergies & Medications</Title>

            <Form.Item label="Known Allergies" name="allergies">
                <TextArea value="None known at this time" readOnly />
            </Form.Item>

            <Form.Item label="Current Medications" name="medications">
                <TextArea value="None" readOnly />
            </Form.Item>

            <Form.Item label="Medical Notes" name="medicalNotes">
                <TextArea value="Regular checkups with Dr. Chen. No significant medical history." readOnly />
            </Form.Item>
        </Form>
    );

    const providersTab = (
        <Form form={form} layout="vertical">
            <Title level={5} style={{ marginBottom: 16 }}>Healthcare Providers</Title>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Primary Care Physician" name="primaryDoctor">
                        <Input value="Dr. Emily Chen" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Phone" name="primaryDoctorPhone">
                        <Input value="(555) 456-7890" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Dentist" name="dentist">
                        <Input value="Dr. Michael Wilson" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Phone" name="dentistPhone">
                        <Input value="(555) 345-6789" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Eye Doctor" name="eyeDoctor">
                        <Input value="Dr. Sarah Martinez" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Phone" name="eyeDoctorPhone">
                        <Input value="(555) 234-5678" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Orthodontist" name="orthodontist">
                        <Input value="Dr. Robert Kim" readOnly />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Phone" name="orthodontistPhone">
                        <Input value="(555) 567-8901" readOnly />
                    </Form.Item>
                </Col>
            </Row>

            <Button type="dashed" onClick={handleAddProvider} style={{ marginTop: 16 }}>
                + Add Provider
            </Button>
        </Form>
    );

    const recordsTab = (
        <div>
            <Title level={5} style={{ marginBottom: 16 }}>Vaccination Records</Title>

            <List
                itemLayout="horizontal"
                dataSource={vaccinationRecords}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Tag color={item.statusColor}>{item.status}</Tag>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<SafetyCertificateOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                            title={item.name}
                            description={item.date}
                        />
                    </List.Item>
                )}
                style={{ marginBottom: 24 }}
            />

            <Title level={5} style={{ marginBottom: 16 }}>Physical Exams & Check-ups</Title>

            <List
                itemLayout="horizontal"
                dataSource={medicalExams}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Button size="small">View Report</Button>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<span style={{ fontSize: 20 }}>{item.icon}</span>}
                            title={item.name}
                            description={item.date}
                        />
                    </List.Item>
                )}
            />

            <Button type="dashed" onClick={handleAddRecord} style={{ marginTop: 16, width: '100%' }}>
                + Add Medical Record
            </Button>
        </div>
    );

    const schoolInfoTab = (
        <Card
            style={{
                background: 'linear-gradient(135deg, #e0e7ff, #f0f4f8)',
                border: '1px solid #d1d5db',
                marginBottom: 16
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{
                    width: 60,
                    height: 60,
                    backgroundColor: '#4338ca',
                    color: 'white',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0
                }}>
                    🏫
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <Title level={4} style={{ margin: '0 0 8px 0' }}>
                        Springfield High School
                    </Title>
                    <Text type="secondary">
                        9th Grade (Freshman) • Student ID: SHS2029-1234
                    </Text>

                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={12} sm={6}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Homeroom Teacher</Text>
                                <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>Mr. David Thompson</div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Guidance Counselor</Text>
                                <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>Mrs. Linda Johnson</div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Current GPA</Text>
                                <div style={{ fontWeight: 500 }}>3.8</div>
                            </div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div>
                                <Text type="secondary" style={{ fontSize: 12 }}>Graduation Year</Text>
                                <div style={{ fontWeight: 500 }}>2029</div>
                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>School Address</Text>
                            <div style={{ wordBreak: 'break-word' }}>1450 Education Boulevard, Springfield, IL 62701</div>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>Notes</Text>
                            <div style={{ wordBreak: 'break-word' }}>Honor Roll student. Interested in AP Biology and Art History for next year.</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                        <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                            Resources & Links
                        </Text>
                        <Space wrap>
                            <a href="#" style={{ fontSize: 13 }}>🌐 School Website</a>
                            <a href="#" style={{ fontSize: 13 }}>📊 Parent Portal</a>
                            <a href="#" style={{ fontSize: 13 }}>📧 School Email</a>
                            <a href="#" style={{ fontSize: 13 }}>📅 School Calendar</a>
                        </Space>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <span
                            style={{
                                fontSize: 13,
                                color: '#3355ff',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center'
                            }}
                            onClick={() => handleAddCustomField('school')}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = 'none';
                            }}
                        >
                            + Add custom field
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );

    const activitiesTab = (
        <div>
            {/* Soccer Team */}
            <Card style={{ marginBottom: 16, border: '1px solid #d1d5db' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 60,
                        height: 60,
                        backgroundColor: '#10b981',
                        color: 'white',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        flexShrink: 0
                    }}>
                        ⚽
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                            Soccer Team - Varsity
                        </Title>
                        <Text type="secondary">
                            Practice: Tuesday & Thursday 4:00-6:00 PM • Games: Fridays
                        </Text>

                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Coach</Text>
                                    <div style={{ fontWeight: 500 }}>Coach Martinez</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Position</Text>
                                    <div style={{ fontWeight: 500 }}>Forward</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Season</Text>
                                    <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>Fall 2024 - Spring 2025</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Location</Text>
                                    <div style={{ fontWeight: 500 }}>Athletic Field #2</div>
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                            <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                                Resources & Links
                            </Text>
                            <Space wrap>
                                <a href="#" style={{ fontSize: 13 }}>📅 Game Schedule</a>
                                <a href="#" style={{ fontSize: 13 }}>👕 Uniform Order Form</a>
                                <a href="#" style={{ fontSize: 13 }}>📧 Team Communication</a>
                                <a href="#" style={{ fontSize: 13 }}>🏆 League Standings</a>
                            </Space>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <span
                                style={{
                                    fontSize: 13,
                                    color: '#3355ff',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => handleAddCustomField('soccer')}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                }}
                            >
                                + Add custom field
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Art Club */}
            <Card style={{ marginBottom: 16, border: '1px solid #d1d5db' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 60,
                        height: 60,
                        backgroundColor: '#d97706',
                        color: 'white',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        flexShrink: 0
                    }}>
                        🎨
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                            Art Club
                        </Title>
                        <Text type="secondary">
                            Wednesdays 3:30-5:00 PM • Room 204
                        </Text>

                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Advisor</Text>
                                    <div style={{ fontWeight: 500 }}>Ms. Rodriguez</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Focus</Text>
                                    <div style={{ fontWeight: 500 }}>Mixed Media</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Current Project</Text>
                                    <div style={{ fontWeight: 500 }}>Spring Exhibition</div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Materials Fee</Text>
                                    <div style={{ fontWeight: 500 }}>$50/semester</div>
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                            <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
                                Resources & Links
                            </Text>
                            <Space wrap>
                                <a href="#" style={{ fontSize: 13 }}>🖼️ Portfolio Guidelines</a>
                                <a href="#" style={{ fontSize: 13 }}>🎨 Supply List</a>
                                <a href="#" style={{ fontSize: 13 }}>📸 Instagram Gallery</a>
                                <a href="#" style={{ fontSize: 13 }}>🏛️ Museum Field Trips</a>
                            </Space>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <span
                                style={{
                                    fontSize: 13,
                                    color: '#3355ff',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => handleAddCustomField('art')}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                }}
                            >
                                + Add custom field
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <Button
                type="dashed"
                onClick={handleAddActivity}
                style={{ width: '100%' }}
            >
                + Add Activity
            </Button>
        </div>
    );

    const accountsTab = (
        <div>
            <Alert
                message="🔐 All passwords are securely encrypted and only accessible by guardians"
                type="warning"
                style={{ marginBottom: 16, fontSize: 12 }}
            />

            {renderAccountSection('School & Education', schoolAccounts)}
            {renderAccountSection('Personal Accounts', personalAccounts)}
            {renderAccountSection('Entertainment & Subscriptions', entertainmentAccounts)}
            {renderAccountSection('Other', otherAccounts)}
        </div>
    );

    const devicesTab = (
        <List
            itemLayout="horizontal"
            dataSource={devices}
            renderItem={(item) => (
                <List.Item
                    actions={[
                        <Button size="small" type="text">
                            {item.action}
                        </Button>
                    ]}
                >
                    <List.Item.Meta
                        avatar={
                            <div style={{
                                width: 40,
                                height: 40,
                                backgroundColor: '#f5f5f5',
                                color: '#595959',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16
                            }}>
                                {item.icon}
                            </div>
                        }
                        title={
                            <Text style={{ fontSize: 14, fontWeight: 500 }}>
                                {item.name}
                            </Text>
                        }
                        description={
                            <Text type="secondary" style={{ fontSize: 12, wordBreak: 'break-word' }}>
                                {item.meta}
                            </Text>
                        }
                    />
                </List.Item>
            )}
        />
    );

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Layout style={{ overflow: 'hidden' }}>


                <Content style={{
                    padding: '24px',
                    overflow: 'auto',
                    background: '#f5f5f5'
                }}>
                    {/* Member Profile Header */}
                    <Card
                        style={{
                            background: 'linear-gradient(135deg, #3355ff, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 16,
                            marginBottom: 24
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                            <Avatar
                                size={80}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    fontSize: 32,
                                    fontWeight: 600,
                                    flexShrink: 0
                                }}
                            >
                                E
                            </Avatar>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Title level={2} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
                                    Emma Smith
                                </Title>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, display: 'block', marginBottom: 12 }}>
                                    Daughter • 14 years old • Born March 15, 2011
                                </Text>
                                <Tag
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: 20,
                                    }}
                                >
                                    Child Access Level
                                </Tag>
                            </div>

                            <Button
                                icon={<EditOutlined />}
                                onClick={handleEdit}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    backdropFilter: 'blur(10px)',
                                    flexShrink: 0
                                }}
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </Card>

                    <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Personal Information Section */}
                                <Card
                                    title={
                                        <span>
                                            <FileTextOutlined style={{ marginRight: 8 }} />
                                            Personal Information
                                        </span>
                                    }
                                    extra={
                                        <EditOutlined
                                            style={{ cursor: 'pointer', color: '#1890ff' }}
                                            onClick={handleEdit}
                                        />
                                    }
                                    style={{ borderRadius: 12 }}
                                >
                                    <Form form={form} layout="vertical">
                                        <Title level={5} style={{ marginBottom: 16 }}>Basic Information</Title>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="First Name" name="firstName">
                                                    <Input value="Emma" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Middle Name" name="middleName">
                                                    <Input value="Rose" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Last Name" name="lastName">
                                                    <Input value="Smith" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Preferred Name" name="preferredName">
                                                    <Input value="Emma" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Nickname(s)" name="nicknames">
                                                    <Input value="Em, Emmy" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Relationship" name="relationship">
                                                    <Input value="Daughter" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Date of Birth" name="dateOfBirth">
                                                    <Input type="date" value="2011-03-15" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Age" name="age">
                                                    <Input value="14 years old" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Birthplace" name="birthplace">
                                                    <Input value="Springfield, Illinois" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Gender" name="gender">
                                                    <Select value="Female" disabled>
                                                        <Select.Option value="Female">Female</Select.Option>
                                                        <Select.Option value="Male">Male</Select.Option>
                                                        <Select.Option value="Other">Other</Select.Option>
                                                        <Select.Option value="Prefer not to say">Prefer not to say</Select.Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Contact Information</Title>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Phone Number" name="phoneNumber">
                                                    <Input value="(555) 123-4567" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Primary Email" name="primaryEmail">
                                                    <Input value="emma.smith@family.com" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item label="Additional Email(s)" name="additionalEmails">
                                            <Input value="emma.smith2029@schooldistrict.edu" readOnly />
                                        </Form.Item>

                                        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Address</Title>

                                        <Form.Item name="sameAsPrimary" valuePropName="checked">
                                            <Checkbox defaultChecked>Same as primary account holder</Checkbox>
                                        </Form.Item>

                                        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Identification Documents</Title>

                                        <Alert
                                            message="🔒 Sensitive Information - Access restricted to guardians only"
                                            type="warning"
                                            style={{ marginBottom: 16 }}
                                        />

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Social Security Number" name="ssn">
                                                    <Input.Password value="•••-••-••••" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Birth Certificate Number" name="birthCertNumber">
                                                    <Input.Password value="••••••••••" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Emergency Contacts</Title>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Primary Contact" name="primaryContact">
                                                    <Input value="John Smith (Father)" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Phone" name="primaryContactPhone">
                                                    <Input value="(555) 987-6543" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Secondary Contact" name="secondaryContact">
                                                    <Input value="Sarah Smith (Mother)" readOnly />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item label="Phone" name="secondaryContactPhone">
                                                    <Input value="(555) 876-5432" readOnly />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Card>

                                {/* Medical Information Section */}
                                <Card
                                    title={
                                        <span>
                                            <MedicineBoxOutlined style={{ marginRight: 8 }} />
                                            Medical Information
                                        </span>
                                    }
                                    extra={
                                        <EditOutlined
                                            style={{ cursor: 'pointer', color: '#1890ff' }}
                                            onClick={handleEdit}
                                        />
                                    }
                                    style={{ borderRadius: 12 }}
                                >
                                    <Tabs
                                        items={[
                                            {
                                                key: 'general',
                                                label: 'General',
                                                children: generalTab,
                                            },
                                            {
                                                key: 'providers',
                                                label: 'Providers',
                                                children: providersTab,
                                            },
                                            {
                                                key: 'records',
                                                label: 'Medical Records',
                                                children: recordsTab,
                                            },
                                        ]}
                                    />
                                </Card>

                                {/* School & Activities Section */}
                                <Card
                                    title={
                                        <span>
                                            <BookOutlined style={{ marginRight: 8 }} />
                                            School & Activities
                                        </span>
                                    }
                                    extra={
                                        <EditOutlined
                                            style={{ cursor: 'pointer', color: '#1890ff' }}
                                            onClick={handleEdit}
                                        />
                                    }
                                    style={{ borderRadius: 12 }}
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
                            </div>
                        </Col>

                        <Col xs={24} lg={8}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Documents & Records Section */}
                                <Card
                                    title={
                                        <span>
                                            <FileTextOutlined style={{ marginRight: 8 }} />
                                            Documents & Records
                                        </span>
                                    }
                                    extra={
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            size="small"
                                            onClick={handleAddDocument}
                                            style={{ color: '#1890ff' }}
                                        />
                                    }
                                    style={{ borderRadius: 12 }}
                                >
                                    <List
                                        dataSource={documents}
                                        split
                                        renderItem={(item) => (
                                            <List.Item>
                                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                    {/* Icon */}
                                                    <div
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            backgroundColor: `${item.color}20`,
                                                            color: item.color,
                                                            borderRadius: 8,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: 18,
                                                            flexShrink: 0,
                                                            marginRight: 12,
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </div>

                                                    {/* Name & Meta */}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                                                            {item.name}
                                                        </div>
                                                        <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                                                            {item.meta}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <Button size="small" style={{ fontWeight: 500 }}>View</Button>
                                                        <Button size="small" style={{ fontWeight: 500 }}>Download</Button>
                                                    </div>
                                                </div>
                                            </List.Item>
                                        )}
                                    />

                                </Card>

                                {/* Accounts & Assets Section */}
                                <Card
                                    title={
                                        <span>
                                            <LaptopOutlined style={{ marginRight: 8 }} />
                                            Accounts & Assets
                                        </span>
                                    }
                                    extra={
                                        <Button
                                            type="text"
                                            icon={<PlusOutlined />}
                                            size="small"
                                            onClick={handleAddAccountAsset}
                                            style={{ color: '#1890ff' }}
                                        />
                                    }
                                    style={{ borderRadius: 12 }}
                                >
                                    <Tabs
                                        items={[
                                            {
                                                key: 'accounts',
                                                label: 'Accounts & Passwords',
                                                children: accountsTab,
                                            },
                                            {
                                                key: 'devices',
                                                label: 'Devices',
                                                children: devicesTab,
                                            },
                                        ]}
                                    />
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default FamilyMembers;