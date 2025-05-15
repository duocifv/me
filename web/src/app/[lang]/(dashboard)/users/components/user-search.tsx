import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormWrapper } from "@adapter/share/components/FormWrapper";
import {
  UserInputSearchDto,
  UserInputSearhcSchema,
} from "@adapter/users/dto/get-users.dto";
import { useUsersStore } from "@adapter/users/users.store";
import { Loader2 } from "lucide-react";

export function UserSearch() {
  const setFilters = useUsersStore((s) => s.setFilters);

  return (
    <FormWrapper<UserInputSearchDto>
      schema={UserInputSearhcSchema}
      defaultValues={{ search: "" }}
    >
      {(form) => {
        const { register, formState, handleSubmit } = form;

        const onSearch = handleSubmit((value) => {
          setFilters({ ...value });
        });

        return (
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative">
              <Input
                placeholder="Filter emails..."
                {...register("search")}
                className="max-w-sm"
              />
              {formState.errors.search &&
                formState.errors.search.message &&
                form.watch("search") !== "" && (
                  <div className="text-red-500 mt-2 text-sm leading-none absolute top-full">
                    {formState.errors.search.message}
                  </div>
                )}
            </div>
            <div className="flex items-start">
              <Button onClick={onSearch} disabled={formState.isSubmitting}>
                {formState.isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>
        );
      }}
    </FormWrapper>
  );
}
