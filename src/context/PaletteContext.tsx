"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { generateRandomHex } from '@/lib/color-utils';

interface ColorState {
  hex: string;
  locked: boolean;
}

interface PaletteContextType {
  palette: ColorState[];
  generateNewPalette: () => void;
  toggleLock: (index: number) => void;
  updateColor: (index: number, newHex: string) => void;
  addColor: () => void;
  removeColor: (index: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

const INITIAL_PALETTE_SIZE = 5;

export const PaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palette, setPalette] = useState<ColorState[]>([]);
  const [history, setHistory] = useState<ColorState[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushToHistory = useCallback((newPalette: ColorState[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newPalette]);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const generateNewPalette = useCallback(() => {
    const newPalette = palette.length > 0 
      ? palette.map(c => (c.locked ? c : { ...c, hex: generateRandomHex() }))
      : Array.from({ length: INITIAL_PALETTE_SIZE }, () => ({ hex: generateRandomHex(), locked: false }));
    
    setPalette(newPalette);
    pushToHistory(newPalette);
  }, [palette, pushToHistory]);

  const toggleLock = (index: number) => {
    const newPalette = [...palette];
    newPalette[index].locked = !newPalette[index].locked;
    setPalette(newPalette);
  };

  const updateColor = (index: number, newHex: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(newHex)) return;
    const newPalette = [...palette];
    newPalette[index].hex = newHex.toUpperCase();
    setPalette(newPalette);
    pushToHistory(newPalette);
  };

  const addColor = () => {
    if (palette.length >= 10) return;
    const newPalette = [...palette, { hex: generateRandomHex(), locked: false }];
    setPalette(newPalette);
    pushToHistory(newPalette);
  };

  const removeColor = (index: number) => {
    if (palette.length <= 2) return;
    const newPalette = palette.filter((_, i) => i !== index);
    setPalette(newPalette);
    pushToHistory(newPalette);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setPalette(prev);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setPalette(next);
      setHistoryIndex(historyIndex + 1);
    }
  };

  useEffect(() => {
    if (palette.length === 0) {
      generateNewPalette();
    }
  }, [generateNewPalette, palette.length]);

  return (
    <PaletteContext.Provider value={{
      palette,
      generateNewPalette,
      toggleLock,
      updateColor,
      addColor,
      removeColor,
      undo,
      redo,
      canUndo: historyIndex > 0,
      canRedo: historyIndex < history.length - 1
    }}>
      {children}
    </PaletteContext.Provider>
  );
};

export const usePalette = () => {
  const context = useContext(PaletteContext);
  if (!context) throw new Error('usePalette must be used within a PaletteProvider');
  return context;
};