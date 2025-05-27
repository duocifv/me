"use client";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import {
  ResetPasswordDto,
  ResetPasswordSchema,
} from "@adapter/auth/dto/reset-password";
import { ResetPasswordSubmit } from "../dispatch/dispatch-reset-password";

export default function ResetPassword() {
  return (
    <Card className="max-w-md mx-auto px-6 py-8">
      <CardHeader>
        <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
        <CardDescription>Nhập mật khẩu mới để tiếp tục.</CardDescription>
      </CardHeader>
      <CardContent>
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
              <ResetPasswordSubmit {...from} />
            </>
          )}
        </FormWrapper>
      </CardContent>
    </Card>
  );
}
