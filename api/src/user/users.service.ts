import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { IsNull, MoreThan, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto, UserListSchema, UserSchema } from './dto/user.dto';
import { RolesService } from 'src/roles/roles.service';
import { PermissionName } from 'src/permissions/permission.enum'; // Import PermissionName enum
import { Roles } from 'src/roles/role.enum';
import { PaginationService } from 'src/shared/pagination/pagination.service';
import { GetUsersDto } from './dto/get-users.dto';
import { UserStatsDto, UserStatsSchema } from './dto/user-stats.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly paginationService: PaginationService,
  ) {}

  private async hashToken(token: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(token, saltRounds);
  }

  private async compareToken(
    rawToken: string,
    storedToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(rawToken, storedToken);
  }

  async getUsers(dto: GetUsersDto) {
    const { page, limit, ...filters } = dto;
    console.log('dto 1---->', dto);
    const qb = this.usersRepo.createQueryBuilder('user');
    const paginate = await this.paginationService.paginate(
      qb,
      { page, limit },
      '/users',
      filters,
      ['email'],
    );
    const validatedData = UserListSchema.parse(paginate.items);
    return {
      items: validatedData,
      meta: paginate.meta,
      link: paginate.links,
    };
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    const exists = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hash = await this.hashToken(dto.password);

    const user = this.usersRepo.create({ email: dto.email, password: hash });
    const createdUser = await this.usersRepo.save(user);

    // Lấy vai trò mặc định là 'USER'
    const defaultRole = await this.rolesService.findRoleByName(Roles.CUSTOMER);

    // Lấy quyền của vai trò USER
    const permissions = await this.rolesService.findPermissionsByNames([
      PermissionName.VIEW_PRODUCTS, // Ví dụ quyền xem sản phẩm
      PermissionName.PLACE_ORDER, // Ví dụ quyền đặt hàng
    ]);

    // Gán vai trò và quyền cho người dùng
    user.roles = [defaultRole];
    await this.rolesService.assignPermissionsToRole(defaultRole, permissions);

    await this.usersRepo.save(user);

    return UserSchema.parse(createdUser);
  }

  // Tìm người dùng theo ID
  async findById(id: string): Promise<User> {
    return this.usersRepo.findOneOrFail({ where: { id } });
  }

  // Tìm người dùng theo email
  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  // Xác thực người dùng
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    const matches = await this.compareToken(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  async getUsersWithStats(): Promise<UserStatsDto> {
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      this.usersRepo.count({ where: { deletedAt: IsNull() } }),
      this.usersRepo.count({ where: { isActive: true, deletedAt: IsNull() } }),
      this.usersRepo.count({
        where: {
          createdAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
          deletedAt: IsNull(),
        },
      }),
    ]);

    return UserStatsSchema.parse({
      totalUsers,
      activeUsers,
      newUsers,
      conversionRate: 0,
    });
  }
}
