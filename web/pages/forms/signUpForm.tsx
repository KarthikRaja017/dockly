"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, Select, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { AxiosResponse } from "axios";
import { ApiResponse } from "./signInForm";
// import { userRegister } from "../services/apiConfig";
import { showNotification } from "../../utils/notification";
import { useRouter } from "next/navigation";
import { ROUTES } from "../../app/routes";

const { Title, Text } = Typography;
const { Option } = Select;

const SignUpForm: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (values: any) => {
    try {
      setLoading(true);
      // const response: AxiosResponse<ApiResponse> = await userRegister(values);
      // const { status, message: msg, payload } = response.data;
  
      // if (status) {
      //   showNotification("Success", msg, "success");
      //   const email = payload?.email || "";
      //   const otp = payload?.otp || "";
      //   localStorage.setItem("otp", otp);
      //   router.push(
      //     `${ROUTES.emailVerification}?email=${encodeURIComponent(email)}`
      //   );
      // }
    } catch (error: any) {
      console.error("SignUp Error:", error);
      const errMsg =
        error?.response?.data?.message ||
        "Something went wrong during registration.";
      showNotification("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "92vh",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 10, right: 20 }}>
        <Select defaultValue="en-UK" bordered={false}>
          <Option value="en-UK">English (UK)</Option>
          <Option value="en-US">English (US)</Option>
        </Select>
      </div>

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          width: "500px",
        }}
      >
        <Title level={3} style={{ fontWeight: "bold" }}>
          Welcome back!
        </Title>
        <Text style={{ color: "gray", marginBottom: "20px", display: "block" }}>
          Please enter your email and password to sign in
        </Text>
        <Form layout="vertical" form={form} onFinish={handleSignUp}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email!",
              },
              {
                type: "email",
                message: "Please enter a valid email!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="E-mail"
              size="large"
              style={{ borderRadius: "6px", padding: "10px" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              block
              size="large"
              loading={loading}
              style={{
                fontWeight: "bold",
                borderRadius: "6px",
                backgroundColor: "#007B8F",
              }}
              htmlType="submit"
            >
              Continue
            </Button>
          </Form.Item>
        </Form>

        <Text>
          Have an account? <a href="/sign-in">Sign In</a>
        </Text>
      </div>
    </div>
  );
};

export default SignUpForm;
