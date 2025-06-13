import React from 'react';
import { X, ThumbsUp, ThumbsDown, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { language, incrementLikes, incrementDislikes, userVotes } = useApp();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLike = () => {
    if (!userVotes[product.id]) {
      incrementLikes(product.id);
    }
  };

  const handleDislike = () => {
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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <img 
            src={product.image} 
            alt={language === 'tr' ? product.name : product.nameEn}
            className="w-full h-64 object-cover rounded-t-lg"
          />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 flex space-x-3">
            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{product.views}</span>
            </div>
            <div className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current" />
              <span>{likeRatio.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'tr' ? product.name : product.nameEn}
              </h2>
              <p className="text-gray-600">
                {language === 'tr' ? product.description : product.descriptionEn}
              </p>
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              ₺{product.price}
            </div>
          </div>

          {/* Like/Dislike buttons */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleLike}
              disabled={hasVoted}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                hasVoted
                  ? userVote === 'like'
                    ? 'bg-green-100 text-green-600 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-50 hover:bg-green-100 text-green-600'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span>{product.likes}</span>
              <span className="text-sm">{language === 'tr' ? 'Beğeni' : 'Likes'}</span>
            </button>
            
            <button
              onClick={handleDislike}
              disabled={hasVoted}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                hasVoted
                  ? userVote === 'dislike'
                    ? 'bg-red-100 text-red-600 border-2 border-red-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
              }`}
            >
              <ThumbsDown className="h-5 w-5" />
              <span>{product.dislikes}</span>
              <span className="text-sm">{language === 'tr' ? 'Beğenmeme' : 'Dislikes'}</span>
            </button>
          </div>

          {hasVoted && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                {language === 'tr' 
                  ? `Bu ürün için ${userVote === 'like' ? 'beğeni' : 'beğenmeme'} oyunuzu kullandınız.`
                  : `You have already ${userVote === 'like' ? 'liked' : 'disliked'} this product.`
                }
              </p>
            </div>
          )}

          {/* Variations - Display only */}
          {product.variations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {language === 'tr' ? 'Mevcut Seçenekler' : 'Available Options'}
              </h3>
              <div className="space-y-2">
                {product.variations.map(variation => (
                  <div
                    key={variation.id}
                    className={`w-full text-left p-3 rounded-md border ${
                      variation.isAvailable
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {language === 'tr' ? variation.name : variation.nameEn}
                      </span>
                      <span className="text-sm">
                        {variation.priceModifier > 0 && '+'}
                        {variation.priceModifier !== 0 && `₺${variation.priceModifier}`}
                        {!variation.isAvailable && (
                          <span className="ml-2 text-red-500">
                            ({language === 'tr' ? 'Mevcut değil' : 'Not available'})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;