interface ImageGridItem {
  id: string;
  name: string;
  src: string;
  done?: boolean;
}

interface ImageGridProps {
  items: ImageGridItem[];
  onRemove: (id: string) => void;
  small?: boolean;
}

export default function ImageGrid({ items, onRemove, small }: ImageGridProps) {
  return (
    <div
      className={`grid gap-4 mt-6 ${
        small
          ? 'grid-cols-[repeat(auto-fill,minmax(120px,1fr))]'
          : 'grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'
      }`}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="relative group bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
        >
          <img
            src={item.src}
            alt={item.name}
            className={`w-full object-cover ${small ? 'h-28' : 'h-40'}`}
          />
          {item.done !== undefined && (
            <div
              className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                item.done ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {item.done ? '\u2713' : '?'}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
          >
            X
          </button>
          <div className="px-2 py-1.5 text-xs text-gray-400 truncate">{item.name}</div>
        </div>
      ))}
    </div>
  );
}
