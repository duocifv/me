import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMigration1745832283877 implements MigrationInterface {
    name = 'CreateMigration1745832283877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_8e913e288156c133999341156ad\``);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`ipAddress\` \`ipAddress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`userId\` \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_8e913e288156c133999341156ad\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_8e913e288156c133999341156ad\``);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`ipAddress\` \`ipAddress\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_8e913e288156c133999341156ad\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
