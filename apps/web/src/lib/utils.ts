export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 50) return 'text-orange-500';
  if (score >= 30) return 'text-red-500';
  return 'text-red-700';
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (score >= 50) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

export function buildQueryString(params: Record<string, string | number | undefined | null>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  return searchParams.toString();
}
