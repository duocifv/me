"use client";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import { useAiQuery } from "@/module/ai/ai.hook";
import { useAIStore } from "@/module/ai/ai.store";

export default function AISyncData() {
  const { isLoading, error, isSuccess, data } = useAiQuery();
  useEffect(() => {
    if (isSuccess && data) {
      const storeData = useAIStore.getState().data;
      if (!isEqual(storeData, data)) {
        useAIStore.setState({ data });
      }
    }
  }, [data, isSuccess]);

  if (isLoading) {
    return <>Loading…</>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return null;
}
