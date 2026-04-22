import { Progress } from '@/components/ui/progress';

interface CategoryBarProps {
  label: string;
  amount: string;
  value: number;
}

export function CategoryBar({ label, amount, value }: CategoryBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{amount}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}
