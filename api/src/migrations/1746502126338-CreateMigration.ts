import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMigration1746502126338 implements MigrationInterface {
    name = 'CreateMigration1746502126338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`roles\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_8e913e288156c133999341156ad\``);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`ipAddress\` \`ipAddress\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`userId\` \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`lastLoginAt\` \`lastLoginAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`user_id\`)`);
        await queryRunner.query(`DROP INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD \`role_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`user_id\`, \`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`permission_id\`)`);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD \`role_id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`permission_id\`, \`role_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\` (\`role_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\` (\`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_8e913e288156c133999341156ad\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_8e913e288156c133999341156ad\``);
        await queryRunner.query(`DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`permission_id\`)`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD \`role_id\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\` (\`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`role_id\`, \`permission_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD \`role_id\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\` (\`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD PRIMARY KEY (\`user_id\`, \`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`deleted_at\` \`deleted_at\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`lastLoginAt\` \`lastLoginAt\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`userId\` \`userId\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`ipAddress\` \`ipAddress\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_8e913e288156c133999341156ad\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`id\``);
    }

}
