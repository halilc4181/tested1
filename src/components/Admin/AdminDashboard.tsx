import React, { useState } from 'react';
import { BarChart3, Package, Users, Settings, TrendingUp, Eye, Heart, Star, Building, Table } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductManager from './ProductManager';
import ThemeCustomizer from './ThemeCustomizer';
import RestaurantSettings from './RestaurantSettings';
import TableManager from './TableManager';

const AdminDashboard: React.FC = () => {
  const { products, categories, language } = useApp();
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'categories' | 'tables' | 'restaurant' | 'theme'>('stats');

  const totalProducts = products.length;
  const totalViews = products.reduce((sum, product) => sum + product.views, 0);
  const totalLikes = products.reduce((sum, product) => sum + product.likes, 0);
  const totalDislikes = products.reduce((sum, product) => sum + product.dislikes, 0);
  const averageRating = totalLikes + totalDislikes > 0 ? (totalLikes / (totalLikes + totalDislikes)) * 100 : 0;

  const popularProducts = products
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const tabs = [
    { id: 'stats', name: language === 'tr' ? 'İstatistikler' : 'Statistics', icon: BarChart3 },
    { id: 'products', name: language === 'tr' ? 'Ürünler' : 'Products', icon: Package },
    { id: 'categories', name: language === 'tr' ? 'Kategoriler' : 'Categories', icon: Users },
    { id: 'tables', name: language === 'tr' ? 'Masalar' : 'Tables', icon: Table },
    { id: 'restaurant', name: language === 'tr' ? 'İşletme' : 'Restaurant', icon: Building },
    { id: 'theme', name: language === 'tr' ? 'Tema' : 'Theme', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'tr' ? 'Toplam Ürün' : 'Total Products'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
                  </div>
                  <Package className="h-12 w-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'tr' ? 'Toplam Görüntülenme' : 'Total Views'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{totalViews}</p>
                  </div>
                  <Eye className="h-12 w-12 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'tr' ? 'Toplam Beğeni' : 'Total Likes'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{totalLikes}</p>
                  </div>
                  <Heart className="h-12 w-12 text-red-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'tr' ? 'Ortalama Puan' : 'Average Rating'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}%</p>
                  </div>
                  <Star className="h-12 w-12 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Popular Products */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>{language === 'tr' ? 'Popüler Ürünler' : 'Popular Products'}</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {popularProducts.map((product, index) => {
                    const likeRatio = product.likes + product.dislikes > 0 
                      ? (product.likes / (product.likes + product.dislikes)) * 100 
                      : 0;
                    
                    return (
                      <div key={product.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <img 
                          src={product.image} 
                          alt={language === 'tr' ? product.name : product.nameEn}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {language === 'tr' ? product.name : product.nameEn}
                          </h4>
                          <p className="text-sm text-gray-500">₺{product.price}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{product.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{likeRatio.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'tables' && <TableManager />}
        {activeTab === 'restaurant' && <RestaurantSettings />}
        {activeTab === 'theme' && <ThemeCustomizer />}
        
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'tr' ? 'Kategori Yönetimi' : 'Category Management'}
            </h3>
            <p className="text-gray-600">
              {language === 'tr' ? 'Kategori yönetimi özelliği geliştirme aşamasında...' : 'Category management feature is under development...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;