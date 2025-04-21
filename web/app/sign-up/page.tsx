import AuthLayout from "../auth/authLayout";
import SignUpForm from "../forms/signUpForm";

const SignUp = () => {
  return <AuthLayout formComponent={SignUpForm} />;
};

export default SignUp;