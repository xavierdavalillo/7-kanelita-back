import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

const roleInclude = {
  permissions: {
    include: { permission: true },
  },
  _count: {
    select: { users: true },
  },
} satisfies Prisma.RoleInclude;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: roleInclude,
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });

    return roles.map((role) => this.serializeRole(role));
  }

  findPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }, { label: "asc" }],
    });
  }

  async create(createRoleDto: CreateRoleDto) {
    await this.assertExistingPermissions(createRoleDto.permissionIds);

    try {
      const role = await this.prisma.$transaction(async (transaction) => {
        const savedRole = await transaction.role.create({
          data: {
            name: createRoleDto.name.trim(),
            slug: createRoleDto.slug.trim().toLowerCase(),
            description: createRoleDto.description?.trim() || null,
            isActive: createRoleDto.isActive ?? true,
          },
        });

        await this.replacePermissions(
          transaction,
          savedRole.id,
          createRoleDto.permissionIds,
        );

        return transaction.role.findUniqueOrThrow({
          where: { id: savedRole.id },
          include: roleInclude,
        });
      });

      return this.serializeRole(role);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.assertRoleCanChange(id, updateRoleDto);

    if (updateRoleDto.permissionIds) {
      await this.assertExistingPermissions(updateRoleDto.permissionIds);
    }

    try {
      const role = await this.prisma.$transaction(async (transaction) => {
        await transaction.role.update({
          where: { id },
          data: {
            name: updateRoleDto.name?.trim(),
            slug: updateRoleDto.slug?.trim().toLowerCase(),
            description:
              updateRoleDto.description === undefined
                ? undefined
                : updateRoleDto.description.trim() || null,
            isActive: updateRoleDto.isActive,
          },
        });

        if (updateRoleDto.permissionIds) {
          await this.replacePermissions(transaction, id, updateRoleDto.permissionIds);
        }

        return transaction.role.findUniqueOrThrow({
          where: { id },
          include: roleInclude,
        });
      });

      return this.serializeRole(role);
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async delete(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException(`Role ${id} was not found.`);
    }

    if (role.isSystem) {
      throw new BadRequestException("System roles cannot be deleted.");
    }

    if (role._count.users > 0) {
      throw new BadRequestException("Roles assigned to users cannot be deleted.");
    }

    await this.prisma.role.delete({ where: { id } });
    return { id };
  }

  private async replacePermissions(
    transaction: Prisma.TransactionClient,
    roleId: number,
    permissionIds: number[],
  ) {
    await transaction.rolePermission.deleteMany({ where: { roleId } });

    if (permissionIds.length > 0) {
      await transaction.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }
  }

  private async assertExistingPermissions(permissionIds: number[]) {
    const permissions = await this.prisma.permission.count({
      where: { id: { in: permissionIds } },
    });

    if (permissions !== permissionIds.length) {
      throw new BadRequestException("One or more permissions do not exist.");
    }
  }

  private async assertRoleCanChange(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException(`Role ${id} was not found.`);
    }

    if (role.slug === "superusuario" && updateRoleDto.isActive === false) {
      throw new BadRequestException("The superuser role cannot be deactivated.");
    }

    if (role.isSystem && updateRoleDto.slug && updateRoleDto.slug !== role.slug) {
      throw new BadRequestException("System role slugs cannot be changed.");
    }
  }

  private serializeRole(
    role: Prisma.RoleGetPayload<{ include: typeof roleInclude }>,
  ) {
    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      isSystem: role.isSystem,
      isActive: role.isActive,
      usersCount: role._count.users,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions
        .map(({ permission }) => permission)
        .sort((first, second) => first.key.localeCompare(second.key)),
    };
  }

  private handlePrismaError(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException("Role slug already exists.");
      }

      if (error.code === "P2025") {
        throw new NotFoundException(`Role ${id ?? ""} was not found.`);
      }
    }

    throw error;
  }
}
