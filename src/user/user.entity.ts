import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  username!: string;

  @Property()
  password!: string;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt?: Date;
}
