import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { CategoryBar } from '@/components/CategoryBar';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <StatCard label="Spent this month" value="$0.00" hint="Placeholder value" />
        <StatCard label="Needs review" value="0" hint="Placeholder count" />
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
            <CardDescription>Phase 1 scaffold placeholder for stats endpoint wiring.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryBar label="Groceries" amount="$0.00" value={0} />
            <CategoryBar label="Dining Out" amount="$0.00" value={0} />
            <CategoryBar label="Transport" amount="$0.00" value={0} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
