# Vitest 測試指南

## 基本指令

```bash
# 執行所有測試
npm run test

# 進入 watch 模式（檔案異動自動重跑）
npm run test:watch

# 開啟 UI 介面
npm run test:ui

# 只測試特定檔案
npx vitest run src/lib/xxx.ts

# 只測試特定檔案並進入 watch
npx vitest src/lib/xxx.ts
```

## 測試檔案命名

| 格式 | 位置 | 用途 |
|------|------|------|
| `*.test.ts` | 任意目錄 | 單一檔案測試 |
| `*.spec.ts` | 任意目錄 | 單一檔案測試（同等效果） |
| `__tests__/*.ts` | 任意目錄 | 將多個相關測試集中於此資料夾 |

## 測試範例

### 純函式測試

```typescript
// src/lib/calc.ts
export function add(a: number, b: number): number {
  return a + b
}
```

```typescript
// src/lib/calc.test.ts
import { describe, it, expect } from 'vitest'
import { add } from './calc'

describe('add', () => {
  it('正數相加', () => {
    expect(add(1, 2)).toBe(3)
  })

  it('負數相加', () => {
    expect(add(-1, -2)).toBe(-3)
  })

  it('零', () => {
    expect(add(5, 0)).toBe(5)
  })
})
```

### React 元件測試

```typescript
// src/components/Counter.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

describe('Counter', () => {
  it('點擊增加數字', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    expect(screen.getByText('0')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

### 非同步測試

```typescript
it('非同步請求', async () => {
  const result = await fetchData()
  expect(result).toEqual({ ok: true })
})
```

### 測試前設定（Setup）

```typescript
beforeEach(() => {
  // 每個測試前執行
  localStorage.clear()
})

afterEach(() => {
  // 每個測試後執行
  vi.clearAllMocks()
})
```

## 常用斷言（Expect）

```typescript
expect(value).toBe(3)              // 嚴格相等
expect(value).toEqual({ a: 1 })    // 深層相等
expect(value).toBeTruthy()         // 為 true
expect(value).toBeFalsy()         // 為 false
expect(value).toBeNull()           // 為 null
expect(value).toBeUndefined()     // 為 undefined
expect(value).toContain('abc')     // 包含
expect(value).toHaveLength(3)     // 長度為 3
expect(() => fn()).toThrow()      // 拋出錯誤
expect(value).toMatch(/regex/)    // 正規表達式匹配
```

## Mock（模擬）

```typescript
import { vi } from 'vitest'

// Mock 函式
const mockFn = vi.fn(() => 'mocked')
mockFn('hello') // 'mocked'

// Mock 模組
vi.mock('./db', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getUser: vi.fn(() => ({ id: 1, name: 'Test' }))
  }
})

// Spy on 物件方法
vi.spyOn(localStorage, 'getItem')
```

## 注意事項

### 1. 路徑別名

目前專案設定 `@/*` 映射到根目錄。在測試中使用時需確認 tsconfig 或 vite config 有正確設定。

### 2. Next.js App Router 元件

Next.js App Router 元件使用 Server Components，直接用 `@testing-library/react` 會失敗。建議：

- 先將待測元件移至 Client Component（`"use client"`）
- 或使用 `next/dynamic` + `{ ssr: false }` 動態匯入
- 對於複雜的 Server Components，改用整合測試驗證

### 3. 環境變數

`.env.test` 中的變數會被 Vitest 載入。敏感資料請勿寫入測試檔案。

### 4. Vitest 與 Jest 差異

| 差異 | Vitest | Jest |
|------|--------|------|
| 設定檔 | `vitest.config.ts` | `jest.config.js` |
| Mock 方式 | `vi.fn()` | `jest.fn()` |
| Spy 方式 | `vi.spyOn()` | `jest.spyOn()` |
| 環境 | 原生 ESM | 需轉譯 |

遷移時注意：Jest 的 `jest.fn()` → `vi.fn()`，`jest.spyOn()` → `vi.spyOn()`。

### 5. Watch 模式卡住

若 watch 模式無反應，按 `q` 退出後重新執行。

### 6. 測試隔離

每個測試檔案相互獨立，不共享狀態。若需共享狀態，使用 `beforeAll` / `afterAll`。

## 建議的目錄結構

```
src/
├── lib/
│   ├── calc.ts
│   └── calc.test.ts       # 同目錄
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx   # 同目錄
└── __tests__/
    ├── integration/      # 整合測試
    └── setup.ts           # 共用設定
```

## 與 CI/CD 整合

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm run test
```

Vitest 輸出格式相容 JUnit，可透過 `--reporter=junit` 產生 CI 所需格式。

### API 測試範例

```typescript
// tests/api/deposit.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/deposit/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    deposit: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Deposit API", () => {
  it("should return deposit list", async () => {
    const mockDeposits = [{ id: "1", orderNo: "D123", amount: 1000 }];
    const { prisma } = await import("@/lib/prisma");
    vi.mocked(prisma.deposit.findMany).mockResolvedValue(mockDeposits as any);

    const response = await GET(new NextRequest("http://localhost/api/deposit"));
    expect(response.status).toBe(200);
  });
});
```

---

*最後更新：2026-05-23*