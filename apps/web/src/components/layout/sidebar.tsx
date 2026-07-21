'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  BarChart3,
  FileText,
  Lightbulb,
  Settings,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Projects', icon: Globe },
  { href: '/dashboard/analysis', label: 'Analysis', icon: Search },
  { href: '/dashboard/keywords', label: 'Keywords', icon: BarChart3 },
  { href: '/dashboard/content', label: 'Content', icon: FileText },
  { href: '/dashboard/reports', label: 'Reports', icon: Lightbulb },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-surface-200 dark:border-surface-800">
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-bold text-primary-600">
            Lade Stack
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
