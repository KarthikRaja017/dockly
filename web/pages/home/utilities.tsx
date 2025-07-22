// 'use client';
// import React, { useState, useEffect } from "react";
// import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message, Avatar, Select, Dropdown, Menu } from "antd";
// import { PlusOutlined, MoreOutlined } from "@ant-design/icons";
// import { addUtility, getUtilities, updateUtility, deleteUtility } from "../../services/home";

// const { Text } = Typography;
// const { Option } = Select;

// const PRIMARY_COLOR = "#1890ff";
// const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

// interface Utility {
//     id: string;
//     type: string;
//     accountNumber: string;
//     monthlyCost: number;
//     providerUrl: string;
//     is_active: number;
// }

// const USA_UTILITY_TYPES = [
//     "Water",
//     "Electricity",
//     "Gas",
//     "Waste Management",
//     "Internet",
//     "Cable TV",
//     "Sewer",
//     "Home Phone",
// ];

// const Utilities: React.FC = () => {
//     const [utilitiesData, setUtilitiesData] = useState<Utility[]>([]);
//     const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
//     const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
//     const [isViewAllModalOpen, setIsViewAllModalOpen] = useState<boolean>(false);
//     const [editingUtility, setEditingUtility] = useState<Utility | null>(null);
//     const [editForm] = Form.useForm();
//     const [addForm] = Form.useForm();
//     const [loading, setLoading] = useState<boolean>(false);

//     // Replace with actual user_id from auth context
//     const userId = "test_user_id"; // TODO: Replace with actual user ID from auth context

//     const fetchUtilities = async () => {
//         setLoading(true);
//         try {
//             const response = await getUtilities({ user_id: userId });
//             console.log("Fetched utilities response:", response);
//             if (response.status === 1) {
//                 const utilities = response.payload.utilities || [];
//                 // Only include utilities where is_active === 1
//                 setUtilitiesData(utilities.filter((util: Utility) => util.is_active === 1));
//                 message.success(response.message);
//             } else {
//                 message.error(response.message);
//             }
//         } catch (error) {
//             message.error("Failed to fetch utilities");
//             console.error("Error fetching utilities:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchUtilities();
//     }, [userId]);

//     const handleEdit = (utility: Utility) => {
//         setEditingUtility(utility);
//         // Populate edit form with utility data
//         editForm.setFieldsValue({
//             type: utility.type || "",
//             accountNumber: utility.accountNumber || "",
//             monthlyCost: utility.monthlyCost != null ? utility.monthlyCost.toFixed(2) : "0.00",
//             providerUrl: utility.providerUrl || "",
//         });
//         setIsEditModalOpen(true);
//     };

//     const handleEditOk = () => {
//         editForm.validateFields().then(async (values) => {
//             if (editingUtility) {
//                 try {
//                     const response = await updateUtility(editingUtility.id, {
//                         type: values.type,
//                         accountNumber: values.accountNumber,
//                         monthlyCost: parseFloat(values.monthlyCost),
//                         providerUrl: values.providerUrl,
//                         user_id: userId,
//                     });
//                     if (response.status === 1) {
//                         setUtilitiesData((prev) =>
//                             prev.map((util) =>
//                                 util.id === editingUtility.id ? { ...util, ...response.payload.utility } : util
//                             ).filter((util) => util.is_active === 1) // Ensure only active utilities remain
//                         );
//                         message.success(response.message);
//                         setIsEditModalOpen(false);
//                         editForm.resetFields();
//                         setEditingUtility(null);
//                     } else {
//                         message.error(response.message);
//                     }
//                 } catch (error) {
//                     message.error("Failed to update utility");
//                     console.error("Error updating utility:", error);
//                 }
//             }
//         });
//     };

//     const handleAddOk = () => {
//         addForm.validateFields().then(async (values) => {
//             try {
//                 const response = await addUtility({
//                     ...values,
//                     monthlyCost: parseFloat(values.monthlyCost),
//                     user_id: userId
//                 });
//                 if (response.status === 1 && response.payload.utility.is_active === 1) {
//                     setUtilitiesData([...utilitiesData, response.payload.utility]);
//                     message.success(response.message);
//                     setIsAddModalOpen(false);
//                     addForm.resetFields();
//                 } else {
//                     message.error(response.message || "Failed to add utility");
//                 }
//             } catch (error) {
//                 message.error("Failed to add utility");
//                 console.error("Error adding utility:", error);
//             }
//         });
//     };

//     const handleDelete = (id: string) => {
//         Modal.confirm({
//             title: "Are you sure you want to deactivate this utility?",
//             content: "This will mark the utility as inactive but not permanently delete it.",
//             okText: "Deactivate",
//             okButtonProps: { danger: true },
//             cancelText: "Cancel",
//             onOk: async () => {
//                 setLoading(true);
//                 try {
//                     console.log(`Initiating deactivation for utility id: ${id}`);
//                     const response = await deleteUtility(id);
//                     console.log("Delete utility response:", response);
//                     if (response.status === 1) {
//                         // Refresh utilities list to ensure consistency with backend
//                         await fetchUtilities();
//                         message.success("Utility deactivated successfully");
//                     } else {
//                         message.error(response.message || "Failed to deactivate utility");
//                     }
//                 } catch (error) {
//                     message.error("Failed to deactivate utility");
//                     console.error("Error deactivating utility:", error);
//                 } finally {
//                     setLoading(false);
//                 }
//             },
//             onCancel: () => {
//                 console.log("Deactivation cancelled for utility id:", id);
//             },
//         });
//     };

//     const handleEditCancel = () => {
//         setIsEditModalOpen(false);
//         editForm.resetFields();
//         setEditingUtility(null);
//     };

//     const handleAddCancel = () => {
//         setIsAddModalOpen(false);
//         addForm.resetFields();
//     };

//     const handleViewAllCancel = () => {
//         setIsViewAllModalOpen(false);
//     };

//     const renderForm = (form: any, isEdit: boolean) => (
//         <Form form={form} layout="vertical">
//             <Form.Item
//                 name="type"
//                 label="Utility Type"
//                 rules={[{ required: true, message: "Please select utility type!" }]}
//             >
//                 <Select style={{ width: "100%", borderRadius: "4px" }} placeholder="Select utility type">
//                     {USA_UTILITY_TYPES.map((type) => (
//                         <Option key={type} value={type}>
//                             {type}
//                         </Option>
//                     ))}
//                 </Select>
//             </Form.Item>
//             <Form.Item
//                 name="accountNumber"
//                 label="Account Number"
//                 rules={[{ required: true, message: "Please enter account number!" }]}
//             >
//                 <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter account number" />
//             </Form.Item>
//             <Form.Item
//                 name="monthlyCost"
//                 label="Monthly Cost ($)"
//                 rules={[
//                     { required: true, message: "Please enter monthly cost!" },
//                     { pattern: /^\d+(\.\d{1,2})?$/, message: "Please enter a valid amount (e.g., 65.00)" },
//                 ]}
//             >
//                 <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter monthly cost" />
//             </Form.Item>
//             <Form.Item
//                 name="providerUrl"
//                 label="Provider URL"
//                 rules={[
//                     { required: true, message: "Please enter provider URL!" },
//                     { type: "url", message: "Please enter a valid URL!" },
//                 ]}
//             >
//                 <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter provider URL" />
//             </Form.Item>
//         </Form>
//     );

//     const menu = (utility: Utility) => (
//         <Menu>
//             <Menu.Item key="edit" onClick={() => handleEdit(utility)}>
//                 Edit
//             </Menu.Item>
//             <Menu.Item key="delete" onClick={() => handleDelete(utility.id)} style={{ color: "#ff4d4f" }}>
//                 Deactivate
//             </Menu.Item>
//         </Menu>
//     );

//     return (
//         <>
//             <Card
//                 title={
//                     <span>
//                         <span style={{ marginRight: "8px" }}>🔌</span> Utilities
//                     </span>
//                 }
//                 extra={
//                     <Space>
//                         <Button
//                             type="primary"
//                             onClick={() => setIsAddModalOpen(true)}
//                             style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
//                         >
//                             <PlusOutlined /> 
//                             {/* Add Utilities */}
//                         </Button>
//                     </Space>
//                 }
//                 style={{
//                     marginBottom: "24px",
//                     borderRadius: "8px",
//                     boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
//                     border: "1px solid #d9d9d9",
//                     height: '316px',
//                 }}
//             >
//                 <List
//                     loading={loading}
//                     itemLayout="horizontal"
//                     dataSource={utilitiesData.slice(0, 2)}
//                     renderItem={(item) => (
//                         <List.Item
//                             actions={[
//                                 <Button
//                                     type="primary"
//                                     size="small"
//                                     href={item.providerUrl}
//                                     target="_blank"
//                                     style={{
//                                         backgroundColor: PRIMARY_COLOR,
//                                         borderColor: PRIMARY_COLOR,
//                                         borderRadius: "4px",
//                                         padding: "0 8px",
//                                     }}
//                                 >
//                                     Log In
//                                 </Button>,
//                                 <Dropdown overlay={menu(item)} trigger={["click"]}>
//                                     <Button
//                                         type="default"
//                                         size="small"
//                                         style={{
//                                             borderColor: "#d9d9d9",
//                                             backgroundColor: "transparent",
//                                             borderRadius: "4px",
//                                             padding: "0 8px",
//                                         }}
//                                     >
//                                         <MoreOutlined />
//                                     </Button>
//                                 </Dropdown>,
//                             ]}
//                             style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}
//                         >
//                             <List.Item.Meta
//                                 avatar={<Avatar style={{ backgroundColor: PRIMARY_COLOR, borderRadius: "50%" }}>{item.type[0]}</Avatar>}
//                                 title={<Text style={{ fontWeight: "bold" }}>{item.type}</Text>}
//                                 description={
//                                     <div>
//                                         <Text>
//                                             Account #{item.accountNumber || "N/A"} • ${item.monthlyCost != null ? item.monthlyCost.toFixed(2) : "0.00"}/month
//                                         </Text>
//                                         <br />
//                                         {/* <Text type="secondary">
//                       <a href={item.providerUrl} target="_blank" style={{ color: PRIMARY_COLOR }}>
//                         {item.providerUrl}
//                       </a>
//                     </Text> */}
//                                     </div>
//                                 }
//                             />
//                         </List.Item>
//                     )}
//                 />
//                 {utilitiesData.length > 3 && (
//                     <div style={{ textAlign: "center", marginTop: "6px" }}>
//                         <Button
//                             type="primary"
//                             onClick={() => setIsViewAllModalOpen(true)}
//                             style={{
//                                 backgroundColor: PRIMARY_COLOR,
//                                 borderColor: PRIMARY_COLOR,
//                                 borderRadius: "20px",
//                             }}
//                         >
//                             View All Utilities
//                         </Button>
//                     </div>
//                 )}
//                 {utilitiesData.length === 0 && !loading && (
//                     <div style={{ textAlign: "center", marginTop: "16px" }}>
//                         <Text type="secondary">No active utilities found. Add a utility to get started.</Text>
//                     </div>
//                 )}
//             </Card>

//             <Modal
//                 title="Edit Utility"
//                 open={isEditModalOpen}
//                 onOk={handleEditOk}
//                 onCancel={handleEditCancel}
//                 okText="Save"
//                 cancelText="Cancel"
//                 okButtonProps={{ type: "primary", style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } }}
//                 cancelButtonProps={{ type: "default" }}
//             >
//                 {renderForm(editForm, true)}
//             </Modal>

//             <Modal
//                 title="Add Utility"
//                 open={isAddModalOpen}
//                 onOk={handleAddOk}
//                 onCancel={handleAddCancel}
//                 okText="Add"
//                 cancelText="Cancel"
//                 okButtonProps={{ type: "primary", style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } }}
//                 cancelButtonProps={{ type: "default" }}
//             >
//                 {renderForm(addForm, false)}
//             </Modal>

//             <Modal
//                 title="All Utilities"
//                 open={isViewAllModalOpen}
//                 onCancel={handleViewAllCancel}
//                 footer={[
//                     <Button
//                         key="close"
//                         type="primary"
//                         onClick={handleViewAllCancel}
//                         style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
//                     >
//                         Close
//                     </Button>,
//                 ]}
//                 width={600}
//             >
//                 <List
//                     loading={loading}
//                     itemLayout="horizontal"
//                     dataSource={utilitiesData}
//                     renderItem={(item) => (
//                         <List.Item
//                             actions={[
//                                 <Button
//                                     type="primary"
//                                     size="small"
//                                     href={item.providerUrl}
//                                     target="_blank"
//                                     style={{
//                                         backgroundColor: PRIMARY_COLOR,
//                                         borderColor: PRIMARY_COLOR,
//                                         borderRadius: "4px",
//                                         padding: "0 8px",
//                                     }}
//                                 >
//                                     Log In
//                                 </Button>,
//                                 <Dropdown overlay={menu(item)} trigger={["click"]}>
//                                     <Button
//                                         type="default"
//                                         size="small"
//                                         style={{
//                                             borderColor: "#d9d9d9",
//                                             backgroundColor: "transparent",
//                                             borderRadius: "4px",
//                                             padding: "0 8px",
//                                         }}
//                                     >
//                                         <MoreOutlined />
//                                     </Button>
//                                 </Dropdown>,
//                             ]}
//                             style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}
//                         >
//                             <List.Item.Meta
//                                 avatar={<Avatar style={{ backgroundColor: PRIMARY_COLOR, borderRadius: "50%" }}>{item.type[0]}</Avatar>}
//                                 title={<Text style={{ fontWeight: "bold" }}>{item.type}</Text>}
//                                 description={
//                                     <div>
//                                         <Text>
//                                             Account #{item.accountNumber || "N/A"} • ${item.monthlyCost != null ? item.monthlyCost.toFixed(2) : "0.00"}/month
//                                         </Text>
//                                         <br />
//                                         <Text type="secondary">
//                                             <a href={item.providerUrl} target="_blank" style={{ color: PRIMARY_COLOR }}>
//                                                 {item.providerUrl}
//                                             </a>
//                                         </Text>
//                                     </div>
//                                 }
//                             />
//                         </List.Item>
//                     )}
//                 />
//             </Modal>
//         </>
//     );
// };

// export default Utilities;


'use client';
import React, { useState, useEffect } from "react";
import { Card, List, Button, Space, Typography, Modal, Form, Input as AntInput, message, Avatar, Select, Dropdown, Menu } from "antd";
import { PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { addUtility, getUtilities, updateUtility, deleteUtility } from "../../services/home";

const { Text } = Typography;
const { Option } = Select;

const PRIMARY_COLOR = "#1890ff";
const ASH_COLOR = "#8c8c8c"; // Uniform ash color for sample data
const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

interface Utility {
    id: string;
    type: string;
    accountNumber: string;
    monthlyCost: number;
    providerUrl: string;
    is_active: number;
    isSample?: boolean; // Add flag for sample data
}

const USA_UTILITY_TYPES = [
    "Water",
    "Electricity",
    "Gas",
    "Waste Management",
    "Internet",
    "Cable TV",
    "Sewer",
    "Home Phone",
];

const Utilities: React.FC = () => {
    const [utilitiesData, setUtilitiesData] = useState<Utility[]>([
        // Sample data
        {
            id: 'New-1',
            type: 'Water',
            accountNumber: 'WTR-001',
            monthlyCost: 50.00,
            providerUrl: 'https://example.com/water',
            is_active: 1,
            isSample: true,
        },
        {
            id: 'New-2',
            type: 'Electricity',
            accountNumber: 'ELEC-002',
            monthlyCost: 100.00,
            providerUrl: 'https://example.com/electricity',
            is_active: 1,
            isSample: true,
        },
    ]);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState<boolean>(false);
    const [editingUtility, setEditingUtility] = useState<Utility | null>(null);
    const [editForm] = Form.useForm();
    const [addForm] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);

    const userId = "test_user_id"; // TODO: Replace with actual user ID from auth context

    const fetchUtilities = async () => {
        setLoading(true);
        try {
            const response = await getUtilities({ user_id: userId });
            console.log("Fetched utilities response:", response);
            if (response.status === 1 && response.payload.utilities?.length > 0) {
                const utilities = response.payload.utilities.filter((util: Utility) => util.is_active === 1);
                setUtilitiesData(utilities);
                message.success(response.message);
            } else {
                message.info('No utilities found. Displaying New data.');
            }
        } catch (error) {
            message.error("Failed to fetch utilities");
            console.error("Error fetching utilities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUtilities();
    }, [userId]);

    const handleEdit = (utility: Utility) => {
        if (utility.isSample) {
            handleAdd();
            return;
        }
        setEditingUtility(utility);
        editForm.setFieldsValue({
            type: utility.type || "",
            accountNumber: utility.accountNumber || "",
            monthlyCost: utility.monthlyCost != null ? utility.monthlyCost.toFixed(2) : "0.00",
            providerUrl: utility.providerUrl || "",
        });
        setIsEditModalOpen(true);
    };

    const handleAdd = () => {
        addForm.resetFields();
        setIsAddModalOpen(true);
        if (utilitiesData.every(u => u.isSample)) {
            message.info('This is a New utility. Please add a real utility.');
        }
    };

    const handleEditOk = () => {
        editForm.validateFields().then(async (values) => {
            if (editingUtility) {
                try {
                    const response = await updateUtility(editingUtility.id, {
                        type: values.type,
                        accountNumber: values.accountNumber,
                        monthlyCost: parseFloat(values.monthlyCost),
                        providerUrl: values.providerUrl,
                        user_id: userId,
                    });
                    if (response.status === 1) {
                        setUtilitiesData((prev) =>
                            prev.map((util) =>
                                util.id === editingUtility.id ? { ...util, ...response.payload.utility } : util
                            ).filter((util) => util.is_active === 1)
                        );
                        message.success(response.message);
                        setIsEditModalOpen(false);
                        editForm.resetFields();
                        setEditingUtility(null);
                    } else {
                        message.error(response.message);
                    }
                } catch (error) {
                    message.error("Failed to update utility");
                    console.error("Error updating utility:", error);
                }
            }
        });
    };

    const handleAddOk = () => {
        addForm.validateFields().then(async (values) => {
            try {
                const response = await addUtility({
                    ...values,
                    monthlyCost: parseFloat(values.monthlyCost),
                    user_id: userId
                });
                if (response.status === 1 && response.payload.utility.is_active === 1) {
                    setUtilitiesData([...utilitiesData.filter(u => !u.isSample), response.payload.utility]);
                    message.success(response.message);
                    setIsAddModalOpen(false);
                    addForm.resetFields();
                } else {
                    message.error(response.message || "Failed to add utility");
                }
            } catch (error) {
                message.error("Failed to add utility");
                console.error("Error adding utility:", error);
            }
        });
    };

    const handleDelete = (id: string) => {
        Modal.confirm({
            title: "Are you sure you want to deactivate this utility?",
            content: "This will mark the utility as inactive but not permanently delete it.",
            okText: "Deactivate",
            okButtonProps: { danger: true },
            cancelText: "Cancel",
            onOk: async () => {
                setLoading(true);
                try {
                    const response = await deleteUtility(id);
                    if (response.status === 1) {
                        await fetchUtilities();
                        message.success("Utility deactivated successfully");
                    } else {
                        message.error(response.message || "Failed to deactivate utility");
                    }
                } catch (error) {
                    message.error("Failed to deactivate utility");
                    console.error("Error deactivating utility:", error);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
        setEditingUtility(null);
    };

    const handleAddCancel = () => {
        setIsAddModalOpen(false);
        addForm.resetFields();
    };

    const handleViewAllCancel = () => {
        setIsViewAllModalOpen(false);
    };

    const renderForm = (form: any, isEdit: boolean) => (
        <Form form={form} layout="vertical">
            <Form.Item
                name="type"
                label="Utility Type"
                rules={[{ required: true, message: "Please select utility type!" }]}
            >
                <Select style={{ width: "100%", borderRadius: "4px" }} placeholder="Select utility type">
                    {USA_UTILITY_TYPES.map((type) => (
                        <Option key={type} value={type}>
                            {type}
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                name="accountNumber"
                label="Account Number"
                rules={[{ required: true, message: "Please enter account number!" }]}
            >
                <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter account number" />
            </Form.Item>
            <Form.Item
                name="monthlyCost"
                label="Monthly Cost ($)"
                rules={[
                    { required: true, message: "Please enter monthly cost!" },
                    { pattern: /^\d+(\.\d{1,2})?$/, message: "Please enter a valid amount (e.g., 65.00)" },
                ]}
            >
                <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter monthly cost" />
            </Form.Item>
            <Form.Item
                name="providerUrl"
                label="Provider URL"
                rules={[
                    { required: true, message: "Please enter provider URL!" },
                    { type: "url", message: "Please enter a valid URL!" },
                ]}
            >
                <AntInput style={{ padding: "5px", borderRadius: "4px" }} placeholder="Enter provider URL" />
            </Form.Item>
        </Form>
    );

    const menu = (utility: Utility) => (
        <Menu>
            <Menu.Item key="edit" onClick={() => handleEdit(utility)}>
                {utility.isSample ? 'Add Real Utility' : 'Edit'}
            </Menu.Item>
            {!utility.isSample && (
                <Menu.Item key="delete" onClick={() => handleDelete(utility.id)} style={{ color: "#ff4d4f" }}>
                    Deactivate
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <>
            <Card
                title={
                    <span>
                        <span style={{ marginRight: "8px" }}>🔌</span> Utilities
                    </span>
                }
                extra={
                    <Space>
                        <Button
                            type="primary"
                            onClick={handleAdd}
                            style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                        >
                            <PlusOutlined />
                            {/* Add Utilities */}
                        </Button>
                    </Space>
                }
                style={{
                    marginBottom: "24px",
                    borderRadius: "8px",
                    boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
                    border: "1px solid #d9d9d9",
                    height: '316px',
                }}
            >
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={utilitiesData.slice(0, 2)}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="primary"
                                    size="small"
                                    href={item.isSample ? '#' : item.providerUrl}
                                    target={item.isSample ? '_self' : '_blank'}
                                    onClick={item.isSample ? () => handleAdd() : undefined}
                                    style={{
                                        backgroundColor: item.isSample ? ASH_COLOR : PRIMARY_COLOR,
                                        borderColor: item.isSample ? ASH_COLOR : PRIMARY_COLOR,
                                        borderRadius: "4px",
                                        padding: "0 8px",
                                    }}
                                >
                                    {item.isSample ? 'Add Utility' : 'Log In'}
                                </Button>,
                                <Dropdown overlay={menu(item)} trigger={["click"]}>
                                    <Button
                                        type="default"
                                        size="small"
                                        style={{
                                            borderColor: "#d9d9d9",
                                            backgroundColor: "transparent",
                                            borderRadius: "4px",
                                            padding: "0 8px",
                                        }}
                                    >
                                        <MoreOutlined />
                                    </Button>
                                </Dropdown>,
                            ]}
                            style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}
                        >
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: item.isSample ? ASH_COLOR : PRIMARY_COLOR, borderRadius: "50%" }}>{item.type[0]}</Avatar>}
                                title={<Text style={{ fontWeight: "bold", color: item.isSample ? ASH_COLOR : '#1f1f1f' }}>
                                    {item.type} {item.isSample && <Text type="secondary">(Sample)</Text>}
                                </Text>}
                                description={
                                    <div>
                                        <Text style={{ color: item.isSample ? ASH_COLOR : '#595959' }}>
                                            Account #{item.accountNumber || "N/A"} • ${item.monthlyCost != null ? item.monthlyCost.toFixed(2) : "0.00"}/month
                                        </Text>
                                        <br />
                                        <Text type="secondary">
                                            <a href={item.isSample ? '#' : item.providerUrl} target={item.isSample ? '_self' : '_blank'} style={{ color: item.isSample ? ASH_COLOR : PRIMARY_COLOR }} onClick={item.isSample ? () => handleAdd() : undefined}>
                                                {item.providerUrl}
                                            </a>
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
                {utilitiesData.every(u => u.isSample) && !loading && (
                    <div style={{ textAlign: "center", marginTop: "16px" }}>
                        <Text type="secondary">
                            {/* No active utilities found. The above are sample utilities. Click them or the add button to add your own. */}
                        </Text>
                    </div>
                )}
                {utilitiesData.length > 2 && (
                    <div style={{ textAlign: "center", marginTop: "6px" }}>
                        <Button
                            type="primary"
                            onClick={() => utilitiesData.every(u => u.isSample) ? handleAdd() : setIsViewAllModalOpen(true)}
                            style={{
                                backgroundColor: PRIMARY_COLOR,
                                borderColor: PRIMARY_COLOR,
                                borderRadius: "20px",
                            }}
                        >
                            View All Utilities
                        </Button>
                    </div>
                )}
            </Card>

            <Modal
                title="Edit Utility"
                open={isEditModalOpen}
                onOk={handleEditOk}
                onCancel={handleEditCancel}
                okText="Save"
                cancelText="Cancel"
                okButtonProps={{ type: "primary", style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } }}
                cancelButtonProps={{ type: "default" }}
            >
                {renderForm(editForm, true)}
            </Modal>

            <Modal
                title="Add Utility"
                open={isAddModalOpen}
                onOk={handleAddOk}
                onCancel={handleAddCancel}
                okText="Add"
                cancelText="Cancel"
                okButtonProps={{ type: "primary", style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR } }}
                cancelButtonProps={{ type: "default" }}
            >
                {renderForm(addForm, false)}
            </Modal>

            <Modal
                title="All Utilities"
                open={isViewAllModalOpen}
                onCancel={handleViewAllCancel}
                footer={[
                    <Button
                        key="close"
                        type="primary"
                        onClick={handleViewAllCancel}
                        style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                    >
                        Close
                    </Button>,
                ]}
                width={600}
            >
                <List
                    loading={loading}
                    itemLayout="horizontal"
                    dataSource={utilitiesData}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="primary"
                                    size="small"
                                    href={item.isSample ? '#' : item.providerUrl}
                                    target={item.isSample ? '_self' : '_blank'}
                                    onClick={item.isSample ? () => handleAdd() : undefined}
                                    style={{
                                        backgroundColor: item.isSample ? ASH_COLOR : PRIMARY_COLOR,
                                        borderColor: item.isSample ? ASH_COLOR : PRIMARY_COLOR,
                                        borderRadius: "4px",
                                        padding: "0 8px",
                                    }}
                                >
                                    {item.isSample ? 'Add Utility' : 'Log In'}
                                </Button>,
                                <Dropdown overlay={menu(item)} trigger={["click"]}>
                                    <Button
                                        type="default"
                                        size="small"
                                        style={{
                                            borderColor: "#d9d9d9",
                                            backgroundColor: "transparent",
                                            borderRadius: "4px",
                                            padding: "0 8px",
                                        }}
                                    >
                                        <MoreOutlined />
                                    </Button>
                                </Dropdown>,
                            ]}
                            style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}
                        >
                            <List.Item.Meta
                                avatar={<Avatar style={{ backgroundColor: item.isSample ? ASH_COLOR : PRIMARY_COLOR, borderRadius: "50%" }}>{item.type[0]}</Avatar>}
                                title={<Text style={{ fontWeight: "bold", color: item.isSample ? ASH_COLOR : '#1f1f1f' }}>
                                    {item.type} {item.isSample && <Text type="secondary">(Sample)</Text>}
                                </Text>}
                                description={
                                    <div>
                                        <Text style={{ color: item.isSample ? ASH_COLOR : '#595959' }}>
                                            Account #{item.accountNumber || "N/A"} • ${item.monthlyCost != null ? item.monthlyCost.toFixed(2) : "0.00"}/month
                                        </Text>
                                        <br />
                                        <Text type="secondary">
                                            <a href={item.isSample ? '#' : item.providerUrl} target={item.isSample ? '_self' : '_blank'} style={{ color: item.isSample ? ASH_COLOR : PRIMARY_COLOR }} onClick={item.isSample ? () => handleAdd() : undefined}>
                                                {item.providerUrl}
                                            </a>
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </>
    );
};

export default Utilities;