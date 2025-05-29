import { Suspense } from "react";
import { RegisterForm } from "./components/auth-register";

export default function LoginPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
