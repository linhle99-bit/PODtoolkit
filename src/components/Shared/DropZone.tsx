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
      className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 group ${
        dragOver
          ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
          : 'border-gray-700/60 hover:border-purple-500/50 hover:bg-purple-500/5'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <p className="text-gray-300 text-base font-medium">{label}</p>
        <p className="text-gray-600 text-sm mt-2">PNG, JPG, WebP</p>
      </div>
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
