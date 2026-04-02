/**
 * Claude AI design analyzer.
 * Sends thumbnail images to Claude Vision API for theme analysis.
 */

export interface AiAnalysisResult {
  bundle_name: string;
  theme: string;
  background_color: string;
  accent_color: string;
  title_color: string;
  card_color: string;
  bg_style: string;
  style_notes: string;
}

async function imageToBase64(src: string, maxSize = 512): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => resolve('');
    img.src = src;
  });
}

export async function analyzeDesigns(
  imageSrcs: string[],
  apiKey: string,
): Promise<AiAnalysisResult> {
  // Send up to 8 images for better analysis (thumbnails are small)
  const sample = imageSrcs.slice(0, 8);
  const totalCount = imageSrcs.length;

  const imageContents = await Promise.all(
    sample.map(async (src) => {
      const b64 = await imageToBase64(src);
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/png' as const,
          data: b64,
        },
      };
    }),
  );

  const content = [
    ...imageContents.filter((ic) => ic.source.data),
    {
      type: 'text' as const,
      text: `You are a professional mockup bundle designer for Etsy/Creative Market.

Carefully analyze ALL ${totalCount} design images (showing ${sample.length}). Study the colors, characters, art style, mood, and subject matter deeply.

Return ONLY valid JSON (no markdown, no explanation):
{
    "bundle_name": "Catchy 3-5 word marketable name",
    "theme": "Specific theme (e.g. 'disney princess watercolor', 'retro 90s cartoon', 'boho wildflower')",
    "background_color": "#hex - base color that COMPLEMENTS the designs. NOT always cream/beige. Choose based on actual design colors. Pink designs → soft pink bg. Blue designs → light blue bg. Colorful designs → warm neutral.",
    "accent_color": "#hex - VIBRANT badge color. Pull from the dominant color IN the designs themselves.",
    "title_color": "#hex - readable on background, should MATCH the theme mood",
    "card_color": "#hex - LIGHT TINT matching the designs. For princess → #FFF0F5 (lavender blush). For ocean → #F0F8FF. For vintage → #FFF8DC. For nature → #F0FFF0. NEVER plain #FFFFFF.",
    "bg_style": "DETAILED description for generating a PATTERNED background. Must describe a REPEATING PATTERN of themed motifs WITH COLOR scattered across the entire image, like decorative wallpaper. Example for princess: 'Repeating pattern of small pink crowns, golden stars, lavender hearts, and tiny rose silhouettes on a soft blush pink background. Motifs are flat, colorful (pink, gold, purple), evenly distributed like gift wrapping paper.' Example for ocean: 'Pattern of teal seashells, coral starfish, blue waves, and golden seahorses on a light aqua background.' Example for vintage: 'Warm golden background with repeated brown film reels, sepia stars, and amber coffee cup silhouettes.' The motifs must be COLORED (not gray, not faded) and MATCH the theme.",
    "style_notes": "Why these choices"
}

CRITICAL RULES for bg_style:
- Must describe a PATTERN of COLORED motifs on a colored background (like gift wrapping paper or wallpaper)
- Motifs must be THEMED icons/shapes related to the designs (crowns, stars, animals, flowers, etc.)
- Motifs must have SPECIFIC COLORS (pink, gold, teal, etc.) — NOT gray, NOT transparent, NOT faded
- Background base color should be a TINT of the theme (pink bg for princess, blue bg for ocean, etc.)
- NEVER use beige/cream/white as default — choose a COLOR that matches the theme`,
    },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `API error ${response.status}: ${(err as Record<string, unknown>)?.error?.toString() || response.statusText}`,
    );
  }

  const data = await response.json();
  let raw: string = data.content?.[0]?.text || '';

  if (raw.startsWith('```')) {
    raw = raw.split('\n').slice(1).join('\n');
    raw = raw.replace(/```\s*$/, '');
  }
  raw = raw.trim();

  return JSON.parse(raw) as AiAnalysisResult;
}
