"use client"
import { $t } from "@/app/lang";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export function DetailProduct() {

  const router = useRouter();
  // const {
  //   register,
  //   handleSubmit,
  //   reset,
  //   formState: { errors, isDirty },
  // } = useForm({});

  // const onSubmit = (formData: unknown) => {
  //   console.log("formData", formData);
  //   reset();
  // };

 
  return (
    <div>
      <div className="flex justify-between">
        <h3 className="font-bold text-lg">{$t`Create blog`}</h3>
        <button className="btn btn-sm btn-circle" onClick={() => router.back()}>
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
        {/* {errors.id && (
          <div className="text-red-500 text-xs">{errors.id.message}</div>
        )} */}
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
          {/* {errors.title && (
            <div className="text-red-500 text-xs">{errors.title.message}</div>
          )} */}
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
          {/* {errors.content && (
            <div className="text-red-500 text-xs">{errors.content.message}</div>
          )} */}
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
          {/* {errors.author && (
            <div className="validator-hint text-red-500 text-xs">
              {errors.author.message}
            </div>
          )} */}
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
          {/* {errors.category && (
            <div className="validator-hint text-red-500 text-xs">
              {errors.category.message}
            </div>
          )} */}
        </fieldset>

        <button
          type="submit"
          className="btn btn-accent min-w-2/6 flex mx-auto"
          disabled={!isDirty}
        >
          {$t`Update`}
        </button>
      </form>
    </div>
  );
}
