import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionGroupDto } from './dto/create-permission-group.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Permission Group Methods
  async createGroup(dto: CreatePermissionGroupDto) {
    return this.prisma.permissionGroup.create({ data: dto });
  }

  async findAllGroups() {
    return this.prisma.permissionGroup.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });
  }

  // Permission Methods
  async createPermission(dto: CreatePermissionDto) {
    const groupExists = await this.prisma.permissionGroup.findUnique({
      where: { id: dto.groupId },
    });
    if (!groupExists) {
      throw new NotFoundException('Permission Group not found');
    }
    return this.prisma.permission.create({ data: dto });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      include: { group: true },
      orderBy: { name: 'asc' },
    });
  }
}