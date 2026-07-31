import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.attribute.create({
      data: {
        name: dto.name,
        slug: dto.slug || dto.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'attr',
        type: dto.type,
      },
    });
  }

  async findAll(query?: any) {
    return this.prisma.attribute.findMany({
      include: { values: true },
    });
  }

  async findOne(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: { values: true },
    });
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found.`);
    }
    return attribute;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.attribute.update({
      where: { id },
      data: { name: dto.name, type: dto.type },
    });
  }

  async addValue(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.attributeValue.create({
      data: {
        attributeId: id,
        value: dto.value,
        slug: dto.slug || dto.value?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'val',
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.attribute.delete({
      where: { id },
    });
  }
}