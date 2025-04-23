
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { db } from '../ormconfig';
import { User } from '../entity/User';

export class UserService {

  async findAll() {
    const result = await db.manager.find(User)
    return result;
  }

  async findOne(id: number) {
    return await db.select().from(User).where(eq(User.id, id));
  }

  async create(data: CreateUserDto) {
    const [result] = await db.insert(User).values(data);
    return result;
  }

  async update(id: number, body: CreateUserDto) {
    return await db
      .update(User)
      .set(body)
      .where(eq(User.id, id))
  }

  async remove(id: number) {
    return db.delete(User).where(eq(User.id, id));
  }
}