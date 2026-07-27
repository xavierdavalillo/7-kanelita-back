import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CarouselImagesController } from "./carousel-images.controller";
import { CarouselImagesService } from "./carousel-images.service";

@Module({
  imports: [PrismaModule],
  controllers: [CarouselImagesController],
  providers: [CarouselImagesService],
})
export class CarouselImagesModule {}
