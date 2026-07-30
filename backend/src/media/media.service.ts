import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { MediaType } from '@prisma/client';
import { UpdateMediaDto } from './dto/update-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: Express.Multer.File, userId?: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    let mediaType: MediaType = MediaType.DOCUMENT;
    if (file.mimetype.startsWith('image/')) {
      mediaType = MediaType.IMAGE;
    } else if (file.mimetype.startsWith('video/')) {
      mediaType = MediaType.VIDEO;
    }

    const publicUrl = `/uploads/${file.filename}`;

    return this.prisma.media.create({
      data: {
        fileName: file.originalname,
        storedPath: file.path,
        publicUrl,
        mimeType: file.mimetype,
        type: mediaType,
        size: file.size,
        uploadedById: userId || null,
      },
    });
  }

  async findAll(query: QueryMediaDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { fileName: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
        { altText: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.type) {
      where.type = query.type;
    }

    const [total, mediaItems] = await Promise.all([
      this.prisma.media.count({ where }),
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return {
      data: mediaItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!media) {
      throw new NotFoundException(`Media file with ID ${id} not found`);
    }

    return media;
  }

  async update(id: string, dto: UpdateMediaDto) {
    await this.findOne(id);

    return this.prisma.media.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const media = await this.findOne(id);

    // Delete file from disk if present
    if (fs.existsSync(media.storedPath)) {
      try {
        fs.unlinkSync(media.storedPath);
      } catch (err) {
        console.error(`Failed to delete file on disk: ${media.storedPath}`, err);
      }
    }

    return this.prisma.media.delete({ where: { id } });
  }
}