type Permission = {
  id: string;
  name: string;
};

export type IPermissionGroup = {
  label: string;
  read: boolean;
  write: boolean;
  readId?: string;
  writeId?: string;
};

export function initPermissionMap(
  allPermissions: Permission[],
  rolePermissions: Permission[]
): IPermissionGroup[] {
  const rolePermissionNames = new Set(rolePermissions.map((p) => p.name));
  const map = new Map<string, IPermissionGroup>();

  allPermissions.forEach(({ id, name }) => {
    const [action, ...subjectParts] = name.split("_");
    const subject = subjectParts.join("_");

    const label = subject
      .toLowerCase()
      .replace(/s$/, "")
      .replace(/^./, (c) => c.toUpperCase());

    if (!map.has(label)) {
      map.set(label, { label, read: false, write: false });
    }

    const group = map.get(label)!;

    if (action === "VIEW") {
      group.readId = id;
      group.read = rolePermissionNames.has(name);
    }

    if (action === "MANAGE") {
      group.writeId = id;
      group.write = rolePermissionNames.has(name);
    }
  });

  return Array.from(map.values());
}
