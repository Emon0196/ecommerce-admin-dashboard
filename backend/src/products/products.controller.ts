import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions('product:create')
  create(@Body() dto: any) {
    return this.productsService.create(dto);
  }

  @Get()
  @Permissions('product:read')
  findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Permissions('product:read')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('product:update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.productsService.update(id, dto);
  }

  // Explicitly guarded nested route for product variants
  @Post(':id/variants')
  @Permissions('product:update')
  addVariant(@Param('id') id: string, @Body() dto: any) {
    return this.productsService.addVariant(id, dto);
  }

  @Delete(':id')
  @Permissions('product:delete')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}