import React from 'react';
import * as Icons from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const { categories, language } = useApp();

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Circle;
  };

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onCategoryChange('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {language === 'tr' ? 'Tümü' : 'All'}
        </button>
        
        {categories
          .filter(category => category.isActive)
          .sort((a, b) => a.order - b.order)
          .map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{language === 'tr' ? category.name : category.nameEn}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default CategoryFilter;