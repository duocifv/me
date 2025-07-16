import { Suspense } from "react";
import VerifyEmail from "./components/verify-email";
import WrapperAuth from "../components/wrapper-auth";

export default function VerifyEmaildPage() {
  return (
    <WrapperAuth>
      <Suspense>
        <VerifyEmail />
      </Suspense>
    </WrapperAuth>
  );
}
