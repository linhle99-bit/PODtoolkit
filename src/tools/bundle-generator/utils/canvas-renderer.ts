/**
 * Canvas-based bundle renderer.
 * All image compositing happens on an OffscreenCanvas / HTMLCanvasElement.
 */

export interface BundleConfig {
  width: number;
  height: number;
  backgroundColor: string;
  accentColor: string;
  titleColor: string;
  title: string;
  layout: 'grid' | 'collage';
  /** 0-1 header zone ratio */
  headerRatio: number;
  padding: number;
  gap: number;
  rotationRange: [number, number];
  titleFontSize: number;
  badgeFontSize: number;
  /** Optional AI-generated background image */
  backgroundImage?: HTMLImageElement | null;
  /** Card color behind each design (default white) */
  cardColor: string;
}

export const DEFAULT_CONFIG: BundleConfig = {
  width: 4200,
  height: 4200,
  backgroundColor: '#FFF8F0',
  accentColor: '#FF6B35',
  titleColor: '#222222',
  title: 'Design Bundle',
  layout: 'grid',
  headerRatio: 0.14,
  padding: 80,
  gap: 40,
  rotationRange: [-12, 12],
  titleFontSize: 160,
  badgeFontSize: 96,
  cardColor: '#FFFFFF',
};

/* ── font loading ───────────────────────────────────────── */

let _fontsLoaded = false;

export async function preloadFonts(): Promise<void> {
  if (_fontsLoaded) return;
  try {
    // Load fonts via FontFace API with direct Google Fonts static URLs
    const fonts = [
      new FontFace(
        'Playfair Display',
        'url(https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vXDXbtM.woff2)',
        { weight: '700', style: 'normal' },
      ),
      new FontFace(
        'Poppins',
        'url(https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2)',
        { weight: '700', style: 'normal' },
      ),
    ];
    const loaded = await Promise.all(fonts.map((f) => f.load()));
    loaded.forEach((f) => document.fonts.add(f));
    _fontsLoaded = true;
  } catch (e) {
    console.warn('Font loading failed, using fallbacks:', e);
  }
}

const TITLE_FONT = '"Playfair Display", Georgia, "Times New Roman", serif';
const BADGE_FONT = '"Poppins", "Segoe UI", Arial, sans-serif';

/* ── helpers ────────────────────────────────────────────── */

function autoCropTransparent(
  _ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  margin = 6,
): { sx: number; sy: number; sw: number; sh: number } {
  // Draw to temp canvas to read pixels
  const tc = document.createElement('canvas');
  tc.width = img.naturalWidth;
  tc.height = img.naturalHeight;
  const tctx = tc.getContext('2d')!;
  tctx.drawImage(img, 0, 0);

  const data = tctx.getImageData(0, 0, tc.width, tc.height).data;
  let minX = tc.width, minY = tc.height, maxX = 0, maxY = 0;

  for (let y = 0; y < tc.height; y++) {
    for (let x = 0; x < tc.width; x++) {
      const alpha = data[(y * tc.width + x) * 4 + 3];
      if (alpha > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    return { sx: 0, sy: 0, sw: img.naturalWidth, sh: img.naturalHeight };
  }

  minX = Math.max(0, minX - margin);
  minY = Math.max(0, minY - margin);
  maxX = Math.min(tc.width, maxX + margin);
  maxY = Math.min(tc.height, maxY + margin);

  return { sx: minX, sy: minY, sw: maxX - minX, sh: maxY - minY };
}

function fitSize(
  srcW: number, srcH: number, maxW: number, maxH: number,
): { w: number; h: number } {
  const r = Math.min(maxW / srcW, maxH / srcH);
  return { w: Math.round(srcW * r), h: Math.round(srcH * r) };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/* ── background ─────────────────────────────────────────── */

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, bgColor: string) {
  const [r, g, b] = hexToRgb(bgColor);

  // Radial gradient: lighter center, darker edges
  const cx = w / 2, cy = h / 2;
  const maxR = Math.sqrt(cx * cx + cy * cy);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);

  const light = `rgb(${Math.min(255, r + 12)},${Math.min(255, g + 12)},${Math.min(255, b + 12)})`;
  const dark = `rgb(${Math.round(r * 0.9)},${Math.round(g * 0.9)},${Math.round(b * 0.9)})`;
  grad.addColorStop(0, light);
  grad.addColorStop(1, dark);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/* ── decorative frame ───────────────────────────────────── */

function drawDecoFrame(ctx: CanvasRenderingContext2D, w: number, h: number, accentColor: string, margin: number) {
  const [r, g, b] = hexToRgb(accentColor);
  ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`;
  ctx.lineWidth = 3;
  const radius = 30;
  ctx.beginPath();
  ctx.roundRect(margin, margin, w - margin * 2, h - margin * 2, radius);
  ctx.stroke();
}

/* ── header (badge + title) ─────────────────────────────── */

function drawHeader(
  ctx: CanvasRenderingContext2D,
  config: BundleConfig,
  imageCount: number,
) {
  const { width: W, headerRatio, accentColor, titleColor, title, badgeFontSize, titleFontSize } = config;
  const headerH = Math.round(config.height * headerRatio);

  // Badge
  ctx.font = `bold ${badgeFontSize}px ${BADGE_FONT}`;
  const badgeText = `${imageCount} Designs`;
  const btm = ctx.measureText(badgeText);
  const btw = btm.width;
  const bth = badgeFontSize;

  const padX = 50, padY = 25;
  const bw = btw + padX * 2;
  const bh = bth + padY * 2;
  const bx = (W - bw) / 2;
  const by = headerH * 0.1;

  // Badge shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.roundRect(bx + 4, by + 4, bw, bh, bh / 2);
  ctx.fill();

  // Badge fill
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, bh / 2);
  ctx.fill();

  // Badge text
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, W / 2, by + bh / 2);

  // Title
  let fontSize = titleFontSize;
  ctx.font = `bold ${fontSize}px ${TITLE_FONT}`;
  let ttm = ctx.measureText(title);

  // Auto-shrink if too wide
  if (ttm.width > W * 0.88) {
    fontSize = Math.round(fontSize * (W * 0.85) / ttm.width);
    ctx.font = `bold ${fontSize}px ${TITLE_FONT}`;
    ttm = ctx.measureText(title);
  }

  const titleY = by + bh + 30 + fontSize / 2;

  // Title shadow
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.fillText(title, W / 2 + 3, titleY + 3);

  // Title text
  ctx.fillStyle = titleColor;
  ctx.fillText(title, W / 2, titleY);

  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
}

/* ── shadow for each design ─────────────────────────────── */

function drawImageWithShadow(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  crop: { sx: number; sy: number; sw: number; sh: number },
  dx: number, dy: number, dw: number, dh: number,
  rotation = 0,
  hasBgImage = false,
  cardColor = '#FFFFFF',
) {
  ctx.save();
  const cx = dx + dw / 2;
  const cy = dy + dh / 2;

  if (Math.abs(rotation) > 0.3) {
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  // Colored card behind design so it pops on any background
  if (hasBgImage) {
    const [cr, cg, cb] = hexToRgb(cardColor);
    const glowPad = Math.max(dw, dh) * 0.06;
    // Solid card
    ctx.fillStyle = `rgba(${cr},${cg},${cb},0.88)`;
    ctx.beginPath();
    ctx.roundRect(dx - glowPad, dy - glowPad, dw + glowPad * 2, dh + glowPad * 2, 16);
    ctx.fill();
    // Soft glow edge
    const outerPad = glowPad + Math.max(dw, dh) * 0.03;
    const grad = ctx.createRadialGradient(cx, cy, Math.min(dw, dh) * 0.4, cx, cy, Math.max(dw, dh) * 0.6 + outerPad);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.4)`);
    grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(dx - outerPad, dy - outerPad, dw + outerPad * 2, dh + outerPad * 2);
  }

  // Soft shadow
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 12;
  ctx.shadowOffsetY = 15;

  ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, dx, dy, dw, dh);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.restore();
}

/* ── GRID layout ────────────────────────────────────────── */

function renderGrid(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  config: BundleConfig,
  hasBgImage: boolean,
) {
  const { width: W, height: H, padding, gap, headerRatio } = config;
  const headerH = Math.round(H * headerRatio);
  const n = images.length;

  let cols = Math.ceil(Math.sqrt(n));
  let rows = Math.ceil(n / cols);
  while (cols > 1 && (cols - 1) * rows >= n) {
    cols--;
    rows = Math.ceil(n / cols);
  }

  const gridW = W - padding * 2;
  const gridH = H - headerH - padding * 2;
  const cellW = (gridW - gap * (cols - 1)) / cols;
  const cellH = (gridH - gap * (rows - 1)) / rows;

  images.forEach((img, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const itemsLastRow = n - (rows - 1) * cols;
    const extraOffset =
      row === rows - 1 && itemsLastRow < cols
        ? ((cols - itemsLastRow) * (cellW + gap)) / 2
        : 0;

    const crop = autoCropTransparent(ctx, img);
    const fit = fitSize(crop.sw, crop.sh, cellW * 0.88, cellH * 0.88);

    const cellX = padding + extraOffset + col * (cellW + gap);
    const cellY = headerH + padding + row * (cellH + gap);
    const dx = cellX + (cellW - fit.w) / 2;
    const dy = cellY + (cellH - fit.h) / 2;

    drawImageWithShadow(ctx, img, crop, dx, dy, fit.w, fit.h, 0, hasBgImage, config.cardColor);
  });
}

/* ── COLLAGE layout ─────────────────────────────────────── */

function renderCollage(
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  config: BundleConfig,
  hasBgImage: boolean,
) {
  const { width: W, height: H, padding, headerRatio, rotationRange } = config;
  const headerH = Math.round(H * headerRatio);
  const n = images.length;

  const areaX = padding;
  const areaY = headerH + padding / 3;
  const areaW = W - padding * 2;
  const areaH = H - headerH - padding;

  let cols: number, rows: number;
  if (n <= 4) { cols = 2; rows = 2; }
  else if (n <= 6) { cols = 3; rows = 2; }
  else if (n <= 9) { cols = 3; rows = 3; }
  else if (n <= 12) { cols = 4; rows = 3; }
  else { cols = Math.ceil(Math.sqrt(n)); rows = Math.ceil(n / cols); }

  const cellW = areaW / cols;
  const cellH = areaH / rows;
  const baseSizeW = cellW * 0.95;
  const baseSizeH = cellH * 0.95;

  interface Placement {
    img: HTMLImageElement;
    x: number; y: number;
    w: number; h: number;
    rotation: number;
    z: number;
  }

  const placements: Placement[] = [];
  let idx = 0;

  for (let row = 0; row < rows && idx < n; row++) {
    const itemsInRow = Math.min(cols, n - idx);
    const rowOffset = ((cols - itemsInRow) * cellW) / 2;

    for (let col = 0; col < itemsInRow; col++) {
      const cx = areaX + rowOffset + col * cellW + cellW / 2;
      const cy = areaY + row * cellH + cellH / 2;

      const jx = rand(-cellW * 0.06, cellW * 0.06);
      const jy = rand(-cellH * 0.05, cellH * 0.05);

      let rot = rand(rotationRange[0] * 0.6, rotationRange[1] * 0.6);
      if ((row + col) % 2 === 0) rot = -Math.abs(rot);
      else rot = Math.abs(rot);

      const scale = rand(0.92, 1.06);

      placements.push({
        img: images[idx],
        x: cx + jx, y: cy + jy,
        w: baseSizeW * scale,
        h: baseSizeH * scale,
        rotation: rot,
        z: idx + rand(-1.5, 1.5),
      });
      idx++;
    }
  }

  placements.sort((a, b) => a.z - b.z);

  for (const p of placements) {
    const crop = autoCropTransparent(ctx, p.img);
    const fit = fitSize(crop.sw, crop.sh, p.w, p.h);
    const dx = p.x - fit.w / 2;
    const dy = p.y - fit.h / 2;
    drawImageWithShadow(ctx, p.img, crop, dx, dy, fit.w, fit.h, p.rotation, hasBgImage, config.cardColor);
  }
}

/* ── public API ──────────────────────────────────────────── */

export function renderBundle(
  images: HTMLImageElement[],
  config: BundleConfig,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext('2d')!;

  const hasBgImage = config.backgroundImage && config.backgroundImage.naturalWidth > 0;

  // Background: AI image or gradient fallback
  if (hasBgImage) {
    const bgImg = config.backgroundImage!;
    const scale = Math.max(config.width / bgImg.naturalWidth, config.height / bgImg.naturalHeight);
    const bw = bgImg.naturalWidth * scale;
    const bh = bgImg.naturalHeight * scale;
    const bx = (config.width - bw) / 2;
    const by = (config.height - bh) / 2;
    ctx.drawImage(bgImg, bx, by, bw, bh);

    // No full overlay - each design gets its own white card backing
  } else {
    drawBackground(ctx, config.width, config.height, config.backgroundColor);
    drawDecoFrame(ctx, config.width, config.height, config.accentColor, config.padding / 2);
  }

  // Layout
  if (config.layout === 'grid') {
    renderGrid(ctx, images, config, !!hasBgImage);
  } else {
    renderCollage(ctx, images, config, !!hasBgImage);
  }

  // Strong white header bar behind title
  if (hasBgImage) {
    const headerH = Math.round(config.height * config.headerRatio);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(0, 0, config.width, headerH + 10);
  }

  // Header on top
  drawHeader(ctx, config, images.length);

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png',
    );
  });
}
