import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserDto, CreateUserSchema } from "./dto/create-user.dto";

export function useCreateUserForm() {
  return useForm<CreateUserDto>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
}
