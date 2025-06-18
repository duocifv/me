import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon } from "lucide-react";
import ButtonDownload from "../dispatch/dispatch-media-download";
import { useMediaStore } from "@adapter/media/media.store";
import { MediaFile } from "@adapter/media/dto/media-pagination";
import { $t } from "@/app/lang";

export default function MediaAction(file: MediaFile) {
  const setFileId = useMediaStore((s) => s.setFileId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <MoreVerticalIcon size={16} />
          <span className="sr-only">{$t`Mở menu`}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onSelect={() => setFileId(file.id)}>
          {$t`Xóa`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ButtonDownload {...file} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
