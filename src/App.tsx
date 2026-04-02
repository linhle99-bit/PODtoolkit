import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { AuthProvider } from './components/Auth/AuthProvider';
import AppShell from './components/Layout/AppShell';
import Home from './pages/Home';
import tools from './tools/registry';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-400">Loading...</div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              {tools
                .filter((t) => !t.comingSoon)
                .map((tool) => (
                  <Route key={tool.id} path={tool.path} element={<tool.component />} />
                ))}
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </AuthProvider>
  );
}
