'use client';

import React, { useEffect, useState } from 'react';
import { Card, Progress, Button, Badge, Table, Collapse, Typography, Row, Col, Statistic, Modal, Upload, List, message } from 'antd';
import {
    CheckOutlined,
    ExportOutlined,
    PlusOutlined,
    EyeOutlined,
    SettingOutlined,
    MedicineBoxOutlined,
    FileTextOutlined,
    SafetyOutlined,
    TeamOutlined,
    FolderOutlined,
    SafetyCertificateOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import { deleteFamilyDocument, getFamilyDocuments, getGuardians, uploadFamilyDocument } from '../../../services/family';
import EstatePlanningCard from './estateplanning';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

interface DriveFile {
    id: string;
    name: string;
    webViewLink: string;
}

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;


const GuardianSection: React.FC = () => {
    const [guardians, setGuardians] = useState<any[]>([]);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState<DriveFile[]>([]);

    useEffect(() => {
        async function fetchGuardians() {
            const uid = localStorage.getItem("userId"); // or however you store the user ID
            if (uid) {
                const result = await getGuardians(uid);
                setGuardians(result);
            }
        }
        fetchGuardians();
    }, []);

    const handleUpload = async (options: UploadRequestOption) => {
        const { file, onSuccess, onError } = options;

        try {
            const actualFile = file as File;

            const formData = new FormData();
            formData.append('file', actualFile); // 🔥 crucial part
            formData.append('hub', 'Family');

            const res = await uploadFamilyDocument(formData); // ← calls your service

            if (res.status === 1) {
                message.success('File uploaded successfully');
                setUploadModalVisible(false);
                fetchFamilyDocs();
                if (onSuccess) onSuccess({}, new XMLHttpRequest());
            } else {
                message.error(res.message || 'Upload failed');
                if (onError) onError(new Error(res.message));
            }
        } catch (err) {
            console.error('Upload error', err);
            if (onError) onError(err as Error);
        }
    };

    const fetchFamilyDocs = async () => {
        try {
            const res = await getFamilyDocuments();
            if (res.status === 1) {
                setUploadedDocs(res.payload.files || []);
            }
        } catch (err) {
            console.error('Fetch error', err);
        }
    };

    useEffect(() => {
        fetchFamilyDocs();
    }, []);

    const handleDeleteFile = async (fileId: string) => {
        try {
            const res = await deleteFamilyDocument(fileId);
            if (res.status === 1) {
                message.success("File deleted");
                fetchFamilyDocs(); // refresh the list
            } else {
                message.error(res.message || "Failed to delete file");
            }
        } catch (err) {
            console.error("Delete error:", err);
            message.error("Error deleting file");
        }
    };


    const beneficiaryColumns = [
        {
            title: 'Account/Policy',
            dataIndex: 'account',
            key: 'account',
        },
        {
            title: 'Primary Beneficiary',
            dataIndex: 'primary',
            key: 'primary',
        },
        {
            title: 'Secondary Beneficiary',
            dataIndex: 'secondary',
            key: 'secondary',
        },
        {
            title: 'Last Updated',
            dataIndex: 'updated',
            key: 'updated',
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="primary" ghost size="small">Edit</Button>
            ),
        },
    ];

    const beneficiaryData = [
        {
            key: '1',
            account: '401(k) - Vanguard',
            primary: 'Sarah Smith (100%)',
            secondary: 'Emma Smith (50%), Liam Smith (50%)',
            updated: 'Jan 2025',
        },
        {
            key: '2',
            account: 'IRA - Fidelity',
            primary: 'Sarah Smith (100%)',
            secondary: 'Martha Smith (100%)',
            updated: 'Jan 2025',
        },
        {
            key: '3',
            account: 'Life Insurance - Prudential',
            primary: 'Sarah Smith (100%)',
            secondary: 'Trust (100%)',
            updated: 'Dec 2024',
        },
        {
            key: '4',
            account: 'Checking - Chase',
            primary: 'Sarah Smith (POD)',
            secondary: '-',
            updated: 'Nov 2024',
        },
    ];

    function getAccessTagColor(itemKey: string) {
        switch (itemKey.toLowerCase()) {
            case 'home':
                return { bg: '#fef3c7', text: '#92400e' }; // yellow
            case 'family':
                return { bg: '#dbeafe', text: '#1e3a8a' }; // blue
            case 'finance':
                return { bg: '#fef2f2', text: '#991b1b' }; // red
            case 'health':
                return { bg: '#f3e8ff', text: '#6b21a8' }; // purple
            case 'fullaccess':
            case 'full':
                return { bg: '#e0f2fe', text: '#0369a1' }; // cyan
            default:
                return { bg: '#e5e7eb', text: '#374151' }; // neutral
        }
    }


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'complete':
                return <Badge status="success" text="Complete" />;
            case 'in-progress':
                return <Badge status="processing" text="In Progress" />;
            case 'not-started':
                return <Badge status="error" text="Not Started" />;
            default:
                return <Badge status="default" text="Unknown" />;
        }
    };

    return (
        <div style={{
            maxWidth: '100%',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f9fafb',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Section Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e5e7eb'
            }}>
                <Title level={2} style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <SafetyCertificateOutlined style={{ fontSize: '28px', color: '#007AFF' }} />
                    Guardians & Estate Planning
                </Title>
                <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    style={{
                        padding: '10px 20px',
                        height: 'auto',
                        fontSize: '14px',
                        fontWeight: 500
                    }}
                >
                    Export All Documents
                </Button>
            </div>

            {/* Progress Overview */}
            <Card style={{
                marginBottom: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
                <Title level={2} style={{ marginBottom: '10px', marginTop: '6px', fontSize: '20px' }}>Estate Planning Progress</Title>
                <Row gutter={16} style={{ marginBottom: '20px' }}>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>Documents Complete</span>}
                            value={7}
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>In Progress</span>}
                            value={3}
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>Not Started</span>}
                            value={2}
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title={<span style={{ fontSize: '13px' }}>Overall Complete</span>}
                            value={85}
                            suffix="%"
                            valueStyle={{ color: '#3355ff', fontWeight: 700 }}
                        />
                    </Col>
                </Row>
                <Progress percent={85} strokeColor="#10b981" />
            </Card>

            {/* Estate Planning Grid */}
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                {/* Guardians Card */}
                <Col span={12}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            height: '100%'
                        }}
                        hoverable
                    >
                        <div style={{
                            //   padding: '0 0 20px 0',
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f0f4f8',
                            margin: '-24px -24px 20px -24px',
                            padding: '20px 24px'
                        }}>
                            <Title level={4} style={{
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <TeamOutlined />
                                Guardians & Access Management
                            </Title>
                            {getStatusBadge('complete')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            {guardians.map((guardian, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    backgroundColor: '#f0f4f8',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: '#111827' }}>
                                            {guardian.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                                            {guardian.relationship}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {Object.keys(guardian.sharedItems ?? {}).length > 0 ? (
                                            Object.keys(guardian.sharedItems).map((itemKey) => (
                                                <span
                                                    key={itemKey}
                                                    style={{
                                                        fontSize: '12px',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        backgroundColor: getAccessTagColor(itemKey).bg,
                                                        color: getAccessTagColor(itemKey).text,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}
                                                </span>
                                            ))
                                        ) : (
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#9ca3af',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                No Access
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* <Button 
              ghost 
              type="primary" 
              icon={<PlusOutlined />}
              style={{ marginBottom: '12px' }}
            >
              Add Guardian
            </Button> */}

                        <Paragraph style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            margin: 0,
                            lineHeight: 1.5
                        }}>
                            Guardians can access specific areas of your Dockly account in case of emergency. Configure their access levels based on your needs.
                        </Paragraph>
                    </Card>
                </Col>

                {/* Estate Planning Card with Collapsible Sections */}
                <Col span={12}>
                    <EstatePlanningCard />
                </Col>

                {/* Second Row - Beneficiary Designations */}
                <Col span={16}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            height: '100%'
                        }}
                        hoverable
                    >
                        <div style={{
                            //   padding: '0 0 20px 0',
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#f0f4f8',
                            margin: '-24px -24px 20px -24px',
                            padding: '20px 24px'
                        }}>
                            <Title level={4} style={{
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <TeamOutlined />
                                Beneficiary Designations
                            </Title>
                            {getStatusBadge('complete')}
                        </div>

                        <Table
                            columns={beneficiaryColumns}
                            dataSource={beneficiaryData}
                            pagination={false}
                            size="small"
                            style={{ marginBottom: '16px' }}
                        />

                        <Button ghost type="primary" icon={<PlusOutlined />}>
                            Add Account/Policy
                        </Button>
                    </Card>
                </Col>

                {/* Additional Estate Documents */}
                <Col span={8}>
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            height: '100%',
                        }}
                        hoverable
                    >
                        <div
                            style={{
                                borderBottom: '1px solid #e5e7eb',
                                backgroundColor: '#f0f4f8',
                                margin: '-24px -24px 20px -24px',
                                padding: '20px 24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Title
                                level={4}
                                style={{
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <FolderOutlined />
                                Additional Estate Documents
                            </Title>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}

                                onClick={() => setUploadModalVisible(true)}
                            />
                        </div>
                        <div
                            style={{
                                marginBottom: '16px',
                                maxHeight: '250px', // ⬅ restricts height
                                overflowY: 'auto',
                                paddingRight: '4px', // space for scrollbar
                            }}
                        >
                            {uploadedDocs.length > 0 ? (
                                uploadedDocs.map((doc, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '16px',
                                            marginBottom: '12px',
                                            backgroundColor: '#f0f4f8',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: '#111827' }}>
                                                    <a href={doc.webViewLink} target="_blank" rel="noopener noreferrer">
                                                        {doc.name}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: 16, color: '#6b7280' }}>No documents uploaded yet.</div>
                            )}
                        </div>
                        {/* <Button
              ghost
              type="primary"
              icon={<FileTextOutlined />}
              onClick={() => setViewModalVisible(true)}
            >
              Manage Documents
            </Button> */}
                    </Card>

                    {/* Upload Modal */}
                    <Modal
                        open={uploadModalVisible}
                        title="Upload Document to Family Folder"
                        onCancel={() => setUploadModalVisible(false)}
                        footer={null}
                    >
                        <Upload.Dragger
                            name="file"
                            customRequest={handleUpload}
                            multiple={false}
                            showUploadList={false}
                        >
                            <p className="ant-upload-drag-icon">
                                <FileTextOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to upload</p>
                            <p className="ant-upload-hint">
                                The file will be uploaded into the Family folder in your Dockly Drive.
                            </p>
                        </Upload.Dragger>
                    </Modal>

                    {/* View Modal */}
                    <Modal
                        open={viewModalVisible}
                        title="Family Folder Documents"
                        onCancel={() => setViewModalVisible(false)}
                        footer={null}
                    >
                        <List
                            dataSource={uploadedDocs}
                            renderItem={(doc) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            danger
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteFile(doc.id)}
                                        />,
                                    ]}
                                >
                                    {doc.name}
                                </List.Item>
                            )}
                        />
                    </Modal>

                </Col>

            </Row>
        </div>
    );
}

export default GuardianSection;