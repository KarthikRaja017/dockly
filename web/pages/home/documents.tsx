'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, List, Modal, Form, Upload, Typography, message, Space, Avatar } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { deleteHomeDocument, getHomeDocuments, uploadHomeDocument } from '../../services/home';

const { Text } = Typography;
const { Item: FormItem } = Form;

interface Document {
    id: string;
    name: string;
    webViewLink: string;
}

interface Props {
    isMobile: boolean;
}

const Documents: React.FC<Props> = ({ isMobile }) => {
    const [documentsData, setDocumentsData] = useState<Document[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await getHomeDocuments();
            if (res.status === 1) {
                setDocumentsData(res.payload.files || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async () => {
        const values = await form.validateFields();
        const file = values.file.file as File;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('hub', 'Home');

        try {
            const res = await uploadHomeDocument(formData);
            if (res.status === 1) {
                message.success('File uploaded successfully');
                setIsModalOpen(false);
                form.resetFields();
                fetchDocuments();
            } else {
                message.error(res.message || 'Upload failed');
            }
        } catch (err) {
            message.error('Upload error');
            console.error(err);
        }
    };

    const handleDelete = async (fileId: string) => {
        try {
            const res = await deleteHomeDocument(fileId);
            if (res.status === 1) {
                message.success('File deleted');
                fetchDocuments();
            } else {
                message.error(res.message);
            }
        } catch (err) {
            message.error('Delete error');
            console.error(err);
        }
    };

    return (
        <Card
            title={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>📄 Important Documents</span>
                    <Button
                        type="default"
                        onClick={() => setIsModalOpen(true)}
                        icon={<UploadOutlined />}
                        style={{ borderColor: '#d9d9d9', backgroundColor: 'transparent' }}
                    />
                </Space>
            }
            style={{
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px',
                width: '100%',
                minHeight: '420px',
                border: '1px solid #d9d9d9',
            }}
            bodyStyle={{ padding: '16px' }}
        >
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                <List
                    itemLayout="horizontal"
                    dataSource={documentsData}
                    renderItem={(item) => (
                        <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <List.Item.Meta
                                avatar={
                                    <Avatar style={{ backgroundColor: '#1890ff', borderRadius: '50%' }}>
                                        <FileOutlined />
                                    </Avatar>
                                }
                                title={
                                    <a
                                        href={item.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontWeight: 'bold', color: '#1890ff' }}
                                    >
                                        {item.name}
                                    </a>
                                }
                            />
                            <Button
                                type="default"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(item.id)}
                                style={{ borderColor: '#d9d9d9', backgroundColor: 'transparent' }}
                            />
                        </List.Item>
                    )}
                />
            </div>

            <Modal
                title="Upload Document"
                open={isModalOpen}
                onOk={handleUpload}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                width={isMobile ? '90%' : 600}
            >
                <Form form={form} layout="vertical">
                    <FormItem
                        name="file"
                        label="Upload Document"
                        rules={[{ required: true, message: 'Please upload a file!' }]}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        >
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
        </Card>
    );
};

export default Documents;
