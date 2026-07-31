export class ProductVariantEntity {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}