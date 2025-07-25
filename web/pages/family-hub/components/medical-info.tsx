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
import {
    getPersonalInfo,
    getProviders,
    updatePersonalInfo,
    updateProvider,
    addProvider,
} from '../../../services/family';

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

interface MedicalInfoSectionProps {
    memberId?: string | string[];
}

const MedicalInfoPage: React.FC<MedicalInfoSectionProps> = ({ memberId }) => {
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);
    const [providerModalVisible, setProviderModalVisible] = useState(false);
    const [providerFields, setProviderFields] = useState<ProviderField[]>([]);
    const [providerForm] = Form.useForm();
    const [personalInfoId, setPersonalInfoId] = useState<string | null>(null);

    // Coerce memberId prop to a flat string userId
    const userId = Array.isArray(memberId) ? memberId[0] : memberId ?? '';

    // Fetch both personal info and providers when userId changes
    useEffect(() => {
        if (!userId) return;

        const fetchInfo = async () => {
            try {
                const [personalRes, providerRes] = await Promise.all([
                    getPersonalInfo({ userId }),
                    getProviders({ userId }),
                ]);

                // Populate personal info form
                if (personalRes.status === 1 && personalRes.payload) {
                    form.setFieldsValue(personalRes.payload);
                    setPersonalInfoId(personalRes.payload.id);
                }

                // Build dynamic provider fields
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

        fetchInfo();
    }, [form, userId]);

    // When providerFields load, set their initial values
    useEffect(() => {
        if (!providerFields.length) return;
        const vals: Record<string, any> = {};
        providerFields.forEach(f => {
            vals[f.name] = f.initialName;
            vals[f.phoneName] = f.initialPhone;
        });
        form.setFieldsValue(vals);
    }, [form, providerFields]);

    // Handle the main Save
    const handleSave = async () => {
        try {
            // Ensure the hidden id field is included
            if (personalInfoId) {
                form.setFieldValue('id', personalInfoId);
            }

            const values = await form.validateFields();

            // Update personal info
            const personalRes = await updatePersonalInfo({
                personal_info: {
                    ...values,
                    id: personalInfoId,
                    addedBy: userId,
                    editedBy: userId,
                },
            });

            // Update each provider
            await Promise.all(providerFields.map(f =>
                updateProvider({
                    id: f.id,
                    providerTitle: f.title,
                    providerName: values[f.name],
                    providerPhone: values[f.phoneName],
                    userId,
                    editedBy: userId,
                })
            ));

            if (personalRes.status === 1) {
                message.success('Medical information saved');
                setIsEditing(false);
            } else {
                message.error(personalRes.message);
            }
        } catch {
            message.error('Validation or save failed');
        }
    };

    // Add a new provider from the modal
    const handleAddProvider = async () => {
        try {
            const vals = await providerForm.validateFields();
            const key = vals.providerTitle.replace(/\s+/g, '').toLowerCase();

            const res = await addProvider({
                provider: {
                    providerTitle: vals.providerTitle,
                    providerName: vals.providerName,
                    providerPhone: vals.providerPhone,
                    userId,
                    addedBy: userId,
                },
            });

            if (res.status !== 1) {
                return message.error(res.message || 'Failed to add provider');
            }

            const newField: ProviderField = {
                id: res.payload.id,
                title: vals.providerTitle,
                name: key,
                phoneName: `${key}Phone`,
                label: vals.providerTitle,
                phoneLabel: 'Phone',
                initialName: vals.providerName,
                initialPhone: vals.providerPhone,
            };
            setProviderFields(prev => [...prev, newField]);

            // Immediately show the new provider in the form
            form.setFieldsValue({ [key]: vals.providerName, [`${key}Phone`]: vals.providerPhone });

            setProviderModalVisible(false);
            providerForm.resetFields();
        } catch {
            message.error('Error adding provider');
        }
    };

    // Static data examples
    const vaccinationRecords = [
        { name: 'COVID-19 (Pfizer)', date: 'June 15, 2024', status: 'Up to date', statusColor: 'green' },
        { name: 'Flu Shot', date: 'Oct 10, 2024', status: 'Current', statusColor: 'blue' },
        // …etc
    ];
    const medicalExams = [
        { name: 'Annual Physical', date: 'Mar 3, 2024', icon: '🩺' },
        { name: 'Vision Test', date: 'May 20, 2024', icon: '👁' },
    ];

    // Tab contents
    const generalTab = (
        <>
            <Form.Item name="id" hidden><Input /></Form.Item>
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

    const providersTab = (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Title level={5}>Healthcare Providers</Title>
                <Button type="dashed" onClick={() => setProviderModalVisible(true)}>+ Add Provider</Button>
            </div>
            {providerFields.map((f, i) => (
                <Row gutter={16} key={i}>
                    <Col span={12}>
                        <Form.Item label={f.label} name={f.name}>
                            <Input readOnly={!isEditing} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={f.phoneLabel} name={f.phoneName}>
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
                title={<><MedicineBoxOutlined /> Medical Information</>}
                extra={isEditing
                    ? <Button type="primary" onClick={handleSave}>Save</Button>
                    : <EditOutlined onClick={() => setIsEditing(true)} style={{ color: '#1890ff', cursor: 'pointer' }} />
                }
                style={{ borderRadius: 12 }}
            >
                <Form form={form} layout="vertical">
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
                onOk={handleAddProvider}
                okText="Add"
            >
                <Form form={providerForm} layout="vertical">
                    <Form.Item name="providerTitle" label="Provider Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Dentist" />
                    </Form.Item>
                    <Form.Item name="providerName" label="Provider Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Dr. Smith" />
                    </Form.Item>
                    <Form.Item name="providerPhone" label="Phone" rules={[{ required: true }]}>
                        <Input placeholder="e.g. 5551234567" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default MedicalInfoPage;
