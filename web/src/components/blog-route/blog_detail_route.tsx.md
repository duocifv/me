"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { $t } from "@/app/lang";
import { useEffect } from "react";
import { blogsStore } from "@adapter/blog/store";
import { Blog } from "@adapter/blog/domain";
import { blogSchema } from "@adapter/blog/schema";

export default function BlogDetailRoute() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const mode = {
    create: !id,
    update: !!id,
  };

  const { mutate: create } = blogsStore((state) => state.useCreate)();
  const { mutate: update } = blogsStore((state) => state.useUpdate)();
  const { data, isLoading } = blogsStore((state) => state.useGetById)(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<any>({
    resolver: zodResolver(blogSchema),
  });

  useEffect(() => {
    if (mode.update) reset(data);
  }, [data, mode.update, reset]);

  const onSubmit = (formData: Blog) => {
    if (mode.update && !isDirty) return;
    if (mode.create) {
      create(formData);
    } else if (mode.update) {
      update(formData);
      reset(formData);
    }
    
  };

  if (mode.update && isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <div className="flex justify-between">
          <h3 className="font-bold text-lg">
            {mode.create && $t`Create blog`}
            {mode.update && $t`Detail blog`}
          </h3>
          <button
            className="btn btn-sm btn-circle"
            onClick={() => router.back()}
          >
            <i className="icon-[material-symbols--close] size-6" />
          </button>
        </div>
        <div className="divider" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
               {...register("id", { valueAsNumber: true })}
                type="hidden"
                defaultValue={2}
              />
              {errors.id && (
              <div className="text-red-500 text-xs">{errors.id.message}</div>
            )}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Title*</legend>
            <label className="input w-full">
              <i className="icon-[ix--subtitle-filled] size-5" />
              <input
                {...register("title")}
                type="text"
                placeholder="Enter title"
              />
            </label>
            {errors.title && (
              <div className="text-red-500 text-xs">{errors.title.message}</div>
            )}
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Content*</legend>
            <label className="input w-full">
              <i className="icon-[eos-icons--content-modified] size-5" />
              <input
                {...register("content")}
                type="text"
                placeholder="Enter content"
              />
            </label>
            {errors.content && (
              <div className="text-red-500 text-xs">
                {errors.content.message}
              </div>
            )}
          </fieldset>

          <fieldset className="fieldset mb-4">
            <legend className="fieldset-legend">Author*</legend>
            <label className="input w-full">
              <i className="icon-[bxs--user] size-5" />
              <input
                {...register("author")}
                type="text"
                placeholder="Enter author"
              />
            </label>
            {errors.author && (
              <div className="validator-hint text-red-500 text-xs">
                {errors.author.message}
              </div>
            )}
          </fieldset>

          <fieldset className="fieldset mb-4">
            <legend className="fieldset-legend">Category*</legend>
            <label className="input w-full">
              <i className="icon-[bxs--user] size-5" />
              <input
                {...register("category")}
                type="text"
                placeholder="Enter category"
              />
            </label>
            {errors.category && (
              <div className="validator-hint text-red-500 text-xs">
                {errors.category.message}
              </div>
            )}
          </fieldset>

          <button
            type="submit"
            className="btn btn-accent min-w-2/6 flex mx-auto"
            disabled={!isDirty}
          >
            {mode.create && $t`Create`}
            {mode.update && $t`Update`}
          </button>
        </form>
      </div>
    </div>
  );
}
