-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MERCHANT', 'AGENT', 'SUPER_AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'MATCHING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CashBookType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'COMMISSION', 'ADJUSTMENT', 'FREEZE', 'UNFREEZE');

-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'BOTH');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "BlacklistType" AS ENUM ('ID_CARD', 'BANK_ACCOUNT', 'PHONE', 'IP', 'DEVICE_ID');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MERCHANT',
    "parentId" TEXT,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "frozenBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "users" IS '用戶表 - 商戶、代理、超級代理、管理員共享';
COMMENT ON COLUMN "users"."id" IS '使用者唯一識別碼 (CUID)';
COMMENT ON COLUMN "users"."email" IS '登入電子郵件（不可重複）';
COMMENT ON COLUMN "users"."password" IS '密碼（bcrypt 雜湊後儲存）';
COMMENT ON COLUMN "users"."name" IS '顯示名稱';
COMMENT ON COLUMN "users"."role" IS '身份角色：MERCHANT=商戶, AGENT=代理商, SUPER_AGENT=超級代理商, ADMIN=管理員';
COMMENT ON COLUMN "users"."parentId" IS '上層代理商 ID（用於代理階層鏈）';
COMMENT ON COLUMN "users"."balance" IS '可用餘額';
COMMENT ON COLUMN "users"."frozenBalance" IS '凍結餘額（提領中、風控凍結等）';
COMMENT ON COLUMN "users"."createdAt" IS '建立時間';
COMMENT ON COLUMN "users"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountId" TEXT,
    "channelId" TEXT,
    "callbackUrl" TEXT,
    "callbackStatus" TEXT,
    "utr" TEXT,
    "payerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "matchedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "deposits" IS '代收訂單表';
COMMENT ON COLUMN "deposits"."id" IS '代收唯一識別碼';
COMMENT ON COLUMN "deposits"."orderNo" IS '訂單編號（系統產生，確保唯一）';
COMMENT ON COLUMN "deposits"."merchantId" IS '所屬商戶 ID';
COMMENT ON COLUMN "deposits"."amount" IS '收款金額';
COMMENT ON COLUMN "deposits"."currency" IS '幣別（預設 TWD 新台幣）';
COMMENT ON COLUMN "deposits"."status" IS '狀態：PENDING=待匹配, MATCHING=匹配中, COMPLETED=已完成, FAILED=失敗, CANCELLED=已取消';
COMMENT ON COLUMN "deposits"."bankAccountId" IS '分配的銀行帳號 ID';
COMMENT ON COLUMN "deposits"."channelId" IS '支付通道 ID';
COMMENT ON COLUMN "deposits"."callbackUrl" IS '商戶回調 URL（交易完成後通知）';
COMMENT ON COLUMN "deposits"."callbackStatus" IS '回調結果狀態（JSON 格式）';
COMMENT ON COLUMN "deposits"."utr" IS 'UTR (Unique Transaction Reference) - 銀行轉帳交易序號';
COMMENT ON COLUMN "deposits"."payerName" IS '匯款人姓名';
COMMENT ON COLUMN "deposits"."matchedAt" IS '匹配時間';
COMMENT ON COLUMN "deposits"."completedAt" IS '完成時間';
COMMENT ON COLUMN "deposits"."createdAt" IS '建立時間';
COMMENT ON COLUMN "deposits"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "withdraws" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "status" "WithdrawStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountId" TEXT,
    "channelId" TEXT,
    "callbackUrl" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "accountName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "withdraws_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "withdraws" IS '代付訂單表';
COMMENT ON COLUMN "withdraws"."id" IS '代付唯一識別碼';
COMMENT ON COLUMN "withdraws"."orderNo" IS '訂單編號';
COMMENT ON COLUMN "withdraws"."merchantId" IS '所屬商戶 ID';
COMMENT ON COLUMN "withdraws"."amount" IS '提領金額';
COMMENT ON COLUMN "withdraws"."currency" IS '幣別';
COMMENT ON COLUMN "withdraws"."status" IS '狀態：PENDING_REVIEW=待審核, APPROVED=已核准, REJECTED=已駁回, PROCESSING=處理中, COMPLETED=已完成, FAILED=失敗';
COMMENT ON COLUMN "withdraws"."bankAccountId" IS '目標銀行帳號 ID';
COMMENT ON COLUMN "withdraws"."channelId" IS '支付通道 ID';
COMMENT ON COLUMN "withdraws"."callbackUrl" IS '商戶回調 URL';
COMMENT ON COLUMN "withdraws"."bankName" IS '銀行名稱';
COMMENT ON COLUMN "withdraws"."bankAccount" IS '銀行帳號';
COMMENT ON COLUMN "withdraws"."accountName" IS '帳戶名稱';
COMMENT ON COLUMN "withdraws"."reviewedAt" IS '審核時間';
COMMENT ON COLUMN "withdraws"."reviewedBy" IS '審核人 ID';
COMMENT ON COLUMN "withdraws"."completedAt" IS '完成時間';
COMMENT ON COLUMN "withdraws"."createdAt" IS '建立時間';
COMMENT ON COLUMN "withdraws"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "cash_books" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CashBookType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "balanceBefore" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "refType" TEXT,
    "refId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_books_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "cash_books" IS '現金帳本 - 記錄用戶餘額變動的流水帳';
COMMENT ON COLUMN "cash_books"."id" IS '流水唯一識別碼';
COMMENT ON COLUMN "cash_books"."userId" IS '所屬用戶 ID';
COMMENT ON COLUMN "cash_books"."type" IS '類型：DEPOSIT=存款, WITHDRAW=提款, COMMISSION=佣金, ADJUSTMENT=調整, FREEZE=凍結, UNFREEZE=解凍';
COMMENT ON COLUMN "cash_books"."amount" IS '變動金額';
COMMENT ON COLUMN "cash_books"."balanceBefore" IS '變動前餘額';
COMMENT ON COLUMN "cash_books"."balanceAfter" IS '變動後餘額';
COMMENT ON COLUMN "cash_books"."refType" IS '關聯類型（例：deposit, withdraw）';
COMMENT ON COLUMN "cash_books"."refId" IS '關聯 ID';
COMMENT ON COLUMN "cash_books"."note" IS '備註';
COMMENT ON COLUMN "cash_books"."createdAt" IS '建立時間';

-- CreateTable
CREATE TABLE "cash_records" (
    "id" TEXT NOT NULL,
    "cashBookId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_records_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "cash_records" IS '現金記錄明細';
COMMENT ON COLUMN "cash_records"."id" IS '記錄唯一識別碼';
COMMENT ON COLUMN "cash_records"."cashBookId" IS '所屬帳本 ID';
COMMENT ON COLUMN "cash_records"."type" IS '類型';
COMMENT ON COLUMN "cash_records"."amount" IS '金額';
COMMENT ON COLUMN "cash_records"."createdAt" IS '建立時間';

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "accountNo" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankId" TEXT NOT NULL,
    "groupId" TEXT,
    "bamHostId" TEXT,
    "status" "BankAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isAllocated" BOOLEAN NOT NULL DEFAULT false,
    "allocatedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "bank_accounts" IS '系統銀行帳號';
COMMENT ON COLUMN "bank_accounts"."id" IS '帳號唯一識別碼';
COMMENT ON COLUMN "bank_accounts"."accountNo" IS '銀行帳號';
COMMENT ON COLUMN "bank_accounts"."accountName" IS '帳戶名稱';
COMMENT ON COLUMN "bank_accounts"."bankId" IS '銀行 ID';
COMMENT ON COLUMN "bank_accounts"."groupId" IS '所屬帳號群組 ID';
COMMENT ON COLUMN "bank_accounts"."bamHostId" IS '監控主機 ID';
COMMENT ON COLUMN "bank_accounts"."status" IS '狀態：ACTIVE=可用, INACTIVE=停用, SUSPENDED=凍結';
COMMENT ON COLUMN "bank_accounts"."isAllocated" IS '是否已分配給商戶';
COMMENT ON COLUMN "bank_accounts"."allocatedTo" IS '分配給的商戶 ID';
COMMENT ON COLUMN "bank_accounts"."createdAt" IS '建立時間';
COMMENT ON COLUMN "bank_accounts"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "bank_account_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_account_groups_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "bank_account_groups" IS '銀行帳號分組';
COMMENT ON COLUMN "bank_account_groups"."id" IS '群組唯一識別碼';
COMMENT ON COLUMN "bank_account_groups"."name" IS '群組名稱';
COMMENT ON COLUMN "bank_account_groups"."description" IS '群組描述';
COMMENT ON COLUMN "bank_account_groups"."createdAt" IS '建立時間';

-- CreateTable
CREATE TABLE "bam_hosts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8080,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bam_hosts_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "bam_hosts" IS '帳號監控主機';
COMMENT ON COLUMN "bam_hosts"."id" IS '主機唯一識別碼';
COMMENT ON COLUMN "bam_hosts"."name" IS '主機名稱';
COMMENT ON COLUMN "bam_hosts"."host" IS '主機位址';
COMMENT ON COLUMN "bam_hosts"."port" IS '連接埠';
COMMENT ON COLUMN "bam_hosts"."status" IS '狀態';
COMMENT ON COLUMN "bam_hosts"."createdAt" IS '建立時間';

-- CreateTable
CREATE TABLE "banks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "banks" IS '銀行資料表';
COMMENT ON COLUMN "banks"."id" IS '銀行唯一識別碼';
COMMENT ON COLUMN "banks"."code" IS '銀行代碼';
COMMENT ON COLUMN "banks"."name" IS '銀行名稱';
COMMENT ON COLUMN "banks"."createdAt" IS '建立時間';

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "channels" IS '支付通道';
COMMENT ON COLUMN "channels"."id" IS '通道唯一識別碼';
COMMENT ON COLUMN "channels"."code" IS '通道代碼（如：paypay, hk21pay, vanpay, colapay）';
COMMENT ON COLUMN "channels"."name" IS '通道名稱';
COMMENT ON COLUMN "channels"."type" IS '類型：DEPOSIT=代收, WITHDRAW=代付, BOTH=兩者皆可';
COMMENT ON COLUMN "channels"."status" IS '狀態';
COMMENT ON COLUMN "channels"."settings" IS '額外設定（JSON 格式）';
COMMENT ON COLUMN "channels"."createdAt" IS '建立時間';
COMMENT ON COLUMN "channels"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "channel_settings" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_settings_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "channel_settings" IS '通道設定';
COMMENT ON COLUMN "channel_settings"."id" IS '設定唯一識別碼';
COMMENT ON COLUMN "channel_settings"."channelId" IS '通道 ID';
COMMENT ON COLUMN "channel_settings"."key" IS '設定鍵';
COMMENT ON COLUMN "channel_settings"."value" IS '設定值';
COMMENT ON COLUMN "channel_settings"."createdAt" IS '建立時間';
COMMENT ON COLUMN "channel_settings"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "agent_channel_configs" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "feeGroupId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_channel_configs_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "agent_channel_configs" IS '代理商通道費率設定';
COMMENT ON COLUMN "agent_channel_configs"."id" IS '設定唯一識別碼';
COMMENT ON COLUMN "agent_channel_configs"."agentId" IS '代理商 ID';
COMMENT ON COLUMN "agent_channel_configs"."channelId" IS '通道 ID';
COMMENT ON COLUMN "agent_channel_configs"."feeGroupId" IS '費率群組 ID';
COMMENT ON COLUMN "agent_channel_configs"."status" IS '狀態';
COMMENT ON COLUMN "agent_channel_configs"."createdAt" IS '建立時間';
COMMENT ON COLUMN "agent_channel_configs"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "user_channel_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "feeGroupId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_channel_configs_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "user_channel_configs" IS '用戶通道設定';
COMMENT ON COLUMN "user_channel_configs"."id" IS '設定唯一識別碼';
COMMENT ON COLUMN "user_channel_configs"."userId" IS '用戶 ID';
COMMENT ON COLUMN "user_channel_configs"."channelId" IS '通道 ID';
COMMENT ON COLUMN "user_channel_configs"."feeGroupId" IS '費率群組 ID';
COMMENT ON COLUMN "user_channel_configs"."status" IS '狀態';
COMMENT ON COLUMN "user_channel_configs"."createdAt" IS '建立時間';
COMMENT ON COLUMN "user_channel_configs"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "config" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "payments" IS '支付工具';
COMMENT ON COLUMN "payments"."id" IS '支付工具唯一識別碼';
COMMENT ON COLUMN "payments"."channelId" IS '通道 ID';
COMMENT ON COLUMN "payments"."name" IS '支付工具名稱';
COMMENT ON COLUMN "payments"."code" IS '支付工具代碼';
COMMENT ON COLUMN "payments"."config" IS '設定（JSON 格式）';
COMMENT ON COLUMN "payments"."status" IS '狀態';
COMMENT ON COLUMN "payments"."createdAt" IS '建立時間';
COMMENT ON COLUMN "payments"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "fee_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_groups_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "fee_groups" IS '費率群組';
COMMENT ON COLUMN "fee_groups"."id" IS '費率群組唯一識別碼';
COMMENT ON COLUMN "fee_groups"."name" IS '費率群組名稱';
COMMENT ON COLUMN "fee_groups"."description" IS '費率群組描述';
COMMENT ON COLUMN "fee_groups"."createdAt" IS '建立時間';
COMMENT ON COLUMN "fee_groups"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "fee_rules" (
    "id" TEXT NOT NULL,
    "feeGroupId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "type" "FeeType" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "minAmount" DECIMAL(65,30),
    "maxAmount" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'active',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_rules_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "fee_rules" IS '費率規則';
COMMENT ON COLUMN "fee_rules"."id" IS '費率規則唯一識別碼';
COMMENT ON COLUMN "fee_rules"."feeGroupId" IS '所屬費率群組 ID';
COMMENT ON COLUMN "fee_rules"."channelId" IS '適用通道 ID';
COMMENT ON COLUMN "fee_rules"."type" IS '類型：PERCENTAGE=百分比, FIXED=固定金額';
COMMENT ON COLUMN "fee_rules"."value" IS '費率值';
COMMENT ON COLUMN "fee_rules"."minAmount" IS '最低金額門檻';
COMMENT ON COLUMN "fee_rules"."maxAmount" IS '最高金額上限';
COMMENT ON COLUMN "fee_rules"."priority" IS '優先級（數字越大越優先）';
COMMENT ON COLUMN "fee_rules"."createdAt" IS '建立時間';
COMMENT ON COLUMN "fee_rules"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "agent_commissions" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "depositId" TEXT,
    "withdrawId" TEXT,
    "level" INTEGER NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "feeGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "agent_commissions_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "agent_commissions" IS '代理佣金';
COMMENT ON COLUMN "agent_commissions"."id" IS '佣金唯一識別碼';
COMMENT ON COLUMN "agent_commissions"."agentId" IS '代理商 ID';
COMMENT ON COLUMN "agent_commissions"."depositId" IS '關聯代收 ID';
COMMENT ON COLUMN "agent_commissions"."withdrawId" IS '關聯代付 ID';
COMMENT ON COLUMN "agent_commissions"."level" IS '佣金的層級（1, 2, 3）';
COMMENT ON COLUMN "agent_commissions"."rate" IS '費率';
COMMENT ON COLUMN "agent_commissions"."amount" IS '佣金金額';
COMMENT ON COLUMN "agent_commissions"."status" IS '狀態';
COMMENT ON COLUMN "agent_commissions"."feeGroupId" IS '費率群組 ID';
COMMENT ON COLUMN "agent_commissions"."createdAt" IS '建立時間';
COMMENT ON COLUMN "agent_commissions"."settledAt" IS '結算時間';

-- CreateTable
CREATE TABLE "agent_commission_snapshots" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "settled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_commission_snapshots_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "agent_commission_snapshots" IS '代理佣金月度結算快照';
COMMENT ON COLUMN "agent_commission_snapshots"."id" IS '快照唯一識別碼';
COMMENT ON COLUMN "agent_commission_snapshots"."agentId" IS '代理商 ID';
COMMENT ON COLUMN "agent_commission_snapshots"."period" IS '結算週期（YYYY-MM）';
COMMENT ON COLUMN "agent_commission_snapshots"."totalAmount" IS '總佣金金額';
COMMENT ON COLUMN "agent_commission_snapshots"."settled" IS '是否已結算';
COMMENT ON COLUMN "agent_commission_snapshots"."createdAt" IS '建立時間';
COMMENT ON COLUMN "agent_commission_snapshots"."updatedAt" IS '最後更新時間';

-- CreateTable
CREATE TABLE "blacklists" (
    "id" TEXT NOT NULL,
    "type" "BlacklistType" NOT NULL,
    "value" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "blacklists_pkey" PRIMARY KEY ("id")
);
COMMENT ON TABLE "blacklists" IS '黑名單';
COMMENT ON COLUMN "blacklists"."id" IS '黑名單唯一識別碼';
COMMENT ON COLUMN "blacklists"."type" IS '類型：ID_CARD=身份證, BANK_ACCOUNT=銀行帳號, PHONE=手機, IP=IP 地址, DEVICE_ID=設備 ID';
COMMENT ON COLUMN "blacklists"."value" IS '具體值';
COMMENT ON COLUMN "blacklists"."reason" IS '加入原因';
COMMENT ON COLUMN "blacklists"."createdAt" IS '建立時間';
COMMENT ON COLUMN "blacklists"."createdBy" IS '加入操作者 ID';

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_orderNo_key" ON "deposits"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "withdraws_orderNo_key" ON "withdraws"("orderNo");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_accountNo_key" ON "bank_accounts"("accountNo");

-- CreateIndex
CREATE UNIQUE INDEX "banks_code_key" ON "banks"("code");

-- CreateIndex
CREATE UNIQUE INDEX "channels_code_key" ON "channels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "channel_settings_channelId_key_key" ON "channel_settings"("channelId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "agent_channel_configs_agentId_channelId_key" ON "agent_channel_configs"("agentId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "user_channel_configs_userId_channelId_key" ON "user_channel_configs"("userId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_commission_snapshots_agentId_period_key" ON "agent_commission_snapshots"("agentId", "period");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraws" ADD CONSTRAINT "withdraws_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdraws" ADD CONSTRAINT "withdraws_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_books" ADD CONSTRAINT "cash_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_records" ADD CONSTRAINT "cash_records_cashBookId_fkey" FOREIGN KEY ("cashBookId") REFERENCES "cash_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "bank_account_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_bamHostId_fkey" FOREIGN KEY ("bamHostId") REFERENCES "bam_hosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_settings" ADD CONSTRAINT "channel_settings_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_channel_configs" ADD CONSTRAINT "agent_channel_configs_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_channel_configs" ADD CONSTRAINT "agent_channel_configs_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "fee_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_channel_configs" ADD CONSTRAINT "user_channel_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_channel_configs" ADD CONSTRAINT "user_channel_configs_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "fee_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_rules" ADD CONSTRAINT "fee_rules_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "fee_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_commissions" ADD CONSTRAINT "agent_commissions_feeGroupId_fkey" FOREIGN KEY ("feeGroupId") REFERENCES "fee_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;