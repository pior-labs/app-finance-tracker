import { BrandMark } from '@/components/BrandMark';
import { PILL_PRIMARY } from '../lib/constants';
import { ArrowIcon } from './ArrowIcon';

export function DashboardEmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3.5 px-6 py-15 text-center">
      <BrandMark size={64} className="mb-2" />
      <h2 className="m-0 font-serif text-4xl font-normal tracking-tight text-ink">Nothing here yet.</h2>
      <p className="m-0 max-w-115 text-[15px] text-ink-2">
        Upload your first bank statement and we'll show you a month-at-a-glance picture of your
        spending.
      </p>
      <div className="mt-2 flex gap-2.5">
        <button className={PILL_PRIMARY} onClick={onUpload}>
          Upload statement <ArrowIcon />
        </button>
      </div>
    </div>
  );
}
