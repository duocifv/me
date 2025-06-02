jest.mock("../share/api/apiHelpers", () => ({
  $get: jest.fn(),
  $post: jest.fn(),
  $put: jest.fn(),
  $del: jest.fn(),
}));

import { $get, $put, $del } from "../share/api/apiClient";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { GetUsersSchema } from "./dto/get-users.dto";
import { UpdateByAdminDto } from "./dto/update-by-admin.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { IUserListResponse } from "./dto/user-list.dto";
import { UserDto, UserListDto } from "./dto/user.dto";
import { UsersApi } from "./users.service";

describe("UsersApi", () => {
  let api: UsersApi;

  beforeEach(() => {
    api = new UsersApi();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("gọi $get với đúng endpoint và params, trả về data", async () => {
      const items: UserListDto = [
        {
          id: "1141f3a6-18b7-41e5-877d-46ec79f909cb",
          email: "admin@example.com",
          roles: [],
          isActive: true,
          isPaid: false,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockResponse: IUserListResponse = {
        items,
        stats: {
          totalUsers: 1,
          activeUsers: 1,
          newUsers: 0,
          conversionRate: 100,
        },
        meta: {
          itemCount: 1,
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
        },
      };
      ($get as jest.Mock).mockResolvedValue(mockResponse);

      const query = {
        page: 1,
        limit: 10,
        search: "",
        status: "pending",
        isActive: true,
        isPaid: false,
      };
      const result = await api.getAll(query);

      expect(GetUsersSchema.parse(query)).toEqual(query);
      expect($get).toHaveBeenCalledWith("users", query);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getById", () => {
    it("gọi $get với đúng endpoint và trả về UserDto", async () => {
      const mockUser: UserDto = {
        id: "4d7d80ef-8ef9-41fa-858a-f3de9a5470b0",
        email: "admin@example.com",
        roles: [],
        isActive: true,
        isPaid: false,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      ($get as jest.Mock).mockResolvedValue(mockUser);

      const result = await api.getById("4d7d80ef-8ef9-41fa-858a-f3de9a5470b0");
      expect($get).toHaveBeenCalledWith(
        "users/4d7d80ef-8ef9-41fa-858a-f3de9a5470b0"
      );
      expect(result).toEqual(mockUser);
    });
  });

  // describe("create", () => {
  //   it("gọi $post với payload và trả về UserDto", async () => {
  //     const payload: Partial<UserDto> = { name: "Charlie" };
  //     const mockUser: UserDto[] = [
  //       {
  //         id: "1141f3a6-18b7-41e5-877d-46ec79f909cb",
  //         email: "admin@example.com",
  //         roles: [],
  //         isActive: true,
  //         isPaid: false,
  //         status: "pending",
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //       },
  //     ];
  //     ($post as jest.Mock).mockResolvedValue({ data: mockUser });

  //     const result = await api.create(payload);
  //     expect($post).toHaveBeenCalledWith<UserDto>("users", payload);
  //     expect(result).toEqual(mockUser);
  //   });
  // });

  describe("update", () => {
    it("gọi $put với đúng id và dto, trả về UserDto", async () => {
      const dto: UpdateByAdminDto = {
        isActive: true,
        isPaid: true,
        roles: ["ADMIN"],
      };
      const mockUser: UserDto = {
        id: "1141f3a6-18b7-41e5-877d-46ec79f909cb",
        email: "admin@example.com",
        roles: [],
        isActive: true,
        isPaid: false,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      ($put as jest.Mock).mockResolvedValue(mockUser);

      const result = await api.update(
        "1141f3a6-18b7-41e5-877d-46ec79f909cb",
        dto
      );
      expect($put).toHaveBeenCalledWith(
        "users/1141f3a6-18b7-41e5-877d-46ec79f909cb",
        dto
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("changePassword", () => {
    it("gọi $put với đúng endpoint và dto, trả về void", async () => {
      const dto: ChangePasswordDto = {
        password: "string22",
      };

      ($put as jest.Mock).mockResolvedValueOnce(204);

      const result = await api.changePassword(
        "aac398b6-35e7-4016-b950-095b8994f7e7",
        dto
      );
      expect($put).toHaveBeenCalledWith(
        "users/aac398b6-35e7-4016-b950-095b8994f7e7/password",
        dto
      );
      expect(result).toBe(204);
    });
  });

  describe("updateProfile", () => {
    it("gọi $put với đúng endpoint và dto, trả về UserDto", async () => {
      const dto: UpdateProfileDto = {
        status: "active",
      };
      const mockUser: UserDto = {
        id: "aac398b6-35e7-4016-b950-095b8994f7e7",
        email: "user214@example.com",
        roles: [],
        isActive: true,
        isPaid: false,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      ($put as jest.Mock).mockResolvedValue(mockUser);

      const result = await api.updateProfile(
        "aac398b6-35e7-4016-b950-095b8994f7e7",
        dto
      );
      expect($put).toHaveBeenCalledWith(
        "users/aac398b6-35e7-4016-b950-095b8994f7e7/profile",
        dto
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe("remove", () => {
    it("gọi $del với đúng endpoint, trả về void", async () => {
      ($del as jest.Mock).mockResolvedValue(undefined);

      const result = await api.remove("7");
      expect($del).toHaveBeenCalledWith("users/7");
      expect(result).toBeUndefined();
    });
  });
});
