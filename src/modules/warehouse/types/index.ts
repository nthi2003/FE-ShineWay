export interface Ingredient {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  unit: string;
  importDate: string;
  price: string;
  description?: string;
  supplier?: string;
  expiryDate?: string;
  status?: 'active' | 'low_stock' | 'expired';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  createdDate: string;
  status?: 'active' | 'inactive';
  color?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  address?: string;
}
