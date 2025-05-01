"use client";

import { blogsStore } from "@adapter/blog/store";
import { useEffect } from "react";

export default function BlogMessage() {
  const alert = blogsStore((state) => state.alert);

  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => {
        return blogsStore.setState({
          alert: null,
        });
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [alert]);

  return (
    <>
      {alert?.type === "error" && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-error">
            <span>Error: {alert?.message}</span>
          </div>
        </div>
      )}
      {alert?.type === "success" && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success">
            <span>Success: {alert?.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
