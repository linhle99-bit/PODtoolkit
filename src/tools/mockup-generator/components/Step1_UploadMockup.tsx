import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../../../components/Auth/AuthProvider';
import DropZone from '../../../components/Shared/DropZone';
import ImageGrid from '../../../components/Shared/ImageGrid';

export default function Step1_UploadMockup() {
  const { mockups, addMockup, removeMockup, setStep, presets, presetsLoaded, initPresets, syncFromCloud, loadPreset, deletePreset } = useAppStore();
  const { user } = useAuth();

  useEffect(() => {
    initPresets();
  }, [initPresets]);

  // Re-sync when user logs in
  useEffect(() => {
    if (user && presetsLoaded) {
      syncFromCloud();
    }
  }, [user, presetsLoaded, syncFromCloud]);

  const handleFiles = (files: FileList) => {
    Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            addMockup({
              id: crypto.randomUUID(),
              name: file.name,
              src: e.target!.result as string,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              printArea: null,
            });
          };
          img.src = e.target!.result as string;
        };
        reader.readAsDataURL(file);
      });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Upload Mockup</h2>
      <p className="text-gray-400 mb-6">Upload mockup images or load a saved store preset</p>

      {/* Saved presets */}
      {presetsLoaded && presets.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Saved Store Presets (mockup + print area)</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {presets.map((preset) => (
              <div
                key={preset.name}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-purple-500 transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium text-sm">{preset.name}</p>
                    <p className="text-gray-500 text-xs">
                      {preset.mockups.length} mockup(s)
                      {preset.mockups.every((m) => m.printArea) && (
                        <span className="text-green-500 ml-1">+ print areas</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => deletePreset(preset.name)}
                    className="text-gray-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    Delete
                  </button>
                </div>
                <div className="flex gap-1 mb-3 overflow-hidden">
                  {preset.mockups.slice(0, 4).map((m, i) => (
                    <img key={i} src={m.src} alt={m.name} className="w-10 h-10 rounded object-cover" />
                  ))}
                  {preset.mockups.length > 4 && (
                    <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                      +{preset.mockups.length - 4}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    loadPreset(preset.name);
                    const p = presets.find((pp) => pp.name === preset.name);
                    if (p && p.mockups.every((m) => m.printArea)) {
                      setStep(1);
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DropZone
        onFiles={handleFiles}
        icon={'\uD83D\uDC55'}
        label="Drag & drop mockup files here or click to browse"
      />

      {mockups.length > 0 && (
        <>
          <ImageGrid
            items={mockups.map((m) => ({ id: m.id, name: m.name, src: m.src }))}
            onRemove={removeMockup}
          />
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition"
            >
              Next: Define Print Area →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
