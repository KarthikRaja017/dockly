"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, Typography } from "antd";
import { LowercaseInput, SIDEBAR_BG } from "./comman";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { ApiResponse } from "../pages/forms/signInForm";
import { showNotification } from "../utils/notification";
import DocklyLoader from "../utils/docklyLoader";
import addUsername from "../services/user";

const { Title, Text, Link } = Typography;

const DocklyLogin = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setemail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setemail(localStorage.getItem("email"));
    }
  }, []);

  const handleSignUp = async (values: any) => {
    setLoading(true);
    try {
      setLoading(true);
      const response: AxiosResponse<ApiResponse> = await addUsername({
        userName: username,
        email: email,
      });
      const { status, message: msg, payload } = response.data;

      if (!status) {
        showNotification("Error", msg, "error");
      }

      if (status) {
        showNotification("Success", msg, "success");
        localStorage.setItem("userId", payload.userId);
        localStorage.setItem("username", username);
        if (payload?.otpStatus?.otp) {
          localStorage.setItem("storedOtp", payload?.otpStatus.otp || "");
          localStorage.setItem("email", payload?.email || "");
        }
        router.push(`/${username}${payload.redirectUrl}`);
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

  {
    if (loading) return <DocklyLoader />;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        backgroundColor: SIDEBAR_BG,
        padding: "10px",
        borderRadius: "0 20px 20px 0",
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9f9f9",
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <img
          src="/logoBlue.png"
          alt="Logo"
          style={{
            width: "150px",
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
      <Title level={3}>Welcome to Dockly</Title>
      <p>Enter your Dockly URL to get started</p>

      <div
        style={{
          marginTop: 24,
          marginBottom: 16,
          display: "flex",
          width: 320,
          height: "auto",
        }}
      >
        <LowercaseInput
          addonBefore="dockly.me/"
          style={{
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
            borderTopRightRadius: 6,
            borderBottomRightRadius: 6,
            width: "100%",
          }}
          value={username}
          onChange={setUsername}
        />
      </div>

      <Button
        type="primary"
        style={{
          width: 320,
          backgroundColor: "#003cff",
          borderColor: "#003cff",
          borderRadius: 6,
        }}
        onClick={handleSignUp}
        loading={loading}
      >
        Get Started
      </Button>

      {/* <p style={{ marginTop: 16 }}>
        Don’t have a Dockly URL?{" "}
        <a href="#" style={{ color: "#003cff" }}>
          Contact your admin
        </a>
      </p> */}
    </div>
  );
};

export default DocklyLogin;
