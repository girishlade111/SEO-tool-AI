'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, getScoreColor } from '@/lib/utils';

interface AnalysisItem {
  id: string;
  type: string;
  status: string;
  overallScore?: number | null;
  pagesAnalyzed: number;
  issuesFound: number;
  createdAt: string;
  projectId: string;
}

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, [selectedProject]);

  async function fetchAnalyses() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProject) params.set('projectId', selectedProject);
      const res = await fetch(`/api/analysis?${params}`);
      const data = await res.json();
      setAnalyses(data.analyses || data.data || []);
    } catch (err) {
      console.error('Failed to fetch analyses', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">SEO Analysis</h2>
          <p className="text-surface-500 mt-1">Run and view SEO analysis reports</p>
        </div>
        <Button onClick={() => {/* trigger new analysis */}}>
          <Activity size={18} className="mr-1" /> New Analysis
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">Loading analyses...</div>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300">No analyses yet</h3>
            <p className="text-surface-500 mt-1">Run your first SEO analysis to see results here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold capitalize">{a.type}</h3>
                      <Badge variant={a.status === 'completed' ? 'success' : a.status === 'running' ? 'warning' : 'default'}>
                        {a.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-surface-500 mt-1">
                      {a.pagesAnalyzed} pages analyzed | {a.issuesFound} issues found
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">{formatDate(a.createdAt)}</p>
                  </div>
                  {a.overallScore !== null && a.overallScore !== undefined && (
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(a.overallScore)}`}>
                        {a.overallScore}
                      </p>
                      <p className="text-xs text-surface-500">/100</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
