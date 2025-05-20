"use client";
import { useUsersQuery } from "@adapter/users/users.hook.";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import { useUsersStore } from "@adapter/users/users.store";

export default function UsersLoader() {
  const { isLoading, error, isSuccess, data } = useUsersQuery();
  useEffect(() => {
    if (isSuccess && data) {
      const storeData = useUsersStore.getState().data;
      if (!isEqual(storeData, data)) {
        useUsersStore.setState({ data });
      }
    }
  }, [data, isSuccess]);

  if (isLoading) {
    return <>Loading…</>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return null;
}
