import { Suspense } from "react";
import AuthLayout from "../auth/authLayout";
import MobileForm from "../forms/mobileForm";

const Mobile = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthLayout formComponent={MobileForm} />
    </Suspense>
  );
};

export default Mobile;
