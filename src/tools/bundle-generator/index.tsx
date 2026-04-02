import { useState, useCallback } from 'react';
import UploadDesigns from './components/UploadDesigns';
import SettingsPanel from './components/SettingsPanel';
import PreviewExport from './components/PreviewExport';
import { DEFAULT_CONFIG, type BundleConfig } from './utils/canvas-renderer';
import { analyzeDesigns, type AiAnalysisResult } from './utils/ai-analyzer';

export default function BundleGenerator() {
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [config, setConfig] = useState<BundleConfig>({ ...DEFAULT_CONFIG });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);

  const handleAddFiles = useCallback((files: FileList) => {
    const newSrcs: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newSrcs.push(URL.createObjectURL(file));
      }
    });
    setImageSrcs((prev) => [...prev, ...newSrcs]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setImageSrcs((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleClear = useCallback(() => {
    imageSrcs.forEach((src) => URL.revokeObjectURL(src));
    setImageSrcs([]);
    setAiResult(null);
  }, [imageSrcs]);

  const handleConfigChange = useCallback((patch: Partial<BundleConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleAiAnalyze = useCallback(async (apiKey: string) => {
    if (imageSrcs.length < 2) return;
    setAiLoading(true);
    try {
      const result = await analyzeDesigns(imageSrcs, apiKey);
      setAiResult(result);
      // Apply AI suggestions to config
      setConfig((prev) => ({
        ...prev,
        title: result.bundle_name,
        backgroundColor: result.background_color,
        accentColor: result.accent_color,
        titleColor: result.title_color,
      }));
    } catch (err) {
      alert(`AI analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  }, [imageSrcs]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Bundle Generator</h1>
        <p className="text-sm text-gray-500">
          Create beautiful mockup bundles for Etsy, Creative Market & more
        </p>
      </div>

      {/* Upload section */}
      <div className="mb-6">
        <UploadDesigns
          images={imageSrcs}
          onAdd={handleAddFiles}
          onRemove={handleRemove}
          onClear={handleClear}
        />
      </div>

      {imageSrcs.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 p-5 bg-gray-900/50 border border-gray-800/50 rounded-2xl">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">
                Settings
              </h2>
              <SettingsPanel
                config={config}
                onChange={handleConfigChange}
                imageCount={imageSrcs.length}
                onAiAnalyze={handleAiAnalyze}
                aiLoading={aiLoading}
                aiResult={aiResult}
              />
            </div>
          </div>

          {/* Preview + Export */}
          <div className="lg:col-span-2">
            <PreviewExport imageSrcs={imageSrcs} config={config} />
          </div>
        </div>
      )}

      {imageSrcs.length === 1 && (
        <div className="text-center py-10 text-gray-500 text-sm">
          Upload at least 2 designs to generate a bundle
        </div>
      )}
    </div>
  );
}
