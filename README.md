# 支付系統復刻評估文件

基於原有支付系統專案分析

---

## 一、原專案架構概覽

### 1.1 技術棧

| 層面 | 技術 |
|------|------|
| 後端框架 | Laravel 11.x (PHP 8.2+) |
| 前端框架 | Vue 3.4 + Inertia.js |
| UI 組件庫 | Element Plus 2.9 |
| CSS 框架 | Tailwind CSS 3.2 |
| 認證 | Laravel Sanctum |
| 許可權 | Spatie Laravel Permission |
| 資料庫 | MySQL |
| 測試 | Pest PHP |

### 1.2 核心商業邏輯

| 模組 | 說明 |
|------|------|
| **代收 (Deposit)** | 商戶發起收款請求 → 系統分配銀行帳號 → 等待客戶轉帳 → 撮合訂單 |
| **代付 (Withdraw)** | 商戶發起付款請求 → 管理員審核 → 扣款 → 第三方金流代付 |
| **銀行帳號管理** | BankAccount + BankAccountGroup + BAM 監控整合 |
| **撮合系統** | UTR 精確匹配 / 姓名+金額匹配 / 唯一金額匹配 |
| **代理佣金** | 三層級佣金鏈 (Merchant → Agent → Super_Agent) |
| **費率引擎** | FeeGroup + FeeRule，支援 Percentage/Fixed 計費 |
| **Channel 整合** | 多支付通道適配器 (PayPay, HK21Pay, VanPay, ColaPay 等) |
| **風控** | Blacklist 黑名單過濾 |
| **Telegram Bot** | 訂單查詢、餘額查詢、UTR 補單 |

### 1.3 資料模型

```
users (商戶/代理/超級代理)
├── deposits (代收訂單)
├── withdraws (代付訂單)
├── cash_books (現金帳本)
├── cash_records (現金異動)
└── user_channel_configs (商戶通道配置)

bank_accounts (系統銀行帳號)
├── bank_account_groups (帳號分組)
├── bam_hosts (BAM 主機)
└── banks (銀行資料)

channels (支付通道)
├── channel_settings (通道設定)
├── agent_channel_configs (代理通道費率)
└── payments (支付工具)

agent_commissions (代理佣金)
├── agent_commission_snapshots (佣金快照)
└── fee_groups / fee_rules (費率規則)
```

### 1.4 API 端點

| 端點 | 用途 |
|------|------|
| `POST /api/deposit/payment` | 代收請求 |
| `POST /api/withdraw/request` | 代付請求 |
| `GET /api/order/query` | 訂單查詢 |
| `GET /api/balance/query` | 餘額查詢 |
| `POST /api/deposit/{slug}/notify` | 代收回調 |
| `POST /api/withdraw/{slug}/notify` | 代付回調 |

### 1.5 前端頁面規模

| 類別 | 頁面數 |
|------|--------|
| 商戶管理 | 12 |
| Channel 設定 | 9 |
| 系統設定 | 10 |
| 交易查詢 | 8 |
| 代理管理 | 5 |
| 銀行帳號 | 5 |
| **總計** | **~80+ 頁面** |

---

## 二、復刻技術建議

### 2.1 推薦技術棧

| 層面 | 建議技術 | 理由 |
|------|----------|------|
| **框架** | Next.js 14+ (App Router) | AI Coding 生態最成熟，全端一體 |
| **語言** | TypeScript | 型別安全，AI 生成品質高 |
| ** ORM** | Prisma | 型別安全、遷移方便、AI 支援佳 |
| **前端 UI** | shadcn/ui + Tailwind | AI 熟悉、迭代快、開發體驗好 |
| **認證** | NextAuth.js | 支援多種 Provider、易擴展 |
| **狀態管理** | Zustand / React Query | 輕量、型別安全 |
| **資料庫** | PostgreSQL | 推薦，與 Prisma 搭配最佳 |
| **部署** | Vercel | Next.js 官方，一鍵部署 |

### 2.2 專案結構建議

```
/next.js
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 登入、註冊
│   │   ├── (dashboard)/       # 管理後台
│   │   │   ├── merchants/      # 商戶管理
│   │   │   ├── agents/        # 代理管理
│   │   │   ├── channels/      # 通道設定
│   │   │   ├── bank-accounts/  # 銀行帳號
│   │   │   ├── deposits/      # 代收訂單
│   │   │   ├── withdraws/     # 代付訂單
│   │   │   ├── commissions/   # 佣金管理
│   │   │   ├── reports/       # 報表
│   │   │   └── settings/      # 系統設定
│   │   └── api/               # API Routes
│   │       ├── deposit/
│   │       ├── withdraw/
│   │       ├── callback/       # 第三方回調
│   │       └── bam/           # BAM 通訊
│   ├── components/
│   │   ├── ui/                # shadcn/ui 元件
│   │   ├── forms/             # 表單元件
│   │   ├── tables/            # 表格元件
│   │   └── layout/            # 佈局元件
│   ├── lib/
│   │   ├── db/                # Prisma Client
│   │   ├── services/          # 商業邏輯
│   │   │   ├── deposit/       # 代收邏輯
│   │   │   ├── withdraw/      # 代付邏輯
│   │   │   ├── bank-account/  # 銀行帳號
│   │   │   ├── commission/    # 佣金計算
│   │   │   └── channel/       # 通道整合
│   │   ├── matching/          # 撮合引擎
│   │   └── signature/         # 簽名驗證
│   └── types/                 # TypeScript 類型
├── prisma/
│   └── schema.prisma          # 資料模型
└── tests/
```

---

## 三、開發時程評估

### Phase 1: 核心支付系統（預估 4-6 週）

| 任務 | 工期 | 優先度 |
|------|------|--------|
| 專案架構初始化 (Next.js + Prisma) | 1 天 | P0 |
| 用戶/商戶 CRUD + 認證系統 | 2 天 | P0 |
| Deposit 代收流程 + API | 3 天 | P0 |
| Withdraw 代付流程 + API | 3 天 | P0 |
| CashBook 資金系統 | 2 天 | P0 |
| BankAccount 管理 + 選擇策略 | 2 天 | P1 |
| Order Matching 撮合系統 | 3 天 | P0 |
| Channel 整合框架 + 1 個通道 | 2 天 | P1 |

### Phase 2: 代理與佣金（預估 2-3 週）

| 任務 | 工期 |
|------|------|
| 代理多層級結構 | 2 天 |
| FeeGroup + FeeRule 引擎 | 2 天 |
| 佣金計算 + 快照機制 | 3 天 |
| 佣金結算流程 | 2 天 |

### Phase 3: 風控與增值（預估 2-3 週）

| 任務 | 工期 |
|------|------|
| Blacklist 黑名單系統 | 2 天 |
| BAM 整合 (WebSocket) | 3 天 |
| Telegram Bot | 2 天 |
| 基礎報表 | 2 天 |

**總工期估算：8-12 週（單人開發）**

---

## 四、風險與潛在問題

### 4.1 高風險

| 風險 | 說明 | 緩解方案 |
|------|------|----------|
| **撮合邏輯複雜度** | 金額容差、時間窗口、多策略優先級 | 先實作 Reference 匹配，後期再擴展 |
| **狀態機管理** | Deposit/Withdraw 狀態轉換多、易漏 | 使用 XState 或簡單的 State Machine 套件 |
| **資金安全** | 餘額扣款、佣金計算錯誤會導致資金損失 | 大量單元測試、Integration Test、資料庫 Transaction |
| **第三方通道整合** | 各通道 API 差異大、回應格式不同 | 統一抽象 Handler 介面 |

### 4.2 中風險

| 風險 | 說明 | 緩解方案 |
|------|------|----------|
| **BAM 即時監控** | WebSocket 長連接、需要重連機制 | 使用 BullMQ 處理隊列、降級方案 |
| **高併發訂單** | 大量同時請求時的撮合衝突 | 資料庫鎖、Redis 分散式鎖 |
| **簽名驗證** | 各通道簽名演算法不同 | 策略模式封裝各通道 Signature Handler |

### 4.3 低風險

| 風險 | 說明 |
|------|------|
| **前端頁面數量多** | ~80 頁面，但多是 CRUD，可快速生成 |
| **多語系** | Next.js i18n 支援完善 |
| **Excel 匯入匯出** | 使用 xlsx 套件 |

---

## 五、Phase 1 具體建構步驟

### Step 1: 初始化

```bash
npx create-next-app@latest next.js --typescript --tailwind --app
npm install prisma @prisma/client zustand @tanstack/react-query
npm install -D prisma
npx prisma init
```

### Step 2: 資料庫遷移

從原有 Laravel Migrations 轉換為 Prisma Schema，重點表：

- User (商戶/代理)
- Deposit / Withdraw
- CashBook / CashRecord
- BankAccount / Bank
- Channel / ChannelSetting
- FeeGroup / FeeRule
- AgentCommission

### Step 3: API 實作順序

1. `POST /api/auth/login` - 商戶登入
2. `POST /api/deposit/payment` - 代收建單
3. `GET /api/deposit/{id}` - 查詢代收狀態
4. `POST /api/withdraw/request` - 代付建單
5. `GET /api/withdraw/{id}` - 查詢代付狀態
6. `POST /api/callback/deposit/{slug}` - 回調處理
7. `POST /api/callback/withdraw/{slug}` - 回調處理

### Step 4: 撮合系統實作

```typescript
// lib/matching/strategies.ts
type MatchingStrategy = 'reference' | 'real_name' | 'unique_amount';

async function matchOrder(deposit: Deposit, transaction: BankTransaction) {
  // 1. Reference 匹配 (UTR)
  if (transaction.reference === deposit.payment_reference) {
    return matchSuccess(deposit, transaction);
  }

  // 2. Real Name + 金額容差
  if (matchRealName(deposit, transaction)) {
    return matchSuccess(deposit, transaction);
  }

  // 3. 唯一金額匹配
  if (deposit.amount === transaction.amount) {
    return matchSuccess(deposit, transaction);
  }

  return matchFailed(deposit, transaction);
}
```

---

## 六、AI Coding 開發建議

### 6.1 Prompt 模板

```
建立一個 [功能名稱] 頁面，包含：
1. 列表頁面（分頁、篩選）
2. 新增/編輯表單（驗證）
3. 對應的 API Routes
4. 使用 shadcn/ui 元件
5. TypeScript 型別定義
```

### 6.2 測試策略

```typescript
// 使用 Vitest + React Testing Library
// 商業邏輯使用 Jest + Prisma Test Instance
```

### 6.3 每天迭代目標

- 早上：讓 AI 生成當日任務代碼
- 下午：人工 Review + 測試
- 晚上：部署到 Vercel Preview 驗證

---

*文件建立日期：2026-05-21*
