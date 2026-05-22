import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';




export default async function BankAccountsPage() {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const bankAccounts = await prisma.bankAccount.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { bank: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">銀行帳號</h2>
        <p className="text-muted-foreground">管理系統銀行帳號</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>帳號列表</CardTitle>
          <CardDescription>系統銀行帳號管理</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">帳號</th>
                  <th className="px-4 py-2 text-left font-medium">戶名</th>
                  <th className="px-4 py-2 text-left font-medium">銀行</th>
                  <th className="px-4 py-2 text-left font-medium">狀態</th>
                  <th className="px-4 py-2 text-left font-medium">已分配</th>
                </tr>
              </thead>
              <tbody>
                {bankAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      尚無銀行帳號
                    </td>
                  </tr>
                ) : (
                  bankAccounts.map((account) => (
                    <tr key={account.id} className="border-b">
                      <td className="px-4 py-2">{account.accountNo}</td>
                      <td className="px-4 py-2">{account.accountName}</td>
                      <td className="px-4 py-2">{account.bank?.name || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          account.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          account.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {account.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{account.isAllocated ? '是' : '否'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}