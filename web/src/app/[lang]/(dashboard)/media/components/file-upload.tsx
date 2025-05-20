"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useMediaStore } from "@adapter/media/media.store";
import { FileUploadSchema } from "@adapter/media/dto/media-upload.dto";

// Define Zod schema for file validation

export function FileUpload() {
  const file = useMediaStore((s) => s.file);
  const fileInfo = useMediaStore((s) => s.fileInfo);
  const setFile = useMediaStore((s) => s.setFile);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (fileList: FileList | null) => {
    setError(null);
    if (!fileList || fileList.length === 0) return;
    const selected = fileList[0];

    const result = FileUploadSchema.safeParse(selected);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    if (!selected.type.startsWith("image/")) {
      setError("File is not an image");
      return;
    }

    const isDuplicate = fileInfo.some(
      (f) => f.name === selected.name && f.size === selected.size
    );
    if (isDuplicate) {
      setError("Ảnh này đã được tải rồi");
      return;
    }

    setFile(selected);
  };

  const handleRemove = () => {
    setError(null);
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const preventDefault = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleSelect(e.dataTransfer.files);
  };

  return (
    <Card className="border-dashed border-2 border-gray-300 p-0">
      {/* <CardHeader>
        <CardTitle>Chọn ảnh</CardTitle>
      </CardHeader> */}
      <CardContent
        className="p-4 min-h-36 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition relative"
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        onDragLeave={preventDefault}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleSelect(e.target.files)}
          aria-label="Chọn ảnh để upload"
        />

        {error && (
          <div>
            <p className="mb-2 text-sm text-red-600">{error} </p>
            <Button variant="outline" size="sm">
              Chọn ảnh
            </Button>
          </div>
        )}

        {!file && !error && (
          <>
            <p className="mb-2 text-sm text-gray-600">
              Kéo thả ảnh vào đây hoặc nhấp để chọn
            </p>
            <Button variant="outline" size="sm">
              Chọn ảnh
            </Button>
          </>
        )}

        {file && (
          <div className="w-full">
            <div className="flex items-center justify-between bg-gray-100 rounded p-2">
              <div className="flex items-center gap-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-16 w-16 object-cover rounded"
                />
                <span className="text-sm truncate max-w-xs">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Xóa ảnh"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
