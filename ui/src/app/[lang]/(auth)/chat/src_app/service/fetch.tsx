"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { findAllRooms } from "./service";
import { useStoreRooms } from "./store";

export default function FetchRooms() {
  const setRooms = useStoreRooms((s) => s.setRooms);
  const { isLoading, isError, error, data, isSuccess } = useQuery({
    queryKey: ["rooms"],
    queryFn: ({ signal }) => findAllRooms({ signal }),
  });

  useEffect(() => {
    if (isSuccess && Array.isArray(data) && data.length > 0) {
      setRooms(data);
    }
  }, [isSuccess, data, setRooms]);

  if (isLoading) {
    return <p> Loading...</p>;
  }
  if (isError) {
    return <p>{error?.message || "Failed to fetch data"}</p>;
  }
  if (isSuccess && data.length === 0) {
    return <p>No data found</p>;
  }

  return;
}
