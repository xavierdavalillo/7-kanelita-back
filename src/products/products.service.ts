import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductImageDto } from "./dto/product-image.dto";
import { ProductVariantDto } from "./dto/product-variant.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

const productInclude = {
  category: true,
  variants: {
    orderBy: { size: "asc" },
  },
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        category: { isActive: true },
        variants: {
          some: {
            isActive: true,
            stock: { gt: 0 },
          },
        },
      },
      include: {
        category: true,
        variants: {
          where: {
            isActive: true,
            stock: { gt: 0 },
          },
          orderBy: { size: "asc" },
        },
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
  }

  findAdmin() {
    return this.prisma.product.findMany({
      include: productInclude,
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
  }

  async create(createProductDto: CreateProductDto) {
    this.assertUniqueVariantSizes(createProductDto.variants);
    this.assertUniqueImagePublicIds(createProductDto.images);

    try {
      return await this.prisma.product.create({
        data: {
          title: createProductDto.title.trim(),
          slug: createProductDto.slug.trim().toLowerCase(),
          description: createProductDto.description.trim(),
          priceCents: createProductDto.priceCents,
          currency: createProductDto.currency?.trim().toUpperCase() || "USD",
          category: { connect: { id: createProductDto.categoryId } },
          swatch: createProductDto.swatch?.trim() || null,
          sortOrder: createProductDto.sortOrder,
          isActive: createProductDto.isActive,
          variants: {
            create: createProductDto.variants.map((variant) =>
              this.normalizeVariantInput(variant),
            ),
          },
          images: {
            create: this.normalizeImageInputs(createProductDto.images),
          },
        },
        include: productInclude,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    if (updateProductDto.variants) {
      this.assertUniqueVariantSizes(updateProductDto.variants);
    }
    if (updateProductDto.images) {
      this.assertUniqueImagePublicIds(updateProductDto.images);
    }

    try {
      return await this.prisma.$transaction(async (transaction) => {
        await transaction.product.update({
          where: { id },
          data: this.normalizeProductInput(updateProductDto),
        });

        if (updateProductDto.variants) {
          await transaction.productVariant.deleteMany({ where: { productId: id } });
          await transaction.productVariant.createMany({
            data: updateProductDto.variants.map((variant) => ({
              productId: id,
              ...this.normalizeVariantInput(variant),
            })),
          });
        }

        if (updateProductDto.images) {
          await transaction.productImage.deleteMany({ where: { productId: id } });
          await transaction.productImage.createMany({
            data: this.normalizeImageInputs(updateProductDto.images).map((image) => ({
              productId: id,
              ...image,
            })),
          });
        }

        return transaction.product.findUniqueOrThrow({
          where: { id },
          include: productInclude,
        });
      });
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.product.delete({ where: { id } });
      return { id };
    } catch (error) {
      this.handlePrismaError(error, id);
    }
  }

  private normalizeProductInput(input: CreateProductDto | UpdateProductDto) {
    return {
      title: input.title?.trim(),
      slug: input.slug?.trim().toLowerCase(),
      description: input.description?.trim(),
      priceCents: input.priceCents,
      currency: input.currency?.trim().toUpperCase() || "USD",
      categoryId: input.categoryId,
      swatch: input.swatch?.trim() || null,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    };
  }

  private normalizeImageInputs(images: ProductImageDto[]) {
    const hasPrimary = images.some((image) => image.isPrimary);

    return images.map((image, index) => ({
      publicId: image.publicId.trim(),
      alt: image.alt.trim(),
      sortOrder: image.sortOrder ?? index,
      isPrimary: hasPrimary ? Boolean(image.isPrimary) : index === 0,
    }));
  }

  private normalizeVariantInput(input: ProductVariantDto) {
    return {
      size: input.size.trim(),
      stock: input.stock,
      isActive: input.isActive ?? true,
    };
  }

  private assertUniqueVariantSizes(variants: ProductVariantDto[]) {
    const sizes = new Set<string>();

    for (const variant of variants) {
      const size = variant.size.trim().toLowerCase();

      if (!size) {
        throw new BadRequestException("Variant size is required.");
      }

      if (sizes.has(size)) {
        throw new BadRequestException("Product variant sizes must be unique.");
      }

      sizes.add(size);
    }
  }

  private assertUniqueImagePublicIds(images: ProductImageDto[]) {
    const publicIds = new Set<string>();

    for (const image of images) {
      const publicId = image.publicId.trim();

      if (!publicId) {
        throw new BadRequestException("Product image publicId is required.");
      }

      if (!image.alt.trim()) {
        throw new BadRequestException("Product image alt text is required.");
      }

      if (publicIds.has(publicId)) {
        throw new BadRequestException("Product image publicIds must be unique.");
      }

      publicIds.add(publicId);
    }
  }

  private handlePrismaError(error: unknown, id?: number): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new ConflictException(
          "Product slug, variant size, or image publicId already exists.",
        );
      }

      if (error.code === "P2003") {
        throw new BadRequestException("Product category does not exist.");
      }

      if (error.code === "P2025") {
        throw new NotFoundException(`Product ${id ?? ""} was not found.`);
      }
    }

    throw error;
  }
}
