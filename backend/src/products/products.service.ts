import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug || dto.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'prod',
        price: dto.price,
        categories: dto.categoryId
          ? {
              create: [
                {
                  category: {
                    connect: { id: dto.categoryId },
                  },
                },
              ],
            }
          : undefined,
        brandId: dto.brandId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(query: any) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return product;
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        isActive: dto.isActive,
      },
    });
  }

  async addVariant(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.productVariant.create({
      data: {
        productId: id,
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}