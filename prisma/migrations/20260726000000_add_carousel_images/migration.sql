CREATE TABLE "CarouselImage" (
  "id" SERIAL NOT NULL,
  "publicId" TEXT NOT NULL,
  "alt" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "trimDarkEdges" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CarouselImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CarouselImage_publicId_key" ON "CarouselImage"("publicId");

INSERT INTO "Permission" ("key", "module", "action", "label", "description") VALUES
  ('carousel:view', 'carousel', 'view', 'Ver carrusel', 'Puede ver el mantenedor del carrusel del landing.'),
  ('carousel:create', 'carousel', 'create', 'Crear imagenes del carrusel', 'Puede agregar imagenes al carrusel del landing.'),
  ('carousel:update', 'carousel', 'update', 'Editar imagenes del carrusel', 'Puede modificar imagenes del carrusel del landing.'),
  ('carousel:delete', 'carousel', 'delete', 'Eliminar imagenes del carrusel', 'Puede eliminar imagenes del carrusel del landing.')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
CROSS JOIN "Permission" permission
WHERE role."slug" = 'superusuario'
  AND permission."key" IN ('carousel:view', 'carousel:create', 'carousel:update', 'carousel:delete')
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
JOIN "Permission" permission ON permission."key" IN (
  'carousel:view', 'carousel:create', 'carousel:update', 'carousel:delete'
)
WHERE role."slug" = 'administrador'
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
JOIN "Permission" permission ON permission."key" IN (
  'carousel:view', 'carousel:update'
)
WHERE role."slug" = 'editor'
ON CONFLICT DO NOTHING;

INSERT INTO "CarouselImage" ("publicId", "alt", "sortOrder", "isActive", "trimDarkEdges") VALUES
  ('enojo_kan_1', 'Imagen destacada de ropa infantil Kanelita en carrusel', 10, true, false),
  ('enojo_kan_2', 'Segunda imagen destacada de ropa infantil Kanelita en carrusel', 20, true, true),
  ('enojo_kan_3', 'Tercera imagen destacada de ropa infantil Kanelita en carrusel', 30, true, true)
ON CONFLICT ("publicId") DO NOTHING;
