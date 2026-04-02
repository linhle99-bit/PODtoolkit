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

  const prompt = `Create a COLORFUL, VIBRANT themed border/frame background for "${theme}" products.

Accent color: ${accentColor}
Orientation: ${aspect}

DESIGN:
- BEAUTIFUL COLORFUL decorative BORDER/FRAME around ALL 4 edges of the image
- The border should be RICH, DETAILED, and THEMED to "${theme}"
  Disney theme: colorful castle towers, stars, fireworks, magic sparkles, character silhouettes in vivid colors
  Vintage: ornate golden frames, rich warm textures, decorative scrollwork
  Floral: lush colorful flower garlands, vines, petals
  Y2K: bold neon gradients, geometric patterns, holographic effects
- The border/frame should be 15-20% of each edge, COLORFUL and VIVID (not faded/transparent)
- CENTER of the image: PURE CLEAN WHITE or very light color (#FFFFFF or #FFFDF8) - completely empty
- Sharp contrast between the colorful border and the clean white center
- Think: premium picture frame effect - ornate colorful frame with clean white mat inside
- Use vibrant colors that match ${accentColor} palette
- NO text, NO logos, NO mockup products
- The frame should look EXPENSIVE, PREMIUM, like a high-end product showcase`;

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
