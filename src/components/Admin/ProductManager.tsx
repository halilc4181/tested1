import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariation } from '../../types';

const ProductManager: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, language } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const handleEdit = (product: Product) => {
    setIsEditing(product.id);
    setEditForm(product);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditForm({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      price: 0,
      image: '',
      category: categories[0]?.id || '',
      isActive: true,
      variations: []
    });
  };

  const handleSave = () => {
    if (isCreating) {
      addProduct(editForm as Omit<Product, 'id' | 'createdAt'>);
      setIsCreating(false);
    } else if (isEditing) {
      updateProduct(isEditing, editForm);
      setIsEditing(null);
    }
    setEditForm({});
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsCreating(false);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (window.confirm(language === 'tr' ? 'Bu ürünü silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const addVariation = () => {
    const newVariation: ProductVariation = {
      id: Date.now().toString(),
      name: '',
      nameEn: '',
      priceModifier: 0,
      isAvailable: true
    };
    setEditForm(prev => ({
      ...prev,
      variations: [...(prev.variations || []), newVariation]
    }));
  };

  const updateVariation = (index: number, field: keyof ProductVariation, value: any) => {
    setEditForm(prev => ({
      ...prev,
      variations: prev.variations?.map((variation, i) => 
        i === index ? { ...variation, [field]: value } : variation
      ) || []
    }));
  };

  const removeVariation = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      variations: prev.variations?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'tr' ? 'Ürün Yönetimi' : 'Product Management'}
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>{language === 'tr' ? 'Yeni Ürün' : 'New Product'}</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreating 
              ? (language === 'tr' ? 'Yeni Ürün Ekle' : 'Add New Product')
              : (language === 'tr' ? 'Ürünü Düzenle' : 'Edit Product')
            }
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Ürün Adı (TR)' : 'Product Name (TR)'}
              </label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Ürün Adı (EN)' : 'Product Name (EN)'}
              </label>
              <input
                type="text"
                value={editForm.nameEn || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, nameEn: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Açıklama (TR)' : 'Description (TR)'}
              </label>
              <textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Açıklama (EN)' : 'Description (EN)'}
              </label>
              <textarea
                value={editForm.descriptionEn || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, descriptionEn: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Fiyat' : 'Price'}
              </label>
              <input
                type="number"
                value={editForm.price || 0}
                onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Kategori' : 'Category'}
              </label>
              <select
                value={editForm.category || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {language === 'tr' ? category.name : category.nameEn}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Görsel URL' : 'Image URL'}
              </label>
              <input
                type="url"
                value={editForm.image || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Variations */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'tr' ? 'Çeşitler' : 'Variations'}
              </label>
              <button
                type="button"
                onClick={addVariation}
                className="text-sm text-yellow-600 hover:text-yellow-700"
              >
                + {language === 'tr' ? 'Çeşit Ekle' : 'Add Variation'}
              </button>
            </div>
            
            {editForm.variations?.map((variation, index) => (
              <div key={variation.id} className="border border-gray-200 rounded-md p-3 mb-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder={language === 'tr' ? 'Çeşit Adı (TR)' : 'Variation Name (TR)'}
                    value={variation.name}
                    onChange={(e) => updateVariation(index, 'name', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder={language === 'tr' ? 'Çeşit Adı (EN)' : 'Variation Name (EN)'}
                    value={variation.nameEn}
                    onChange={(e) => updateVariation(index, 'nameEn', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder={language === 'tr' ? 'Fiyat Farkı' : 'Price Modifier'}
                    value={variation.priceModifier}
                    onChange={(e) => updateVariation(index, 'priceModifier', parseFloat(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariation(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    {language === 'tr' ? 'Kaldır' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editForm.isActive || false}
                onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-700">
                {language === 'tr' ? 'Aktif' : 'Active'}
              </span>
            </label>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{language === 'tr' ? 'Kaydet' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              <span>{language === 'tr' ? 'İptal' : 'Cancel'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'tr' ? 'Ürün' : 'Product'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'tr' ? 'Kategori' : 'Category'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'tr' ? 'Fiyat' : 'Price'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'tr' ? 'İstatistikler' : 'Stats'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'tr' ? 'Durum' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'tr' ? 'İşlemler' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                const category = categories.find(c => c.id === product.category);
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={product.image} 
                          alt={language === 'tr' ? product.name : product.nameEn}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {language === 'tr' ? product.name : product.nameEn}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.variations.length} {language === 'tr' ? 'çeşit' : 'variations'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category ? (language === 'tr' ? category.name : category.nameEn) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₺{product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>{product.views} {language === 'tr' ? 'görüntülenme' : 'views'}</div>
                        <div>{product.likes} {language === 'tr' ? 'beğeni' : 'likes'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive 
                          ? (language === 'tr' ? 'Aktif' : 'Active')
                          : (language === 'tr' ? 'Pasif' : 'Inactive')
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                          className={`p-1 rounded ${
                            product.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;