import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { findAllbookings } from "./service";
import { useStoreBookings } from "./store";

export default function FetchBookings() {
  const setBookings = useStoreBookings((s) => s.setBookings);
  const { isLoading, isError, error, data, isSuccess } = useQuery({
    queryKey: ["bookings"],
    queryFn: ({ signal }) => findAllbookings({ signal }),
  });

  useEffect(() => {
    if (isSuccess && Array.isArray(data) && data.length > 0) {
      setBookings(data);
    }
  }, [isSuccess, data, setBookings]);

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
