// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto, UserListSchema, UserSchema } from '../dto/user.dto';
import { PermissionName } from 'src/permissions/permission.enum';
import { Roles } from 'src/roles/dto/role.enum';
import { PaginationService } from 'src/shared/pagination/pagination.service';
import { GetUsersDto } from '../dto/get-users.dto';
import { UserStatsDto, UserStatsSchema } from '../dto/user-stats.dto';
import { ChangePasswordDto } from '../../auth/dto/change-password.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateByAdminDto } from '../dto/update-by-admin.dto';
import { RoleService } from 'src/roles/roles.service';
import { UserStatus } from '../dto/user-status.enum';
import { User } from '../entities/user.entity';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AccountSecurityService } from 'src/auth/v1/account-security.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly rolesService: RoleService,
    private readonly accountSecurityService: AccountSecurityService,
  ) {}

  private escapeLike(str: string): string {
    return str.replace(/'/g, "''").replace(/([\\%_])/g, '\\$1');
  }

  public async hashToken(token: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(token, saltRounds);
  }

  private async compareToken(
    rawToken: string,
    storedToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(rawToken, storedToken);
  }

  async paginateUsers(dto: GetUsersDto): Promise<{
    items: Awaited<ReturnType<typeof UserListSchema.parse>>;
    meta: Pagination<User>['meta'];
  }> {
    const { page, limit, roles, status, search } = dto;

    const qb = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.deleted_at IS NULL');

    // filter theo roles
    if (roles?.length) {
      qb.andWhere('role.name IN (:...roles)', { roles });
    }

    // filter theo search trên email
    if (search) {
      const safe = this.escapeLike(search.trim().toLowerCase());
      qb.andWhere('LOWER(user.email) LIKE :search', { search: `%${safe}%` });
    }

    // filter theo status
    if (status?.length) {
      qb.andWhere('user.status IN (:...status)', { status });
    }

    // paginate
    const result: Pagination<User> = await paginate<User>(qb, {
      page,
      limit,
      route: '/users',
    });

    // zod-validate items
    const validatedItems = UserListSchema.parse(result.items);

    return {
      items: validatedItems,
      meta: result.meta,
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
    // mặc định status pending
    user.status = UserStatus.pending;
    const createdUser = await this.usersRepo.save(user);

    const defaultRole = await this.rolesService.findRoleByName(Roles.CUSTOMER);
    const permissions = await this.rolesService.findPermissionsByNames([
      PermissionName.VIEW_PRODUCTS,
      PermissionName.PLACE_ORDER,
    ]);
    defaultRole.permissions = permissions;
    user.roles = [defaultRole];
    await this.usersRepo.save(user);

    return UserSchema.parse(createdUser);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (this.accountSecurityService.isLocked(user)) {
      throw new UnauthorizedException(
        `Tài khoản bị khóa đến ${user.lockedUntil?.toLocaleString()}`,
      );
    }
    const matches = await this.compareToken(password, user.password);
    if (!matches) {
      await this.accountSecurityService.handleFailedLogin(user);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    await this.accountSecurityService.resetFailedLogin(user);
    return user;
  }

  async getUsersWithStats(): Promise<UserStatsDto> {
    const [totalUsers, activeUsers, newUsers] = await Promise.all([
      this.usersRepo.count({ where: { deletedAt: IsNull() } }),
      this.usersRepo.count({
        where: { status: UserStatus.active, deletedAt: IsNull() },
      }),
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
      conversionRate: activeUsers / (totalUsers || 1),
    });
  }

  async update(id: string, dto: UpdateByAdminDto): Promise<UserDto> {
    const user = await this.findById(id);
    if (dto.status?.length) {
      user.status = dto.status[0];
    }
    if (dto.isPaid !== undefined) {
      user.isPaid = dto.isPaid;
    }
    if (dto.roles?.length) {
      const roleEntities = await Promise.all(
        dto.roles.map((name) => this.rolesService.findRoleByName(name)),
      );
      user.roles = roleEntities;
    }
    const updatedUser = await this.usersRepo.save(user);
    return UserSchema.parse(updatedUser);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(id);

    const isMatch = await this.compareToken(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    user.password = await this.hashToken(dto.newPassword);
    await this.usersRepo.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserDto> {
    const user = await this.findById(id);
    if (dto.email) {
      user.email = dto.email;
    }
    const updatedUser = await this.usersRepo.save(user);
    return UserSchema.parse(updatedUser);
  }

  async saveUser(user: User): Promise<User> {
    return this.usersRepo.save(user);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()),
      },
    });
  }
}
