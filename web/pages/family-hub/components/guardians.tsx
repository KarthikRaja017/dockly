// 'use client';

// import React, { useEffect, useState } from 'react';
// import { Card, Progress, Button, Badge, Table, Collapse, Typography, Row, Col, Statistic, Modal, Upload, List, message, Form, Input, Space } from 'antd';
// import {
//     CheckOutlined,
//     ExportOutlined,
//     PlusOutlined,
//     EyeOutlined,
//     SettingOutlined,
//     MedicineBoxOutlined,
//     FileTextOutlined,
//     SafetyOutlined,
//     TeamOutlined,
//     FolderOutlined,
//     SafetyCertificateOutlined,
//     DeleteOutlined,
//     EditOutlined
// } from '@ant-design/icons';
// import { addBeneficiary, deleteFamilyDocument, getBeneficiaries, getFamilyDocuments, getGuardians, updateBeneficiary, uploadFamilyDocument } from '../../../services/family';
// import EstatePlanningCard from './estateplanning';
// import type { UploadRequestOption } from 'rc-upload/lib/interface';
// import FamilyInviteForm from '../FamilyInviteForm';

// interface DriveFile {
//     id: string;
//     name: string;
//     webViewLink: string;
// }

// const { Title, Text, Paragraph } = Typography;
// const { Panel } = Collapse;

// const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// const GuardianSection: React.FC = () => {
//     const [guardians, setGuardians] = useState<any[]>([]);
//     const [uploadModalVisible, setUploadModalVisible] = useState(false);
//     const [viewModalVisible, setViewModalVisible] = useState(false);
//     const [uploadedDocs, setUploadedDocs] = useState<DriveFile[]>([]);
//     const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
//     const [editingBeneficiary, setEditingBeneficiary] = useState<any | null>(null);
//     const [beneficiaryModalVisible, setBeneficiaryModalVisible] = useState(false);
//     const [guardianInviteVisible, setGuardianInviteVisible] = useState(false);
//     const [form] = Form.useForm(); // Add form instance

//     useEffect(() => {
//         async function fetchGuardians() {
//             const uid = localStorage.getItem("userId"); // or however you store the user ID
//             if (uid) {
//                 const result = await getGuardians(uid);
//                 setGuardians(result);
//             }
//         }
//         fetchGuardians();
//     }, []);

//     const handleUpload = async (options: UploadRequestOption) => {
//         const { file, onSuccess, onError } = options;

//         try {
//             const actualFile = file as File;

//             const formData = new FormData();
//             formData.append('file', actualFile);
//             formData.append('hub', 'Family');
//             formData.append('docType', 'EstateDocuments');

//             const res = await uploadFamilyDocument(formData); // ← calls your service

//             if (res.status === 1) {
//                 message.success('File uploaded successfully');
//                 setUploadModalVisible(false);
//                 fetchFamilyDocs();
//                 if (onSuccess) onSuccess({}, new XMLHttpRequest());
//             } else {
//                 message.error(res.message || 'Upload failed');
//                 if (onError) onError(new Error(res.message));
//             }
//         } catch (err) {
//             console.error('Upload error', err);
//             if (onError) onError(err as Error);
//         }
//     };

//     useEffect(() => {
//         async function fetchData() {
//             const userId = localStorage.getItem("userId");
//             if (userId) {
//                 const res = await getBeneficiaries(userId);
//                 if (res.status === 1) {
//                     setBeneficiaries(res.payload);
//                 }
//             }
//         }
//         fetchData();
//     }, []);

//     const fetchFamilyDocs = async () => {
//         try {
//             const uid = localStorage.getItem("userId");
//             const res = await getFamilyDocuments(uid, 'EstateDocuments');
//             if (res.status === 1) {
//                 setUploadedDocs(res.payload.files || []);
//             }
//         } catch (err) {
//             console.error('Fetch error', err);
//         }
//     };

//     useEffect(() => {
//         fetchFamilyDocs();
//     }, []);

//     const handleDeleteFile = async (fileId: string) => {
//         try {
//             const res = await deleteFamilyDocument(fileId);
//             if (res.status === 1) {
//                 message.success("File deleted");
//                 fetchFamilyDocs(); // refresh the list
//             } else {
//                 message.error(res.message || "Failed to delete file");
//             }
//         } catch (err) {
//             console.error("Delete error:", err);
//             message.error("Error deleting file");
//         }
//     };

//     // Add effect to update form when editingBeneficiary changes
//     useEffect(() => {
//         if (editingBeneficiary && beneficiaryModalVisible) {
//             form.setFieldsValue({
//                 account: editingBeneficiary.account,
//                 primary_beneficiary: editingBeneficiary.primary_beneficiary,
//                 secondary_beneficiary: editingBeneficiary.secondary_beneficiary,
//             });
//         } else if (!editingBeneficiary && beneficiaryModalVisible) {
//             form.resetFields();
//         }
//     }, [editingBeneficiary, beneficiaryModalVisible, form]);

//     function getAccessTagColor(itemKey: string) {
//         switch (itemKey.toLowerCase()) {
//             case 'home':
//                 return { bg: '#fef3c7', text: '#92400e' }; // yellow
//             case 'family':
//                 return { bg: '#dbeafe', text: '#1e3a8a' }; // blue
//             case 'finance':
//                 return { bg: '#fef2f2', text: '#991b1b' }; // red
//             case 'health':
//                 return { bg: '#f3e8ff', text: '#6b21a8' }; // purple
//             case 'fullaccess':
//             case 'full':
//                 return { bg: '#e0f2fe', text: '#0369a1' }; // cyan
//             default:
//                 return { bg: '#e5e7eb', text: '#374151' }; // neutral
//         }
//     }


//     const getStatusBadge = (status: string) => {
//         switch (status) {
//             case 'complete':
//                 return <Badge status="success" text="Complete" />;
//             case 'in-progress':
//                 return <Badge status="processing" text="In Progress" />;
//             case 'not-started':
//                 return <Badge status="error" text="Not Started" />;
//             default:
//                 return <Badge status="default" text="Unknown" />;
//         }
//     };

//     return (
//         <div style={{
//             maxWidth: '100%',
//             margin: '0 auto',
//             padding: '12px',
//             backgroundColor: '#f9fafb',
//             minHeight: '100vh',
//             fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
//         }}>
//             {/* Section Header */}
//             <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '16px',
//                 paddingBottom: '12px',
//                 borderBottom: '2px solid #e5e7eb'
//             }}>
//                 <Title level={2} style={{
//                     margin: 0,
//                     fontSize: '16px',
//                     fontWeight: 700,
//                     color: '#111827',
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '8px',
//                     fontFamily: FONT_FAMILY
//                 }}>
//                     <SafetyCertificateOutlined style={{ fontSize: '22px', color: '#007AFF' }} />
//                     Guardians & Estate Planning
//                 </Title>
//                 <Button
//                     type="primary"
//                     icon={<ExportOutlined />}
//                     style={{
//                         padding: '6px 12px',
//                         height: 'auto',
//                         fontSize: '12px',
//                         fontWeight: 500,
//                         fontFamily: FONT_FAMILY
//                     }}
//                 >
//                     Export All Documents
//                 </Button>
//             </div>

//             {/* Estate Planning Grid */}
//             <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
//                 {/* Guardians Card */}
//                 <Col span={12}>
//                     <Card
//                         style={{
//                             borderRadius: '8px',
//                             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
//                             height: '100%'
//                         }}
//                         hoverable
//                     >
//                         <div style={{
//                             //   padding: '0 0 20px 0',
//                             // borderBottom: '1px solid #e5e7eb',
//                             // backgroundColor: '#f0f4f8',
//                             margin: '-24px -24px 12px -24px',
//                             padding: '12px 16px',
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center'
//                         }}>
//                             <Title level={4} style={{
//                                 margin: 0,
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: '6px',
//                                 fontSize: '14px',
//                                 fontFamily: FONT_FAMILY
//                             }}>
//                                 🛡 Guardians & Access Management
//                             </Title>
//                             <Button
//                                 type="primary"
//                                 icon={<PlusOutlined />}
//                                 size="small"
//                                 onClick={() => setGuardianInviteVisible(true)}
//                                 style={{
//                                     borderRadius: '6px',
//                                     fontSize: '12px',
//                                     fontFamily: FONT_FAMILY
//                                 }}
//                             />
//                             {/* {getStatusBadge('complete')} */}
//                         </div>

//                         <div style={{ marginBottom: '12px' }}>
//                             {guardians.map((guardian, index) => (
//                                 <div key={index} style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     alignItems: 'center',
//                                     padding: '8px',
//                                     marginBottom: '6px',
//                                     backgroundColor: '#f0f4f8',
//                                     borderRadius: '6px',
//                                     border: '1px solid #e5e7eb'
//                                 }}>
//                                     <div style={{ flex: 1 }}>
//                                         <div style={{
//                                             fontWeight: 500,
//                                             color: '#111827',
//                                             fontSize: '13px',
//                                             fontFamily: FONT_FAMILY
//                                         }}>
//                                             {guardian.name}
//                                         </div>
//                                         <div style={{
//                                             fontSize: '11px',
//                                             color: '#6b7280',
//                                             marginTop: '1px',
//                                             fontFamily: FONT_FAMILY
//                                         }}>
//                                             {guardian.relationship}
//                                         </div>
//                                     </div>
//                                     <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
//                                         {Object.keys(guardian.sharedItems ?? {}).length > 0 ? (
//                                             Object.keys(guardian.sharedItems).map((itemKey) => (
//                                                 <span
//                                                     key={itemKey}
//                                                     style={{
//                                                         fontSize: '10px',
//                                                         padding: '2px 6px',
//                                                         borderRadius: '8px',
//                                                         backgroundColor: getAccessTagColor(itemKey).bg,
//                                                         color: getAccessTagColor(itemKey).text,
//                                                         fontWeight: 500,
//                                                         fontFamily: FONT_FAMILY,
//                                                     }}
//                                                 >
//                                                     {itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}
//                                                 </span>
//                                             ))
//                                         ) : (
//                                             <span
//                                                 style={{
//                                                     fontSize: '10px',
//                                                     padding: '2px 6px',
//                                                     borderRadius: '8px',
//                                                     backgroundColor: '#f3f4f6',
//                                                     color: '#9ca3af',
//                                                     fontWeight: 500,
//                                                     fontFamily: FONT_FAMILY,
//                                                 }}
//                                             >
//                                                 No Access
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* <Button 
//               ghost 
//               type="primary" 
//               icon={<PlusOutlined />}
//               style={{ marginBottom: '12px' }}
//             >
//               Add Guardian
//             </Button> */}

//                         <Paragraph style={{
//                             fontSize: '11px',
//                             color: '#6b7280',
//                             margin: 0,
//                             lineHeight: 1.5,
//                             fontFamily: FONT_FAMILY
//                         }}>
//                             Guardians can access specific areas of your Dockly account in case of emergency. Configure their access levels based on your needs.
//                         </Paragraph>
//                     </Card>
//                 </Col>

//                 {/* Estate Planning Card with Collapsible Sections */}
//                 <Col span={12}>
//                     <div style={{ marginTop: 0, paddingTop: 0 }}>
//                         <EstatePlanningCard />
//                     </div>
//                 </Col>

//                 {/* Second Row - Beneficiary Designations */}
//                 <Col span={16}>
//                     <Card
//                         style={{
//                             borderRadius: '8px',
//                             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
//                             height: '100%'
//                         }}
//                         hoverable
//                     >
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <Title level={4} style={{
//                                 margin: 0,
//                                 fontSize: '14px',
//                                 fontFamily: FONT_FAMILY
//                             }}>
//                                 💰 Beneficiary Designations
//                             </Title>
//                             <Button
//                                 type="primary"
//                                 icon={<PlusOutlined />}
//                                 size="small"
//                                 onClick={() => {
//                                     setEditingBeneficiary(null);
//                                     setBeneficiaryModalVisible(true);
//                                 }}
//                                 style={{ fontFamily: FONT_FAMILY }}
//                             />
//                         </div>
//                         <Table
//                             size="small"
//                             columns={[
//                                 {
//                                     title: 'Account/Policy',
//                                     dataIndex: 'account',
//                                 },
//                                 {
//                                     title: 'Primary Beneficiary',
//                                     dataIndex: 'primary_beneficiary',
//                                 },
//                                 {
//                                     title: 'Secondary Beneficiary',
//                                     dataIndex: 'secondary_beneficiary',
//                                 },
//                                 {
//                                     title: 'Last Updated',
//                                     dataIndex: 'updated',
//                                 },
//                                 {
//                                     title: 'Action',
//                                     render: (_, record) => (
//                                         <Button
//                                             type="primary"
//                                             ghost
//                                             size="small"
//                                             onClick={() => {
//                                                 setEditingBeneficiary(record);
//                                                 setBeneficiaryModalVisible(true);
//                                             }}
//                                             style={{ fontFamily: FONT_FAMILY }}
//                                         >
//                                             Edit
//                                         </Button>
//                                     ),
//                                 },
//                             ]}
//                             dataSource={beneficiaries}
//                             rowKey="id"
//                             pagination={false}
//                         />
//                     </Card>
//                 </Col>
//                 {/* Additional Estate Documents */}
//                 <Col span={8}>
//                     <Card
//                         style={{
//                             borderRadius: '8px',
//                             boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
//                             height: '100%',
//                         }}
//                         hoverable
//                     >
//                         <div
//                             style={{
//                                 // borderBottom: '1px solid #e5e7eb',
//                                 // backgroundColor: '#f0f4f8',
//                                 margin: '-24px -24px 12px -24px',
//                                 padding: '12px 16px',
//                                 display: 'flex',
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center',
//                             }}
//                         >
//                             <Title
//                                 level={4}
//                                 style={{
//                                     margin: 0,
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: '6px',
//                                     fontSize: '14px',
//                                     fontFamily: FONT_FAMILY
//                                 }}
//                             >
//                                 📜 Additional Estate Documents
//                             </Title>
//                             <Button
//                                 type="primary"
//                                 icon={<PlusOutlined />}
//                                 size="small"
//                                 onClick={() => setUploadModalVisible(true)}
//                                 style={{ fontFamily: FONT_FAMILY }}
//                             />
//                         </div>
//                         <div
//                             style={{
//                                 marginBottom: '12px',
//                                 maxHeight: '200px', // ⬅ restricts height
//                                 overflowY: 'auto',
//                                 paddingRight: '2px', // space for scrollbar
//                             }}
//                         >
//                             {uploadedDocs.length > 0 ? (
//                                 uploadedDocs.map((doc, index) => (
//                                     <div
//                                         key={index}
//                                         style={{
//                                             padding: '8px',
//                                             marginBottom: '6px',
//                                             backgroundColor: '#f0f4f8',
//                                             borderRadius: '6px',
//                                             border: '1px solid #e5e7eb',
//                                         }}
//                                     >
//                                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                                             <div>
//                                                 <div style={{
//                                                     fontWeight: 500,
//                                                     color: '#111827',
//                                                     fontSize: '12px',
//                                                     fontFamily: FONT_FAMILY
//                                                 }}>
//                                                     <a href={doc.webViewLink} target="_blank" rel="noopener noreferrer">
//                                                         {doc.name}
//                                                     </a>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div style={{
//                                     padding: 8,
//                                     color: '#6b7280',
//                                     fontSize: '11px',
//                                     fontFamily: FONT_FAMILY
//                                 }}>
//                                     No documents uploaded yet.
//                                 </div>
//                             )}
//                         </div>
//                         {/* <Button
//               ghost
//               type="primary"
//               icon={<FileTextOutlined />}
//               onClick={() => setViewModalVisible(true)}
//             >
//               Manage Documents
//             </Button> */}
//                     </Card>

//                     {/* Upload Modal */}
//                     <Modal
//                         open={uploadModalVisible}
//                         title="Upload Document to Family Folder"
//                         onCancel={() => setUploadModalVisible(false)}
//                         footer={null}
//                     >
//                         <Upload.Dragger
//                             name="file"
//                             customRequest={handleUpload}
//                             multiple={false}
//                             showUploadList={false}
//                         >
//                             <p className="ant-upload-drag-icon">
//                                 <FileTextOutlined />
//                             </p>
//                             <p className="ant-upload-text">Click or drag file to upload</p>
//                             <p className="ant-upload-hint">
//                                 The file will be uploaded into the Family folder in your Dockly Drive.
//                             </p>
//                         </Upload.Dragger>
//                     </Modal>
//                     <Modal
//                         open={beneficiaryModalVisible}
//                         onCancel={() => {
//                             setBeneficiaryModalVisible(false);
//                             setEditingBeneficiary(null);
//                             form.resetFields();
//                         }}
//                         title={editingBeneficiary ? "Edit Beneficiary" : "Add Beneficiary"}
//                         footer={null}
//                         style={{ top: 20 }}
//                     >
//                         <Form
//                             form={form}
//                             layout="vertical"
//                             onFinish={async (values) => {
//                                 const beneficiary = {
//                                     userId: localStorage.getItem("userId"),
//                                     account: values.account,
//                                     primary_beneficiary: values.primary_beneficiary,
//                                     secondary_beneficiary: values.secondary_beneficiary,
//                                     updated: new Date().toISOString().split("T")[0], // today's date
//                                     addedBy: localStorage.getItem("userId"),
//                                 };

//                                 if (editingBeneficiary) {
//                                     // Include the id field when updating
//                                     const updatedBeneficiary = {
//                                         ...beneficiary,
//                                         id: editingBeneficiary.id, // Add the required id field
//                                     };
//                                     await updateBeneficiary({ beneficiary: updatedBeneficiary });
//                                 } else {
//                                     await addBeneficiary({ beneficiary });
//                                 }

//                                 setBeneficiaryModalVisible(false);
//                                 setEditingBeneficiary(null);
//                                 form.resetFields();

//                                 // Refresh the beneficiaries list
//                                 const res = await getBeneficiaries(localStorage.getItem("userId")!);
//                                 if (res.status === 1) setBeneficiaries(res.payload);
//                             }}
//                             style={{ marginTop: "16px", fontFamily: FONT_FAMILY }}
//                         >
//                             <Form.Item
//                                 name="account"
//                                 label="Account/Policy"
//                                 rules={[{ required: true, message: "Please enter account/policy name" }]}
//                             >
//                                 <Input
//                                     placeholder="Enter account or policy name"
//                                     style={{ fontFamily: FONT_FAMILY }}
//                                 />
//                             </Form.Item>

//                             <Form.Item
//                                 name="primary_beneficiary"
//                                 label="Primary Beneficiary"
//                                 rules={[{ required: true, message: "Please enter primary beneficiary" }]}
//                             >
//                                 <Input
//                                     placeholder="Enter primary beneficiary name"
//                                     style={{ fontFamily: FONT_FAMILY }}
//                                 />
//                             </Form.Item>

//                             <Form.Item
//                                 name="secondary_beneficiary"
//                                 label="Secondary Beneficiary"
//                             >
//                                 <Input
//                                     placeholder="Enter secondary beneficiary name"
//                                     style={{ fontFamily: FONT_FAMILY }}
//                                 />
//                             </Form.Item>

//                             <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
//                                 <Space>
//                                     <Button
//                                         type="primary"
//                                         htmlType="submit"
//                                         style={{ fontFamily: FONT_FAMILY }}
//                                     >
//                                         {editingBeneficiary ? "Update Beneficiary" : "Add Beneficiary"}
//                                     </Button>
//                                 </Space>
//                             </Form.Item>
//                         </Form>
//                     </Modal>
//                 </Col>

//             </Row>

//             {/* Guardian Invite Modal */}
//             <FamilyInviteForm
//                 visible={guardianInviteVisible}
//                 onCancel={() => setGuardianInviteVisible(false)}
//                 onSubmit={(formData) => {
//                     console.log('Guardian invited:', formData);
//                     // Handle guardian invitation submission here
//                     setGuardianInviteVisible(false);
//                 }}
//                 isGuardianMode={true}
//             />
//         </div>
//     );
// };

// export default GuardianSection;


const GuardianSection: React.FC = () => {
    return (
        <div>....</div>
    );
}

export default GuardianSection;