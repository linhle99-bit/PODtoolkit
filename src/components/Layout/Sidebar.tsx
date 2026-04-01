import { NavLink } from 'react-router-dom';
import tools, { categories } from '../../tools/registry';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-800">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2">
            <span className="text-2xl">🛠️</span>
            <span className="text-lg font-bold text-white">POD Toolkit</span>
          </NavLink>
        </div>

        <nav className="p-3 overflow-y-auto h-[calc(100%-65px)]">
          {categories.map((cat) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                {cat}
              </p>
              {tools
                .filter((t) => t.category === cat)
                .map((tool) => (
                  <NavLink
                    key={tool.id}
                    to={tool.comingSoon ? '#' : tool.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition ${
                        tool.comingSoon
                          ? 'text-gray-600 cursor-not-allowed'
                          : isActive
                          ? 'bg-purple-600/20 text-purple-400 font-medium'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      }`
                    }
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <span className="flex-1">{tool.name}</span>
                    {tool.isNew && (
                      <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] rounded-full font-bold">
                        NEW
                      </span>
                    )}
                    {tool.comingSoon && (
                      <span className="text-[10px] text-gray-600">Soon</span>
                    )}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
