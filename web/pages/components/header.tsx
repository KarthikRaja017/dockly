"use client";
import React, { useEffect, useState } from "react";
import {
  Input,
  Avatar,
  Tooltip,
  Button,
  Switch,
  Space,
  Select,
  Typography,
  Modal,
  List,
  Segmented,
  Dropdown,
  Card,
} from "antd";
import {
  PlusOutlined,
  LinkOutlined,
  BookOutlined,
  SearchOutlined,
  FileTextOutlined,
  InboxOutlined,
  GoogleOutlined,
  WindowsOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ToolOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CloseOutlined,
  ChromeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../app/userContext";
import { ACTIVE_BG_COLOR, capitalizeEachWord, DEFAULT_TEXT_COLOR, PRIMARY_COLOR } from "../../app/comman";

interface ConnectionStatus {
  apple: boolean;
  outlook: boolean;
  google: boolean;
}
export function trimGooglePhotoUrl(url: string): string {
  const index = url.indexOf('=');
  const baseUrl = index !== -1 ? url.substring(0, index) : url;
  return `${baseUrl}=s4000`;
}
const CustomHeader = ({
  isHovered,
  collapsed,
  setCollapsed,
  setHidden,
  hidden,
  count,
}: {
  isHovered: boolean;
  collapsed: boolean;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  setCollapsed: (collapsed: boolean) => void;
  count: number;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleG, setVisibleG] = useState(false);
  const [visibleB, setVisibleB] = useState(false);
  const [image, setImage] = useState<string>("");
  const [name, setName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const currentUser = useCurrentUser();

  const initials = userName ? userName.slice(0, 2).toUpperCase() : "DU";


  const trimmedUrl = trimGooglePhotoUrl(image);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userObj = user ? JSON.parse(user) : null;
    setImage(userObj?.picture || "");
    setName(userObj?.name || null);
    setUserName(currentUser?.user_name || userObj?.username || null);
  }, [currentUser]);

  const actions = [
    { Icon: PlusOutlined, title: "Connect", onClick: () => setVisibleG(true) },
    { Icon: FileTextOutlined, title: "Notes", onClick: () => setIsOpen(true) },
    { Icon: LinkOutlined, title: "Drag & Drop", onClick: () => setVisible(true) },
    { Icon: BookOutlined, title: "Bookmarks", onClick: () => setVisibleB(true) },
  ];

  const handleToggleSidebar = () => {
    if (!collapsed && !hidden) {
      // Currently expanded → collapse
      setCollapsed(true);
    } else if (collapsed && !hidden) {
      // Currently collapsed → hide
      setHidden(true);
    } else if (hidden) {
      // Currently hidden → show & expand
      setHidden(false);
      setCollapsed(false);
    }
  };

  const getToggleIcon = (collapsed: boolean, hidden: boolean) => {
    if (hidden) return <MenuUnfoldOutlined />; // Hidden state
    return collapsed ? <CloseOutlined /> : <MenuFoldOutlined />;
  };

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined style={{ fontSize: 14, color: "#007B8F" }} />,
        label: <div style={{ fontSize: "14px", padding: "2px", fontWeight: 500 }}>Profile</div>,
        onClick: () => router.push(`/${userName}/profile`),
      },
      {
        key: "settings",
        icon: <SettingOutlined style={{ fontSize: 14, color: "#007B8F" }} />,
        label: <div style={{ fontSize: "14px", padding: "2px", fontWeight: 500 }}>Settings</div>,
        onClick: () => router.push(`/${userName}/settings`),
      },
      {
        key: "logout",
        icon: <LogoutOutlined style={{ fontSize: 14, color: "#d9363e" }} />,
        label: <div style={{ fontSize: "14px", padding: "2px", fontWeight: 500, color: "#d9363e" }}>Logout</div>,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") {
        localStorage.clear();
        window.location.reload(); // You can also redirect to login page if needed
        // router.push("/login"); // optional redirect
      }
    },
  };
  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      <style jsx>{`
        @keyframes logo-collapsed {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .logo-collapsed {
          animation: logo-collapsed 8s linear infinite;
          transform-origin: center;
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          backgroundColor: "#f9fafa",
          marginLeft: hidden ? 0 : isHovered ? 200 : 80,
          transition: "margin-left 0.3s ease, padding 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
          <Button
            type="text"
            icon={getToggleIcon(collapsed, hidden)}
            onClick={handleToggleSidebar}
            style={{
              fontSize: "20px",
              width: 48,
              height: 48,
              marginLeft: hidden ? '-15px' : "-25px",
            }}
          />
          {hidden && (
            // <img
            //   src="/dockly-logo-full.png"
            //   alt="Logo"
            //   style={{
            // width: "150px",
            // marginLeft: "-30px",
            // marginTop: "-40px",
            // marginBottom: "-40px",
            // marginRight: "-40px",
            //   }}
            // />
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={"/dockly-logo.png"}
                alt="Dockly Logo"
                className={"logo-collapsed"}
                style={{
                  width: "150px",
                  marginLeft: "-75px",
                  marginTop: "-40px",
                  marginBottom: "-40px",
                  // marginRight: "-40px",
                }}
              />
              <Text
                style={{
                  color: PRIMARY_COLOR,
                  marginLeft: '-50px',
                  marginTop: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                DOCKLY
              </Text>
            </div>
          )}
        </div>

        <Input
          prefix={<SearchOutlined style={{ color: "#007B8F" }} />}
          placeholder="Search accounts, files, notes - Ask Dockly AI"
          style={{
            maxWidth: 500,
            width: "100%",
            borderRadius: "6px",
            borderColor: "#d9d9d9",
            padding: "10px 20px",
            fontSize: "14px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* {actions.map(({ Icon, title, onClick }, i) => (
            <Tooltip title={title} key={i}>
              <div
                onClick={onClick}
                style={{
                  backgroundColor: "#e6f7ff",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#bae7ff")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e6f7ff")}
              >
                <Icon style={{ color: "#007B8F", fontSize: "18px" }} />
              </div>
            </Tooltip>
          ))} */}

          <NotificationBell count={count} onClick={() => console.log("Bell clicked")} />
          <div onClick={showModal} style={{ cursor: "pointer" }}>
            <CatppuccinFolderConnection />
          </div>
          <Dropdown
            menu={userMenu}
            trigger={["click"]}
            placement="bottomRight"
            arrow
            popupRender={(menu) => (
              <div style={{ minWidth: 200, padding: "10px 0", backgroundColor: "white", borderRadius: 10 }}>
                {menu}
              </div>
            )}
          >
            <div style={{ cursor: "pointer", display: "flex", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>Welcome Back!</div>
                <div style={{ color: "#007B8F", fontSize: "14px" }}>
                  {userName
                    ? capitalizeEachWord(userName)
                    : "Dockly User"}
                </div>
              </div>
              {image ? (
                <Avatar
                  src={trimmedUrl}
                  size={40}
                  style={{ cursor: "pointer", border: `2px solid ${DEFAULT_TEXT_COLOR}` }}
                />
              ) : (
                <Avatar
                  style={{
                    backgroundColor: ACTIVE_BG_COLOR,
                    // backgroundColor: "#007B8F",
                    // backgroundColor: PRIMARY_COLOR,
                    // color: "white",
                    color: DEFAULT_TEXT_COLOR,
                    border: `2px solid ${PRIMARY_COLOR}`,
                    fontSize: "bold",

                  }}
                >
                  <strong>{initials}</strong>
                </Avatar>
              )}
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Functional modals */}
      <StickyNotes isOpen={isOpen} setIsOpen={setIsOpen} />
      <UploadModal visible={visible} setVisible={setVisible} />
      <AddAccountModal visible={visibleG} setVisible={setVisibleG} />
      <BookmarksModal visible={visibleB} setVisible={setVisibleB} />
      <FolderConnectionModal setIsModalVisible={setIsModalVisible} isModalVisible={isModalVisible} />
    </>
  );
};

export default CustomHeader;

const { TextArea } = Input;
const { Title } = Typography;

const NotesDropdown = (props: any) => {
  const { isOpen, setIsOpen } = props;
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(false);
  const [reminderType, setReminderType] = useState("Notification");
  const [reminderTime, setReminderTime] = useState(30);
  const [reminderUnit, setReminderUnit] = useState("Minutes");

  const handleAddNote = () => {
    setTitle("");
    setNotes("");
    setReminder(false);
    setIsOpen(false);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
      centered
      width={600}
    >
      <Title level={4} style={{ marginBottom: 16 }}>
        Add Notes
      </Title>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Title</label>
        <Input
          placeholder="Add Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ borderColor: "#08979c" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Notes</label>
        <TextArea
          placeholder="😊 Type here..."
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ borderColor: "#08979c" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 18 }}>✏️ 🔒 ↩️</div>
        <Button
          type="primary"
          style={{ backgroundColor: "#08979c", borderColor: "#08979c" }}
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span>Set reminder</span>
        <Switch
          checked={reminder}
          onChange={setReminder}
          style={{ backgroundColor: reminder ? "#08979c" : undefined }}
        />
      </div>

      {reminder && (
        <Space style={{ marginBottom: 8 }} wrap>
          <Select
            value={reminderType}
            onChange={setReminderType}
            style={{ width: 130 }}
            options={[
              { label: "Notification", value: "Notification" },
              { label: "Email", value: "Email" },
            ]}
          />
          <Input
            type="number"
            value={reminderTime}
            onChange={(e) => setReminderTime(Number(e.target.value))}
            style={{ width: 80, textAlign: "center" }}
          />
          <Select
            value={reminderUnit}
            onChange={setReminderUnit}
            style={{ width: 110 }}
            options={[
              { label: "Minutes", value: "Minutes" },
              { label: "Hours", value: "Hours" },
            ]}
          />
        </Space>
      )}
    </Modal>
  );
};
import { Upload } from 'antd';
import StickyNotes from "../notes/notescard";
import NotificationBell from "./notificationicon";
import { CatppuccinFolderConnection } from "./icons";
import { Apple, Check, FolderOpen, Mail } from "lucide-react";
import FolderConnectionModal from "./connect";
const { Text } = Typography;

// Add prop types for FolderConnectionModal


const UploadModal = (props: any) => {
  const { visible, setVisible } = props;

  const [category, setCategory] = useState<string | undefined>(undefined);

  const handleUpload = (info: any) => {
    const isDocOrPdf =
      info.file.type === "application/pdf" ||
      info.file.name.endsWith(".doc") ||
      info.file.name.endsWith(".docx");

    // if (!isDocOrPdf) {
    //   message.error("You can only upload .doc or .pdf files!");
    //   return;
    // }

    // message.success(`${info.file.name} file uploaded successfully.`);
  };

  return (
    <>
      {/* <Button type="primary" onClick={() => setVisible(true)}>
        Upload File
      </Button> */}

      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        centered
        width={500}
        style={{ borderRadius: 12 }}
      >
        <div style={{ padding: 8 }}>
          <Typography.Title level={5}>Upload</Typography.Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Make sure the file format meets the requirements. It must be{" "}
            <b>.doc</b> or <b>.pdf</b>
          </Text>


          <Space direction="vertical" style={{ width: "100%" }}>
            <Select
              placeholder="Select category"
              onChange={setCategory}
              style={{ width: "100%" }}
              options={[
                { label: "Home", value: "home" },
                { label: "Family Hub", value: "family-hub" },
                { label: "Finance", value: "finance" },
                { label: "Health", value: "health" },
                { label: "Projects", value: "projects" },
              ]}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 16,
              }}
            >
              <Button onClick={() => setVisible(false)}>Cancel</Button>
              <Button type="primary" disabled={!category}>
                Submit
              </Button>
            </div>
          </Space>
        </div>
      </Modal>
    </>
  );
};

const AddAccountModal = (props: any) => {
  const { visible, setVisible } = props;
  const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 20px",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    width: "100%",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#fff",
    fontWeight: 500,
    fontSize: 16,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 22,
  };

  const hoverEffect: React.CSSProperties = {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    transform: "translateY(-2px)",
  };

  const accounts = [
    {
      label: "Google Account",
      icon: <GoogleOutlined style={{ ...iconStyle, color: "#DB4437" }} />,
    },
    {
      label: "Microsoft",
      icon: <WindowsOutlined style={{ ...iconStyle, color: "#0078D4" }} />,
    },
    // {
    //   label: "Box",
    //   icon: <SiBox style={{ ...iconStyle, color: "#0061D5" }} />,
    // },
    // {
    //   label: "Trello",
    //   icon: <SiTrello style={{ ...iconStyle, color: "#0079BF" }} />,
    // },
    // {
    //   label: "Dropbox",
    //   icon: <DropboxOutlined style={{ ...iconStyle, color: "#0061FF" }} />,
    // },
  ];

  return (
    <>
      {/* <Button type="primary" onClick={() => setVisible(true)}>
        Add Account
      </Button> */}

      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        centered
        width={400}
        style={{ borderRadius: 12 }}
      >
        <div style={{ padding: 16 }}>
          <Typography.Title level={5}>Add Account</Typography.Title>
          <Typography.Text type="secondary">
            Choose as many accounts as you wish for a smooth access
          </Typography.Text>

          <Space
            direction="vertical"
            size="middle"
            style={{ marginTop: 24, width: "90%" }}
          >
            {accounts.map((acc, index) => (
              <div
                key={index}
                style={cardStyle}
                onMouseEnter={(e) =>
                  Object.assign(e.currentTarget.style, hoverEffect)
                }
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, cardStyle)
                }
              >
                {acc.icon}
                {acc.label}
              </div>
            ))}
          </Space>
        </div>
      </Modal>
    </>
  );
};

const BookmarksModal = (props: any) => {
  const { visible, setVisible } = props;

  // const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState("Bookmarks");

  const bookmarks = [
    {
      title: "Wait But Why",
      url: "http://www.khanacademy.org",
    },
    {
      title: "99% Invisible",
      url: "http://www.ted.com/talks",
    },
    {
      title: "Brain Pickings",
      url: "http://www.wikipedia.org",
    },
    {
      title: "The School of Life",
      url: "http://coolors.co",
    },
  ];

  return (
    <>
      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        centered
        width={420}
        style={{ borderRadius: 12 }}
      >
        <div style={{ padding: 20 }}>
          <Segmented
            block
            options={["Bookmarks", "Recently closed"]}
            value={tab}
            onChange={(val) => setTab(val as string)}
            style={{
              marginBottom: 20,
              borderRadius: 6,
              fontWeight: 500,
            }}
          />

          {tab === "Bookmarks" ? (
            <>
              <Select
                defaultValue="All bookmarks"
                style={{ width: "100%", marginBottom: 20 }}
                suffixIcon={<FolderOpenOutlined />}
                options={[{ value: "all", label: "All bookmarks" }]}
              />

              <List
                itemLayout="horizontal"
                dataSource={bookmarks}
                renderItem={(item) => (
                  <List.Item style={{ padding: "10px 0" }}>
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            background: "#F0F2F5",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <BookOutlined style={{ color: "#1890FF" }} />
                        </div>
                      }
                      title={<a href={item.url}>{item.title}</a>}
                      description={<Text type="secondary">{item.url}</Text>}
                    />
                  </List.Item>
                )}
              />

              <Button
                type="primary"
                block
                style={{ marginTop: 24, borderRadius: 6 }}
              >
                Open Bookmarks
              </Button>
            </>
          ) : (
            <div
              style={{
                height: 150,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#999",
              }}
            >
              No recently closed tabs
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
