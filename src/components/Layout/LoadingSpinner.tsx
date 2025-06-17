import React from 'react';
import { Loader } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg mb-4">
          <Loader className="h-8 w-8 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">DiyetTakip</h2>
        <p className="text-sm text-gray-600">Veriler yükleniyor...</p>
      </div>
    </div>
  );
};