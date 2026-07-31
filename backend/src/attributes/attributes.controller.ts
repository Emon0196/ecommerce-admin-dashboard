import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  @Permissions('attribute:create')
  create(@Body() dto: any) {
    return this.attributesService.create(dto);
  }

  @Get()
  @Permissions('attribute:read')
  findAll(@Query() query: any) {
    return this.attributesService.findAll(query);
  }

  @Patch(':id')
  @Permissions('attribute:update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.attributesService.update(id, dto);
  }

  // Explicitly guarded nested route for attribute values
  @Post(':id/values')
  @Permissions('attribute:update')
  addValue(@Param('id') id: string, @Body() dto: any) {
    return this.attributesService.addValue(id, dto);
  }

  @Delete(':id')
  @Permissions('attribute:delete')
  remove(@Param('id') id: string) {
    return this.attributesService.remove(id);
  }
}