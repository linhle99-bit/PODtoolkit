import { useState } from 'react';

const DOWNLOAD_URL = 'https://github.com/linhle99-bit/PODtoolkit/releases/latest/download/ImagePromptGenerator.exe';

const content = {
  vi: {
    title: 'Image-to-Prompt Auto Generator',
    subtitle: 'Tự động phân tích ảnh thiết kế POD bằng Claude Vision, tạo prompt DALL-E, gửi ChatGPT tạo ảnh mới — tất cả chỉ với 1 click.',
    download: 'Tải về cho Windows',
    downloadBtn: 'Tải ImagePromptGenerator.exe',
    downloadNote: 'File .exe (~80MB) - Windows 10/11 - Cần cài Google Chrome',
    features: [
      { icon: 'search', title: 'Claude Vision', desc: 'Phân tích chi tiết thiết kế POD: màu sắc, phong cách, text, bố cục, chất liệu' },
      { icon: 'robot', title: 'DALL-E 3', desc: 'Tự động gửi prompt vào ChatGPT, tạo ảnh tương tự mẫu gốc, tỉ lệ 1:1' },
      { icon: 'board', title: 'Trello', desc: 'Tích hợp Trello: lấy ảnh từ thẻ Idea, upload kết quả lên thẻ Done, đặt ảnh bìa' },
    ],
    guide: 'Hướng dẫn sử dụng',
    langToggle: 'Tiếng Việt',
    step1: {
      title: 'Bước 1: Cài đặt',
      steps: [
        'Tải file ImagePromptGenerator.exe',
        'Double-click mở app',
        'Nhập Anthropic API Key (lấy tại console.anthropic.com)',
      ],
    },
    step2: {
      title: 'Bước 2: Đăng nhập ChatGPT',
      steps: [
        'Nhấn nút "Login ChatGPT" trong app',
        'Chrome mở lên — đăng nhập tài khoản ChatGPT (cần ChatGPT Plus để dùng DALL-E)',
        'Đóng Chrome khi login xong',
        'Chỉ cần login 1 lần, các lần sau tự động',
      ],
    },
    step3: {
      title: 'Bước 3: Chạy',
      local: {
        label: 'Chế độ Local:',
        steps: [
          'Chọn Input folder (chứa ảnh thiết kế)',
          'Chọn Output folder (lưu kết quả)',
          'Nhấn CHẠY',
        ],
      },
      trello: {
        label: 'Chế độ Trello:',
        steps: [
          'Chọn "Trello board" làm nguồn ảnh',
          'Nhập Trello API Key + Token',
          'Chọn Board, cột Idea và cột Done',
          'Nhấn CHẠY — tool tự xử lý từng thẻ',
        ],
      },
    },
    notes: {
      title: 'Lưu ý',
      items: [
        'Cần tài khoản ChatGPT Plus (có DALL-E 3)',
        'Cần Anthropic API Key (Claude Vision)',
        'Máy cần cài Google Chrome',
        'Ảnh output là 1024x1024 (vuông 1:1)',
      ],
    },
  },
  en: {
    title: 'Image-to-Prompt Auto Generator',
    subtitle: 'Automatically analyze POD designs with Claude Vision, create DALL-E prompts, send to ChatGPT to generate new images — all in 1 click.',
    download: 'Download for Windows',
    downloadBtn: 'Download ImagePromptGenerator.exe',
    downloadNote: '.exe file (~80MB) - Windows 10/11 - Google Chrome required',
    features: [
      { icon: 'search', title: 'Claude Vision', desc: 'Detailed POD design analysis: colors, style, text, composition, materials' },
      { icon: 'robot', title: 'DALL-E 3', desc: 'Auto-send prompts to ChatGPT, generate similar images in 1:1 ratio' },
      { icon: 'board', title: 'Trello', desc: 'Trello integration: pull images from Idea cards, upload results to Done cards, set cover' },
    ],
    guide: 'How to use',
    langToggle: 'English',
    step1: {
      title: 'Step 1: Install',
      steps: [
        'Download ImagePromptGenerator.exe',
        'Double-click to open the app',
        'Enter your Anthropic API Key (get it at console.anthropic.com)',
      ],
    },
    step2: {
      title: 'Step 2: Login to ChatGPT',
      steps: [
        'Click "Login ChatGPT" button in the app',
        'Chrome opens — log in with your ChatGPT account (ChatGPT Plus required for DALL-E)',
        'Close Chrome when done',
        'Only need to login once, auto-saved for future use',
      ],
    },
    step3: {
      title: 'Step 3: Run',
      local: {
        label: 'Local mode:',
        steps: [
          'Choose Input folder (with design images)',
          'Choose Output folder (save results)',
          'Click RUN',
        ],
      },
      trello: {
        label: 'Trello mode:',
        steps: [
          'Select "Trello board" as image source',
          'Enter Trello API Key + Token',
          'Select Board, Idea column and Done column',
          'Click RUN — tool processes each card automatically',
        ],
      },
    },
    notes: {
      title: 'Requirements',
      items: [
        'ChatGPT Plus account (with DALL-E 3)',
        'Anthropic API Key (Claude Vision)',
        'Google Chrome installed',
        'Output images are 1024x1024 (square 1:1)',
      ],
    },
  },
};

const FeatureIcon = ({ type }: { type: string }) => {
  if (type === 'search') return <span className="text-3xl">&#128269;</span>;
  if (type === 'robot') return <span className="text-3xl">&#129302;</span>;
  if (type === 'board') return <span className="text-3xl">&#128203;</span>;
  return null;
};

const ACCESS_PASSWORD = 'podtool2026';

export default function ImagePromptGenerator() {
  const [showGuide, setShowGuide] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem('ipg_unlocked') === 'true';
  });
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const t = content[lang];

  const handleUnlock = () => {
    if (pwInput === ACCESS_PASSWORD) {
      setUnlocked(true);
      localStorage.setItem('ipg_unlocked', 'true');
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Lang toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-gray-800 rounded-lg p-0.5 text-sm">
          <button
            onClick={() => setLang('vi')}
            className={`px-3 py-1.5 rounded-md transition-colors ${lang === 'vi' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Tiếng Việt
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-md transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            English
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl">&#129504;</div>
        <h1 className="text-3xl font-bold text-white">{t.title}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Download — cần password */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-8 text-center space-y-6">
        {unlocked ? (
          <>
            <h2 className="text-xl font-semibold text-white">{t.download}</h2>
            <a
              href={DOWNLOAD_URL}
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t.downloadBtn}
            </a>
            <p className="text-gray-400 text-sm">{t.downloadNote}</p>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">{t.download}</h2>
              <div className="inline-block bg-yellow-500/20 border border-yellow-500/40 rounded-full px-4 py-1">
                <span className="text-yellow-400 font-bold text-2xl">$19.99</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {lang === 'vi'
                ? 'Nhập mật khẩu để mở khóa tải về. '
                : 'Enter password to unlock download. '}
              <a
                href="https://t.me/cocomanwa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {lang === 'vi' ? 'Liên hệ Telegram để mua license' : 'Contact via Telegram to purchase'}
              </a>
            </p>
            <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
              <input
                type="password"
                value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder={lang === 'vi' ? 'Nhập mật khẩu...' : 'Enter password...'}
                className={`flex-1 bg-gray-800 border ${pwError ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500`}
              />
              <button
                onClick={handleUnlock}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {lang === 'vi' ? 'Mở khóa' : 'Unlock'}
              </button>
            </div>
            {pwError && (
              <p className="text-red-400 text-sm">
                {lang === 'vi' ? 'Sai mật khẩu!' : 'Wrong password!'}
              </p>
            )}
          </>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {t.features.map((f) => (
          <div key={f.title} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 space-y-2">
            <FeatureIcon type={f.icon} />
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
          <span className="font-semibold text-lg">{t.guide}</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${showGuide ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showGuide && (
          <div className="px-6 pb-6 space-y-6 text-gray-300">
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">{t.step1.title}</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {t.step1.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">{t.step2.title}</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {t.step2.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">{t.step3.title}</h3>
              <p className="text-sm font-medium text-blue-400">{t.step3.local.label}</p>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                {t.step3.local.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <p className="text-sm font-medium text-blue-400 mt-3">{t.step3.trello.label}</p>
              <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                {t.step3.trello.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 text-sm">
              <strong className="text-yellow-400">{t.notes.title}:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1 text-yellow-200/70">
                {t.notes.items.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
