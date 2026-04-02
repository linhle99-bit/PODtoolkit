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
    "bg_style": "DETAILED 2-3 sentence description for DALL-E to generate a UNIQUE background. Describe: (1) the color palette/gradient (2) specific decorative motifs related to the theme (3) the overall mood/texture. Be VERY SPECIFIC about colors and shapes. Example for princess theme: 'Soft gradient from blush pink at edges to pale lavender center. Scattered tiny golden crowns, glass slipper silhouettes, and rose petals along the borders. Delicate golden filigree frame with small heart accents at corners.'",
    "style_notes": "Why these choices"
}

CRITICAL: bg_style must be DIFFERENT for every theme. Study the actual designs carefully. Do NOT default to generic beige/cream. Each bundle must look completely unique.`,
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
