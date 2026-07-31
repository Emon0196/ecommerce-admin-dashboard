import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions('category:create')
  create(@Body() dto: any) {
    return this.categoriesService.create(dto);
  }

  @Get()
  @Permissions('category:read')
  findAll(@Query() query: any) {
    return this.categoriesService.findAll(query);
  }

  @Get('tree')
  @Permissions('category:read')
  getTree() {
    return this.categoriesService.getTree();
  }

  @Patch(':id')
  @Permissions('category:update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('category:delete')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}