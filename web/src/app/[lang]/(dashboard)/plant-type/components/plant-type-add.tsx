"use client";
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
  CreatePlantTypeDto,
  CreatePlantTypeSchema,
} from "@adapter/plant-type/dto/create-plant-type.dto";
import CreatePlantTypeSubmit from "../dispatch/dispatch-plant-type-create";
import { generateSlug } from "@adapter/share/utils/generateSlug";
import { useMediaAllQuery } from "@adapter/media/media.hook";
import { Picture } from "@/components/share/picture/ui-picture";

export default function PlantTypeAddDialog() {
  const { data = [], isSuccess } = useMediaAllQuery();
  if (!isSuccess) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-end">
          <Button className="w-32">Add Plant Type</Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Plant Type</DialogTitle>
          <DialogDescription>
            Chọn tên, slug và hình cho loại cây mới.
          </DialogDescription>
        </DialogHeader>

        <FormWrapper<CreatePlantTypeDto>
          schema={CreatePlantTypeSchema}
          defaultValues={{ slug: "", displayName: "", mediaId: "" }}
        >
          {(form) => {
            const { setValue, watch, formState } = form;
            const selectedMediaId = watch("mediaId");

            return (
              <>
                <div className="grid gap-4 py-4">
                  {/* Display name & slug */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="displayName">Display name</Label>
                    <div className="col-span-3">
                      <Input
                        id="displayName"
                        {...form.register("displayName")}
                        onChange={(e) => {
                          const name = e.currentTarget.value;
                          setValue("slug", generateSlug(name), {
                            shouldValidate: true,
                          });
                        }}
                      />
                      {formState.errors.displayName && (
                        <p className="text-red-500 text-sm">
                          {formState.errors.displayName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="slug">Slug</Label>
                    <div className="col-span-3">
                      <Input id="slug" {...form.register("slug")} disabled />
                      {formState.errors.slug && (
                        <p className="text-red-500 text-sm">
                          {formState.errors.slug.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Media selector */}
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label>Choose image</Label>
                    <div className="col-span-3">
                      <div className="grid grid-cols-3 gap-2">
                        {data.map(({ id, variants }) =>
                          variants.medium ? (
                            <div
                              key={id}
                              className={`p-1 rounded cursor-pointer transition ${
                                selectedMediaId === id
                                  ? "border-primary ring-2 ring-primary"
                                  : "border border-transparent hover:border-muted"
                              }`}
                              onClick={() => setValue("mediaId", id)}
                            >
                              <Picture
                                src={variants.medium}
                                alt="thumbnail"
                                className="h-20 w-full object-cover rounded"
                              />
                            </div>
                          ) : null
                        )}
                      </div>
                      <Input type="hidden" {...form.register("mediaId")} />
                      {formState.errors.mediaId && (
                        <p className="text-red-500 text-sm mt-1">
                          {formState.errors.mediaId.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <CreatePlantTypeSubmit {...form} />
                </DialogFooter>
              </>
            );
          }}
        </FormWrapper>
      </DialogContent>
    </Dialog>
  );
}
