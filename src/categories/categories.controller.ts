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

  @UseGuards(JwtAuthGuard)
  @Get("admin/categories")
  findAdmin() {
    return this.categoriesService.findAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post("admin/categories")
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("admin/categories/:id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("admin/categories/:id")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
