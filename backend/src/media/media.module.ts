import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    PermissionsModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Directs uploads to backend/uploads
        filename: (req, file, callback) => {
          // Generates a unique filename using timestamp + random string + original extension
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}