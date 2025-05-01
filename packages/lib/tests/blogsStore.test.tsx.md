// import { renderHook, waitFor } from "@testing-library/react";
// import { blogsStore } from "../../src/blog/store";
// import { wrapper } from "~/share/components/test-utils";
// import { faker } from "@faker-js/faker";
// import { blogService } from "../../src/blog/service";

// // 👇 Không mock ở đây nữa

// describe("blogsStore", () => {
//   const mockData = {
//     data: [
//       {
//         id: faker.number.int(),
//         title: faker.lorem.sentence(),
//         content: faker.lorem.paragraph(),
//         author: faker.person.fullName(),
//         category: faker.commerce.department(),
//       },
//     ],
//     meta: {
//       page: 1,
//       pageSize: 10,
//       totalPages: 1,
//       totalRecords: 1,
//     },
//   };

//   beforeEach(() => {
//     jest.mock("../service", () => ({
//       blogService: jest.fn(() => ({
//         getAll: jest.fn().mockResolvedValue(mockData),
//       })),
//     }));
//   });

//   it("sử dụng placeholderData là value truyền vào lần đầu", async () => {
//     const { result } = renderHook(() => blogsStore().useGetAll(mockData), {
//       wrapper,
//     });
//     await waitFor(() => result.current.isSuccess);
//     expect(result.current.data).toEqual(mockData);
//   });
  
//   it("placeholderData là keepPreviousData ở lần sau", async () => {
//     const { result, rerender } = renderHook(() => blogsStore().useGetAll(mockData), {
//       wrapper,
//     });

//     // Lần đầu: vẫn là mockData
//     expect(result.current.data).toEqual(mockData);

//     await waitFor(() => result.current.isSuccess);
//     expect(result.current.data).toEqual(mockData);

//     // rerender để mô phỏng lần sau
//     rerender();
//     expect(result.current.data).toEqual(mockData); 
//   });
// });
import { renderHook, waitFor } from "@testing-library/react";
// import { blogsStore } from "../../src/blog/store";
// import { wrapper } from "~/share/components/test-utils";
// import { faker } from "@faker-js/faker";
// import { blogService } from "../../src/blog/service";

// // 👇 Không mock ở đây nữa

// describe("blogsStore", () => {
//   const mockData = {
//     data: [
//       {
//         id: faker.number.int(),
//         title: faker.lorem.sentence(),
//         content: faker.lorem.paragraph(),
//         author: faker.person.fullName(),
//         category: faker.commerce.department(),
//       },
//     ],
//     meta: {
//       page: 1,
//       pageSize: 10,
//       totalPages: 1,
//       totalRecords: 1,
//     },
//   };

//   beforeEach(() => {
//     jest.mock("../service", () => ({
//       blogService: jest.fn(() => ({
//         getAll: jest.fn().mockResolvedValue(mockData),
//       })),
//     }));
//   });

//   it("sử dụng placeholderData là value truyền vào lần đầu", async () => {
//     const { result } = renderHook(() => blogsStore().useGetAll(mockData), {
//       wrapper,
//     });
//     await waitFor(() => result.current.isSuccess);
//     expect(result.current.data).toEqual(mockData);
//   });
  
//   it("placeholderData là keepPreviousData ở lần sau", async () => {
//     const { result, rerender } = renderHook(() => blogsStore().useGetAll(mockData), {
//       wrapper,
//     });

//     // Lần đầu: vẫn là mockData
//     expect(result.current.data).toEqual(mockData);

//     await waitFor(() => result.current.isSuccess);
//     expect(result.current.data).toEqual(mockData);

//     // rerender để mô phỏng lần sau
//     rerender();
//     expect(result.current.data).toEqual(mockData); 
//   });
// });
