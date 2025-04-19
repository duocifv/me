
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity() // Đánh dấu lớp này là một entity trong TypeORM
export class User {
  @PrimaryGeneratedColumn() // Khóa chính tự động tăng
  id: number;

  @Column() // Cột 'name' trong bảng 'User'
  name: string;

  @Column() // Cột 'email' trong bảng 'User'
  email: string;
}
