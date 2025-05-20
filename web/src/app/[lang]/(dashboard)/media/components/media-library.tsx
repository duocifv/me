"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ImageManager } from "./media-table";
import { X } from "lucide-react";
import { FileUpload } from "./file-upload";
import { ButtonUpload } from "./dispatch/button-upload";

export default function ImageLibrary() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Upload</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                >
                  <X />
                </Button>
              </DialogClose>
            </DialogHeader>
            <FileUpload />
            <div className="mt-4 flex justify-end space-x-2">
              <ButtonUpload />
              <DialogClose asChild>
                <Button variant="outline">Hủy</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-auto bg-white">
        <ImageManager />
      </div>
    </div>
  );
}
