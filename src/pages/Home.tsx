import { Link } from 'react-router-dom';
import tools, { categories } from '../tools/registry';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="relative mb-12 py-12 text-center overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/40 via-gray-900 to-blue-900/40 border border-gray-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)]" />
        <div className="relative">
          <div className="text-5xl mb-4">&#x1F6E0;&#xFE0F;</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-3">
            POD Toolkit
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Print-on-Demand tools — all running in your browser, no server needed
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
              100% Client-side
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
              No Upload Required
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
              Free to Use
            </span>
          </div>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-gray-800 to-transparent" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
              {cat}
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-gray-800 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools
              .filter((t) => t.category === cat)
              .map((tool) =>
                tool.comingSoon ? (
                  <div
                    key={tool.id}
                    className="relative bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 opacity-40 backdrop-blur-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gray-800/80 flex items-center justify-center text-3xl mb-4">
                      {tool.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{tool.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{tool.description}</p>
                    <span className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 bg-gray-800/80 text-gray-500 text-xs rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                      Coming Soon
                    </span>
                  </div>
                ) : (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="relative bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {tool.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
                      <div className="flex items-center gap-2 mt-4">
                        {tool.isNew && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] rounded-full font-bold uppercase tracking-wide">
                            New
                          </span>
                        )}
                        <span className="text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                          Open &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
