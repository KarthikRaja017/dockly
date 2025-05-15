import React from "react";
import AuthLayout from "../auth/authLayout";
import SignInForm from "../forms/signInForm";

const SignIn = () => {
  return <AuthLayout formComponent={SignInForm} />;
};

export default SignIn;
