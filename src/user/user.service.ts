import { User } from 'src/entity/User';
import error from 'http-errors';
import { CreateUserDto, SelectDto, UpdateUserDto } from './user.dto';
import { Repository } from 'typeorm';

export class UserService {
  private readonly userRepo: Repository<User>;

  async findAll(take: number, skip: number) {
    return this.userRepo.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(dto: SelectDto) {
    return this.userRepo.findOneOrFail({ where: { id: dto.id } });;
  }

  async create(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async update(dto: UpdateUserDto) {
    const user = await this.userRepo.preload(dto);
    if (!user) {
      throw new error.NotFound();
    }
    return this.userRepo.save(user);
  }

  async remove(dto: SelectDto) {
    const result = await this.userRepo.delete({ id: dto.id });
    if (result.affected === 0) {
      throw new error.NotFound();
    }
    return true;
  }
}
