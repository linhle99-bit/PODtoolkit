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

  const prompt = `Create a themed background for a "${theme}" product showcase image.

Base color: ${bgColor}
Accent color: ${accentColor}
Orientation: ${aspect}

DESIGN RULES:
- The CENTER 70% of the image must be CLEAN and MOSTLY EMPTY (products will be placed there)
- Around the EDGES and CORNERS: place THEME-SPECIFIC decorative elements related to "${theme}"
  For example if Disney theme: faint castle silhouettes, tiny stars, sparkle trails, magic wand shapes
  If vintage/retro: aged paper texture, retro borders, film grain
  If floral: delicate flower vines along edges
  If Y2K: geometric shapes, gradient blobs at corners
- These decorations should be SEMI-TRANSPARENT (20-40% opacity), like watermarks
- Use ${accentColor} tints for the decorative elements
- The base must be a smooth gradient/solid close to ${bgColor}
- Add a THIN elegant decorative border/frame near the edges that matches the theme
- Overall: premium, high-end, marketplace-ready (Etsy/Creative Market style)
- NO text, NO logos, NO product mockups
- The decorations should ENHANCE the theme but never compete with the products placed on top`;

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
