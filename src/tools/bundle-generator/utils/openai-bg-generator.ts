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

  const prompt = bgStyle
    ? `Create a seamless PATTERNED background image:

${bgStyle}

IMPORTANT:
- This is a REPEATING PATTERN like wallpaper or gift wrapping paper
- The motifs/icons should be SMALL, COLORFUL, and evenly SCATTERED across the entire image
- All motifs should be simple FLAT colored shapes/silhouettes (not detailed illustrations)
- The pattern should be slightly LIGHTER/SPARSER in the center area
- Make it look like premium decorative paper you'd find at a gift shop
- NO text, NO words, NO letters, NO realistic characters, NO faces
- Only simple iconic shapes and motifs as a pattern`
    : `Create a colorful patterned background for "${theme}" products.
Small themed motifs (icons, shapes, silhouettes) in ${accentColor} tones scattered like wallpaper on a ${bgColor} background.
Pattern should be lighter in center, denser at edges. Simple flat colored shapes.
NO text, NO faces, NO realistic characters. Premium gift-wrap quality pattern.`;

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
