import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const userInclude = {
  role: {
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  },
} satisfies Prisma.UserInclude;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isActive: true,
        role: { isActive: true },
      },
      include: userInclude,
    });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: userInclude,
      orderBy: [{ createdAt: "desc" }, { email: "asc" }],
    });

    return users.map((user) => this.serializeUser(user));
  }

  async create(createUserDto: CreateUserDto) {
    await this.assertActiveRole(createUserDto.roleId);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email.trim().toLowerCase(),
          passwordHash: await bcrypt.hash(createUserDto.password, 12),
          role: { connect: { id: createUserDto.roleId } },
          isActive: createUserDto.isActive ?? true,
        },
        include: userInclude,
      });

      return this.serializeUser(user);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUserId?: number) {
    await this.assertUserCanChange(id, updateUserDto, currentUserId);

    if (updateUserDto.roleId) {
      await this.assertActiveRole(updateUserDto.roleId);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          email: updateUserDto.email?.trim().toLowerCase(),
          passwordHash: updateUserDto.password
            ? await bcrypt.hash(updateUserDto.password, 12)
            : undefined,
          roleId: updateUserDto.roleId,
          isActive: updateUserDto.isActive,
        },
        include: userInclude,
      });

      return this.serializeUser(user);
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async delete(id: number, currentUserId?: number) {
    if (id === currentUserId) {
      throw new BadRequestException("You cannot delete your own user.");
    }

    await this.assertNotLastActiveSuperuser(id);

    try {
      await this.prisma.user.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private serializeUser(user: Prisma.UserGetPayload<{ include: typeof userInclude }>) {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: {
        id: user.role.id,
        name: user.role.name,
        slug: user.role.slug,
        isActive: user.role.isActive,
        permissions: user.role.permissions.map(({ permission }) => permission),
      },
      permissions: user.role.permissions.map(({ permission }) => permission.key),
    };
  }

  private async assertActiveRole(roleId: number) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role || !role.isActive) {
      throw new BadRequestException("Selected role does not exist or is inactive.");
    }
  }

  private async assertUserCanChange(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserId?: number,
  ) {
    if (id === currentUserId && updateUserDto.isActive === false) {
      throw new BadRequestException("You cannot deactivate your own user.");
    }

    if (updateUserDto.isActive === false || updateUserDto.roleId) {
      await this.assertNotLastActiveSuperuser(id, updateUserDto.roleId);
    }
  }

  private async assertNotLastActiveSuperuser(id: number, nextRoleId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} was not found.`);
    }

    if (user.role.slug !== "superusuario") {
      return;
    }

    if (nextRoleId && nextRoleId === user.roleId) {
      return;
    }

    const remainingSuperusers = await this.prisma.user.count({
      where: {
        id: { not: id },
        isActive: true,
        role: { slug: "superusuario", isActive: true },
      },
    });

    if (remainingSuperusers === 0) {
      throw new BadRequestException("At least one active superuser is required.");
    }
  }

  private handlePrismaError(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException("User email already exists.");
      }

      if (error.code === "P2025") {
        throw new NotFoundException(`User ${id ?? ""} was not found.`);
      }
    }

    throw error;
  }
}
