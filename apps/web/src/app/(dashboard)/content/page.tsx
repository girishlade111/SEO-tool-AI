'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit3, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  slug: string;
  createdAt: string;
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'default',
  published: 'success',
  reviewing: 'warning',
  archived: 'danger',
};

export default function ContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      const res = await fetch('/api/content?projectId=demo');
      const data = await res.json();
      setContent(data.content || data.data || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Content</h2>
          <p className="text-surface-500 mt-1">Create and manage SEO-optimized content</p>
        </div>
        <Button>
          <Plus size={18} className="mr-1" /> New Content
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">Loading content...</div>
      ) : content.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300">No content yet</h3>
            <p className="text-surface-500 mt-1">Create your first piece of SEO content.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {content.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{c.title}</h3>
                      <Badge variant={statusVariant[c.status] || 'default'}>{c.status}</Badge>
                    </div>
                    <p className="text-sm text-surface-500 mt-0.5">
                      {c.type} &middot; /{c.slug} &middot; {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button className="p-2 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2 text-surface-400 hover:text-red-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
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
