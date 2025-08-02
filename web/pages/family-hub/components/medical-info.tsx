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
    Upload,
    Collapse,
} from 'antd';
import {
    EditOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    HeartOutlined,
    InsuranceOutlined,
    AlertOutlined,
} from '@ant-design/icons';
import {
    getPersonalInfo,
    getProviders,
    updatePersonalInfo,
    updateProvider,
    addProvider,
    uploadMedicalRecordFile,
    getMedicalRecordFiles,
} from '../../../services/family';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

const { Title } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

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
    isEditing?: boolean;
}

const MedicalInfoPage: React.FC<MedicalInfoSectionProps> = ({ memberId, isEditing = false }) => {
    const [form] = Form.useForm();
    const [providerModalVisible, setProviderModalVisible] = useState(false);
    const [providerFields, setProviderFields] = useState<ProviderField[]>([]);
    const [providerForm] = Form.useForm();
    // const [personalInfoId, setPersonalInfoId] = useState<string | null>(null);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
    const [activeKey, setActiveKey] = useState<string | string[]>(['basic']);

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
                    console.log("Loaded personal info ID:", personalRes.payload.id); // 🔍 Add this
                    form.setFieldsValue(personalRes.payload);
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
            const values = await form.validateFields();
            const { id, ...rest } = values;
            const personalRes = await updatePersonalInfo({
                personal_info: {
                    ...rest,
                    addedBy: userId,
                    editedBy: userId,
                    userId,
                },
            });

            // Update each provider
            await Promise.all(providerFields.map(f =>
                updateProvider({
                    provider: {
                        id: f.id,
                        providerTitle: f.title,
                        providerName: values[f.name],
                        providerPhone: values[f.phoneName],
                        userId,
                        addedBy: userId,
                        editedBy: userId,
                    }

                })
            ));

            if (personalRes.status === 1) {
                message.success('Medical information saved');
                // Edit state is now controlled by parent
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

    const handleUpload = async (options: UploadRequestOption) => {
        const { file, onSuccess, onError } = options;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file as File);

            const res = await uploadMedicalRecordFile(formData);
            if (res.status === 1) {
                message.success('File uploaded successfully');
                setUploadModalVisible(false);
                fetchMedicalRecords(); // refresh list
                if (onSuccess) onSuccess({}, new XMLHttpRequest());
            } else {
                message.error(res.message || 'Upload failed');
                if (onError) onError(new Error(res.message));
            }
        } catch (err) {
            console.error(err);
            message.error('Upload error');
            if (onError) onError(err as Error);
        } finally {
            setUploading(false);
        }
    };

    const fetchMedicalRecords = async () => {
        try {
            const res = await getMedicalRecordFiles();
            if (res.status === 1) {
                setMedicalRecords(res.payload.files || []);
            }
        } catch (err) {
            console.error('Failed to fetch records', err);
        }
    };

    useEffect(() => {
        fetchMedicalRecords();
    }, []);


    // Collapsible panels for general tab
    const basicMedicalPanel = (
        <>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Blood Type" name="bloodType"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Height" name="height"><Input readOnly={!isEditing} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Weight" name="weight"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Eye Color" name="eyeColor"><Input readOnly={!isEditing} /></Form.Item></Col>
            </Row>
        </>
    );

    const insurancePanel = (
        <>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Insurance Provider" name="insurance"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Member ID" name="memberId"><Input readOnly={!isEditing} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Group Number" name="groupNum"><Input readOnly={!isEditing} /></Form.Item></Col>
                <Col span={12}><Form.Item label="Last Checkup" name="lastCheckup"><Input type="date" readOnly={!isEditing} /></Form.Item></Col>
            </Row>
        </>
    );

    const allergiesMedicationsPanel = (
        <>
            <Form.Item label="Known Allergies" name="allergies"><TextArea readOnly={!isEditing} /></Form.Item>
            <Form.Item label="Current Medications" name="medications"><TextArea readOnly={!isEditing} /></Form.Item>
            <Form.Item label="Medical Notes" name="notes"><TextArea readOnly={!isEditing} /></Form.Item>
        </>
    );

    const generalTab = (
        <Collapse activeKey={activeKey} onChange={setActiveKey} accordion style={{ backgroundColor: 'transparent', border: 'none' }}>
            <Panel
                header={
                    <span>
                        <HeartOutlined style={{ marginRight: 8 }} />
                        Basic Medical Information
                    </span>
                }
                key="basic"
                style={{ marginBottom: 16 }}
            >
                {basicMedicalPanel}
            </Panel>

            <Panel
                header={
                    <span>
                        <InsuranceOutlined style={{ marginRight: 8 }} />
                        Insurance Information
                    </span>
                }
                key="insurance"
                style={{ marginBottom: 16 }}
            >
                {insurancePanel}
            </Panel>

            <Panel
                header={
                    <span>
                        <AlertOutlined style={{ marginRight: 8 }} />
                        Allergies & Medications
                    </span>
                }
                key="allergies"
                style={{ marginBottom: 16 }}
            >
                {allergiesMedicationsPanel}
            </Panel>
        </Collapse>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={5}>Medical Records</Title>
                <Upload
                    showUploadList={false}
                    customRequest={handleUpload}
                >
                    <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        loading={uploading}
                    >
                        Upload
                    </Button>
                </Upload>
            </div>

            <div
                style={{
                    marginTop: 16,
                    maxHeight: '250px', // limit the height
                    overflowY: 'auto',
                    paddingRight: '4px', // make room for scrollbar
                }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={medicalRecords}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button
                                    size="small"
                                    onClick={() => window.open(item.webViewLink, '_blank')}
                                >
                                    View
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<span style={{ fontSize: 20 }}>📁</span>}
                                title={item.name}
                                description={new Date(item.modifiedTime).toLocaleDateString()}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </>
    );


    return (
        <>
            <Card
                title={<><MedicineBoxOutlined /> Medical Information</>}
                extra={isEditing && (
                    <Button type="primary" onClick={handleSave}>Save</Button>
                )}
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
