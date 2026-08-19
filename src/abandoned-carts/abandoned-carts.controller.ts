import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import { AbandonedCartsService } from "./abandoned-carts.service";
import { CreateAbandonedCartDto } from "./dto/create-abandoned-cart.dto";
import { UpdateAbandonedCartStatusDto } from "./dto/update-abandoned-cart-status.dto";

@Controller()
export class AbandonedCartsController {
  constructor(private readonly abandonedCartsService: AbandonedCartsService) {}

  @Post("abandoned-carts")
  save(@Body() createAbandonedCartDto: CreateAbandonedCartDto) {
    return this.abandonedCartsService.save(createAbandonedCartDto);
  }

  @Patch("abandoned-carts/:id/order-sent")
  markOrderSent(@Param("id", ParseIntPipe) id: number) {
    return this.abandonedCartsService.markOrderSent(id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get("admin/abandoned-carts")
  @RequirePermissions("abandoned-carts:view")
  findAdmin(@Query("status") status?: string) {
    return this.abandonedCartsService.findAdmin(status);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch("admin/abandoned-carts/:id/status")
  @RequirePermissions("abandoned-carts:update")
  updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateAbandonedCartStatusDto,
  ) {
    return this.abandonedCartsService.updateStatus(id, updateStatusDto.status);
  }
}
