import { StockStatus } from '@prisma/client';

export class ProductEntity {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  hasVariants: boolean;
  price?: number | null;
  salePrice?: number | null;
  stock?: number | null;
  stockStatus: StockStatus;
  weight?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  brandId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}