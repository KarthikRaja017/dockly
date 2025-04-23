"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, Select } from "antd";
import { PhoneOutlined } from "@ant-design/icons";
import { AxiosResponse } from "axios";
import { ApiResponse } from "./signInForm";
import { userAddMobile } from "../services/apiConfig";
import { showNotification } from "../../utils/notification";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "../routes";

const { Title, Text } = Typography;
const { Option } = Select;

const MobileForm: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSignUp = async (values: any) => {
    try {
      setLoading(true);
      const response: AxiosResponse<ApiResponse> = await userAddMobile({
        email: email,
        ...values,
      });
      const { status, message: msg, payload } = response.data;

      if (status) {
        showNotification("Success", msg, "success");
        const mobile = payload?.otpStatus?.mobileNumber || "";
        const otp = payload?.otpStatus?.otp || "";
        localStorage.setItem("motp", otp);
        const uid = payload?.uid || "";
        localStorage.setItem("motp", otp);
        localStorage.setItem("uid", uid.uid);
        router.push(
          `${ROUTES.mobileVerification}?mobile=${encodeURIComponent(mobile)}`
        );
      }
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
          Almost done!
        </Title>
        <Text style={{ color: "gray", marginBottom: "20px", display: "block" }}>
          Your email is verified! Let's get your mobile number to make your
          account more secure.
        </Text>

        <Form layout="vertical" form={form} onFinish={handleSignUp}>
          <Form.Item
            name="mobile"
            rules={[
              {
                required: true,
                message: "Please enter your mobile number!",
              },
              {
                pattern: /^[0-9]{10}$/,
                message: "Mobile number must be 10 digits.",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Mobile Number"
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
      </div>
    </div>
  );
};

export default MobileForm;
