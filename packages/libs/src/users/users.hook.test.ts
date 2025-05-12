import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers } from "./users";
import { createTanstackProvider } from "../share/provider/testTanstack";
import { usersApi } from "./users.service";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";

// Mock các phương thức của usersApi
jest.mock("./users.api", () => ({
  usersApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

describe("useUsers hook", () => {
  const wrapper = createTanstackProvider();

  // Thiết lập mock trả về dữ liệu rỗng để tránh lỗi từ React Query
  beforeEach(() => {
    (usersApi.getAll as jest.Mock).mockResolvedValue({
      data: [],
    });
  });

  // Cleanup mocks sau mỗi test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("setFilters cập nhật filters đúng", async () => {
    const { result } = renderHook(() => useUsers(), { wrapper });

    // Cập nhật filters
    act(() => {
      result.current.setFilters({ page: 2, limit: 5, search: "foo" });
    });

    await waitFor(() => {
      expect(result.current.filters).toEqual({
        page: 2,
        limit: 5,
        search: "foo",
        status: "pending",
        isActive: true,
        isPaid: false,
      });
    });
  });

  it("updateUser gọi API đúng khi cập nhật người dùng", async () => {
    const { result } = renderHook(() => useUsers(), { wrapper });
    const mockUpdateData: UpdateByAdminDto = { isActive: true };
    const userId = "user123";

    (usersApi.update as jest.Mock).mockResolvedValueOnce({
      data: { id: userId, ...mockUpdateData },
    });

    // Thực hiện mutateAsync
    await act(async () => {
      await result.current.updateUser.mutateAsync({
        id: userId,
        dto: mockUpdateData,
      });
    });

    // Kiểm tra nếu API được gọi đúng với tham số
    expect(usersApi.update).toHaveBeenCalledWith(userId, mockUpdateData);
  });

  it("deleteUser gọi API đúng khi xóa người dùng", async () => {
    const { result } = renderHook(() => useUsers(), { wrapper });
    const userId = "user123";

    (usersApi.remove as jest.Mock).mockResolvedValueOnce({
      data: { id: userId },
    });

    // Thực hiện mutateAsync
    await act(async () => {
      await result.current.deleteUser.mutateAsync(userId);
    });

    // Kiểm tra nếu API được gọi đúng với tham số
    expect(usersApi.remove).toHaveBeenCalledWith(userId);
  });
});
