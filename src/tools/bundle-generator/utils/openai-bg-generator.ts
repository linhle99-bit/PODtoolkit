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
  _bgColor: string,
  width: number,
  height: number,
): Promise<BgGenResult> {
  const isLandscape = width > height;
  const aspect = isLandscape ? 'landscape' : 'square';
  // DALL-E 3 supported sizes: 1024x1024, 1024x1792, 1792x1024
  const size = isLandscape ? '1792x1024' : '1024x1024';

  const prompt = `Create an elegant background with SUBTLE themed decorations for a "${theme}" product listing.

Base: soft warm cream/beige (#FFF8F0) solid color filling the entire image.
Accent: ${accentColor}
Orientation: ${aspect}

DECORATIONS (themed to "${theme}"):
- Small, delicate, PASTEL-COLORED motifs scattered ONLY around the edges and corners
- For Disney: tiny pastel mickey head silhouettes, small stars, thin castle outlines, subtle sparkle dots — all in soft pastel colors (light pink, baby blue, soft gold, lavender)
- For vintage: light sepia flourishes at corners, thin ornate line border
- For floral: soft watercolor petals along edges
- These motifs should be SMALL (each under 5% of the image), SOFT PASTEL tones, evenly spaced around the border area
- A thin elegant decorative line border about 3% from the edges
- The CENTER 75% must be COMPLETELY CLEAN — just the solid cream background, nothing else
- Overall feeling: soft, elegant, like premium stationery or invitation card
- Colors must be PASTEL and MUTED — no vivid, no neon, no saturated colors
- NO text, NO logos, NO characters, NO objects — only abstract motifs and shapes
- Think: Etsy listing background that looks expensive but doesn't distract from products`;

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
