'use client';

import { Bell, LogOut, User } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-6 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
        Dashboard
      </h1>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
              {user.name || 'User'}
            </span>
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-20 py-1">
                <button
                  onClick={() => { setShowMenu(false); window.location.href = '/dashboard/settings'; }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
