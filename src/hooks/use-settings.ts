
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  gradeLevel: string;
  subjects: string[];
  language: string;
  theme: 'light' | 'dark';
}

const SETTINGS_KEY = 'sahayak-ai-settings';

const defaultSettings: AppSettings = {
  gradeLevel: '',
  subjects: [],
  language: 'English',
  theme: 'light',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
      let loadedSettings = defaultSettings;
      if (storedSettings) {
        // Make sure parsed settings include all keys from defaultSettings
        const parsed = JSON.parse(storedSettings);
        loadedSettings = { ...defaultSettings, ...parsed };
      }
      setSettings(loadedSettings);

      // Apply theme from loaded settings
      if (loadedSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      // Apply default theme in case of error
      document.documentElement.classList.remove('dark');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      setSettings(newSettings);
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      
      // Apply theme immediately on save
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, []);

  return { settings, saveSettings, isLoaded };
}
