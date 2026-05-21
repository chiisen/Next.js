# API 端點

## 代收相關

| 端點 | 用途 |
|------|------|
| `POST /api/deposit/payment` | 代收請求 |
| `GET /api/deposit/{id}` | 查詢代收狀態 |
| `POST /api/deposit/{slug}/notify` | 代收回調 |

## 代付相關

| 端點 | 用途 |
|------|------|
| `POST /api/withdraw/request` | 代付請求 |
| `GET /api/withdraw/{id}` | 查詢代付狀態 |
| `POST /api/withdraw/{slug}/notify` | 代付回調 |

## 查詢相關

| 端點 | 用途 |
|------|------|
| `GET /api/order/query` | 訂單查詢 |
| `GET /api/balance/query` | 餘額查詢 |

---

*建立日期：2026-05-21*