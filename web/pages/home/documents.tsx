'use client';

import React, { useState } from 'react';
import { Card, Button, List, Modal, Form, Upload, Typography, message, Space, Avatar } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Item: FormItem } = Form;

interface Document {
    name: string;
    type: string;
    color: string;
    file?: File;
    isSample?: boolean;
}

interface ImportantDocumentsCardProps {
    isMobile: boolean;
}

const Documents: React.FC<ImportantDocumentsCardProps> = ({ isMobile }) => {
    const ASH_COLOR = '#8c8c8c'; // Uniform ash color for sample data
    const PRIMARY_COLOR = '#1890ff'; // Color for real data
    const SHADOW_COLOR = 'rgba(0, 0, 0, 0.1)';

    const [documentsData, setDocumentsData] = useState<Document[]>([
        { name: 'New Property Deed.pdf', type: 'PDF', color: ASH_COLOR, isSample: true },
        { name: 'New Insurance Policy.docx', type: 'DOCX', color: ASH_COLOR, isSample: true },
        { name: 'New Mortgage Agreement.txt', type: 'TXT', color: ASH_COLOR, isSample: true },
    ]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm();

    // Simulated backend check (replace with actual API call)
    const hasBackendData = false; // Assume no backend data
    // Example: useEffect(() => { fetchDocuments().then(data => setDocumentsData(data.length ? data : sampleData)); }, []);

    const supportedFileTypes = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        txt: 'text/plain',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
    };

    const getFileType = (fileName: string): string => {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        return extension.toUpperCase();
    };

    const getFileColor = (fileType: string): string => {
        switch (fileType.toLowerCase()) {
            case 'pdf':
                return '#1890ff';
            case 'doc':
            case 'docx':
                return '#52c41a';
            case 'txt':
                return '#fa8c16';
            case 'png':
            case 'jpg':
            case 'jpeg':
                return '#722ed1';
            default:
                return PRIMARY_COLOR;
        }
    };

    const handleOpenDocument = (doc: Document) => {
        if (doc.isSample) {
            setIsModalOpen(true);
            message.info('This is a sample document. Please upload a real document.');
            return;
        }
        if (!doc.file) {
            message.error('No file available to open for this document.');
            return;
        }

        const fileURL = URL.createObjectURL(doc.file);
        const fileExtension = doc.name.split('.').pop()?.toLowerCase();

        if (['png', 'jpg', 'jpeg'].includes(fileExtension || '')) {
            const imgWindow = window.open('', '_blank');
            imgWindow?.document.write(`
                <html>
                  <body>
                    <img src="${fileURL}" style="max-width: 100%; height: auto;" />
                  </body>
                </html>
            `);
        } else if (fileExtension === 'txt') {
            const reader = new FileReader();
            reader.onload = () => {
                const textWindow = window.open('', '_blank');
                textWindow?.document.write(`
                    <html>
                      <body>
                        <pre>${reader.result}</pre>
                      </body>
                    </html>
                `);
            };
            reader.readAsText(doc.file);
        } else {
            window.open(fileURL, '_blank');
        }

        setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (!values.file || !values.file.file) {
                message.error('Please upload a document!');
                return;
            }

            const file = values.file.file as File;
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (!fileExtension || !Object.keys(supportedFileTypes).includes(fileExtension)) {
                message.error('Unsupported file type! Please upload a PDF, DOC, DOCX, TXT, PNG, or JPG file.');
                return;
            }

            const newDocument: Document = {
                name: file.name,
                type: getFileType(file.name),
                color: getFileColor(fileExtension),
                file,
            };

            setDocumentsData([...documentsData.filter(doc => !doc.isSample), newDocument]);
            form.resetFields();
            setIsModalOpen(false);
            message.success('Document uploaded successfully!');
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleDelete = () => {
        Modal.confirm({
            title: 'Are you sure you want to delete the Important Documents section?',
            onOk: () => {
                setDocumentsData([]);
                message.success('Important Documents deleted successfully!');
            },
        });
    };

    return (
        <Card
            title={
                <Space style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                        <span style={{ marginRight: '8px' }}>📄</span> Important Documents
                    </span>
                    <Space>
                        <Button
                            type="default"
                            onClick={() => setIsModalOpen(true)}
                            style={{ borderColor: '#d9d9d9', backgroundColor: 'transparent' }}
                        >
                            <UploadOutlined />
                        </Button>
                    </Space>
                </Space>
            }
            style={{
                borderRadius: '10px',
                boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
                marginBottom: '16px',
                width: '100%',
                minHeight: '420px',
                border: '1px solid #d9d9d9',
            }}
            styles={{ body: { padding: '16px' } }}
        >
            <List
                itemLayout="horizontal"
                dataSource={documentsData}
                renderItem={(item) => (
                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: item.color, borderRadius: '50%' }}>
                                <FileOutlined />
                            </Avatar>}
                            title={
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        color: item.color,
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                    }}
                                    onClick={() => handleOpenDocument(item)}
                                >
                                    {item.name} {item.isSample && <Text type="secondary">(Sample)</Text>}
                                </Text>
                            }
                            description={item.type}
                        />
                        <Button
                            type="default"
                            onClick={handleDelete}
                            style={{ borderColor: '#d9d9d9', backgroundColor: 'transparent' }}
                        >
                            <DeleteOutlined />
                        </Button>
                    </List.Item>
                )}
            />
            {documentsData.every(doc => doc.isSample) && (
                <div style={{ textAlign: 'center', margin: '24px 0' }}>
                    <Text type="secondary" style={{ fontSize: isMobile ? '14px' : '16px' }}>
                        {/* No documents found. The above are sample documents. Click them or the upload button to add your own. */}
                    </Text>
                </div>
            )}
            <Modal
                title="Upload Document"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                style={{ borderRadius: '8px' }}
                width={isMobile ? '90%' : '600px'}
            >
                <Form form={form} layout="vertical">
                    <FormItem
                        name="file"
                        label="Upload Document"
                        rules={[{ required: true, message: 'Please upload a file!' }]}
                    >
                        <Upload
                            accept={Object.values(supportedFileTypes).join(',')}
                            beforeUpload={() => false}
                            maxCount={1}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                style={{ borderColor: '#d9d9d9', backgroundColor: 'transparent' }}
                            >
                                Select File
                            </Button>
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
        </Card>
    );
};

export default Documents;