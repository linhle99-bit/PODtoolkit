import { useState } from 'react';
import type { BundleConfig } from '../utils/canvas-renderer';

interface Props {
  config: BundleConfig;
  onChange: (patch: Partial<BundleConfig>) => void;
  imageCount: number;
  onAiAnalyze?: (apiKey: string) => void;
  aiLoading?: boolean;
  aiResult?: { theme: string; bundle_name: string } | null;
}

const SIZE_PRESETS = [
  { label: '4200×4200', w: 4200, h: 4200 },
  { label: '3000×3000', w: 3000, h: 3000 },
  { label: '2000×2000', w: 2000, h: 2000 },
  { label: '4200×2800', w: 4200, h: 2800 },
  { label: '3600×2400', w: 3600, h: 2400 },
];

export default function SettingsPanel({ config, onChange, imageCount, onAiAnalyze, aiLoading, aiResult }: Props) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleAiAnalyze = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('anthropic_api_key', apiKey);
    onAiAnalyze?.(apiKey);
  };

  return (
    <div className="space-y-5">
      {/* AI Analysis */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          AI Auto-Style (Claude)
        </label>
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-3.5 py-2.5 pr-16 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500/50 transition"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-gray-300 px-1.5 py-0.5"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            onClick={handleAiAnalyze}
            disabled={!apiKey.trim() || imageCount < 2 || aiLoading}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-orange-300 rounded-xl text-sm font-medium hover:from-orange-500/30 hover:to-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {aiLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-orange-300/30 border-t-orange-300 rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              '🧠 Analyze & Auto-Style'
            )}
          </button>
          {aiResult && (
            <div className="px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-[11px] text-green-400 font-medium">Theme: {aiResult.theme}</p>
              <p className="text-[10px] text-green-500/70 mt-0.5">Colors & title auto-applied</p>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Bundle Title
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3.5 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500/50 transition"
          placeholder="e.g. Watercolor Flowers Bundle"
        />
      </div>

      {/* Layout */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Layout
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['grid', 'collage'] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => onChange({ layout })}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                config.layout === layout
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-gray-800/60 text-gray-400 border border-gray-700/30 hover:border-purple-500/30'
              }`}
            >
              {layout === 'grid' ? '⊞ Grid' : '✦ Collage'}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs text-gray-500 font-mono">{config.backgroundColor}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Badge
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs text-gray-500 font-mono">{config.accentColor}</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Title
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.titleColor}
              onChange={(e) => onChange({ titleColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs text-gray-500 font-mono">{config.titleColor}</span>
          </div>
        </div>
      </div>

      {/* Size presets */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          Output Size
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange({ width: p.w, height: p.h })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                config.width === p.w && config.height === p.h
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'bg-gray-800/60 text-gray-500 border border-gray-700/30 hover:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-800/50 text-xs text-gray-500">
        <span>{imageCount} design(s)</span>
        <span>{config.width}×{config.height}px</span>
        <span>300 DPI</span>
      </div>
    </div>
  );
}
