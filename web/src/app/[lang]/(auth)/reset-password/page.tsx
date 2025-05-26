"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
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
import ReCapcha from "../login/dispatch/dispatch-recapcha";

export default function CardWithForm() {
  return (
    <Card className="h-[328px] md:h-[430px] px-4 md:px-32 py-8  md:py-22">
      <CardHeader>
        <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
        <CardDescription>Nhập mật khẩu mới để tiếp tục.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <FormWrapper<SignInDto>
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
          >
            {(from) => (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...from.register("email")}
                    />
                    {from.formState.errors.email && (
                      <span className="text-red-500 top-[115%] text-sm leading-none absolute">
                        {from.formState.errors.email.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...from.register("password")}
                    />
                    {from.formState.errors.password && (
                      <span className="text-red-500 top-[115%] text-sm leading-none absolute">
                        {from.formState.errors.password.message}
                      </span>
                    )}
                  </div>
                </div>
                {/* <LoginSubmit {...from} /> */}
                <ReCapcha />
              </>
            )}
          </FormWrapper>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
}
