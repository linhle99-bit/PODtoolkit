interface ModalProps {
  name: string;
  src: string;
  onClose: () => void;
  onDownload?: () => void;
}

export default function Modal({ name, src, onClose, onDownload }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-gray-900 border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 animate-[scaleIn_0.2s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-sm">
          <span className="text-sm text-gray-300 truncate font-medium">{name}</span>
          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm rounded-lg transition shadow-lg shadow-purple-600/20"
              >
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
        <div className="p-5 flex items-center justify-center overflow-auto bg-gray-950/50">
          <img src={src} alt={name} className="max-w-full max-h-[75vh] object-contain rounded-lg" />
        </div>
      </div>
    </div>
  );
}
