
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  gradeLevel: string;
  subjects: string[];
  language: string;
}

const SETTINGS_KEY = 'sahayak-ai-settings';

const defaultSettings: AppSettings = {
  gradeLevel: '',
  subjects: [],
  language: 'English',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      setSettings(newSettings);
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, []);

  return { settings, saveSettings, isLoaded };
}
