import type { PrintArea, Point } from '../types';

function getRegionBrightness(
  ctx: CanvasRenderingContext2D,
  corners: [Point, Point, Point, Point],
  scaleX: number,
  scaleY: number
): number {
  // Sample brightness from the center area of the quad
  const cx = corners.reduce((s, c) => s + c.x * scaleX, 0) / 4;
  const cy = corners.reduce((s, c) => s + c.y * scaleY, 0) / 4;
  const size = 50;
  const x = Math.max(0, Math.round(cx - size / 2));
  const y = Math.max(0, Math.round(cy - size / 2));
  const imageData = ctx.getImageData(x, y, size, size);
  const data = imageData.data;
  let total = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 16) {
    total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    count++;
  }
  return count > 0 ? total / count : 128;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Shrinks the quad inward to fit the design's aspect ratio (contain mode).
 * Keeps the design centered within the original quad.
 */
function fitDesignInQuad(
  corners: [Point, Point, Point, Point],
  designW: number,
  designH: number
): [Point, Point, Point, Point] {
  const [tl, tr, br, bl] = corners;

  // Estimate quad dimensions from edge lengths
  const quadW = (dist(tl, tr) + dist(bl, br)) / 2;
  const quadH = (dist(tl, bl) + dist(tr, br)) / 2;

  const designRatio = designW / designH;
  const quadRatio = quadW / quadH;

  if (Math.abs(designRatio - quadRatio) < 0.05) {
    return corners; // Close enough, no adjustment needed
  }

  let scaleU = 1; // horizontal scale factor (0-1)
  let scaleV = 1; // vertical scale factor (0-1)

  if (designRatio > quadRatio) {
    // Design is wider than quad → shrink vertically
    scaleV = quadRatio / designRatio;
  } else {
    // Design is taller than quad → shrink horizontally
    scaleU = designRatio / quadRatio;
  }

  // Offset to center
  const offsetU = (1 - scaleU) / 2;
  const offsetV = (1 - scaleV) / 2;

  // Compute new corners using bilinear interpolation
  return [
    bilinear(tl, tr, br, bl, offsetU, offsetV),
    bilinear(tl, tr, br, bl, offsetU + scaleU, offsetV),
    bilinear(tl, tr, br, bl, offsetU + scaleU, offsetV + scaleV),
    bilinear(tl, tr, br, bl, offsetU, offsetV + scaleV),
  ];
}

/**
 * Draws designImg warped into the quadrilateral defined by 4 corners.
 * Uses mesh subdivision for perspective-like transform.
 */
function drawPerspective(
  ctx: CanvasRenderingContext2D,
  designImg: HTMLImageElement | HTMLCanvasElement,
  corners: [Point, Point, Point, Point], // TL, TR, BR, BL in natural coords
  subdivisions: number = 20
) {
  const [tl, tr, br, bl] = corners;
  const sw = designImg instanceof HTMLCanvasElement ? designImg.width : designImg.naturalWidth;
  const sh = designImg instanceof HTMLCanvasElement ? designImg.height : designImg.naturalHeight;
  const steps = subdivisions;

  for (let row = 0; row < steps; row++) {
    for (let col = 0; col < steps; col++) {
      const u0 = col / steps;
      const v0 = row / steps;
      const u1 = (col + 1) / steps;
      const v1 = (row + 1) / steps;

      // Bilinear interpolation for each corner of this cell
      const p00 = bilinear(tl, tr, br, bl, u0, v0);
      const p10 = bilinear(tl, tr, br, bl, u1, v0);
      const p01 = bilinear(tl, tr, br, bl, u0, v1);
      const p11 = bilinear(tl, tr, br, bl, u1, v1);

      // Source rectangle in design image
      const sx = u0 * sw;
      const sy = v0 * sh;
      const sWidth = (u1 - u0) * sw;
      const sHeight = (v1 - v0) * sh;

      // Draw two triangles for this quad cell
      drawTriangle(ctx, designImg, sx, sy, sWidth, sHeight, p00, p10, p01);
      drawTriangle(ctx, designImg, sx + sWidth, sy + sHeight, -sWidth, -sHeight, p11, p01, p10);
    }
  }
}

function bilinear(tl: Point, tr: Point, br: Point, bl: Point, u: number, v: number): Point {
  const top = lerp(tl, tr, u);
  const bot = lerp(bl, br, u);
  return lerp(top, bot, v);
}

function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Expand triangle outward by `px` pixels to fill seam gaps
function expandTriangle(p0: Point, p1: Point, p2: Point, px: number): [Point, Point, Point] {
  const cx = (p0.x + p1.x + p2.x) / 3;
  const cy = (p0.y + p1.y + p2.y) / 3;
  const expand = (p: Point): Point => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: p.x + (dx / len) * px, y: p.y + (dy / len) * px };
  };
  return [expand(p0), expand(p1), expand(p2)];
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  p0: Point,
  p1: Point,
  p2: Point
) {
  // Expand clip region slightly to eliminate seam gaps
  const [e0, e1, e2] = expandTriangle(p0, p1, p2, 1.0);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(e0.x, e0.y);
  ctx.lineTo(e1.x, e1.y);
  ctx.lineTo(e2.x, e2.y);
  ctx.closePath();
  ctx.clip();

  // Affine transform: map source triangle to destination triangle
  // Source triangle: (sx, sy), (sx+sw, sy), (sx, sy+sh)
  // Dest triangle: p0, p1, p2
  const denom = sw * sh;
  if (Math.abs(denom) < 0.001) {
    ctx.restore();
    return;
  }

  ctx.setTransform(
    (p1.x - p0.x) / sw,
    (p1.y - p0.y) / sw,
    (p2.x - p0.x) / sh,
    (p2.y - p0.y) / sh,
    p0.x - (sx * (p1.x - p0.x)) / sw - (sy * (p2.x - p0.x)) / sh,
    p0.y - (sx * (p1.y - p0.y)) / sw - (sy * (p2.y - p0.y)) / sh
  );

  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

export async function compositeImage(
  mockupSrc: string,
  designSrc: string,
  printArea: PrintArea
): Promise<string> {
  const mockupImg = await loadImage(mockupSrc);
  const canvas = document.createElement('canvas');
  canvas.width = mockupImg.naturalWidth;
  canvas.height = mockupImg.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  // 1. Draw mockup
  ctx.drawImage(mockupImg, 0, 0);

  // 2. Scale corners from display to natural coordinates
  const scaleX = mockupImg.naturalWidth / printArea.displayWidth;
  const scaleY = mockupImg.naturalHeight / printArea.displayHeight;
  const natCorners = printArea.corners.map((c) => ({
    x: c.x * scaleX,
    y: c.y * scaleY,
  })) as [Point, Point, Point, Point];

  // 3. Measure brightness
  const brightness = getRegionBrightness(ctx, natCorners, scaleX, scaleY);

  const designImg = await loadImage(designSrc);

  // Adjust quad to maintain design aspect ratio (contain) — keep original orientation
  const fitCorners = fitDesignInQuad(natCorners, designImg.naturalWidth, designImg.naturalHeight);

  // Warp design onto a temporary canvas first (avoids seam artifacts with blend modes)
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = canvas.width;
  tmpCanvas.height = canvas.height;
  const tmpCtx = tmpCanvas.getContext('2d')!;
  drawPerspective(tmpCtx, designImg, fitCorners);

  if (brightness < 80) {
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tmpCanvas, 0, 0);
    ctx.restore();
  } else if (brightness < 120) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(tmpCanvas, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(tmpCanvas, 0, 0);
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(tmpCanvas, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(tmpCanvas, 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
