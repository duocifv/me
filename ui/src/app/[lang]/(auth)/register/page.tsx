import { Suspense } from "react";
import { RegisterForm } from "./components/auth-register";
import WrapperAuth from "../components/wrapper-auth";

export default function LoginPage() {
  return (
    <WrapperAuth>
      <Suspense>
        <RegisterForm />
      </Suspense>
    </WrapperAuth>
  );
}
