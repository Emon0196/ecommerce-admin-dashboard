import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    const { permissionIds = [], ...roleData } = dto;

    return this.prisma.role.create({
      data: {
        ...roleData,
        permissions: {
          create: permissionIds.map((pId) => ({
            permission: { connect: { id: pId } },
          })),
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    const { permissionIds, ...roleData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (permissionIds !== undefined) {
        // Clear old permission assignments first
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // Add new permission assignments
        if (permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((pId) => ({
              roleId: id,
              permissionId: pId,
            })),
          });
        }
      }

      return tx.role.update({
        where: { id },
        data: roleData,
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);

    const userCount = await this.prisma.user.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Cannot delete role because it is assigned to ${userCount} user(s).`,
      );
    }

    return this.prisma.role.delete({ where: { id } });
  }
}