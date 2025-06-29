import React, { useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { Type, Upload, Trash2, Plus } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [selectedFont, setSelectedFont] = useState<File | null>(null);
  const [previewFont, setPreviewFont] = useState<string>('');
  
  const fontInputRef = useRef<HTMLInputElement>(null);

  const handleFontSelect = (file: File) => {
    setSelectedFont(file);
    const url = URL.createObjectURL(file);
    const fontName =  file.name.replace(/\.[^/.]+$/, "");
    setPreviewFont(fontName);
    
    // Create temporary preview
    const existingPreview = document.getElementById('preview-font-style');
    if (existingPreview) {
      existingPreview.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'preview-font-style';
    style.textContent = `
      @font-face {
        font-family: '${fontName}';
        src: url('${url}') format('truetype');
      }
      .preview-font {
        font-family: '${fontName}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  };

  const handleAddFont = () => {
    if (!selectedFont) return;
    
    const url = URL.createObjectURL(selectedFont);
    const fontName = selectedFont.name.replace(/\.[^/.]+$/, "");
    
    const newFont = {
      name: fontName,
      url,
      file: selectedFont
    };
    
    const newSettings = {
      ...settings,
      editorFonts: [...(settings.editorFonts || []), newFont]
    };
    
    updateSettings(newSettings);
    setSelectedFont(null);
    setPreviewFont('');
    
    // Remove preview style
    const existingPreview = document.getElementById('preview-font-style');
    if (existingPreview) {
      existingPreview.remove();
    }
  };

  const removeEditorFont = (fontName: string) => {
    const newSettings = {
      ...settings,
      editorFonts: (settings.editorFonts || []).filter(font => font.name !== fontName)
    };
    updateSettings(newSettings);
  };

  const cancelSelection = () => {
    setSelectedFont(null);
    setPreviewFont('');
    
    // Remove preview style
    const existingPreview = document.getElementById('preview-font-style');
    if (existingPreview) {
      existingPreview.remove();
    }
  };

  const cardClasses = theme === 'light'
    ? 'bg-gradient-to-br from-gray-100/80 to-blue-50/80 backdrop-blur-md'
    : 'bg-gradient-to-br from-gray-800/80 to-red-900/80 backdrop-blur-md';

  const borderClasses = theme === 'light'
    ? 'border-gray-200'
    : 'border-gray-700';

  const textClasses = theme === 'light'
    ? 'text-black'
    : 'text-white';

  const secondaryTextClasses = theme === 'light'
    ? 'text-gray-700'
    : 'text-gray-300';

  // Settings button colors - keep current colors in light mode, red in dark mode
  const buttonClasses = theme === 'light'
    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${textClasses}`}>Settings</h1>
          <p className={secondaryTextClasses}>Customize your editor typography</p>
        </div>
      </div>

      {/* Font Downloader Section */}
      <div className={`${cardClasses} rounded-xl shadow-lg border ${borderClasses} p-6`}>
        <div className="flex items-center space-x-2 mb-6">
          <Type className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h2 className={`text-xl font-semibold ${textClasses}`}>Editor Font Manager</h2>
        </div>

        <div className="space-y-6">
          {/* Upload Font */}
          <div className="space-y-4">
            <h3 className={`text-lg font-medium ${textClasses}`}>Upload Custom Font for Editors</h3>
            <button
              onClick={() => fontInputRef.current?.click()}
              className={`w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors duration-200 flex flex-col items-center space-y-3 ${cardClasses}`}
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <p className={`text-sm font-medium ${textClasses}`}>Upload Font File</p>
                <p className={`text-xs ${secondaryTextClasses}`}>Supports .ttf, .otf, .woff, .woff2</p>
              </div>
            </button>
          </div>

          {/* Selected Font Preview */}
          {selectedFont && (
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${textClasses}`}>Selected Font Preview</h3>
              <div className={`p-4 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-purple-800`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-purple-700 dark:text-purple-300">{selectedFont.name}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Ready to add to editor fonts</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddFont}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add to Editor</span>
                    </button>
                    <button
                      onClick={cancelSelection}
                      className={`p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 backdrop-blur-sm rounded-lg transition-colors duration-200`}
                      title="Cancel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Font Preview */}
                <div 
                  className={`p-4 ${cardClasses} rounded border ${textClasses} preview-font`}
                >
                  <h4 className="text-xl font-bold mb-2">The quick brown fox jumps over the lazy dog</h4>
                  <p className="text-base mb-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                  <p className="text-base mb-2">abcdefghijklmnopqrstuvwxyz</p>
                  <p className="text-base">1234567890 !@#$%^&*()</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Editor Fonts */}
          {settings.editorFonts && settings.editorFonts.length > 0 && (
            <div className="space-y-4">
              <h3 className={`text-lg font-medium ${textClasses}`}>Available Editor Fonts</h3>
              <div className="space-y-3">
                {settings.editorFonts.map((font, index) => (
                  <div key={index} className={`p-4 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm rounded-lg border border-purple-200 dark:border-purple-800`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-purple-700 dark:text-purple-300">{font.name}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400">✅ Available in editors</p>
                      </div>
                      <button
                        onClick={() => removeEditorFont(font.name)}
                        className={`p-2 text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/20 backdrop-blur-sm rounded-lg transition-colors duration-200`}
                        title="Remove from editor fonts"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Font Preview */}
                    <div 
                      className={`p-4 ${cardClasses} rounded border ${textClasses}`}
                      style={{ fontFamily: font.name }}
                    >
                      <h4 className="text-xl font-bold mb-2">The quick brown fox jumps over the lazy dog</h4>
                      <p className="text-base mb-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                      <p className="text-base mb-2">abcdefghijklmnopqrstuvwxyz</p>
                      <p className="text-base">1234567890 !@#$%^&*()</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className={`p-4 ${cardClasses} rounded-lg border ${borderClasses}`}>
            <h4 className={`font-medium ${textClasses} mb-2`}>Instructions</h4>
            <ul className={`text-sm ${secondaryTextClasses} space-y-1`}>
              <li>• Upload a font file (.ttf, .otf, .woff, .woff2)</li>
              <li>• Preview the font before adding it</li>
              <li>• Click "Add to Editor" to make the font available in text editors</li>
              <li>• The font will appear in the font dropdown inside editors only</li>
              <li>• You can remove editor fonts anytime</li>
              <li>• Fonts only affect text content inside editors, not the entire website</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fontInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={(e) => e.target.files?.[0] && handleFontSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
};

export default Settings;