import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';




export default async function BalancePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>請先登入</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { balance: true, frozenBalance: true },
  });

  const cashBooks = await prisma.cashBook.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">餘額查詢</h2>
        <p className="text-muted-foreground">查看您的帳戶餘額與交易記錄</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">可用餘額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">NT$ {user?.balance?.toString() || '0'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">凍結餘額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              NT$ {user?.frozenBalance?.toString() || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近交易</CardTitle>
          <CardDescription>最近 10 筆交易記錄</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">時間</th>
                  <th className="px-4 py-2 text-left font-medium">類型</th>
                  <th className="px-4 py-2 text-left font-medium">金額</th>
                  <th className="px-4 py-2 text-left font-medium">備註</th>
                </tr>
              </thead>
              <tbody>
                {cashBooks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      尚無交易記錄
                    </td>
                  </tr>
                ) : (
                  cashBooks.map((cb) => (
                    <tr key={cb.id} className="border-b">
                      <td className="px-4 py-2">{cb.createdAt.toLocaleString('zh-TW')}</td>
                      <td className="px-4 py-2">{cb.type}</td>
                      <td className={`px-4 py-2 ${cb.amount.gte(0) ? 'text-green-600' : 'text-red-600'}`}>
                        {cb.amount.gte(0) ? '+' : ''}{cb.amount.toString()}
                      </td>
                      <td className="px-4 py-2">{cb.note || '-'}</td>
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