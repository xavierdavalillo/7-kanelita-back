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
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequirePermissions } from "../auth/permissions.decorator";
import { PermissionsGuard } from "../auth/permissions.guard";
import type { RequestUser } from "../auth/types/request-user.type";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions("users:view")
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @RequirePermissions("users:create")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(":id")
  @RequirePermissions("users:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser?: RequestUser,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser?.id);
  }

  @Delete(":id")
  @RequirePermissions("users:delete")
  delete(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() currentUser?: RequestUser,
  ) {
    return this.usersService.delete(id, currentUser?.id);
  }
}
