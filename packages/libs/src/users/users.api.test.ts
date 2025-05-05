import { usersApi } from "./users.api";

test("lấy danh sách user từ API thật", async () => {
  // Gọi API thật
  const data = await usersApi.getAll({
    page: 1,
    limit: 10,
    search: "",
    status: "pending",
    isActive: 1,
    isPaid: 0,
  });

  console.log("data", data);

  // Kiểm tra structure
  expect(data).toHaveProperty("items");
  expect(Array.isArray(data.items)).toBe(true);

  expect(data).toHaveProperty("meta");
  expect(data.meta).toHaveProperty("currentPage");
  expect(data.meta).toHaveProperty("itemsPerPage");

  expect(data).toHaveProperty("stats");
  expect(typeof data.stats.totalUsers).toBe("number");
}, 20_000); // timeout 20s
