import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import tools, { categories } from '../../tools/registry';
import { useAuth } from '../Auth/AuthProvider';
import AuthModal from '../Auth/AuthModal';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
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

        <nav className="p-3 overflow-y-auto flex-1">
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

        {/* Auth section */}
        <div className="p-3 border-t border-gray-800/50">
          {loading ? (
            <div className="px-3 py-2 text-gray-600 text-sm">Loading...</div>
          ) : user ? (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 truncate">{user.email}</p>
                  <p className="text-[10px] text-green-500">Synced</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-300 text-sm rounded-xl border border-purple-500/20 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Sign in to sync
            </button>
          )}
        </div>
      </aside>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
