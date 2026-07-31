import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('user:create')
  create(@Body() dto: any) {
    return this.usersService.create(dto);
  }

  @Get()
  @Permissions('user:read')
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Permissions('user:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('user:update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('user:delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}