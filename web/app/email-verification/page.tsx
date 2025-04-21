import AuthLayout from "../auth/authLayout";
import EmailOtpHandler from "./emailOtpHandler";


const EmailOtpVerification = () => {
  return <AuthLayout formComponent={EmailOtpHandler} />;

};

export default EmailOtpVerification;