'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewWithdrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    bankAccount: '',
    accountName: '',
    callbackUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/withdraw/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          currency: 'TWD',
          bankName: formData.bankName,
          bankAccount: formData.bankAccount,
          accountName: formData.accountName,
          callbackUrl: formData.callbackUrl || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('代付請求建立成功');
        router.push(`/dashboard/withdraws/${data.id}`);
      } else {
        const error = await response.json();
        toast.error('建立失敗：' + error.message);
      }
    } catch {
      toast.error('發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">建立代付</h2>
        <p className="text-muted-foreground">發起代付請求（需管理員審核）</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>代付資訊</CardTitle>
          <CardDescription>填寫代付訂單基本資訊</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">金額 (TWD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">銀行名稱</Label>
              <Input
                id="bankName"
                placeholder="合作金庫"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">銀行帳號</Label>
              <Input
                id="bankAccount"
                placeholder="1234567890"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">帳戶名稱</Label>
              <Input
                id="accountName"
                placeholder="王小明"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callbackUrl">回調 URL（選填）</Label>
              <Input
                id="callbackUrl"
                type="url"
                placeholder="https://your-server.com/callback"
                value={formData.callbackUrl}
                onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium disabled:opacity50"
              >
                {loading ? '建立中...' : '建立代付'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium"
              >
                取消
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}