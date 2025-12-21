# 開發規範手冊

**目標**：統一風格、減少衝突、確保 4 週內交付 MVP。

---

## 1. 專案目錄結構 (Project Structure)

```plaintext
src/
├── api/                # API 統一管理 (Axios)
│   ├── auth.js         # 登入、註冊
│   ├── chat.js         # 聊天室相關
│   └── user.js         # 用戶資料
├── assets/             # 靜態資源 (Images等)
├── components/         # 元件 (含共用)
│   ├── chat/          
│   ├── social/          
│   └── share/          # 全域通用 (Button, Input, Loader等)
├── composables/        # 組合式函式邏輯複用 (Vue Hooks/有狀態)
│   ├── useSocket.js    # Socket 連線管理
│   ├── useLocation.js  # GPS 定位邏輯
│   └── useChat.js      # 聊天室邏輯
├── doc/                # 文件
│   ├── Guide.md        # 開發規範
│   └── README.md       # 專案介紹
├── stores/             # Pinia 全域狀態管理
│   ├── userStore.js    # 用戶資訊、Token
│   └── chatStore.js    # 聊天列表、未讀數
├── utils/              # 工具函式 (純JS沒用Vue / 無狀態)
│   ├── validators.js   # Regex 驗證 (晶片, Email)
│   └── formatters.js   # 日期、金額格式化
├── views/              # 頁面 (一般都先做在這，很多重複再到components元件做)
│   ├── Auth/           # 登入註冊頁
│   ├── Chat/           # 聊天室頁
│   └── Home/           # 首頁/地圖頁
├── router/             # 路由設定
└── App.vue

```

## 2. 命名規則 (Naming Convention)

### 2.1 檔案與資料夾
| 類型 | 規則 | 範例 | 說明 |
| :--- | :--- | :--- | :--- |
| **資料夾** | `kebab-case` (建議) | `src/components/chat-window/` | 全小寫，用連字號分隔 |
| **Vue 元件** | **PascalCase** (大駝峰) | `ChatBubble.vue`, `UserProfile.vue` | 必須大寫開頭，至少兩個單字組合 (避免與 HTML 標籤衝突) |
| **JS檔案** | `camelCase` (小駝峰) | `useSocket.js`, `apiAuth.js` | 工具或邏輯檔 |

### 2.2 程式碼內部
| 類型 | 規則 | 範例 | 說明 |
| :--- | :--- | :--- | :--- |
| **變數/參照** | `camelCase` (小駝峰) | `const userList = ref([])` | 名詞為主，從名字可以看懂這是什麼 |
| **函式 (Function)** | `camelCase` (小駝峰) | `function sendMessage()` | **動詞**開頭 (get, set, fetch, handle, is) |
| **事件處理** | `handle` + 事件名 | `const handleSubmit = () => {}` | 用於 @click 或 @submit |
| **布林值 (Boolean)** | `is`, `has`, `should` | `const isLoggedIn = ref(false)` | 讓讀的人知道這是 true/false |
| **常數** | `UPPER_SNAKE` | `const MAX_CHAT_COUNT = 20` | 僅限於不會變的設定值 |

---

## 3. Vue 3 Coding Style 規範

### 3.1 核心原則
1.  **必須使用 `<script setup>`**：簡潔且效能好。
2.  **必須使用 `ref`**：為了避免新手在 `reactive` 解構時失去響應性，本專案**統一全域使用 `ref`**。
    * *例外*：只有在處理複雜且不需要解構的物件 (如表單物件) 時才可用 `reactive`，但需在 PR 備註。

### 3.2 `<script setup>` 內部的程式碼順序
為了讓每個人打開檔案都能快速找到東西，請**嚴格遵守**以下順序：

```javascript
<script setup>
// 1. Imports (Vue 核心 -> 套件 -> 元件 -> Composables/Utils/Stores)
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'

// 2. Props & Emits 定義
const props = defineProps({
  status: { type: String, required: true }
})
const emit = defineEmits(['update', 'close'])

// 3. 常數與狀態 (State)
const router = useRouter()
const { user } = useAuth()
const isLoading = ref(false)
const messageInput = ref('')

// 4. 計算屬性 (Computed)
const isInputValid = computed(() => messageInput.value.length > 0)

// 5. 方法/函式 (Functions) - 包含事件處理
const handleSend = async () => {
  if (!isInputValid.value) return
  // ...邏輯
}

// 6. 生命週期 (Lifecycle Hooks)
onMounted(() => {
  console.log('Component mounted')
})
</script>
```
---

## 3.3 Props 嚴格定義 (Strict Props)

為了避免資料傳遞錯誤，禁止使用陣列寫法 (如 `defineProps(['title'])`)。
**規範**：必須詳細定義 `type` (型別)、`default` (預設值) 與 `required` (是否必填)。

### ❌ 錯誤示範 (禁止)
```javascript
// 隊友不知道這個 user 裡面有什麼，也不確定 status 是什麼型別
const props = defineProps(['status', 'user'])
```

### ✅ 正確示範 (推薦)
```javascript
const props = defineProps({
  // 1. 基礎型別
  isVisible: {
    type: Boolean,
    default: false
  },
  // 2. 字串與驗證 (Validator)
  status: {
    type: String,
    default: 'LOCKED',
    // 強制限制只能傳入特定字串，防止打錯字
    validator: (value) => ['LOCKED', 'PET_MODE', 'REAL_MODE'].includes(value) 
  },
  // 3. 物件型別 (注意：default 必須是函式)
  userProfile: {
    type: Object,
    required: true,
    // 物件或陣列的預設值必須使用 factory function
    default: () => ({ 
      name: 'Guest', 
      level: 0,
      avatar: '' 
    })
  }
})
```

---

## 4. Tailwind CSS v4.0 撰寫規範

為了讓 HTML 保持整潔且易於維護，請遵守以下順序與原則。

### 4.1 Class 排序原則 (Ordering)
請依照 **「由外而內」** 的順序撰寫 Class：
1.  **佈局與定位 (Layout)**: `flex`, `grid`, `absolute`, `fixed`, `z-index`
2.  **盒模型 (Box Model)**: `w-`, `h-`, `m-` (margin), `p-` (padding)
3.  **文字與內容 (Typography)**: `text-`, `font-`, `leading-`
4.  **視覺裝飾 (Visuals)**: `bg-`, `border-`, `rounded-`, `shadow-`, `opacity-`

**範例：**
```html
<div class="flex items-center justify-between w-full p-4 text-white bg-blue-500 rounded-lg shadow-md">
  ...
</div>
```

### 4.2 響應式設計 (Mobile First)
Pawdar 是手機優先的網頁，**不加前綴的 class 即為手機樣式**。
* **手機 (預設)**: 寬度 100% (`w-full`)
* **平板 (md: 768px+)**: 寬度 50% (`md:w-1/2`)
* **桌機 (lg: 1024px+)**: 寬度 33% (`lg:w-1/3`)

**寫法：**
```html
<div class="w-full md:w-1/2 lg:w-1/3">...</div>
```

### 4.3 避免 Magic Numbers
盡量使用 Tailwind 預設的間距系統 (`p-4` = 1rem = 16px)。
除非設計稿有極度特殊的像素要求，否則**禁止**使用任意值寫法。
* ❌ `w-[137px]`, `mt-[3px]` (難以維護，破壞設計系統)
* ✅ `w-32`, `mt-1`

---

## 5. 架構觀念：Composables vs Utils vs Store

請依據下表判斷程式碼該放在哪裡，不要全部塞在 `.vue` 檔案裡面。

| 比較項目 | Composables (`src/composables/`) | Utils (`src/utils/`) | Pinia Store (`src/stores/`) |
| :--- | :--- | :--- | :--- |
| **定義** | **有狀態的邏輯 (Stateful)** | **純計算工具 (Stateless)** | **全域資料共享 (Global)** |
| **Vue 依賴** | ✅ 需要 (`import { ref } from 'vue'`) | ❌ 不需要 (純 JS) | ✅ 需要 |
| **生命週期** | ✅ 會用到 `onMounted` 等 | ❌ 無 | ❌ 無 |
| **狀態特性** | 每次呼叫產生新的獨立狀態 | 無狀態 (Input -> Output) | 整個 App 共用一份資料 (Singleton) |
| **Pawdar 範例** | `useSocket` (聊天連線)<br>`useLocation` (GPS 追蹤) | `formatChip` (晶片格式化)<br>`validateAuth` (驗證邏輯)<br>`calcDistance` (距離計算) | `userStore` (Token, 用戶資訊)<br>`chatStore` (未讀紅點數)<br>`uiStore` (全域 Loading) |

---

## 6. 環境設定 (Prettier & VS Code)

為了避免「我看你是亂碼，你看我是整齊」的狀況，請全隊執行以下設定。

### 6.1 必裝 VS Code 擴充套件
請在 Extensions (Ctrl+Shift+X) 搜尋並安裝：
1.  **Vue - Official** (提供 .vue 語法高亮與支援)
2.  **Tailwind CSS IntelliSense** (寫 class 會有自動提示，必裝！)
3.  **Prettier - Code formatter** (自動排版)
4.  **ESLint** (檢查語法錯誤)

### 6.2 專案設定檔 (`.vscode/settings.json`)
請在專案根目錄建立 `.vscode` 資料夾，並新增 `settings.json` 檔案，貼上以下內容：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```
*設定完成後，只要按下 `Ctrl + S` (存檔)，程式碼就會自動變整齊！*

---

## 7. Git 與 GitHub 協作流程 (詳細版)

**絕對禁止** 直接 Push 到 `main` 或 `dev` 分支！

### 7.1 分支命名規範
* `feat/功能名稱`：開發新功能 (e.g., `feat/chat-room`)
* `fix/Bug名稱`：修復錯誤 (e.g., `fix/login-error`)
* `style/樣式名稱`：僅調整 CSS (e.g., `style/navbar-color`)
* `refactor/重構內容`：程式碼優化，不影響功能 (e.g., `refactor/socket-logic`)

### 7.2 開發標準作業程序 (SOP)
請嚴格遵守此流程以減少衝突：

1.  **更新地基 (開工前必做)**：
    ```bash
    git checkout dev
    git pull origin dev
    ```
2.  **開新分支**：
    ```bash
    git checkout -b feat/my-feature-name
    ```
3.  **開發與提交**：(保持顆粒度，不要累積太多才 commit)
    ```bash
    git add .
    git commit -m "feat: 完成聊天室輸入框 UI"
    ```
4.  **解衝突 (Merge)** - **推上前最關鍵的一步**：
    ```bash
    git checkout dev
    git pull origin dev      # 再次確保 dev 是最新的
    git checkout feat/my-feature-name
    git merge dev            # 將最新的 dev 合併進來你的分支
    # 若有衝突 (Conflict)，VS Code 會亮紅字，請修正後存檔
    # 修正完後：git add . -> git commit
    ```
5.  **推送與 PR**：
    ```bash
    git push origin feat/my-feature-name
    ```
    * 到 GitHub 建立 **Pull Request (PR)**。
    * 選擇 `base: dev` <- `compare: feat/my-feature-name`。
    * **審核規則**：至少 1 位隊友 Approve 後才可 Merge。

---

## 8. 團隊管理與 MVP 策略

### 8.1 任務管理 (Kanban)
* **WIP (Work In Progress) 限制**：每人同時只能進行 **一張** 卡片。做完推上去再拿下一張。
* **卡住求救機制**：若遇到 Bug 卡關超過 **2 小時**，**必須**在群組提出求救，禁止單打獨鬥浪費時間。

### 8.2 MVP 功能優先級 (依據 Pawdar PRD v4.0)
時間緊迫 (4週)，請嚴格遵守以下開發順序：

#### 🚨 P0: 核心功能 (沒做完 = 專案失敗)
1.  **身份驗證 (Auth)**: 註冊/登入、分層身份驗證、晶片號碼 Regex 驗證。
2.  **即時聊天 (Chat)**: Socket.io 連線、文字訊息傳送、三階段解鎖 (Locked -> Pet -> Real)。
3.  **地圖互動 (Map)**: 顯示地圖、GPS 定位追蹤、顯示附近寵物頭像。
4.  **配對機制 (Match)**: 每日自動配對卡片介面、Sniff 請求發送。

#### ⚠️ P1: 必要功能 (核心穩定後才做)
1.  **個人檔案 (Profile)**: 編輯資料、上傳頭像、查看他人檔案。
2.  **活動揪團 (Event)**: 活動列表、+1 參加功能 (需驗證身份)。
3.  **歷史紀錄**: 聊天室列表。

#### 🧊 P2: 加分功能 (有空再做 / 簡化實作)
1.  **Boop! 按讚**: 實作彈性動畫效果 (CSS Animation)。
2.  **地圖埋寶 (Buried Treasure)**: 不做後端儲存，直接在地圖上 Hardcode 幾個假寶藏點供 Demo 即可。
3.  **RPG 稱號**: 依據雷達數值顯示稱號。

#### ❌ P3: 範圍排除 (本次不做)
1.  **寵物換裝與虛擬屋**。
2.  **複雜照護紀錄** (疫苗提醒、體重曲線)。
3.  **視訊/語音通話**。

---
> **Team Motto**: Scout with your Snout. 用鼻子探索你的社交圈 (也用腦袋寫乾淨的 Code)！

