import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Upload, message, Space } from 'antd';
import {
    FileTextOutlined,
    MedicineBoxOutlined,
    SafetyOutlined,
    UploadOutlined,
    EyeOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { uploadFamilyDocument } from '../../../services/family';

const { Title, Text } = Typography;

const categories = [
    {
        key: 'livingWill',
        label: 'Living Will / Advance Directive',
        icon: <MedicineBoxOutlined />,
        link: 'https://www.doyourownwill.com/living-will/',
    },
    {
        key: 'lastWill',
        label: 'Last Will and Testament',
        icon: <FileTextOutlined />,
        link: 'https://www.doyourownwill.com/',
    },
    {
        key: 'poa',
        label: 'Power of Attorney',
        icon: <SafetyOutlined />,
        link: 'https://www.doyourownwill.com/power-of-attorney/',
    },
];

const EstatePlanningCard: React.FC = () => {
    const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, any>>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('estateDocuments');
            if (saved) {
                setUploadedDocuments(JSON.parse(saved));
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('estateDocuments', JSON.stringify(uploadedDocuments));
    }, [uploadedDocuments]);

    const handleUpload = async (file: File, category: string) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('hub', 'Family');
            formData.append('docType', 'EstateDocuments');
            formData.append('category', category);

            const res = await uploadFamilyDocument(formData);
            if (res.status === 1 && res.payload?.file?.webViewLink) {
                message.success('Document uploaded successfully');
                setUploadedDocuments(prev => ({
                    ...prev,
                    [category]: {
                        fileName: file.name,
                        uploadDate: new Date().toISOString(),
                        url: res.payload.file.webViewLink, // ✅ Use this instead of raw file
                    }
                }));
            } else {
                message.error(res.message || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            message.error('Upload error');
        }
    };

    const handleCreateNew = (link: string) => {
        window.open(link, '_blank');
    };

    const handleViewDocument = (document: any) => {
        if (!document.url) {
            console.log('No file available to view.');
            return;
        }
        window.open(document.url, '_blank');
    };

    return (
        <Card style={{ borderRadius: '12px', padding: 0, marginTop: 0 }}>
            <div style={{
                margin: '-44px -25px 20px -24px',
                padding: '12px 16px',
            }}>
                <Title level={5} style={{ display: 'flex', marginBottom: 0, fontSize: '16px' }}>
                    📄 Estate Planning
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>Manage your important legal documents</Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map((category, index) => {
                    const hasDocument = uploadedDocuments[category.key];

                    return (
                        <div
                            key={category.key}
                            style={{
                                padding: 12,
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                backgroundColor: '#fafafa',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {category.icon}
                                    <div>
                                        <Text strong style={{ fontSize: '14px' }}>{index + 1}. {category.label}</Text>
                                        {hasDocument && (
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    Uploaded: {hasDocument.fileName}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Space>
                                    {!hasDocument && (
                                        <Button
                                            type="default"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleCreateNew(category.link)}
                                        >
                                            Create New
                                        </Button>
                                    )}

                                    {hasDocument ? (
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewDocument(hasDocument)}
                                        >
                                            View
                                        </Button>
                                    ) : (
                                        <Upload
                                            showUploadList={false}
                                            beforeUpload={(file) => {
                                                handleUpload(file, category.key);
                                                return false; // Prevent default upload
                                            }}
                                            accept=".pdf,.doc,.docx,.txt"
                                        >
                                            <Button type="primary" size="small" icon={<UploadOutlined />}>
                                                Upload
                                            </Button>
                                        </Upload>
                                    )}
                                </Space>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default EstatePlanningCard;