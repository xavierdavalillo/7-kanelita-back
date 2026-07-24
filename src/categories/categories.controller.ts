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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get("categories")
  findPublic() {
    return this.categoriesService.findPublic();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get("admin/categories")
  @RequirePermissions("categories:view")
  findAdmin() {
    return this.categoriesService.findAdmin();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post("admin/categories")
  @RequirePermissions("categories:create")
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch("admin/categories/:id")
  @RequirePermissions("categories:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete("admin/categories/:id")
  @RequirePermissions("categories:delete")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
