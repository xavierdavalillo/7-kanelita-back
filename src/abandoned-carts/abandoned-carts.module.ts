import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AbandonedCartsController } from "./abandoned-carts.controller";
import { AbandonedCartsService } from "./abandoned-carts.service";

@Module({
  imports: [PrismaModule],
  controllers: [AbandonedCartsController],
  providers: [AbandonedCartsService],
})
export class AbandonedCartsModule {}
