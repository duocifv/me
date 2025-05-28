import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Picture } from "@/components/share/picture/ui-picture";

interface MediaItem {
  id: string;
  variants: {
    medium?: string;
  };
}

interface MediaPickerProps {
  data: MediaItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  error?: string;
}

export function MediaPicker({
  data,
  selectedId,
  onSelect,
  error,
}: MediaPickerProps) {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label>Choose image</Label>
      <div className="col-span-3">
        <div className="grid grid-cols-3 gap-2">
          {data.map(({ id, variants }) =>
            variants.medium ? (
              <div
                key={id}
                className={`p-1 rounded cursor-pointer transition ${
                  selectedId === id
                    ? "border-primary ring-2 ring-primary"
                    : "border border-transparent hover:border-muted"
                }`}
                onClick={() => onSelect(id)}
              >
                <Picture
                  src={variants.medium}
                  alt="thumbnail"
                  className="h-20 w-full object-cover rounded"
                />
              </div>
            ) : null
          )}
        </div>
        <Input type="hidden" value={selectedId} readOnly />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
}
