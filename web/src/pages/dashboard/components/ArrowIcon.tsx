import { ArrowRight } from 'lucide-react';

export function ArrowIcon() {
  return (
    <ArrowRight
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.75 motion-reduce:transition-none"
      strokeWidth={2.25}
    />
  );
}
