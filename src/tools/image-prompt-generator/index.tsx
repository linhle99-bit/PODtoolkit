import { useState } from 'react';

const DOWNLOAD_URL = 'https://github.com/linhle99-bit/PODtoolkit/releases/latest/download/ImagePromptGenerator.exe';

export default function ImagePromptGenerator() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl">🎨</div>
        <h1 className="text-3xl font-bold text-white">
          Image-to-Prompt Auto Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Tu dong phan tich anh thiet ke POD bang Claude Vision, tao prompt DALL-E,
          gui ChatGPT tao anh moi — tat ca chi voi 1 click.
        </p>
      </div>

      {/* Download */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-8 text-center space-y-6">
        <h2 className="text-xl font-semibold text-white">Download cho Windows</h2>
        <a
          href={DOWNLOAD_URL}
          className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Tai ImagePromptGenerator.exe
        </a>
        <p className="text-gray-400 text-sm">
          File .exe (~80MB) • Windows 10/11 • Can cai Google Chrome
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🔍', title: 'Claude Vision', desc: 'Phan tich chi tiet thiet ke POD: mau sac, phong cach, text, bo cuc' },
          { icon: '🤖', title: 'DALL-E 3', desc: 'Tu dong gui prompt vao ChatGPT, tao anh tuong tu mau goc' },
          { icon: '📋', title: 'Trello', desc: 'Tich hop Trello: lay anh tu the Idea, upload ket qua len the Done' },
        ].map((f) => (
          <div key={f.title} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 space-y-2">
            <div className="text-3xl">{f.icon}</div>
            <h3 className="font-semibold text-white">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Guide */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-6 py-4 flex items-center justify-between text-white hover:bg-gray-700/30 transition-colors"
        >
          <span className="font-semibold text-lg">Huong dan su dung</span>
          <span className={`transform transition-transform ${showGuide ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {showGuide && (
          <div className="px-6 pb-6 space-y-4 text-gray-300">
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">Buoc 1: Cai dat</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Tai file <code className="bg-gray-700 px-1.5 py-0.5 rounded">ImagePromptGenerator.exe</code></li>
                <li>Double-click mo app</li>
                <li>Nhap <strong>Anthropic API Key</strong> (lay tai console.anthropic.com)</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">Buoc 2: Login ChatGPT</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Nhan nut <strong>"Login ChatGPT"</strong> trong app</li>
                <li>Chrome mo len — dang nhap tai khoan ChatGPT (can ChatGPT Plus de dung DALL-E)</li>
                <li>Dong Chrome khi login xong</li>
                <li>Chi can login 1 lan, cac lan sau tu dong</li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">Buoc 3: Chay</h3>
              <p className="text-sm"><strong>Mode Local:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Chon Input folder (chua anh thiet ke)</li>
                <li>Chon Output folder (luu ket qua)</li>
                <li>Nhan <strong>CHAY</strong></li>
              </ol>

              <p className="text-sm mt-3"><strong>Mode Trello:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Chon "Trello board" lam nguon anh</li>
                <li>Nhap Trello API Key + Token</li>
                <li>Chon Board, cot Idea va cot Done</li>
                <li>Nhan <strong>CHAY</strong> — tool tu xu ly tung the</li>
              </ol>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 text-sm">
              <strong className="text-yellow-400">Luu y:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-yellow-200/70">
                <li>Can tai khoan ChatGPT Plus (co DALL-E 3)</li>
                <li>Can Anthropic API Key (Claude Vision)</li>
                <li>May can cai Google Chrome</li>
                <li>Anh output la 1024x1024 (vuong 1:1)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
