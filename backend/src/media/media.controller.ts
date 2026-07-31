import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @Permissions('media:upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.saveFile(file);
  }

  @Post('upload-multiple')
  @Permissions('media:upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.mediaService.saveFiles(files);
  }

  @Get()
  @Permissions('media:read')
  findAll(@Query() query: any) {
    return this.mediaService.findAll(query);
  }

  @Patch(':id')
  @Permissions('media:write')
  updateMetadata(@Param('id') id: string, @Body() dto: any) {
    return this.mediaService.updateMetadata(id, dto);
  }

  @Delete(':id')
  @Permissions('media:delete')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}