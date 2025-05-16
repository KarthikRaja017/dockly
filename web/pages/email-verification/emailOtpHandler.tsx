"use client";

import { Suspense, useEffect, useState } from "react";
import OTPVerification from "../forms/otpVerification";
import { useRouter, useSearchParams } from "next/navigation";
import { showNotification } from "../../utils/notification";
import { AxiosResponse } from "axios";
import { ApiResponse } from "../forms/signInForm";
import { emailVerification } from "../../services/apiConfig";
import { ROUTES } from "../../app/routes";

const EmailOtpHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams ? searchParams.get("email") : null;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedOtp = localStorage.getItem("otp") || "";
    if (storedOtp) {
      setOtp(storedOtp);
    }
  }, [email]);
  const handleOtpSubmit = async (otp: string) => {
    try {
      setLoading(true);
      const response: AxiosResponse<ApiResponse> = await emailVerification(otp);
      const { status, message: msg, payload } = response.data;

      if (status) {
        showNotification("Success", msg, "success");
        const userEmail = payload.email || "";
        // router.push(`${ROUTES.mobile}?email=${encodeURIComponent(userEmail)}`);
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
  return email ? (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerification
        type="email"
        value={email}
        storedOtp={otp}
        onSubmit={handleOtpSubmit}
      />
    </Suspense>
  ) : (
    <>...loading</>
  );
};

export default EmailOtpHandler;
