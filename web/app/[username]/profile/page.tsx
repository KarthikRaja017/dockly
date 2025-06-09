"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Button, Input, Form, Upload, Space, Card, DatePicker } from "antd";
import { EditOutlined, UploadOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Header from "../../../pages/components/header";
import { AxiosResponse } from "axios";
import { getUserProfile, userAddProfile } from "../../../services/user";
import DocklyLoader from "../../../utils/docklyLoader";
import dayjs from 'dayjs';

type PersonalValues = {
  first_name?: string;
  last_name?: string;
  dob?: string;
  email?: string;
  phone?: string;
  role?: string;
  country?: string;
  city?: string;
  postal_code?: string;
};

const ProfilePage: React.FC = () => {
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [personalValues, setPersonalValues] = useState<PersonalValues | null>(null);
  const [profileImage, setProfileImage] = useState<string>("https://randomuser.me/api/portraits/men/32.jpg");
  const [formPersonal] = Form.useForm();
  const [formAddress] = Form.useForm();
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  const fetchProfileAndCheck = async () => {
    setLoading(true);
    try {
      const response: AxiosResponse<any> = await getUserProfile({ username });
      const { status, payload } = response.data;

      if (status && payload) {
        setPersonalValues(payload);
      } else {
        router.push(`/${username}/profile/setup`);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "";
    setUsername(storedUsername);
    fetchProfileAndCheck();
  }, [username, router]);

  // const handleUpload = (info: any) => {
  //   const file = info.file.originFileObj;
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       if (e.target?.result) {
  //         setProfileImage(e.target.result as string);
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  //   return false;
  // };

  const handlePersonalSave = async () => {
    formPersonal.validateFields().then(async (values) => {
      const editPersonalValues: AxiosResponse<any> = await userAddProfile({ username, personalValues: values });
      const { status, payload } = editPersonalValues.data;
      if (status && payload) {
        setIsPersonalEditing(false);
        fetchProfileAndCheck();
      } else {
        console.error("Failed to save personal info");
      }
    });
  };

  const handleAddressSave = async () => {
    formAddress.validateFields().then(async (values) => {
      console.log("🚀 ~ formAddress.validateFields ~ values:", values)
      const editAddressValues: AxiosResponse<any> = await userAddProfile({ username, addressValues: values });
      const { status, payload } = editAddressValues.data;
      if (status && payload) {
        setIsAddressEditing(false);
        // fetchProfileAndCheck();
      } else {
        console.error("Failed to save address info");
      }
    });
  };


  if (loading || !personalValues) {
    return <DocklyLoader />
  }

  const headingColor = "#1E88E5";

  return (
    <div>
      <Header isHovered={false} /> {/* Add Header */}
      <div
        style={{
          padding: "24px",
          paddingTop: "65px",
          maxWidth: "1400px",
          margin: "70px",
        }}
      >
        <Card style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar size={80} src={profileImage} />
            <div style={{ marginLeft: "16px" }}>
              <h2 style={{ marginBottom: 0, color: headingColor }}>
                {personalValues.first_name} {personalValues.last_name}
              </h2>
              <p>{personalValues.country}</p>
              {/* <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleUpload}
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload> */}
            </div>
          </div>
        </Card>

        <Card
          title={
            <span style={{ color: "rgb(3, 196, 64)" }}>
              Personal Information
            </span>
          }
          extra={
            isPersonalEditing ? (
              <Button icon={<SaveOutlined />} onClick={handlePersonalSave}>
                Save
              </Button>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => setIsPersonalEditing(true)}
              >
                Edit
              </Button>
            )
          }
          style={{ marginBottom: "16px" }}
        >
          {isPersonalEditing ? (
            <Form
              form={formPersonal}
              layout="vertical"
              initialValues={{
                ...personalValues,
                dob: personalValues?.dob ? dayjs(personalValues.dob) : null,
              }}
            >
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <Form.Item
                  name="first_name"
                  label="First Name"
                  style={{ flex: "1" }}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="last_name"
                  label="Last Name"
                  style={{ flex: "1" }}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="dob"
                  label="Date of Birth"
                  style={{ flex: "1" }}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                  marginTop: "16px",
                }}
              >
                <Form.Item
                  name="email"
                  label="Email Address"
                  style={{ flex: "1" }}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  style={{ flex: "1" }}
                >
                  <Input />
                </Form.Item>
              </div>
            </Form>
          ) : (
            <div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ flex: "1" }}>
                  <strong>First Name:</strong> {personalValues.first_name}
                </div>
                <div style={{ flex: "1" }}>
                  <strong>Last Name:</strong> {personalValues.last_name}
                </div>
                <div style={{ flex: "1" }}>
                  <strong>Date of Birth:</strong> {personalValues.dob}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                  marginTop: "16px",
                }}
              >
                <div style={{ flex: "1" }}>
                  <strong>Email:</strong> {personalValues.email}
                </div>
                <div style={{ flex: "1" }}>
                  <strong>Phone:</strong> {personalValues.phone}
                </div>
                <div style={{ flex: "1" }}>
                  {/* <strong>Role:</strong> {personalValues.role} */}
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card
          title={<span style={{ color: "rgb(100, 20, 219)" }}>Address</span>}
          extra={
            isAddressEditing ? (
              <Button icon={<SaveOutlined />} onClick={handleAddressSave}>
                Save
              </Button>
            ) : (
              <Button
                icon={<EditOutlined />}
                onClick={() => setIsAddressEditing(true)}
              >
                Edit
              </Button>
            )
          }
        >
          {isAddressEditing ? (
            <Form
              form={formAddress}
              layout="vertical"
              initialValues={personalValues}
            >
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <Form.Item name="country" label="Country" style={{ flex: "1" }}>
                  <Input />
                </Form.Item>
                <Form.Item name="city" label="City" style={{ flex: "1" }}>
                  <Input />
                </Form.Item>
                <Form.Item
                  name="postal_code"
                  label="Postal Code"
                  style={{ flex: "1" }}
                >
                  <Input />
                </Form.Item>
              </div>
            </Form>
          ) : (
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ flex: "1" }}>
                <strong>Country:</strong> {personalValues.country}
              </div>
              <div style={{ flex: "1" }}>
                <strong>City:</strong> {personalValues.city}
              </div>
              <div style={{ flex: "1" }}>
                <strong>Postal Code:</strong> {personalValues.postal_code}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
