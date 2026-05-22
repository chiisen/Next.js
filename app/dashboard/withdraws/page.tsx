import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';




export default async function WithdrawsPage() {
  const session = await auth();

  const withdraws = await prisma.withdraw.findMany({
    where: session?.user?.role === 'ADMIN' ? {} : { merchantId: session?.user?.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">代付管理</h2>
          <p className="text-muted-foreground">管理您的代付訂單</p>
        </div>
        <Link
          href="/dashboard/withdraws/new"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          建立代付
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>代付列表</CardTitle>
          <CardDescription>最近 50 筆代付訂單</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">訂單編號</th>
                  <th className="px-4 py-2 text-left font-medium">金額</th>
                  <th className="px-4 py-2 text-left font-medium">狀態</th>
                  <th className="px-4 py-2 text-left font-medium">建立時間</th>
                </tr>
              </thead>
              <tbody>
                {withdraws.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      尚無代付訂單
                    </td>
                  </tr>
                ) : (
                  withdraws.map((withdraw) => (
                    <tr key={withdraw.id} className="border-b">
                      <td className="px-4 py-2">{withdraw.orderNo}</td>
                      <td className="px-4 py-2">NT$ {withdraw.amount.toString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          withdraw.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          withdraw.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                          withdraw.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {withdraw.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{withdraw.createdAt.toLocaleString('zh-TW')}</td>
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