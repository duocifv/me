import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[200px] p-6",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Đang tải nội dung...</p>
    </div>
  );
}
