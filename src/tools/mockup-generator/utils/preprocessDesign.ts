/**
 * Trims transparent pixels around design content.
 * Output is tight-cropped to actual content only.
 */
export function preprocessDesign(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const tmp = document.createElement('canvas');
      tmp.width = img.naturalWidth;
      tmp.height = img.naturalHeight;
      const tmpCtx = tmp.getContext('2d')!;
      tmpCtx.drawImage(img, 0, 0);

      // Find bounding box of non-transparent pixels
      const imageData = tmpCtx.getImageData(0, 0, tmp.width, tmp.height);
      const data = imageData.data;
      let minX = tmp.width, minY = tmp.height, maxX = 0, maxY = 0;

      for (let y = 0; y < tmp.height; y++) {
        for (let x = 0; x < tmp.width; x++) {
          const alpha = data[(y * tmp.width + x) * 4 + 3];
          if (alpha > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // If no content found or already tight, return as-is
      if (maxX <= minX || maxY <= minY) {
        resolve(src);
        return;
      }

      const contentW = maxX - minX + 1;
      const contentH = maxY - minY + 1;

      // Check if already tight-cropped (less than 2% padding)
      const padRatio = 1 - (contentW * contentH) / (tmp.width * tmp.height);
      if (padRatio < 0.02) {
        resolve(src);
        return;
      }

      // Output tight-cropped content only
      const out = document.createElement('canvas');
      out.width = contentW;
      out.height = contentH;
      const outCtx = out.getContext('2d')!;
      outCtx.drawImage(
        tmp,
        minX, minY, contentW, contentH,
        0, 0, contentW, contentH
      );

      resolve(out.toDataURL('image/png'));
    };
    img.src = src;
  });
}
