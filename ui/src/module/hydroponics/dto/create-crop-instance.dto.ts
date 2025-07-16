import { z } from "zod";

export const CreateCropInstanceSchema = z.object({
  plantTypeId: z.number().int({ message: "plantTypeId phải là số nguyên" }),
  name: z.string().min(1, { message: "name không được để trống" }),
});

export type CreateCropInstanceDto = z.infer<typeof CreateCropInstanceSchema>;
