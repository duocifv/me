import { RolesApi } from "./roles.service";
import { $get, $put } from "../share/api/apiClient";
import { RoleDto, RoleFullDto, RoleListSchema } from "./dto/roles.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Roles } from "./dto/roles.enum";

jest.mock("../share/api/apiHelpers");

const mockedGet = $get as jest.MockedFunction<typeof $get>;
const mockedPut = $put as jest.MockedFunction<typeof $put>;

describe("RolesApi", () => {
  let api: RolesApi;

  beforeEach(() => {
    api = new RolesApi();
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should fetch roles and parse with RoleListSchema", async () => {
      const input: RoleFullDto[] = [
        {
          id: "ea03fba3-50b3-4412-a02f-7bb4f0e79f1f",
          name: Roles.CUSTOMER,
          description: null,
          permissions: [
            {
              id: "a7d855aa-40ae-4c7a-8bb3-450cc16f0175",
              name: "VIEW_USERS",
            },
          ],
          users: [],
        },
      ];
      mockedGet.mockResolvedValue(input);

      const parseSpy = jest
        .spyOn(RoleListSchema, "parse")
        .mockImplementation(() => input);

      const result = await api.getAll();

      expect(mockedGet).toHaveBeenCalledWith("roles");
      expect(parseSpy).toHaveBeenCalledWith(input);
      expect(result).toEqual(input);

      parseSpy.mockRestore();
    });
  });

  describe("getById", () => {
    it("should fetch a role by id", async () => {
      const id = "123";
      const role: RoleDto = {
        id: "ea03fba3-50b3-4412-a02f-7bb4f0e79f1f",
        name: Roles.CUSTOMER,
        description: null,
        permissions: [
          {
            id: "a7d855aa-40ae-4c7a-8bb3-450cc16f0175",
            name: "VIEW_USERS",
          },
        ],
      };
      mockedGet.mockResolvedValue(role);

      const result = await api.getById(id);

      expect(mockedGet).toHaveBeenCalledWith(`roles/${id}`);
      expect(result).toEqual(role);
    });
  });

  describe("update", () => {
    it("should update role with given id and dto", async () => {
      const id = "456";
      const dto: UpdateRoleDto = {
        permissions: ["a7d855aa-40ae-4c7a-8bb3-450cc16f0175"],
      };
      const updated: RoleDto = {
        id: "ea03fba3-50b3-4412-a02f-7bb4f0e79f1f",
        name: Roles.CUSTOMER,
        description: null,
        permissions: [
          {
            id: "a7d855aa-40ae-4c7a-8bb3-450cc16f0175",
            name: "VIEW_USERS",
          },
        ],
      };
      mockedPut.mockResolvedValue(updated);

      const result = await api.update(id, dto);

      expect(mockedPut).toHaveBeenCalledWith(`roles/${id}`, dto);
      expect(result).toEqual(updated);
    });
  });
});
