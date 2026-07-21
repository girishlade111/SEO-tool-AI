'use client';

import { useState, useEffect } from 'react';
import { FileBarChart, Plus, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ReportItem {
  id: string;
  name: string;
  type: string;
  status: string;
  schedule: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch('/api/reports?projectId=demo');
      const data = await res.json();
      setReports(data.reports || data.data || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Reports</h2>
          <p className="text-surface-500 mt-1">Generate and schedule SEO reports</p>
        </div>
        <Button>
          <Plus size={18} className="mr-1" /> New Report
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">Loading reports...</div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileBarChart size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300">No reports yet</h3>
            <p className="text-surface-500 mt-1">Generate your first SEO report to start tracking progress.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{r.name}</h3>
                      <Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge>
                    </div>
                    <p className="text-sm text-surface-500 mt-1">
                      {r.type} report {r.schedule !== 'none' ? `· ${r.schedule} schedule` : ''}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100">
                      <Download size={16} />
                    </button>
                    <button className="p-2 text-surface-400 hover:text-red-500 rounded-lg hover:bg-surface-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
