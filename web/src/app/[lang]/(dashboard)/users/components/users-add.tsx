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
import { useUsers } from "@adapter/users/users";
import {
  CreateUserDto,
  CreateUserSchema,
} from "@adapter/users/dto/create-user.dto";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function UsersAddDialog() {
  const { createUser } = useUsers();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <FormWrapper<CreateUserDto>
          schema={CreateUserSchema}
          defaultValues={{ email: "", password: "" }}
          onSubmit={(value, control) => {
            createUser.mutate(value, {
              onSuccess: () => {
                toast.success("Tạo tài khoản thành công", {
                  duration: 5000,
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                });
                control.reset();
              },
              onError: (err) => {
                toast.error(err.message, {
                  duration: 5000,
                  icon: <XCircle className="h-5 w-5 text-red-500" />,
                });
              },
            });
          }}
        >
          {(control) => (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="email" className="mt-3">
                      Email
                    </Label>
                    <div className="col-span-3">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...control.register("email")}
                      />
                      {control.formState.errors.email && (
                        <p className="text-red-500 mt-2 text-sm  leading-none">
                          {control.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="mt-3">Password</Label>
                    <div className="col-span-3">
                      <Input
                        {...control.register("password")}
                        type="password"
                        placeholder="••••••••"
                      />
                      {control.formState.errors.password && (
                        <p className="text-red-500 mt-2 text-sm  leading-none">
                          {control.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" formNoValidate>
                  Create User
                </Button>
              </DialogFooter>
            </>
          )}
        </FormWrapper>
      </DialogContent>
    </Dialog>
  );
}
