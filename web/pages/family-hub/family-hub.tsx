"use client";
import { ArrowRightCircle, Plus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
    DeleteOutlined,
    EditOutlined,
    ExportOutlined,
    EyeOutlined,
    PhoneOutlined,
    PlusOutlined,
    SafetyOutlined,
} from "@ant-design/icons";
import {
    Input as AntInput,
    Button,
    Col,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
} from "antd";

import {
    addContacts,
    addGuardians,
    addNote,
    addProject,
    addTask,
    getAllNotes,
    getGuardians,
    getProjects,
    getTasks,
    getUserContacts,
    updateTask,
} from "../../services/family";

const FamilyHubPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [profileVisible, setProfileVisible] = useState(false);

    if (loading) {
        return <DocklyLoader />;
    }
    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                lineHeight: 1.5,
                color: "#374151",
                backgroundColor: "#f9fafb",
                marginLeft: 40,
                marginTop: 50,
            }}
        >
            {profileVisible && <FamilyHubMemberDetails />}
            {!profileVisible && (
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "20px 30px",
                    }}
                >
                    <BoardTitle />
                    <FamilyMembers
                        profileVisible={profileVisible}
                        setProfileVisible={setProfileVisible}
                    />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 400px",
                            gap: "24px",
                            marginBottom: "24px",
                        }}
                    >
                        <CustomCalendar data={sampleCalendarData} />
                        <UpcomingActivities />
                    </div>

                    <FamilyNotes />

                    <FamilyTasks isPlanner={false} />

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "24px",
                            marginBottom: "24px",
                        }}
                    >
                        <GuardiansEmergencyInfo />
                        <ImportantContacts />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyHubPage;

// Define GuardianItem and GuardianSection types for Guardians
interface GuardianItem {
    name: string;
    relationship: string;
    phone: string;
    details?: string;
}

interface GuardianSection {
    title: string;
    type: string;
    items: GuardianItem[];
}

// Define ContactItem and ContactSection types for Guardians
interface ContactItem {
    icon: string;
    name: string;
    role: string;
    phone: string;
    bgColor: string;
    textColor: string;
    details?: string;
}

interface ContactSection {
    title: string;
    type: string;
    items: ContactItem[];
} // page.tsx (Update GuardiansEmergencyInfo)
const GuardiansEmergencyInfo: React.FC = () => {
    const [guardianInfo, setGuardianInfo] = useState<GuardianSection[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<
        "guardian" | "section-edit" | "new-section"
    >("guardian");
    const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
        null
    );
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [sectionItems, setSectionItems] = useState<GuardianItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const guardianRelations = [
        "Grandmother",
        "Grandfather",
        "Uncle",
        "Aunt",
        "Family Friend",
        "Sibling",
        "Cousin",
        "Neighbor",
        "Other Family Member",
        "Policy ",
        "Family Doctor",
        "Insurance ",
        "Specialist",
        "health",
        "provider",
    ];

    const getGuardian = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getGuardians({});
            const { status, payload } = response;
            if (status) {
                const groupedByType: Record<string, GuardianItem[]> = {
                    guardian: [],
                    insurance: [], // Life Insurance
                    medical: [], // Medical Information
                    // Emergency Guardians
                };

                payload.emergencyInfo.forEach((info: GuardianItem) => {
                    const relLower = info.relationship.toLowerCase();
                    if (
                        relLower.includes("policy") ||
                        relLower.includes("insurance") ||
                        relLower.includes("provider")
                    ) {
                        groupedByType["insurance"].push(info);
                    } else if (
                        relLower.includes("doctor") ||
                        relLower.includes("health") ||
                        relLower.includes("pediatrician") ||
                        relLower.includes("specialist")
                    ) {
                        groupedByType["medical"].push(info);
                    } else {
                        groupedByType["guardian"].push(info); // Default to Emergency Guardians
                    }
                });

                // Define all sections with potential empty arrays
                const formattedSections: GuardianSection[] = [
                    {
                        title: "Emergency Guardians",
                        type: "guardian",
                        items: groupedByType["guardian"],
                    },
                    {
                        title: "Life Insurance",
                        type: "insurance",
                        items: groupedByType["insurance"],
                    },
                    {
                        title: "Medical Information",
                        type: "medical",
                        items: groupedByType["medical"],
                    },
                ];

                setGuardianInfo(formattedSections);
            } else {
                setError("Failed to fetch guardian info");
                message.error("Failed to fetch guardian info");
            }
        } catch (err) {
            setError("Error fetching guardian info");
            message.error("Error fetching guardian info");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getGuardian();
    }, []);

    const showModal = (
        type: "guardian" | "section-edit" | "new-section",
        sectionIndex: number | null = null,
        itemIndex: number | null = null
    ) => {
        setModalType(type);
        setCurrentSectionIndex(sectionIndex);
        setCurrentItemIndex(itemIndex);

        if (type === "section-edit" && sectionIndex !== null) {
            setSectionItems(guardianInfo[sectionIndex].items);
        } else if (
            type === "guardian" &&
            sectionIndex !== null &&
            itemIndex !== null
        ) {
            form.setFieldsValue(guardianInfo[sectionIndex].items[itemIndex]);
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();

            if (modalType === "new-section") {
                const newSection: GuardianSection = {
                    title: values.sectionName,
                    type: "other",
                    items: [],
                };
                setGuardianInfo([...guardianInfo, newSection]);
                message.success("New section created!");
                setIsModalOpen(false);
                form.resetFields();
            } else if (modalType === "guardian" && currentSectionIndex !== null) {
                setLoading(true);
                const payload = {
                    name: values.name,
                    relationship: values.relation,
                    phone: values.phone,
                    details: values.details || "",
                    addedBy: localStorage.getItem("userId") || "current_user",
                };

                const response = await addGuardians(payload);
                if (response.status) {
                    const updatedGuardianInfo = [...guardianInfo];
                    const newItem: GuardianItem = {
                        name: values.name,
                        relationship: values.relation,
                        phone: values.phone,
                        details: values.details,
                    };

                    if (currentItemIndex !== null) {
                        updatedGuardianInfo[currentSectionIndex].items[currentItemIndex] =
                            newItem;
                        message.success("Guardian info updated!");
                    } else {
                        updatedGuardianInfo[currentSectionIndex].items.push(newItem);
                        message.success("Guardian info added!");
                    }

                    setGuardianInfo(updatedGuardianInfo);
                    setIsModalOpen(false);
                    form.resetFields();
                } else {
                    message.error("Failed to save guardian info");
                }
            }
        } catch (error) {
            console.error("Error in handleOk:", error);
            message.error("Failed to save guardian info. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleItemDelete = async (sectionIndex: number, itemIndex: number) => {
        const updatedGuardianInfo = [...guardianInfo];
        updatedGuardianInfo[sectionIndex].items.splice(itemIndex, 1);
        setGuardianInfo(updatedGuardianInfo);
        setSectionItems(updatedGuardianInfo[sectionIndex].items);
        message.success("Item deleted successfully!");
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const renderFormFields = () => {
        switch (modalType) {
            case "new-section":
                return (
                    <Form.Item
                        name="sectionName"
                        label="Section Name"
                        rules={[{ required: true, message: "Please enter section name!" }]}
                    >
                        <Input
                            placeholder="Enter section name (e.g., 'Family Friends')"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                );

            case "guardian":
                return (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Full Name"
                                    rules={[
                                        { required: true, message: "Please input the name!" },
                                    ]}
                                >
                                    <Input
                                        placeholder="Enter full name"
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="relation"
                                    label="Relationship/Role"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select or input the relationship!",
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="Select or type relationship"
                                        showSearch
                                        allowClear
                                        options={guardianRelations.map((rel) => ({
                                            label: rel,
                                            value: rel,
                                        }))}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={[
                                { required: true, message: "Please input the phone number!" },
                            ]}
                        >
                            <Input
                                placeholder="Enter phone number (e.g., (555) 123-4567)"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>

                        <Form.Item name="details" label="Additional Details">
                            <Input.TextArea
                                placeholder="Enter additional details (e.g., address, notes)"
                                rows={3}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </>
                );

            case "section-edit":
                return (
                    <div
                        style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                            padding: "16px",
                        }}
                    >
                        {sectionItems.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: "16px",
                                    padding: "16px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    position: "relative",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "12px",
                                        right: "12px",
                                        display: "flex",
                                        gap: "8px",
                                    }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setTimeout(() => {
                                                showModal("guardian", currentSectionIndex, index);
                                            }, 100);
                                        }}
                                        style={{ color: "#3b82f6" }}
                                    />
                                    <Popconfirm
                                        title="Are you sure to delete this item?"
                                        onConfirm={() =>
                                            handleItemDelete(currentSectionIndex!, index)
                                        }
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            style={{ color: "#dc2626" }}
                                        />
                                    </Popconfirm>
                                </div>

                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: "14px",
                                        marginBottom: "4px",
                                        paddingRight: "80px",
                                    }}
                                >
                                    {item.name}
                                </div>
                                <div
                                    style={{
                                        color: "#6b7280",
                                        fontSize: "12px",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {item.relationship} • {item.phone}
                                </div>
                                {item.details && (
                                    <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                                        {item.details}
                                    </div>
                                )}
                            </div>
                        ))}
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => showModal("guardian", currentSectionIndex, null)}
                            style={{ width: "100%", marginTop: "16px", borderRadius: "6px" }}
                        >
                            Add
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "24px",
                border: "1px solid #e5e7eb",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    paddingBottom: "16px",
                    borderBottom: "2px solid #f3f4f6",
                }}
            >
                <h3
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#111827",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        margin: 0,
                    }}
                >
                    <SafetyOutlined style={{ color: "#3b82f6", fontSize: "24px" }} />
                    Guardians & Emergency Info
                </h3>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={{ color: "#dc2626" }}>{error}</div>
            ) : guardianInfo.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "14px",
                        padding: "20px 0",
                    }}
                >
                    No guardian info available. Click 'Add' to get started.
                </div>
            ) : (
                guardianInfo.map((section, sectionIndex) => (
                    <div key={sectionIndex} style={{ marginBottom: "28px" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                                padding: "8px 0",
                            }}
                        >
                            <h4
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#374151",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    margin: 0,
                                }}
                            >
                                {section.title}
                            </h4>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ArrowRightCircle size={16} />}
                                    onClick={() => showModal("section-edit", sectionIndex, null)}
                                    style={{ color: "#3b82f6" }}
                                />
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#f8fafc",
                                borderRadius: "12px",
                                padding: "16px",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            {section.items.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        color: "#9ca3af",
                                        fontSize: "14px",
                                        padding: "20px 0",
                                    }}
                                >
                                    No {section.title.toLowerCase()} available. Click 'Add' to get
                                    started.
                                </div>
                            ) : (
                                <>
                                    {section.items.slice(0, 2).map((item, itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                padding: "12px 0",
                                                borderBottom:
                                                    itemIndex < Math.min(section.items.length, 2) - 1
                                                        ? "1px solid #e5e7eb"
                                                        : "none",
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        color: "#111827",
                                                        fontSize: "14px",
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    {item.name}
                                                </div>
                                                <div
                                                    style={{
                                                        color: "#6b7280",
                                                        fontSize: "13px",
                                                        marginBottom: "2px",
                                                    }}
                                                >
                                                    {item.relationship} • {item.phone}
                                                </div>
                                                {item.details && (
                                                    <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                                                        {item.details}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                {/*  */}
                                            </div>
                                        </div>
                                    ))}
                                    {section.items.length > 2 && (
                                        <div style={{ textAlign: "center", marginTop: "12px" }}>
                                            <Button
                                                type="link"
                                                icon={<EyeOutlined />}
                                                onClick={() =>
                                                    showModal("section-edit", sectionIndex, null)
                                                }
                                                style={{ color: "#6b7280" }}
                                            >
                                                View All ({section.items.length} items)
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}

            <Modal
                title={
                    modalType === "new-section"
                        ? "Add New Guardian Section"
                        : modalType === "guardian"
                            ? currentItemIndex !== null
                                ? "Edit Guardian Info"
                                : "Add New Guardian"
                            : "Manage Guardian Section"
                }
                open={isModalOpen}
                onOk={
                    modalType !== "section-edit" ? handleOk : () => setIsModalOpen(false)
                }
                onCancel={handleCancel}
                okText={
                    modalType === "section-edit"
                        ? "Close"
                        : currentItemIndex !== null
                            ? "Update"
                            : modalType === "new-section"
                                ? "Create Section"
                                : "Add"
                }
                cancelText={modalType === "section-edit" ? null : "Cancel"}
                width={modalType === "section-edit" ? 700 : 700}
                style={{ top: 20 }}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" style={{ marginTop: "16px" }}>
                    {renderFormFields()}
                </Form>
            </Modal>
        </div>
    );
};

// page.tsx (Update ImportantContacts)
// Define ContactItem and ContactSection types
interface ContactItem {
    icon: string;
    name: string;
    role: string;
    phone: string;
    bgColor: string;
    textColor: string;
}

interface ContactSection {
    title: string;
    type: string;
    items: ContactItem[];
}

const ImportantContacts: React.FC = () => {
    const [contacts, setContacts] = useState<ContactSection[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<
        "contact" | "section-edit" | "new-section"
    >("contact");
    const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
        null
    );
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [sectionItems, setSectionItems] = useState<ContactItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const contactRoles: { [key: string]: string[] } = {
        important: [
            "Emergency Response",
            "Hospital",
            "Fire Department",
            "Police",
            "Emergency Care",
        ],
        school: [
            "Elementary School",
            "Middle School",
            "High School",
            "Principal",
            "Teacher",
        ],
        professional: [
            "Doctor",
            "Dentist",
            "Lawyer",
            "Financial Advisor",
            "Therapist",
            "Pediatrician",
        ],
        activity: ["Coach", "Instructor", "Tutor", "Activity Leader"],
        other: ["Custom Role"],
    };

    const getContacts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUserContacts({});
            const { status, payload } = response;
            if (status) {
                const groupedByType: Record<string, ContactItem[]> = {
                    important: [], // Important Contacts
                    school: [],
                    professional: [],
                    other: [],
                };

                payload.contacts.forEach((section: any) => {
                    section.items.forEach((item: any) => {
                        const roleLower = item.role.toLowerCase();
                        if (
                            contactRoles.important.some((r) =>
                                roleLower.includes(r.toLowerCase())
                            )
                        ) {
                            groupedByType["important"].push({
                                icon: "🚨",
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: "#fee2e2",
                                textColor: "#dc2626",
                            });
                        } else if (
                            contactRoles.school.some((r) =>
                                roleLower.includes(r.toLowerCase())
                            )
                        ) {
                            groupedByType["school"].push({
                                icon: "🏫",
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: "#dcfce7",
                                textColor: "#16a34a",
                            });
                        } else if (
                            contactRoles.professional.some((r) =>
                                roleLower.includes(r.toLowerCase())
                            )
                        ) {
                            groupedByType["professional"].push({
                                icon: "👨‍⚕",
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: "#f0f4f8",
                                textColor: "#374151",
                            });
                        } else {
                            groupedByType["other"].push({
                                icon: "👤",
                                name: item.name,
                                role: item.role,
                                phone: item.phone,
                                bgColor: "#f0f4f8",
                                textColor: "#374151",
                            });
                        }
                    });
                });

                // Define all sections with potential empty arrays
                const formattedSections: ContactSection[] = [
                    {
                        title: "Important Contacts",
                        type: "important",
                        items: groupedByType["important"],
                    },
                    { title: "Schools", type: "school", items: groupedByType["school"] },
                    {
                        title: "Professional Services",
                        type: "professional",
                        items: groupedByType["professional"],
                    },
                    {
                        title: "Other Contacts",
                        type: "other",
                        items: groupedByType["other"],
                    },
                ];

                setContacts(formattedSections);
            } else {
                setError("Failed to fetch contacts");
                message.error("Failed to fetch contacts");
            }
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
            setError("Error fetching contacts");
            message.error("Error fetching contacts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getContacts();
    }, []);

    const showModal = (
        type: "contact" | "section-edit" | "new-section",
        sectionIndex: number | null = null,
        itemIndex: number | null = null
    ) => {
        setModalType(type);
        setCurrentSectionIndex(sectionIndex);
        setCurrentItemIndex(itemIndex);

        if (type === "section-edit" && sectionIndex !== null) {
            setSectionItems(contacts[sectionIndex].items);
        } else if (
            type === "contact" &&
            sectionIndex !== null &&
            itemIndex !== null
        ) {
            form.setFieldsValue(contacts[sectionIndex].items[itemIndex]);
        } else {
            form.resetFields();
            if (type === "contact") {
                form.setFieldsValue({
                    bgColor: "#f0f4f8",
                    textColor: "#374151",
                    icon: "👤",
                });
            }
        }
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            await form.validateFields();
            const formValues = form.getFieldsValue();

            if (modalType === "contact" && currentSectionIndex !== null) {
                setLoading(true);
                const addedBy = localStorage.getItem("userId") || "current_user";
                const payload = {
                    contacts: {
                        name: formValues.name,
                        role: formValues.role,
                        phone: formValues.phone,
                        addedBy,
                    },
                };

                const response = await addContacts(payload);
                if (response.status) {
                    const updatedContacts = [...contacts];
                    const newContact: ContactItem = {
                        icon: formValues.icon,
                        name: formValues.name,
                        role: formValues.role,
                        phone: formValues.phone,
                        bgColor: formValues.bgColor,
                        textColor: formValues.textColor,
                    };

                    if (currentItemIndex !== null) {
                        updatedContacts[currentSectionIndex].items[currentItemIndex] =
                            newContact;
                    } else {
                        updatedContacts[currentSectionIndex].items.push(newContact);
                    }

                    setContacts(updatedContacts);
                    message.success("Contact added successfully!");
                    setIsModalOpen(false);
                    form.resetFields();
                } else {
                    message.error("Failed to save contact");
                }
            } else if (modalType === "new-section") {
                const newSection: ContactSection = {
                    title: formValues.sectionName,
                    type: "other",
                    items: [],
                };
                setContacts([...contacts, newSection]);
                message.success("Section created successfully!");
                setIsModalOpen(false);
                form.resetFields();
            }
        } catch (error) {
            console.error("Error in handleOk:", error);
            message.error("Failed to save contact. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleItemDelete = async (sectionIndex: number, itemIndex: number) => {
        const updatedContacts = [...contacts];
        updatedContacts[sectionIndex].items.splice(itemIndex, 1);
        setContacts(updatedContacts);
        setSectionItems(updatedContacts[sectionIndex].items);
        message.success("Item deleted successfully!");
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const renderFormFields = () => {
        switch (modalType) {
            case "new-section":
                return (
                    <Form.Item
                        name="sectionName"
                        label="Section Name"
                        rules={[{ required: true, message: "Please enter section name!" }]}
                    >
                        <Input
                            placeholder="Enter section name (e.g., 'Tutors')"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                );

            case "contact":
                const currentSection = contacts[currentSectionIndex || 0];
                const availableRoles =
                    contactRoles[currentSection?.type] || contactRoles.other;

                return (
                    <>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="icon"
                                    label="Icon"
                                    rules={[{ required: true, message: "Please input an icon!" }]}
                                >
                                    <Input
                                        placeholder="Enter emoji (e.g., 🚨)"
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item
                                    name="name"
                                    label="Name/Organization"
                                    rules={[
                                        { required: true, message: "Please input the name!" },
                                    ]}
                                >
                                    <Input
                                        placeholder="Enter name or organization"
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="role"
                                    label="Role/Position"
                                    rules={[
                                        { required: true, message: "Please input the role!" },
                                    ]}
                                >
                                    <Select
                                        placeholder="Select or type role"
                                        showSearch
                                        allowClear
                                        options={availableRoles.map((role: any) => ({
                                            label: role,
                                            value: role,
                                        }))}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="phone"
                                    label="Phone Number"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please input the phone number!",
                                        },
                                    ]}
                                >
                                    <Input
                                        placeholder="Enter phone number"
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                );

            case "section-edit":
                return (
                    <div
                        style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                            padding: "16px",
                        }}
                    >
                        {sectionItems.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: "16px",
                                    padding: "16px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    position: "relative",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "12px",
                                        right: "12px",
                                        display: "flex",
                                        gap: "8px",
                                    }}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setTimeout(() => {
                                                showModal("contact", currentSectionIndex, index);
                                            }, 100);
                                        }}
                                        style={{ color: "#3b82f6" }}
                                    />
                                    <Popconfirm
                                        title="Are you sure to delete this contact?"
                                        onConfirm={() =>
                                            handleItemDelete(currentSectionIndex!, index)
                                        }
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            style={{ color: "#dc2626" }}
                                        />
                                    </Popconfirm>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        paddingRight: "80px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            backgroundColor: item.bgColor,
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: item.textColor,
                                            fontSize: "16px",
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "14px" }}>
                                            {item.name}
                                        </div>
                                        <div style={{ color: "#6b7280", fontSize: "12px" }}>
                                            {item.role} • {item.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => showModal("contact", currentSectionIndex, null)}
                            style={{ width: "100%", marginTop: "16px", borderRadius: "6px" }}
                        >
                            Add
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "24px",
                border: "1px solid #e5e7eb",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    paddingBottom: "16px",
                    borderBottom: "2px solid #f3f4f6",
                }}
            >
                <h3
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#111827",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        margin: 0,
                    }}
                >
                    <PhoneOutlined style={{ color: "#10b981", fontSize: "24px" }} />
                    Important Contacts
                </h3>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={{ color: "#dc2626" }}>{error}</div>
            ) : contacts.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "14px",
                        padding: "20px 0",
                    }}
                >
                    No contacts available. Click 'Add' to get started.
                </div>
            ) : (
                contacts.map((section, sectionIndex) => (
                    <div key={sectionIndex} style={{ marginBottom: "28px" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                                padding: "8px 0",
                            }}
                        >
                            <h4
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    color: "#374151",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    margin: 0,
                                }}
                            >
                                {section.title}
                            </h4>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ArrowRightCircle size={16} />}
                                    onClick={() => showModal("section-edit", sectionIndex, null)}
                                    style={{ color: "#3b82f6" }}
                                />
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: "#f8fafc",
                                borderRadius: "12px",
                                padding: "16px",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            {section.items.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        color: "#9ca3af",
                                        fontSize: "14px",
                                        padding: "20px 0",
                                    }}
                                >
                                    No {section.title.toLowerCase()} available. Click 'Add' to get
                                    started.
                                </div>
                            ) : (
                                <>
                                    {section.items.slice(0, 2).map((contact, contactIndex) => (
                                        <div
                                            key={contactIndex}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "12px 0",
                                                borderBottom:
                                                    contactIndex < Math.min(section.items.length, 2) - 1
                                                        ? "1px solid #e5e7eb"
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    backgroundColor: contact.bgColor,
                                                    borderRadius: "10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    marginRight: "12px",
                                                    color: contact.textColor,
                                                    fontSize: "18px",
                                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                }}
                                            >
                                                {contact.icon}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        color: "#111827",
                                                        fontSize: "14px",
                                                        marginBottom: "2px",
                                                    }}
                                                >
                                                    {contact.name}
                                                </div>
                                                <div style={{ color: "#6b7280", fontSize: "13px" }}>
                                                    {contact.role} • {contact.phone}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                {/*  */}
                                            </div>
                                        </div>
                                    ))}
                                    {section.items.length > 2 && (
                                        <div style={{ textAlign: "center", marginTop: "12px" }}>
                                            <Button
                                                type="link"
                                                icon={<EyeOutlined />}
                                                onClick={() =>
                                                    showModal("section-edit", sectionIndex, null)
                                                }
                                                style={{ color: "#6b7280" }}
                                            >
                                                View All ({section.items.length} items)
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}

            <Modal
                title={
                    modalType === "new-section"
                        ? "Add New Contact Section"
                        : modalType === "contact"
                            ? currentItemIndex !== null
                                ? "Edit Contact Info"
                                : "Add New Contact"
                            : "Manage Contact Section"
                }
                open={isModalOpen}
                onOk={
                    modalType !== "section-edit" ? handleOk : () => setIsModalOpen(false)
                }
                onCancel={handleCancel}
                okText={
                    modalType === "section-edit"
                        ? "Close"
                        : currentItemIndex !== null
                            ? "Update"
                            : modalType === "new-section"
                                ? "Create Section"
                                : "Add"
                }
                cancelText={modalType === "section-edit" ? null : "Cancel"}
                width={modalType === "section-edit" ? 700 : 700}
                style={{ top: 20 }}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" style={{ marginTop: "16px" }}>
                    {renderFormFields()}
                </Form>
            </Modal>
        </div>
    );
};

import { DatePicker } from "antd";
import { CheckSquare, Edit } from "lucide-react";
import dayjs from "dayjs";

type Task = {
    id: number;
    title: string;
    assignee: string;
    type: string;
    completed: boolean;
    due: string;
    dueDate?: string;
};

type Project = {
    project_id: string;
    title: string;
    description: string;
    due_date: string;
    meta: [];
    progress: number;
    tasks: Task[];
};



type Note = {
    title: string;
    description: string;
};
type FamilyTasksProps = {
    isPlanner: boolean;
};

export const FamilyTasks: React.FC<FamilyTasksProps> = (props: any) => {
    const { isPlanner } = props;
    const [uid, setUid] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [newProjectMeta, setNewProjectMeta] = useState<string>("");
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<{
        projectId: string;
        task: Task | null;
    }>({
        projectId: "",
        task: null,
    });
    const [loading, setLoading] = useState(false);

    let assignees = [
        { label: "John", value: "john" },
        { label: "Sarah", value: "sarah" },
        { label: "Emma", value: "emma" },
        { label: "Liam", value: "liam" },
        { label: "All", value: "all" },
    ];

    if (isPlanner) {
        assignees = [
            { label: "Personal", value: "personal" },
            { label: "Work", value: "work" },
        ];
    }
    useEffect(() => {
        const stored = localStorage.getItem("userId");
        if (stored) setUid(stored);
    }, []);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await getProjects();
            const rawProjects = res.data.payload.projects || [];

            const projectsWithTasks = await Promise.all(
                rawProjects.map(async (proj: any) => {
                    const taskRes = await getTasks({ project_id: proj.project_id });
                    const rawTasks = taskRes.data.payload.tasks || [];

                    const tasks = rawTasks.map((task: any, index: number) => ({
                        id: task.task_id || index + 1,
                        title: task.title,
                        assignee: task.assignee,
                        type: task.type,
                        completed: task.completed,
                        due: task.completed ? "Completed" : "Due today",
                        dueDate: task.due_date,
                    }));

                    return {
                        project_id: proj.project_id,
                        title: proj.title,
                        description: proj.description,
                        meta: Object.values(proj.meta || {}),
                        due_date: proj.due_date,
                        progress: tasks.length
                            ? Math.round(
                                (tasks.filter((t: any) => t.completed).length /
                                    tasks.length) *
                                100
                            )
                            : 0,
                        tasks,
                    };
                })
            );

            setProjects(projectsWithTasks);
        } catch (err) {
            console.error(err);
            message.error("Failed to load projects");
        }
        setLoading(false);
    };

    const handleAddProject = async () => {
        setLoading(true);
        if (!newProjectName.trim()) return;
        try {
            await addProject({
                uid,
                title: newProjectName,
                description: newProjectDescription,
                due_date: newProjectMeta,
            });
            message.success("Project added");
            setModalVisible(false);
            setNewProjectName("");
            setNewProjectDescription("");
            setNewProjectMeta("");
            fetchProjects();
        } catch (error) {
            console.error(error);
            message.error("Failed to add project");
        }
        setLoading(false);
    };

    const addTaskToBackend = async (projectId: string) => {
        setLoading(true);
        if (!uid) return;
        const project = projects.find((p) => p.project_id === projectId);
        if (!project) return;

        const newTask = {
            uid,
            project_id: projectId,
            title: "New task",
            assignee: "All",
            type: "all",
            due_date: dayjs().format("YYYY-MM-DD"),
            completed: false,
        };

        try {
            await addTask(newTask);

            const newTaskObj: Task = {
                id: Math.max(...project.tasks.map((t) => t.id), 0) + 1,
                title: "New task",
                assignee: "All",
                type: "all",
                completed: false,
                due: "Due today",
                dueDate: newTask.due_date,
            };

            setProjects((prev) =>
                prev.map((p) =>
                    p.project_id === projectId
                        ? { ...p, tasks: [...p.tasks, newTaskObj] }
                        : p
                )
            );
        } catch (err) {
            console.error(err);
            message.error("Failed to add task");
        }
        setLoading(false);
    };

    const toggleTask = async (projectId: string, taskId: number) => {
        const project = projects.find((p) => p.project_id === projectId);
        if (!project) return;

        const task = project.tasks.find((t) => t.id === taskId);
        if (!task) return;

        const updatedStatus = !task.completed;

        try {
            await updateTask({
                task_id: task.id,
                completed: updatedStatus,
            });

            setProjects((prev) =>
                prev.map((project) => {
                    if (project.project_id === projectId) {
                        const updatedTasks = project.tasks.map((t) =>
                            t.id === taskId
                                ? {
                                    ...t,
                                    completed: updatedStatus,
                                    due: updatedStatus ? "Completed" : "Due today",
                                }
                                : t
                        );
                        const progress = Math.round(
                            (updatedTasks.filter((t) => t.completed).length /
                                updatedTasks.length) *
                            100
                        );
                        return { ...project, tasks: updatedTasks, progress };
                    }
                    return project;
                })
            );
        } catch (err) {
            console.error(err);
            message.error("Failed to update task status");
        }
    };

    const updateEditedTask = async () => {
        if (!editingTask.task) return;

        try {
            await updateTask({
                task_id: editingTask.task.id,
                title: editingTask.task.title,
                due_date: editingTask.task.dueDate,
                assignee: editingTask.task.assignee,
                type: editingTask.task.type,
            });

            setProjects((prev) =>
                prev.map((project) => {
                    if (project.project_id === editingTask.projectId) {
                        const updatedTasks = project.tasks.map((task) =>
                            task.id === editingTask.task!.id ? editingTask.task! : task
                        );
                        return { ...project, tasks: updatedTasks };
                    }
                    return project;
                })
            );

            message.success("Task updated");
            setEditTaskModal(false);
        } catch (err) {
            console.error(err);
            message.error("Failed to update task");
        }
    };

    const getAssigneeStyle = (type: string) => {
        const base = {
            fontSize: "12px",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: 500,
        };
        const colors: any = {
            john: { bg: "rgba(51, 85, 255, 0.1)", color: "#3355ff" },
            sarah: { bg: "rgba(99, 102, 241, 0.1)", color: "#6366f1" },
            emma: { bg: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" },
            liam: { bg: "rgba(236, 72, 153, 0.1)", color: "#ec4899" },
            all: { bg: "#eef1ff", color: "#3355ff" },
        };
        return {
            ...base,
            backgroundColor: colors[type]?.bg || "#eee",
            color: colors[type]?.color || "#333",
        };
    };

    if (loading) {
        return <DocklyLoader />;
    }

    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "20px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                }}
            >
                <h2
                    style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <CheckSquare size={20} /> Family Tasks & Projects
                </h2>
                <button
                    onClick={() => setModalVisible(true)}
                    style={{
                        padding: "8px 16px",
                        border: "1px solid rgb(238, 240, 244)",
                        borderRadius: "6px",
                    }}
                >
                    <Plus size={16} /> New Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        padding: "20px 0px",
                        border: "2px dashed #e5e7eb",
                        borderRadius: "12px",
                        background: "#fafbff",
                        marginTop: 10,
                    }}
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                        alt="No Projects"
                        style={{ width: "120px", marginBottom: "20px", opacity: 0.6 }}
                    />
                    <h3 style={{ fontSize: "20px", color: "#333", marginBottom: "10px" }}>
                        No Projects Yet
                    </h3>
                    <p style={{ color: "#777", fontSize: "14px", marginBottom: "20px" }}>
                        Start organizing your tasks by creating your first project.
                    </p>
                    <button
                        onClick={() => setModalVisible(true)}
                        style={{
                            background: "#3355ff",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            padding: "10px 20px",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontSize: "14px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            transition: "background 0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1d40e0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#3355ff")}
                    >
                        <Plus size={14} style={{ marginRight: 6 }} /> Create Project
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {projects.map((project) => (
                        <div
                            key={project.project_id}
                            style={{
                                border: "1px solid #e5e7eb",
                                padding: "16px",
                                borderRadius: "8px",
                            }}
                        >
                            <h3>{project.title}</h3>
                            {project.description && (
                                <p style={{ fontSize: 12 }}>{project.description}</p>
                            )}
                            {project.due_date && (
                                <p style={{ fontSize: 12, color: "#9ca3af" }}>
                                    Due Date: {dayjs(project.due_date).format("MMM D, YYYY")}
                                </p>
                            )}
                            <div style={{ marginBottom: 10, color: "#6b7280", fontSize: 12 }}>
                                {project.meta?.map((m, i) => (
                                    <span key={i}>
                                        {m} {i < project.meta.length - 1 && "• "}{" "}
                                    </span>
                                ))}
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                {project.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        style={{
                                            backgroundColor: "#fff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "6px",
                                            padding: "12px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginBottom: 4,
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={() => toggleTask(project.project_id, task.id)}
                                            />
                                            <div style={{ flex: 1 }}>{task.title}</div>
                                            <div style={getAssigneeStyle(task.type)}>
                                                {task.assignee}
                                            </div>
                                            <Edit
                                                size={14}
                                                style={{ cursor: "pointer", opacity: 0.6 }}
                                                onClick={() => {
                                                    setEditingTask({
                                                        projectId: project.project_id,
                                                        task,
                                                    });
                                                    setEditTaskModal(true);
                                                }}
                                            />
                                        </div>
                                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                                            {task.due}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => addTaskToBackend(project.project_id)}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    border: "2px dashed #e5e7eb",
                                    backgroundColor: "transparent",
                                    borderRadius: "6px",
                                    color: "#6b7280",
                                }}
                            >
                                + Add task
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={modalVisible}
                title="Add New Project"
                onCancel={() => setModalVisible(false)}
                onOk={handleAddProject}
                okText="Add"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Input
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Project Name"
                    />
                    <Input.TextArea
                        rows={3}
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        placeholder="Description"
                    />
                    <DatePicker
                        value={newProjectMeta ? dayjs(newProjectMeta) : null}
                        onChange={(_, dateString) =>
                            setNewProjectMeta(
                                Array.isArray(dateString) ? dateString[0] || "" : dateString
                            )
                        }
                        placeholder="Due Date"
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                        }
                    />
                </div>
            </Modal>

            <Modal
                open={editTaskModal}
                title="Edit Task"
                okText="Save"
                onCancel={() => setEditTaskModal(false)}
                onOk={updateEditedTask}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Input
                        value={editingTask.task?.title}
                        onChange={(e) =>
                            setEditingTask((prev) => ({
                                ...prev,
                                task: { ...prev.task!, title: e.target.value },
                            }))
                        }
                        placeholder="Task Name"
                    />
                    <DatePicker
                        value={
                            editingTask.task?.dueDate ? dayjs(editingTask.task.dueDate) : null
                        }
                        onChange={(_, dateString) => {
                            if (typeof dateString === "string") {
                                setEditingTask((prev) => ({
                                    ...prev,
                                    task: {
                                        ...prev.task!,
                                        due: `Due ${dayjs(dateString).format("MMM D")}`,
                                        dueDate: dateString,
                                    },
                                }));
                            }
                        }}
                        placeholder="Due Date"
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                        }
                    />
                    <Select
                        value={editingTask.task?.type}
                        onChange={(value) => {
                            setEditingTask((prev) => ({
                                ...prev,
                                task: {
                                    ...prev.task!,
                                    type: value,
                                    assignee:
                                        assignees.find((a) => a.value === value)?.label || "All",
                                },
                            }));
                        }}
                        options={assignees}
                        placeholder="Select Assignee"
                    />
                </div>
            </Modal>
        </div>
    );
};

type Category = {
    title: string;
    icon: string;
    items: { title: string; description: string }[];
};

const defaultCategories: Category[] = [
    { title: "Important Notes", icon: "📝", items: [] },
    { title: "Emergency Contacts", icon: "🚨", items: [] },
    { title: "House Rules & Routines", icon: "🏠", items: [] },
    { title: "Shopping Lists", icon: "🛒", items: [] },
    { title: "Birthday & Gift Ideas", icon: "🎁", items: [] },
    { title: "Meal Ideas & Recipes", icon: "🍽", items: [] },
];

const categoryIdMap: { [key: string]: number } = {
    "Important Notes": 1,
    "Emergency Contacts": 2,
    "House Rules & Routines": 3,
    "Shopping Lists": 4,
    "Birthday & Gift Ideas": 5,
    "Meal Ideas & Recipes": 6,
};
const categoryIdMapReverse: { [key: number]: string } = Object.entries(
    categoryIdMap
).reduce((acc, [title, id]) => {
    acc[id] = title;
    return acc;
}, {} as { [key: number]: string });

const FamilyNotes: React.FC = () => {
    const [categories, setCategories] = useState(defaultCategories);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
        null
    );
    const [newNote, setNewNote] = useState({ title: "", description: "" });
    const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
    const [newCategoryModal, setNewCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getNotes();
    }, []);

    const getNotes = async () => {
        setLoading(true);
        try {
            const response = await getAllNotes();
            const rawNotes = response.data.payload;

            // Group notes by valid category_id only
            // Define Note type if not already defined
            type Note = {
                title: string;
                description: string;
            };
            const grouped: Record<number, Note[]> = {};

            rawNotes.forEach((note: any) => {
                const catId = note.category_id;
                if (!catId || !categoryIdMapReverse[catId]) return; // Skip if not a valid category
                if (!grouped[catId]) grouped[catId] = [];
                grouped[catId].push({
                    title: note.title,
                    description: note.description,
                });
            });

            // Merge default categories with fetched notes
            const updatedCategories: Category[] = defaultCategories.map((cat) => {
                const catId = categoryIdMap[cat.title];
                return {
                    ...cat,
                    items: grouped[catId] || [], // fallback to empty list
                };
            });

            setCategories(updatedCategories);
        } catch (error) {
            console.error("Error fetching notes:", error);
            message.error("Failed to load notes");
        }
        setLoading(false);
    };

    const openModal = (index: number) => {
        setActiveCategoryIndex(index);
        setEditingNoteIndex(null);
        setNewNote({ title: "", description: "" });
        setModalOpen(true);
    };

    const handleAddNote = async () => {
        setLoading(true);
        if (
            !newNote.title.trim() ||
            !newNote.description.trim() ||
            activeCategoryIndex === null
        ) {
            message.error("Please fill in all fields");
            return;
        }

        const categoryTitle = categories[activeCategoryIndex].title;
        const category_id = categoryIdMap[categoryTitle];
        if (!category_id) {
            message.error("Category ID not found");
            return;
        }

        try {
            const user_id =
                typeof window !== "undefined"
                    ? localStorage.getItem("userId") || ""
                    : "";
            const response = await addNote({
                title: newNote.title,
                description: newNote.description,
                category_id,
                user_id,
            });

            const data = response.data;
            if (data.status === 1) {
                await getNotes();
                setNewNote({ title: "", description: "" });
                setModalOpen(false);
                message.success("Note added successfully");
            } else {
                message.error(data.message || "Failed to add note");
            }
        } catch (error) {
            console.error("Error adding note:", error);
            message.error("Something went wrong");
        }
        setLoading(false);
    };

    const handleDeleteNote = (idx: number) => {
        const updated = [...categories];
        updated[activeCategoryIndex!].items.splice(idx, 1);
        setCategories(updated);
    };

    const handleEditNote = (note: any, idx: number) => {
        setEditingNoteIndex(idx);
        setNewNote({ ...note });
        setModalOpen(true);
    };

    const handleAddCategory = () => {
        const name = newCategoryName.trim();
        if (!name) return;
        if (categories.some((c) => c.title === name)) {
            message.error("Category already exists");
            return;
        }
        setCategories([...categories, { title: name, icon: "📁", items: [] }]);
        setNewCategoryModal(false);
        setNewCategoryName("");
    };
    if (loading) {
        return <DocklyLoader />;
    }
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 12,
                padding: 24,
                marginBottom: 24,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>Family Notes & Lists</h2>
                <button
                    style={{
                        padding: "8px 11px",
                        backgroundColor: "#eef1ff",
                        color: "#3355ff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#3355ff";
                        e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#eef1ff";
                        e.currentTarget.style.color = "#3355ff";
                    }}
                    onClick={() => setNewCategoryModal(true)}
                >
                    <PlusOutlined /> New Category
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                }}
            >
                {categories.map((category, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: "#f9fafb",
                            borderRadius: "8px",
                            padding: "16px",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "12px",
                            }}
                        >
                            <h3
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    margin: 0,
                                }}
                            >
                                <span>{category.icon}</span> {category.title}
                            </h3>
                            <Space>
                                <span
                                    style={{
                                        fontSize: "12px",
                                        background: "#e5e7eb",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                    }}
                                >
                                    {category.items.length}
                                </span>
                                <PlusOutlined
                                    style={{
                                        cursor: "pointer",
                                        fontSize: 16,
                                        color: PRIMARY_COLOR,
                                    }}
                                    onClick={() => openModal(index)}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.color = "#3355ff")
                                    }
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                                />
                                {/* <BoxSelect /> */}
                            </Space>
                        </div>
                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                            {category.items.length === 0 ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "04px 10px",
                                        border: "2px dashed #e5e7eb",
                                        borderRadius: "12px",
                                        background: "#fafbff",
                                        marginTop: 20,
                                    }}
                                >
                                    {/* <img
                    src="https://cdn-icons-png.flaticon.com/512/6561/6561337.png"
                    alt="No Tasks"
                    style={{ width: '100px', marginBottom: '16px', opacity: 0.6 }}
                  /> */}
                                    <h3
                                        style={{
                                            fontSize: "18px",
                                            color: "#333",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        No Tasks Available
                                    </h3>
                                    <p
                                        style={{
                                            color: "#777",
                                            fontSize: "14px",
                                            marginBottom: "16px",
                                        }}
                                    >
                                        Add a new note to get started on this category.
                                    </p>
                                    <button
                                        onClick={() => openModal(index)}
                                        style={{
                                            background: "#3355ff",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "8px 16px",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            fontSize: "13px",
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                            transition: "background 0.3s",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background = "#1d40e0")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background = "#3355ff")
                                        }
                                    >
                                        <Plus size={13} style={{ marginRight: 6 }} /> Add Note
                                    </button>
                                </div>
                            ) : (
                                category.items.map((note: any, i: any) => (
                                    <div
                                        key={i}
                                        style={{
                                            fontSize: 14,
                                            padding: "6px 0",
                                            borderBottom:
                                                i < category.items.length - 1
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                        }}
                                    >
                                        {note.title} - {note.description}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Notes Modal */}
            <Modal
                open={modalOpen}
                title={
                    activeCategoryIndex !== null
                        ? categories[activeCategoryIndex].title
                        : ""
                }
                onCancel={() => setModalOpen(false)}
                footer={null}
            >
                {activeCategoryIndex !== null &&
                    (categories[activeCategoryIndex].items.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "20px 0",
                                color: "#999",
                                fontStyle: "italic",
                            }}
                        >
                            No notes yet. Click "Add Note" to get started.
                        </div>
                    ) : (
                        categories[activeCategoryIndex].items.map((note: any, idx: any) => (
                            <div
                                key={idx}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "8px 0",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <div>
                                    {note.title} - {note.description}
                                </div>
                                <Space>
                                    <Button
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditNote(note, idx)}
                                        size="small"
                                    />
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        onClick={() => handleDeleteNote(idx)}
                                        size="small"
                                    />
                                </Space>
                            </div>
                        ))
                    ))}

                <Input
                    placeholder="Note Title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    style={{ marginTop: 12 }}
                />
                <Input
                    placeholder="Note Description"
                    value={newNote.description}
                    onChange={(e) =>
                        setNewNote({ ...newNote, description: e.target.value })
                    }
                    style={{ marginTop: 8, marginBottom: 12 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNote}>
                    {editingNoteIndex !== null ? "Update Note" : "Add Note"}
                </Button>
            </Modal>

            {/* New Category Modal */}
            <Modal
                open={newCategoryModal}
                title="Add New Category"
                onCancel={() => setNewCategoryModal(false)}
                onOk={handleAddCategory}
                okText="Add"
            >
                <Input
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
            </Modal>
        </div>
    );
};

import { Calendar } from "lucide-react";
import DocklyLoader from "../../utils/docklyLoader";
import FamilyHubMemberDetails from "./components/profile";
import FamilyMembers from "./components/familyMember";
import CustomCalendar, {
    sampleCalendarData,
} from "../components/customCalendar";
import { PRIMARY_COLOR } from "../../app/comman";

const UpcomingActivities: React.FC = () => {
    const activities = [
        {
            day: "23",
            month: "Jun",
            title: "Emma's Science Fair",
            details: "4:00 PM - 7:00 PM • Springfield High School",
            badge: { text: "Emma", type: "emma" },
        },
        {
            day: "25",
            month: "Jun",
            title: "Liam's Dentist Appointment",
            details: "2:30 PM • Dr. Wilson Pediatric Dentistry",
            badge: { text: "Liam", type: "liam" },
        },
        {
            day: "27",
            month: "Jun",
            title: "Family Picnic",
            details: "11:00 AM • Riverside Park",
            badge: { text: "Family", type: "family" },
        },
        {
            day: "03",
            month: "Jul",
            title: "Anniversary Dinner",
            details: "7:00 PM • The Vineyard Restaurant",
            badges: [
                { text: "John", type: "john" },
                { text: "Sarah", type: "sarah" },
            ],
        },
        {
            day: "15",
            month: "Jul",
            title: "Max's Vet Checkup",
            details: "10:00 AM • Happy Paws Veterinary",
            badge: { text: "Pet", type: "family" },
        },
    ];

    const getBadgeStyle = (type: string) => {
        const baseStyle = {
            fontSize: "12px",
            padding: "2px 8px",
            borderRadius: "12px",
            fontWeight: 500,
            marginLeft: "8px",
        };

        switch (type) {
            case "john":
                return {
                    ...baseStyle,
                    backgroundColor: "rgba(51, 85, 255, 0.1)",
                    color: "#3355ff",
                };
            case "sarah":
                return {
                    ...baseStyle,
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    color: "#6366f1",
                };
            case "emma":
                return {
                    ...baseStyle,
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    color: "#8b5cf6",
                };
            case "liam":
                return {
                    ...baseStyle,
                    backgroundColor: "rgba(236, 72, 153, 0.1)",
                    color: "#ec4899",
                };
            case "family":
                return { ...baseStyle, backgroundColor: "#eef1ff", color: "#3355ff" };
            default:
                return baseStyle;
        }
    };

    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                padding: "20px",
                height: "700px",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <h3
                    style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#111827",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        margin: 0,
                    }}
                >
                    <Calendar size={20} style={{ opacity: 0.8 }} />
                    Upcoming Activities
                </h3>
                <button
                    style={{
                        width: "28px",
                        height: "28px",
                        border: "none",
                        backgroundColor: "#eef1ff",
                        color: "#3355ff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#3355ff";
                        e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#eef1ff";
                        e.currentTarget.style.color = "#3355ff";
                    }}
                >
                    <Plus size={16} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
                {activities.map((activity, index) => (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            padding: "12px 0",
                            borderBottom:
                                index < activities.length - 1 ? "1px solid #e5e7eb" : "none",
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                            e.currentTarget.style.marginLeft = "8px";
                            e.currentTarget.style.marginRight = "-8px";
                            e.currentTarget.style.borderRadius = "8px";
                            e.currentTarget.style.paddingLeft = "12px";
                            e.currentTarget.style.paddingRight = "12px";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.marginLeft = "0";
                            e.currentTarget.style.marginRight = "0";
                            e.currentTarget.style.borderRadius = "0";
                            e.currentTarget.style.paddingLeft = "0";
                            e.currentTarget.style.paddingRight = "0";
                        }}
                    >
                        <div
                            style={{
                                width: "45px",
                                textAlign: "center",
                                marginRight: "12px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#374151",
                                }}
                            >
                                {activity.day}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                }}
                            >
                                {activity.month}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    marginBottom: "2px",
                                    color: "#374151",
                                    display: "flex",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                }}
                            >
                                {activity.title}
                                {activity.badge && (
                                    <span style={getBadgeStyle(activity.badge.type)}>
                                        {activity.badge.text}
                                    </span>
                                )}
                                {activity.badges &&
                                    activity.badges.map((badge, badgeIndex) => (
                                        <span key={badgeIndex} style={getBadgeStyle(badge.type)}>
                                            {badge.text}
                                        </span>
                                    ))}
                            </div>
                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                }}
                            >
                                {activity.details}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BoardTitle: React.FC = () => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
            }}
        >
            <div
                style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#eef1ff",
                    color: "#3355ff",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                }}
            >
                <Users size={24} />
            </div>
            <h1
                style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    color: "#111827",
                    margin: 0,
                }}
            >
                Family Hub
            </h1>
        </div>
    );
};
