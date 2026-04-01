import { useCallback, useState, useRef } from 'react';

interface DropZoneProps {
  onFiles: (files: FileList) => void;
  accept?: string;
  icon: string;
  label: string;
}

export default function DropZone({ onFiles, accept = 'image/*', icon, label }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [onFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
        dragOver
          ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
          : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
      }`}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-gray-300 text-lg">{label}</p>
      <p className="text-gray-500 text-sm mt-2">PNG, JPG, WebP</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
