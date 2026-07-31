// query-product.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  maxPrice?: number;
}