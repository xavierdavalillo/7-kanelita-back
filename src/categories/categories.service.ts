import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  findAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: this.normalizeCategoryInput(createCategoryDto),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: this.normalizeCategoryInput(updateCategoryDto),
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.category.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private normalizeCategoryInput<T extends CreateCategoryDto | UpdateCategoryDto>(
    input: T,
  ) {
    return {
      ...input,
      name: input.name?.trim(),
      slug: input.slug?.trim().toLowerCase(),
      description: input.description?.trim() || null,
    };
  }

  private handlePrismaError(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException("Category slug already exists.");
      }

      if (error.code === "P2025") {
        throw new NotFoundException(`Category ${id ?? ""} was not found.`);
      }
    }

    throw error;
  }
}
