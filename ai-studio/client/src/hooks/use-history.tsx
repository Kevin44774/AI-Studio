import { useState, useEffect, useCallback } from 'react';
import { Generation } from '@shared/schema';
import { STORAGE_KEY, MAX_HISTORY_ITEMS } from '@/types/generation';

export function useHistory() {
  const [history, setHistory] = useState<Generation[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, [history]);

  const addToHistory = useCallback((generation: Generation) => {
    setHistory(prev => {
      const newHistory = [generation, ...prev.filter(item => item.id !== generation.id)];
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getHistoryItem = useCallback((id: string) => {
    return history.find(item => item.id === id);
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getHistoryItem,
  };
}
