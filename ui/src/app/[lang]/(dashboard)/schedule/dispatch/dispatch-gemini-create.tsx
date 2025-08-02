import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateGeminiMutation } from "@/module/device/device.hook.";


export default function CreateGeminiSubmit() {
  const { mutate, isPending } = useCreateGeminiMutation()
  return (
    <Button
      onClick={()=>mutate()}
      className="w-32"
      disabled={isPending}
    >
      {isPending ? <Loader2 className="animate-spin" /> : "Áp dụng lịch từ AI"}
    </Button>
  );
}
