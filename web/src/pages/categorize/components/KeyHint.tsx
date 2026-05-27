import { memo } from 'react';

export const KeyHint = memo(function KeyHint({ char }: { char: string }) {
  return (
    <span
      className="inline-flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-md text-xs font-medium"
      style={{
        fontFamily: "'Fraunces', serif",
        background: 'rgba(255,255,255,0.6)',
        color: 'var(--ink-2)',
        boxShadow: 'inset 0 0 0 1px rgba(45,36,24,0.08)',
      }}
    >
      {char}
    </span>
  );
});
