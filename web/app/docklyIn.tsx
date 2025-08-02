"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, Typography } from "antd";
import { LowercaseInput, SIDEBAR_BG } from "./comman";
import { useRouter } from "next/navigation";
import { AxiosResponse } from "axios";
import { showNotification } from "../utils/notification";
import addUsername from "../services/user";
import SignUpDockly from "../pages/sign-in/signUp";
import { useGlobalLoading } from "./loadingContext";

const { Title, Text, Link } = Typography;

const DocklyLogin = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const { loading, setLoading } = useGlobalLoading();
  const [emailView, setEmailView] = useState(false);
  const [email, setemail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setemail(localStorage.getItem("email"));
    }
  }, []);

  const handleSignUp = async (values: any) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      showNotification("Error", "Username cannot be empty or whitespace.", "error");
      return;
    }

    setLoading(true);
    try {
      type ApiResponse = {
        status: boolean;
        message: string;
        payload: {
          userId?: string;
          otpStatus?: { otp?: string };
          email?: string;
          token?: string;
          redirectUrl?: string;
        };
      };

      const response: AxiosResponse<ApiResponse> = await addUsername({
        userName: trimmedUsername,
        email: email,
      });

      const { status, message: msg, payload } = response.data;

      if (!status) {
        showNotification("Error", msg, "error");
      } else {
        showNotification("Success", msg, "success");
        localStorage.setItem("userId", payload.userId || "");
        localStorage.setItem("username", trimmedUsername);
        if (payload?.otpStatus?.otp) {
          localStorage.setItem("storedOtp", payload?.otpStatus.otp || "");
          localStorage.setItem("email", payload?.email || "");
        }
        if (payload?.token) {
          localStorage.setItem("Dtoken", payload?.token || "");
        }
        router.push(`/${trimmedUsername}${payload.redirectUrl}`);
      }
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        "Something went wrong during registration.";
      showNotification("Error", errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes rotatelogo {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .rotating-logo {
          animation: rotatelogo 8s linear infinite;
          transform-origin: center;
        }
      `}</style>

      {!emailView ? (
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
            caretColor: "transparent",
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
              marginBottom: 0,
            }}
          >
            <img
              src="/dockly-logo.png"
              alt="Logo"
              className="rotating-logo"
              style={{
                width: "650px",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>
          <Title level={3} style={{ marginBottom: 0 }}>Welcome to Dockly</Title>
          <p>Enter your Dockly URL to get started</p>

          <div
            style={{
              marginTop: 4,
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
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  const trimmed = username.trim();
                  if (trimmed) {
                    handleSignUp({ userName: trimmed });
                  } else {
                    showNotification("Error", "Username cannot be empty or whitespace.", "error");
                  }
                }
              }}
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

          <p style={{ marginTop: 16, cursor: "pointer" }}>
            Don't remember the username?{" "}
            <a style={{ color: "#003cff" }} onClick={() => setEmailView(true)}>
              Sign in with email
            </a>
          </p>
        </div>
      ) : (
        <SignUpDockly />
      )}
    </>
  );
};

export default DocklyLogin;