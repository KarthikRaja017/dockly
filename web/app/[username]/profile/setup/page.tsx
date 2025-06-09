'use client';
import React, { useEffect, useState } from 'react';
import {
    Card,
    Avatar,
    Button,
    Input,
    Form,
    Steps,
    message,
    Space,
    Typography,
    DatePicker,
} from 'antd';
import {
    SaveOutlined,
    ArrowRightOutlined,
    ArrowLeftOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AxiosResponse } from 'axios';
import { userAddProfile } from '../../../../services/user';
import { showNotification } from '../../../../utils/notification';

const { Step } = Steps;
const { Title, Text } = Typography;

const SetupPage: React.FC = () => {
    const [profileImage] = useState<string>('https://randomuser.me/api/portraits/men/32.jpg');
    const [formPersonal] = Form.useForm();
    const [formAddress] = Form.useForm();
    const [formSecurity] = Form.useForm();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) setUsername(storedUsername);
    }, []);

    const handleNext = async () => {
        const forms = [formPersonal, formSecurity, formAddress];
        try {
            await forms[currentStep].validateFields();
            setCurrentStep((prev) => prev + 1);
        } catch {
            message.error('Please fill in all required fields before proceeding.');
        }
    };

    const handlePrev = () => setCurrentStep((prev) => prev - 1);

    const handleSave = async () => {
        try {
            const [personalValues, securityValues, addressValues] = await Promise.all([
                formPersonal.validateFields(),
                formSecurity.validateFields(),
                formAddress.validateFields(),
            ]);

            const profileData = {
                personal: personalValues,
                security: securityValues,
                address: addressValues,
            };

            const response: AxiosResponse<any> = await userAddProfile({
                userName: username,
                ...profileData
            });
            const { status, message: msg, payload } = response.data;
            if (!status) {
                showNotification("Error", msg, "error");
                if (payload?.setStep) {
                    setCurrentStep(payload.setStep);
                    formSecurity.resetFields();
                }
            }
            if (status) {
                showNotification("Success", msg, "success");
                router.push(`/${payload?.username || 'user'}/dashboard`);
            }
            // message.success('Profile setup completed successfully!');
        } catch (error) {
            // message.error('Please fill in all required fields.');
        }
    };

    const stepTitles = ['Set Up Personal Information', 'Security Details', 'Address Details'];
    const stepColors = ['#4CAF50', '#FF5722', '#673AB7'];

    return (
        <div
            style={{
                padding: '24px',
                paddingTop: '65px',
                maxWidth: '900px',
                margin: 'auto',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: '#f5f7fa',
                marginTop: '50px',
            }}
        >
            <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size={80} src={profileImage} />
                    <EditOutlined style={{ marginLeft: 16, fontSize: 20 }} />
                    <div style={{ marginLeft: '16px' }}>
                        <Title level={3} style={{ marginBottom: 0, color: '#1E88E5' }}>Set Up Your Profile</Title>
                        <Text type="secondary">Let’s personalize your experience</Text>
                    </div>
                </div>
            </Card>

            <Steps current={currentStep} size="small" style={{ marginBottom: '24px' }}>
                {stepTitles.map((title, index) => (
                    <Step key={index} title={`Step ${index + 1}`} />
                ))}
            </Steps>

            <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
            >
                <Card
                    title={<span style={{ color: stepColors[currentStep] }}>{stepTitles[currentStep]}</span>}
                    style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                    <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                        <Form form={formPersonal} layout="vertical" requiredMark>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <Form.Item
                                    name="first_name"
                                    label="First Name"
                                    rules={[{ required: true, message: 'Please enter your first name' }]}
                                    style={{ flex: '1' }}
                                >
                                    <Input placeholder="Enter your first name" />
                                </Form.Item>
                                <Form.Item
                                    name="last_name"
                                    label="Last Name"
                                    rules={[{ required: true, message: 'Please enter your last name' }]}
                                    style={{ flex: '1' }}
                                >
                                    <Input placeholder="Enter your last name" />
                                </Form.Item>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '16px' }}>
                                <Form.Item
                                    name="dob"
                                    label="Date of Birth"
                                    rules={[{ required: true, message: 'Please enter your date of birth' }]}
                                    style={{ flex: '1' }}
                                >
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email Address"
                                    rules={[{ required: true, message: 'Please enter your email', type: 'email' }]}
                                    style={{ flex: '1' }}
                                >
                                    <Input placeholder="Enter your email address" />
                                </Form.Item>
                                <Form.Item
                                    name="phone"
                                    label="Phone Number"
                                    rules={[{ required: true, message: 'Please enter your phone number' }]}
                                    style={{ flex: '1' }}
                                >
                                    <Input placeholder="Enter your phone number" />
                                </Form.Item>
                            </div>
                        </Form>
                    </div>

                    <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                        <Form form={formSecurity} layout="vertical" requiredMark>
                            <Form.Item
                                name="backupEmail"
                                label="Backup Email"
                                rules={[{ required: true, message: 'Please enter a backup email', type: 'email' }]}
                            >
                                <Input placeholder="Enter your backup email" />
                            </Form.Item>
                        </Form>
                    </div>

                    <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                        <Form form={formAddress} layout="vertical" requiredMark>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <Form.Item
                                    name="country"
                                    label="Country"
                                    rules={[{ required: true, message: 'Please enter your country' }]}
                                    style={{ flex: '1' }}
                                >
                                    <Input placeholder="Enter your country" />
                                </Form.Item>
                                <Form.Item
                                    name="city"
                                    label="City"
                                    rules={[{ required: true, message: 'Please enter your city' }]}
                                    style={{ flex: '1' }}
                                >
                                    <Input placeholder="Enter your city" />
                                </Form.Item>
                                <Form.Item
                                    name="postal_code"
                                    label="Postal Code"
                                    rules={[{ required: true, message: 'Please enter your postal code' }]}
                                    style={{ flex: '1' }}
                                >
                                    <Input placeholder="Enter your postal code" />
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                </Card>
            </motion.div>

            <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                {currentStep > 0 && (
                    <Button onClick={handlePrev} icon={<ArrowLeftOutlined />}>
                        Previous
                    </Button>
                )}
                {currentStep < 2 && (
                    <Button type="primary" icon={<ArrowRightOutlined />} onClick={handleNext}>
                        Next
                    </Button>
                )}
                {currentStep === 2 && (
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                        Save Profile
                    </Button>
                )}
            </Space>
        </div>
    );
};

export default SetupPage;
