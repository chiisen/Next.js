# 資料模型

## 用戶體系 (users)

商戶、代理、超級代理、管理員共享同一張用戶表，以 `role` 欄位區分身份。

```
users (用戶)
├── deposits (代收訂單)
├── withdraws (代付訂單)
├── cash_books (現金帳本)
└── user_channel_configs (商戶通道配置)
```

### 角色說明

| 角色 | 代碼 | 說明 |
|------|------|------|
| 商戶 | MERCHANT | 發起代收代付的商家 |
| 代理 | AGENT | 招募商戶並收取佣金的代理商 |
| 超級代理 | SUPER_AGENT | 招募代理商的上級 |
| 管理員 | ADMIN | 系統管理者，審核代付等 |

### 代理階層

用於計算多層級代理佣金：
- 商戶隸屬於 Agent
- Agent 隸屬於 Super_Agent
- 佣金計算可達三層

---

## 銀行帳號體系

系統持有的銀行帳號，用於代收時分配給商戶。

```
bank_accounts (系統銀行帳號)
├── bank_account_groups (帳號分組)
├── bam_hosts (帳號監控主機)
└── banks (銀行資料)
```

### 運作流程

1. 系統分配銀行帳號給商戶
2. 商戶提供帳號給客戶轉帳
3. BAM 主機監控帳號異動
4. 偵測到轉帳後觸發撮合系統

---

## 代收 (deposits)

商戶發起收款請求，等待客戶轉帳後完成。

```
deposits (代收訂單)
├── users (所屬商戶)
├── bank_accounts (分配帳號)
└── channels (支付通道)
```

### 狀態流程

```
PENDING (待匹配)
    ↓ 偵測到轉帳
MATCHING (匹配中)
    ↓ 確認成功
COMPLETED (已完成)
    ↓ 若失敗
FAILED (失敗)
```

### 撮合策略

| 策略 | 說明 |
|------|------|
| UTR 精確匹配 | 以銀行轉帳序號精確配對 |
| 姓名+金額匹配 | 匯款人姓名 + 金額（1% 容差） |
| 唯一金額匹配 | 金額唯一時自動匹配 |

---

## 代付 (withdraws)

商戶發起付款請求，需管理員審核後執行。

```
withdraws (代付訂單)
├── users (所屬商戶)
└── channels (支付通道)
```

### 狀態流程

```
PENDING_REVIEW (待審核)
    ↓ 管理員核准
APPROVED (已核准)
    ↓ 向第三方發起
PROCESSING (處理中)
    ↓ 第三方回調
COMPLETED (已完成) 或 FAILED (失敗)
    ↓ 若審核駁回
REJECTED (已駁回)
```

---

## 現金帳本 (cash_books)

記錄用戶餘額變動的流水帳。

```
cash_books (現金帳本)
├── users (所屬用戶)
└── cash_records (異動明細)
```

### 異動類型

| 類型 | 說明 |
|------|------|
| DEPOSIT | 客戶轉帳入帳 |
| WITHDRAW | 代付扣款 |
| COMMISSION | 代理佣金入帳 |
| ADJUSTMENT | 人工調整 |
| FREEZE | 凍結款項 |
| UNFREEZE | 解凍款項 |

---

## 支付通道 (channels)

支援多元支付通道整合。

```
channels (支付通道)
├── channel_settings (通道設定)
├── agent_channel_configs (代理費率)
├── user_channel_configs (商戶費率)
└── payments (支付工具)
```

### 內建通道

| 通道 | 代碼 | 類型 |
|------|------|------|
| PayPay | paypay | 代收+代付 |
| HK21Pay | hk21pay | 代收+代付 |
| VanPay | vanpay | 代收+代付 |
| ColaPay | colapay | 代收+代付 |

---

## 費率引擎 (fee_groups / fee_rules)

支援百分比費率和固定費用兩種模式。

```
fee_groups (費率群組)
└── fee_rules (費率規則)
```

### 費率類型

| 類型 | 說明 |
|------|------|
| PERCENTAGE | 百分比收費（如 2.5%） |
| FIXED | 固定金額（如每筆 30 元） |

---

## 代理佣金 (agent_commissions)

三層級代理佣金系統。

```
agent_commissions (代理佣金)
├── agent_commission_snapshots (月度結算快照)
└── fee_groups (費率群組)
```

### 佣金計算範例

```
商戶交易 1000 元
  ├─ 第一層 Agent A: 0.5% = 5 元
  ├─ 第二層 Super Agent B: 0.3% = 3 元
  └─ 第三層 (若有) 依設定遞減
```

---

## 風控 (blacklists)

黑名單過濾，命中則直接拒絕交易。

```
blacklists (黑名單)
```

### 支援類型

| 類型 | 說明 |
|------|------|
| ID_CARD | 身份證號碼 |
| BANK_ACCOUNT | 銀行帳號 |
| PHONE | 手機號碼 |
| IP | IP 地址 |
| DEVICE_ID | 設備識別碼 |

---

## ER 關聯圖

```
                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
           ┌──────────────┼──────────────┐
           │              │              │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  Deposit   │ │  Withdraw  │ │  CashBook  │
    └────────────┘ └────────────┘ └────────────┘

    ┌─────────────┐     ┌─────────────┐
    │BankAccount │────<│    Bank    │
    └────────────┘     └─────────────┘
           │
    ┌──────▼──────┐
    │BankAccountGrp│
    └─────────────┘

    ┌─────────────┐     ┌─────────────┐
    │  Channel    │────<│  FeeGroup  │
    └─────────────┘     └─────────────┘
           │                  │
    ┌──────▼──────┐     ┌──────▼──────┐
    │AgentChannel │     │  FeeRule   │
    │   Config   │     └─────────────┘
    └─────────────┘

    ┌─────────────┐
    │ Blacklist   │
    └─────────────┘
```

---

*最後更新：2026-05-23*