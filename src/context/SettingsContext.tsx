import React, { createContext, useContext, useState, useEffect } from 'react';

interface EditorFont {
  name: string;
  url: string;
  file?: File;
}

interface SettingsData {
  editorFonts?: EditorFont[];
}

interface SettingsContextType {
  settings: SettingsData;
  updateSettings: (newSettings: SettingsData) => void;
}

const defaultSettings: SettingsData = {};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('life-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
    localStorage.setItem('life-settings', JSON.stringify(newSettings));
  };

  // Load editor fonts into document head for use in editors
  useEffect(() => {
    // Remove existing editor font styles
    const existingStyles = document.querySelectorAll('[id^="editor-font-"]');
    existingStyles.forEach(style => style.remove());

    // Add new editor font styles
    if (settings.editorFonts) {
      settings.editorFonts.forEach(font => {
        const styleId = `editor-font-${font.name.replace(/\s+/g, '-')}`;
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            @font-face {
              font-family: '${font.name}';
              src: url('${font.url}') format('truetype');
            }
          `;
          document.head.appendChild(style);
        }
      });
    }
  }, [settings.editorFonts]);

  const value: SettingsContextType = {
    settings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};