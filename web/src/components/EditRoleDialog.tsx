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

const PERMISSIONS = [
  "User Management",
  "Content Management",
  "Disputes Management",
  "Database Management",
  "Financial Management",
  "Reporting",
  "API Control",
  "Repository Management",
  "Payroll",
];

export function EditRoleDialog({ roleName }: { roleName: string }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(roleName);
  const [selectAll, setSelectAll] = React.useState(false);
  const [perms, setPerms] = React.useState<
    Record<string, { read: boolean; write: boolean; create: boolean }>
  >(() =>
    PERMISSIONS.reduce((acc, p) => {
      acc[p] = { read: false, write: false, create: false };
      return acc;
    }, {} as Record<string, { read: boolean; write: boolean; create: boolean; }>)
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    const updated = Object.fromEntries(
      PERMISSIONS.map((p) => [
        p,
        { read: checked, write: checked, create: checked },
      ])
    );
    setPerms(updated);
  };

  const handlePermChange = (
    key: string,
    field: keyof (typeof perms)[string],
    checked: boolean
  ) => {
    setPerms((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: checked },
    }));
  };

  const handleSubmit = () => {
    // TODO: save name and perms
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit {roleName}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
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
              {PERMISSIONS.map((perm) => (
                <div
                  key={perm}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-sm">{perm}</span>
                  <div className="flex space-x-4">
                    {(["read", "write", "create"] as const).map((field) => (
                      <label
                        key={field}
                        className="flex items-center space-x-1"
                      >
                        <Checkbox
                          checked={perms[perm][field]}
                          onCheckedChange={(v) =>
                            handlePermChange(perm, field, !!v)
                          }
                        />
                        <span className="text-sm capiclatalize">{field}</span>
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
