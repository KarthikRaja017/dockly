"use client";
import React, { useState } from "react";
import {
  Steps,
  Button,
  Card,
  List,
  Input,
  Tag,
  Checkbox,
  Space,
  Typography,
  Divider,
  Progress,
  Table,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  FolderOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  CloudOutlined,
} from "@ant-design/icons";

const { Step } = Steps;
const { Title, Text } = Typography;

interface CloudService {
  icon: string;
  name: string;
  description: string;
  connected: boolean;
  email?: string;
  totalStorage?: string;
  usedPercentage?: number;
  files?: number;
  folders?: number;
  shared?: number;
}
type FileItemType = "doc" | "xls" | "pdf" | "zip" | "ppt" | "folder" | "image";

interface FileItem {
  type: FileItemType
  name: string;
  details: any;
  path: string;
  storage?: string;
  size?: string;
  modified?: string;
  status?: string;
}

interface PinnedFile {
  name: string;
  boards: string[];
}

const initialCloudServices: CloudService[] = [
  {
    icon: "G",
    name: "Google Drive",
    description: "Documents, spreadsheets, presentations.",
    connected: false,
  },
  {
    icon: "D",
    name: "Dropbox",
    description: "Cloud storage for files and photos.",
    connected: true,
    email: "user@dropbox.com",
    totalStorage: "2 TB",
    usedPercentage: 10,
    files: 583,
    folders: 42,
    shared: 15,
  },
  {
    icon: "iC",
    name: "iCloud Drive",
    description: "Apple's cloud storage.",
    connected: false,
  },
  {
    icon: "O",
    name: "OneDrive",
    description: "Microsoft cloud storage.",
    connected: false,
    email: "user@outlook.com",
    totalStorage: "1 TB",
    usedPercentage: 35,
    files: 1287,
    folders: 93,
    shared: 27,
  },
  {
    icon: "GP",
    name: "Google Photos",
    description: "Photo and video storage.",
    connected: false,
  },
  {
    icon: "B",
    name: "Box",
    description: "Secure content management.",
    connected: false,
  },
];

const initialFiles: FileItem[] = [
  {
    type: "folder",
    name: "Tax Documents",
    details: "Folder with 8 items",
    path: "My Drive/Important Documents/2023/Tax Documents",
  },
  {
    type: "folder",
    name: "Insurance",
    details: "Folder with 4 items",
    path: "My Drive/Important Documents/2023/Insurance",
  },
  {
    type: "pdf",
    name: "Home_Deed_2020.pdf",
    details: "PDF • 2.4 MB • Apr 14, 2020",
    path: "My Drive/Important Documents/2023/Home_Deed_2020.pdf",
  },
  {
    type: "pdf",
    name: "Mortgage_Agreement.pdf",
    details: "PDF • 3.7 MB • Apr 13, 2020",
    path: "My Drive/Important Documents/2023/Mortgage_Agreement.pdf",
  },
  {
    type: "pdf",
    name: "Home_Insurance_Policy.pdf",
    details: "PDF • 1.8 MB • May 2, 2023",
    path: "My Drive/Important Documents/2023/Home_Insurance_Policy.pdf",
  },
  {
    type: "image",
    name: "House_Front.jpg",
    details: "JPG • 5.3 MB • Jul 10, 2020",
    path: "My Drive/Important Documents/2023/House_Front.jpg",
  },
  {
    type: "pdf",
    name: "HOA_Bylaws.pdf",
    details: "PDF • 1.2 MB • Apr 20, 2020",
    path: "My Drive/Important Documents/2023/HOA_Bylaws.pdf",
  },
];

const recentFiles = [
  {
    type: "doc",
    name: "Q2 Financial Report.docx",
    path: "Documents/Finance",
    storage: "OneDrive",
    size: "2.4 MB",
    modified: "Today, 9:45 AM",
    status: "Synced",
    details: {},
  },
  {
    type: "xls",
    name: "Budget 2025.xlsx",
    path: "Finance/Planning",
    storage: "Google Drive",
    size: "1.8 MB",
    modified: "Today, 10:12 AM",
    status: "Synced",
    details: {},
  },
  {
    type: "pdf",
    name: "Home Insurance Policy.pdf",
    path: "Documents/Insurance",
    storage: "Dropbox",
    size: "4.2 MB",
    modified: "Yesterday, 3:22 PM",
    status: "Synced",
    details: {},
  },
  {
    type: "zip",
    name: "Family Vacation Photos.zip",
    path: "Photos/2025/Spring",
    storage: "Google Drive",
    size: "256 MB",
    modified: "Yesterday, 8:45 PM",
    status: "Synced",
    details: {},
  },
  {
    type: "ppt",
    name: "Project Timeline.pptx",
    path: "Work/Projects/Q2",
    storage: "OneDrive",
    size: "3.7 MB",
    modified: "2 days ago",
    status: "Synced",
    details: {},
  },
];

const CloudConnectionPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<CloudService | null>(
    null
  );
  const [currentPath, setCurrentPath] = useState(
    "My Drive/Important Documents/2023"
  );
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [pinningFile, setPinningFile] = useState<FileItem | null>(null);
  const [pinnedFiles, setPinnedFiles] = useState<PinnedFile[]>([]);
  const [cloudServices, setCloudServices] =
    useState<CloudService[]>(initialCloudServices);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleSelectService = (service: CloudService) => {
    setSelectedService(service);
  };

  const handleOpenFolder = (folder: FileItem) => {
    setCurrentPath(folder.path);
    setFiles([
      {
        type: "pdf",
        name: `${folder.name}_Sample.pdf`,
        details: "PDF • 1 MB • Jan 1, 2023",
        path: `${folder.path}/Sample.pdf`,
      },
    ]);
  };

  const handlePinFile = (file: FileItem) => {
    setPinningFile(file);
    setCurrentStep(3);
  };

  const handlePinConfirm = () => {
    if (pinningFile) {
      setPinnedFiles([
        ...pinnedFiles,
        {
          name: pinningFile.name,
          boards: ["Home Management", "Important Documents"],
        },
      ]);
      setPinningFile(null);
      setCurrentStep(4);
    }
  };

  const handleConnectService = () => {
    if (selectedService) {
      setCloudServices(
        cloudServices.map((s) =>
          s.name === selectedService.name
            ? {
                ...s,
                connected: true,
                email: "user@example.com",
                totalStorage: "15 GB",
                usedPercentage: 75,
                files: 2458,
                folders: 146,
                shared: 63,
              }
            : s
        )
      );
      setCurrentStep(2);
    }
  };

  const handleConnectAnother = () => {
    setCurrentStep(0);
    setSelectedService(null);
    setCurrentPath("My Drive/Important Documents/2023");
    setFiles(initialFiles);
    setPinningFile(null);
  };

  const renderWizardContent = () => {
    switch (currentStep) {
      case 0: // Select Storage
        return (
          <div style={{ padding: "20px" }}>
            <Title level={4}>Connect a New Storage Service</Title>
            <Text
              style={{
                display: "block",
                marginBottom: "20px",
                color: "#8c8c8c",
              }}
            >
              Access and organize your files without moving them.
            </Text>
            <Card style={{ marginBottom: "20px", textAlign: "left" }}>
              <Space>
                <span style={{ fontSize: "24px" }}>🔒</span>
                <Text>Your files stay where they are.</Text>
              </Space>
            </Card>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={cloudServices}
              renderItem={(item) => (
                <List.Item>
                  <Card
                    hoverable
                    style={{
                      border:
                        selectedService?.name === item.name
                          ? "2px solid #1890ff"
                          : "1px solid #d9d9d9",
                    }}
                    onClick={() => handleSelectService(item)}
                  >
                    <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                      {item.icon}
                    </div>
                    <Text strong>{item.name}</Text>
                    <Text style={{ display: "block", color: "#8c8c8c" }}>
                      {item.description}
                    </Text>
                    <div style={{ marginTop: "10px" }}>
                      <Tag color={item.connected ? "green" : "default"}>
                        {item.connected ? "Active" : "Not Connected"}
                      </Tag>
                    </div>
                    <Button
                      type="link"
                      style={{ marginTop: "10px" }}
                      onClick={() => handleSelectService(item)}
                    >
                      Connect
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        );

      case 1: // Connect
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <Title level={3}>Connect to {selectedService?.name}</Title>
            <Text style={{ display: "block", marginBottom: "20px" }}>
              Dockly will connect to your {selectedService?.name} to organize
              files.
            </Text>
            <Card
              style={{
                margin: "20px auto",
                maxWidth: "600px",
                textAlign: "left",
              }}
            >
              <Title level={5}>Dockly will be able to:</Title>
              <List
                dataSource={[
                  `View and list files in your ${selectedService?.name}`,
                  "Download files when accessed",
                  "Create reference links to your files",
                  "Dockly cannot delete or modify your files",
                  "Dockly does not store copies of your files",
                ]}
                renderItem={(item, index) => (
                  <List.Item>
                    <span style={{ marginRight: "10px" }}>
                      {index < 3 ? "✓" : "✗"}
                    </span>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        );

      case 2: // Browse Files
        return (
          <div style={{ padding: "20px" }}>
            <Title level={3}>Browse {selectedService?.name} Files</Title>
            <Text style={{ display: "block", marginBottom: "20px" }}>
              Find and pin important documents.
            </Text>
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              style={{ marginBottom: "20px", maxWidth: "300px" }}
            />
            <Text style={{ display: "block", marginBottom: "10px" }}>
              {currentPath}
            </Text>
            <Card>
              <List
                header={<Text strong>Name ↑</Text>}
                dataSource={files}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() =>
                          item.type === "folder"
                            ? handleOpenFolder(item)
                            : handlePinFile(item)
                        }
                      >
                        {item.type === "folder" ? "Open" : "Pin to Dockly"}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        item.type === "folder" ? (
                          <FolderOutlined style={{ fontSize: "24px" }} />
                        ) : item.type === "pdf" ? (
                          <FilePdfOutlined style={{ fontSize: "24px" }} />
                        ) : item.type === "image" ? (
                          <FileImageOutlined style={{ fontSize: "24px" }} />
                        ) : (
                          <CloudOutlined style={{ fontSize: "24px" }} />
                        )
                      }
                      title={item.name}
                      description={item.details}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        );

      case 3: // Pin Details
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <Title level={3}>Pinning: {pinningFile?.name}</Title>
            <Text style={{ display: "block", marginBottom: "20px" }}>
              Add details to organize this document.
            </Text>
            <Card
              style={{
                margin: "20px auto",
                maxWidth: "600px",
                textAlign: "left",
              }}
            >
              {pinningFile?.type === "pdf" ? (
                <FilePdfOutlined
                  style={{ fontSize: "48px", marginBottom: "20px" }}
                />
              ) : (
                <FileImageOutlined
                  style={{ fontSize: "48px", marginBottom: "20px" }}
                />
              )}
              <List
                dataSource={[
                  { label: "Source", value: pinningFile?.path },
                  {
                    label: "Type",
                    value:
                      pinningFile?.type === "pdf" ? "PDF Document" : "Image",
                  },
                  {
                    label: "Size",
                    value:
                      pinningFile?.details.split("•")[1]?.trim() || "Unknown",
                  },
                  {
                    label: "Modified",
                    value:
                      pinningFile?.details.split("•")[2]?.trim() || "Unknown",
                  },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text strong style={{ width: "100px" }}>
                      {item.label}
                    </Text>
                    <Text>{item.value}</Text>
                  </List.Item>
                )}
              />
              <Divider />
              <Text strong>Display Name</Text>
              <Input
                defaultValue={pinningFile?.name}
                style={{ margin: "10px 0" }}
              />
              <Text strong>Description (optional)</Text>
              <Input.TextArea
                defaultValue={`Document: ${pinningFile?.name}`}
                style={{ margin: "10px 0" }}
              />
              <Text strong>Tags (optional)</Text>
              <div style={{ margin: "10px 0" }}>
                {["home", "legal", "important"].map((tag) => (
                  <Tag key={tag} closable>
                    {tag}
                  </Tag>
                ))}
              </div>
              <Text strong>Pin to Boards</Text>
              <div style={{ margin: "10px 0" }}>
                {[
                  "Home Management",
                  "Family Hub",
                  "Important Documents",
                  "Finance",
                ].map((board) => (
                  <Checkbox
                    key={board}
                    defaultChecked={[
                      "Home Management",
                      "Important Documents",
                    ].includes(board)}
                    style={{ display: "block", margin: "5px 0" }}
                  >
                    {board}
                  </Checkbox>
                ))}
              </div>
            </Card>
          </div>
        );

      case 4: // Complete
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <Title level={3}>Storage Successfully Connected!</Title>
            <Text style={{ display: "block", marginBottom: "20px" }}>
              You can now pin documents to your boards.
            </Text>
            <Card
              style={{
                margin: "20px auto",
                maxWidth: "600px",
                textAlign: "left",
              }}
            >
              <Title level={5}>Connected Storage Services</Title>
              <List
                grid={{ gutter: 16, xs: 1, sm: 3 }}
                dataSource={cloudServices.filter((s) => s.connected)}
                renderItem={(item) => (
                  <List.Item>
                    <Card>
                      <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                        {item.icon}
                      </div>
                      <Text>{item.name}</Text>
                    </Card>
                  </List.Item>
                )}
              />
              <Divider />
              <Title level={5}>Pinned Documents</Title>
              <List
                dataSource={pinnedFiles}
                renderItem={(item) => (
                  <List.Item>
                    <Text>
                      • {item.name} (pinned to {item.boards.join(", ")})
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
            <Space style={{ marginTop: "20px" }}>
              <Button type="link" onClick={() => setCurrentStep(2)}>
                📎 Pin more documents
              </Button>
              <Button type="link">👨‍👩‍👧 Set up family sharing</Button>
              <Button type="link">📝 Customize your boards</Button>
            </Space>
          </div>
        );

      default:
        return null;
    }
  };

  const CloudStorageDashboard: React.FC = () => {
    const columns = [
      { title: "File Name", dataIndex: "name", key: "name" },
      { title: "Storage", dataIndex: "path", key: "path" },
      { title: "Service", dataIndex: "storage", key: "storage" },
      { title: "Size", dataIndex: "size", key: "size" },
      { title: "Modified", dataIndex: "modified", key: "modified" },
      { title: "Status", dataIndex: "status", key: "status" },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: FileItem) => (
          <Button type="link" onClick={() => alert(`Opening ${record.name}`)}>
            Open
          </Button>
        ),
      },
    ];

    return (
      <div style={{ padding: "20px", maxWidth: "1200px",margin: "80px 10px 10px 60px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Dockly Cloud Storage
        </Title>
        <Card style={{ marginBottom: "20px" }}>
          <Title level={4}>Connected Cloud Storage</Title>
          <Space style={{ marginBottom: "20px" }}>
            <Text>Total Storage: 7.8 TB</Text>
            <Progress percent={41} size="small" style={{ width: "200px" }} />
            <Text>Used: 3.2 TB (41%)</Text>
          </Space>
          <Space style={{ marginBottom: "20px" }}>
            <Text>
              Connected Accounts:{" "}
              {cloudServices.filter((s) => s.connected).length}
            </Text>
            <Text>Files Synced: 4,328</Text>
            <Text>Last Sync: Today, 10:23 AM</Text>
          </Space>
        </Card>
        <Card style={{ marginBottom: "20px" }}>
          <Title level={4}>Connected Storage Services</Title>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={cloudServices.filter((s) => s.connected)}
            renderItem={(item) => (
              <List.Item>
                <Card>
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                    {item.icon}
                  </div>
                  <Text strong>{item.name}</Text>
                  <Text style={{ display: "block" }}>{item.email}</Text>
                  <Tag color="green">Active</Tag>
                  <div style={{ marginTop: "10px" }}>
                    <Text>
                      {item.totalStorage} Total, {item.usedPercentage}% Used
                    </Text>
                    <Progress percent={item.usedPercentage} size="small" />
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <Text>Files: {item.files}</Text>
                    <Text style={{ marginLeft: "10px" }}>
                      Folders: {item.folders}
                    </Text>
                    <Text style={{ marginLeft: "10px" }}>
                      Shared: {item.shared}
                    </Text>
                  </div>
                  <Button
                    type="link"
                    style={{ marginTop: "10px" }}
                    onClick={() => setCurrentStep(2)}
                  >
                    View Files
                  </Button>
                </Card>
              </List.Item>
            )}
          />
          <Button
            type="primary"
            style={{ marginTop: "20px" }}
            onClick={handleConnectAnother}
          >
            Connect New
          </Button>
        </Card>
        <Card style={{ marginBottom: "20px" }}>
          <Title level={4}>Recently Synced Files</Title>
          <Table
            columns={columns}
            // dataSource={recentFiles}
            pagination={false}
            rowKey="name"
          />
          <Button type="link" style={{ marginTop: "10px" }}>
            View All
          </Button>
        </Card>
        <Card>
          <Title level={4}>Storage Usage by Type</Title>
          <List
            dataSource={[
              { type: "Documents", percentage: 25, size: "800 GB" },
              { type: "Photos", percentage: 10, size: "320 GB" },
              { type: "Videos", percentage: 15, size: "480 GB" },
              { type: "Audio", percentage: 8, size: "256 GB" },
              { type: "Archives", percentage: 5, size: "160 GB" },
              { type: "Other", percentage: 12, size: "384 GB" },
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text>
                  {item.type}: {item.percentage}% - {item.size}
                </Text>
                <Progress
                  percent={item.percentage}
                  size="small"
                  style={{ width: "200px", marginLeft: "10px" }}
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    );
  };

  if (showDashboard) {
    return <CloudStorageDashboard />;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "40px 10px 10px 60px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
        Dockly
      </Title>
      <Steps
        current={currentStep}
        style={{ marginBottom: "20px", cursor: "default" }}
        onChange={undefined}
      >
        <Step title="Select Storage" style={{ cursor: "default" }} />
        <Step title="Connect" style={{ cursor: "default" }} />
        <Step title="Browse Files" style={{ cursor: "default" }} />
        <Step title="Complete" style={{ cursor: "default" }} />
      </Steps>
      {renderWizardContent()}
      <Row justify="space-between" style={{ marginTop: "20px" }}>
        <Col>
          {currentStep > 0 && (
            <Button
              onClick={() => {
                if (currentStep === 3) setPinningFile(null);
                setCurrentStep(currentStep - 1);
              }}
            >
              {currentStep === 3 ? "Cancel" : "Back"}
            </Button>
          )}
          {currentStep === 0 && (
            <Button onClick={() => setShowDashboard(true)}>
              Back to Dashboard
            </Button>
          )}
        </Col>
        <Col>
          {currentStep < 4 && (
            <Button
              type="primary"
              disabled={currentStep === 0 && !selectedService}
              onClick={() => {
                if (currentStep === 1) {
                  handleConnectService();
                } else if (currentStep === 3) {
                  handlePinConfirm();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              {currentStep === 0
                ? "Continue"
                : currentStep === 1
                ? `Connect ${selectedService?.name || "Service"}`
                : currentStep === 2
                ? "Skip File Selection"
                : "Pin Document"}
            </Button>
          )}
          {currentStep === 4 && (
            <Space>
              <Button type="primary" onClick={handleConnectAnother}>
                Connect Another Service
              </Button>
              <Button type="primary" onClick={() => setShowDashboard(true)}>
                Return to Dashboard
              </Button>
            </Space>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CloudConnectionPage;
