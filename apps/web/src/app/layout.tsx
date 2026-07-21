import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Lade Stack - AI SEO Copilot',
    template: '%s | Lade Stack',
  },
  description: 'Enterprise-grade AI-powered SEO analysis, keyword research, and content optimization platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
