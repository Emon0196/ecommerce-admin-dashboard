import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        parentId: dto.parentId || null,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(query?: any) {
    return this.prisma.category.findMany({
      include: { parent: true, children: true },
    });
  }

  async getTree() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: any) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return this.prisma.category.delete({
      where: { id },
    });
  }
}