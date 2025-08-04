"use client";
import { useEffect, useState } from "react";
import isEqual from "lodash/isEqual";
import { useDeviceConfigStore } from "@/module/device/device.store";
import { useDeviceGeminiQuery } from "@/module/device/device.hook.";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function GeminiSyncData() {
  const [trigger, setTrigger] = useState<boolean>(false);

  const { isLoading, error, isSuccess, data } = useDeviceGeminiQuery(trigger);
  useEffect(() => {
    if (isSuccess && data) {
      const storeData = useDeviceConfigStore.getState().gemini;
      if (!isEqual(storeData, data)) {
        useDeviceConfigStore.setState({ gemini: data });
        setTrigger(false);
      }
    }
  }, [data, isSuccess]);

  if (isLoading) {
    return <>Loading…</>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return (
    !trigger && (
      <Button
        disabled={isLoading}
        variant="outline"
        onClick={() => setTrigger(true)}
        className="bg-orange-200 flex items-center gap-2"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Đang tạo..." : "Tạo lịch tưới AI"}
      </Button>
    )
  );
}
