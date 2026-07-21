import { auth } from '@/lib/auth/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default async function DashboardOverview() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Welcome back, {session?.user?.name || 'User'}
        </h2>
        <p className="text-surface-500 mt-1">Here&apos;s your SEO overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: '0', color: 'text-blue-600' },
          { label: 'Pages Analyzed', value: '0', color: 'text-green-600' },
          { label: 'Keywords Tracked', value: '0', color: 'text-purple-600' },
          { label: 'AI Credits Used', value: '0 / 0', color: 'text-orange-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <p className="text-sm text-surface-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Recent Activity</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-500 py-8 text-center">
              No recent activity. Create a project to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">SEO Score Trend</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-surface-500 py-8 text-center">
              Run your first analysis to see score trends.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
