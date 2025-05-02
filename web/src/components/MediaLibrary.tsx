"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileManager } from "./table-media";

// Sample data using Lorem Picsum
const sampleImages = Array.from({ length: 42 }, (_, i) => ({
  id: String(1000 + i),
  url: `https://picsum.photos/id/${1015 + (i % 10)}/300/200`,
  filename: `picsum-${1015 + (i % 10)}.jpg`,
  uploadedAt: `2025-04-${String((i % 30) + 1).padStart(2, "0")}`,
}));

export default function ImageLibrary() {
  const [images, setImages] = useState(sampleImages);
  const [search, setSearch] = useState("");
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("modified-desc");

  const perPage = 10;

  // Filter and sort
  const filtered = useMemo(() => {
    let data = images;
    if (fileTypeFilter !== "all") {
      // Example: filter by extension
      data = data.filter((img) => img.filename.endsWith(fileTypeFilter));
    }
    data = data.filter((img) =>
      img.filename.toLowerCase().includes(search.toLowerCase())
    );
    if (sortOrder === "modified-asc") {
      data = data.sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
    } else {
      data = data.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    }
    return data;
  }, [images, search, fileTypeFilter, sortOrder]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // Handlers
  // const toggleSelect = (id: string) => {
  //   setSelectedIds((prev) =>
  //     prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  //   );
  // };
  // const toggleSelectAll = () => {
  //   const allIds = pageItems.map((i) => i.id);
  //   setSelectedIds((prev) =>
  //     allIds.every((id) => prev.includes(id)) ? [] : allIds
  //   );
  // };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  // const handleDeleteSelected = () => {
  //   if (!selectedIds.length) return;
  //   setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
  //   toast.success(`Đã xóa ${selectedIds.length} ảnh`);
  //   setSelectedIds([]);
  // };
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="space-y-6  px-4 lg:px-6">
      {/* Summary Cards */}

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search files..."
            value={search}
            onChange={handleSearch}
            className="w-64"
          />
          <Button variant="ghost" size="icon">
            {/* Toggle view icons here */}
            <svg>...</svg>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value=".jpg">Images</SelectItem>
              <SelectItem value=".xml">Documents</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Last Modified" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modified-desc">Newest</SelectItem>
              <SelectItem value="modified-asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-auto bg-white">
        <FileManager />

        {/* Pagination */}
        <div className="p-4 flex justify-end items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <img
              src={images.find((i) => i.id === preview)?.url}
              alt={images.find((i) => i.id === preview)?.filename}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
