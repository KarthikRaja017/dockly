"use client";

import { useEffect, useState } from "react";
import OTPVerification from "../forms/otpVerification";
import { useSearchParams } from "next/navigation";

const EmailOtpHandler = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  useEffect(() => {
    const storedOtp = localStorage.getItem("otp") || "";
    if (storedOtp) {
      setOtp(storedOtp);
    }
  }, [email]);

  return email ? (
    <OTPVerification type="email" value={email} storedOtp={otp} />
  ) : (
    <>...loading</>
  );
};

export default EmailOtpHandler;
