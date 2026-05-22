import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Build filter based on role
  const isAdmin = userRole === 'ADMIN';
  const isAgent = userRole === 'AGENT';
  const isMerchant = userRole === 'MERCHANT';

  // Fetch dashboard stats based on role
  let depositCount = 0;
  let depositAmount = 0;
  let withdrawAmount = 0;
  let recentDeposits: any[] = [];
  let recentWithdraws: any[] = [];
  let agentCommission = 0;
  let pendingReviewCount = 0;

  if (isAgent) {
    // Agent sees their commissions
    const commissions = await prisma.agentCommission.findMany({
      where: { agentId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const settled = commissions.filter(c => c.status === 'settled');
    agentCommission = settled.reduce((sum, c) => sum + Number(c.amount), 0);
  }

  if (isMerchant || isAdmin) {
    const merchantFilter = isAdmin ? {} : { merchantId: userId };

    const [dc, da, wa, rd, rw] = await Promise.all([
      prisma.deposit.count({ where: { ...merchantFilter, createdAt: { gte: today, lt: tomorrow } } }),
      prisma.deposit.aggregate({ where: { ...merchantFilter, status: 'COMPLETED', createdAt: { gte: today, lt: tomorrow } }, _sum: { amount: true } }),
      prisma.withdraw.aggregate({ where: { ...merchantFilter, status: 'COMPLETED', createdAt: { gte: today, lt: tomorrow } }, _sum: { amount: true } }),
      prisma.deposit.findMany({ where: merchantFilter, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.withdraw.findMany({ where: merchantFilter, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    depositCount = dc;
    depositAmount = Number(da._sum.amount || 0);
    withdrawAmount = Number(wa._sum.amount || 0);
    recentDeposits = rd;
    recentWithdraws = rw;
  }

  if (isAdmin) {
    pendingReviewCount = await prisma.withdraw.count({ where: { status: 'PENDING_REVIEW' } });
  }

  const stats = [];
  if (isAgent) {
    stats.push(
      <Card key="commission">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">已結算佣金</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">NT$ {agentCommission}</div>
          <p className="text-xs text-muted-foreground">代理佣金</p>
        </CardContent>
      </Card>
    );
  } else {
    stats.push(
      <Card key="transactions">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">今日交易</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{depositCount + recentWithdraws.length}</div>
          <p className="text-xs text-muted-foreground">筆交易</p>
        </CardContent>
      </Card>,
      <Card key="deposits">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">代收金額</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">NT$ {depositAmount}</div>
          <p className="text-xs text-muted-foreground">今日</p>
        </CardContent>
      </Card>,
      <Card key="withdraws">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">代付金額</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">NT$ {withdrawAmount}</div>
          <p className="text-xs text-muted-foreground">今日</p>
        </CardContent>
      </Card>
    );
  }

  if (isAdmin && pendingReviewCount > 0) {
    stats.push(
      <Card key="review">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">待審核</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingReviewCount}</div>
          <p className="text-xs text-muted-foreground">筆待審核</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">歡迎回来，{session?.user?.name || session?.user?.email}</h2>
        <p className="text-muted-foreground">
          {userRole === 'ADMIN' && '管理員'}
          {userRole === 'MERCHANT' && '商戶'}
          {userRole === 'AGENT' && '代理商'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats}
      </div>

      {!isAgent && (recentDeposits.length > 0 || recentWithdraws.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>最近代收</CardTitle>
              <CardDescription>
                <Link href="/dashboard/deposits" className="text-primary hover:underline">查看全部</Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDeposits.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚無代收記錄</p>
              ) : (
                <div className="space-y-2">
                  {recentDeposits.map((deposit) => (
                    <div key={deposit.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{deposit.orderNo}</p>
                        <p className="text-xs text-muted-foreground">{deposit.createdAt.toLocaleString('zh-TW')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">NT$ {deposit.amount.toString()}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          deposit.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          deposit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {deposit.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近代付</CardTitle>
              <CardDescription>
                <Link href="/dashboard/withdraws" className="text-primary hover:underline">查看全部</Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentWithdraws.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚無代付記錄</p>
              ) : (
                <div className="space-y-2">
                  {recentWithdraws.map((withdraw) => (
                    <div key={withdraw.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{withdraw.orderNo}</p>
                        <p className="text-xs text-muted-foreground">{withdraw.createdAt.toLocaleString('zh-TW')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">NT$ {withdraw.amount.toString()}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          withdraw.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          withdraw.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {withdraw.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>快速開始</CardTitle>
          <CardDescription>選擇您想要進行的操作</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {isAgent && (
            <Link href="/dashboard/commissions" className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
              <h3 className="font-medium">查看佣金</h3>
              <p className="text-sm text-muted-foreground">檢視代理佣金記錄</p>
            </Link>
          )}
          {isMerchant && (
            <>
              <Link href="/dashboard/deposits/new" className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                <h3 className="font-medium">建立代收</h3>
                <p className="text-sm text-muted-foreground">建立新的代收訂單</p>
              </Link>
              <Link href="/dashboard/withdraws/new" className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                <h3 className="font-medium">建立代付</h3>
                <p className="text-sm text-muted-foreground">發起代付請求</p>
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link href="/dashboard/review" className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                <h3 className="font-medium">待審核</h3>
                <p className="text-sm text-muted-foreground">審核代付請求</p>
              </Link>
              <Link href="/dashboard/commissions" className="p-4 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                <h3 className="font-medium">代理佣金</h3>
                <p className="text-sm text-muted-foreground">檢視佣金記錄</p>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}