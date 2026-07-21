'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Globe, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  domain: string;
  status: string;
  createdAt: string;
  projectAnalyses?: { overallScore?: number | null }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDomain, setCreateDomain] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || data.data || []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, domain: createDomain }),
      });
      if (res.ok) {
        setShowCreate(false);
        setCreateName('');
        setCreateDomain('');
        fetchProjects();
      }
    } finally {
      setCreating(false);
    }
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Projects</h2>
          <p className="text-surface-500 mt-1">Manage your SEO projects</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus size={18} className="mr-1" /> New Project
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardContent className="py-4">
            <form onSubmit={handleCreate} className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  id="projectName"
                  label="Project Name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="My Website"
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  id="projectDomain"
                  label="Domain"
                  value={createDomain}
                  onChange={(e) => setCreateDomain(e.target.value)}
                  placeholder="example.com"
                  required
                />
              </div>
              <Button type="submit" loading={creating} className="mb-0.5">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300">No projects yet</h3>
            <p className="text-surface-500 mt-1">Create your first project to get started with SEO analysis.</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus size={18} className="mr-1" /> Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const latestScore = project.projectAnalyses?.[0]?.overallScore;
            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-surface-900 dark:text-surface-100 truncate">
                          {project.name}
                        </h3>
                        <p className="text-sm text-surface-500 truncate mt-0.5">{project.domain}</p>
                      </div>
                      <Badge variant={project.status === 'active' ? 'success' : 'default'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-surface-500">
                        Created {formatDate(project.createdAt)}
                      </span>
                      {latestScore !== null && latestScore !== undefined && (
                        <span className={cn(
                          'font-semibold',
                          latestScore >= 80 ? 'text-green-500' : latestScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                        )}>
                          {latestScore}/100
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
