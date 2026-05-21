# AI Agent 工作目錄規則

## 專案路徑設定

路徑透過環境變數配置（讀取 `.env` 或系統環境變數）：

| 環境變數 | 用途 |
|----------|------|
| `WORK_PROJECT_PATH` | **寫入目標** — 新系統代碼存放目錄 |
| `REFERENCE_PROJECT_PATH` | **參考來源** — 僅供閱讀，勿寫入 |

## 重要原則

1. **禁止修改參考目錄**：嚴禁對 `${REFERENCE_PROJECT_PATH}` 進行任何寫入操作
2. **所有產出寫入 WORK_PROJECT_PATH**：`${WORK_PROJECT_PATH}` 是唯一可寫入的目錄
3. **優先讀取本地 .env**：若專案目錄中存在 `.env` 檔案，自動載入作為環境變數
4. **若未設定 `REFERENCE_PROJECT_PATH`**：詢問使用者「請提供參考專案的路徑」

---

*最後更新日期：2026-05-21*