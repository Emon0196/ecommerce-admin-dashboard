export interface AttributeCombination {
  [key: string]: string;
}

export interface GeneratedVariant {
  sku: string;
  price: number;
  stock: number;
  attributes: AttributeCombination;
}