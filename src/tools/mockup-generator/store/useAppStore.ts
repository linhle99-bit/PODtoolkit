import { create } from 'zustand';
import type { MockupFile, DesignFile, CompositeResult, PrintArea } from '../types';

export interface MockupPreset {
  name: string;
  mockups: MockupFile[];
  createdAt: number;
}

const PRESETS_KEY = 'mockup-generator-presets';

function loadPresets(): MockupPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: MockupPreset[]) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

interface AppState {
  currentStep: number;
  mockups: MockupFile[];
  designs: DesignFile[];
  results: CompositeResult[];
  processing: boolean;
  progress: number;
  total: number;
  presets: MockupPreset[];

  setStep: (step: number) => void;
  addMockup: (mockup: MockupFile) => void;
  removeMockup: (id: string) => void;
  setMockups: (mockups: MockupFile[]) => void;
  setPrintArea: (mockupId: string, area: PrintArea | null) => void;
  addDesign: (design: DesignFile) => void;
  removeDesign: (id: string) => void;
  setResults: (results: CompositeResult[]) => void;
  setProcessing: (processing: boolean) => void;
  setProgress: (progress: number, total: number) => void;
  clearResults: () => void;
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentStep: 0,
  mockups: [],
  designs: [],
  results: [],
  processing: false,
  progress: 0,
  total: 0,
  presets: loadPresets(),

  setStep: (step) => set({ currentStep: step }),
  addMockup: (mockup) => set((s) => ({ mockups: [...s.mockups, mockup] })),
  removeMockup: (id) => set((s) => ({ mockups: s.mockups.filter((m) => m.id !== id) })),
  setMockups: (mockups) => set({ mockups }),
  setPrintArea: (mockupId, area) =>
    set((s) => ({
      mockups: s.mockups.map((m) => (m.id === mockupId ? { ...m, printArea: area } : m)),
    })),
  addDesign: (design) => set((s) => ({ designs: [...s.designs, design] })),
  removeDesign: (id) => set((s) => ({ designs: s.designs.filter((d) => d.id !== id) })),
  setResults: (results) => set({ results }),
  setProcessing: (processing) => set({ processing }),
  setProgress: (progress, total) => set({ progress, total }),
  clearResults: () => set({ results: [], progress: 0, total: 0 }),

  savePreset: (name) => {
    const { mockups, presets } = get();
    const newPreset: MockupPreset = { name, mockups, createdAt: Date.now() };
    const updated = [...presets.filter((p) => p.name !== name), newPreset];
    savePresetsToStorage(updated);
    set({ presets: updated });
  },
  loadPreset: (name) => {
    const { presets } = get();
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      set({ mockups: preset.mockups.map((m) => ({ ...m, id: crypto.randomUUID() })) });
    }
  },
  deletePreset: (name) => {
    const { presets } = get();
    const updated = presets.filter((p) => p.name !== name);
    savePresetsToStorage(updated);
    set({ presets: updated });
  },
}));
