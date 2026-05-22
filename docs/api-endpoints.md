# API 端點

## 代收相關

| 端點 | 方法 | 用途 | 狀態 |
|------|------|------|------|
| `POST /api/deposit` | POST | 代收請求 | ✅ 已實作 |
| `GET /api/deposit` | GET | 代收列表 | ✅ 已實作 |
| `GET /api/deposit/[id]` | GET | 查詢代收狀態 | ✅ 已實作 |
| `POST /api/deposit/notify/[slug]` | POST | 代收回調 | ✅ 已實作 |

## 代付相關

| 端點 | 方法 | 用途 | 狀態 |
|------|------|------|------|
| `POST /api/withdraw/request` | POST | 代付請求 | ✅ 已實作 |
| `GET /api/withdraw/withdraw` | GET | 代付列表 | ✅ 已實作 |
| `GET /api/withdraw/withdraw/[id]` | GET | 查詢代付狀態 | ✅ 已實作 |
| `POST /api/withdraw/notify/[slug]` | POST | 代付回調 | ✅ 已實作 |

## 查詢相關

| 端點 | 方法 | 用途 | 狀態 |
|------|------|------|------|
| `GET /api/order/query` | GET | 訂單查詢 | ✅ 已實作 |
| `GET /api/balance/query` | GET | 餘額查詢 | ✅ 已實作 |

## 風控

| 端點 | 方法 | 用途 | 狀態 |
|------|------|------|------|
| `POST /api/blacklist/check` | POST | 黑名單檢核 | ✅ 已實作 |

## 銀行帳號

| 端點 | 方法 | 用途 | 狀態 |
|------|------|------|------|
| `GET /api/bank-accounts` | GET | 查詢可用帳號 | ✅ 已實作 |

## 管理員

| 端點 | 方法 | 用途 | 狀態 |
|------|------|------|------|
| `GET /api/admin/review` | GET | 待審核列表 | ✅ 已實作 |
| `POST /api/admin/review` | POST | 審核操作 | ✅ 已實作 |

---

*最後更新：2026-05-23*