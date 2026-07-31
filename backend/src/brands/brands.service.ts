import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateBrandDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const existingSlug = await this.prisma.brand.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException(`Brand with slug '${slug}' already exists`);
    }

    return this.prisma.brand.create({
      data: {
        ...dto,
        slug,
      },
      include: {
        logo: true,
      },
    });
  }

  async findAll(query: QueryBrandDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [total, brands] = await Promise.all([
      this.prisma.brand.count({ where }),
      this.prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          logo: true,
          _count: { select: { products: true } },
        },
      }),
    ]);

    return {
      data: brands,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        logo: true,
        _count: { select: { products: true } },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    const brand = await this.findOne(id);

    let slug = dto.slug;
    if (dto.name && !dto.slug) {
      slug = this.slugify(dto.name);
    } else if (dto.slug) {
      slug = this.slugify(dto.slug);
    }

    if (slug && slug !== brand.slug) {
      const existingSlug = await this.prisma.brand.findUnique({
        where: { slug },
      });
      if (existingSlug) {
        throw new ConflictException(`Brand with slug '${slug}' already exists`);
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...dto,
        ...(slug ? { slug } : {}),
      },
      include: {
        logo: true,
      },
    });
  }

  async remove(id: string) {
    const brand = await this.findOne(id);

    if (brand._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete brand. It is assigned to ${brand._count.products} product(s).`,
      );
    }

    return this.prisma.brand.delete({ where: { id } });
  }
}