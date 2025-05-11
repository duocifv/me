"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@adapter/permissions/permissions";
import { RoleDto } from "@adapter/roles/dto/roles.dto";
import { useEffect, useState } from "react";

type PermissionGroup = {
  label: string;
  read: boolean;
  write: boolean;
  readId?: string;
  writeId?: string;
};

export function EditRoleDialog(role: RoleDto) {
  const {     permissionsList,
 } = usePermissions(role.permissions);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(role.name);
  const [selectAll, setSelectAll] = useState(false);
  const [perms, setPerms] = useState<PermissionGroup[]>([]);
  const prevOpen = React.useRef(false);
  console.log("permissions role:", permissionsList);

  // Đồng bộ perms mỗi khi dialog mở
  useEffect(() => {
    if (open && !prevOpen.current) {
      setName(role.name);
      setPerms(permissionsList);

      const allSelected =
        permissionsList.length > 0 && permissionsList.every((p) => p.read && p.write);
      setSelectAll(allSelected);
    }
    prevOpen.current = open;
  }, [open, permissionsList, role.name]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    const updated = perms.map((perm) => ({
      ...perm,
      read: checked,
      write: checked,
    }));
    setPerms(updated);
  };

  const handlePermChange = (
    index: number,
    field: "read" | "write",
    value: boolean
  ) => {
    setPerms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Cập nhật lại selectAll nếu cần
    const updated = [...perms];
    updated[index] = { ...updated[index], [field]: value };
    const allChecked = updated.every((p) => p.read && p.write);
    setSelectAll(allChecked);
  };

  const handleSubmit = () => {
    const selectedPermissionIds = perms.flatMap((perm) => {
      const ids: string[] = [];
      if (perm.read && perm.readId) ids.push(perm.readId);
      if (perm.write && perm.writeId) ids.push(perm.writeId);
      return ids;
    });

    console.log("Submit role:", {
      name,
      permissions: selectedPermissionIds,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Role {role.name}</DialogTitle>
          <DialogDescription>Set role permissions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <label className="block">
            <span className="text-sm font-medium">Role Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a role name"
            />
          </label>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold">Role Permissions</p>
              <div className="flex items-center space-x-1">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <label htmlFor="select-all" className="text-sm">
                  Select All
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
                    {(["read", "write"] as const).map((field) => (
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
                        <span className="text-sm capitalize">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 space-x-2">
          <Button onClick={handleSubmit}>Submit</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
