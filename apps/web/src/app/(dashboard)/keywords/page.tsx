'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Plus, Trash2, TrendingUp, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

interface KeywordItem {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: string;
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bulkInput, setBulkInput] = useState('');

  useEffect(() => {
    fetchKeywords();
  }, []);

  async function fetchKeywords() {
    try {
      const res = await fetch('/api/keywords?projectId=demo');
      const data = await res.json();
      setKeywords(data.keywords || data.data || []);
    } finally {
      setLoading(false);
    }
  }

  const filtered = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(search.toLowerCase())
  );

  const getDifficultyColor = (d: number) => {
    if (d >= 70) return 'text-red-500';
    if (d >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Keywords</h2>
          <p className="text-surface-500 mt-1">Track and manage your target keywords</p>
        </div>
        <Button>
          <Plus size={18} className="mr-1" /> Add Keywords
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Keywords', value: keywords.length.toString(), color: 'text-blue-600' },
          { label: 'Avg. Difficulty', value: keywords.length ? Math.round(keywords.reduce((s, k) => s + k.difficulty, 0) / keywords.length) + '%' : '0%', color: 'text-orange-600' },
          { label: 'Total Volume', value: formatNumber(keywords.reduce((s, k) => s + k.searchVolume, 0)), color: 'text-green-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <p className="text-sm text-surface-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
        <input
          type="text"
          placeholder="Search keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full max-w-md border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-500">Loading keywords...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 size={48} className="mx-auto text-surface-300 mb-4" />
            <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300">No keywords yet</h3>
            <p className="text-surface-500 mt-1">Add keywords to start tracking your SEO performance.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="grid grid-cols-5 text-xs font-medium text-surface-500 uppercase tracking-wider">
              <span className="col-span-2">Keyword</span>
              <span>Volume</span>
              <span>Difficulty</span>
              <span>CPC</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.map((kw) => (
              <div key={kw.id} className="grid grid-cols-5 items-center px-6 py-3 border-b border-surface-100 dark:border-surface-700 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50">
                <div className="col-span-2">
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{kw.keyword}</p>
                  <Badge variant="default" className="mt-0.5">{kw.intent}</Badge>
                </div>
                <p className="text-sm">{formatNumber(kw.searchVolume)}</p>
                <p className={`text-sm font-semibold ${getDifficultyColor(kw.difficulty)}`}>
                  {kw.difficulty}%
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm">${kw.cpc.toFixed(2)}</p>
                  <button className="p-1 text-surface-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
