import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Restaurant, Theme, Language, Table, UserVotes } from '../types';
import { 
  products as initialProducts, 
  categories as initialCategories, 
  restaurant as initialRestaurant, 
  tables as initialTables,
  defaultTheme 
} from '../data/mockData';

interface AppContextType {
  // Data
  products: Product[];
  categories: Category[];
  restaurant: Restaurant;
  tables: Table[];
  theme: Theme;
  language: Language;
  userVotes: UserVotes;
  
  // Admin state
  isAdmin: boolean;
  
  // Actions
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setRestaurant: (restaurant: Restaurant) => void;
  setTables: (tables: Table[]) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  incrementViews: (id: string) => void;
  incrementLikes: (id: string) => void;
  incrementDislikes: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Table actions
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  deleteTable: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage or use defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('qr-menu-products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('qr-menu-categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });
  
  const [restaurant, setRestaurant] = useState<Restaurant>(() => {
    const saved = localStorage.getItem('qr-menu-restaurant');
    return saved ? JSON.parse(saved) : initialRestaurant;
  });
  
  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('qr-menu-tables');
    return saved ? JSON.parse(saved) : initialTables;
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('qr-menu-theme');
    return saved ? JSON.parse(saved) : defaultTheme;
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('qr-menu-language');
    return (saved as Language) || 'tr';
  });
  
  const [userVotes, setUserVotes] = useState<UserVotes>(() => {
    const saved = localStorage.getItem('qr-menu-user-votes');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      likes: 0,
      dislikes: 0,
      views: 0
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...productData } : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const incrementViews = (id: string) => {
    setProducts(prev => prev.map(product =>
      product.id === id ? { ...product, views: product.views + 1 } : product
    ));
  };

  const incrementLikes = (id: string) => {
    // Check if user has already voted
    if (userVotes[id]) return;
    
    setProducts(prev => prev.map(product =>
      product.id === id ? { ...product, likes: product.likes + 1 } : product
    ));
    
    setUserVotes(prev => {
      const newVotes = { ...prev, [id]: 'like' as const };
      localStorage.setItem('qr-menu-user-votes', JSON.stringify(newVotes));
      return newVotes;
    });
  };

  const incrementDislikes = (id: string) => {
    // Check if user has already voted
    if (userVotes[id]) return;
    
    setProducts(prev => prev.map(product =>
      product.id === id ? { ...product, dislikes: product.dislikes + 1 } : product
    ));
    
    setUserVotes(prev => {
      const newVotes = { ...prev, [id]: 'dislike' as const };
      localStorage.setItem('qr-menu-user-votes', JSON.stringify(newVotes));
      return newVotes;
    });
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prev => prev.map(category =>
      category.id === id ? { ...category, ...categoryData } : category
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
    // Also remove products in this category
    setProducts(prev => prev.filter(product => product.category !== id));
  };

  const addTable = (tableData: Omit<Table, 'id'>) => {
    const newTable: Table = {
      ...tableData,
      id: Date.now().toString()
    };
    setTables(prev => [...prev, newTable]);
  };

  const updateTable = (id: string, tableData: Partial<Table>) => {
    setTables(prev => prev.map(table =>
      table.id === id ? { ...table, ...tableData } : table
    ));
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(table => table.id !== id));
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('qr-menu-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('qr-menu-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('qr-menu-restaurant', JSON.stringify(restaurant));
  }, [restaurant]);

  useEffect(() => {
    localStorage.setItem('qr-menu-tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('qr-menu-theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('qr-menu-language', language);
  }, [language]);

  const value: AppContextType = {
    products,
    categories,
    restaurant,
    tables,
    theme,
    language,
    userVotes,
    isAdmin,
    setProducts,
    setCategories,
    setRestaurant,
    setTables,
    setTheme,
    setLanguage,
    setIsAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    incrementViews,
    incrementLikes,
    incrementDislikes,
    addCategory,
    updateCategory,
    deleteCategory,
    addTable,
    updateTable,
    deleteTable
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};