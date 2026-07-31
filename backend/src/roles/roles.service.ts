import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? {
              connect: dto.permissionIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async findAll(query?: any) {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }

    return role;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissionIds
          ? {
              set: dto.permissionIds.map((permId: string) => ({ id: permId })),
            }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async assignPermissions(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        permissions: {
          set: dto.permissionIds.map((permId: string) => ({ id: permId })),
        },
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.role.delete({
      where: { id },
    });
  }
}