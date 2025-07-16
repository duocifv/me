"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Permissions = {
  id: string;
  name: string;
};
type PermissionsState = {
  permissions: Permissions[];
  setPermissions: (permissions_list: Permissions[]) => void;
};

export const permissionsStore = create<PermissionsState>()(
  devtools(
    immer((set, get) => ({
      permissions: [],
      setPermissions: (newPermissions) => set({ permissions: newPermissions }),
    })),
    { name: "PermissionsStore" }
  )
);
