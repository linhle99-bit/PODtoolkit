import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { batchComposite } from '../utils/batch';
import { downloadOne, downloadAllAsZip } from '../utils/download';
import Modal from '../../../components/Shared/Modal';
import type { CompositeResult } from '../types';

export default function Step4_PreviewExport() {
  const { mockups, designs, results, processing, progress, total, setStep, setResults, setProcessing, setProgress, clearResults } =
    useAppStore();
  const [modalResult, setModalResult] = useState<CompositeResult | null>(null);

  useEffect(() => {
    if (results.length === 0 && !processing) {
      runComposite();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runComposite = async () => {
    setProcessing(true);
    clearResults();
    const t = mockups.length * designs.length;
    setProgress(0, t);
    const res = await batchComposite(mockups, designs, (done, tot) => {
      setProgress(done, tot);
    });
    setResults(res);
    setProcessing(false);
  };

  // Group results by folder
  const folders = new Map<string, CompositeResult[]>();
  results.forEach((r) => {
    const key = r.folder || '(No folder)';
    if (!folders.has(key)) folders.set(key, []);
    folders.get(key)!.push(r);
  });

  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  const ResultCard = ({ r }: { r: CompositeResult }) => (
    <div
      key={r.id}
      className="group bg-gray-800 rounded-xl overflow-hidden border border-gray-700 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
      onClick={() => setModalResult(r)}
    >
      <img src={r.src} alt={r.name} className="w-full h-48 object-cover" />
      <div className="p-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 truncate flex-1">{r.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadOne(r);
          }}
          className="ml-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition"
        >
          Save
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Preview & Export</h2>

      {processing && (
        <div className="mb-6">
          <p className="text-gray-400 mb-2">
            Processing... {progress}/{total}
          </p>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-200 rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {!processing && results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">
              {results.length} images in {folders.size} folder(s)
            </p>
            <div className="flex gap-2">
              <button
                onClick={runComposite}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
              >
                Regenerate
              </button>
              <button
                onClick={() => downloadAllAsZip(results)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg font-medium transition"
              >
                Download All (ZIP)
              </button>
            </div>
          </div>

          {folders.size > 1 ? (
            // Show grouped by folder
            Array.from(folders.entries()).map(([folderName, items]) => (
              <div key={folderName} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-purple-400">{'\uD83D\uDCC1'}</span>
                  <span className="text-sm font-medium text-gray-300">{folderName}</span>
                  <span className="text-xs text-gray-500">({items.length})</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {items.map((r) => (
                    <ResultCard key={r.id} r={r} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Single folder or no folders — flat grid
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {results.map((r) => (
                <ResultCard key={r.id} r={r} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-6 flex justify-start">
        <button
          onClick={() => setStep(2)}
          className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
        >
          ← Back
        </button>
      </div>

      {modalResult && (
        <Modal
          name={modalResult.name}
          src={modalResult.src}
          onClose={() => setModalResult(null)}
          onDownload={() => downloadOne(modalResult)}
        />
      )}
    </div>
  );
}
