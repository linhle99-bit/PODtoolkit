import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Point } from '../types';

export default function Step2_DefinePrintArea() {
  const { mockups, setPrintArea, setStep, savePreset } = useAppStore();
  const [activeIdx, setActiveIdx] = useState(0);
  const [corners, setCorners] = useState<Point[]>([]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');

  const activeMockup = mockups[activeIdx];
  const allDefined = mockups.every((m) => m.printArea !== null);

  const getPos = useCallback((e: { clientX: number; clientY: number }) => {
    const bounds = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(e.clientX - bounds.left, bounds.width)),
      y: Math.max(0, Math.min(e.clientY - bounds.top, bounds.height)),
    };
  }, []);

  // Load existing corners when switching mockup
  const switchMockup = (idx: number) => {
    setActiveIdx(idx);
    setDraggingIdx(null);
    const m = mockups[idx];
    if (m.printArea) {
      setCorners([...m.printArea.corners]);
    } else {
      setCorners([]);
    }
  };

  const saveCorners = useCallback(
    (pts: Point[]) => {
      if (pts.length === 4 && containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        setPrintArea(activeMockup.id, {
          corners: pts as [Point, Point, Point, Point],
          displayWidth: bounds.width,
          displayHeight: bounds.height,
        });
      }
    },
    [activeMockup, setPrintArea]
  );

  const handleDotMouseDown = useCallback(
    (idx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      setDraggingIdx(idx);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingIdx === null) return;
      const pos = getPos(e);
      const current = activeMockup.printArea
        ? [...activeMockup.printArea.corners]
        : [...corners];
      current[draggingIdx] = pos;
      setCorners(current);
      if (current.length === 4) {
        saveCorners(current);
      }
    },
    [draggingIdx, getPos, activeMockup, corners, saveCorners]
  );

  const handleMouseUp = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  // Touch support
  const handleTouchStart = useCallback(
    (idx: number, e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingIdx(idx);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (draggingIdx === null) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pos = getPos(touch);
      const current = activeMockup.printArea
        ? [...activeMockup.printArea.corners]
        : [...corners];
      current[draggingIdx] = pos;
      setCorners(current);
      if (current.length === 4) {
        saveCorners(current);
      }
    },
    [draggingIdx, getPos, activeMockup, corners, saveCorners]
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (draggingIdx !== null) return;
      const pos = getPos(e);

      // Check if near existing corner
      const pts = activeMockup.printArea ? [...activeMockup.printArea.corners] : [...corners];
      for (let i = 0; i < pts.length; i++) {
        if (Math.abs(pts[i].x - pos.x) < 15 && Math.abs(pts[i].y - pos.y) < 15) {
          return;
        }
      }

      if (pts.length >= 4) {
        // Reset
        setCorners([pos]);
        setPrintArea(activeMockup.id, null!);
      } else {
        const newPts = [...pts, pos];
        setCorners(newPts);
        if (newPts.length === 4) {
          saveCorners(newPts);
        }
      }
    },
    [corners, activeMockup, draggingIdx, getPos, saveCorners, setPrintArea]
  );

  const cornerLabels = ['TL', 'TR', 'BR', 'BL'];
  const pts = activeMockup?.printArea ? activeMockup.printArea.corners : corners;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-2">Define Print Area</h2>
      <p className="text-gray-400 mb-1">
        Click 4 corners on the mockup: Top-Left, Top-Right, Bottom-Right, Bottom-Left
      </p>
      <p className="text-gray-500 text-sm mb-4">
        {pts.length < 4
          ? `Click corner ${pts.length + 1}/4 (${cornerLabels[pts.length]})`
          : 'Done! Drag corners to adjust. Click elsewhere to reset.'}
      </p>

      {/* Mockup tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {mockups.map((m, i) => (
          <button
            key={m.id}
            onClick={() => switchMockup(i)}
            className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition ${
              i === activeIdx
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {m.printArea ? (
              <span className="text-green-400">{'\u2713'}</span>
            ) : (
              <span className="text-gray-600">{'\u25CB'}</span>
            )}
            <span className="truncate max-w-[120px]">{m.name}</span>
          </button>
        ))}
      </div>

      {/* Canvas area */}
      {activeMockup && (
        <div
          ref={containerRef}
          className="relative inline-block cursor-crosshair select-none mx-auto"
          onClick={handleContainerClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            src={activeMockup.src}
            alt={activeMockup.name}
            className="max-h-[500px] max-w-full rounded-lg pointer-events-none"
            draggable={false}
          />

          {/* Draw quad outline */}
          {pts.length >= 2 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Lines between consecutive corners */}
              {pts.map((p, i) => {
                if (i === pts.length - 1 && pts.length < 4) return null;
                const next = pts[(i + 1) % pts.length];
                return (
                  <line
                    key={i}
                    x1={p.x}
                    y1={p.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                );
              })}
              {/* Fill quad */}
              {pts.length === 4 && (
                <polygon
                  points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(168, 85, 247, 0.12)"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              )}
            </svg>
          )}

          {/* Corner dots */}
          {pts.map((p, i) => (
            <div
              key={i}
              className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-purple-500 border-2 border-white cursor-grab flex items-center justify-center text-[9px] font-bold text-white shadow-lg z-10"
              style={{ left: p.x, top: p.y }}
              onMouseDown={(e) => handleDotMouseDown(i, e)}
              onTouchStart={(e) => handleTouchStart(i, e)}
            >
              {cornerLabels[i]}
            </div>
          ))}
        </div>
      )}

      {/* Save preset (only when all print areas defined) */}
      {allDefined && (
        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            {showSaveInput ? (
              <>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && saveName.trim()) {
                      savePreset(saveName.trim());
                      setSaveName('');
                      setShowSaveInput(false);
                    }
                  }}
                  placeholder="Store name (e.g. Shopee, Etsy...)"
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 flex-1"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (saveName.trim()) {
                      savePreset(saveName.trim());
                      setSaveName('');
                      setShowSaveInput(false);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveInput(false)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-400 text-sm">Save mockups + print areas for reuse?</span>
                <button
                  onClick={() => setShowSaveInput(true)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition"
                >
                  Save as Store Preset
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setStep(0)}
          className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition"
        >
          ← Back
        </button>
        {allDefined && (
          <button
            onClick={() => setStep(2)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition"
          >
            Next: Upload Designs →
          </button>
        )}
      </div>
    </div>
  );
}
