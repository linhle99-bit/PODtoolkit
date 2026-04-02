import { useState, useCallback } from 'react';
import UploadDesigns from './components/UploadDesigns';
import SettingsPanel from './components/SettingsPanel';
import PreviewExport from './components/PreviewExport';
import { DEFAULT_CONFIG, type BundleConfig } from './utils/canvas-renderer';
import { analyzeDesigns, type AiAnalysisResult } from './utils/ai-analyzer';
import { generateBackground, loadImage } from './utils/openai-bg-generator';

export default function BundleGenerator() {
  const [imageSrcs, setImageSrcs] = useState<string[]>([]);
  const [config, setConfig] = useState<BundleConfig>({ ...DEFAULT_CONFIG });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [bgLoading, setBgLoading] = useState(false);

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
    setConfig((prev) => ({ ...prev, backgroundImage: null }));
  }, [imageSrcs]);

  const handleConfigChange = useCallback((patch: Partial<BundleConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // Claude: analyze theme
  const handleAiAnalyze = useCallback(async (apiKey: string) => {
    if (imageSrcs.length < 2) return;
    setAiLoading(true);
    try {
      const result = await analyzeDesigns(imageSrcs, apiKey);
      setAiResult(result);
      setConfig((prev) => ({
        ...prev,
        title: result.bundle_name,
        backgroundColor: result.background_color,
        accentColor: result.accent_color,
        titleColor: result.title_color,
      }));
    } catch (err) {
      alert(`Claude analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAiLoading(false);
    }
  }, [imageSrcs]);

  // OpenAI: generate background
  const handleGenerateBg = useCallback(async (apiKey: string) => {
    setBgLoading(true);
    try {
      const theme = aiResult?.theme || config.title || 'professional product showcase';
      const result = await generateBackground(
        apiKey, theme, config.accentColor, config.backgroundColor,
        config.width, config.height,
      );
      const bgImg = await loadImage(result.dataUrl);
      setConfig((prev) => ({ ...prev, backgroundImage: bgImg }));
    } catch (err) {
      alert(`OpenAI background generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setBgLoading(false);
    }
  }, [aiResult, config.title, config.accentColor, config.backgroundColor, config.width, config.height]);

  const handleClearBg = useCallback(() => {
    setConfig((prev) => ({ ...prev, backgroundImage: null }));
  }, []);

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
                onGenerateBg={handleGenerateBg}
                bgLoading={bgLoading}
                hasBgImage={!!config.backgroundImage}
                onClearBg={handleClearBg}
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
