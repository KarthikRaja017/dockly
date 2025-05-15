import { Suspense } from "react";
import AuthLayout from "../auth/authLayout";
import MobileVerificationHandler from "./mobileVerificationHandler";

const MobileVerification = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthLayout formComponent={MobileVerificationHandler} />
    </Suspense>
  );
};

export default MobileVerification;
