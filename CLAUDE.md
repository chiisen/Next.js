# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

支付系統專案，基於原專案評估後的 Next.js 重構方案。

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

## 專案結構

```
next-js/
├── app/                      # Next.js App Router
├── public/                  # 靜態資源
├── prisma/                  # Prisma Schema
├── src/                     # 應用程式碼
│   ├── lib/                 # 工具函式、服務
│   ├── components/          # 元件
│   └── types/               # TypeScript 類型
└── docs/                    # 文件
```

## 文件索引

| 文件 | 內容 |
|------|------|
| [商業邏輯](./docs/business-logic.md) | 核心商業邏輯模組說明 |
| [資料模型](./docs/data-model.md) | 資料庫模型結構 |
| [API 端點](./docs/api-endpoints.md) | API 端點列表 |
| [Vitest 測試指南](./docs/vitest-guide.md) | 單元測試使用說明 |
| [Agent 工作流程](./docs/agent-workflow.md) | AI Agent 工作目錄規則 |

## 建構順序

1. 安裝 shadcn/ui + Prisma + NextAuth.js
2. 建立 Prisma Schema（遷移自原專案的資料庫 Schema）
3. 實作認證層
4. 建立商業邏輯模組
5. 串接支付通道

## CodeGraph 整合

本專案已啟用 [CodeGraph](https://github.com/colbymchenry/codegraph) 代碼知識圖譜，可快速查詢代碼結構。

### 常用指令

```bash
codegraph status          # 查看索引狀態
codegraph query <關鍵字>   # 搜尋符號/函式
codegraph callers <函式>   # 查誰呼叫某函式
codegraph callees <函式>   # 查函式呼叫誰
codegraph impact <函式>   # 分析影響範圍
codegraph serve --mcp     # 啟動 MCP 伺服器（供 AI 使用）
```

### MCP 工具（AI 使用）

當 MCP 伺服器運行時，AI 可使用以下工具：
- `codegraph_search` — 搜尋符號
- `codegraph_context` — 建構上下文
- `codegraph_callers` / `codegraph_callees` — 呼叫圖分析
- `codegraph_impact` — 影響範圍分析
- `codegraph_explore` — 探索程式碼關係

### 建議使用時機

- 探索不熟悉的程式碼時
- 修改函式前查詢呼叫關係
- 重構前分析影響範圍
- 快速定位符號定義