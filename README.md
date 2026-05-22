# 支付系統

基於 Next.js 16 + TypeScript 的支付系統重構專案。

## 技術棧

| 層面 | 技術 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 語言 | TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| ORM | Prisma (PostgreSQL) |
| 認證 | NextAuth.js |
| 狀態管理 | Zustand / React Query |
| 測試 | Vitest + @testing-library/react |

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env`，並填入資料庫連線資訊：

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="your-secret-key-change-in-production"
AUTH_TRUST_HOST=true
```

### 3. 初始化資料庫

```bash
# 執行資料庫遷移（建立資料表）
npx prisma migrate deploy

# 或重置資料庫（會刪除所有資料）
npx prisma migrate reset --force
```

### 4. 建立測試資料

```bash
# 執行 seeder 建立測試用戶與假資料
npx tsx prisma/seed.ts
```

執行成功後會顯示：

```
=== 測試資料建立完成 ===

測試用戶：
  Admin:    admin@example.com / password123
  Merchant: merchant@example.com / password123
  Agent:    agent@example.com / password123

代收訂單： 3 筆
代付訂單： 3 筆
銀行帳號： 2 筆
黑名單： 2 筆
費率規則： 2 筆
```

### 5. 啟動開發伺服器

```bash
npm run dev
```

### 6. 開啟瀏覽器測試

| 角色 | 帳號 | 密碼 | 測試頁面 |
|------|------|------|----------|
| 管理員 | admin@example.com | password123 | `/dashboard` - 可查看所有代收/代付/待審核/佣金/銀行帳號/黑名單 |
| 商戶 | merchant@example.com | password123 | `/dashboard` - 可建立代收/代付、查詢餘額 |
| 代理商 | agent@example.com | password123 | `/dashboard` - 可查看代理佣金、餘額查詢 |

## 測試流程

### 登入測試

1. 開啟 http://localhost:3000/login
2. 輸入任一測試帳號密碼
3. 登入後進入儀表板

### 管理員功能測試

1. 用 `admin@example.com` 登入
2. 訪問 `/dashboard/deposits` - 查看所有代收訂單
3. 訪問 `/dashboard/withdraws` - 查看所有代付訂單
4. 訪問 `/dashboard/review` - 查看待審核的代付
5. 訪問 `/dashboard/commissions` - 查看所有代理佣金
6. 訪問 `/dashboard/bank-accounts` - 查看系統銀行帳號
7. 訪問 `/dashboard/blacklist` - 查看黑名單

### 商戶功能測試

1. 用 `merchant@example.com` 登入
2. 訪問 `/dashboard/deposits/new` - 建立新代收
3. 訪問 `/dashboard/withdraws/new` - 建立新代付
4. 訪問 `/dashboard/balance` - 查看餘額與交易記錄

### 代理商功能測試

1. 用 `agent@example.com` 登入
2. 訪問 `/dashboard/commissions` - 查看自己的佣金記錄
3. 訪問 `/dashboard/balance` - 查看帳戶餘額

## 開發指令

```bash
# 安裝依賴
npm install

# 開發伺服器
npm run dev

# 建置
npm run build

# Lint
npm run lint

# 測試
npm run test
```

## 文件

- [Vitest 測試指南](./docs/vitest-guide.md) - 單元測試使用說明與注意事項
- [資料模型](./docs/data-model.md) - 資料庫結構說明
- [API 端點](./docs/api-endpoints.md) - API 文件

---

*專案建立日期：2026-05-21*
*最後更新：2026-05-23*