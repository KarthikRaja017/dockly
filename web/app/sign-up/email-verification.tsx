import AuthLayout from "../auth/authLayout";
import OTPVerification from "../forms/otpVerification";

const EmailOtpVerification = () => {
  return (
    <AuthLayout
      formComponent={() => (
        <OTPVerification type={'email'} 
        // value={value} onSubmit={handleOtpSubmit} 
        />
      )}
    />
  );
};

export default EmailOtpVerification;
