import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the entity tables that were never covered by a migration:
 * sellers, oauth_accounts, carts, notifications. The project historically
 * relied on `synchronize` for these, so they had no migration.
 */
export class SyncEntitySchema1779434643976 implements MigrationInterface {
  name = 'SyncEntitySchema1779434643976';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sellers" (
        "id" character varying(50) NOT NULL,
        "username" character varying(100) NOT NULL,
        "fullName" character varying(150) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT false,
        "password" character varying(255) NOT NULL,
        "phone" character varying(15) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_27021ac0f2b1311b0167b73cb09" UNIQUE ("username"),
        CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."oauth_accounts_provider_enum" AS ENUM('google', 'facebook', 'github')`,
    );
    await queryRunner.query(
      `CREATE TABLE "oauth_accounts" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "provider" "public"."oauth_accounts_provider_enum" NOT NULL,
        "providerId" character varying NOT NULL,
        "providerEmail" character varying,
        "providerProfile" jsonb,
        "accessToken" text,
        "refreshToken" text,
        "lastUsedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_710a81523f515b78f894e33bb10" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "carts" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "productId" integer NOT NULL,
        "quantity" integer NOT NULL DEFAULT '1',
        "price" numeric(10,2) NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('order', 'seller', 'system', 'payment', 'product', 'verification', 'payout')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'system',
        "title" character varying(255) NOT NULL,
        "message" text NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "urgent" boolean NOT NULL DEFAULT false,
        "actionUrl" character varying(500),
        "data" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "readAt" TIMESTAMP,
        CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications" ("userId", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d60c47e715847c8aa792ba6d1e" ON "notifications" ("userId", "read")`,
    );

    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" ADD CONSTRAINT "FK_4c22f13249ce02f89dc6d226e9c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_9c77aaa5bc26f66159661ffd808" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_9c77aaa5bc26f66159661ffd808"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" DROP CONSTRAINT "FK_4c22f13249ce02f89dc6d226e9c"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_d60c47e715847c8aa792ba6d1e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "oauth_accounts"`);
    await queryRunner.query(`DROP TYPE "public"."oauth_accounts_provider_enum"`);
    await queryRunner.query(`DROP TABLE "sellers"`);
  }
}
