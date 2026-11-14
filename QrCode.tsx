/** Deterministic decorative QR-style code (demo only, not scannable). */
export function QrCode({ seed, size = 112, label }: { seed: string; size?: number; label: string }) {
  const n = 21;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1103515245 + 12345) >>> 0), (h >>> 16) & 1);
  const finder = (x: number, y: number) =>
    (([[0, 0], [n - 7, 0], [0, n - 7]] as [number, number][])).some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!finder(x, y) && rnd()) cells.push([x, y]);
  return (
    <svg role="img" aria-label={label} width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="rounded-lg bg-card text-foreground">
      <rect x={-1} y={-1} width={n + 2} height={n + 2} className="fill-card" />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />)}
      {([[0, 0], [n - 7, 0], [0, n - 7]] as [number, number][]).map(([x, y]) => (
        <g key={`${x}${y}`} fill="currentColor">
          <path d={`M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={x + 2} y={y + 2} width={3} height={3} />
        </g>
      ))}
    </svg>
  );
}
