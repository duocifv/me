"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

export default function DispatchSnapshotsDetail() {
  const selectedSnapshot = useHydroponicsStore((s) => s.selectedSnapshot);
  const setSelectedSnapshotById = useHydroponicsStore(
    (s) => s.setSelectedSnapshotById
  );

  return (
    <Sheet
      open={!!selectedSnapshot}
      onOpenChange={() => setSelectedSnapshotById(null)}
    >
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>Snapshot Detail</SheetTitle>
          <SheetDescription>
            Detailed view of the selected snapshot.
          </SheetDescription>
        </SheetHeader>

        {selectedSnapshot ? (
          <div className="mt-4 space-y-3">
            {Object.entries(selectedSnapshot).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <div className="font-medium capitalize">{key}</div>
                <div className="text-sm text-gray-700 mt-1">
                  {value === null ? (
                    <span className="italic text-gray-400">(no data)</span>
                  ) : Array.isArray(value) ? (
                    value.length === 0 ? (
                      <span className="italic text-gray-400">(empty list)</span>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {value.map((item, idx) => (
                          <li key={idx} className="text-gray-600">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                {item.filename || item.url}
                              </a>
                            ) : (
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(item, null, 2)}
                              </pre>
                            )}
                          </li>
                        ))}
                      </ul>
                    )
                  ) : typeof value === "object" ? (
                    <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No snapshot selected.</p>
        )}

        <SheetFooter className="mt-4">
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
