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
import { RequirePermissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
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

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get("admin/products")
  @RequirePermissions("products:view")
  findAdmin() {
    return this.productsService.findAdmin();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post("admin/products")
  @RequirePermissions("products:create")
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch("admin/products/:id")
  @RequirePermissions("products:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete("admin/products/:id")
  @RequirePermissions("products:delete")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.delete(id);
  }
}
