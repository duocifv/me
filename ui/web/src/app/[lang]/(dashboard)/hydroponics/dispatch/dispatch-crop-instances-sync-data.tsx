"use client";
import { useCropInstancesQuery } from "@adapter/hydroponics/hydroponics.hook.";

export default function CropInstancesSyncData() {
  const { isLoading, error } = useCropInstancesQuery();
  // useEffect(() => {
  //   if (isSuccess && data) {
  //     const storeData = usePlantTypeStore.getState().data;
  //     if (!isEqual(storeData, data)) {
  //       usePlantTypeStore.setState({ data });
  //     }
  //   }
  // }, [data, isSuccess]);

  if (isLoading) {
    return <>Loading…</>;
  }
  if (error) {
    return <>Error… {error.message}</>;
  }

  return null;
}
