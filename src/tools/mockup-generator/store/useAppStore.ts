import { create } from 'zustand';
import { supabase } from '../../../lib/supabase';
import type { MockupFile, DesignFile, CompositeResult, PrintArea } from '../types';

export interface MockupPreset {
  name: string;
  mockups: MockupFile[];
  createdAt: number;
}

// --- IndexedDB helpers (local cache) ---
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

// --- Supabase cloud sync ---
async function loadPresetsFromCloud(): Promise<MockupPreset[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('presets')
    .select('name, data, created_at')
    .eq('user_id', user.id);

  if (error || !data) return [];

  return data.map((row) => ({
    name: row.name,
    mockups: (row.data as any).mockups || [],
    createdAt: new Date(row.created_at).getTime(),
  }));
}

async function savePresetToCloud(preset: MockupPreset): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('presets')
    .upsert({
      user_id: user.id,
      name: preset.name,
      data: { mockups: preset.mockups },
      created_at: new Date(preset.createdAt).toISOString(),
    }, { onConflict: 'user_id,name' });
}

async function deletePresetFromCloud(name: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('presets')
    .delete()
    .eq('user_id', user.id)
    .eq('name', name);
}

// Migrate old localStorage presets
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
  syncing: boolean;

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
  syncFromCloud: () => Promise<void>;
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
  syncing: false,

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
    await migrateFromLocalStorage();
    const local = await loadPresetsFromDB();
    set({ presets: local, presetsLoaded: true });

    // Also try loading from cloud
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      get().syncFromCloud();
    }
  },

  syncFromCloud: async () => {
    set({ syncing: true });
    try {
      const cloudPresets = await loadPresetsFromCloud();
      const localPresets = await loadPresetsFromDB();

      // Merge: cloud wins on conflicts (by name), keep local-only presets
      const merged = new Map<string, MockupPreset>();
      for (const p of localPresets) merged.set(p.name, p);
      for (const p of cloudPresets) merged.set(p.name, p); // cloud overwrites

      const all = Array.from(merged.values());

      // Save merged back to local DB
      for (const p of all) {
        await savePresetToDB(p);
      }

      // Upload local-only presets to cloud
      const cloudNames = new Set(cloudPresets.map((p) => p.name));
      for (const p of localPresets) {
        if (!cloudNames.has(p.name)) {
          await savePresetToCloud(p);
        }
      }

      set({ presets: all });
    } catch (e) {
      console.error('Sync error:', e);
    }
    set({ syncing: false });
  },

  savePreset: async (name) => {
    const { mockups, presets } = get();
    const newPreset: MockupPreset = { name, mockups, createdAt: Date.now() };

    // Save to local DB
    await savePresetToDB(newPreset);

    // Save to cloud if logged in
    await savePresetToCloud(newPreset);

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
    await deletePresetFromCloud(name);

    const updated = presets.filter((p) => p.name !== name);
    set({ presets: updated });
  },
}));
