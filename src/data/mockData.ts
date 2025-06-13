import { Product, Category, Restaurant, Theme, Table } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Sıcak İçecekler', nameEn: 'Hot Beverages', icon: 'Coffee', order: 1, isActive: true },
  { id: '2', name: 'Soğuk İçecekler', nameEn: 'Cold Beverages', icon: 'GlassWater', order: 2, isActive: true },
  { id: '3', name: 'Kahvaltı', nameEn: 'Breakfast', icon: 'Croissant', order: 3, isActive: true },
  { id: '4', name: 'Ana Yemekler', nameEn: 'Main Dishes', icon: 'ChefHat', order: 4, isActive: true },
  { id: '5', name: 'Tatlılar', nameEn: 'Desserts', icon: 'Cake', order: 5, isActive: true },
  { id: '6', name: 'Aperitifler', nameEn: 'Appetizers', icon: 'Utensils', order: 6, isActive: true }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Türk Kahvesi',
    nameEn: 'Turkish Coffee',
    description: 'Geleneksel Türk kahvesi, orta şekerli, yanında lokum ikram edilir.',
    descriptionEn: 'Traditional Turkish coffee, medium sweet, served with Turkish delight.',
    price: 25,
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: '1',
    likes: 156,
    dislikes: 12,
    views: 1250,
    isActive: true,
    variations: [
      { id: '1a', name: 'Şekersiz', nameEn: 'No Sugar', priceModifier: 0, isAvailable: true },
      { id: '1b', name: 'Az Şekerli', nameEn: 'Low Sugar', priceModifier: 0, isAvailable: true },
      { id: '1c', name: 'Orta Şekerli', nameEn: 'Medium Sugar', priceModifier: 0, isAvailable: true },
      { id: '1d', name: 'Şekerli', nameEn: 'Sweet', priceModifier: 0, isAvailable: true }
    ],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Cappuccino',
    nameEn: 'Cappuccino',
    description: 'İtalyan usulü cappuccino, özel süt köpüğü ve tarçın ile.',
    descriptionEn: 'Italian-style cappuccino with special milk foam and cinnamon.',
    price: 30,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: '1',
    likes: 203,
    dislikes: 8,
    views: 1890,
    isActive: true,
    variations: [
      { id: '2a', name: 'Küçük', nameEn: 'Small', priceModifier: -5, isAvailable: true },
      { id: '2b', name: 'Orta', nameEn: 'Medium', priceModifier: 0, isAvailable: true },
      { id: '2c', name: 'Büyük', nameEn: 'Large', priceModifier: 8, isAvailable: true }
    ],
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Limonata',
    nameEn: 'Lemonade',
    description: 'Taze sıkılmış limon, naneli, buzlu.',
    descriptionEn: 'Fresh squeezed lemon, with mint, iced.',
    price: 18,
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: '2',
    likes: 89,
    dislikes: 3,
    views: 567,
    isActive: true,
    variations: [
      { id: '3a', name: 'Naneli', nameEn: 'With Mint', priceModifier: 2, isAvailable: true },
      { id: '3b', name: 'Basit', nameEn: 'Plain', priceModifier: 0, isAvailable: true }
    ],
    createdAt: new Date('2024-01-12')
  },
  {
    id: '4',
    name: 'Menemen',
    nameEn: 'Turkish Scrambled Eggs',
    description: 'Domates, biber, soğan ile hazırlanmış geleneksel menemen.',
    descriptionEn: 'Traditional scrambled eggs with tomatoes, peppers, and onions.',
    price: 45,
    image: 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: '3',
    likes: 178,
    dislikes: 15,
    views: 2100,
    isActive: true,
    variations: [
      { id: '4a', name: 'Peynirli', nameEn: 'With Cheese', priceModifier: 8, isAvailable: true },
      { id: '4b', name: 'Sucuklu', nameEn: 'With Sausage', priceModifier: 12, isAvailable: true },
      { id: '4c', name: 'Klasik', nameEn: 'Classic', priceModifier: 0, isAvailable: true }
    ],
    createdAt: new Date('2024-01-08')
  },
  {
    id: '5',
    name: 'Izgara Köfte',
    nameEn: 'Grilled Meatballs',
    description: 'El yapımı köfteler, ızgara sebze ve pilav ile servis edilir.',
    descriptionEn: 'Handmade meatballs served with grilled vegetables and rice.',
    price: 85,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: '4',
    likes: 234,
    dislikes: 18,
    views: 3200,
    isActive: true,
    variations: [
      { id: '5a', name: 'Tek Porsiyon', nameEn: 'Single Portion', priceModifier: 0, isAvailable: true },
      { id: '5b', name: 'Çift Porsiyon', nameEn: 'Double Portion', priceModifier: 35, isAvailable: true }
    ],
    createdAt: new Date('2024-01-05')
  },
  {
    id: '6',
    name: 'Baklava',
    nameEn: 'Baklava',
    description: 'Geleneksel Türk baklavası, fıstıklı, şerbetli.',
    descriptionEn: 'Traditional Turkish baklava with pistachios and syrup.',
    price: 35,
    image: 'https://images.pexels.com/photos/4686819/pexels-photo-4686819.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: '5',
    likes: 312,
    dislikes: 9,
    views: 4100,
    isActive: true,
    variations: [
      { id: '6a', name: 'Fıstıklı', nameEn: 'With Pistachios', priceModifier: 5, isAvailable: true },
      { id: '6b', name: 'Cevizli', nameEn: 'With Walnuts', priceModifier: 0, isAvailable: true }
    ],
    createdAt: new Date('2024-01-03')
  }
];

export const restaurant: Restaurant = {
  name: 'Lezzet Durağı',
  nameEn: 'Taste Station',
  logo: 'https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg?auto=compress&cs=tinysrgb&w=200',
  phone: '+90 212 555 0123',
  address: 'Beyoğlu, İstiklal Cad. No:123, İstanbul',
  addressEn: 'Beyoğlu, İstiklal Street No:123, Istanbul',
  wifiPassword: 'lezzet2024',
  socialMedia: {
    instagram: '@lezzetduragi',
    facebook: 'LezzetDuragiOfficial',
    twitter: '@lezzetduragi'
  }
};

export const tables: Table[] = [
  { id: '1', name: 'Masa 1', nameEn: 'Table 1', isActive: true },
  { id: '2', name: 'Masa 2', nameEn: 'Table 2', isActive: true },
  { id: '3', name: 'Masa 3', nameEn: 'Table 3', isActive: true },
  { id: '4', name: 'Masa 4', nameEn: 'Table 4', isActive: true },
  { id: '5', name: 'Masa 5', nameEn: 'Table 5', isActive: true },
];

export const defaultTheme: Theme = {
  primaryColor: '#D4AF37',
  secondaryColor: '#8B4513',
  accentColor: '#228B22',
  backgroundColor: '#FAFAFA',
  textColor: '#2D3748',
  fontFamily: 'Inter',
  fontSize: {
    small: '0.875rem',
    medium: '1rem',
    large: '1.25rem',
    xlarge: '1.5rem'
  }
};