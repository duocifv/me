import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMigration1745823629651 implements MigrationInterface {
  name = 'CreateMigration1745823629651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` DROP COLUMN \`userId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` ADD \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`role_id\`)`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD \`user_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`role_id\`, \`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_8e913e288156c133999341156ad\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_8e913e288156c133999341156ad\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\``,
    );
    await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`role_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD \`user_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\` (\`user_id\`)`,
    );
    await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`user_id\`, \`role_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` DROP COLUMN \`userId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` ADD \`userId\` int NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`id\``);
  }
}
