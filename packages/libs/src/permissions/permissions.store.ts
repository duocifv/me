"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { initPermissionMap } from "./permission.utils";

type Permissions = {
  id: string;
  name: string;
  // isActive: boolean;
};
type PermissionsState = {
  permissions: Permissions[];
  setPermissions: (
    permissions_list: Permissions[],
    permissions_user: Permissions[]
  ) => void;
};

export const permissionsStore = create<PermissionsState>()(
  devtools(
    immer((set, get) => ({
      permissions: [],
      setPermissions: (permissions_list, permissions_user) =>
        set(() => {
          const permissions = initPermissionMap(
            permissions_list,
            permissions_user
          );
          return { permissions };
        }),
    }))
  )
);
