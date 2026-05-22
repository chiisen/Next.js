'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/dashboard/deposits', label: '代收管理' },
  { href: '/dashboard/withdraws', label: '代付管理' },
  { href: '/dashboard/review', label: '待審核' },
  { href: '/dashboard/commissions', label: '代理佣金' },
  { href: '/dashboard/bank-accounts', label: '銀行帳號' },
  { href: '/dashboard/blacklist', label: '黑名單' },
];

const merchantLinks = [
  { href: '/dashboard/deposits', label: '代收' },
  { href: '/dashboard/withdraws', label: '代付' },
  { href: '/dashboard/balance', label: '餘額查詢' },
];

const agentLinks = [
  { href: '/dashboard/commissions', label: '代理佣金' },
  { href: '/dashboard/balance', label: '餘額查詢' },
];

interface DashboardSidebarProps {
  role: string;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  let links = merchantLinks;
  if (role === 'ADMIN') links = adminLinks;
  if (role === 'AGENT') links = agentLinks;

  return (
    <aside className="w-64 min-h-screen bg-white border-r dark:bg-zinc-900 dark:border-zinc-800">
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === link.href
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}