"use client";
import React, { useEffect, useState } from "react";
import {
  Input,
  Avatar,
  Tooltip,
  Button,
  Typography,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../app/userContext";
import { capitalizeEachWord, PRIMARY_COLOR } from "../../app/comman";
import NotificationBell from "./notificationicon";
import { CatppuccinFolderConnection } from "./icons";
import FolderConnectionModal from "./connect";

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const { Text } = Typography;

export function trimGooglePhotoUrl(url: string): string {
  const index = url.indexOf('=');
  const baseUrl = index !== -1 ? url.substring(0, index) : url;
  return `${baseUrl}=s4000`;
}

// Enhanced styles with animations
const headerStyles = `
  @keyframes logo-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes avatar-glow {
    0%, 100% { box-shadow: 0 0 0 0 ${PRIMARY_COLOR}40; }
    50% { box-shadow: 0 0 0 8px ${PRIMARY_COLOR}10; }
  }
  
  @keyframes search-focus {
    0% { transform: scale(1); }
    100% { transform: scale(1.02); }
  }
  
  @keyframes button-hover {
    0% { transform: translateY(0); }
    100% { transform: translateY(-2px); }
  }
  
  @keyframes notification-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  .logo-spin { 
    animation: logo-spin 8s linear infinite; 
    transition: all 0.3s ease;
  }
  
  .avatar-glow { 
    animation: avatar-glow 2s ease-in-out infinite; 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .search-focus { 
    animation: search-focus 0.2s ease-in-out; 
  }
  
  .button-hover { 
    animation: button-hover 0.3s ease-in-out; 
  }
  
  .notification-pulse {
    animation: notification-pulse 0.3s ease-in-out;
  }
  
  .header-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .action-button {
    background: ${PRIMARY_COLOR}12;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
  }
  
  .action-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${PRIMARY_COLOR}20, transparent);
    transition: left 0.5s;
  }
  
  .action-button:hover::before {
    left: 100%;
  }
  
  .action-button:hover {
    background: ${PRIMARY_COLOR}20;
    border-color: ${PRIMARY_COLOR}30;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${PRIMARY_COLOR}25;
  }
  
  .user-info {
    transition: all 0.3s ease;
    padding: 8px 12px;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }
  
  .user-info::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${PRIMARY_COLOR}08, transparent);
    transition: left 0.5s;
  }
  
  .user-info:hover::before {
    left: 100%;
  }
  
  .user-info:hover {
    background: ${PRIMARY_COLOR}08;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${PRIMARY_COLOR}15;
  }
  
  .search-container {
    position: relative;
    overflow: hidden;
  }
  
  .search-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${PRIMARY_COLOR}10, transparent);
    transition: left 0.6s;
    pointer-events: none;
  }
  
  .search-container:focus-within::after {
    left: 100%;
  }
`;

const CustomHeader: React.FC<{
  isHovered: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setHidden: (hidden: boolean) => void;
  hidden: boolean;
  count: number;
}> = ({ isHovered, collapsed, setCollapsed, setHidden, hidden, count }) => {
  const router = useRouter();
  const currentUser = useCurrentUser();

  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState({
    image: "",
    name: null as string | null,
    userName: null as string | null,
  });
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = user.userName ? user.userName.slice(0, 2).toUpperCase() : "DU";
  const trimmedUrl = trimGooglePhotoUrl(user.image);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const userObj = userData ? JSON.parse(userData) : null;
    setUser({
      image: userObj?.picture || "",
      name: userObj?.name || null,
      userName: currentUser?.user_name || userObj?.username || null,
    });
  }, [currentUser]);

  // Sidebar toggle logic
  const handleToggleSidebar = () => {
    if (!collapsed && !hidden) {
      setCollapsed(true);
    } else if (collapsed && !hidden) {
      setHidden(true);
    } else if (hidden) {
      setHidden(false);
      setCollapsed(false);
    }
  };

  const getToggleIcon = (collapsed: boolean, hidden: boolean) => {
    if (hidden) return <MenuUnfoldOutlined />;
    return collapsed ? <CloseOutlined /> : <MenuFoldOutlined />;
  };

  // User menu configuration
  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined style={{ fontSize: 14, color: PRIMARY_COLOR }} />,
        label: (
          <div style={{
            fontSize: "14px",
            padding: "4px 8px",
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
            transition: "all 0.2s ease"
          }}>
            Profile
          </div>
        ),
        onClick: () => router.push(`/${user.userName}/profile`),
      },
      {
        key: "settings",
        icon: <SettingOutlined style={{ fontSize: 14, color: PRIMARY_COLOR }} />,
        label: (
          <div style={{
            fontSize: "14px",
            padding: "4px 8px",
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
            transition: "all 0.2s ease"
          }}>
            Settings
          </div>
        ),
        onClick: () => router.push(`/${user.userName}/settings`),
      },
      {
        key: "logout",
        icon: <LogoutOutlined style={{ fontSize: 14, color: "#ff4d4f" }} />,
        label: (
          <div style={{
            fontSize: "14px",
            padding: "4px 8px",
            fontWeight: 500,
            color: "#ff4d4f",
            fontFamily: FONT_FAMILY,
            transition: "all 0.2s ease"
          }}>
            Logout
          </div>
        ),
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "logout") {
        localStorage.clear();
        window.location.reload();
      }
    },
  };

  return (
    <>
      <style jsx>{headerStyles}</style>

      {/* Header Container */}
      <div
        className="header-transition"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 24px",
          backgroundColor: "#fafafa",
          // borderBottom: `1px solid ${PRIMARY_COLOR}15`,
          // boxShadow: `0 2px 8px ${PRIMARY_COLOR}08`,
          backdropFilter: "blur(12px)",
          marginLeft: hidden ? 0 : isHovered ? 200 : 80,
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* Left Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Button
            type="text"
            icon={getToggleIcon(collapsed, hidden)}
            onClick={handleToggleSidebar}
            className="button-hover"
            style={{
              fontSize: "18px",
              width: 44,
              height: 44,
              marginLeft: hidden ? '-12px' : "-20px",
              color: PRIMARY_COLOR,
              borderRadius: "50%",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: FONT_FAMILY,
            }}
          />

          {hidden && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/dockly-logo.png"
                alt="Dockly Logo"
                className="logo-spin"
                style={{
                  width: "140px",
                  marginLeft: "-65px",
                  marginTop: "-35px",
                  marginBottom: "-35px",
                }}
              />
              <Text
                style={{
                  color: PRIMARY_COLOR,
                  marginLeft: '-45px',
                  fontSize: '17px',
                  fontWeight: 700,
                  letterSpacing: '0.3px',
                  fontFamily: FONT_FAMILY,
                  textShadow: `0 2px 4px ${PRIMARY_COLOR}20`,
                }}
              >
                DOCKLY
              </Text>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className="search-container" style={{ maxWidth: 480, width: "100%" }}>
          <Input
            prefix={<SearchOutlined style={{ color: PRIMARY_COLOR, fontSize: "16px" }} />}
            placeholder="Search accounts, files, notes - Ask Dockly AI"
            className={searchFocused ? "search-focus" : ""}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: "100%",
              borderRadius: "12px",
              borderColor: searchFocused ? PRIMARY_COLOR : "#e0e0e0",
              padding: "12px 16px",
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              boxShadow: searchFocused ? `0 0 0 3px ${PRIMARY_COLOR}15` : "none",
              background: "#ffffff",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="notification-pulse">
            <NotificationBell
              count={count}
              onClick={() => console.log("Bell clicked")}
            />
          </div>

          <Tooltip title="Folder Connections" placement="bottom">
            <div
              className="action-button"
              onClick={() => setIsModalVisible(true)}
            >
              <CatppuccinFolderConnection />
            </div>
          </Tooltip>

          <Dropdown
            menu={userMenu}
            trigger={["click"]}
            placement="bottomRight"
            arrow
            popupRender={(menu) => (
              <div style={{
                minWidth: 200,
                padding: "8px",
                backgroundColor: "transparent",
                borderRadius: 12,
                // boxShadow: `0 8px 24px ${PRIMARY_COLOR}20`,
                fontFamily: FONT_FAMILY,
                // border: `1px solid ${PRIMARY_COLOR}10`,
              }}>
                {menu}
              </div>
            )}
          >
            <div className="user-info" style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  fontFamily: FONT_FAMILY,
                  color: "#666",
                  transition: "color 0.3s ease"
                }}>
                  Welcome Back!
                </div>
                <div style={{
                  color: PRIMARY_COLOR,
                  fontSize: "14px",
                  fontWeight: "600",
                  fontFamily: FONT_FAMILY,
                  transition: "all 0.3s ease"
                }}>
                  {user.userName ? capitalizeEachWord(user.userName) : "Dockly User"}
                </div>
              </div>

              {user.image ? (
                <Avatar
                  src={trimmedUrl}
                  size={42}
                  className="avatar-glow"
                  style={{
                    cursor: "pointer",
                    border: `2px solid ${PRIMARY_COLOR}`,
                    boxShadow: `0 2px 8px ${PRIMARY_COLOR}20`,
                  }}
                />
              ) : (
                <Avatar
                  className="avatar-glow"
                  size={42}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    fontFamily: FONT_FAMILY,
                    cursor: "pointer",
                    border: `2px solid ${PRIMARY_COLOR}30`,
                  }}
                >
                  {initials}
                </Avatar>
              )}
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Only FolderConnectionModal */}
      <FolderConnectionModal
        setIsModalVisible={setIsModalVisible}
        isModalVisible={isModalVisible}
      />
    </>
  );
};

export default CustomHeader;
// // Modal Components
// const NotesDropdown: React.FC<{ isOpen: boolean; setIsOpen: (open: boolean) => void }> = ({ isOpen, setIsOpen }) => {
//   const [formData, setFormData] = useState({
//     title: "",
//     notes: "",
//     reminder: false,
//     reminderType: "Notification",
//     reminderTime: 30,
//     reminderUnit: "Minutes",
//   });

//   const handleAddNote = () => {
//     setFormData({
//       title: "",
//       notes: "",
//       reminder: false,
//       reminderType: "Notification",
//       reminderTime: 30,
//       reminderUnit: "Minutes",
//     });
//     setIsOpen(false);
//   };

//   return (
//     <Modal
//       open={isOpen}
//       onCancel={() => setIsOpen(false)}
//       footer={null}
//       centered
//       width={580}
//       style={{ fontFamily: FONT_FAMILY }}
//     >
//       <Title level={4} style={{ marginBottom: 16, fontFamily: FONT_FAMILY }}>Add Notes</Title>

//       <Space direction="vertical" size="middle" style={{ width: "100%" }}>
//         <div>
//           <label style={{ display: "block", marginBottom: 6, fontFamily: FONT_FAMILY, fontWeight: 500 }}>Title</label>
//           <Input
//             placeholder="Add Title"
//             value={formData.title}
//             onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//             style={{ borderColor: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}
//           />
//         </div>

//         <div>
//           <label style={{ display: "block", marginBottom: 6, fontFamily: FONT_FAMILY, fontWeight: 500 }}>Notes</label>
//           <TextArea
//             placeholder="😊 Type here..."
//             rows={4}
//             value={formData.notes}
//             onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
//             style={{ borderColor: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}
//           />
//         </div>

//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ fontSize: 18 }}>✏️ 🔒 ↩️</div>
//           <Button
//             type="primary"
//             style={{
//               backgroundColor: PRIMARY_COLOR,
//               borderColor: PRIMARY_COLOR,
//               fontFamily: FONT_FAMILY,
//             }}
//             onClick={handleAddNote}
//           >
//             Add Note
//           </Button>
//         </div>

//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <span style={{ fontFamily: FONT_FAMILY }}>Set reminder</span>
//           <Switch
//             checked={formData.reminder}
//             onChange={(reminder) => setFormData(prev => ({ ...prev, reminder }))}
//             style={{ backgroundColor: formData.reminder ? PRIMARY_COLOR : undefined }}
//           />
//         </div>

//         {formData.reminder && (
//           <Space wrap>
//             <Select
//               value={formData.reminderType}
//               onChange={(reminderType) => setFormData(prev => ({ ...prev, reminderType }))}
//               style={{ width: 130 }}
//               options={[
//                 { label: "Notification", value: "Notification" },
//                 { label: "Email", value: "Email" },
//               ]}
//             />
//             <Input
//               type="number"
//               value={formData.reminderTime}
//               onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: Number(e.target.value) }))}
//               style={{ width: 80, textAlign: "center", fontFamily: FONT_FAMILY }}
//             />
//             <Select
//               value={formData.reminderUnit}
//               onChange={(reminderUnit) => setFormData(prev => ({ ...prev, reminderUnit }))}
//               style={{ width: 110 }}
//               options={[
//                 { label: "Minutes", value: "Minutes" },
//                 { label: "Hours", value: "Hours" },
//               ]}
//             />
//           </Space>
//         )}
//       </Space>
//     </Modal>
//   );
// };

// const UploadModal: React.FC<{ visible: boolean; setVisible: (visible: boolean) => void }> = ({ visible, setVisible }) => {
//   const [category, setCategory] = useState<string | undefined>(undefined);

//   return (
//     <Modal
//       open={visible}
//       onCancel={() => setVisible(false)}
//       footer={null}
//       centered
//       width={480}
//       style={{ borderRadius: 12, fontFamily: FONT_FAMILY }}
//     >
//       <div style={{ padding: 8 }}>
//         <Typography.Title level={5} style={{ fontFamily: FONT_FAMILY }}>Upload</Typography.Title>
//         <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16, fontFamily: FONT_FAMILY }}>
//           Make sure the file format meets the requirements. It must be <b>.doc</b> or <b>.pdf</b>
//         </Typography.Text>

//         <Space direction="vertical" style={{ width: "100%" }}>
//           <Select
//             placeholder="Select category"
//             onChange={setCategory}
//             style={{ width: "100%", fontFamily: FONT_FAMILY }}
//             options={[
//               { label: "Home", value: "home" },
//               { label: "Family Hub", value: "family-hub" },
//               { label: "Finance", value: "finance" },
//               { label: "Health", value: "health" },
//               { label: "Projects", value: "projects" },
//             ]}
//           />

//           <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
//             <Button onClick={() => setVisible(false)} style={{ fontFamily: FONT_FAMILY }}>Cancel</Button>
//             <Button
//               type="primary"
//               disabled={!category}
//               style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}
//             >
//               Submit
//             </Button>
//           </div>
//         </Space>
//       </div>
//     </Modal>
//   );
// };

// const AddAccountModal: React.FC<{ visible: boolean; setVisible: (visible: boolean) => void }> = ({ visible, setVisible }) => {
//   const accounts = [
//     {
//       label: "Google Account",
//       icon: <GoogleOutlined style={{ fontSize: 22, color: "#DB4437" }} />,
//     },
//     {
//       label: "Microsoft",
//       icon: <WindowsOutlined style={{ fontSize: 22, color: "#0078D4" }} />,
//     },
//   ];

//   return (
//     <Modal
//       open={visible}
//       onCancel={() => setVisible(false)}
//       footer={null}
//       centered
//       width={400}
//       style={{ borderRadius: 12, fontFamily: FONT_FAMILY }}
//     >
//       <div style={{ padding: 16 }}>
//         <Typography.Title level={5} style={{ fontFamily: FONT_FAMILY }}>Add Account</Typography.Title>
//         <Typography.Text type="secondary" style={{ fontFamily: FONT_FAMILY }}>
//           Choose as many accounts as you wish for a smooth access
//         </Typography.Text>

//         <Space direction="vertical" size="middle" style={{ marginTop: 24, width: "90%" }}>
//           {accounts.map((acc, index) => (
//             <div
//               key={index}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//                 padding: "16px 20px",
//                 border: `1px solid ${PRIMARY_COLOR}20`,
//                 borderRadius: 8,
//                 width: "100%",
//                 cursor: "pointer",
//                 transition: "all 0.3s ease",
//                 background: "#fff",
//                 fontWeight: 500,
//                 fontSize: 16,
//                 fontFamily: FONT_FAMILY,
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.boxShadow = `0 4px 12px ${PRIMARY_COLOR}15`;
//                 e.currentTarget.style.transform = "translateY(-2px)";
//                 e.currentTarget.style.borderColor = PRIMARY_COLOR;
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.boxShadow = "none";
//                 e.currentTarget.style.transform = "translateY(0)";
//                 e.currentTarget.style.borderColor = `${PRIMARY_COLOR}20`;
//               }}
//             >
//               {acc.icon}
//               {acc.label}
//             </div>
//           ))}
//         </Space>
//       </div>
//     </Modal>
//   );
// };

// const BookmarksModal: React.FC<{ visible: boolean; setVisible: (visible: boolean) => void }> = ({ visible, setVisible }) => {
//   const [tab, setTab] = useState("Bookmarks");

//   const bookmarks = [
//     { title: "Wait But Why", url: "http://www.khanacademy.org" },
//     { title: "99% Invisible", url: "http://www.ted.com/talks" },
//     { title: "Brain Pickings", url: "http://www.wikipedia.org" },
//     { title: "The School of Life", url: "http://coolors.co" },
//   ];

//   return (
//     <Modal
//       open={visible}
//       onCancel={() => setVisible(false)}
//       footer={null}
//       centered
//       width={420}
//       style={{ borderRadius: 12, fontFamily: FONT_FAMILY }}
//     >
//       <div style={{ padding: 20 }}>
//         <Segmented
//           block
//           options={["Bookmarks", "Recently closed"]}
//           value={tab}
//           onChange={(val) => setTab(val as string)}
//           style={{
//             marginBottom: 20,
//             borderRadius: 6,
//             fontWeight: 500,
//             fontFamily: FONT_FAMILY,
//           }}
//         />

//         {tab === "Bookmarks" ? (
//           <>
//             <Select
//               defaultValue="All bookmarks"
//               style={{ width: "100%", marginBottom: 20, fontFamily: FONT_FAMILY }}
//               suffixIcon={<FolderOpenOutlined />}
//               options={[{ value: "all", label: "All bookmarks" }]}
//             />

//             <List
//               itemLayout="horizontal"
//               dataSource={bookmarks}
//               renderItem={(item) => (
//                 <List.Item style={{ padding: "10px 0" }}>
//                   <List.Item.Meta
//                     avatar={
//                       <div
//                         style={{
//                           width: 32,
//                           height: 32,
//                           background: `${PRIMARY_COLOR}15`,
//                           borderRadius: "50%",
//                           display: "flex",
//                           justifyContent: "center",
//                           alignItems: "center",
//                         }}
//                       >
//                         <BookOutlined style={{ color: PRIMARY_COLOR }} />
//                       </div>
//                     }
//                     title={<a href={item.url} style={{ fontFamily: FONT_FAMILY }}>{item.title}</a>}
//                     description={<Typography.Text type="secondary" style={{ fontFamily: FONT_FAMILY }}>{item.url}</Typography.Text>}
//                   />
//                 </List.Item>
//               )}
//             />

//             <Button
//               type="primary"
//               block
//               style={{
//                 marginTop: 24,
//                 borderRadius: 6,
//                 backgroundColor: PRIMARY_COLOR,
//                 borderColor: PRIMARY_COLOR,
//                 fontFamily: FONT_FAMILY,
//               }}
//             >
//               Open Bookmarks
//             </Button>
//           </>
//         ) : (
//           <div
//             style={{
//               height: 150,
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               color: "#999",
//               fontFamily: FONT_FAMILY,
//             }}
//           >
//             No recently closed tabs
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// };