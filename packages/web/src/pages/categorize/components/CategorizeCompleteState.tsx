import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export function CategorizeCompleteState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="relative mb-3 h-22.5 w-22.5">
        {[
          'var(--finlens-complete-confetti-1)',
          'var(--finlens-complete-confetti-2)',
          'var(--finlens-complete-confetti-3)',
          'var(--finlens-complete-confetti-4)',
          'var(--finlens-complete-confetti-5)',
        ].map((color, i) => (
          <span
            key={color}
            className="absolute left-8.5p-0 h-9 w-5.5 origin-[50%_130%]"
            style={{
              transform: `rotate(${i * 72}deg)`,
              background: color,
              borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
            }}
          />
        ))}
        <span
          className="absolute left-6.75 top-6.75 z-2 flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{
            background: 'var(--finlens-success-icon)',
            boxShadow: 'var(--finlens-success-shadow)',
          }}
        >
          <Check aria-hidden="true" className="h-5 w-5" strokeWidth={2.8} />
        </span>
      </div>
      <h2
        className="m-0 text-[32px] font-normal tracking-tight sm:text-[38px] md:text-[42px]"
        style={{ fontFamily: "'Fraunces', serif", color: 'var(--ink)' }}
      >
        All sorted.
      </h2>
      <p className="m-0 max-w-105 px-4 text-[15px] leading-relaxed sm:px-0 sm:text-base" style={{ color: 'var(--ink-2)' }}>
        Every transaction has a home. Your spending picture is complete.
      </p>
      <div className="mt-2 flex w-full flex-col items-stretch gap-3 px-4 sm:w-auto sm:flex-row sm:items-center sm:px-0">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium no-underline transition-transform hover:-translate-y-px motion-reduce:hover:translate-y-0"
          style={{
            fontFamily: "'Outfit', sans-serif",
            background: 'var(--ink)',
            color: 'var(--cream)',
            boxShadow: '0 8px 22px -6px rgba(45,36,24,0.4)',
          }}
        >
          See dashboard <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.3} />
        </Link>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[15px] font-medium no-underline transition-colors hover:bg-frost/50"
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--ink-2)',
            borderColor: 'rgba(45,36,24,0.18)',
          }}
        >
          View transactions
        </Link>
      </div>
    </div>
  );
}
