'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email: string;
    role: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b dark:bg-zinc-900 dark:border-zinc-800">
      <div>
        <h1 className="text-xl font-semibold">支付系統</h1>
        <p className="text-sm text-muted-foreground">
          {user.name || user.email} · {user.role}
        </p>
      </div>
      <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
        登出
      </Button>
    </header>
  );
}