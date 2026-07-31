import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async createGroup(dto: any) {
    return this.prisma.permissionGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll(query?: any) {
    return this.prisma.permissionGroup.findMany({
      include: { permissions: true },
    });
  }

  async updateGroup(id: string, dto: any) {
    const group = await this.prisma.permissionGroup.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Permission group with ID ${id} not found.`);
    }
    return this.prisma.permissionGroup.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const group = await this.prisma.permissionGroup.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Permission group with ID ${id} not found.`);
    }
    return this.prisma.permissionGroup.delete({
      where: { id },
    });
  }
}