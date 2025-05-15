"use client";

import { useEffect, useState } from "react";
import OTPVerification from "../forms/otpVerification";
import { useRouter, useSearchParams } from "next/navigation";
import { showNotification } from "../../utils/notification";
import { AxiosResponse } from "axios";
import { ApiResponse } from "../forms/signInForm";
import { mobileVerification, signInVerification } from "../services/apiConfig";
import { ROUTES } from "../../app/routes";

type ContactValue = {
  email?: string;
  mobile?: string;
};

const SignInVerificationHandler = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [uid, setUid] = useState("");
  const [type, setType] = useState("");
  const [value, setValue] = useState<ContactValue>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedOtp = localStorage.getItem("lotp") || "";
    const storedType = localStorage.getItem("ltype") || "";
    const storedValue = localStorage.getItem("value") || "{}";
    const storeduid = localStorage.getItem("uid") || "";

    const parsedValue = JSON.parse(storedValue);

    if (storedOtp) {
      setOtp(storedOtp);
      setUid(storeduid);
      setType(storedType);
      setValue(parsedValue);
    }
  }, []);

  const handleOtpSubmit = async (otp: any) => {
    try {
      setLoading(true);
      const response: AxiosResponse<ApiResponse> = await signInVerification({
        uid,
        ...otp,
      });
      const { status, message: msg, payload } = response.data;

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

  const contactValue = type === "email" ? value.email : value.mobile;

  return type === "email" || type === "mobile" ? (
    <OTPVerification
      type={type}
      value={contactValue || ""}
      storedOtp={otp}
      onSubmit={handleOtpSubmit}
    />
  ) : (
    <>...loading</>
  );
};

export default SignInVerificationHandler;
