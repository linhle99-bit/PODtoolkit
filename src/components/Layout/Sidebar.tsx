import { NavLink } from 'react-router-dom';
import tools, { categories } from '../../tools/registry';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-800/50">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-lg shadow-lg shadow-purple-600/20 group-hover:shadow-purple-600/40 transition-shadow">
              &#x1F6E0;&#xFE0F;
            </div>
            <div>
              <span className="text-base font-bold text-white">POD Toolkit</span>
              <p className="text-[10px] text-gray-500 -mt-0.5">Print-on-Demand</p>
            </div>
          </NavLink>
        </div>

        <nav className="p-3 overflow-y-auto h-[calc(100%-73px)]">
          {categories.map((cat) => (
            <div key={cat} className="mb-5">
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] px-3 mb-2">
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
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all duration-200 ${
                        tool.comingSoon
                          ? 'text-gray-700 cursor-not-allowed'
                          : isActive
                          ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/10 text-purple-300 font-medium border border-purple-500/10 shadow-sm'
                          : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                      }`
                    }
                  >
                    <span className="text-base">{tool.icon}</span>
                    <span className="flex-1 truncate">{tool.name}</span>
                    {tool.isNew && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[9px] rounded-full font-bold">
                        NEW
                      </span>
                    )}
                    {tool.comingSoon && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
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
