import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Permissions('brand:create')
  create(@Body() dto: any) {
    return this.brandsService.create(dto);
  }

  @Get()
  @Permissions('brand:read')
  findAll(@Query() query: any) {
    return this.brandsService.findAll(query);
  }

  @Patch(':id')
  @Permissions('brand:update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('brand:delete')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}