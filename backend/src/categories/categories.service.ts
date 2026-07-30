import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException(`Category with slug '${slug}' already exists`);
    }

    if (dto.parentId) {
      const parentExists = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: {
        ...dto,
        slug,
      },
      include: {
        image: true,
        parent: true,
      },
    });
  }

  async findAll(query: QueryCategoryDto) {
    if (query.tree) {
      return this.getCategoryTree(query.isActive);
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [total, categories] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
          image: true,
          parent: { select: { id: true, name: true, slug: true } },
          _count: { select: { products: true, children: true } },
        },
      }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCategoryTree(isActiveOnly?: boolean) {
    const where: any = {};
    if (isActiveOnly !== undefined) {
      where.isActive = isActiveOnly;
    }

    const allCategories = await this.prisma.category.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        image: true,
      },
    });

    return this.buildTree(allCategories, null);
  }

  private buildTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .map((cat) => ({
        ...cat,
        children: this.buildTree(categories, cat.id),
      }));
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        image: true,
        parent: true,
        children: {
          include: { image: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    let slug = dto.slug;
    if (dto.name && !dto.slug) {
      slug = this.slugify(dto.name);
    } else if (dto.slug) {
      slug = this.slugify(dto.slug);
    }

    if (slug && slug !== category.slug) {
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug },
      });
      if (existingSlug) {
        throw new ConflictException(`Category with slug '${slug}' already exists`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      // Check circular dependency
      const isDescendant = await this.checkIsDescendant(id, dto.parentId);
      if (isDescendant) {
        throw new BadRequestException(
          'Cannot assign parent category as it creates a circular dependency',
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        ...(slug ? { slug } : {}),
      },
      include: {
        image: true,
        parent: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    if (category.children && category.children.length > 0) {
      throw new BadRequestException(
        `Cannot delete category. It has ${category.children.length} sub-category(ies). Reassign or delete them first.`,
      );
    }

    if (category._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete category. It is associated with ${category._count.products} product(s).`,
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }

  private async checkIsDescendant(
    categoryId: string,
    targetParentId: string,
  ): Promise<boolean> {
    let current = await this.prisma.category.findUnique({
      where: { id: targetParentId },
    });

    while (current && current.parentId) {
      if (current.parentId === categoryId) {
        return true;
      }
      current = await this.prisma.category.findUnique({
        where: { id: current.parentId },
      });
    }

    return false;
  }
}