import type { MockupFile, DesignFile, CompositeResult } from '../types';
import { compositeImage } from './blend';

export async function batchComposite(
  mockups: MockupFile[],
  designs: DesignFile[],
  onProgress: (done: number, total: number) => void
): Promise<CompositeResult[]> {
  const total = mockups.length * designs.length;
  const results: CompositeResult[] = [];
  let done = 0;

  // Process in chunks of 4 for parallelism without overwhelming browser
  const tasks: Array<{ mockup: MockupFile; design: DesignFile }> = [];
  for (const mockup of mockups) {
    for (const design of designs) {
      tasks.push({ mockup, design });
    }
  }

  const CONCURRENCY = 4;
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const chunk = tasks.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map(async ({ mockup, design }) => {
        const src = await compositeImage(mockup.src, design.src, mockup.printArea!);
        const mName = mockup.name.replace(/\.[^.]+$/, '');
        const dName = design.name.replace(/\.[^.]+$/, '');
        done++;
        onProgress(done, total);
        return {
          id: crypto.randomUUID(),
          name: `${dName}_on_${mName}.png`,
          folder: design.folder,
          src,
          mockupId: mockup.id,
          designId: design.id,
          mockupName: mockup.name,
          designName: design.name,
        };
      })
    );
    results.push(...chunkResults);
    // Yield to UI
    await new Promise((r) => setTimeout(r, 0));
  }

  return results;
}
