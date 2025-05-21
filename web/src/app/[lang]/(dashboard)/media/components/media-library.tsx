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
import dynamic from "next/dynamic";
import AppLoading from "../../components/app-loading";
import { ButtonMediaDeleteMany } from "../dispatch/dispatch-media-delete-many";

const ButtonMediaDelete = dynamic(
  () => import("../dispatch/dispatch-media-delete-one")
);

const ButtonUpload = dynamic(
  () => import("../dispatch/dispatch-media-upload"),
  {
    loading: () => <AppLoading />,
  }
);
const FileUpload = dynamic(() => import("./media-file-upload"), {
  loading: () => <AppLoading />,
});

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
              <DialogClose asChild></DialogClose>
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
        <ButtonMediaDeleteMany />
      </div>

      <div className="overflow-auto bg-white">
        <ImageManager />
        <ButtonMediaDelete />
      </div>
    </div>
  );
}
