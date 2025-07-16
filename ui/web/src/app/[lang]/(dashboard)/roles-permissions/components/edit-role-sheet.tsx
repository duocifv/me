"use client";

import * as React from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@adapter/permissions/permissions.hook";
import { RoleDto } from "@adapter/roles/dto/roles.dto";
import { useEffect, useState } from "react";
import { IPermissionGroup } from "@adapter/permissions/permission.utils";
import { $t } from "@/app/lang";

export default function EditRoleSheet(role: RoleDto) {
  const { permissionsList } = usePermissions(role.permissions);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string>(role.name);
  const [selectAll, setSelectAll] = useState(false);
  const [perms, setPerms] = useState<IPermissionGroup[]>([]);
  const prevOpen = React.useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setName(role.name);
      setPerms(permissionsList);

      const allSelected =
        permissionsList.length > 0 &&
        permissionsList.every((p) => p.view && p.manage);
      setSelectAll(allSelected);
    }
    prevOpen.current = open;
  }, [open, permissionsList, role.name]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    const updated = perms.map((perm) => ({
      ...perm,
      view: checked,
      manage: checked,
    }));
    setPerms(updated);
  };

  const handlePermChange = (
    index: number,
    field: "view" | "manage",
    value: boolean
  ) => {
    setPerms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    const updated = [...perms];
    updated[index] = { ...updated[index], [field]: value };
    const allChecked = updated.every((p) => p.view && p.manage);
    setSelectAll(allChecked);
  };

  const handleSubmit = () => {
    const selectedPermissionIds = perms.flatMap((perm) => {
      const ids: string[] = [];
      if (perm.view && perm.viewId) ids.push(perm.viewId);
      if (perm.manage && perm.manageId) ids.push(perm.manageId);
      return ids;
    });

    console.log("Submit role:", {
      name,
      permissions: selectedPermissionIds,
    });

    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {$t`Chỉnh sửa`}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {$t`Chỉnh sửa vai trò`} {role.name}
          </SheetTitle>
          <SheetDescription>{$t`Thiết lập quyền cho vai trò`}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4 px-4">
          <label className="block">
            <span className="text-sm font-medium">{$t`Tên vai trò`}</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={$t`Nhập tên vai trò`}
              readOnly
            />
          </label>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold">{$t`Quyền của vai trò`}</p>
              <div className="flex items-center space-x-1">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm">
                  {$t`Chọn tất cả`}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              {permissionsList.map((perm, id) => (
                <div
                  key={id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-sm">{perm.label}</span>
                  <div className="flex space-x-4">
                    {(["view", "manage"] as const).map((field) => (
                      <label
                        key={field}
                        className="flex items-center space-x-1"
                      >
                        <Checkbox
                          defaultChecked={perm[field]}
                          onCheckedChange={(value) =>
                            handlePermChange(id, field, !!value)
                          }
                        />
                        <span className="text-sm capitalize">
                          {field === "view" ? "Xem" : "Quản lý"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6 space-x-2 flex justify-end">
          <Button onClick={handleSubmit}>{$t`Lưu`}</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {$t`Hủy`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
