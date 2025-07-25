'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Typography, Button, Card, Row, Col, Alert, Select, Checkbox } from 'antd';
import {
    FileTextOutlined,
    EditOutlined
} from '@ant-design/icons';
import { addPersonalInfo, getPersonalInfo, updatePersonalInfo } from '../../../services/family';

const { Title } = Typography;

interface FormValues {
    firstName: string;
    middleName: string;
    lastName: string;
    preferredName: string;
    nicknames: string;
    relationship: string;
    dateOfBirth: string;
    age: string;
    birthplace: string;
    gender: string;
    phoneNumber: string;
    primaryEmail: string;
    additionalEmails: string;
    sameAsPrimary: boolean;
    ssn: string;
    birthCertNumber: string;
    stateId: string;
    passport: string;
    license: string;
    studentId: string;
    primaryContact: string;
    primaryContactPhone: string;
    secondaryContact: string;
    secondaryContactPhone: string;
}
interface PersonalInfoSectionProps {
    memberId?: string | string[];
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ memberId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm<FormValues>();
    const userId = Array.isArray(memberId) ? memberId[0] : memberId || '';
    const [personalId, setPersonalId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonalInfo = async () => {
            try {
                if (!userId) return;
                const response = await getPersonalInfo({ userId });
                if (response.status === 1 && response.payload) {
                    form.setFieldsValue(response.payload);
                    setPersonalId(response.payload.id); // save record ID
                }
            } catch (error) {
                console.error('Failed to fetch personal info:', error);
            }
        };

        fetchPersonalInfo();
    }, [form, userId]);

    const toggleEdit = () => setIsEditing((prev) => !prev);

    const onFinish = async (values: FormValues) => {
        try {
            const payload = {
                ...values,
                addedBy: userId,
                editedBy: userId,
                userId: userId,
                ...(personalId && { id: personalId })  // include `id` only if it exists
            };

            const response = personalId
                ? await updatePersonalInfo({ personal_info: payload })
                : await addPersonalInfo({ personal_info: payload });

            if (response.status === 1) {
                setIsEditing(false);
            } else {
                console.error('Save failed:', response.message);
            }
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };


    return (
        <Card
            title={
                <span>
                    <FileTextOutlined style={{ marginRight: 8 }} /> Personal Information
                </span>
            }
            extra={
                <EditOutlined style={{ cursor: 'pointer', color: '#1890ff' }} onClick={toggleEdit} />
            }
            style={{ borderRadius: 12 }}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Title level={5} style={{ marginBottom: 16 }}>Basic Information</Title>

                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="First Name" name="firstName"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Middle Name" name="middleName"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Last Name" name="lastName"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Preferred Name" name="preferredName"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Nickname(s)" name="nicknames"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Relationship" name="relationship"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Date of Birth" name="dateOfBirth"><Input type="date" readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Age" name="age"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Birthplace" name="birthplace"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Gender" name="gender">
                        <Select disabled={!isEditing}>
                            <Select.Option value="Female">Female</Select.Option>
                            <Select.Option value="Male">Male</Select.Option>
                            <Select.Option value="Other">Other</Select.Option>
                            <Select.Option value="Prefer not to say">Prefer not to say</Select.Option>
                        </Select>
                    </Form.Item></Col>
                </Row>

                <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Contact Information</Title>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Phone Number" name="phoneNumber"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Primary Email" name="primaryEmail"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Form.Item label="Additional Email(s)" name="additionalEmails"><Input readOnly={!isEditing} /></Form.Item>

                <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Address</Title>
                <Form.Item name="sameAsPrimary" valuePropName="checked">
                    <Checkbox disabled={!isEditing}>Same as primary account holder</Checkbox>
                </Form.Item>

                <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Identification Documents</Title>
                <Alert
                    message="🔒 Sensitive Information - Access restricted to guardians only"
                    type="warning"
                    style={{ marginBottom: 16 }}
                />
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Social Security Number" name="ssn"><Input.Password readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Birth Certificate Number" name="birthCertNumber"><Input.Password readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="State ID Number" name="stateId"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Passport Number" name="passport"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Driver's License" name="license"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Student ID" name="studentId"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>

                <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Emergency Contacts</Title>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Primary Contact" name="primaryContact"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Phone" name="primaryContactPhone"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}><Form.Item label="Secondary Contact" name="secondaryContact"><Input readOnly={!isEditing} /></Form.Item></Col>
                    <Col xs={24} sm={12}><Form.Item label="Phone" name="secondaryContactPhone"><Input readOnly={!isEditing} /></Form.Item></Col>
                </Row>

                {isEditing && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" style={{ borderRadius: 6, padding: '4px 24px' }}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </Form>
        </Card>
    );
};

export default PersonalInfoSection;
