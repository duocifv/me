"use client";
import _ from "lodash";
import { useUsers } from "@adapter/users/users";
import { useUsersStore } from "@adapter/users/users.store";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

export function UsersLoader() {
  const { listUsers } = useUsers();
  const setData = useUsersStore(useShallow((s) => s.setData));
  const { isLoading, error, isSuccess, data } = listUsers;
  useEffect(() => {
    if (isSuccess && data) {
      setData(data);
      //  if (!_.isEqual(prevData, data)) {
        
      // }
    }
  }, [isSuccess]);
  if (isLoading) {
    return <>Loading....</>;
  }
  if (error) {
    return <>Error....{error.message}</>;
  }

  return null;
}
