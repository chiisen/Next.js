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

---

*專案建立日期：2026-05-21*