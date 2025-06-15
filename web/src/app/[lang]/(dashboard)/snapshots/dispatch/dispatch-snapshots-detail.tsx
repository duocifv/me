"use client";

import { Picture } from "@/components/share/picture/ui-picture";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";
import { $t } from "@/app/lang";

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
      {selectedSnapshot ? (
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>
              {$t`Snapshot #`}
              {selectedSnapshot.id}
            </SheetTitle>
          </SheetHeader>
          <div>
            {selectedSnapshot.images.length > 0 ? (
              <Picture
                src={"/uploads/esp32/" + selectedSnapshot.images[0].filePath}
                className="h-20 w-full object-cover rounded-t-xl"
              />
            ) : (
              <div className="h-20 w-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-md">
                {$t`Không có hình ảnh`}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {Object.entries(selectedSnapshot).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <div className="font-medium capitalize">{key}</div>
                <div className="text-sm text-gray-700 mt-1">
                  {value === null ? (
                    <span className="italic text-gray-400">
                      {$t`(không có dữ liệu)`}
                    </span>
                  ) : Array.isArray(value) ? (
                    value.length === 0 ? (
                      <span className="italic text-gray-400">
                        {$t`(danh sách trống)`}
                      </span>
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

          <SheetFooter className="mt-4">
            <Button type="submit">{$t`Lưu thay đổi`}</Button>
            <SheetClose asChild>
              <Button variant="outline">{$t`Đóng`}</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          {$t`Không có snapshot nào được chọn.`}
        </p>
      )}
    </Sheet>
  );
}
