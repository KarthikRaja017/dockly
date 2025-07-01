
'use client';
import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Typography, Button, Card, message } from 'antd';
import { FileTextOutlined, EditOutlined } from '@ant-design/icons';
import { addPersonalInfo, getPersonalInfo } from '../../../services/family';

const { Title } = Typography;

interface FormValues {
    stateId: string;
    passport: string;
    license: string;
    birthCert: string;
    primaryContact: string;
    primaryPhone: string;
    secondaryContact: string;
    secondaryPhone: string;
    emergencyContact: string;
    emergencyPhone: string;
    bloodType: string;
    height: string;
    weight: string;
    eyeColor: string;
    physician: string;
    physicianPhone: string;
    dentist: string;
    dentistPhone: string;
    insurance: string;
    memberId: string;
    groupNum: string;
    lastCheckup: string;
    allergies: string;
    medications: string;
    notes: string;
    ssn: string;
    studentId: string;
}

const PersonalInfoSection: React.FC = () => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [form] = Form.useForm<FormValues>();
    const userId = 'currentUserId'; // Replace with actual user ID from auth context

    useEffect(() => {
        const fetchPersonalInfo = async () => {
            try {
                const response = await getPersonalInfo({ userId });
                if (response.status === 1 && response.payload) {
                    form.setFieldsValue(response.payload);
                    message.success('Personal information loaded successfully');
                } else {
                    message.info('No personal information found, using default values');
                }
            } catch (error) {
                message.error('Failed to fetch personal information');
                console.error('Error fetching personal info:', error);
            }
        };
        fetchPersonalInfo();
    }, [form, userId]);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
    };

    const onFinish = async (values: FormValues) => {
        try {
            const response = await addPersonalInfo({
                personal_info: {
                    ...values,
                    addedBy: userId,
                    editedBy: userId,
                },
            });
            message.success('Personal information saved successfully');
            console.log('Personal info saved:', response);
            setIsEditing(false);
        } catch (error) {
            message.error('Failed to save personal information');
            console.error('Error saving personal info:', error);
        }
    };

    return (
        <Card style={{ marginTop: '32px', padding: '24px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Personal Information</h2>
                <Button
                    type={isEditing ? 'default' : 'primary'}
                    onClick={toggleEdit}
                    style={{ borderRadius: '6px', padding: '4px 16px' }}
                    icon={<EditOutlined />}
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </Button>
            </div>

            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                initialValues={{
                    stateId: 'Not yet issued',
                    passport: 'Not yet issued',
                    license: 'N/A - Under 16',
                    birthCert: '1234567890',
                    primaryContact: 'John Smith (Father)',
                    primaryPhone: '(555) 987-6543',
                    secondaryContact: 'Sarah Smith (Mother)',
                    secondaryPhone: '(555) 876-5432',
                    emergencyContact: 'Mary Johnson (Grandmother)',
                    emergencyPhone: '(555) 234-5678',
                    bloodType: 'O+',
                    height: "5'4",
                    weight: '115 lbs',
                    eyeColor: 'Brown',
                    physician: 'Dr. Emily Chen',
                    physicianPhone: '(555) 456-7890',
                    dentist: 'Dr. Michael Wilson',
                    dentistPhone: '(555) 345-6789',
                    insurance: 'Blue Cross Blue Shield',
                    memberId: 'JS789456-02',
                    groupNum: 'GRP123456',
                    lastCheckup: '2024-12-15',
                    allergies: 'None known at this time',
                    medications: 'None',
                    notes: 'Regular checkups with Dr. Chen. No significant medical history.',
                    ssn: '',
                    studentId: '',
                }}
            >
                <Tabs defaultActiveKey="profile" type="card" style={{ marginBottom: '24px' }}>
                    {/* Profile Tab */}
                    <Tabs.TabPane tab="Profile" key="profile">
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="stateId" label="State ID Number" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="passport" label="Passport Number" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="license" label="Driver's License" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="birthCert" label="Birth Certificate Number" style={{ flex: 1 }}>
                                <Input.Password readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>

                        <Title level={5} style={{ margin: '24px 0 16px' }}>Emergency Contacts</Title>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="primaryContact" label="Primary Contact" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="primaryPhone" label="Phone" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="secondaryContact" label="Secondary Contact" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="secondaryPhone" label="Phone" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item name="emergencyContact" label="Emergency Contact (Non-Parent)" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="emergencyPhone" label="Phone" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                    </Tabs.TabPane>

                    {/* Medical Tab */}
                    <Tabs.TabPane tab="Medical" key="medical">
                        <Title level={5} style={{ marginBottom: '16px' }}>Basic Medical Information</Title>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="bloodType" label="Blood Type" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="height" label="Height" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="weight" label="Weight" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="eyeColor" label="Eye Color" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>

                        <Title level={5} style={{ margin: '24px 0 16px' }}>Healthcare Providers</Title>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="physician" label="Primary Care Physician" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="physicianPhone" label="Phone" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="dentist" label="Dentist" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="dentistPhone" label="Phone" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>

                        <Title level={5} style={{ margin: '24px 0 16px' }}>Insurance Information</Title>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="insurance" label="Insurance Provider" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="memberId" label="Member ID" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item name="groupNum" label="Group Number" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="lastCheckup" label="Last Checkup" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>

                        <Title level={5} style={{ margin: '24px 0 16px' }}>Allergies & Medications</Title>
                        <Form.Item name="allergies" label="Known Allergies">
                            <Input.TextArea readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                        </Form.Item>
                        <Form.Item name="medications" label="Current Medications">
                            <Input.TextArea readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                        </Form.Item>
                        <Form.Item name="notes" label="Medical Notes">
                            <Input.TextArea readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                        </Form.Item>

                        <Title level={5} style={{ margin: '24px 0 16px' }}>Vaccination Records</Title>
                        {[
                            { name: 'COVID-19 (Pfizer)', date: 'Full series completed: June 15, 2024', status: 'Up to date' },
                            { name: 'Flu Shot', date: 'Last dose: October 10, 2024', status: 'Current' },
                            { name: 'Tdap', date: 'Last booster: August 5, 2023', status: 'Current' },
                            { name: 'MMR', date: 'Completed series: Age 4', status: 'Complete' },
                            { name: 'HPV', date: 'Series started: January 2024', status: 'In progress' },
                        ].map((vax, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    marginBottom: '8px',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>💉 {vax.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{vax.date}</div>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>{vax.status}</span>
                            </div>
                        ))}
                    </Tabs.TabPane>

                    {/* Identification Tab */}
                    <Tabs.TabPane tab="Identification" key="identification">
                        <div
                            style={{
                                backgroundColor: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                marginBottom: '16px',
                                color: '#b91c1c',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            🔒 <span>Sensitive Information - Access restricted to guardians only</span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <Form.Item
                                name="ssn"
                                label={
                                    <span>
                                        Social Security Number{' '}
                                        <span
                                            style={{
                                                backgroundColor: '#fecaca',
                                                color: '#b91c1c',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                marginLeft: '8px',
                                            }}
                                        >
                                            High Security
                                        </span>
                                    </span>
                                }
                                style={{ flex: 1 }}
                            >
                                <Input.Password readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="studentId" label="Student ID" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item name="stateId" label="State ID Number" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                            <Form.Item name="passport" label="Passport Number" style={{ flex: 1 }}>
                                <Input readOnly={!isEditing} style={{ borderRadius: '6px' }} />
                            </Form.Item>
                        </div>
                    </Tabs.TabPane>
                </Tabs>

                {isEditing && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <Button type="primary" htmlType="submit" style={{ borderRadius: '6px', padding: '4px 24px' }}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </Form>
        </Card>
    );
};

export default PersonalInfoSection;
