# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

支付系統復刻專案，基於原 Laravel + Vue 專案評估後的 Next.js 重構方案。

## 技術棧

- **框架**: Next.js 16 (App Router)
- **語言**: TypeScript
- **ORM**: Prisma (PostgreSQL)
- **前端 UI**: shadcn/ui + Tailwind CSS
- **認證**: NextAuth.js
- **狀態管理**: Zustand / React Query
- **測試**: Vitest + @testing-library/react

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
npm run test        # 執行所有測試
npm run test:watch  # watch 模式（檔案異動自動重跑）
npx vitest run src/lib/xxx.ts  # 測試特定檔案
```

## 專案結構 (App Router)

```
next-js/
├── app/                      # App Router
│   ├── layout.tsx           # 根佈局
│   ├── page.tsx             # 首頁
│   ├── globals.css          # 全域樣式
│   └── favicon.ico
├── public/                  # 靜態資源
├── prisma/                  # 待建立：Prisma Schema
└── src/                     # 待建立：非 App Router 程式碼
    ├── lib/                 # 工具函式、服務
    ├── components/          # 元件
    └── types/               # TypeScript 類型
```

## 核心商業邏輯模組

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

## API 端點

| 端點 | 用途 |
|------|------|
| `POST /api/deposit/payment` | 代收請求 |
| `POST /api/withdraw/request` | 代付請求 |
| `GET /api/order/query` | 訂單查詢 |
| `GET /api/balance/query` | 餘額查詢 |
| `POST /api/deposit/{slug}/notify` | 代收回調 |
| `POST /api/withdraw/{slug}/notify` | 代付回調 |

## 資料模型

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

## 建構順序

1. 安裝 shadcn/ui + Prisma + NextAuth.js
2. 建立 Prisma Schema（遷移自原 Laravel Migrations）
3. 實作認證層
4. 建立商業邏輯模組
5. 串接支付通道