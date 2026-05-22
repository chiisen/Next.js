import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '系統管理員',
      role: 'ADMIN',
    },
  });

  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@example.com' },
    update: {},
    create: {
      email: 'merchant@example.com',
      password: hashedPassword,
      name: '測試商戶',
      role: 'MERCHANT',
      balance: 100000,
    },
  });

  // Create agent
  const agent = await prisma.user.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      password: hashedPassword,
      name: '代理商A',
      role: 'AGENT',
      balance: 50000,
    },
  });

  // Create banks
  const bank1 = await prisma.bank.upsert({
    where: { code: '001' },
    update: {},
    create: { code: '001', name: '中央銀行' },
  });

  const bank2 = await prisma.bank.upsert({
    where: { code: '002' },
    update: {},
    create: { code: '002', name: '合作金庫' },
  });

  // Create bank accounts
  const ba1 = await prisma.bankAccount.upsert({
    where: { accountNo: '1234567890' },
    update: {},
    create: {
      accountNo: '1234567890',
      accountName: '測試帳號001',
      bankId: bank1.id,
      status: 'ACTIVE',
      isAllocated: false,
    },
  });

  const ba2 = await prisma.bankAccount.upsert({
    where: { accountNo: '0987654321' },
    update: {},
    create: {
      accountNo: '0987654321',
      accountName: '測試帳號002',
      bankId: bank2.id,
      status: 'ACTIVE',
      isAllocated: true,
      allocatedTo: merchant.id,
    },
  });

  // Create channels
  const channel1 = await prisma.channel.upsert({
    where: { code: 'paypay' },
    update: {},
    create: {
      code: 'paypay',
      name: 'PayPay',
      type: 'BOTH',
      status: 'active',
    },
  });

  const channel2 = await prisma.channel.upsert({
    where: { code: 'hk21pay' },
    update: {},
    create: {
      code: 'hk21pay',
      name: 'HK21Pay',
      type: 'DEPOSIT',
      status: 'active',
    },
  });

  // Create deposits
  const deposit1 = await prisma.deposit.create({
    data: {
      orderNo: 'DEP' + Date.now() + '001',
      merchantId: merchant.id,
      amount: 5000,
      currency: 'TWD',
      status: 'COMPLETED',
      channelId: channel1.id,
      bankAccountId: ba1.id,
      utr: 'UTR' + Date.now(),
      payerName: '王小明',
      callbackUrl: 'https://example.com/callback',
      completedAt: new Date(),
    },
  });

  const deposit2 = await prisma.deposit.create({
    data: {
      orderNo: 'DEP' + Date.now() + '002',
      merchantId: merchant.id,
      amount: 3000,
      currency: 'TWD',
      status: 'PENDING',
      channelId: channel2.id,
      bankAccountId: ba2.id,
      payerName: '李小華',
    },
  });

  const deposit3 = await prisma.deposit.create({
    data: {
      orderNo: 'DEP' + Date.now() + '003',
      merchantId: merchant.id,
      amount: 8000,
      currency: 'TWD',
      status: 'MATCHING',
      channelId: channel1.id,
      payerName: '陳大同',
    },
  });

  // Create withdraws
  const withdraw1 = await prisma.withdraw.create({
    data: {
      orderNo: 'WDR' + Date.now() + '001',
      merchantId: merchant.id,
      amount: 2000,
      currency: 'TWD',
      status: 'COMPLETED',
      channelId: channel1.id,
      bankName: '合作金庫',
      bankAccount: '1234567890',
      accountName: '王小明',
      completedAt: new Date(),
    },
  });

  const withdraw2 = await prisma.withdraw.create({
    data: {
      orderNo: 'WDR' + Date.now() + '002',
      merchantId: merchant.id,
      amount: 5000,
      currency: 'TWD',
      status: 'PENDING_REVIEW',
      channelId: channel1.id,
      bankName: '中央銀行',
      bankAccount: '0987654321',
      accountName: '李小華',
    },
  });

  const withdraw3 = await prisma.withdraw.create({
    data: {
      orderNo: 'WDR' + Date.now() + '003',
      merchantId: merchant.id,
      amount: 1500,
      currency: 'TWD',
      status: 'APPROVED',
      channelId: channel1.id,
      bankName: '合作金庫',
      bankAccount: '5555555555',
      accountName: '陳大同',
      reviewedAt: new Date(),
      reviewedBy: admin.id,
    },
  });

  // Create cash books
  await prisma.cashBook.create({
    data: {
      userId: merchant.id,
      type: 'DEPOSIT',
      amount: 5000,
      balanceBefore: 95000,
      balanceAfter: 100000,
      refType: 'deposit',
      refId: deposit1.id,
      note: '代收完成入帳',
    },
  });

  await prisma.cashBook.create({
    data: {
      userId: merchant.id,
      type: 'WITHDRAW',
      amount: -2000,
      balanceBefore: 97000,
      balanceAfter: 95000,
      refType: 'withdraw',
      refId: withdraw1.id,
      note: '代付扣款',
    },
  });

  // Create blacklist
  await prisma.blacklist.create({
    data: {
      type: 'BANK_ACCOUNT',
      value: '9876543210',
      reason: '涉嫌洗錢',
      createdBy: admin.id,
    },
  });

  await prisma.blacklist.create({
    data: {
      type: 'PHONE',
      value: '0912345678',
      reason: '多重帳號風險',
      createdBy: admin.id,
    },
  });

  // Create fee group and rules
  const feeGroup = await prisma.feeGroup.create({
    data: {
      name: '一般費率',
      description: '一般商戶適用的費率',
    },
  });

  await prisma.feeRule.createMany({
    data: [
      {
        feeGroupId: feeGroup.id,
        channelId: channel1.id,
        type: 'PERCENTAGE',
        value: 2.5,
        minAmount: 0,
        maxAmount: 100000,
        priority: 1,
        status: 'active',
      },
      {
        feeGroupId: feeGroup.id,
        channelId: channel2.id,
        type: 'FIXED',
        value: 30,
        minAmount: 0,
        maxAmount: 50000,
        priority: 1,
        status: 'active',
      },
    ],
  });

  // Create agent commissions
  await prisma.agentCommission.createMany({
    data: [
      {
        agentId: agent.id,
        depositId: deposit1.id,
        level: 1,
        rate: 0.5,
        amount: 25,
        status: 'settled',
        feeGroupId: feeGroup.id,
        settledAt: new Date(),
      },
      {
        agentId: agent.id,
        depositId: deposit2.id,
        level: 1,
        rate: 0.5,
        amount: 15,
        status: 'pending',
        feeGroupId: feeGroup.id,
      },
      {
        agentId: agent.id,
        withdrawId: withdraw1.id,
        level: 2,
        rate: 0.3,
        amount: 6,
        status: 'settled',
        feeGroupId: feeGroup.id,
        settledAt: new Date(),
      },
    ],
  });

  console.log('=== 測試資料建立完成 ===');
  console.log('');
  console.log('測試用戶：');
  console.log('  Admin:    admin@example.com / password123');
  console.log('  Merchant: merchant@example.com / password123');
  console.log('  Agent:    agent@example.com / password123');
  console.log('');
  console.log('代收訂單：', 3, '筆');
  console.log('代付訂單：', 3, '筆');
  console.log('銀行帳號：', 2, '筆');
  console.log('黑名單：', 2, '筆');
  console.log('費率規則：', 2, '筆');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });