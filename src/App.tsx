import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import CategoryFilter from './components/Menu/CategoryFilter';
import ProductCard from './components/Menu/ProductCard';
import ProductModal from './components/Menu/ProductModal';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';

const MainApp: React.FC = () => {
  const { products, categories, language, isAdmin, theme } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category === selectedCategory && product.isActive)
    : products.filter(product => product.isActive);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  // Apply theme to the root element
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--font-family', theme.fontFamily);
  }, [theme]);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ 
        fontFamily: theme.fontFamily,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor
      }}
    >
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onToggleAdmin={() => setIsAdminLoginOpen(true)}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory 
              ? (language === 'tr' 
                  ? categories.find(c => c.id === selectedCategory)?.name
                  : categories.find(c => c.id === selectedCategory)?.nameEn
                )
              : (language === 'tr' ? 'Tüm Ürünler' : 'All Products')
            }
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredProducts.length} {language === 'tr' ? 'ürün bulundu' : 'products found'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'tr' ? 'Ürün bulunamadı' : 'No products found'}
            </h3>
            <p className="text-gray-600">
              {language === 'tr' 
                ? 'Bu kategoride henüz ürün bulunmuyor.'
                : 'No products available in this category yet.'
              }
            </p>
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={closeProductModal}
        />
      )}

      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;