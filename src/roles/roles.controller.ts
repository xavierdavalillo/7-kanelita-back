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
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { RolesService } from "./roles.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get("roles")
  @RequirePermissions("roles:view")
  findAll() {
    return this.rolesService.findAll();
  }

  @Post("roles")
  @RequirePermissions("roles:create")
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Patch("roles/:id")
  @RequirePermissions("roles:update")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete("roles/:id")
  @RequirePermissions("roles:delete")
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.rolesService.delete(id);
  }

  @Get("permissions")
  @RequirePermissions("roles:view")
  findPermissions() {
    return this.rolesService.findPermissions();
  }
}
