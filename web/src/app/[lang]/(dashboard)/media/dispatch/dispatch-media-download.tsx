import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MediaFile } from "@adapter/media/dto/media-pagination";
import { useMediaDownloadMutation } from "@adapter/media/media.hook";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ButtonDownload({ variants }: MediaFile) {
  const { mutate: downloadFile, isPending } = useMediaDownloadMutation();
  const filename = variants?.large?.split("/").pop()?.split("?")[0];
  return (
    <DropdownMenuItem
      onClick={() => {
        if (filename) {
          downloadFile(filename, {
            onSuccess: () => {
              toast.success("File đã được tải về máy của bạn.", {
                duration: 5000,
                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
              });
            },
            onError: (err) => {
              toast.error(err.message ?? "Có lỗi xảy ra khi tải file.", {
                duration: 5000,
                icon: <XCircle className="h-5 w-5 text-red-500" />,
              });
            },
          });
        }
      }}
    >
      {isPending ? "Đang tải..." : "Download"}
    </DropdownMenuItem>
  );
}
