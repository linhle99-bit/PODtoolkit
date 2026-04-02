import { useState } from 'react';

const DOWNLOAD_URL = 'https://github.com/linhle99-bit/PODtoolkit/releases/latest/download/ImagePromptGenerator.exe';

const content = {
  vi: {
    title: 'Image-to-Prompt Auto Generator',
    subtitle: 'T\u1ef1 \u0111\u1ed9ng ph\u00e2n t\u00edch \u1ea3nh thi\u1ebft k\u1ebf POD b\u1eb1ng Claude Vision, t\u1ea1o prompt DALL-E, g\u1eedi ChatGPT t\u1ea1o \u1ea3nh m\u1edbi \u2014 t\u1ea5t c\u1ea3 ch\u1ec9 v\u1edbi 1 click.',
    download: 'T\u1ea3i v\u1ec1 cho Windows',
    downloadBtn: 'T\u1ea3i ImagePromptGenerator.exe',
    downloadNote: 'File .exe (~80MB) \u2022 Windows 10/11 \u2022 C\u1ea7n c\u00e0i Google Chrome',
    features: [
      { icon: '\uD83D\uDD0D', title: 'Claude Vision', desc: 'Ph\u00e2n t\u00edch chi ti\u1ebft thi\u1ebft k\u1ebf POD: m\u00e0u s\u1eafc, phong c\u00e1ch, text, b\u1ed1 c\u1ee5c, ch\u1ea5t li\u1ec7u' },
      { icon: '\uD83E\uDD16', title: 'DALL-E 3', desc: 'T\u1ef1 \u0111\u1ed9ng g\u1eedi prompt v\u00e0o ChatGPT, t\u1ea1o \u1ea3nh t\u01b0\u01a1ng t\u1ef1 m\u1eabu g\u1ed1c, t\u1ec9 l\u1ec7 1:1' },
      { icon: '\uD83D\uDCCB', title: 'Trello', desc: 'T\u00edch h\u1ee3p Trello: l\u1ea5y \u1ea3nh t\u1eeb th\u1ebb Idea, upload k\u1ebft qu\u1ea3 l\u00ean th\u1ebb Done, \u0111\u1eb7t \u1ea3nh b\u00eca' },
    ],
    guide: 'H\u01b0\u1edbng d\u1eabn s\u1eed d\u1ee5ng',
    step1: {
      title: 'B\u01b0\u1edbc 1: C\u00e0i \u0111\u1eb7t',
      steps: [
        'T\u1ea3i file ImagePromptGenerator.exe',
        'Double-click m\u1edf app',
        'Nh\u1eadp Anthropic API Key (l\u1ea5y t\u1ea1i console.anthropic.com)',
      ],
    },
    step2: {
      title: 'B\u01b0\u1edbc 2: \u0110\u0103ng nh\u1eadp ChatGPT',
      steps: [
        'Nh\u1ea5n n\u00fat "Login ChatGPT" trong app',
        'Chrome m\u1edf l\u00ean \u2014 \u0111\u0103ng nh\u1eadp t\u00e0i kho\u1ea3n ChatGPT (c\u1ea7n ChatGPT Plus \u0111\u1ec3 d\u00f9ng DALL-E)',
        '\u0110\u00f3ng Chrome khi login xong',
        'Ch\u1ec9 c\u1ea7n login 1 l\u1ea7n, c\u00e1c l\u1ea7n sau t\u1ef1 \u0111\u1ed9ng',
      ],
    },
    step3: {
      title: 'B\u01b0\u1edbc 3: Ch\u1ea1y',
      local: {
        label: 'Ch\u1ebf \u0111\u1ed9 Local:',
        steps: [
          'Ch\u1ecdn Input folder (ch\u1ee9a \u1ea3nh thi\u1ebft k\u1ebf)',
          'Ch\u1ecdn Output folder (l\u01b0u k\u1ebft qu\u1ea3)',
          'Nh\u1ea5n CHAY',
        ],
      },
      trello: {
        label: 'Ch\u1ebf \u0111\u1ed9 Trello:',
        steps: [
          'Ch\u1ecdn "Trello board" l\u00e0m ngu\u1ed3n \u1ea3nh',
          'Nh\u1eadp Trello API Key + Token',
          'Ch\u1ecdn Board, c\u1ed9t Idea v\u00e0 c\u1ed9t Done',
          'Nh\u1ea5n CHAY \u2014 tool t\u1ef1 x\u1eed l\u00fd t\u1eebng th\u1ebb',
        ],
      },
    },
    notes: {
      title: 'L\u01b0u \u00fd',
      items: [
        'C\u1ea7n t\u00e0i kho\u1ea3n ChatGPT Plus (c\u00f3 DALL-E 3)',
        'C\u1ea7n Anthropic API Key (Claude Vision)',
        'M\u00e1y c\u1ea7n c\u00e0i Google Chrome',
        '\u1ea2nh output l\u00e0 1024\u00d71024 (vu\u00f4ng 1:1)',
      ],
    },
  },
  en: {
    title: 'Image-to-Prompt Auto Generator',
    subtitle: 'Automatically analyze POD designs with Claude Vision, create DALL-E prompts, send to ChatGPT to generate new images \u2014 all in 1 click.',
    download: 'Download for Windows',
    downloadBtn: 'Download ImagePromptGenerator.exe',
    downloadNote: '.exe file (~80MB) \u2022 Windows 10/11 \u2022 Google Chrome required',
    features: [
      { icon: '\uD83D\uDD0D', title: 'Claude Vision', desc: 'Detailed POD design analysis: colors, style, text, composition, materials' },
      { icon: '\uD83E\uDD16', title: 'DALL-E 3', desc: 'Auto-send prompts to ChatGPT, generate similar images in 1:1 ratio' },
      { icon: '\uD83D\uDCCB', title: 'Trello', desc: 'Trello integration: pull images from Idea cards, upload results to Done cards' },
    ],
    guide: 'How to use',
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
        'Chrome opens \u2014 log in with your ChatGPT account (ChatGPT Plus required for DALL-E)',
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
          'Click RUN \u2014 tool processes each card automatically',
        ],
      },
    },
    notes: {
      title: 'Requirements',
      items: [
        'ChatGPT Plus account (with DALL-E 3)',
        'Anthropic API Key (Claude Vision)',
        'Google Chrome installed',
        'Output images are 1024\u00d71024 (square 1:1)',
      ],
    },
  },
};

export default function ImagePromptGenerator() {
  const [showGuide, setShowGuide] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const t = content[lang];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Lang toggle */}
      <div className="flex justify-end">
        <div className="inline-flex bg-gray-800 rounded-lg p-0.5 text-sm">
          <button
            onClick={() => setLang('vi')}
            className={`px-3 py-1.5 rounded-md transition-colors ${lang === 'vi' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Ti\u1ebfng Vi\u1ec7t
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
        <div className="text-6xl">\uD83E\uDDE0</div>
        <h1 className="text-3xl font-bold text-white">{t.title}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Download */}
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl p-8 text-center space-y-6">
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
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {t.features.map((f) => (
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
          <span className="font-semibold text-lg">{t.guide}</span>
          <span className={`transform transition-transform ${showGuide ? 'rotate-180' : ''}`}>\u25BC</span>
        </button>

        {showGuide && (
          <div className="px-6 pb-6 space-y-6 text-gray-300">
            {/* Step 1 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">{t.step1.title}</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {t.step1.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-lg">{t.step2.title}</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {t.step2.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>

            {/* Step 3 */}
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

            {/* Notes */}
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
