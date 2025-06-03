import { LoginForm } from "./components/auth-login";
import WrapperAuth from "../components/wrapper-auth";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <WrapperAuth>
      <Suspense>
        <LoginForm />
      </Suspense>
    </WrapperAuth>
  );
}
