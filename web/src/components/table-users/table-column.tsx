import React, { Suspense } from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { MoreVerticalIcon } from "lucide-react";

const LazyUsersTableActions = React.lazy(() => import("./users-table-actions"));

export default function TableColumn({ id }: { id: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-4 w-4 bg-amber-800"
    >
      {isHovered ? (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyUsersTableActions id={id} />
        </Suspense>
      ) : (
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <MoreVerticalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      )}
    </div>
  );
}
