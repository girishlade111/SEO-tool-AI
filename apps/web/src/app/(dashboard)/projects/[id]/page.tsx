'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Trash2, BarChart3, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface ProjectDetail {
  id: string;
  name: string;
  domain: string;
  description?: string | null;
  status: string;
  createdAt: string;
  projectAnalyses?: { id: string; type: string; status: string; overallScore?: number | null; createdAt: string }[];
  projectKeywords?: { id: string; keyword: string; searchVolume: number; difficulty: number }[];
  projectContent?: { id: string; title: string; status: string; type: string }[];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('Project not found');
      const data = await res.json();
      setProject(data.project);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center py-12 text-surface-500">Loading project...</div>;
  if (error || !project) return <div className="text-center py-12 text-red-500">{error || 'Project not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects" className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <ArrowLeft size={20} className="text-surface-500" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">{project.name}</h2>
            <p className="text-surface-500 text-sm">{project.domain}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Settings size={16} className="mr-1" /> Settings
          </Button>
          <Button variant="danger" size="sm">
            <Trash2 size={16} className="mr-1" /> Delete
          </Button>
        </div>
      </div>

      {project.description && (
        <Card>
          <CardContent className="py-3">
            <p className="text-sm text-surface-600 dark:text-surface-400">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/dashboard/analysis?projectId=${project.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 text-center">
              <Search size={24} className="mx-auto text-primary-500 mb-2" />
              <p className="font-semibold">SEO Analysis</p>
              <p className="text-sm text-surface-500 mt-1">
                {project.projectAnalyses?.length || 0} analyses
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/dashboard/keywords?projectId=${project.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 text-center">
              <BarChart3 size={24} className="mx-auto text-green-500 mb-2" />
              <p className="font-semibold">Keywords</p>
              <p className="text-sm text-surface-500 mt-1">
                {project.projectKeywords?.length || 0} keywords
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/dashboard/content?projectId=${project.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4 text-center">
              <FileText size={24} className="mx-auto text-purple-500 mb-2" />
              <p className="font-semibold">Content</p>
              <p className="text-sm text-surface-500 mt-1">
                {project.projectContent?.length || 0} pieces
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Recent Analyses</h3>
        </CardHeader>
        <CardContent>
          {(!project.projectAnalyses || project.projectAnalyses.length === 0) ? (
            <p className="text-sm text-surface-500 py-4 text-center">No analyses yet. Run your first analysis.</p>
          ) : (
            <div className="space-y-3">
              {project.projectAnalyses.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{a.type}</p>
                    <p className="text-xs text-surface-500">{formatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${a.overallScore ? (a.overallScore >= 80 ? 'text-green-500' : a.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500') : ''}`}>
                      {a.overallScore ?? 'N/A'}
                    </span>
                    <span className="text-xs text-surface-400 capitalize">{a.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
