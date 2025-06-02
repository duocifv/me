import { renderHook, waitFor } from "@testing-library/react";
import { createTanstackProvider } from "../share/provider/testTanstack";
import { useSnapshotsQuery } from "./hydroponics.hook.";

describe("Hydroponics hook", () => {
  const wrapper = createTanstackProvider();

  test("should fetch users from real API", async () => {
    const { result } = renderHook(() => useSnapshotsQuery(), { wrapper });

    // Nếu hook chạy lỗi, test sẽ fail ở bước isError
    await waitFor(
      () => {
        if (result.current.isError) {
          // Log xem lỗi gì để biết nguyên nhân
          console.error("API Error:", result.current.error);
          throw new Error("useUsersQuery returned isError=true");
        }
        return result.current.isSuccess;
      },
      { timeout: 5000 }
    );

    console.log("result", result.current.data);
    // // Đến đây chắc chắn isSuccess = true
    // expect(result.current.data).toBeDefined();
    // expect(Array.isArray(result.current.data)).toBe(true);
  });
});
