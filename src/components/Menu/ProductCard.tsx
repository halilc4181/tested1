import React from 'react';
import { Eye, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { language, incrementLikes, incrementDislikes, incrementViews, userVotes } = useApp();

  const handleCardClick = () => {
    incrementViews(product.id);
    onClick();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userVotes[product.id]) {
      incrementLikes(product.id);
    }
  };

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userVotes[product.id]) {
      incrementDislikes(product.id);
    }
  };

  const likeRatio = product.likes + product.dislikes > 0 
    ? (product.likes / (product.likes + product.dislikes)) * 100 
    : 0;

  const hasVoted = !!userVotes[product.id];
  const userVote = userVotes[product.id];

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative">
        <img 
          src={product.image} 
          alt={language === 'tr' ? product.name : product.nameEn}
          className="w-full h-48 object-cover"
        />
        
        {/* Overlay with stats */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>{product.views}</span>
        </div>

        {/* Rating overlay */}
        <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
          <Star className="h-3 w-3 fill-current" />
          <span>{likeRatio.toFixed(0)}%</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {language === 'tr' ? product.name : product.nameEn}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {language === 'tr' ? product.description : product.descriptionEn}
        </p>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-yellow-600">
            ₺{product.price}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              disabled={hasVoted}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                hasVoted
                  ? userVote === 'like'
                    ? 'bg-green-100 text-green-600 border border-green-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-50 hover:bg-green-100 text-green-600'
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-xs">{product.likes}</span>
            </button>
            
            <button
              onClick={handleDislike}
              disabled={hasVoted}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                hasVoted
                  ? userVote === 'dislike'
                    ? 'bg-red-100 text-red-600 border border-red-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
              }`}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="text-xs">{product.dislikes}</span>
            </button>
          </div>
        </div>

        {/* Variations indicator */}
        {product.variations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {language === 'tr' ? `${product.variations.length} çeşit mevcut` : `${product.variations.length} variants available`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;