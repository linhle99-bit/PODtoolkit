import { Link } from 'react-router-dom';
import tools, { categories } from '../tools/registry';

export default function Home() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">POD Toolkit</h1>
        <p className="text-gray-400">
          Print-on-Demand tools — all running in your browser, no server needed
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools
              .filter((t) => t.category === cat)
              .map((tool) =>
                tool.comingSoon ? (
                  <div
                    key={tool.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6 opacity-50"
                  >
                    <span className="text-4xl">{tool.icon}</span>
                    <h3 className="text-lg font-semibold text-white mt-3 mb-1">{tool.name}</h3>
                    <p className="text-gray-500 text-sm">{tool.description}</p>
                    <span className="inline-block mt-3 px-2 py-1 bg-gray-800 text-gray-500 text-xs rounded-lg">
                      Coming Soon
                    </span>
                  </div>
                ) : (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 group"
                  >
                    <span className="text-4xl">{tool.icon}</span>
                    <h3 className="text-lg font-semibold text-white mt-3 mb-1 group-hover:text-purple-400 transition">
                      {tool.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{tool.description}</p>
                    {tool.isNew && (
                      <span className="inline-block mt-3 px-2 py-1 bg-green-600 text-white text-xs rounded-lg font-bold">
                        NEW
                      </span>
                    )}
                  </Link>
                )
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
