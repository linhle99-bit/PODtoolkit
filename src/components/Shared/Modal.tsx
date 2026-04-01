interface ModalProps {
  name: string;
  src: string;
  onClose: () => void;
  onDownload?: () => void;
}

export default function Modal({ name, src, onClose, onDownload }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <span className="text-sm text-gray-300 truncate">{name}</span>
          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition"
              >
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center overflow-auto">
          <img src={src} alt={name} className="max-w-full max-h-[75vh] object-contain" />
        </div>
      </div>
    </div>
  );
}
