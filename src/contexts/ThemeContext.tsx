import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SettingsService } from '../services/SettingsService';

interface ThemeContextType {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'vi' | 'en') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [language, setLanguageState] = useState<'vi' | 'en'>('vi');

  // Load theme and language from settings
  useEffect(() => {
    const loadSettings = async () => {
      if (currentUser) {
        try {
          const settings = await SettingsService.getSettings(currentUser.uid);
          if (settings) {
            setThemeState(settings.theme);
            setLanguageState(settings.language);
          }
        } catch (error) {
          console.error('Error loading theme settings:', error);
        }
      } else {
        // Reset to defaults when user logs out
        setThemeState('light');
        setLanguageState('vi');
      }
    };

    loadSettings();
  }, [currentUser]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (currentUser) {
      try {
        await SettingsService.updateSettings(currentUser.uid, { theme: newTheme });
      } catch (error) {
        console.error('Error updating theme:', error);
        // Revert state if update fails
        setThemeState(theme);
      }
    }
  };

  const setLanguage = async (newLanguage: 'vi' | 'en') => {
    setLanguageState(newLanguage);
    if (currentUser) {
      try {
        await SettingsService.updateSettings(currentUser.uid, { language: newLanguage });
      } catch (error) {
        console.error('Error updating language:', error);
        // Revert state if update fails
        setLanguageState(language);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    language,
    setTheme,
    setLanguage,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
