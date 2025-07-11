// 'use client';
// import React, { useState } from "react";
// import { Card, List, Button, Space, Typography, Modal, Form, Upload, message, Avatar } from "antd";
// import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";

// const { Text } = Typography;

// const PRIMARY_COLOR = "#1890ff";
// const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

// interface Document {
//   name: string;
//   type: string;
//   color: string;
//   file?: File;
// }

// const Documents: React.FC = () => {
//   const [documentsData, setDocumentsData] = useState<Document[]>([
//     { name: "Property Deed.pdf", type: "PDF", color: PRIMARY_COLOR },
//     { name: "Insurance Policy.pdf", type: "PDF", color: PRIMARY_COLOR },
//     { name: "Mortgage Agreement.pdf", type: "PDF", color: PRIMARY_COLOR },
//   ]);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const [form] = Form.useForm();

//   const showModal = () => setIsModalOpen(true);

//   const handleOk = () => {
//     form.validateFields().then((values) => {
//       if (!values.file || !values.file.file) {
//         message.error("Please upload a document!");
//         return;
//       }
//       const file = values.file.file as File;
//       if (!file.name.endsWith(".pdf")) {
//         message.error("Only PDF files are allowed!");
//         return;
//       }
//       const newDocument: Document = {
//         name: file.name,
//         type: "PDF",
//         color: PRIMARY_COLOR,
//         file,
//       };
//       setDocumentsData([...documentsData, newDocument]);
//       form.resetFields();
//       setIsModalOpen(false);
//       message.success("Document uploaded successfully!");
//     });
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     form.resetFields();
//   };

//   const handleOpenDocument = (doc: Document) => {
//     if (!doc.file) {
//       message.error("No file available to open for this document.");
//       return;
//     }
//     const fileURL = URL.createObjectURL(doc.file);
//     window.open(fileURL, "_blank");
//     setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
//   };

//   const handleDelete = () => {
//     Modal.confirm({
//       title: "Are you sure you want to delete the Important Documents section?",
//       onOk: () => {
//         setDocumentsData([]);
//         message.success("Important Documents section deleted successfully!");
//       },
//     });
//   };

//   return (
//     <>
//       <Card
//         title={
//           <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
//             <span>
//               <span style={{ marginRight: "8px" }}>📄</span> Important Documents
//             </span>
//             <Space>
//               <Button
//                 type="default"
//                 onClick={showModal}
//                 style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
//               >
//                 Upload Document
//               </Button>
//               <Button
//                 type="default"
//                 onClick={handleDelete}
//                 style={{ borderColor: "#d9d9d9", backgroundColor: "transparent" }}
//               >
//                 <DeleteOutlined />
//               </Button>
//             </Space>
//           </Space>
//         }
//         style={{
//           borderRadius: "8px",
//           boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
//           border: "1px solid #d9d9d9",
//         }}
//       >
//         <List
//           itemLayout="horizontal"
//           dataSource={documentsData}
//           renderItem={(item) => (
//             <List.Item style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
//               <List.Item.Meta
//                 avatar={<Avatar style={{ backgroundColor: item.color, borderRadius: "50%" }}>{item.type[0]}</Avatar>}
//                 title={
//                   <Text
//                     style={{
//                       fontWeight: "bold",
//                       color: PRIMARY_COLOR,
//                       cursor: item.file ? "pointer" : "default",
//                       textDecoration: item.file ? "underline" : "none",
//                     }}
//                     onClick={() => item.file && handleOpenDocument(item)}
//                   >
//                     {item.name}
//                   </Text>
//                 }
//                 description={item.type}
//               />
//             </List.Item>
//           )}
//         />
//       </Card>

//       <Modal
//         title="Upload Document"
//         open={isModalOpen}
//         onOk={handleOk}
//         onCancel={handleCancel}
//         okText="Upload"
//         cancelText="Cancel"
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             name="file"
//             label="Document"
//             valuePropName="fileList"
//             getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
//             rules={[{ required: true, message: "Please upload a document!" }]}
//           >
//             <Upload
//               beforeUpload={() => false}
//               accept=".pdf"
//               maxCount={1}
//               style={{ width: "100%", padding: "5px", borderRadius: "4px" }}
//             >
//               <Button icon={<UploadOutlined />}>Select PDF</Button>
//             </Upload>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// };

// export default Documents;

'use client';

import React, { useState } from 'react';
import { Card, Button, List, Modal, Form, Upload, Typography, message, Space, Avatar } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Item: FormItem } = Form;

interface Document {
    name: string;
    type: string;
    color: string;
    file?: File;
}

interface ImportantDocumentsCardProps {
    isMobile: boolean;
}

const Documents: React.FC<ImportantDocumentsCardProps> = ({ isMobile }) => {
    const [documentsData, setDocumentsData] = useState<Document[]>([
        // { name: 'Property Deed.pdf', type: 'PDF', color: '#1890ff' },
        // { name: 'Insurance Policy.docx', type: 'DOCX', color: '#52c41a' },
        // { name: 'Mortgage Agreement.txt', type: 'TXT', color: '#fa8c16' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [form] = Form.useForm();

    const PRIMARY_COLOR = '#1890ff';
    const SHADOW_COLOR = 'rgba(0, 0, 0, 0.1)';

    // Supported file types and their corresponding MIME types
    const supportedFileTypes = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
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
                return '#1890ff';
        }
    };

    const handleOpenDocument = (doc: Document) => {
        if (!doc.file) {
            message.error('No file available to open for this document.');
            return;
        }

        const fileURL = URL.createObjectURL(doc.file);
        const fileExtension = doc.name.split('.').pop()?.toLowerCase();

        // Handle different file types appropriately
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

            setDocumentsData([...documentsData, newDocument]);
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
                            Upload Document
                        </Button>
                        {/* <Button
              type="default"
              onClick={handleDelete}
              style={{ borderColor: '#d9d9d9', backgroundColor: 'transparent' }}
            >
              <DeleteOutlined />
            </Button> */}
                    </Space>
                </Space>
            }
            style={{
                borderRadius: '10px',
                boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
                marginBottom: '16px',
                width: '100%',
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
                                        cursor: item.file ? 'pointer' : 'default',
                                        textDecoration: item.file ? 'underline' : 'none',
                                    }}
                                    onClick={() => item.file && handleOpenDocument(item)}
                                >
                                    {item.name}
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

                            </Button>
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
        </Card>
    );
};

export default Documents;
