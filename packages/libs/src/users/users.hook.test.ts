import { renderHook, act } from "@testing-library/react";
import { useUsers } from ".";
import { createTanstackProvider } from "../share/provider/testTanstack";

describe("useUsers hook", () => {
  const wrapper = createTanstackProvider();
  it("setFilters cập nhật filters đúng", () => {
    const { result } = renderHook(() => useUsers(), { wrapper });

    // Ban đầu filters mặc định
    expect(result.current.filters).toEqual({
      page: 1,
      limit: 10,
      search: "",
      status: "pending",
      isActive: 1,
      isPaid: 0,
    });

    // Cập nhật filters
    act(() => {
      result.current.setFilters({ page: 2, limit: 5, search: "foo" });
    });

    expect(result.current.filters).toEqual({
      page: 2,
      limit: 5,
      search: "foo",
      status: "pending", // giữ nguyên
      isActive: 1,
      isPaid: 0,
    });
  });
});
