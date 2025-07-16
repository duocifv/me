

import { ReactNode, Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";

export type ResourceProps<T> = {
  // Hàm fetcher trả về Promise chứa dữ liệu với dạng { data: T }
  value: () => Promise<T>;
  // Callback hiển thị khi đang tải (fallback cho Suspense)
  onPending?: () => ReactNode;
  // Callback bắt buộc nhận vào dữ liệu đã resolve và trả về ReactNode
  onResolved: (value: T) => ReactNode;
  // Callback tùy chọn khi có lỗi xảy ra, nhận vào Error và trả về ReactNode
  onRejected?: (reason: Error) => ReactNode;
};

export default async function Resource<T>({
  value,
  onPending = () => <div>Loading...</div>,
  onResolved,
  onRejected = (err: Error) => <div>Error: {err.message}</div>,
}: ResourceProps<T>) {
  return (
    <ErrorBoundary fallback={onRejected(new Error("Something went wrong"))}>
      <Suspense fallback={onPending()}>
        <ResourceContent<T>
          value={value}
          onResolved={onResolved}
          onRejected={onRejected}
        />
      </Suspense>
    </ErrorBoundary>
  );
}


async function ResourceContent<T>({
  value,
  onResolved,
  onRejected,
}: ResourceProps<T>): Promise<ReactNode> {
  try {
    const result = await value();
    return onResolved(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return onRejected ? onRejected(error) : <div>Error: {error.message}</div>;
    }
    return onRejected
      ? onRejected(new Error("Unknown error"))
      : <div>Error: Unknown error</div>;
  }
}

