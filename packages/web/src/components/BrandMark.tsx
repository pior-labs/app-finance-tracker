import type { CSSProperties } from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

function petalStyle(rotation: number, color: string): CSSProperties {
  return {
    background: color,
    transform: `rotate(${rotation}deg)`,
  };
}

export function BrandMark({ size = 34, className = '' }: BrandMarkProps) {
  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="absolute left-[29.5%] top-0 h-[65%] w-[41%] origin-[50%_100%] rounded-[50%_50%_50%_50%/80%_80%_20%_20%]"
        style={petalStyle(0, 'var(--finlens-mark-petal-1)')}
      />
      <span
        className="absolute left-[29.5%] top-0 h-[65%] w-[41%] origin-[50%_100%] rounded-[50%_50%_50%_50%/80%_80%_20%_20%]"
        style={petalStyle(120, 'var(--finlens-mark-petal-2)')}
      />
      <span
        className="absolute left-[29.5%] top-0 h-[65%] w-[41%] origin-[50%_100%] rounded-[50%_50%_50%_50%/80%_80%_20%_20%]"
        style={petalStyle(240, 'var(--finlens-mark-petal-3)')}
      />
      <span
        className="absolute left-[35%] top-[35%] z-10 h-[30%] w-[30%] rounded-full border-[1.5px]"
        style={{
          background: 'var(--finlens-mark-core-bg)',
          borderColor: 'var(--finlens-mark-core-border)',
        }}
      />
    </span>
  );
}
