export function Scenery({ offsetX }: { offsetX: number }) {
  const clouds = [
    { x: 120, y: 40, s: 1 },
    { x: 420, y: 90, s: 0.7 },
    { x: 720, y: 30, s: 1.2 },
    { x: 980, y: 110, s: 0.8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-sky-50" />
      {clouds.map((c) => (
        <div
          key={`cloud-${c.x}`}
          className="absolute"
          style={{
            left: c.x - offsetX * 0.4,
            top: c.y,
            transform: `scale(${c.s})`,
          }}
        >
          <svg width="80" height="40" viewBox="0 0 80 40">
            <ellipse cx="30" cy="26" rx="26" ry="14" fill="#ffffff" opacity="0.9" />
            <ellipse cx="50" cy="22" rx="20" ry="14" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
      ))}
    </div>
  );
}
