import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async saveFile(file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('No file provided.');
    }
    return this.prisma.media.create({
      data: {
        fileName: file.filename || file.originalname,
        storedPath: `/uploads/${file.filename || file.originalname}`,
        publicUrl: `/uploads/${file.filename || file.originalname}`,
        mimeType: file.mimetype,
        type: 'IMAGE',
        size: file.size,
      },
    });
  }

  async saveFiles(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return [];
    }
    const savedMedia: any[] = [];
    for (const file of files) {
      const media = await this.saveFile(file);
      savedMedia.push(media);
    }
    return savedMedia;
  }

  async findAll(query?: any) {
    return this.prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMetadata(id: string, dto: any) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found.`);
    }
    return this.prisma.media.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found.`);
    }
    return this.prisma.media.delete({
      where: { id },
    });
  }
}