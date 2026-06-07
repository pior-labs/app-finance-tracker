import { memo } from 'react';
import { PETAL_COLORS } from '../lib/constants';

interface StatementPetalMarkProps {
  size: 'desktop' | 'mobile';
}

export const StatementPetalMark = memo(function StatementPetalMark({ size }: StatementPetalMarkProps) {
  const isDesktop = size === 'desktop';

  return (
    <div className={isDesktop ? 'relative h-16 w-16' : 'relative h-14 w-14'} aria-hidden="true">
      {PETAL_COLORS.map((color, index) => (
        <span
          key={color}
          className={
            isDesktop
              ? 'absolute left-[19px] top-0 h-10 w-[26px] origin-[50%_100%]'
              : 'absolute left-[16px] top-0 h-9 w-[22px] origin-[50%_100%]'
          }
          style={{
            transform: `rotate(${index * 120}deg)`,
            background: color,
            borderRadius: '50% 50% 50% 50% / 80% 80% 20% 20%',
          }}
        />
      ))}
      <span
        className={
          isDesktop
            ? 'absolute left-[23px] top-[23px] z-[2] h-[18px] w-[18px] rounded-full border-2'
            : 'absolute left-[20px] top-[20px] z-[2] h-[16px] w-[16px] rounded-full border-2'
        }
        style={{ background: 'var(--cream)', borderColor: 'var(--ink)' }}
      />
    </div>
  );
});
