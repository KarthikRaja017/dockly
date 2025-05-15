import React from "react";
import AuthLayout from "../auth/authLayout";
import SignInVerificationHandler from "./signInVerificationHandler";

const SignInVerification = () => {
  return <AuthLayout formComponent={SignInVerificationHandler} />;
};

export default SignInVerification;
