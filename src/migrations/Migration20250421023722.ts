import { Migration } from '@mikro-orm/migrations';

export class Migration20250421023722 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(100) not null, \`email\` varchar(100) not null) default character set utf8mb4 engine = InnoDB;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`user\`;`);
  }
}
