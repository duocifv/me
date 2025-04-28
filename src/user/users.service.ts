import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto, UserSchema } from './dto/user.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly rolesService: RolesService,
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

    const defaultRole = await this.rolesService.findRoleByName('USER');

    const permissions = await this.rolesService.findPermissionsByNames([
      'READ',
      'CREATE',
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
    return this.usersRepo.findOneOrFail({ where: { email } });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    const matches = await this.compareToken(password, user.password);
    if (!matches) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }
}
