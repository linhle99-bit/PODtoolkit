import { useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { preprocessDesign } from '../utils/preprocessDesign';
import DropZone from '../../../components/Shared/DropZone';

export default function Step3_UploadDesigns() {
  const { designs, addDesign, removeDesign, setStep } = useAppStore();
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File, folder: string) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawSrc = e.target!.result as string;
      const processedSrc = await preprocessDesign(rawSrc);
      const img = new Image();
      img.onload = () => {
        addDesign({
          id: crypto.randomUUID(),
          name: file.name,
          folder,
          src: processedSrc,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      };
      img.src = processedSrc;
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList) => {
    Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .forEach((file) => {
        // Extract folder from webkitRelativePath if available
        const relPath = (file as any).webkitRelativePath as string;
        let folder = '';
        if (relPath) {
          const parts = relPath.split('/');
          // e.g. "MyFolder/sub/file.png" → folder = "MyFolder/sub"
          if (parts.length > 1) {
            folder = parts.slice(0, -1).join('/');
          }
        }
        processFile(file, folder);
      });
  };

  const handleFolderSelect = () => {
    folderInputRef.current?.click();
  };

  // Group designs by folder
  const folders = new Map<string, typeof designs>();
  designs.forEach((d) => {
    const key = d.folder || '(No folder)';
    if (!folders.has(key)) folders.set(key, []);
    folders.get(key)!.push(d);
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Upload Designs</h2>
      <p className="text-gray-400 mb-6">Upload files or select entire folders</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <DropZone
          onFiles={handleFiles}
          icon={'\uD83C\uDFA8'}
          label="Drag & drop files"
        />
        <div
          onClick={handleFolderSelect}
          className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 border-gray-600 hover:border-purple-500 hover:bg-purple-500/5"
        >
          <div className="text-5xl mb-4">{'\uD83D\uDCC1'}</div>
          <p className="text-gray-300 text-lg">Select Folder</p>
          <p className="text-gray-500 text-sm mt-2">All images in folder & subfolders</p>
        </div>
      </div>

      {/* Hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        className="hidden"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      {designs.length > 0 && (
        <>
          <p className="text-gray-400 mt-4 text-sm">
            {designs.length} design(s) in {folders.size} folder(s)
          </p>

          {/* Display by folder */}
          {Array.from(folders.entries()).map(([folderName, items]) => (
            <div key={folderName} className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-purple-400">{'\uD83D\uDCC1'}</span>
                <span className="text-sm font-medium text-gray-300">{folderName}</span>
                <span className="text-xs text-gray-500">({items.length})</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                {items.map((d) => (
                  <div
                    key={d.id}
                    className="relative group bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
                  >
                    <img src={d.src} alt={d.name} className="w-full h-28 object-cover" />
                    <button
                      onClick={() => removeDesign(d.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      X
                    </button>
                    <div className="px-2 py-1 text-[11px] text-gray-400 truncate">{d.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition"
            >
              Next: Preview & Export →
            </button>
          </div>
        </>
      )}
      {designs.length === 0 && (
        <div className="mt-6 flex justify-start">
          <button
            onClick={() => setStep(1)}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
