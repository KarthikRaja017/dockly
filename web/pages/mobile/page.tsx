import { Suspense } from "react";
import AuthLayout from "../auth/authLayout";

const Mobile = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <AuthLayout formComponent={MobileForm} /> */}
    </Suspense>
  );
};

export default Mobile;
