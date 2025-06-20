import React, { ReactNode } from "react";
import {
  useForm,
  FormProvider,
  UseFormReturn,
  DefaultValues,
  FieldValues,
  useFormContext,
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
      <form onSubmit={methods.handleSubmit(() => {})}>{children(methods)}</form>
    </FormProvider>
  );
}

export function useSubmit<T extends FieldValues>() {
  const { handleSubmit } = useFormContext<T>();

  const submit = (onValid: (data: T) => void) => {
    return handleSubmit(onValid);
  };

  return { submit };
}
