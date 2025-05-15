import React, { ReactNode } from "react";
import {
  useForm,
  FormProvider,
  UseFormReturn,
  DefaultValues,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

export interface FormWrapperProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  children: (methods: UseFormReturn<T>) => ReactNode;
}

export function FormWrapper<T extends FieldValues>({
  schema,
  defaultValues,
  children,
}: FormWrapperProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form>{children(methods)}</form>
    </FormProvider>
  );
}
