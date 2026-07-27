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
import { CarouselImagesService } from "./carousel-images.service";
import { CreateCarouselImageDto } from "./dto/create-carousel-image.dto";
import { UpdateCarouselImageDto } from "./dto/update-carousel-image.dto";

@Controller()
export class CarouselImagesController {
  constructor(private readonly carouselImagesService: CarouselImagesService) {}

  @Get("carousel-images")
  findPublic() {
    return this.carouselImagesService.findPublic();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get("admin/carousel-images")
  @RequirePermissions("carousel:view")
  findAdmin() {
    return this.carouselImagesService.findAdmin();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post("admin/carousel-images")
  @RequirePermissions("carousel:create")
  create(@Body() createCarouselImageDto: CreateCarouselImageDto) {
    return this.carouselImagesService.create(createCarouselImageDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch("admin/carousel-images/:id")
  @RequirePermissions("carousel:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCarouselImageDto: UpdateCarouselImageDto,
  ) {
    return this.carouselImagesService.update(id, updateCarouselImageDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete("admin/carousel-images/:id")
  @RequirePermissions("carousel:delete")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.carouselImagesService.delete(id);
  }
}
