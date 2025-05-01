// tests/categories.test.ts
import { createApp } from "../../../api/src/app";
import supertest from "supertest";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;

beforeAll(async () => {
  app = await createApp(); // Giả sử bạn đã có hàm tạo app từ trước
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Categories API", () => {
  it("should return a list of categories", async () => {
    const response = await supertest(app.server).get("/categories");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should return 204 when there are no categories", async () => {
    // Bạn cần mock repo.findMany để trả về kết quả rỗng nếu cần
    const response = await supertest(app.server).get("/categories");
    expect(response.statusCode).toBe(204);
    expect(response.body.message).toBe("no conent");
  });

  it("should add a category", async () => {
    const newCategory = {
      name: "New Category",
      description: "A new category description",
    };

    const response = await supertest(app.server)
      .post("/categories")
      .send(newCategory);

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe(newCategory.name);
    expect(response.body.description).toBe(newCategory.description);
  });

  it("should return 400 when adding a category fails", async () => {
    const invalidCategory = {
      name: "", // Giả sử tên rỗng là không hợp lệ
    };

    const response = await supertest(app.server)
      .post("/categories")
      .send(invalidCategory);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("add-faild");
  });
});
