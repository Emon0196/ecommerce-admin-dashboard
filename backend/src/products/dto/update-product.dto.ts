import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { StockStatus } from '@prisma/client';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(StockStatus)
  stockStatus?: StockStatus;
}