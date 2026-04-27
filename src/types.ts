export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  categories: string[];
  popularity: number;
  pin: number;
  url: string;
  description: string;
  features?: string[];
  variants?: { label: string; price: number; originalPrice?: number }[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
  popularity: number;
  pin: number;
  productCount: number;
  parentId?: string;
}
