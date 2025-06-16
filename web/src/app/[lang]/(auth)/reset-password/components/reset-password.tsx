"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import {
  ResetPasswordDto,
  ResetPasswordSchema,
} from "@adapter/auth/dto/reset-password";
import { ResetPasswordSubmit } from "../dispatch/dispatch-reset-password";
import Lottie from "lottie-react";
import animationData from "@/share/assets/hydroponic-animation.json";

export default function ResetPassword() {
  return (
    <>
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
            <p className="text-balance text-muted-foreground">
              Nhập mật khẩu mới để tiếp tục.
            </p>
          </div>
          <FormWrapper<ResetPasswordDto>
            schema={ResetPasswordSchema}
            defaultValues={{ newPassword: "", confirmPassword: "" }}
          >
            {(from) => (
              <>
                <div className="flex flex-col space-y-1.5 mb-4">
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...from.register("newPassword")}
                  />
                  {from.formState.errors.newPassword && (
                    <span className="text-red-500 text-sm">
                      {from.formState.errors.newPassword.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5 mb-4">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...from.register("confirmPassword")}
                  />
                  {from.formState.errors.confirmPassword && (
                    <span className="text-red-500 text-sm">
                      {from.formState.errors.confirmPassword.message}
                    </span>
                  )}
                </div>
                <ResetPasswordSubmit />
              </>
            )}
          </FormWrapper>
        </div>
      </div>
      <div className="justify-center items-center md:pr-8 hidden md:flex">
        <div className="rounded-md overflow-hidden">
          <Lottie
            animationData={animationData}
            loop={true}
            className="w-full h-full"
          />
        </div>
      </div>
    </>
  );
}
