"use client";
import { useEffect } from "react";
import isEqual from "lodash/isEqual";
import { useMediaQuery } from "@adapter/media/media.hook";
import { useMediaStore } from "@adapter/media/media.store";

export default function MediaLoader() {
  const { isLoading, error, isSuccess, data } = useMediaQuery();
  useEffect(() => {
    if (isSuccess && data) {
      const storeData = useMediaStore.getState().data;
      if (!isEqual(storeData, data)) {
        useMediaStore.setState({ data });
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
