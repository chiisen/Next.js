import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';




export default async function BlacklistPage() {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const blacklists = await prisma.blacklist.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">黑名單</h2>
        <p className="text-muted-foreground">風控黑名單管理</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>黑名單列表</CardTitle>
          <CardDescription>身份證、银行帳號、手機、IP、設備 ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">類型</th>
                  <th className="px-4 py-2 text-left font-medium">值</th>
                  <th className="px-4 py-2 text-left font-medium">原因</th>
                  <th className="px-4 py-2 text-left font-medium">建立時間</th>
                </tr>
              </thead>
              <tbody>
                {blacklists.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      尚無黑名單記錄
                    </td>
                  </tr>
                ) : (
                  blacklists.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-2">{item.type}</td>
                      <td className="px-4 py-2 font-mono text-xs">{item.value}</td>
                      <td className="px-4 py-2">{item.reason || '-'}</td>
                      <td className="px-4 py-2">{item.createdAt.toLocaleString('zh-TW')}</td>
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