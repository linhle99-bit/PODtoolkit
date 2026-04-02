/**
 * OpenAI image generation for creating beautiful themed backgrounds.
 * Uses gpt-image-1 to generate backgrounds that match the design theme.
 */

export interface BgGenResult {
  imageUrl: string;
  /** base64 data URL ready to use as <img> src */
  dataUrl: string;
}

export async function generateBackground(
  apiKey: string,
  theme: string,
  accentColor: string,
  bgColor: string,
  width: number,
  height: number,
  bgStyle?: string,
): Promise<BgGenResult> {
  const isLandscape = width > height;
  const size = isLandscape ? '1792x1024' : '1024x1024';

  const styleDesc = bgStyle || `elegant themed background matching "${theme}" with ${accentColor} accents`;

  const prompt = `Create a beautiful product showcase background.

STYLE: ${styleDesc}
Theme: ${theme}
Base color: ${bgColor}, Accent: ${accentColor}

LAYOUT RULES:
- The CENTER 65-70% of the image should be LIGHTER/CLEANER (products go here)
- The EDGES and BORDERS should have the colorful decorations and motifs
- Create a natural GRADIENT from decorative edges → clean center
- Add a thin elegant border/frame line that matches the style
- The decorations should be THEMED: use motifs, shapes, and patterns that match "${theme}"

COLOR RULES:
- Be COLORFUL and BEAUTIFUL — use the accent color ${accentColor} and complementary tones
- The edges can be rich and detailed, the center should be soft and light
- Overall the image should feel PREMIUM, UNIQUE, and VISUALLY STRIKING

STRICT RULES:
- NO text, NO words, NO letters, NO logos, NO characters, NO faces
- NO product mockups, NO placeholder rectangles
- Only decorative elements: patterns, shapes, textures, gradients, motifs, sparkles, borders`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'standard',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } })?.error?.message || response.statusText;
    throw new Error(`OpenAI error ${response.status}: ${msg}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;

  if (!b64) {
    // Fallback: might return URL instead
    const url = data.data?.[0]?.url;
    if (url) {
      return { imageUrl: url, dataUrl: url };
    }
    throw new Error('No image returned from OpenAI');
  }

  const dataUrl = `data:image/png;base64,${b64}`;
  return { imageUrl: '', dataUrl };
}

/**
 * Load a data URL or image URL into an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load background image'));
    img.src = src;
  });
}
