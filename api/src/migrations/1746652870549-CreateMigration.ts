import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMigration1746652870549 implements MigrationInterface {
  name = 'CreateMigration1746652870549';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`permissions\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`id\` \`id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`id\` varchar(36) NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`name\` \`name\` varchar(255) NOT NULL DEFAULT 'GUEST'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`permission_id\`)`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP COLUMN \`role_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD \`role_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`permission_id\`, \`role_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`role_id\`)`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP COLUMN \`permission_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD \`permission_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`role_id\`, \`permission_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\` (\`role_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\` (\`permission_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`role_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP COLUMN \`permission_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD \`permission_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_17022daf3f885f7d35423e9971\` ON \`role_permissions\` (\`permission_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`permission_id\`, \`role_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`permission_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP COLUMN \`role_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD \`role_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_178199805b901ccd220ab7740e\` ON \`role_permissions\` (\`role_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD PRIMARY KEY (\`role_id\`, \`permission_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`name\` \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`id\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` ADD PRIMARY KEY (\`id\`)`);
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` CHANGE \`expiresAt\` \`expiresAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`id\``);
  }
}
