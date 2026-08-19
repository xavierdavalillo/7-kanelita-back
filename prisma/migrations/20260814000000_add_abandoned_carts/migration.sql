CREATE TABLE "AbandonedCart" (
  "id" SERIAL NOT NULL,
  "cartToken" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerWhatsapp" TEXT NOT NULL,
  "customerEmail" TEXT,
  "deliveryType" TEXT NOT NULL,
  "consentToContact" BOOLEAN NOT NULL DEFAULT true,
  "status" TEXT NOT NULL DEFAULT 'open',
  "items" JSONB NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "contactedAt" TIMESTAMP(3),
  "orderSentAt" TIMESTAMP(3),
  "discardedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AbandonedCart_cartToken_key" ON "AbandonedCart"("cartToken");
CREATE INDEX "AbandonedCart_status_lastActivityAt_idx" ON "AbandonedCart"("status", "lastActivityAt");
CREATE INDEX "AbandonedCart_customerWhatsapp_idx" ON "AbandonedCart"("customerWhatsapp");

INSERT INTO "Permission" ("key", "module", "action", "label", "description") VALUES
  ('abandoned-carts:view', 'abandoned-carts', 'view', 'Ver carritos abandonados', 'Puede ver la bandeja de carritos abandonados.'),
  ('abandoned-carts:update', 'abandoned-carts', 'update', 'Actualizar carritos abandonados', 'Puede marcar carritos como contactados o descartados.')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
CROSS JOIN "Permission" permission
WHERE role."slug" = 'superusuario'
  AND permission."key" IN ('abandoned-carts:view', 'abandoned-carts:update')
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT role."id", permission."id"
FROM "Role" role
JOIN "Permission" permission ON permission."key" IN (
  'abandoned-carts:view', 'abandoned-carts:update'
)
WHERE role."slug" = 'administrador'
ON CONFLICT DO NOTHING;
