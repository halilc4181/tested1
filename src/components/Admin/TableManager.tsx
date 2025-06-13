import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Table } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Table as TableType } from '../../types';

const TableManager: React.FC = () => {
  const { tables, addTable, updateTable, deleteTable, language } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TableType>>({});

  const handleEdit = (table: TableType) => {
    setIsEditing(table.id);
    setEditForm(table);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditForm({
      name: '',
      nameEn: '',
      isActive: true
    });
  };

  const handleSave = () => {
    if (isCreating) {
      addTable(editForm as Omit<TableType, 'id'>);
      setIsCreating(false);
    } else if (isEditing) {
      updateTable(isEditing, editForm);
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
    if (window.confirm(language === 'tr' ? 'Bu masayı silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this table?')) {
      deleteTable(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Table className="h-8 w-8 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'tr' ? 'Masa Yönetimi' : 'Table Management'}
          </h2>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>{language === 'tr' ? 'Yeni Masa' : 'New Table'}</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreating 
              ? (language === 'tr' ? 'Yeni Masa Ekle' : 'Add New Table')
              : (language === 'tr' ? 'Masayı Düzenle' : 'Edit Table')
            }
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Masa Adı (TR)' : 'Table Name (TR)'}
              </label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masa 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Masa Adı (EN)' : 'Table Name (EN)'}
              </label>
              <input
                type="text"
                value={editForm.nameEn || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Table 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
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

          <div className="flex space-x-3">
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

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Table className="h-5 w-5 text-gray-400" />
                <h3 className="font-medium text-gray-900">
                  {language === 'tr' ? table.name : table.nameEn}
                </h3>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                table.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {table.isActive 
                  ? (language === 'tr' ? 'Aktif' : 'Active')
                  : (language === 'tr' ? 'Pasif' : 'Inactive')
                }
              </span>
            </div>
            
            <div className="text-sm text-gray-500 mb-3">
              {language === 'tr' ? table.nameEn : table.name}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => updateTable(table.id, { isActive: !table.isActive })}
                className={`p-1 rounded ${
                  table.isActive
                    ? 'text-red-600 hover:text-red-900'
                    : 'text-green-600 hover:text-green-900'
                }`}
                title={table.isActive 
                  ? (language === 'tr' ? 'Pasif yap' : 'Deactivate')
                  : (language === 'tr' ? 'Aktif yap' : 'Activate')
                }
              >
                {table.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleEdit(table)}
                className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                title={language === 'tr' ? 'Düzenle' : 'Edit'}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(table.id)}
                className="text-red-600 hover:text-red-900 p-1 rounded"
                title={language === 'tr' ? 'Sil' : 'Delete'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === 'tr' ? 'Henüz masa eklenmemiş' : 'No tables added yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'tr' 
              ? 'Garson çağırma sistemi için masalar ekleyin.'
              : 'Add tables for the waiter calling system.'
            }
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{language === 'tr' ? 'İlk Masayı Ekle' : 'Add First Table'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TableManager;