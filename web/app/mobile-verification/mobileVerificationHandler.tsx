"use client";

import { Suspense, useEffect, useState } from "react";
import OTPVerification from "../forms/otpVerification";
import { useRouter, useSearchParams } from "next/navigation";
import { showNotification } from "../../utils/notification";
import { AxiosResponse } from "axios";
import { ApiResponse } from "../forms/signInForm";
import { mobileVerification } from "../services/apiConfig";
import { ROUTES } from "../routes";

const MobileVerificationHandler = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mobile = searchParams.get("mobile");
  const [otp, setOtp] = useState("");
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedOtp = localStorage.getItem("motp") || "";
    const storeduid = localStorage.getItem("uid") || "";
    if (storedOtp) {
      setOtp(storedOtp);
      setUid(storeduid);
    }
  }, [mobile]);
  const handleOtpSubmit = async (otp: any) => {
    try {
      setLoading(true);
      const response: AxiosResponse<ApiResponse> = await mobileVerification({
        uid,
        ...otp,
      });
      const { status, message: msg, payload } = response.data;
      console.log("🚀 ~ handleOtpSubmit ~ payload:", payload);

      if (status) {
        const token = payload?.token || "";
        localStorage.setItem("Dtoken", token);
        showNotification("Success", msg, "success");
        router.push(`${ROUTES.dashBoard}?user=${encodeURIComponent(uid)}`);
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
  return mobile ? (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerification
        type="mobile"
        value={mobile}
        storedOtp={otp}
        onSubmit={handleOtpSubmit}
      />
    </Suspense>
  ) : (
    <>...loading</>
  );
};

export default MobileVerificationHandler;
