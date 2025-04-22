
import { eq } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { db } from '../db/drizzle';
import { users } from '../db/schema';

export class UserService {
  
  async create(data: CreateUserDto) {
    const [result] = await db.insert(users).values(data);
    return result;
  }

  async findAll() {
    console.log(" ping ---> 2")
    const result = await db.select().from(users).execute()
    console.log(" ping ---> 34", result)
    return result;
  }

  findOne(id: number) {
    return db.select().from(users).where(eq(users.id, id));
  }

  update(id: number, data: Partial<CreateUserDto>) {
    return db
      .update(users)
      .set(data)
      .where(eq(users.id,id))
  }

  remove(id: number) {
    return db.delete(users).where(eq(users.id,id));
  }
}