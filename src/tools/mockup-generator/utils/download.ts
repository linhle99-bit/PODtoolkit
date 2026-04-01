import JSZip from 'jszip';
import type { CompositeResult } from '../types';

export function downloadOne(result: CompositeResult) {
  const parts = result.src.split(',');
  const byteStr = atob(parts[1]);
  const mime = parts[0].match(/:(.*?);/)![1];
  const buf = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) {
    buf[i] = byteStr.charCodeAt(i);
  }
  const blob = new Blob([buf], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(results: CompositeResult[]) {
  const zip = new JSZip();
  const root = zip.folder('mockup-output')!;

  results.forEach((result) => {
    const base64 = result.src.split(',')[1];
    const designName = result.designName.replace(/\.[^.]+$/, '');
    // Each design PNG gets its own folder containing all its mockup results
    const designFolder = root.folder(designName)!;
    designFolder.file(result.name, base64, { base64: true });
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mockup-output.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
