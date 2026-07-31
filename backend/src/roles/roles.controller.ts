import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('role:create')
  create(@Body() dto: any) {
    return this.rolesService.create(dto);
  }

  @Get()
  @Permissions('role:read')
  findAll(@Query() query: any) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @Permissions('role:read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('role:update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.rolesService.update(id, dto);
  }

  // Explicitly guarded nested route for role assignment
  @Post(':id/permissions')
  @Permissions('role:update')
  assignPermissions(@Param('id') id: string, @Body() dto: any) {
    return this.rolesService.assignPermissions(id, dto);
  }

  @Delete(':id')
  @Permissions('role:delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}