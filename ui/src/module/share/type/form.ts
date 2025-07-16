import { FieldValues, UseFormReturn } from "react-hook-form";

export type FormSubmit<T extends FieldValues> = UseFormReturn<T>;
