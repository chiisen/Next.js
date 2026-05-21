# 資料模型

## 用戶體系 (users)

商戶、代理、超級代理都使用同一張 users 表，以 role 區分身份。

```
users (商戶/代理/超級代理)
├── deposits (代收訂單)
├── withdraws (代付訂單)
├── cash_books (現金帳本)
├── cash_records (現金異動)
└── user_channel_configs (商戶通道配置)
```

## 銀行帳號體系

```
bank_accounts (系統銀行帳號)
├── bank_account_groups (帳號分組)
├── bam_hosts (帳號監控主機)
└── banks (銀行資料)
```

## 支付通道

```
channels (支付通道)
├── channel_settings (通道設定)
├── agent_channel_configs (代理通道費率)
└── payments (支付工具)
```

## 代理佣金

```
agent_commissions (代理佣金)
├── agent_commission_snapshots (佣金快照)
└── fee_groups / fee_rules (費率規則)
```

---

*建立日期：2026-05-21*