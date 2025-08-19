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
          {/* <img
            src="/dockly-logo.png"
            alt="Logo"
            className="rotating-logo"
            style={{
              width: "650px",
              transition: "width 0.3s ease-in-out",
            }}
          /> */}
          <div
            style={{
              width: 160,
              height: 160, // make it square for circle
              borderRadius: "50%", // ensures circle container if you want CSS circle
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 0,
              backgroundColor: "#EEF2FF" // optional background
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 128 128"
              aria-hidden="true"
            >
              <circle cx="64" cy="64" r="64" fill="#E0E7FF" />

              <g fill="#6366F1">
                <rect x="34" y="28" width="60" height="16" rx="8" />
                <rect x="26" y="56" width="76" height="16" rx="8" />
                <rect x="18" y="84" width="92" height="16" rx="8" />
              </g>
            </svg>
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
      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default DocklyLogin;