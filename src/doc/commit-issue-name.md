# Commit 及 Issue 命名規範完整指南

**適用專案：PetPetNi**  
**最後更新：2026年1月**

---

## 📋 快速查詢表（按字母排序）

| 類型 | 英文 | 繁體中文 | 何時使用 | 範例 |
|------|------|--------|--------|------|
| 構建 | build | 構建 | 影響構建系統、依賴項、版本 | `build: 升級 Vue 至 v3.4` |
| 雜項 | chore | 雜項 | 依賴更新、配置變更、無代碼改變 | `chore: 更新 npm dependencies` |
| CI/CD | ci | CI/CD | GitHub Actions、部署配置、自動化 | `ci: 新增自動化測試工作流` |
| 配置 | config | 配置 | 環境變數、設定檔、配置文件修改 | `config: 新增環境變數配置` |
| 資料庫 | db | 資料庫 | 資料庫遷移、初始化、schema 變更 | `db: 建立寵物表` |
| 依賴 | deps | 依賴 | 依賴升級、版本更新、套件變更 | `deps: 升級 axios 至 v1.4` |
| 設計 | design | 設計 | UI/UX 設計相關、設計系統更新 | `design: 更新設計系統色彩規範` |
| 文檔 | docs | 文檔 | 新增或修改文檔、README、註解 | `docs: 新增寵物配對 API 文檔` |
| 提取 | extract | 提取 | 將邏輯/組件提取為可重用 | `extract: 建立可重用 Toast 元件` |
| 新功能 | feat | 新功能 | 開發新功能、新增特性、新的 API | `feat: 新增實時聊天功能` |
| 修復 | fix | 修復 | 修復 bug、解決問題 | `fix: 修復圖片上傳驗證錯誤` |
| 基礎設施 | infra | 基礎設施 | 伺服器配置、Socket.io、訊息隊列等 | `infra: 設定 Socket.io 連接` |
| 佈局 | layout | 佈局 | 頁面切版、佈局結構、版面調整 | `layout: 配對頁面切版` |
| 改進 | improve | 改進 | 泛指代碼、性能、流程改進 | `improve: 改進聊天錯誤處理` |
| 優化 | optimize | 優化 | 專指性能或視覺優化 | `optimize: 減少通知 payload 大小` |
| 性能 | perf | 性能 | 優化速度、減少包大小、提升效能 | `perf: 實現寵物圖片懶加載` |
| 重構 | refactor | 重構 | 改進代碼結構、提取邏輯、無功能改變 | `refactor: 提取上傳邏輯至 composable` |
| 發佈 | release | 發佈 | 版本發佈、版號更新、上線部署 | `release: v1.2.0` |
| 回滾 | revert | 回滾 | 回滾之前的提交 | `revert: 還原新增聊天功能` |
| 樣式 | style | 樣式 | CSS、Tailwind、排版、間距、顏色 | `style: 調整按鈕 padding 和 hover 效果` |
| 測試 | test | 測試 | 新增、修改或刪除測試 | `test: 新增認證模組單元測試` |
| UI 優化 | ui optimization | UI 優化 | UI 視覺層面的整體改進 | `ui optimization: 調整導覽列佈局` |

---

## 📖 詳細說明與應用場景

###  **feat（新功能）**

**何時使用：** 開發全新功能、新增特性、新的 API 端點、新的用戶交互

**Commit 範例：**
- `feat: 實現實時通知系統`
- `feat: 整合金流系統`
- `feat: 實現 Socket.io 即時聊天`

**Issue 範例：**
- `feat: 新增寵物社交配對演算法`
- `feat: 實現聊天端對端加密`
- `feat: 建立寵物品種分類系統`

---

###  **fix（錯誤修正）**

**何時使用：** 修復 bug、解決問題、修補錯誤

**Commit 範例：**
- `fix: 修復圖片上傳驗證錯誤`
- `fix: 防止重複聊天訊息`
- `fix: 修正 token 過期未觸發重新登入`

**Issue 範例：**
- `fix: iOS 設備上圖片無法上傳`
- `fix: 聊天通知時間戳顯示不正確`
- `fix: 實時訂閱記憶體洩漏`

---

###  **refactor（重構）**

**何時使用：** 改進代碼結構、提取重複邏輯、重新組織代碼、改進可讀性（不改變功能）

**特別適用情況：**
- ✅ 將多個頁面共用的邏輯提取到 composable
- ✅ 將多個頁面共用的邏輯提取到 utils
- ✅ 重新組織文件結構
- ✅ 簡化複雜函數
- ✅ 提取重複代碼

**Commit 範例：**
- `refactor: 提取舉報邏輯至可重用 composable`
- `refactor: 提取圖片上傳邏輯至 composable`
- `refactor: 提取共用驗證邏輯至 utils`
- `refactor: 整合認證邏輯`
- `refactor: 將大型元件拆分為更小模組`
- `refactor: 重新組織 store 結構以提高可維護性`

**Issue 範例：**
- `refactor: 提取共用圖片上傳邏輯至 composable`
- `refactor: 提取 toast 通知邏輯以便重複使用`
- `refactor: 統合整個應用的舉報功能`

---

###  **extract（提取組件/邏輯）**

**何時使用：** 強調將某個功能/組件提取為獨立、可重用的單元

**特別適用情況：**
- ✅ 為共用按鈕、彈跳提示建立組件
- ✅ 從散落的代碼中提取邏輯
- ✅ 創建可在多頁面使用的組件

**Commit 範例：**
- `extract: 建立可重用 Toast 元件`
- `extract: 建立 ConfirmDialog 元件`
- `extract: 建立 SharedButton 元件`

**Issue 範例：**
- `extract: 建立可重用的 Toast 通知元件`
- `extract: 建立可重用圖片上傳元件`

---

### **layout（佈局）**

**何時使用：** 頁面切版、佈局結構變更、版面調整、頁面框架

**特別適用情況：**
- ✅ 完成新頁面切版
- ✅ 調整頁面整體佈局結構
- ✅ 修改版面框架、Grid、Flex 配置
- ✅ 頁面版式重構

**Commit 範例：**
- `layout: 配對頁面切版`
- `layout: 調整主頁面佈局`

**Issue 範例：**
- `layout: 配對頁面切版`
- `layout: 調整導覽欄和側邊欄佈局`

---

###  **db（資料庫）**

**何時使用：** 資料庫遷移、初始化、schema 變更、資料庫相關的結構修改

**特別適用情況：**
- ✅ 建立新表格
- ✅ 修改表格欄位
- ✅ 建立索引、外鍵
- ✅ 資料庫遷移腳本
- ✅ 初始資料設置

**Commit 範例：**
- `db: 建立寵物表`
- `db: 新增用戶認證欄位`
- `db: 新增金流交易記錄表`

**Issue 範例：**
- `db: 建立寵物配對關聯表`
- `db: 修改用戶表結構`

---

###  **infra（基礎設施）**

**何時使用：** 伺服器配置、Socket.io、訊息隊列、RabbitMQ、Redis 等基礎設施相關

**特別適用情況：**
- ✅ Socket.io 連接配置
- ✅ 訊息隊列設置
- ✅ 快取層配置
- ✅ 伺服器環境配置
- ✅ 第三方服務整合基礎設施

**Commit 範例：**
- `infra: 設定 Socket.io 連接`
- `infra: 設定 API 反向代理`

**Issue 範例：**
- `infra: 配置 Socket.io 伺服器`
- `infra: 整合訊息隊列系統`

---

###  **config（配置）**

**何時使用：** 環境變數、設定檔、配置文件修改（區別於 chore，更具體的配置類變更）

**特別適用情況：**
- ✅ .env 檔案變更
- ✅ 應用配置文件修改
- ✅ 環境特定設置
- ✅ API 端點配置

**Commit 範例：**
- `config: 新增環境變數配置`
- `config: 更新 API 端點設置`
- `config: 新增金流 API 設定`

**Issue 範例：**
- `config: 新增生產環境配置`
- `config: 配置第三方服務金鑰`

---

###  **deps（依賴）**

**何時使用：** 依賴升級、版本更新、套件變更（比 chore 更具體的依賴類更新）

**特別適用情況：**
- ✅ 主要依賴升級
- ✅ 新增必要套件
- ✅ 移除不用的依賴
- ✅ 解決依賴衝突

**Commit 範例：**
- `deps: 升級 axios 至 v1.4`
- `deps: 新增 socket.io-client`
- `deps: 新增金流 SDK`

**Issue 範例：**
- `deps: 升級關鍵依賴`
- `deps: 新增訊息隊列套件`

---

###  **release（發佈）**

**何時使用：** 版本發佈、版號更新、上線部署

**特別適用情況：**
- ✅ 發佈新版本
- ✅ 更新版本號
- ✅ 標記上線版本
- ✅ 發佈變更日誌

**Commit 範例：**
- `release: v2.0.0-beta`
- `release: 1.0.0 stable`

**Issue 範例：**
- `release: 準備 v1.2.0 上線`

---

###  **revert（回滾）**

**何時使用：** 回滾之前的提交、撤銷之前的改動

**特別適用情況：**
- ✅ 回滾有問題的功能
- ✅ 緊急修復需要回滾
- ✅ 撤銷錯誤的變更

**Commit 範例：**
- `revert: 還原新增聊天功能`
- `revert: 撤銷圖片上傳優化`
- `revert: 還原 token 過期邏輯`

**Issue 範例：**
- `revert: 回滾有 bug 的版本`

---

###  **design（設計）**

**何時使用：** UI/UX 設計相關、設計系統更新、設計規範變更

**特別適用情況：**
- ✅ 更新設計系統
- ✅ 修改設計規範
- ✅ 調整品牌色彩、字型等設計元素
- ✅ 設計文件更新

**Commit 範例：**
- `design: 調整字型層級`
- `design: 更新按鈕設計規範`

**Issue 範例：**
- `design: 更新品牌色彩方案`
- `design: 定義新的設計系統`

---

###  **style（樣式）**

**何時使用：** CSS、Tailwind 樣式調整、排版、間距、顏色、字體（不涉及佈局重組或新功能）

**Commit 範例：**
- `style: 調整按鈕 padding 和 hover 效果`
- `style: 調整卡片邊框圓角和陰影`

**Issue 範例：**
- `style: 更新主要按鈕配色方案`
- `style: 改進表單輸入樣式以提高 UX`

---

###  **ui optimization（UI 優化）**

**何時使用：** 專門針對 UI 視覺層面的改進，如佈局、顏色、動畫、響應式設計

**區別於 style：** style 是 CSS 細節調整，ui optimization 是整體 UI 改進

**Commit 範例：**
- `ui optimization: 調整導覽列佈局`
- `ui optimization: 改進行動裝置響應式設計`

**Issue 範例：**
- `ui optimization: 改進行動導覽佈局`
- `ui optimization: 強化載入狀態動畫`

---

###  **perf（性能）**

**何時使用：** 優化速度、減少包大小、改進運行時效能、減少內存使用

**Commit 範例：**
- `perf: 為寵物圖片實現懶加載`
- `perf: 通過移除未使用的依賴優化 bundle 大小`
- `perf: 為聊天訊息搜尋輸入添加防抖`

**Issue 範例：**
- `perf: 用壓縮優化圖片載入`
- `perf: 減少初始 bundle 大小`

---

###  **optimize（優化）**

**何時使用：** 專門針對性能或視覺優化，使某個功能更快或更好看

**Commit 範例：**
- `optimize: 減少通知 payload 大小`
- `optimize: 快取 API 回應`

---

###  **improve（改進）**

**何時使用：** 泛指改進，可以是代碼、性能、流程、錯誤處理、用戶體驗的任何改進

**區別於 refactor：** improve 指改進整體效果，refactor 指改進代碼結構

**Commit 範例：**
- `improve: 改進認證錯誤處理`

**Issue 範例：**
- `improve: 改進錯誤提示以提高 UX`

---

###  **docs（文檔）**

**何時使用：** 新增、更新或修改文檔、README、API 文檔、開發指南、代碼註解

**Commit 範例：**
- `docs: 更新認證 API 文檔`
- `docs: 建立元件使用指南`

**Issue 範例：**
- `docs: 為寵物配對 API 建立文檔`
- `docs: 撰寫 composables 開發指南`

---

###  **test（測試）**

**何時使用：** 新增單元測試、集成測試、E2E 測試、修改測試

**Commit 範例：**
- `test: 新增認證模組單元測試`
- `test: 新增用戶註冊流程 E2E 測試`

**Issue 範例：**
- `test: 為驗證工具建立單元測試`

---

###  **build（構建）**

**何時使用：** 構建工具配置、打包工具更新、Webpack/Vite 配置變更、依賴版本更新導致的構建變更

**Commit 範例：**
- `build: 更新 Vite 配置`
- `build: 配置圖片優化外掛`

---

### 2️⃣2️⃣ **chore（雜項）**

**何時使用：** 依賴項更新、配置檔案修改、構建腳本、無代碼邏輯改變的維護工作

**Commit 範例：**
- `chore: 更新 npm dependencies`
- `chore: 升級 prettier 配置`
- `chore: 更新 .gitignore`

---

## 🔀 Refactor vs Extract 詳細比較

### **Refactor（重構）= 改進代碼結構**
- **定義**：改進、重新組織、優化現有代碼的方式，不改變功能
- **範圍**：泛指任何代碼結構的改進
- **重點**：HOW you organize（怎麼組織）

### **Extract（提取）= Refactor 的一種具體做法**
- **定義**：把散落在多處的邏輯「提取出來」變成獨立、可重用的單元
- **範圍**：專指「拿出新的 composable、component、function、utils」
- **重點**：Creating reusable units（建立可重用單元）


### 快速判斷法

| 問題 | 回答 | 使用 |
|------|------|------|
| 我建立了新的 composable / component / utils？ | YES | **extract** |
| 我只是改進現有代碼的組織方式？ | YES | **refactor** |
| 我把散落的邏輯「拿出來」變獨立？ | YES | **extract** |
| 我只是簡化或重新寫現有代碼？ | YES | **refactor** |
| 我既提取又改進組織？ | YES | **extract**（提取為主） 或 **refactor**（都可以） |

### 實務建議

**優先用 extract 的情況：**
- ✅ 建立 composable（useXxx.js）
- ✅ 建立可重用 component（Toast.vue、Modal.vue）
- ✅ 建立 utils 函數集合
- ✅ 把邏輯「拿出來」成獨立文件
- ✅ 強調「現在多個頁面可以共用」

**優先用 refactor 的情況：**
- ✅ 改變文件夾結構
- ✅ 簡化複雜函數邏輯
- ✅ 改進代碼可讀性
- ✅ 重新組織 store、router 等
- ✅ 不需要強調「新增可重用單元」時

**兩個都可以用的情況：**
- 提取邏輯的同時改進組織方式
- 但 `extract` 更明確表達意圖
