import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';




export default async function ReviewPage() {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const pendingWithdraws = await prisma.withdraw.findMany({
    where: { status: 'PENDING_REVIEW' },
    orderBy: { createdAt: 'desc' },
    include: { merchant: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">待審核</h2>
        <p className="text-muted-foreground">管理員審核代付請求</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>待審核代付</CardTitle>
          <CardDescription>共 {pendingWithdraws.length} 筆待審核</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">訂單編號</th>
                  <th className="px-4 py-2 text-left font-medium">商戶</th>
                  <th className="px-4 py-2 text-left font-medium">金額</th>
                  <th className="px-4 py-2 text-left font-medium">銀行</th>
                  <th className="px-4 py-2 text-left font-medium">帳號</th>
                  <th className="px-4 py-2 text-left font-medium">申請時間</th>
                  <th className="px-4 py-2 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdraws.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      無待審核項目
                    </td>
                  </tr>
                ) : (
                  pendingWithdraws.map((withdraw) => (
                    <tr key={withdraw.id} className="border-b">
                      <td className="px-4 py-2">{withdraw.orderNo}</td>
                      <td className="px-4 py-2">{withdraw.merchant.name || withdraw.merchant.email}</td>
                      <td className="px-4 py-2">NT$ {withdraw.amount.toString()}</td>
                      <td className="px-4 py-2">{withdraw.bankName || '-'}</td>
                      <td className="px-4 py-2">{withdraw.bankAccount ? '****' + withdraw.bankAccount.slice(-4) : '-'}</td>
                      <td className="px-4 py-2">{withdraw.createdAt.toLocaleString('zh-TW')}</td>
                      <td className="px-4 py-2">
                        <form action={`/api/admin/review`} method="POST" className="flex gap-2">
                          <input type="hidden" name="withdrawId" value={withdraw.id} />
                          <button name="action" value="approve" className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            核准
                          </button>
                          <button name="action" value="reject" className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            駁回
                          </button>
                        </form>
                      </td>
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