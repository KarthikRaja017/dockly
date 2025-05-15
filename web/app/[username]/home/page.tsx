"use client";

import React, { useState } from "react";
import {
  Layout,
  Input,
  Button,
  Avatar,
  Row, // Added
  Col, // Added
  Card,
  Table,
  List,
  Space,
  Typography,
  Modal,
  Form,
  Input as AntInput,
  Checkbox,
  message,
  Calendar,
} from "antd";
import {
  HomeOutlined,
  EditOutlined,
  MoreOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css"; // Added for Ant Design styles

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Define consistent colors
const PRIMARY_COLOR = "#1890ff";
const SECONDARY_COLOR = "#d9d9d9";
const BACKGROUND_COLOR = "#fff";
const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

// Interfaces
interface Document {
  name: string;
  type: string;
  color: string;
}

interface MaintenanceTask {
  name: string;
  date: string;
  completed: boolean;
}

interface Section {
  title: string;
  type: string;
  data: any[];
}

const HomeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Board");
  const [documentsData, setDocumentsData] = useState<Document[]>([
    { name: "Property Deed.pdf", type: "PDF", color: PRIMARY_COLOR },
    { name: "Insurance Policy.pdf", type: "PDF", color: PRIMARY_COLOR },
    { name: "Mortgage Agreement.pdf", type: "PDF", color: PRIMARY_COLOR },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [customSections, setCustomSections] = useState<Section[]>([]);

  const propertyData = [
    { key: "Address", value: "123 Main Street, Springfield, IL 62701" },
    { key: "Purchase Date", value: "June 15, 2020" },
    { key: "Purchase Price", value: "$285,000" },
    { key: "Square Footage", value: "2,150 sq ft" },
    { key: "Lot Size", value: "0.25 acres" },
    { key: "Property Tax ID", value: "SN-37849221" },
  ];

  const mortgageData = [
    {
      name: "Chase Mortgage",
      meta: "Primary Mortgage • $1,450/month",
      color: PRIMARY_COLOR,
    },
    {
      name: "Santander HELOC",
      meta: "Home Equity Line • $220/month",
      color: PRIMARY_COLOR,
    },
  ];

  const mortgageDetails = [
    ["Primary Mortgage", "30-year fixed at 4.25%, $245,000 remaining balance"],
    ["HELOC", "$50,000 line, $32,500 drawn, variable rate 6.5%"],
    [
      "Refinance Notes",
      "Last refinanced June 2022, Loan Officer: Michael Johnson",
    ],
  ];

  const utilitiesData = [
    {
      name: "City Water",
      meta: "Account #WTR-849302 • $65/month",
      color: PRIMARY_COLOR,
    },
    {
      name: "Electric Co.",
      meta: "Account #ELC-392847 • $120/month",
      color: PRIMARY_COLOR,
    },
    {
      name: "Gas Services",
      meta: "Account #GAS-573920 • $45/month",
      color: PRIMARY_COLOR,
    },
    {
      name: "Waste Mgmt",
      meta: "Account #WST-194857 • $30/month",
      color: PRIMARY_COLOR,
    },
  ];

  const insuranceData = [
    {
      name: "State Farm Insurance",
      meta: "Policy #HO-58392 • $1,250/year",
      color: PRIMARY_COLOR,
    },
  ];

  const insuranceDetails = [
    ["Dwelling", "$350,000"],
    ["Personal Property", "$175,000"],
    ["Liability", "$300,000"],
    ["Deductible", "$1,000"],
  ];

  const [maintenanceData, setMaintenanceData] = useState<MaintenanceTask[]>([
    { name: "Replace HVAC filters", date: "Apr 10", completed: true },
    {
      name: "Schedule annual A/C maintenance",
      date: "May 1",
      completed: false,
    },
    { name: "Clean gutters", date: "May 15", completed: false },
    { name: "Lawn fertilization treatment", date: "May 20", completed: false },
    { name: "Check smoke detectors", date: "Jun 1", completed: false },
  ]);

  const [notesData, setNotesData] = useState([
    {
      content:
        "Need to call contractor about basement finishing quote next week.",
      date: "Apr 16, 2023",
    },
  ]);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCustomSectionModalOpen, setIsCustomSectionModalOpen] =
    useState(false);
  const [editSection, setEditSection] = useState<string>("");
  const [maintenanceForm] = Form.useForm();
  const [noteForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [customSectionForm] = Form.useForm();

  // Click Handlers for Tabs
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Modal Handlers for Documents
  const showModal = () => setIsModalOpen(true);
  const handleOk = () => {
    form.validateFields().then((values) => {
      const newDocument: Document = {
        name: values.name.endsWith(".pdf") ? values.name : `${values.name}.pdf`,
        type: "PDF",
        color: PRIMARY_COLOR,
      };
      setDocumentsData([...documentsData, newDocument]);
      form.resetFields();
      setIsModalOpen(false);
      message.success("Document added successfully!");
    });
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Modal Handlers for Maintenance
  const showMaintenanceModal = () => setIsMaintenanceModalOpen(true);
  const handleMaintenanceOk = () => {
    maintenanceForm.validateFields().then((values) => {
      const newTask: MaintenanceTask = {
        name: values.name,
        date: values.date,
        completed: false,
      };
      setMaintenanceData([...maintenanceData, newTask]);
      maintenanceForm.resetFields();
      setIsMaintenanceModalOpen(false);
      message.success("Task added successfully!");
    });
  };
  const handleMaintenanceCancel = () => {
    setIsMaintenanceModalOpen(false);
    maintenanceForm.resetFields();
  };

  // Modal Handlers for Notes
  const showNoteModal = () => setIsNoteModalOpen(true);
  const handleNoteOk = () => {
    noteForm.validateFields().then((values) => {
      const newNote = {
        content: values.content,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      setNotesData([...notesData, newNote]);
      noteForm.resetFields();
      setIsNoteModalOpen(false);
      message.success("Note added successfully!");
    });
  };
  const handleNoteCancel = () => {
    setIsNoteModalOpen(false);
    noteForm.resetFields();
  };

  // Modal Handlers for Custom Sections
  const showCustomSectionModal = () => setIsCustomSectionModalOpen(true);
  const handleCustomSectionOk = () => {
    customSectionForm.validateFields().then((values) => {
      const newSection: Section = {
        title: values.title,
        type: "custom",
        data: [],
      };
      setCustomSections([...customSections, newSection]);
      customSectionForm.resetFields();
      setIsCustomSectionModalOpen(false);
      message.success("New section added successfully!");
    });
  };
  const handleCustomSectionCancel = () => {
    setIsCustomSectionModalOpen(false);
    customSectionForm.resetFields();
  };

  // Edit Handlers
  const handleEdit = (section: string) => {
    setEditSection(section);
    setIsEditModalOpen(true);
  };
  const handleEditOk = () => {
    editForm.validateFields().then(() => {
      message.success(`${editSection} section updated successfully!`);
      setIsEditModalOpen(false);
      editForm.resetFields();
    });
  };
  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    editForm.resetFields();
  };

  const handleMore = (section: string) =>
    message.info(`More options for ${section} are triggered!`);
  const handleAddBill = (section: string) =>
    message.info(`Add Bill functionality for ${section} is triggered!`);
  const handleCheckboxChange = (index: number) => {
    const updatedData = [...maintenanceData];
    updatedData[index].completed = !updatedData[index].completed;
    setMaintenanceData(updatedData);
  };

  // Render Views
  const renderBoardView = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🏠</span> Property
              Information
            </span>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Property Information")}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleMore("Property Information")}
              >
                <MoreOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <Table
            columns={[
              { title: "Property", dataIndex: "key", key: "key" },
              { title: "Value", dataIndex: "value", key: "value" },
            ]}
            dataSource={propertyData}
            pagination={false}
            size="small"
          />
        </Card>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🏦</span> Mortgage & Loans
            </span>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Mortgage & Loans")}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleMore("Mortgage & Loans")}
              >
                <MoreOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={mortgageData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    Log In
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: item.color }}>
                      {item.name[0]}
                    </Avatar>
                  }
                  title={<Text strong>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
          />
          <Table
            columns={[
              { title: "Loan Details", dataIndex: "key", key: "key" },
              { title: "Value", dataIndex: "value", key: "value" },
            ]}
            dataSource={mortgageDetails.map(([key, value]) => ({ key, value }))}
            pagination={false}
            size="small"
            style={{ marginTop: "16px" }}
          />
        </Card>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🔌</span> Utilities
            </span>
          }
          extra={
            <Space>
              <Button type="default" onClick={() => handleEdit("Utilities")}>
                <EditOutlined />
              </Button>
              <Button type="default" onClick={() => handleMore("Utilities")}>
                <MoreOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={utilitiesData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    Log In
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: item.color }}>
                      {item.name[0]}
                    </Avatar>
                  }
                  title={<Text strong>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
          />
        </Card>
        <Card
          title={
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>📄</span> Important
                Documents
              </span>
              <Button type="default" onClick={showModal}>
                Add Document
              </Button>
            </Space>
          }
          style={{
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={documentsData}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: item.color }}>
                      {item.type[0]}
                    </Avatar>
                  }
                  title={<Text strong>{item.name}</Text>}
                  description={item.type}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card
          title={
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>🔧</span> Home Maintenance
              </span>
              <Button type="default" onClick={showMaintenanceModal}>
                Add Task
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={maintenanceData}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Checkbox
                      checked={item.completed}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  }
                  title={
                    <Text
                      style={{ color: item.completed ? "#8c8c8c" : "#000" }}
                    >
                      {item.name}
                    </Text>
                  }
                  description={
                    <Text
                      style={{ color: item.completed ? "#8c8c8c" : "#000" }}
                    >
                      {item.date}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🛡</span> Insurance
            </span>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={insuranceData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    Log In
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: item.color }}>
                      {item.name[0]}
                    </Avatar>
                  }
                  title={<Text strong>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
          />
          <Table
            columns={[
              { title: "Property", dataIndex: "key", key: "key" },
              { title: "Value", dataIndex: "value", key: "value" },
            ]}
            dataSource={insuranceDetails.map(([key, value]) => ({
              key,
              value,
            }))}
            pagination={false}
            size="small"
          />
        </Card>
        <Card
          title={
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>📝</span> Notes
              </span>
              <Button type="default" onClick={showNoteModal}>
                Add Note
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="vertical"
            dataSource={notesData}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: "#fffbe6",
                  borderRadius: "4px",
                  marginBottom: "8px",
                }}
              >
                <List.Item.Meta
                  title={<Text>{item.content}</Text>}
                  description={<Text type="secondary">{item.date}</Text>}
                />
              </List.Item>
            )}
          />
        </Card>
        {customSections.map((section, index) => (
          <Card
            key={index}
            title={
              <span>
                <span style={{ marginRight: "8px" }}>📌</span> {section.title}
              </span>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "8px",
              boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
            }}
          >
            <Text style={{ color: "#8c8c8c" }}>
              No data available for this section.
            </Text>
          </Card>
        ))}
        <Text
          style={{ color: PRIMARY_COLOR, cursor: "pointer" }}
          onClick={showCustomSectionModal}
        >
          Add New Section
        </Text>
      </Col>
    </Row>
  );

  const renderTableView = () => (
    <Row gutter={24}>
      <Col span={24}>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>📋</span> All Data Overview
            </span>
          }
          style={{
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <Table
            columns={[
              { title: "Category", dataIndex: "category", key: "category" },
              { title: "Name", dataIndex: "name", key: "name" },
              { title: "Details", dataIndex: "details", key: "details" },
            ]}
            dataSource={[
              ...documentsData.map((doc) => ({
                category: "Documents",
                name: doc.name,
                details: doc.type,
              })),
              ...maintenanceData.map((task) => ({
                category: "Maintenance",
                name: task.name,
                details: `${task.date} • ${
                  task.completed ? "Completed" : "Pending"
                }`,
              })),
              ...notesData.map((note) => ({
                category: "Notes",
                name: note.content.slice(0, 20) + "...",
                details: note.date,
              })),
            ]}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );

  const renderCalendarView = () => (
    <Row gutter={24}>
      <Col span={24}>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>📅</span> Maintenance
              Schedule
            </span>
          }
          style={{
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <Calendar
            fullscreen={false}
            onSelect={(date) => {
              const formattedDate = date.format("MMM D");
              const tasks = maintenanceData.filter(
                (task) => task.date === formattedDate
              );
              if (tasks.length) {
                message.info(
                  `Tasks on ${formattedDate}: ${tasks
                    .map((t) => t.name)
                    .join(", ")}`
                );
              } else {
                message.info(`No tasks scheduled for ${formattedDate}`);
              }
            }}
          />
          <List
            header={<Text strong>Upcoming Tasks</Text>}
            dataSource={maintenanceData.filter((task) => !task.completed)}
            renderItem={(item) => (
              <List.Item>
                <Text>
                  {item.name} - {item.date}
                </Text>
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderActivityView = () => (
    <Row gutter={24}>
      <Col span={12}>
        <Card
          title={
            <span>
              <span style={{ marginRight: "8px" }}>🔌</span> Utilities Overview
            </span>
          }
          extra={
            <Space>
              <Button type="default" onClick={() => handleEdit("Utilities")}>
                <EditOutlined />
              </Button>
              <Button type="default" onClick={() => handleMore("Utilities")}>
                <MoreOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={utilitiesData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    size="small"
                    style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                  >
                    Log In
                  </Button>,
                ]}
                style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: item.color }}>
                      {item.name[0]}
                    </Avatar>
                  }
                  title={<Text strong>{item.name}</Text>}
                  description={item.meta}
                />
              </List.Item>
            )}
          />
          <Text
            style={{
              display: "block",
              color: PRIMARY_COLOR,
              cursor: "pointer",
              textAlign: "center",
              marginTop: "16px",
            }}
            onClick={() => handleAddBill("Utilities")}
          >
            Add Utility
          </Text>
        </Card>
      </Col>
      <Col span={12}>
        <Card
          title={
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <span>
                <span style={{ marginRight: "8px" }}>🔧</span> Home Maintenance
                Overview
              </span>
              <Button type="default" onClick={showMaintenanceModal}>
                Add Task
              </Button>
            </Space>
          }
          extra={
            <Space>
              <Button
                type="default"
                onClick={() => handleEdit("Home Maintenance")}
              >
                <EditOutlined />
              </Button>
              <Button
                type="default"
                onClick={() => handleMore("Home Maintenance")}
              >
                <MoreOutlined />
              </Button>
            </Space>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${SHADOW_COLOR}`,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={maintenanceData}
            renderItem={(item, index) => (
              <List.Item style={{ padding: "8px 0", borderBottom: "none" }}>
                <List.Item.Meta
                  avatar={
                    <Checkbox
                      checked={item.completed}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  }
                  title={
                    <Text
                      style={{ color: item.completed ? "#8c8c8c" : "#000" }}
                    >
                      {item.name}
                    </Text>
                  }
                  description={
                    <Text
                      style={{
                        color: item.completed ? "#8c8c8c" : "#000",
                        fontSize: "12px",
                      }}
                    >
                      {item.date}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
          <Text
            style={{
              display: "block",
              color: PRIMARY_COLOR,
              cursor: "pointer",
              textAlign: "center",
              marginTop: "16px",
            }}
            onClick={() => handleAddBill("Home Maintenance")}
          >
            Add Task
          </Text>
        </Card>
      </Col>
    </Row>
  );

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#f0f2f5",
        margin: "80px 10px 10px 60px",
      }}
    >
      <Content style={{ padding: "24px" }}>
        <Title
          level={3}
          style={{ color: "#001529", fontWeight: 600, marginBottom: "8px" }}
        >
          <span style={{ marginRight: "8px" }}>🏠</span> Home Management
        </Title>
        <Space style={{ marginBottom: "24px" }}>
          {["Board", "Table", "Calendar", "Activity"].map((tab) => (
            <Button
              key={tab}
              type="text"
              style={{
                fontWeight: activeTab === tab ? "bold" : "normal",
                color: activeTab === tab ? PRIMARY_COLOR : "#000",
                borderBottom:
                  activeTab === tab ? `2px solid ${PRIMARY_COLOR}` : "none",
              }}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </Button>
          ))}
        </Space>
        <div>
          {activeTab === "Board" && renderBoardView()}
          {activeTab === "Table" && renderTableView()}
          {activeTab === "Calendar" && renderCalendarView()}
          {activeTab === "Activity" && renderActivityView()}
        </div>
        <Modal
          title="Add New Document"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Document Name"
              rules={[{ required: true }]}
            >
              <AntInput id="document-name" placeholder="Enter document name" />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Add New Maintenance Task"
          open={isMaintenanceModalOpen}
          onOk={handleMaintenanceOk}
          onCancel={handleMaintenanceCancel}
        >
          <Form form={maintenanceForm} layout="vertical">
            <Form.Item
              name="name"
              label="Task Name"
              rules={[{ required: true }]}
            >
              <AntInput id="task-name" placeholder="Enter task name" />
            </Form.Item>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <AntInput id="task-date" placeholder="e.g., May 1" />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Add New Note"
          open={isNoteModalOpen}
          onOk={handleNoteOk}
          onCancel={handleNoteCancel}
        >
          <Form form={noteForm} layout="vertical">
            <Form.Item
              name="content"
              label="Note Content"
              rules={[{ required: true }]}
            >
              <AntInput.TextArea
                id="note-content"
                placeholder="Enter note content"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Add New Section"
          open={isCustomSectionModalOpen}
          onOk={handleCustomSectionOk}
          onCancel={handleCustomSectionCancel}
        >
          <Form form={customSectionForm} layout="vertical">
            <Form.Item
              name="title"
              label="Section Title"
              rules={[{ required: true }]}
            >
              <AntInput id="section-title" placeholder="Enter section title" />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={`Edit Section: ${editSection}`}
          open={isEditModalOpen}
          onOk={handleEditOk}
          onCancel={handleEditCancel}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="title"
              label="Section Title"
              rules={[{ required: true }]}
            >
              <AntInput
                id="edit-section-title"
                placeholder="Enter new section title"
                defaultValue={editSection}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default HomeManagement;
