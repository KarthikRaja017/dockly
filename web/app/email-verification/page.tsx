import { Suspense } from "react";
import AuthLayout from "../auth/authLayout";
import EmailOtpHandler from "./emailOtpHandler";

const EmailOtpVerification = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthLayout formComponent={EmailOtpHandler} />
    </Suspense>
  );
};

export default EmailOtpVerification;
