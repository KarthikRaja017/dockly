
'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    Tabs,
    Form,
    Input,
    Button,
    Row,
    Col,
    Typography,
    List,
    Tag,
    message,
    Modal,
} from 'antd';
import {
    EditOutlined,
    MedicineBoxOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { getPersonalInfo, addPersonalInfo, getProviders, updatePersonalInfo, updateProvider, addProvider } from '../../../services/family';

const { Title } = Typography;
const { TextArea } = Input;

type ProviderField = {
    id: number;
    title: string;
    name: string;
    phoneName: string;
    label: string;
    phoneLabel: string;
    initialName: string;
    initialPhone: string;
};

const MedicalInfoPage: React.FC = () => {
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);
    const [providerModalVisible, setProviderModalVisible] = useState(false);
    const [providerFields, setProviderFields] = useState<ProviderField[]>([]);
    const [providerForm] = Form.useForm();
    const [personalInfoId, setPersonalInfoId] = useState<string | null>(null);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const id = localStorage.getItem('userId') || '';
        setUserId(id);
    }, []);

    const vaccinationRecords = [
        { name: 'COVID-19 (Pfizer)', date: 'Full series completed: June 15, 2024', status: 'Up to date', statusColor: 'green' },
        { name: 'Flu Shot', date: 'Last dose: October 10, 2024', status: 'Current', statusColor: 'blue' },
        { name: 'Tdap', date: 'Last booster: August 5, 2023', status: 'Current', statusColor: 'blue' },
        { name: 'MMR', date: 'Completed series: Age 4', status: 'Complete', statusColor: 'green' },
        { name: 'HPV', date: 'Series started: January 2024', status: 'In progress', statusColor: 'orange' },
    ];

    const medicalExams = [
        { name: 'Annual Physical', date: 'March 3, 2024', icon: '🩺' },
        { name: 'Vision Test', date: 'May 20, 2024', icon: '👁' },
    ];

    const fetchInfo = async () => {
        if (!userId) return;
        try {
            const [personalRes, providerRes] = await Promise.all([
                getPersonalInfo({ userId }),
                getProviders({ userId }),
            ]);

            if (personalRes.status === 1 && personalRes.payload) {
                form.setFieldsValue(personalRes.payload);
                setPersonalInfoId(personalRes.payload.id);
            }

            if (providerRes.status === 1 && providerRes.payload?.length) {
                const fields = providerRes.payload.map((prov: any) => {
                    const key = prov.provider_title.replace(/\s+/g, '').toLowerCase();
                    return {
                        id: prov.id,
                        title: prov.provider_title,
                        name: key,
                        phoneName: `${key}Phone`,
                        label: prov.provider_title,
                        phoneLabel: 'Phone',
                        initialName: prov.provider_name,
                        initialPhone: prov.provider_phone,
                    };
                });
                setProviderFields(fields);
            }
        } catch (err) {
            message.error('Failed to load medical information');
        }
    };

    useEffect(() => {
        if (providerFields.length) {
            const values: Record<string, any> = {};
            providerFields.forEach((field) => {
                values[field.name] = field.initialName;
                values[field.phoneName] = field.initialPhone;
            });
            form.setFieldsValue(values);
        }
    }, [providerFields]);

    const handleSave = async () => {
        try {
            if (personalInfoId) {
                form.setFieldValue('id', personalInfoId);
            }

            const values = await form.validateFields();

            const personalRes = await updatePersonalInfo({
                personal_info: {
                    ...values,
                    id: personalInfoId,
                    addedBy: userId,
                    editedBy: userId,
                },
            });

            const updatedProviders = providerFields.map(field => ({
                id: field.id,
                providerTitle: field.title,
                providerName: values[field.name],
                providerPhone: values[field.phoneName],
                userId,
                editedBy: userId,
            }));

            for (const p of updatedProviders) {
                await updateProvider(p);
            }

            if (personalRes.status === 1) {
                message.success('Medical information saved');
                setIsEditing(false);
            } else {
                message.error(personalRes.message);
            }

        } catch (err) {
            message.error('Validation or save failed');
        }
    };

    useEffect(() => {
        fetchInfo();
    }, [userId]);

    const generalTab = (
        <>
            <Form.Item name="id" hidden>
                <Input type="hidden" />
            </Form.Item>
            <Title level={5}>Basic Medical Information</Title>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Blood Type" name="bloodType"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Height" name="height"><Input readOnly={!isEditing} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Weight" name="weight"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Eye Color" name="eyeColor"><Input readOnly={!isEditing} /></Form.Item></Col>
            </Row>

            <Title level={5} style={{ marginTop: 24 }}>Insurance Information</Title>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Insurance Provider" name="insurance"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Member ID" name="memberId"><Input readOnly={!isEditing} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Group Number" name="groupNum"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Last Checkup" name="lastCheckup"><Input type="date" readOnly={!isEditing} /></Form.Item></Col>
            </Row>

            <Title level={5} style={{ marginTop: 24 }}>Allergies & Medications</Title>
            <Form.Item label="Known Allergies" name="allergies"><TextArea readOnly={!isEditing} /></Form.Item>
            <Form.Item label="Current Medications" name="medications"><TextArea readOnly={!isEditing} /></Form.Item>
            <Form.Item label="Medical Notes" name="notes"><TextArea readOnly={!isEditing} /></Form.Item>
        </>
    );

    const HandleAddProvider = async () => {
        try {
            const values = await providerForm.validateFields();
            const key = values.providerTitle.replace(/\s+/g, '').toLowerCase();

            const res = await addProvider({
                provider: {
                    providerTitle: values.providerTitle,
                    providerName: values.providerName,
                    providerPhone: values.providerPhone,
                    userId,
                    addedBy: userId,
                }
            });

            if (res.status !== 1) {
                return message.error(res.message || 'Failed to add provider');
            }

            const newField: ProviderField = {
                id: res.payload?.id,
                title: values.providerTitle,
                name: key,
                phoneName: `${key}Phone`,
                label: values.providerTitle,
                phoneLabel: 'Phone',
                initialName: values.providerName,
                initialPhone: values.providerPhone,
            };

            form.setFieldValue(key, values.providerName);
            form.setFieldValue(`${key}Phone`, values.providerPhone);
            setProviderFields(prev => [...prev, newField]);
            setProviderModalVisible(false);
            providerForm.resetFields();
        } catch (err) {
            message.error('Error adding provider');
        }
    };

    const providersTab = (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={5} style={{ margin: 0 }}>Healthcare Providers</Title>
                <Button type="dashed" onClick={() => setProviderModalVisible(true)}>+ Add Provider</Button>
            </div>
            {providerFields.map((field, idx) => (
                <Row gutter={16} key={idx}>
                    <Col span={12}>
                        <Form.Item label={field.label} name={field.name}>
                            <Input readOnly={!isEditing} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={field.phoneLabel} name={field.phoneName}>
                            <Input readOnly={!isEditing} />
                        </Form.Item>
                    </Col>
                </Row>
            ))}
        </>
    );

    const recordsTab = (
        <>
            <Title level={5}>Vaccination Records</Title>
            <List
                itemLayout="horizontal"
                dataSource={vaccinationRecords}
                renderItem={item => (
                    <List.Item actions={[<Tag color={item.statusColor}>{item.status}</Tag>]}>
                        <List.Item.Meta
                            avatar={<SafetyCertificateOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                            title={item.name}
                            description={item.date}
                        />
                    </List.Item>
                )}
            />
            <Title level={5} style={{ marginTop: 32 }}>Medical Exams</Title>
            <List
                itemLayout="horizontal"
                dataSource={medicalExams}
                renderItem={item => (
                    <List.Item actions={[<Button size="small">View Report</Button>]}>
                        <List.Item.Meta
                            avatar={<span style={{ fontSize: 20 }}>{item.icon}</span>}
                            title={item.name}
                            description={item.date}
                        />
                    </List.Item>
                )}
            />
        </>
    );

    return (
        <>
            <Card
                title={<span><MedicineBoxOutlined style={{ marginRight: 8 }} />Medical Information</span>}
                extra={isEditing ? (
                    <Button type="primary" onClick={handleSave}>Save</Button>
                ) : (
                    <EditOutlined style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => setIsEditing(true)} />
                )}
                style={{ borderRadius: 12 }}
            >
                <Form layout="vertical" form={form}>
                    <Tabs
                        destroyInactiveTabPane={false}
                        items={[
                            { key: 'general', label: 'General', children: generalTab },
                            { key: 'providers', label: 'Providers', children: providersTab },
                            { key: 'records', label: 'Medical Records', children: recordsTab },
                        ]}
                    />
                </Form>
            </Card>
            <Modal
                title="Add Provider"
                open={providerModalVisible}
                onCancel={() => setProviderModalVisible(false)}
                onOk={HandleAddProvider}
                okText="Add"
            >
                <Form form={providerForm} layout="vertical">
                    <Form.Item
                        name="providerTitle"
                        label="Provider Title"
                        rules={[{ required: true, message: 'Please enter provider title' }]}
                    >
                        <Input placeholder="e.g., Dentist" />
                    </Form.Item>
                    <Form.Item
                        name="providerName"
                        label="Provider Name"
                        rules={[{ required: true, message: 'Please enter provider name' }]}
                    >
                        <Input placeholder="e.g., Dr. Joel" />
                    </Form.Item>
                    <Form.Item
                        name="providerPhone"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input placeholder="e.g., 9876543210" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default MedicalInfoPage;