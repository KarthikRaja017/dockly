"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Select, Typography } from "antd";
import type { InputRef } from "antd";
import { showNotification } from "../../utils/notification";

interface OTPInputProps {
  length: number;
  onChange: (otp: string) => void;
  onComplete: (otp: string) => void;
  storedOtp?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onChange,
  onComplete,
  storedOtp = "",
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<Array<InputRef | null>>([]);

  // Sync state with storedOtp
  useEffect(() => {
    if (storedOtp) {
      const updatedOtp = storedOtp
        .padEnd(length, "")
        .split("")
        .slice(0, length);
      setOtp(updatedOtp);

      if (storedOtp.length === length) {
        onChange(storedOtp);
        onComplete(storedOtp);
      }
    }
  }, [storedOtp, length, onChange, onComplete]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      onChange(newOtp.join(""));
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.input?.select();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        margin: "20px 0",
      }}
    >
      {otp.map((data, index) => (
        <Input
          key={index}
          value={data}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          maxLength={1}
          style={{
            width: "40px",
            height: "40px",
            textAlign: "center",
            fontSize: "18px",
            borderRadius: "4px",
          }}
        />
      ))}
    </div>
  );
};

const { Text, Title } = Typography;

const OTPVerification = (props: any) => {
  const { type, value, onSubmit, storedOtp } = props;
  const [otp, setOtp] = useState("");

  // const maskedValue =
  //   type === "email"
  //     ? value.replace(/^(.{2}).*(@.*)$/, "$1******$2")
  //     : value.replace(/^(.{2}).*(.{2})$/, "$1******$2");

  const handleOTPComplete = (enteredOtp: string) => {
    setOtp(enteredOtp);
  };
  const handleSubmit = () => {
    if (otp.length === 6) {
      onSubmit({ otp: otp, storedOtp: storedOtp, email: value });
    } else {
      showNotification("Error", "Please enter a valid 6-digit OTP", "error");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "92vh",
        backgroundColor: "#ffffff",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 20,
        }}
      >
        <Select defaultValue="en-UK" bordered={false}>
          <Select.Option value="en-UK">English (UK)</Select.Option>
          <Select.Option value="en-US">English (US)</Select.Option>
        </Select>
      </div>
      <div
        style={{
          marginTop: 180,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text>A 6-digit pin has been sent to your {type}</Text>
        {/* <Title level={4}>{maskedValue}</Title> */}
      </div>
      <div>
        <Title level={5}>Enter PIN</Title>
      </div>
      <div style={{ margin: "30px 0" }}>
        <OTPInput
          length={6}
          onChange={setOtp}
          onComplete={handleOTPComplete}
          storedOtp={storedOtp}
        />
      </div>
      <Button
        type="primary"
        block
        size="large"
        style={{
          fontWeight: "bold",
          borderRadius: "6px",
          backgroundColor: "#007B8F",
          width: "400px",
        }}
        onClick={handleSubmit}
      >
        Verify
      </Button>
    </div>
  );
};

export default OTPVerification;
