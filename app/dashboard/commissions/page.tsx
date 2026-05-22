import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CommissionsPage() {
  const session = await auth();

  // ADMIN sees all, AGENT sees only own
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAgent = session?.user?.role === 'AGENT';

  if (!isAdmin && !isAgent) {
    redirect('/dashboard');
  }

  const agentFilter = isAdmin ? {} : { agentId: session?.user?.id };

  const [commissions, agents] = await Promise.all([
    prisma.agentCommission.findMany({
      where: agentFilter,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { feeGroup: true },
    }),
    isAdmin ? prisma.user.findMany({
      where: { role: 'AGENT' },
      select: { id: true, name: true },
    }) : Promise.resolve([]),
  ]);

  const agentMap = new Map(agents.map(a => [a.id, a.name || '代理商']));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">代理佣金</h2>
        <p className="text-muted-foreground">
          {isAdmin ? '管理員檢視所有代理佣金' : '您的佣金記錄'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>佣金記錄</CardTitle>
          <CardDescription>
            {isAdmin ? '所有代理商佣金' : `${commissions.length} 筆記錄`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {isAdmin && <th className="px-4 py-2 text-left font-medium">代理商</th>}
                  <th className="px-4 py-2 text-left font-medium">層級</th>
                  <th className="px-4 py-2 text-left font-medium">金額</th>
                  <th className="px-4 py-2 text-left font-medium">費率</th>
                  <th className="px-4 py-2 text-left font-medium">狀態</th>
                  <th className="px-4 py-2 text-left font-medium">時間</th>
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                      尚無佣金記錄
                    </td>
                  </tr>
                ) : (
                  commissions.map((commission) => (
                    <tr key={commission.id} className="border-b">
                      {isAdmin && (
                        <td className="px-4 py-2">
                          {agentMap.get(commission.agentId) || commission.agentId}
                        </td>
                      )}
                      <td className="px-4 py-2">第 {commission.level} 層</td>
                      <td className="px-4 py-2">NT$ {commission.amount.toString()}</td>
                      <td className="px-4 py-2">{commission.rate.toString()}%</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          commission.status === 'settled' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {commission.status === 'settled' ? '已結算' : '處理中'}
                        </span>
                      </td>
                      <td className="px-4 py-2">{commission.createdAt.toLocaleString('zh-TW')}</td>
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