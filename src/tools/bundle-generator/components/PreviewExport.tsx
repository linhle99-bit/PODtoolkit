import { useEffect, useRef, useState, useCallback } from 'react';
import type { BundleConfig } from '../utils/canvas-renderer';
import { renderBundle, canvasToBlob } from '../utils/canvas-renderer';

interface Props {
  imageSrcs: string[];
  config: BundleConfig;
}

export default function PreviewExport({ imageSrcs, config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);

  // Load images
  useEffect(() => {
    let cancelled = false;
    const promises = imageSrcs.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => resolve(img);
          img.src = src;
        }),
    );
    Promise.all(promises).then((imgs) => {
      if (!cancelled) setLoadedImages(imgs.filter((i) => i.naturalWidth > 0));
    });
    return () => { cancelled = true; };
  }, [imageSrcs]);

  // Render preview (scaled down)
  useEffect(() => {
    if (loadedImages.length === 0 || !previewRef.current) return;

    setRendering(true);

    // Use requestAnimationFrame to not block UI
    requestAnimationFrame(() => {
      // Render at a smaller preview size for speed
      const previewScale = Math.min(1200 / config.width, 1200 / config.height);
      const previewConfig: BundleConfig = {
        ...config,
        width: Math.round(config.width * previewScale),
        height: Math.round(config.height * previewScale),
        padding: Math.round(config.padding * previewScale),
        gap: Math.round(config.gap * previewScale),
        titleFontSize: Math.round(config.titleFontSize * previewScale),
        badgeFontSize: Math.round(config.badgeFontSize * previewScale),
      };

      const result = renderBundle(loadedImages, previewConfig);

      const preview = previewRef.current;
      if (preview) {
        preview.width = result.width;
        preview.height = result.height;
        preview.getContext('2d')!.drawImage(result, 0, 0);
      }
      setRendering(false);
    });
  }, [loadedImages, config]);

  // Export full-size PNG
  const handleExport = useCallback(async () => {
    if (loadedImages.length === 0) return;
    setExporting(true);

    // Small delay to show loading state
    await new Promise((r) => setTimeout(r, 50));

    try {
      const fullCanvas = renderBundle(loadedImages, config);
      const blob = await canvasToBlob(fullCanvas);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bundle_${config.layout}_${config.width}x${config.height}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [loadedImages, config]);

  // Export both layouts
  const handleExportBoth = useCallback(async () => {
    if (loadedImages.length === 0) return;
    setExporting(true);
    await new Promise((r) => setTimeout(r, 50));

    try {
      for (const layout of ['grid', 'collage'] as const) {
        const c = { ...config, layout };
        const canvas = renderBundle(loadedImages, c);
        const blob = await canvasToBlob(canvas);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bundle_${layout}_${c.width}x${c.height}.png`;
        a.click();
        URL.revokeObjectURL(url);
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [loadedImages, config]);

  if (imageSrcs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-600">
        Upload designs to see preview
      </div>
    );
  }

  return (
    <div>
      {/* Preview */}
      <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-700/30 mb-4">
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-10">
            <div className="text-purple-400 text-sm animate-pulse">Rendering...</div>
          </div>
        )}
        <canvas
          ref={previewRef}
          className="w-full h-auto"
          style={{ maxHeight: '70vh' }}
        />
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting || loadedImages.length === 0}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {exporting ? 'Exporting...' : `Export ${config.layout} PNG`}
        </button>
        <button
          onClick={handleExportBoth}
          disabled={exporting || loadedImages.length === 0}
          className="px-6 py-3 bg-gray-800/60 border border-gray-700/50 text-gray-300 rounded-xl font-medium text-sm hover:border-purple-500/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {exporting ? '...' : 'Export Both'}
        </button>
      </div>
    </div>
  );
}
