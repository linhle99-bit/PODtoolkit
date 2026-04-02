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
  const sample = imageSrcs.slice(0, 4);
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
      text: `Analyze these ${totalCount} design images (showing ${sample.length} samples).

Determine the overall THEME and STYLE, then suggest COMPLETE mockup bundle styling.

Return ONLY valid JSON (no markdown) with these keys:
{
    "bundle_name": "Catchy marketable name in English",
    "theme": "Brief theme description (e.g. disney princess, vintage cartoon, boho floral)",
    "background_color": "#hex - the dominant background color for the mockup",
    "accent_color": "#hex - eye-catching badge color that matches theme",
    "title_color": "#hex - title text color, readable on background",
    "card_color": "#hex - semi-transparent card behind each design, should be a LIGHT tint of the theme (e.g. light pink for princess, light gold for vintage, light blue for ocean theme). NOT always white.",
    "bg_style": "A creative one-line description for the AI background generator. Be SPECIFIC and COLORFUL. Examples: 'soft pink watercolor wash with golden sparkle dots and tiny crown motifs', 'warm golden parchment with vintage scroll borders and star patterns', 'dreamy pastel rainbow gradient with subtle heart shapes', 'deep navy sky with golden star constellations and moon crescents'. Match the designs' mood and energy level.",
    "style_notes": "Brief reasoning"
}

Be CREATIVE with bg_style — each bundle should feel UNIQUE. Match the energy:
- Princess/feminine designs → soft pinks, lavenders, sparkles, crowns
- Adventure/action → bold blues, oranges, dynamic shapes
- Vintage/retro → warm golds, sepia tones, ornate borders
- Nature/animals → earthy greens, leaf patterns, organic shapes
- Cute/kawaii → bright pastels, rainbow, bubble shapes
- Dark/gothic → deep purples, dark teal, mystical elements`,
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
      max_tokens: 600,
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
