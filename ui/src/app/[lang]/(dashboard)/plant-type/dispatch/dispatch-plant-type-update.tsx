import { useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { throttle } from "lodash";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useUpdatePlantTypeMutation } from "@adapter/plant-type/plant-type.hook.";
import { PlantTypeDto } from "@adapter/plant-type/dto/plant-type-list.dto";
import { MediaPicker } from "../../media/components/media-picker";

// giả lập media list (bạn thay bằng API lấy danh sách ảnh thực tế)
const mediaList = [
  { id: "1", variants: { medium: "/images/plant1.jpg" } },
  { id: "2", variants: { medium: "/images/plant2.jpg" } },
  { id: "3", variants: { medium: "/images/plant3.jpg" } },
];

interface UpdatePlantTypeSheetProps {
  plant: PlantTypeDto;
}

export default function UpdatePlantTypeSheet({
  plant,
}: UpdatePlantTypeSheetProps) {
  const [form, setForm] = useState({
    slug: plant.slug || "",
    displayName: plant.displayName || "",
    mediaFileId: plant.mediaFileId || "",
  });

  const { mutate, isPending } = useUpdatePlantTypeMutation();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const throttledSubmit = throttle(
    () => {
      mutate(
        { id: plant.id, dto: form },
        {
          onSuccess: () => {
            toast.success("Cập nhật thành công", {
              duration: 5000,
              icon: <CheckCircle className="h-5 w-5 text-green-500" />,
            });
          },
          onError: () => {
            toast.error("Cập nhật thất bại", {
              duration: 5000,
              icon: <XCircle className="h-5 w-5 text-red-500" />,
            });
          },
        }
      );
    },
    300,
    { trailing: false }
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-yellow-500 text-yellow-700 hover:bg-yellow-100 rounded-full"
        >
          Edit
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update Plant Type</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="displayName">Display Name</Label>
          <div className="col-span-3">
            <Input
              id="displayName"
              value={form.displayName}
              onChange={(e) =>
                handleChange("displayName", e.currentTarget.value)
              }
            />
          </div>
        </div>
        <div className="space-y-4 py-4 px-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="slug">Slug</Label>
            <div className="col-span-3">
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.currentTarget.value)}
              />
            </div>
          </div>

          <MediaPicker
            data={mediaList}
            selectedId={form.mediaFileId}
            onSelect={(id) => handleChange("mediaFileId", id)}
            error={!form.mediaFileId ? "Vui lòng chọn hình ảnh" : ""}
          />
        </div>

        <SheetFooter>
          <Button
            className="w-full"
            onClick={throttledSubmit}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Confirm"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
