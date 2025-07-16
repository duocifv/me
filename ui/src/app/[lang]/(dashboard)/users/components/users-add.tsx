import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import {
  CreateUserDto,
  CreateUserSchema,
} from "@adapter/users/dto/create-user.dto";
import dynamic from "next/dynamic";
import AppLoading from "../../components/app-loading";
import { $t } from "@/app/lang";

const CreateUserSubmit = dynamic(
  () => import("../dispatch/dispatch-user-create"),
  {
    loading: () => <AppLoading />,
  }
);

export default function UsersAddDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{$t`Thêm người dùng`}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{$t`Thêm người dùng`}</DialogTitle>
          <DialogDescription>
            {$t`Hãy nhập thông tin người dùng. Nhấn lưu khi hoàn tất.`}
          </DialogDescription>
        </DialogHeader>
        <FormWrapper<CreateUserDto>
          schema={CreateUserSchema}
          defaultValues={{ email: "", password: "" }}
        >
          {(form) => (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="email" className="mt-3">
                      {$t`Email`}
                    </Label>
                    <div className="col-span-3">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 mt-2 text-sm leading-none">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="mt-3">{$t`Mật khẩu`}</Label>
                    <div className="col-span-3">
                      <Input
                        {...form.register("password")}
                        type="password"
                        placeholder="••••••••"
                      />
                      {form.formState.errors.password && (
                        <p className="text-red-500 mt-2 text-sm leading-none">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <CreateUserSubmit {...form} />
              </DialogFooter>
            </>
          )}
        </FormWrapper>
      </DialogContent>
    </Dialog>
  );
}
