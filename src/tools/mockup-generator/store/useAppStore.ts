import { create } from 'zustand';
import type { MockupFile, DesignFile, CompositeResult, PrintArea } from '../types';

export interface MockupPreset {
  name: string;
  mockups: MockupFile[];
  createdAt: number;
}

// --- IndexedDB helpers (no size limit unlike localStorage) ---
const DB_NAME = 'mockup-generator-db';
const STORE_NAME = 'presets';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadPresetsFromDB(): Promise<MockupPreset[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function savePresetToDB(preset: MockupPreset): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(preset);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deletePresetFromDB(name: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Migrate old localStorage presets to IndexedDB (one-time)
async function migrateFromLocalStorage(): Promise<MockupPreset[]> {
  try {
    const raw = localStorage.getItem('mockup-generator-presets');
    if (raw) {
      const presets: MockupPreset[] = JSON.parse(raw);
      for (const p of presets) {
        await savePresetToDB(p);
      }
      localStorage.removeItem('mockup-generator-presets');
      return presets;
    }
  } catch { /* ignore */ }
  return [];
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
  presetsLoaded: boolean;

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
  initPresets: () => Promise<void>;
  savePreset: (name: string) => Promise<void>;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentStep: 0,
  mockups: [],
  designs: [],
  results: [],
  processing: false,
  progress: 0,
  total: 0,
  presets: [],
  presetsLoaded: false,

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

  initPresets: async () => {
    if (get().presetsLoaded) return;
    // Migrate old localStorage data first
    const migrated = await migrateFromLocalStorage();
    const existing = await loadPresetsFromDB();
    // Merge: migrated ones are already saved to DB
    const all = existing.length > 0 ? existing : migrated;
    set({ presets: all, presetsLoaded: true });
  },

  savePreset: async (name) => {
    const { mockups, presets } = get();
    const newPreset: MockupPreset = { name, mockups, createdAt: Date.now() };
    await savePresetToDB(newPreset);
    const updated = [...presets.filter((p) => p.name !== name), newPreset];
    set({ presets: updated });
  },

  loadPreset: (name) => {
    const { presets } = get();
    const preset = presets.find((p) => p.name === name);
    if (preset) {
      set({ mockups: preset.mockups.map((m) => ({ ...m, id: crypto.randomUUID() })) });
    }
  },

  deletePreset: async (name) => {
    const { presets } = get();
    await deletePresetFromDB(name);
    const updated = presets.filter((p) => p.name !== name);
    set({ presets: updated });
  },
}));
