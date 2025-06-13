import React from 'react';
import { Palette, Type, Layout } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ThemeCustomizer: React.FC = () => {
  const { theme, setTheme, language } = useApp();

  const updateTheme = (updates: Partial<typeof theme>) => {
    setTheme({ ...theme, ...updates });
  };

  const presetColors = [
    { name: 'Gold', primary: '#D4AF37', secondary: '#8B4513', accent: '#228B22' },
    { name: 'Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#06B6D4' },
    { name: 'Purple', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#EC4899' },
    { name: 'Green', primary: '#10B981', secondary: '#059669', accent: '#F59E0B' },
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter' },
    { name: 'Roboto', value: 'Roboto' },
    { name: 'Open Sans', value: 'Open Sans' },
    { name: 'Poppins', value: 'Poppins' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Palette className="h-8 w-8 text-yellow-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'tr' ? 'Tema Özelleştirme' : 'Theme Customization'}
        </h2>
      </div>

      {/* Color Scheme */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span>{language === 'tr' ? 'Renk Şeması' : 'Color Scheme'}</span>
        </h3>

        {/* Preset Colors */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {language === 'tr' ? 'Hazır Renkler' : 'Preset Colors'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presetColors.map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateTheme({
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  accentColor: preset.accent
                })}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex space-x-1 mb-2">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <p className="text-xs text-gray-600">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'tr' ? 'Ana Renk' : 'Primary Color'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'tr' ? 'İkincil Renk' : 'Secondary Color'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={theme.secondaryColor}
                onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'tr' ? 'Vurgu Rengi' : 'Accent Color'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={theme.accentColor}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Type className="h-5 w-5" />
          <span>{language === 'tr' ? 'Tipografi' : 'Typography'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'tr' ? 'Font Ailesi' : 'Font Family'}
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {fontOptions.map(font => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'tr' ? 'Metin Rengi' : 'Text Color'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={theme.textColor}
                onChange={(e) => updateTheme({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Font Size Preview */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {language === 'tr' ? 'Önizleme' : 'Preview'}
          </h4>
          <div className="space-y-2" style={{ fontFamily: theme.fontFamily, color: theme.textColor }}>
            <h1 style={{ fontSize: theme.fontSize.xlarge }} className="font-bold">
              {language === 'tr' ? 'Ana Başlık' : 'Main Heading'}
            </h1>
            <h2 style={{ fontSize: theme.fontSize.large }} className="font-semibold">
              {language === 'tr' ? 'Alt Başlık' : 'Subheading'}
            </h2>
            <p style={{ fontSize: theme.fontSize.medium }}>
              {language === 'tr' 
                ? 'Bu bir örnek paragraf metnidir. Yazı tipi ve boyutunu görmek için kullanılır.'
                : 'This is a sample paragraph text. Used to see font and size.'
              }
            </p>
            <p style={{ fontSize: theme.fontSize.small }} className="text-gray-600">
              {language === 'tr' ? 'Küçük metin örneği' : 'Small text example'}
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Layout className="h-5 w-5" />
          <span>{language === 'tr' ? 'Canlı Önizleme' : 'Live Preview'}</span>
        </h3>

        <div className="border border-gray-200 rounded-lg p-4">
          <div 
            className="w-full h-32 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {language === 'tr' ? 'Ana Renk' : 'Primary Color'}
          </div>
          
          <div className="mt-3 flex space-x-2">
            <div 
              className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              {language === 'tr' ? 'İkincil' : 'Secondary'}
            </div>
            <div 
              className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: theme.accentColor }}
            >
              {language === 'tr' ? 'Vurgu' : 'Accent'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              // Reset to default theme
              updateTheme({
                primaryColor: '#D4AF37',
                secondaryColor: '#8B4513',
                accentColor: '#228B22',
                backgroundColor: '#FAFAFA',
                textColor: '#2D3748',
                fontFamily: 'Inter'
              });
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {language === 'tr' ? 'Varsayılana Sıfırla' : 'Reset to Default'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;