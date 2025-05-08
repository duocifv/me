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
import { PermissionName } from 'src/permissions/permission.enum';
import { Roles } from 'src/roles/dto/role.enum';
import { PaginationService } from 'src/shared/pagination/pagination.service';
import { GetUsersDto } from './dto/get-users.dto';
import { UserStatsDto, UserStatsSchema } from './dto/user-stats.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateByAdminDto } from './dto/update-by-admin.dto';
import { RoleService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly rolesService: RoleService,
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
    const { page, limit, roles, status, ...filters } = dto;
    const qb = this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role');

    if (roles && roles.length > 0) {
      qb.andWhere('role.name IN (:...roles)', { roles });
    }

    if (status && status.length > 0) {
      qb.andWhere('user.status IN (:...status)', { status });
    }

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

    const defaultRole = await this.rolesService.findRoleByName(Roles.CUSTOMER);
    const permissions = await this.rolesService.findPermissionsByNames([
      PermissionName.VIEW_PRODUCTS,
      PermissionName.PLACE_ORDER,
    ]);

    user.roles = [defaultRole];
    await this.rolesService.assignPermissionsToRole(defaultRole, permissions);

    await this.usersRepo.save(user);

    return UserSchema.parse(createdUser);
  }

  async findById(id: string): Promise<User> {
    return this.usersRepo.findOneOrFail({ where: { id } });
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

  async update(id: string, dto: UpdateByAdminDto): Promise<UserDto> {
    const user = await this.findById(id);
    if (typeof dto.isActive === 'boolean') {
      user.isActive = dto.isActive;
    }

    if (dto?.status) {
      user.status = dto.status;
    }

    if (typeof dto.isPaid === 'boolean') {
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
    user.password = await this.hashToken(dto.password);
    await this.usersRepo.save(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserDto> {
    const user = await this.findById(id);
    if (!dto.status?.length) {
      throw new UnauthorizedException('not found');
    }
    user.status = dto.status[0];
    const updatedUser = await this.usersRepo.save(user);
    return UserSchema.parse(updatedUser);
  }

  // async delete(id: string, adminId: string): Promise<void> {
  //   const user = await this.findById(id);
  //   const admin = await this.findById(adminId);
  //   if (admin.roles.some((role) => role.name === Roles.ADMIN)) {
  //     if (user.id === admin.id) {
  //       throw new UnauthorizedException(
  //         'Admin cannot delete their own account',
  //       );
  //     }
  //   } else {
  //     throw new UnauthorizedException(
  //       'You do not have permission to delete users',
  //     );
  //   }
  //   await this.usersRepo.remove(user);
  // }

  async restore(id: string): Promise<UserDto> {
    const user = await this.findById(id);
    if (user.deletedAt) {
      user.deletedAt = undefined;
      const restoredUser = await this.usersRepo.save(user);
      return UserSchema.parse(restoredUser);
    }
    throw new UnauthorizedException('User is not deleted');
  }
}
