import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('permission:create')
  createGroup(@Body() dto: any) {
    return this.permissionsService.createGroup(dto);
  }

  @Get()
  @Permissions('permission:read')
  findAll(@Query() query: any) {
    return this.permissionsService.findAll(query);
  }

  @Patch(':id')
  @Permissions('permission:update')
  updateGroup(@Param('id') id: string, @Body() dto: any) {
    return this.permissionsService.updateGroup(id, dto);
  }

  @Delete(':id')
  @Permissions('permission:delete')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}