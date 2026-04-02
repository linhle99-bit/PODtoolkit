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
): Promise<BgGenResult> {
  const isLandscape = width > height;
  const aspect = isLandscape ? 'landscape' : 'square';
  // DALL-E 3 supported sizes: 1024x1024, 1024x1792, 1792x1024
  const size = isLandscape ? '1792x1024' : '1024x1024';

  const prompt = `Create a VERY SUBTLE, MINIMAL background texture for a product listing image.

Theme: ${theme}
Base color: ${bgColor}
Accent: ${accentColor}
Orientation: ${aspect}

CRITICAL RULES:
- 90% of the image must be a CLEAN, FLAT, SOLID color close to ${bgColor}
- Only VERY FAINT decorative elements at the 4 CORNERS (tiny flourishes, small ornaments)
- Optionally a VERY THIN elegant border/frame line near the edges
- The entire CENTER must be COMPLETELY EMPTY and CLEAN - nothing there
- Think: luxury stationery paper, elegant invitation card background
- EXTREMELY subtle texture only (like fine paper grain or very light watercolor wash)
- NO busy patterns, NO illustrations, NO heavy decorations, NO bokeh, NO sparkles
- NO text, NO logos, NO objects
- The result should look like a premium solid-color paper with barely-visible corner decorations
- Less is more - this is a BACKGROUND, the products placed on top must be the star`;

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
