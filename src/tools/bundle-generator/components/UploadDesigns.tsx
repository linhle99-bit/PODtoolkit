import { useCallback } from 'react';
import DropZone from '../../../components/Shared/DropZone';

interface Props {
  images: string[];
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}

export default function UploadDesigns({ images, onAdd, onRemove, onClear }: Props) {
  const handleFiles = useCallback(
    (files: FileList) => onAdd(files),
    [onAdd],
  );

  if (images.length === 0) {
    return (
      <DropZone
        onFiles={handleFiles}
        icon="📦"
        label="Drop your PNG designs here"
        accept="image/png,image/jpeg,image/webp"
      />
    );
  }

  return (
    <div>
      {/* Thumbnails */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
        {images.map((src, i) => (
          <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700/30">
            <img src={src} alt="" className="w-full h-full object-contain p-1" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </div>
        ))}

        {/* Add more */}
        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-700/50 hover:border-purple-500/50 flex items-center justify-center cursor-pointer text-gray-600 hover:text-purple-400 text-2xl transition-colors">
          +
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAdd(e.target.files);
                e.target.value = '';
              }
            }}
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{images.length} design(s) uploaded</p>
        <button
          onClick={onClear}
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
