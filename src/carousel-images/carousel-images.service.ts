import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCarouselImageDto } from "./dto/create-carousel-image.dto";
import { UpdateCarouselImageDto } from "./dto/update-carousel-image.dto";

@Injectable()
export class CarouselImagesService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.carouselImage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  }

  findAdmin() {
    return this.prisma.carouselImage.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  }

  async create(createCarouselImageDto: CreateCarouselImageDto) {
    try {
      return await this.prisma.carouselImage.create({
        data: this.normalizeCarouselImageInput(createCarouselImageDto),
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, updateCarouselImageDto: UpdateCarouselImageDto) {
    try {
      return await this.prisma.carouselImage.update({
        where: { id },
        data: this.normalizeCarouselImageInput(updateCarouselImageDto),
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.carouselImage.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private normalizeCarouselImageInput<
    T extends CreateCarouselImageDto | UpdateCarouselImageDto,
  >(input: T) {
    return {
      ...input,
      publicId: input.publicId?.trim(),
      alt: input.alt?.trim(),
    };
  }

  private handlePrismaError(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException("Carousel image publicId already exists.");
      }

      if (error.code === "P2025") {
        throw new NotFoundException(
          `Carousel image ${id ?? ""} was not found.`,
        );
      }
    }

    throw error;
  }
}
