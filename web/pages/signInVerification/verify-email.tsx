"use client";
import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Typography, Input, Button } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AxiosResponse } from "axios";
import { emailVerification } from "../../services/apiConfig";
import { showNotification } from "../../utils/notification";
import DocklyLoader from "../../utils/docklyLoader";

const { Title, Text, Link } = Typography;

type ApiResponse = {
  status: boolean;
  message: string;
  payload?: {
    token?: string;
    [key: string]: any;
  };
};

const VerifyEmailPage: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [duser, setDuser] = useState<string | null>(null);
  const [storedOtp, setStoredOtp] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const params = useParams() || {};
  const searchParams = useSearchParams();
  const encodedToken = searchParams?.get("token");
  const username = params.username;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId"));
      setStoredOtp(localStorage.getItem("storedOtp"));
      setEmail(localStorage.getItem("email"));
      setDuser(localStorage.getItem("duser"));
    }
  }, []);

  useEffect(() => {
    if (encodedToken) {
      try {
        const decoded = JSON.parse(atob(encodedToken));
        const { otp, email, userId, fuser, duser } = decoded;
        localStorage.setItem("userId", userId || "");
        localStorage.setItem("fuser", fuser || "");
        localStorage.setItem("duser", duser);
        setDuser(duser);
        setEmail(email);
        setStoredOtp(otp);
        setUserId(userId);
      } catch (err) {
        console.error("Invalid or malformed token");
      }
    }
  }, [encodedToken]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        inputsRef.current[index + 1]?.focus();
      }

      const fullCode = newOtp.join("");
      if (fullCode.length === 4 && newOtp.every((v) => v !== "")) {
        setTimeout(() => {
          handleContinue(newOtp);
        }, 200);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleContinue = async (providedOtp?: string[]) => {
    const code = (providedOtp || otp).join("");
    if (code.length !== 4) {
      showNotification("Error", "Please enter a valid 4-digit code", "error");
      return;
    }

    setLoading(true);

    try {
      const response: AxiosResponse<ApiResponse> = await emailVerification({
        userId,
        otp: code,
        storedOtp: storedOtp,
        duser: duser,
      });

      const { status, message: msg, payload } = response.data;

      if (!status) {
        showNotification("Error", msg, "error");
      } else {
        const token = payload?.token || "";
        localStorage.setItem("Dtoken", token);
        showNotification("Success", msg, "success");
        router.push(`/${username}/dashboard`);
      }
    } catch (error) {
      console.error("OTP verification error", error);
      showNotification("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DocklyLoader />;
  }

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: "90vh", padding: "0 16px" }}
    >
      <Col span={24} style={{ maxWidth: 400 }}>
        <Title level={2}>Verify your email</Title>
        <Text type="secondary">
          Enter the 4-digit code sent to {email}
        </Text>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {otp.map((digit, idx) => (
            <Input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el?.input || null;
              }}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              maxLength={1}
              style={{
                width: 60,
                height: 60,
                fontSize: 24,
                textAlign: "center",
                borderRadius: 8,
              }}
            />
          ))}
        </div>

        <Button
          type="primary"
          block
          size="large"
          onClick={() => handleContinue()}
          disabled={otp.join("").length !== 4}
          style={{ marginTop: 32, backgroundColor: "#0047FF" }}
        >
          Continue
        </Button>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text>Didn't receive a code? </Text>
          <Link onClick={() => console.log("Resend clicked")}>Resend</Link>
        </div>
      </Col>
    </Row>
  );
};

export default VerifyEmailPage;
