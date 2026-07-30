import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionGroupDto } from './dto/create-permission-group.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { RequirePermissions } from './decorators/permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';

@Controller('permissions')
@UseGuards(PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('groups')
  @RequirePermissions('permission:manage')
  async createGroup(@Body() dto: CreatePermissionGroupDto) {
    return this.permissionsService.createGroup(dto);
  }

  @Get('groups')
  @RequirePermissions('permission:read')
  async findAllGroups() {
    return this.permissionsService.findAllGroups();
  }

  @Post()
  @RequirePermissions('permission:manage')
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.createPermission(dto);
  }

  @Get()
  @RequirePermissions('permission:read')
  async findAllPermissions() {
    return this.permissionsService.findAllPermissions();
  }
}