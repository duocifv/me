import { Suspense } from "react";
import ResetPassword from "./components/reset-password";
import WrapperAuth from "../components/wrapper-auth";

export default function ResetPasswordPage() {
  return (
    <WrapperAuth>
      <Suspense>
        <ResetPassword />
      </Suspense>
    </WrapperAuth>
  );
}
