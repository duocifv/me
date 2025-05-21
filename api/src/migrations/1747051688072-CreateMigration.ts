import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMigration1747051688072 implements MigrationInterface {
  name = 'CreateMigration1747051688072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP COLUMN \`id\``);
  }
}
