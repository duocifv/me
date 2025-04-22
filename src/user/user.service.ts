
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { db } from '../schema/config';
import { User } from '../schema/user.schema';

export class UserService {
  
  async create(data: CreateUserDto) {
    const [result] = await db.insert(User).values(data);
    return result;
  }

  async findAll() {
    const result = await db.select().from(User).execute()
    return result;
  }

  findOne(id: number) {
    return db.select().from(User).where(eq(User.id, id));
  }

  update(id: number, data: Partial<CreateUserDto>) {
    return db
      .update(User)
      .set(data)
      .where(eq(User.id,id))
  }

  remove(id: number) {
    return db.delete(User).where(eq(User.id,id));
  }
}