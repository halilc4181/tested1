export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  image: string;
  category: string;
  likes: number;
  dislikes: number;
  views: number;
  isActive: boolean;
  variations: ProductVariation[];
  createdAt: Date;
}

export interface ProductVariation {
  id: string;
  name: string;
  nameEn: string;
  priceModifier: number;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface Restaurant {
  name: string;
  nameEn: string;
  logo: string;
  phone: string;
  address: string;
  addressEn: string;
  wifiPassword: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface Table {
  id: string;
  name: string;
  nameEn: string;
  isActive: boolean;
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager';
}

export interface UserVotes {
  [productId: string]: 'like' | 'dislike';
}

export type Language = 'tr' | 'en';