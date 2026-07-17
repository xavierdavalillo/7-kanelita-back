import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductsService } from "./products.service";

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("products")
  findPublic() {
    return this.productsService.findPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Get("admin/products")
  findAdmin() {
    return this.productsService.findAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post("admin/products")
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("admin/products/:id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("admin/products/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
