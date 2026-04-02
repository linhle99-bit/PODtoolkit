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
  // OpenAI supported sizes
  const size = isLandscape ? '1536x1024' : '1024x1024';

  const prompt = `Create a beautiful, professional product showcase background for an Etsy listing mockup bundle.

Theme: ${theme}
Main color: ${bgColor}
Accent color: ${accentColor}
Orientation: ${aspect}

Requirements:
- Soft, elegant background texture/pattern that matches the "${theme}" theme
- Keep the CENTER AREA mostly clean and empty (designs will be placed on top)
- Subtle decorative elements around the EDGES and CORNERS only (flourishes, patterns, textures, bokeh, sparkles)
- Use colors that complement ${bgColor} as the base tone
- Professional, high-end, marketplace-ready aesthetic
- NO text, NO logos, NO mockup products, NO placeholder squares
- Think: premium Etsy listing background, Creative Market product showcase
- Subtle depth with vignette or gradient feel
- The overall mood should match: ${theme}`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size,
      quality: 'medium',
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
