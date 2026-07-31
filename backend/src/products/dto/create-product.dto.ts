import { StockStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(StockStatus)
  stockStatus?: StockStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributeValueIds?: string[];
}

export class CreateProductMediaDto {
  @IsString()
  mediaId: string;

  @IsOptional()
  @IsBoolean()
  isThumbnail?: boolean;

  @IsOptional()
  @IsBoolean()
  isGallery?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number = 0;

  @IsOptional()
  @IsEnum(StockStatus)
  stockStatus?: StockStatus = StockStatus.IN_STOCK;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @IsNumber()
  sortOrder?: number = 0;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMediaDto)
  media?: CreateProductMediaDto[];
}