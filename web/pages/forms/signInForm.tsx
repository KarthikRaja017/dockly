"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, Select, Divider } from "antd";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation"; // ✅ App Router-compatible hook
import { AxiosResponse } from "axios";
import { showNotification } from "../../utils/notification";
import { userLogin } from "../services/apiConfig";

const { Title, Text } = Typography;
const { Option } = Select;

interface LoginFormValues {
  emailOrMobile: string;
  password: string;
}

export interface ApiResponse {
  status: boolean;
  message: string;
  payload?: any;
}

const SignInForm: React.FC = () => {
  const [inputType, setInputType] = useState("");
  const [emailMethod, setEmailMethod] = useState(true);
  const [form] = Form.useForm();

  const router = useRouter();

  const handleOnFinish = async (values: LoginFormValues) => {
    const payload: Record<string, string> = {
      type: inputType,
      password: values.password,
    };

    if (inputType === "email") {
      payload.email = values.emailOrMobile;
    } else if (inputType === "mobile") {
      payload.mobile = values.emailOrMobile;
    }

    try {
      const response: AxiosResponse<ApiResponse> = await userLogin(payload);
      const data = response.data;
      if (data.status) {
        showNotification("Success", data.message, "success");
        localStorage.setItem("lotp", data.payload.otpStatus.otp);
        localStorage.setItem("ltype", inputType);
        localStorage.setItem("uid", data.payload.otpStatus.userId);
        localStorage.setItem("value", JSON.stringify(data.payload.otpStatus));
        // router.push(ROUTES.signInVerification);
      } else {
        showNotification("Error", data.message, "error");
      }
    } catch (error) {
      showNotification(
        "Error",
        "Something went wrong. Please try again.",
        "error"
      );
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
        <Select defaultValue="en-UK" variant="borderless">
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
        <Title level={3} style={{ fontWeight: 700 }}>
          Hi, Welcome!
        </Title>
        <Text style={{ color: "#666", marginBottom: "20px", display: "block" }}>
          Please enter your {emailMethod ? "email ID" : "mobile number"}
        </Text>

        {emailMethod ? (
          <>
            <Form form={form} layout="vertical" onFinish={handleOnFinish}>
              <Form.Item
                name="emailOrMobile"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="E-mail"
                  size="large"
                  style={{ borderRadius: "8px", padding: "10px" }}
                  onChange={(e) => setInputType("email")}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{
                    fontWeight: "bold",
                    borderRadius: "8px",
                    background: "linear-gradient(to right, #007B8F, #00C2CB)",
                  }}
                  htmlType="submit"
                >
                  Login with Email
                </Button>
              </Form.Item>
            </Form>

            <Divider plain style={{ color: "#aaa", fontWeight: 500 }}>
              OR
            </Divider>
            <Button
              type="default"
              block
              size="large"
              style={{
                fontWeight: "bold",
                borderRadius: "8px",
              }}
              onClick={() => {
                setInputType("");
                setEmailMethod(false);
              }}
            >
              Login with Mobile
            </Button>
          </>
        ) : (
          <>
            <Form form={form} layout="vertical" onFinish={handleOnFinish}>
              <Form.Item
                name="emailOrMobile"
                rules={[
                  {
                    required: true,
                    message: "Please enter your mobile number!",
                  },
                  {
                    pattern: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit mobile number!",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Mobile"
                  size="large"
                  style={{ borderRadius: "8px", padding: "10px" }}
                  onChange={(e) => setInputType("mobile")}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  block
                  size="large"
                  style={{
                    fontWeight: "bold",
                    borderRadius: "8px",
                    background: "linear-gradient(to right, #007B8F, #00C2CB)",
                  }}
                  htmlType="submit"
                >
                  Login with Mobile
                </Button>
              </Form.Item>
            </Form>

            <Divider plain style={{ color: "#aaa", fontWeight: 500 }}>
              OR
            </Divider>
            <Button
              type="default"
              block
              size="large"
              style={{
                fontWeight: "bold",
                borderRadius: "8px",
              }}
              onClick={() => {
                setInputType("");
                setEmailMethod(true);
              }}
            >
              Login with Email
            </Button>
          </>
        )}

        <div style={{ marginTop: 10 }}>
          <Text>
            Don’t have an account? <a href="/sign-up">Sign Up</a>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
