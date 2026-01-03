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
│
├── assets/             # 靜態資源 (Images等)
│
├── components/         # 元件 (含共用)
│   ├── Layout/         # 全局佈局組件
│   │   ├── AppHeader.vue      # 頂部 Header (Logo + 菜單按鈕)
│   │   ├── MenuOverlay.vue    # 側邊菜單 (從 router meta 讀取)
│   │   ├── Navbar.vue         # 底部導航欄
│   │   └── AppFooter.vue      # 頁腳
│   │
│   ├── Form/           # 表單組件
│   │   ├── BaseInput.vue
│   │   ├── BaseSelect.vue
│   │   └── BaseTextarea.vue
│   │
│   ├── Button/         # 按鈕組件
│   │   ├── SocialButton.vue
│   │   ├── ActionButton.vue
│   │   └── IconButton.vue
│   │
│   ├── Navigation/     # 導航相關
│   │   ├── NavIcon.vue
│   │   └── BreadCrumb.vue
│   │
│   ├── Chat/           # 聊天相關組件
│   │   ├── ChatBubble.vue
│   │   └── MessageList.vue
│   │
│   ├── Social/         # 社交相關組件
│   │   └── PostCard.vue
│   │
│   └── Share/          # 全域通用 (Button, Input, Loader等)
│       ├── BackgroundGrid.vue
│       ├── MarqueeBorder.vue
│       └── LoadingSpinner.vue
│
├── composables/        # 組合式函式邏輯複用 (Vue Hooks/有狀態)
│   ├── useAuth.js      # 認證邏輯
│   ├── useSocket.js    # Socket 連線管理
│   ├── useChat.js      # 聊天室邏輯
│   └── useFetch.js     # 網路請求
│
├── doc/                # 文件
│   ├── Guide.md        # 開發規範 (本檔)
│   └── README.md       # 專案介紹
│
├── router/             # 路由設定
│   └── index.js        # 所有路由定義與 meta 資訊
│
├── stores/             # Pinia 全域狀態管理
│   ├── auth.js         # 用戶認證、Token
│   ├── ui.js           # UI 狀態 (菜單開關等)
│   ├── chat.js         # 聊天列表、未讀數
│   └── user.js         # 用戶資訊
│
├── styles/             # 樣式相關
│   ├── components.css
│   ├── style.md
│   └── token.css
│
├── utils/              # 工具函式 (純JS沒用Vue / 無狀態)
│   ├── validators.js   # Regex 驗證 (晶片, Email)
│   ├── formatters.js   # 日期、金額格式化
│   └── constants.js    # 常數定義
│
├── views/              # 頁面 (路由對應的頁面)
│   ├── Auth/           # 認證相關頁面
│   │   └── LoginView.vue
│   │
│   ├── Home/           # 首頁相關
│   │   ├── HomeView.vue        # 未登入的介紹頁
│   │   └── DashboardView.vue   # 已登入的功能首頁
│   │
│   ├── ChatRoomView.vue        # 聊天室頁面
│   ├── EventView.vue           # 活動頁面
│   ├── SocialView.vue          # 社交頁面
│   └── ProfileView.vue         # 個人資料頁面
│
├── App.vue             # 全局入口 (路由 meta 決定顯示什麼)
└── main.js


```

---

## 2. 架構觀念：各層級職責

### 2.1 快速判斷表

| 比較項目     | Composables                  | Utils                                            | Pinia Store                             | Components                 |
| :----------- | :--------------------------- | :----------------------------------------------- | :-------------------------------------- | :------------------------- |
| **定義**     | 有狀態的邏輯                 | 純計算工具                                       | 全域資料共享                            | 顯示 UI                    |
| **Vue 依賴** | ✅ 需要                      | ❌ 不需要                                        | ✅ 需要                                 | ✅ 需要                    |
| **生命週期** | ✅ 有                        | ❌ 無                                            | ❌ 無                                   | ✅ 有                      |
| **狀態特性** | 每次呼叫新狀態               | 無狀態                                           | 全 App 共用                             | 臨時 UI 狀態               |
| **範例**     | `useSocket`<br>`useLocation` | `formatChip`<br>`validateAuth`<br>`calcDistance` | `userStore`<br>`chatStore`<br>`uiStore` | `AppHeader`<br>`LoginForm` |

### 2.2 各層級的核心職責

#### Composables (`src/composables/`)

**職責**：有狀態的邏輯複用

✅ **應該在這裡**：

- Socket 連線管理 (`useSocket`)
- 複雜的表單驗證邏輯
- API 呼叫與錯誤處理

❌ **不應該在這裡**：

- 純計算工具 (應在 Utils)
- 全局共享狀態 (應在 Store)

#### Utils (`src/utils/`)

**職責**：純函式工具，無副作用

✅ **應該在這裡**：

- 驗證函式 (`isValidEmail`, 晶片號碼等)
- 格式化函式 (日期、金額)
- 計算函式 (距離、折扣)
- 常數定義

❌ **不應該在這裡**：

- 任何 Vue 相關 (`ref`, `computed` 等)
- 任何依賴外部狀態的邏輯

---

#### Components (`src/components/`)

**職責**：顯示 UI，接收 props，派發事件

✅ **應該做**：

- 使用 `router-link` 或 `router.push()` 進行導航
- 讀取 `route.name` 或 `route.meta` 用來高亮導航
- 從 `router.getRoutes()` 讀取菜單配置

❌ **不應該做**：

- 硬編碼路由字符串 (用命名路由)
- 決定頁面的顯示規則 (應在 `App.vue` 用 meta)
- 導入其他組件只為了導航
- 傳遞路由信息 via props

#### Components 路由使用規範

##### ✅ 在 Components 中正常的做法

```vue
<!-- 1. 使用 router-link 導航 -->
<router-link :to="{ name: 'events' }">活動</router-link>

<!-- 2. 程式化導航 -->
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const handleClick = () => router.push({ name: 'profile' })
</script>

<!-- 3. 從 meta 讀取菜單配置 -->
<script setup>
const menuItems = computed(() => {
  return router
    .getRoutes()
    .filter((r) => r.meta?.inMenu)
    .map((r) => ({ label: r.meta.menuLabel, name: r.name }))
})
</script>

<!-- 4. 檢查當前頁面用來高亮 -->
<script setup>
const isActive = computed(() => route.name === 'events')
</script>
<button :class="{ active: isActive }">活動</button>
```

##### ❌ 在 Components 中禁止的做法

```javascript
// ❌ 禁止 1：硬編碼路由字符串
const menuItems = [{ label: '活動', path: '/events' }]

// ❌ 禁止 2：在 Component 決定顯示規則
const shouldShowHeader = route.name !== 'chat' && route.name !== 'profile'

// ❌ 禁止 3：傳遞路由信息 via props
<NavItem :to="'/events'" :name="'events'" />

// ❌ 禁止 4：導入其他組件只為了導航
import NavIcon from './NavIcon.vue'
```

#### Components的 4 個Router相關規則

```
規則 1：可以讀 Router，不要改 Router
  ✅ const name = route.name
  ❌ route.name = 'newPage'

規則 2：用命名路由，不要硬編碼路徑
  ✅ :to="{ name: 'events' }"
  ❌ to="/events"

規則 3：從 meta 讀數據，不要自己定義
  ✅ router.getRoutes().filter(r => r.meta?.inMenu)
  ❌ const items = [{ label: '活動', path: '/events' }]

規則 4：可以導航，不要決定顯示規則
  ✅ router.push({ name: 'profile' })
  ❌ const show = route.name !== 'chat'
```

---

### Router Meta 定義規範

```javascript
// src/router/index.js - 核心原則：所有佈局規則都定義在 meta
routes: [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Auth/LoginView.vue'),
    meta: {
      requiresAuth: false, // 是否需要認證
      hideHeader: true, // 隱藏頂部 Header
      hideNavbar: true, // 隱藏導航欄
      hideFooter: true, // 隱藏頁腳
      title: '登入 | PetPetNi'
    }
  },

  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/ChatRoomView.vue'),
    meta: {
      requiresAuth: true,
      hideHeader: true, // ChatRoom 不顯示頂部 Header
      hideNavbar: false, // ChatRoom 有自己的導航
      hideFooter: true,
      title: 'Chat | PetPetNi'
    }
  },

  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventView.vue'),
    meta: {
      requiresAuth: true,
      hideHeader: false,
      hideNavbar: false, // 顯示底部導航欄
      hideFooter: true,
      inMenu: true, // 在菜單中顯示
      menuLabel: '活動', // 菜單標籤
      menuIcon: 'fa-calendar', // 菜單圖標
      title: '活動 | PetPetNi'
    }
  }
]

// ✅ 路由守衛（認證、權限控制）
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 需要認證但未登入 → 跳轉登入
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 已登入訪問首頁 → 跳轉 Dashboard
  if (authStore.isLoggedIn && to.name === 'home') {
    next({ name: 'dashboard' })
    return
  }

  next()
})
```

---

#### Pinia Store (`src/stores/`)

**職責**：全局狀態管理（整個 App 共用一份）

✅ **應該在這裡**：

- 登入用戶信息 (`userStore`)
- Token 管理
- 聊天列表、未讀數 (`chatStore`)
- UI 全局狀態 (`uiStore`) - 菜單開關、Loading

❌ **不應該在這裡**：

- 組件內的臨時狀態 (應在 `ref`)
- 複雜邏輯 (應在 Composables)

---

#### App.vue

```vue
<!-- src/App.vue -->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'

// 導入全局佈局組件
import AppHeader from '@/components/Layout/AppHeader.vue'
import MenuOverlay from '@/components/Layout/MenuOverlay.vue'
import Navbar from '@/components/Layout/Navbar.vue'
import AppFooter from '@/components/Layout/AppFooter.vue'

const route = useRoute()
const uiStore = useUIStore()

// 🔑 核心原則：所有顯示規則都從路由 meta 讀取
const shouldShowHeader = computed(() => !route.meta.hideHeader)
const shouldShowNavbar = computed(() => !route.meta.hideNavbar)
const shouldShowFooter = computed(() => !route.meta.hideFooter)
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <!-- 菜單浮層 (只在 Header 顯示時出現) -->
    <MenuOverlay v-if="shouldShowHeader && uiStore.isMenuOpen" />

    <!-- 頂部 Header -->
    <AppHeader v-if="shouldShowHeader" />

    <!-- 主內容區 -->
    <main class="w-full flex-1">
      <RouterView />
    </main>

    <!-- 底部導航欄 -->
    <Navbar v-if="shouldShowNavbar" />

    <!-- 頁腳 -->
    <AppFooter v-if="shouldShowFooter" />
  </div>
</template>
```

✅ **App.vue 的職責（只做 3 件事）**：

1. 讀取路由 meta 資訊
2. 根據 meta 決定顯示什麼
3. 組合全局佈局

❌ **App.vue 不要做**：

- 硬編碼任何頁面名稱
- 寫任何業務邏輯
- 管理任何非全局的狀態

---

## 3. 命名規則 (Naming Convention)

### 3.1 檔案與資料夾

| 類型         | 規則                    | 範例                                | 說明                                                  |
| :----------- | :---------------------- | :---------------------------------- | :---------------------------------------------------- |
| **資料夾**   | `kebab-case` (建議)     | `src/components/chat-window/`       | 全小寫，用連字號分隔                                  |
| **Vue 元件** | **PascalCase** (大駝峰) | `ChatBubble.vue`, `UserProfile.vue` | 必須大寫開頭，至少兩個單字組合 (避免與 HTML 標籤衝突) |
| **JS檔案**   | `camelCase` (小駝峰)    | `useSocket.js`, `apiAuth.js`        | 工具或邏輯檔                                          |

### 3.2 程式碼內部

| 類型                 | 規則                  | 範例                            | 說明                                       |
| :------------------- | :-------------------- | :------------------------------ | :----------------------------------------- |
| **變數/參照**        | `camelCase` (小駝峰)  | `const userList = ref([])`      | 名詞為主，從名字可以看懂這是什麼           |
| **函式 (Function)**  | `camelCase` (小駝峰)  | `function sendMessage()`        | **動詞**開頭 (get, set, fetch, handle, is) |
| **事件處理**         | `handle` + 事件名     | `const handleSubmit = () => {}` | 用於 @click 或 @submit                     |
| **布林值 (Boolean)** | `is`, `has`, `should` | `const isLoggedIn = ref(false)` | 讓讀的人知道這是 true/false                |
| **常數**             | `UPPER_SNAKE`         | `const MAX_CHAT_COUNT = 20`     | 僅限於不會變的設定值                       |

---

## 4. Vue3 Coding Style 規範

### 4.1 核心原則

1.  **必須使用 `<script setup>`**：簡潔且效能好。
2.  **必須使用 `ref`**：為了避免新手在 `reactive` 解構時失去響應性，本專案**統一全域使用 `ref`**。
    - _例外_：只有在處理複雜且不需要解構的物件 (如表單物件) 時才可用 `reactive`，但需在 PR 備註。

### 4.2 `<script setup>` 內部的程式碼順序

為了讓每個人打開檔案都能快速找到東西，請**嚴格遵守**以下順序：

```vue
<script setup>
// 1. Imports (Vue 核心 -> 套件 -> 元件 -> Composables/Utils/Stores)
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/Button/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'
import { isValidEmail } from '@/utils/validators'

// 2. Props & Emits 定義
const props = defineProps({
  status: { type: String, required: true },
  userProfile: {
    type: Object,
    default: () => ({ name: 'Guest', level: 0 })
  }
})
const emit = defineEmits(['update', 'close'])

// 3️. Router/Store 初始化 (有依賴的優先)
const router = useRouter()
const route = useRoute()
const { user } = useAuth()

// 4️. 常數與狀態 (State)
const isLoading = ref(false)
const messageInput = ref('')
const filteredList = ref([])

// 5. 計算屬性 (Computed)
const isInputValid = computed(() => messageInput.value.length > 0)
const shouldShowNavbar = computed(() => !route.meta.hideNavbar)

// 6. 方法/函式 (Functions) - 包含事件處理
const handleSend = async () => {
  if (!isInputValid.value) return
  isLoading.value = true
  try {
    // 邏輯
  } finally {
    isLoading.value = false
  }
}

// 7. 生命週期 (Lifecycle Hooks)
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

---

## 4.3 Props 嚴格定義 (Strict Props)

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

## 5. Tailwind CSS v4.0 撰寫規範

為了讓 HTML 保持整潔且易於維護，請遵守以下順序與原則。

### 5.1 Class 排序原則 (Ordering)

請依照 **「由外而內」** 的順序撰寫 Class：

1.  **佈局與定位 (Layout)**: `flex`, `grid`, `absolute`, `fixed`, `z-index`
2.  **盒模型 (Box Model)**: `w-`, `h-`, `m-` (margin), `p-` (padding)
3.  **文字與內容 (Typography)**: `text-`, `font-`, `leading-`
4.  **視覺裝飾 (Visuals)**: `bg-`, `border-`, `rounded-`, `shadow-`, `opacity-`

**範例：**

```html
<div
  class="flex w-full items-center justify-between rounded-lg bg-blue-500 p-4 text-white shadow-md"
>
  ...
</div>
```

### 5.2 響應式設計 (Mobile First)

Pawdar 是手機優先的網頁，**不加前綴的 class 即為手機樣式**。

- **手機 (預設)**: 寬度 100% (`w-full`)
- **平板 (md: 768px+)**: 寬度 50% (`md:w-1/2`)
- **桌機 (lg: 1024px+)**: 寬度 33% (`lg:w-1/3`)

**寫法：**

```html
<div class="w-full md:w-1/2 lg:w-1/3">...</div>
```

### 5.3 避免 Magic Numbers

盡量使用 Tailwind 預設的間距系統 (`p-4` = 1rem = 16px)。
除非設計稿有極度特殊的像素要求，否則**禁止**使用任意值寫法。

- ❌ `w-[137px]`, `mt-[3px]` (難以維護，破壞設計系統)
- ✅ `w-32`, `mt-1`

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

_設定完成後，只要按下 `Ctrl + S` (存檔)，程式碼就會自動變整齊！_

---

## 7. Git 與 GitHub 協作流程 (詳細版)

**絕對禁止** 直接 Push 到 `main` 或 `dev` 分支！

### 7.1 分支命名規範

- `feat/功能名稱`：開發新功能 (e.g., `feat/chat-room`)
- `fix/Bug名稱`：修復錯誤 (e.g., `fix/login-error`)
- `style/樣式名稱`：僅調整 CSS (e.g., `style/navbar-color`)
- `refactor/重構內容`：程式碼優化，不影響功能 (e.g., `refactor/socket-logic`)

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

    - 到 GitHub 建立 **Pull Request (PR)**。
    - 選擇 `base: dev` <- `compare: feat/my-feature-name`。
    - **審核規則**：至少 1 位隊友 Approve 後才可 Merge。

---

## 8. 團隊管理與 MVP 策略

### 8.1 任務管理 (Kanban)

- **WIP (Work In Progress) 限制**：每人同時只能進行 **一張** 卡片。做完推上去再拿下一張。
- **卡住求救機制**：若遇到 Bug 卡關超過 **2 小時**，**必須**在群組提出求救，禁止單打獨鬥浪費時間。

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
