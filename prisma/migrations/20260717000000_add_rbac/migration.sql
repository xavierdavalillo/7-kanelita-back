ALTER TYPE "Role" RENAME TO "LegacyRole";

CREATE TABLE "Role" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

CREATE TABLE "Permission" (
  "id" SERIAL NOT NULL,
  "key" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

CREATE TABLE "RolePermission" (
  "roleId" INTEGER NOT NULL,
  "permissionId" INTEGER NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

ALTER TABLE "RolePermission"
  ADD CONSTRAINT "RolePermission_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RolePermission"
  ADD CONSTRAINT "RolePermission_permissionId_fkey"
  FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Permission" ("key", "module", "action", "label", "description") VALUES
  ('categories:view', 'categories', 'view', 'Ver categorias', 'Puede ver el mantenedor de categorias.'),
  ('categories:create', 'categories', 'create', 'Crear categorias', 'Puede crear categorias.'),
  ('categories:update', 'categories', 'update', 'Editar categorias', 'Puede modificar categorias.'),
  ('categories:delete', 'categories', 'delete', 'Eliminar categorias', 'Puede eliminar categorias.'),
  ('products:view', 'products', 'view', 'Ver productos', 'Puede ver el mantenedor de productos.'),
  ('products:create', 'products', 'create', 'Crear productos', 'Puede crear productos.'),
  ('products:update', 'products', 'update', 'Editar productos', 'Puede modificar productos.'),
  ('products:delete', 'products', 'delete', 'Eliminar productos', 'Puede eliminar productos.'),
  ('users:view', 'users', 'view', 'Ver usuarios', 'Puede ver usuarios del admin.'),
  ('users:create', 'users', 'create', 'Crear usuarios', 'Puede crear usuarios del admin.'),
  ('users:update', 'users', 'update', 'Editar usuarios', 'Puede modificar usuarios del admin.'),
  ('users:delete', 'users', 'delete', 'Eliminar usuarios', 'Puede eliminar usuarios del admin.'),
  ('roles:view', 'roles', 'view', 'Ver roles', 'Puede ver roles y permisos.'),
  ('roles:create', 'roles', 'create', 'Crear roles', 'Puede crear roles.'),
  ('roles:update', 'roles', 'update', 'Editar roles', 'Puede modificar roles y permisos asignados.'),
  ('roles:delete', 'roles', 'delete', 'Eliminar roles', 'Puede eliminar roles sin usuarios asignados.');

INSERT INTO "Role" ("name", "slug", "description", "isSystem", "isActive") VALUES
  ('Superusuario', 'superusuario', 'Acceso completo al administrador.', true, true),
  ('Administrador', 'administrador', 'Gestiona catalogo de categorias y productos.', true, true),
  ('Editor', 'editor', 'Consulta y actualiza contenido del catalogo.', true, true);

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
CROSS JOIN "Permission" permission
WHERE role."slug" = 'superusuario';

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
JOIN "Permission" permission ON permission."key" IN (
  'categories:view', 'categories:create', 'categories:update', 'categories:delete',
  'products:view', 'products:create', 'products:update', 'products:delete'
)
WHERE role."slug" = 'administrador';

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
JOIN "Permission" permission ON permission."key" IN (
  'categories:view', 'categories:update',
  'products:view', 'products:update'
)
WHERE role."slug" = 'editor';

ALTER TABLE "User" ADD COLUMN "roleId" INTEGER;

UPDATE "User"
SET "roleId" = (SELECT "id" FROM "Role" WHERE "slug" = 'superusuario')
WHERE "roleId" IS NULL;

ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;

ALTER TABLE "User"
  ADD CONSTRAINT "User_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User" DROP COLUMN "role";

DROP TYPE "LegacyRole";
