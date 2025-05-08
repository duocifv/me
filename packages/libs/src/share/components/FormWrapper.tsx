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
  onSubmit: (data: T, methods: UseFormReturn<T>) => void;
  children: (methods: UseFormReturn<T>) => ReactNode;
}

export function FormWrapper<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
}: FormWrapperProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = methods.handleSubmit((data) => {
    onSubmit(data, methods);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>{children(methods)}</form>
    </FormProvider>
  );
}
