-- Drop constraints that depend on the 'role' column type or 'app_role' enum
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_role_enterprise_id_pk";
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_permission_key";
DROP INDEX IF EXISTS "user_roles_role_idx";

-- Alter the column types from enum to text
ALTER TABLE "user_roles" ALTER COLUMN "role" TYPE text;
ALTER TABLE "role_permissions" ALTER COLUMN "role" TYPE text;

-- Drop the now unused enum type
DROP TYPE "app_role";

-- Recreate the constraints with the new text type
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_role_enterprise_id_pk" PRIMARY KEY ("user_id", "role", "enterprise_id");
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");
CREATE INDEX "user_roles_role_idx" ON "user_roles" USING btree ("role");
