import { useState } from 'react';
import type { BundleConfig } from '../utils/canvas-renderer';

interface Props {
  config: BundleConfig;
  onChange: (patch: Partial<BundleConfig>) => void;
  imageCount: number;
  onAiAnalyze?: (apiKey: string) => void;
  aiLoading?: boolean;
  aiResult?: { theme: string; bundle_name: string } | null;
  onGenerateBg?: (apiKey: string) => void;
  bgLoading?: boolean;
  hasBgImage?: boolean;
  onClearBg?: () => void;
}

const SIZE_PRESETS = [
  { label: '4200×4200', w: 4200, h: 4200 },
  { label: '3000×3000', w: 3000, h: 3000 },
  { label: '2000×2000', w: 2000, h: 2000 },
  { label: '4200×2800', w: 4200, h: 2800 },
  { label: '3600×2400', w: 3600, h: 2400 },
];

export default function SettingsPanel({
  config, onChange, imageCount,
  onAiAnalyze, aiLoading, aiResult,
  onGenerateBg, bgLoading, hasBgImage, onClearBg,
}: Props) {
  const [claudeKey, setClaudeKey] = useState(() => localStorage.getItem('anthropic_api_key') || '');
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [showKeys, setShowKeys] = useState(false);

  const handleAiAnalyze = () => {
    if (!claudeKey.trim()) return;
    localStorage.setItem('anthropic_api_key', claudeKey);
    onAiAnalyze?.(claudeKey);
  };

  const handleGenerateBg = () => {
    if (!openaiKey.trim()) return;
    localStorage.setItem('openai_api_key', openaiKey);
    onGenerateBg?.(openaiKey);
  };

  return (
    <div className="space-y-5">
      {/* ── AI Section ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            AI Powers
          </label>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition"
          >
            {showKeys ? 'Hide keys' : 'Show keys'}
          </button>
        </div>

        <div className="space-y-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30">
          {/* Claude API Key */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Claude API Key
              <span className="text-gray-600 font-normal normal-case tracking-normal ml-1">- analyze theme & style</span>
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-purple-500/50 transition"
            />
            <button
              onClick={handleAiAnalyze}
              disabled={!claudeKey.trim() || imageCount < 2 || aiLoading}
              className="w-full mt-1.5 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-orange-300 rounded-lg text-xs font-medium hover:from-orange-500/30 hover:to-pink-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
              <div className="mt-1.5 px-2.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-[10px] text-green-400 font-medium">Theme: {aiResult.theme}</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700/30" />

          {/* OpenAI API Key */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
              ChatGPT API Key
              <span className="text-gray-600 font-normal normal-case tracking-normal ml-1">- generate background</span>
            </label>
            <input
              type={showKeys ? 'text' : 'password'}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-green-500/50 transition"
            />
            <button
              onClick={handleGenerateBg}
              disabled={!openaiKey.trim() || imageCount < 2 || bgLoading || (!aiResult && !config.title)}
              className="w-full mt-1.5 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 rounded-lg text-xs font-medium hover:from-green-500/30 hover:to-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {bgLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-green-300/30 border-t-green-300 rounded-full animate-spin" />
                  Generating BG...
                </span>
              ) : (
                '🎨 Generate AI Background'
              )}
            </button>
            {!aiResult && !config.title && (
              <p className="text-[9px] text-gray-600 mt-1">Run Claude analysis first for best results</p>
            )}
            {hasBgImage && (
              <div className="mt-1.5 flex items-center justify-between px-2.5 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-[10px] text-green-400 font-medium">AI background applied</p>
                <button
                  onClick={onClearBg}
                  className="text-[10px] text-red-400 hover:text-red-300 transition"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Title ── */}
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

      {/* ── Layout ── */}
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

      {/* ── Colors ── */}
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

      {/* ── Size presets ── */}
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

      {/* ── Stats ── */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-800/50 text-xs text-gray-500">
        <span>{imageCount} design(s)</span>
        <span>{config.width}×{config.height}px</span>
        <span>300 DPI</span>
      </div>
    </div>
  );
}
