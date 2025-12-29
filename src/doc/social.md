# PetPetNi 圖片上傳、通知系統、已讀未讀

> 從用戶拍照選圖 → 壓縮上傳 → 發布動態牆 → 實時推送通知 → 聊天已讀未讀 → 在線狀態
>
> 包含：前端全部程式碼、後端 API、資料庫設計、實時通信

---

## 📋 目錄

1. [架構總覽](#架構總覽)
2. [完整的端到端流程圖](#完整的端到端流程圖)
3. [前端實作（MVP + P1 + P2）](#前端實作)
4. [後端實作（MVP + P1 + P2）](#後端實作)
5. [資料庫設計](#資料庫設計)
6. [實時通信（Socket.io）](#實時通信)
7. [測試清單](#測試清單)

---

## 架構總覽

### 系統層級結構

```
┌─────────────────────────────────────────────────────────────────┐
│                          用戶看到的東西                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [動態牆頁面]                          [通知中心]  [聊天]       │
│  ┌──────────────────────────────┐     ┌────────┐  ┌────────┐  │
│  │ 🖼️ PostComposer             │     │ 🔔 5   │  │💬 3   │  │
│  │ (拍照+選圖+發布)             │     │未讀   │  │未讀  │  │
│  │                              │     └────────┘  └────────┘  │
│  │ ────────────────────────────│                             │
│  │ [新貼文] + 圖片              │                             │
│  │ ────────────────────────────│                             │
│  │ [舊貼文] + 圖片              │                             │
│  └──────────────────────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↓                      ↓
    REST API               REST API              Socket.io
    (MVP/P1)              (P1/P2)               (P2)
         ↓                    ↓                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                        後端服務                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/social/posts    GET /api/notifications             │
│  GET /api/social/posts     POST /api/messages                 │
│  POST /api/posts/{id}/like POST /api/notifications/{id}/read │
│                                                                 │
│  [驗證邏輯]  [業務邏輯]  [WebSocket Server]                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ↓                    ↓                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                          資料庫層                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  posts表      comments表      notifications表                  │
│  messages表   conversations表  user_statuses表                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 核心概念

```
主要功能：
  1. 動態牆（貼文 + 圖片）
  2. 通知系統（通知中心 + 已讀未讀）
  3. 聊天系統（聊天列表 + 聊天窗口 + 在線狀態）
```

---

## 完整的端到端流程圖

### 場景：用戶 A 發布含 2 張圖片的貼文，用戶 B 看到並按讚

#### 時間軸（每 2 秒一個事件）

```
T0:00  [用戶 A 打開 PetPetNi App]
       前端：加載動態牆、通知、聊天列表
       後端：連接 Socket.io，發送 emit('user:online')
       
T0:05  [用戶 A 點 PostComposer]
       前端：彈出發文窗口
       
T0:10  [用戶 A 輸入文字]
       前端：`content = '我的寵物日常 🐕'`
       
T0:15  [用戶 A 點「上傳」按鈕]
       前端：在 <input type="file"> 標籤上確保有 accept="image/*"。
       * iPhone/Android：當用戶點擊這個 input 時，系統會自動彈出底部選單，選項包含：「拍照 (Camera)」、「圖庫 (Photo Library)」、「檔案 (Files)」。
       * 電腦：跳出檔案總管。
       
T0:20  [用戶 A 上傳第 1 張照片]
       前端：
         1. 建立本地 Blob URL 預覽（秒級）
         2. 顯示縮圖 + Loading 轉圈
         3. 開始壓縮（browser-image-compression）
         4. 上傳到 Cloudinary
       
T0:22  [上傳進度 50%]
       前端：顯示進度條「⏳ 50%」
       
T0:24  [第 1 張上傳完成]
       前端：
         1. 顯示 ✓ 綠色邊框
         2. 拿到 Cloudinary URL
         3. 存入 images[] 陣列
         4. Toast: '圖片已上傳 (450KB)'
       Cloudinary：檔案已保存
       
T0:28  [用戶 A 點「上傳」再選第 2 張]
       前端：同樣的流程...
       
T0:35  [第 2 張上傳完成]
       前端：2 張都成功了，✓✓
       
T0:36  [用戶 A 點「發布」按鈕]
       前端：
         1. 檢查所有圖片上傳成功 ✓
         2. 組合數據：
            {
              content: '我的寵物日常 🐕',
              imageUrls: [
                'https://res.cloudinary.com/.../img1.jpg',
                'https://res.cloudinary.com/.../img2.jpg'
              ]
            }
         3. POST /api/social/posts
       
T0:37  [後端接收請求]
       後端：
         1. 驗證 token（檢查 A 登入了沒）
         2. 驗證 imageUrls（確保來自你的 Cloudinary）
         3. 驗證文字長度（< 500 字）
         4. INSERT INTO posts 表
         5. 回傳新貼文：
            {
              id: 12345,
              userId: 'A123',
              content: '我的寵物日常 🐕',
              imageUrls: [...],
              createdAt: '2025-12-29T10:37:00Z',
              likeCount: 0,
              commentCount: 0
            }
       資料庫：posts 表新增 1 筆記錄
       
T0:38  [前端接收回應]
       前端：
         1. 清空 PostComposer 表單
         2. 在動態牆最上面插入新貼文
         3. 關閉發文窗口
         4. Toast: '貼文已發布！'
         5. Pinia: 更新 postsStore
       
T0:40  [用戶 B 刷新動態牆]
       前端 B：
         1. GET /api/social/posts?limit=20
         2. 後端回傳最新貼文（包括 A 的新貼文）
         3. 動態牆顯示 A 的貼文 + 2 張圖片
       
T0:42  [用戶 B 看到 A 的貼文，點「讚」👍]
       前端 B：
         1. POST /api/posts/12345/like
       
T0:43  [後端接收點讚]
       後端：
         1. 驗證 B 登入了
         2. INSERT INTO post_likes（B 讚了 A 的貼文）
         3. 更新 posts.like_count（0 → 1）
         4. 建立通知：
            {
              recipientId: 'A123',  ← A
              actorId: 'B456',      ← B
              type: 'like',
              content: '讚了你的貼文',
              targetId: 12345,
              isRead: false,
              createdAt: '2025-12-29T10:43:00Z'
            }
         5. INSERT INTO notifications
         6. 透過 Socket.io 推送給 A：
            io.to(`user_A123`).emit(
              'notification:new',
              { type: 'like', actor: {...}, ... }
            )
       
T0:44  [用戶 A 即時收到通知]
       前端 A（Socket.io）：
         1. 監聽 socket.on('notification:new', ...)
         2. 更新 Pinia: useNotificationStore.unreadCount++
         3. 通知鈴鐺變紅：🔔5 → 🔔6
         4. Toast: '橘子 讚了你的貼文'（可選）
       
T0:45  [用戶 A 點開通知中心]
       前端 A：
         1. GET /api/notifications?limit=20
         2. 顯示通知列表：
            ┌─────────────────────────┐
            │ 橘子 讚了你的貼文      │ 未讀 ●
            │ 1 秒鐘前               │
            └─────────────────────────┘
         3. 用戶點通知 → 跳到貼文頁面
         4. 自動標記為已讀：
            POST /api/notifications/{id}/read
       
T0:46  [用戶 A 看完通知]
       前端 A：
         1. 更新 Pinia: notification.isRead = true
         2. 通知鈴鐺變灰：🔔6 → 🔔5
       
[同時發生] [用戶 B 開啟聊天，給 A 發訊息]
       
T0:50  [用戶 B 點開 A 的聊天窗口，輸入「你的寵物好可愛！」]
       前端 B：
         1. POST /api/conversations/chat_A123_B456/messages
         2. 本地顯示訊息（✓ 已傳送）
       
T0:51  [後端接收訊息]
       後端：
         1. INSERT INTO messages
         2. 透過 Socket.io 推送給 A：
            io.to(`user_A123`).emit(
              'chat:message:new',
              {
                conversationId: 'chat_A123_B456',
                content: '你的寵物好可愛！',
                senderId: 'B456',
                senderName: '橘子',
                createdAt: '2025-12-29T10:51:00Z'
              }
            )
       
T0:52  [用戶 A 即時收到訊息]
       前端 A（Socket.io）：
         1. 監聽 socket.on('chat:message:new', ...)
         2. 如果聊天窗口開著：
            - 自動標記為已讀
            - POST /api/messages/{id}/read
            - 訊息上顯示「✓✓ 已讀」
         3. 如果聊天窗口沒開：
            - 更新聊天列表（unreadCount++）
            - 聊天圖示變紅：💬3 → 💬4
            - Toast: '橘子：你的寵物好可愛！'
       
T0:53  [用戶 A 有聊天窗口開著]
       前端 A：
         1. 訊息立即顯示
         2. 自動發送 emit('chat:message:read', {messageId})
         3. B 的訊息上顯示「✓✓ 已讀」（2 個對勾）
       
T0:54  [用戶 B 看到訊息已讀]
       前端 B（Socket.io）：
         1. 監聽 socket.on('chat:message:read', ...)
         2. 更新本地訊息：✓ → ✓✓
         3. 看起來很流暢

[同時發生] [在線狀態更新]

T0:55  [用戶 A 和 B 的在線狀態]
       前端 A 和 B：
         1. 定期發送 socket.emit('user:heartbeat', ...)
         2. 後端更新 user_statuses.last_seen_at
       
       前端 A 聊天窗口：
         顯示「橘子 🟢 在線」
       
       前端 B 聊天窗口：
         顯示「你 🟢 在線」
       
       如果 A 離開：
         - 前端發送 socket.emit('user:offline')
         - 後端更新 user_statuses.status = 'offline'
         - B 看到「你 🔴 5 分鐘前在線」

[流程結束]

最終結果：
  用戶 A：
    ✓ 貼文發布成功（2 張圖片）
    ✓ 收到通知（B 讚了）
    ✓ 收到聊天訊息（B 傳訊息）
    ✓ 能看到 B 在線
    
  用戶 B：
    ✓ 看到 A 的新貼文 + 圖片
    ✓ 能給 A 按讚
    ✓ 能和 A 聊天
    ✓ 能看到 A 在線

---

## 前端實作

### 檔案結構（完整版）

**更新說明**：為了符合 `Guide.md` 的專案規範，我們將 Axios 實體放在 `src/api/index.js`，而具體的 API 呼叫則放在對應的模組檔案中。

```
src/
├── api/                       ← 🆕 API 統一管理
│   ├── index.js               ← Axios 核心設定 (Interceptor, Token)
│   ├── social.js              ← 社群相關 API (MVP)
│   ├── notification.js        ← 通知相關 API (P1)
│   └── chat.js                ← 聊天相關 API (P1)
│
├── composables/
│   ├── useImageUpload.js      ← 圖片壓縮 + 上傳
│   ├── useToast.js            ← Toast 通知
│   └── useSocket.js           ← Socket.io（P2）
│
├── stores/
│   ├── usePostStore.js        ← 動態牆狀態
│   ├── useNotificationStore.js
│   ├── useChatStore.js
│   └── useUserStatusStore.js
│
├── components/
│   ├── Social/
│   │   ├── PostComposer.vue   ← 發文窗口
│   │   ├── PostCard.vue       ← 單個貼文
│   │   └── PostFeed.vue       ← 貼文列表
│   │
│   ├── Notification/
│   │   └── ...
│   │
│   ├── Chat/
│   │   └── ...
│   │
│   └── Share/
│       └── SimpleToast.vue    ← Toast UI
│
├── utils/
│   ├── cloudinaryUrl.js       ← URL 工具
│   └── socket.js              ← Socket.io 客戶端
│
└── views/
    └── SocialView.vue         ← 動態牆頁面
```

### Step 1: 安裝套件

```bash
npm install axios browser-image-compression socket.io-client
```

### Step 1.5: 建立 API 核心 (src/api/index.js)

```javascript
// src/api/index.js
import axios from 'axios'

// 建立 axios 實體
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: 自動帶入 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // 假設 Token 存在這裡
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: 統一錯誤處理 (可選)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expired or unauthorized')
      // TODO: 導向登入頁
    }
    return Promise.reject(error)
  }
)

export default api
```

### Step 1.6: 建立社群 API 模組 (src/api/social.js)

```javascript
// src/api/social.js
import api from './index'

export const socialApi = {
  // 取得貼文列表
  getPosts(params) {
    return api.get('/social/posts', { params })
  },
  
  // 發布貼文
  createPost(data) {
    return api.post('/social/posts', data)
  },
  
  // 按讚
  likePost(postId) {
    return api.post(`/social/posts/${postId}/like`)
  },
  
  // 取消讚
  unlikePost(postId) {
    return api.delete(`/social/posts/${postId}/like`)
  }
}
```

### Step 2: useImageUpload.js（圖片邏輯）

```javascript
// src/composables/useImageUpload.js

// 註：這是一個純邏輯 Composable，不依賴 Vue 的響應式狀態 (ref)，保持純淨。
import imageCompression from 'browser-image-compression'
import axios from 'axios'

/**
 * 圖片上傳 Composable
 * 負責：壓縮 + 上傳到 Cloudinary
 */
export const useImageUpload = () => {
  const CLOUDINARY_NAME = import.meta.env.VITE_CLOUDINARY_NAME
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  const CLOUDINARY_FOLDER = 'petpetni/social'

  /**
   * 壓縮圖片
   * @param {File} file
   * @returns {Promise<{blob, sizeKB, originalSizeKB}>}
   */
  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8
      }

      const compressed = await imageCompression(file, options)

      return {
        blob: compressed,
        sizeKB: Math.round(compressed.size / 1024),
        originalSizeKB: Math.round(file.size / 1024)
      }
    } catch (error) {
      console.error('[compressImage] 失敗:', error)
      throw new Error('圖片壓縮失敗')
    }
  }

  /**
   * 上傳到 Cloudinary
   * @param {Blob} blob
   * @param {Function} onProgress - 進度回調 (0-100)
   * @returns {Promise<{url, publicId, width, height}>}
   */
  const uploadToCloudinary = async (blob, onProgress) => {
    const formData = new FormData()
    formData.append('file', blob)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', CLOUDINARY_FOLDER)

    try {
      // ⚠️ 注意：Cloudinary 的 API 不走我們的後端，所以直接用 axios 而不是 api 實體
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              onProgress(percent)
            }
          }
        }
      )

      return {
        url: res.data.secure_url,
        publicId: res.data.public_id,
        width: res.data.width,
        height: res.data.height
      }
    } catch (error) {
      console.error('[uploadToCloudinary] 失敗:', error)
      throw new Error('圖片上傳失敗，請檢查網路或稍後再試')
    }
  }

  return {
    compressImage,
    uploadToCloudinary
  }
}
```

### Step 3: useToast.js（通知 Composable）

```javascript
// src/composables/useToast.js

import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

/**
 * Toast 通知系統
 * 用途：臨時反饋（3 秒自動消失）
 */
export const useToast = () => {
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = ++toastId

    toasts.value.push({
      id,
      message,
      type, // 'success' | 'error' | 'info'
      duration
    })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)

    return id
  }

  const success = (message, duration = 3000) => showToast(message, 'success', duration)
  const error = (message, duration = 3000) => showToast(message, 'error', duration)
  const info = (message, duration = 3000) => showToast(message, 'info', duration)

  return { toasts, showToast, success, error, info }
}
```

### Step 4: SimpleToast.vue（UI - 修正版）

**修正說明**：
1.  移除 `@apply` 寫法，改用 Tailwind Utility Classes 直接寫在 template，符合 `Style.md` 規範。
2.  Z-Index 設為 `z-50` (Standard Tailwind)，避免過大的魔術數字。
3.  位置調整為 `top-20` (Header 下方)，避免被手機版底部導航 (`Navbar`) 遮擋。
4.  顏色使用標準 Tailwind 色系。

```vue
<!-- src/components/Share/SimpleToast.vue -->

<template>
  <div class="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto relative flex min-w-[250px] items-center gap-3 overflow-hidden rounded-lg px-4 py-3 shadow-lg transition-all"
        :class="{
          'bg-green-600 text-white': toast.type === 'success',
          'bg-red-600 text-white': toast.type === 'error',
          'bg-blue-600 text-white': toast.type === 'info'
        }"
      >
        <!-- Icon -->
        <span class="text-lg font-bold">
          {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ️' }}
        </span>
        
        <!-- Message -->
        <span class="text-sm font-medium">{{ toast.message }}</span>
        
        <!-- Progress Bar -->
        <div 
          class="absolute bottom-0 left-0 h-1 bg-white/30" 
          :style="{ animation: `progress ${toast.duration}ms linear forwards` }" 
        />
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<style scoped>
@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

### Step 5: usePostStore.js（Pinia - 動態牆）

```javascript
// src/stores/usePostStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { socialApi } from '@/api/social' // 🆕 引用 API 模組

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const isLoading = ref(false)

  // 取得貼文列表
  const fetchPosts = async (limit = 20, offset = 0) => {
    isLoading.value = true
    try {
      const res = await socialApi.getPosts({ limit, offset })
      posts.value = res.data.data // 假設後端回傳格式為 { data: [], total: ... }
    } catch (err) {
      console.error('[fetchPosts]', err)
    } finally {
      isLoading.value = false
    }
  }

  // 發布新貼文
  const createPost = async (content, imageUrls = []) => {
    try {
      const res = await socialApi.createPost({ content, imageUrls })
      const newPost = res.data

      // 新貼文加到最上面
      posts.value.unshift(newPost)

      return newPost
    } catch (err) {
      console.error('[createPost]', err)
      throw err
    }
  }

  // 按讚
  const likePost = async (postId) => {
    try {
      await socialApi.likePost(postId)

      // 更新本地狀態
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.likeCount += 1
        post.isLiked = true
      }

      return true
    } catch (err) {
      console.error('[likePost]', err)
      throw err
    }
  }

  // 取消讚
  const unlikePost = async (postId) => {
    try {
      await socialApi.unlikePost(postId)

      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.likeCount -= 1
        post.isLiked = false
      }

      return true
    } catch (err) {
      console.error('[unlikePost]', err)
      throw err
    }
  }

  return {
    posts,
    isLoading,
    fetchPosts,
    createPost,
    likePost,
    unlikePost
  }
})
```

### Step 6: PostComposer.vue（核心組件 - 修正版）

**修正說明**：
1.  **Style**：替換所有硬編碼顏色 (`bg-zinc-200` -> `bg-bg-base`, `text-zinc-400` -> `text-fg-muted`)，符合 `Style.md` 的 Design Tokens。
2.  **Props**：嚴格定義 Props (使用 Object 語法)。
3.  **Components**：按鈕改用 `.c-btn--primary`。

```vue
<!-- src/components/Social/PostComposer.vue -->

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload'
import { useToast } from '@/composables/useToast'
import { usePostStore } from '@/stores/usePostStore'

// =================== Props & Emits ===================
const props = defineProps({
  username: {
    type: String,
    default: '使用者'
  },
  maxLength: {
    type: Number,
    default: 500
  }
})

const emit = defineEmits(['submit'])

// =================== Composables ===================
const { compressImage, uploadToCloudinary } = useImageUpload()
const { success, error, info } = useToast()
const postStore = usePostStore()

// =================== Refs（狀態） ===================
const open = ref(false)
const content = ref('')
const textareaRef = ref(null)
const fileInputRef = ref(null)
const cameraInputRef = ref(null)
const images = ref([])
const isSubmitting = ref(false)
const audience = ref('🌐所有人')
const audienceOpen = ref(false)

// =================== Computed ===================
const countText = computed(() => `${content.value.length}/${props.maxLength}`)

const canSubmit = computed(() => {
  const hasContent = content.value.trim().length > 0
  const hasImages = images.value.length > 0
  const allReady = images.value.every(img => img.uploadStatus === 'success')
  return (hasContent || hasImages) && allReady && !isSubmitting.value
})

const uploadingCount = computed(() =>
  images.value.filter(img => img.uploadStatus === 'uploading').length
)

// =================== Methods ===================

// 自動調整 textarea 高度
const autoResize = () => {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(open, async (v) => {
  if (!v) return
  await nextTick()
  autoResize()
  textareaRef.value?.focus()
})

watch(content, () => {
  autoResize()
})

// 觸發檔案選擇
const triggerImageUpload = () => {
  fileInputRef.value?.click()
}

// 觸發相機拍照（新增！）
const triggerCameraCapture = () => {
  cameraInputRef.value?.click()
}

// 處理檔案選擇（共用邏輯）
const handleFileChange = async (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  if (files.length > 1) {
    info(`正在上傳 ${files.length} 張圖片...`)
  }

  for (const file of files) {
    // 檢查是否為圖片
    if (!file.type.startsWith('image/')) {
      error('只能上傳圖片檔案')
      continue
    }

    try {
      // ========== 步驟 1️⃣：壓縮 ==========
      const { blob, sizeKB } = await compressImage(file)
      const previewUrl = URL.createObjectURL(blob)

      const imgId = Date.now() + Math.random().toString(36).substr(2, 9)

      images.value.push({
        id: imgId,
        file: new File([blob], file.name, { type: blob.type }),
        url: previewUrl,
        cloudinaryUrl: null,
        uploadStatus: 'uploading',
        uploadProgress: 0,
        error: null,
        sizeKB
      })

      // ========== 步驟 2️⃣：上傳到 Cloudinary ==========
      const imgIndex = images.value.findIndex(img => img.id === imgId)

      const result = await uploadToCloudinary(blob, (progress) => {
        images.value[imgIndex].uploadProgress = Math.round(progress)
      })

      // ========== 步驟 3️⃣：上傳成功 ==========
      images.value[imgIndex].cloudinaryUrl = result.url
      images.value[imgIndex].uploadStatus = 'success'
      images.value[imgIndex].uploadProgress = 100

      success(`圖片已上傳 (${sizeKB}KB)`, 2000)

    } catch (err) {
      console.error('圖片處理失敗:', err)
      images.value[images.value.length - 1].uploadStatus = 'error'
      images.value[images.value.length - 1].error = err.message
      error(`圖片上傳失敗: ${err.message}`)
    }
  }

  // 清空 input
  event.target.value = ''
}

// 移除圖片
const removeImage = (index) => {
  URL.revokeObjectURL(images.value[index].url)
  images.value.splice(index, 1)
  info('已移除圖片', 1500)
}

// 發布貼文
const submit = async () => {
  if (!canSubmit.value) {
    error('請先上傳圖片或輸入文字')
    return
  }

  if (uploadingCount.value > 0) {
    error('還有圖片在上傳中，請稍候...')
    return
  }

  isSubmitting.value = true

  try {
    // 取出已成功上傳的圖片 URL
    const imageUrls = images.value
      .filter(img => img.uploadStatus === 'success')
      .map(img => img.cloudinaryUrl)

    // 發布到後端
    await postStore.createPost(content.value, imageUrls)

    // 重置表單
    content.value = ''
    images.value.forEach(img => URL.revokeObjectURL(img.url))
    images.value = []

    success('貼文已發布！', 2000)
    open.value = false

  } catch (err) {
    error(`發布失敗: ${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

const close = () => {
  open.value = false
}

const setAudience = (v) => {
  audience.value = v
  audienceOpen.value = false
}
</script>

<template>
  <!-- 隱藏的檔案輸入 -->
  <input
    ref="fileInputRef"
    type="file"
    multiple
    accept="image/*"
    class="hidden"
    @change="handleFileChange"
  />

  <!-- 隱藏的相機輸入（新增！） -->
  <input
    ref="cameraInputRef"
    type="file"
    accept="image/*"
    capture="environment"
    class="hidden"
    @change="handleFileChange"
  />

  <!-- 手機：入口按鈕 -->
  <button
    type="button"
    class="c-card mt-4 flex w-full items-center gap-3 py-3 text-left md:hidden"
    @click="open = true"
  >
    <div class="h-10 w-10 rounded-full bg-bg-base"></div>
    <div class="text-sm text-fg-muted">輸入文字或分享圖片</div>
  </button>

  <!-- 桌機：Inline 發文 -->
  <section class="c-card mt-4 hidden bg-bg-surface p-4 md:block">
    <div class="flex items-start gap-3">
      <div class="h-10 w-10 rounded-full bg-bg-base"></div>

      <div class="min-w-0 flex-1">
        <textarea
          ref="textareaRef"
          v-model="content"
          class="min-h-16 w-full resize-none bg-transparent text-sm outline-none text-fg-primary"
          placeholder="輸入文字"
          :maxlength="maxLength"
        />

        <!-- 圖片預覽區 -->
        <div v-if="images.length > 0" class="mt-3 flex flex-wrap gap-2">
          <div
            v-for="(img, index) in images"
            :key="img.id"
            class="relative h-24 w-24 overflow-hidden rounded-xl border-2"
            :class="{
              'border-red-500': img.uploadStatus === 'error',
              'border-yellow-500': img.uploadStatus === 'uploading',
              'border-green-500': img.uploadStatus === 'success'
            }"
          >
            <img :src="img.url" class="h-full w-full object-cover" />

            <!-- 上傳進度 -->
            <div v-if="img.uploadStatus === 'uploading'" class="absolute inset-0 flex items-center justify-center bg-black/40">
              <div class="text-center">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <div class="text-xs text-white mt-1">{{ img.uploadProgress }}%</div>
              </div>
            </div>

            <!-- 上傳失敗 -->
            <div v-if="img.uploadStatus === 'error'" class="absolute inset-0 flex items-center justify-center bg-red-500/50">
              <span class="text-2xl">⚠️</span>
            </div>

            <!-- 刪除按鈕 -->
            <button
              type="button"
              class="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
              @click="removeImage(index)"
            >
              ✕
            </button>

            <!-- 檔案大小 -->
            <div class="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded">
              {{ img.sizeKB }}KB
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <div class="flex items-center gap-5 text-fg-secondary">
            <!-- 上傳按鈕 -->
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full hover:bg-bg-base"
              title="從相簿選擇"
              @click="triggerImageUpload"
            >
              🖼️
            </button>

            <!-- 拍照按鈕（新增！） -->
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full hover:bg-bg-base"
              title="拍照"
              @click="triggerCameraCapture"
            >
              📷
            </button>

            <!-- Hashtag（暫無功能） -->
            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-full hover:bg-bg-base"
            >
              #
            </button>
          </div>

          <div class="flex items-center gap-3">
            <!-- 分享對象 -->
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg bg-bg-base px-3 py-2 text-sm hover:bg-zinc-200"
              @click="audienceOpen = !audienceOpen"
            >
              {{ audience }}
              <span class="text-fg-muted">▼</span>
            </button>

            <!-- 下拉菜單 -->
            <div v-if="audienceOpen" class="absolute top-12 right-0 z-10 w-40 rounded-xl border bg-bg-surface p-1 shadow">
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-base"
                @click="setAudience('🌐所有人')"
              >
                🌐 所有人
              </button>
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-base"
                @click="setAudience('👥好友')"
              >
                👥 好友
              </button>
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-base"
                @click="setAudience('🔒只限自己')"
              >
                🔒 只限自己
              </button>
            </div>

            <!-- 字數 -->
            <div class="text-sm text-fg-muted">{{ countText }}</div>

            <!-- 發布按鈕 (使用 .c-btn--primary) -->
            <button
              type="button"
              class="c-btn--primary px-5 py-2 text-sm disabled:opacity-50"
              :disabled="!canSubmit"
              @click="submit"
            >
              {{ uploadingCount > 0 ? '上傳中...' : '發布' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 手機：Modal 彈窗 -->
  <div v-if="open" class="fixed inset-0 z-60 md:hidden">
    <div class="absolute inset-0 bg-black/60" @click="close"></div>

    <div class="relative mx-auto flex h-full max-w-130 items-center p-4">
      <section class="w-full rounded-2xl bg-bg-surface p-4 shadow-lg">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-bg-base"></div>
            <div>
              <div class="text-sm font-semibold text-fg-primary">{{ username }}</div>
              <button
                type="button"
                class="mt-1 inline-flex items-center gap-2 rounded-lg bg-bg-base px-3 py-1.5 text-xs"
              >
                🌐 所有人
              </button>
            </div>
          </div>

          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full hover:bg-bg-base"
            @click="close"
          >
            ×
          </button>
        </div>

        <!-- Textarea -->
        <textarea
          ref="textareaRef"
          v-model="content"
          class="w-full resize-none bg-transparent text-base leading-7 outline-none text-fg-primary"
          placeholder="輸入文字"
          :maxlength="maxLength"
          rows="3"
        />

        <!-- 圖片預覽（手機版） -->
        <div v-if="images.length > 0" class="mt-3 flex gap-2 overflow-x-auto pb-2">
          <div
            v-for="(img, index) in images"
            :key="img.id"
            class="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2"
            :class="{
              'border-red-500': img.uploadStatus === 'error',
              'border-yellow-500': img.uploadStatus === 'uploading',
              'border-green-500': img.uploadStatus === 'success'
            }"
          >
            <img :src="img.url" class="h-full w-full object-cover" />

            <div v-if="img.uploadStatus === 'uploading'" class="absolute inset-0 flex items-center justify-center bg-black/40">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>

            <div v-if="img.uploadStatus === 'error'" class="absolute inset-0 flex items-center justify-center bg-red-500/50">
              <span class="text-2xl">⚠️</span>
            </div>

            <button
              type="button"
              class="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70"
              @click="removeImage(index)"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="mt-4 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full bg-bg-base"
              @click="triggerImageUpload"
            >
              🖼️
            </button>

            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full bg-bg-base"
              @click="triggerCameraCapture"
            >
              📷
            </button>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-xs text-fg-muted">{{ countText }}</div>
            <button
              type="button"
              class="c-btn--primary px-4 py-2 text-sm disabled:opacity-50"
              :disabled="!canSubmit"
              @click="submit"
            >
              {{ uploadingCount > 0 ? '上傳中...' : '發布' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
```

### Step 7: useNotificationStore.js（Pinia - 通知，P1）

```javascript
// src/stores/useNotificationStore.js（P1）

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index' // 🆕 使用新的路徑

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const isLoading = ref(false)

  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.isRead).length
  )

  const fetchNotifications = async (limit = 20) => {
    isLoading.value = true
    try {
      const res = await api.get('/notifications', { params: { limit } })
      notifications.value = res.data
    } catch (err) {
      console.error('[fetchNotifications]', err)
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`/notifications/${notificationId}/read`)

      const n = notifications.value.find(x => x.id === notificationId)
      if (n) {
        n.isRead = true
        n.readAt = new Date().toISOString()
      }
    } catch (err) {
      console.error('[markAsRead]', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all')
      notifications.value.forEach(n => {
        n.isRead = true
      })
    } catch (err) {
      console.error('[markAllAsRead]', err)
    }
  }

  // Socket.io 實時接收新通知（P2）
  const addNotification = (notification) => {
    notifications.value.unshift(notification)
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification
  }
})
```

### Step 8: useChatStore.js（Pinia - 聊天，P1）

```javascript
// src/stores/useChatStore.js（P1）

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index' // 🆕 使用新的路徑

export const useChatStore = defineStore('chat', () => {
  const conversations = ref([])
  const currentConversation = ref(null)
  const messages = ref([])
  const isLoading = ref(false)

  const totalUnreadCount = computed(() =>
    conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  )

  const fetchConversations = async () => {
    isLoading.value = true
    try {
      const res = await api.get('/conversations')
      conversations.value = res.data
    } catch (err) {
      console.error('[fetchConversations]', err)
    } finally {
      isLoading.value = false
    }
  }

  const openConversation = async (conversationId) => {
    const conv = conversations.value.find(c => c.id === conversationId)
    currentConversation.value = conv

    const res = await api.get(`/conversations/${conversationId}/messages`)
    messages.value = res.data

    if (conv && conv.unreadCount > 0) {
      await api.post(`/conversations/${conversationId}/read`)
      conv.unreadCount = 0
    }
  }

  const sendMessage = async (content) => {
    try {
      const res = await api.post(`/conversations/${currentConversation.value.id}/messages`, {
        content
      })

      const newMessage = res.data
      messages.value.push(newMessage)
    } catch (err) {
      console.error('[sendMessage]', err)
    }
  }

  // Socket.io 實時接收訊息（P2）
  const addMessage = (message) => {
    if (message.conversationId === currentConversation.value?.id) {
      messages.value.push(message)
    } else {
      const conv = conversations.value.find(c => c.id === message.conversationId)
      if (conv) {
        conv.unreadCount = (conv.unreadCount || 0) + 1
        conv.lastMessage = message.content
      }
    }
  }

  return {
    conversations,
    currentConversation,
    messages,
    totalUnreadCount,
    isLoading,
    fetchConversations,
    openConversation,
    sendMessage,
    addMessage
  }
})
```

### Step 9: useUserStatusStore.js（Pinia - 在線狀態，P2）

```javascript
// src/stores/useUserStatusStore.js（P2）

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStatusStore = defineStore('userStatus', () => {
  const onlineUsers = ref(new Set())
  const userStatuses = ref({})

  const getUserStatus = (userId) => {
    const status = userStatuses.value[userId]
    if (!status) return { status: 'offline', lastSeenAt: null }
    return status
  }

  const setUserStatus = (userId, status, lastSeenAt = new Date()) => {
    userStatuses.value[userId] = { status, lastSeenAt }

    if (status === 'online') {
      onlineUsers.value.add(userId)
    } else {
      onlineUsers.value.delete(userId)
    }
  }

  const isUserOnline = (userId) => {
    return onlineUsers.value.has(userId)
  }

  return {
    onlineUsers,
    userStatuses,
    getUserStatus,
    setUserStatus,
    isUserOnline
  }
})
```

### Step 10: App.vue（加入 Toast）

```vue
<!-- src/App.vue -->

<template>
  <div class="flex flex-col min-h-screen w-full">
    <!-- 頂部 Header -->
    <AppHeader v-if="shouldShowHeader" />

    <!-- 主內容 -->
    <main class="flex-1 w-full">
      <RouterView />
    </main>

    <!-- 底部導航 -->
    <Navbar v-if="shouldShowNavbar" />

    <!-- 🆕 Toast 通知系統 -->
    <SimpleToast />
  </div>
</template>

<script setup>
import SimpleToast from '@/components/Share/SimpleToast.vue'
// ... 其他 imports ...
</script>
```

### Step 11: SocialView.vue（動態牆頁面）

```vue
<!-- src/views/SocialView.vue -->

<script setup>
import { onMounted, computed } from 'vue'
import { usePostStore } from '@/stores/usePostStore'
import { useToast } from '@/composables/useToast'
import PostComposer from '@/components/Social/PostComposer.vue'
import PostCard from '@/components/Social/PostCard.vue'

const postStore = usePostStore()
const { success, error } = useToast()

const leftPosts = computed(() =>
  postStore.posts.filter((_, i) => i % 2 === 0)
)

const rightPosts = computed(() =>
  postStore.posts.filter((_, i) => i % 2 !== 0)
)

onMounted(() => {
  postStore.fetchPosts()
})
</script>

<template>
  <div class="bg-bg-base">
    <div class="mx-10 min-h-screen">
      <main class="mx-auto w-full max-w-260 px-4 pb-16">
        <!-- PostComposer -->
        <PostComposer username="你的名字" />

        <!-- 手機版：單欄貼文列表 -->
        <section class="mt-4 flex flex-col gap-4 lg:hidden">
          <PostCard
            v-for="post in postStore.posts"
            :key="post.id"
            :post="post"
          />
        </section>

        <!-- 桌機版：雙欄 Masonry -->
        <section class="mt-6 hidden items-start gap-6 lg:flex">
          <div class="flex flex-1 flex-col gap-6">
            <PostCard
              v-for="post in leftPosts"
              :key="post.id"
              :post="post"
            />
          </div>
          <div class="flex flex-1 flex-col gap-6">
            <PostCard
              v-for="post in rightPosts"
              :key="post.id"
              :post="post"
            />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
```

### Step 12: 環境變數設定

```env
# .env.local

# Cloudinary
VITE_CLOUDINARY_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset-name

# 後端 API
VITE_API_BASE_URL=http://localhost:3001
```

---

## 後端實作

### Step 1: 核心 API（POST /api/social/posts - 發布貼文）

```javascript
// backend/routes/social.js

import express from 'express'
import db from '../db.js'
import { validateImageUrls, validateContent } from '../utils/validators.js'
import { requireAuth } from '../middleware/auth.js'
import { io } from '../io.js'

const router = express.Router()

/**
 * POST /api/social/posts
 * 發布新貼文
 */
router.post('/posts', requireAuth, async (req, res) => {
  try {
    const { content, imageUrls = [] } = req.body
    const userId = req.user.id

    // ========== 驗證 ==========
    if (!content && imageUrls.length === 0) {
      return res.status(400).json({
        error: '貼文必須有文字或圖片'
      })
    }

    const contentError = validateContent(content)
    if (contentError) {
      return res.status(400).json({ error: contentError })
    }

    const urlError = validateImageUrls(imageUrls)
    if (urlError) {
      return res.status(400).json({ error: urlError })
    }

    // ========== 寫入資料庫 ==========
    const result = await db.query(
      `INSERT INTO posts (user_id, content, image_urls, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, user_id, content, image_urls, created_at, like_count, comment_count`,
      [userId, content.trim(), JSON.stringify(imageUrls)]
    )

    const post = result.rows[0]

    // ========== 實時推送給所有在線用戶（P2） ==========
    io.emit('post:new', {
      id: post.id,
      userId: post.user_id,
      content: post.content,
      imageUrls: JSON.parse(post.image_urls),
      createdAt: post.created_at,
      likeCount: post.like_count,
      commentCount: post.comment_count
    })

    // ========== 回應 ==========
    res.status(201).json({
      id: post.id,
      userId: post.user_id,
      content: post.content,
      imageUrls: JSON.parse(post.image_urls),
      createdAt: post.created_at,
      likeCount: post.like_count,
      commentCount: post.comment_count
    })

  } catch (error) {
    console.error('[POST /api/social/posts]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

/**
 * GET /api/social/posts
 * 取得貼文列表（分頁）
 */
router.get('/posts', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const offset = parseInt(req.query.offset) || 0

    const result = await db.query(
      `SELECT p.id, p.user_id, p.content, p.image_urls, 
              p.created_at, p.like_count, p.comment_count,
              u.username as author
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const countResult = await db.query('SELECT COUNT(*) FROM posts')
    const total = parseInt(countResult.rows[0].count)

    const posts = result.rows.map(p => ({
      id: p.id,
      userId: p.user_id,
      author: p.author || 'anonymous',
      content: p.content,
      imageUrls: JSON.parse(p.image_urls || '[]'),
      createdAt: p.created_at,
      likeCount: p.like_count,
      commentCount: p.comment_count
    }))

    res.json({ data: posts, total })

  } catch (error) {
    console.error('[GET /api/social/posts]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

/**
 * POST /api/social/posts/{id}/like
 * 按讚
 */
router.post('/posts/:postId/like', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params
    const userId = req.user.id

    // 新增讚記錄
    await db.query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [postId, userId]
    )

    // 更新讚數
    const result = await db.query(
      `UPDATE posts SET like_count = like_count + 1
       WHERE id = $1 AND NOT EXISTS (
         SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2
       )
       RETURNING like_count`,
      [postId, userId]
    )

    // 取得貼文作者，建立通知
    const postResult = await db.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    )

    const postAuthorId = postResult.rows[0]?.user_id

    if (postAuthorId && postAuthorId !== userId) {
      // 建立通知
      await db.query(
        `INSERT INTO notifications 
         (recipient_id, actor_id, type, content, target_id, target_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [postAuthorId, userId, 'like', '讚了你的貼文', postId, 'post']
      )

      // Socket.io 實時推送通知（P2）
      io.to(`user_${postAuthorId}`).emit('notification:new', {
        type: 'like',
        actor: { id: userId, name: req.user.username },
        content: '讚了你的貼文',
        targetId: postId
      })
    }

    res.json({ success: true })

  } catch (error) {
    console.error('[POST /api/social/posts/:postId/like]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

export default router
```

### Step 2: 通知 API（P1）

```javascript
// backend/routes/notifications.js（P1）

import express from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/notifications
 * 取得通知列表
 */
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)
    const userId = req.user.id

    const result = await db.query(
      `SELECT n.id, n.type, n.content, n.target_id, n.is_read, n.created_at,
              u.id as actor_id, u.username as actor_name, u.avatar_url
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit]
    )

    const notifications = result.rows.map(n => ({
      id: n.id,
      type: n.type,
      actor: { id: n.actor_id, name: n.actor_name, avatar: n.avatar_url },
      content: n.content,
      targetId: n.target_id,
      isRead: n.is_read,
      createdAt: n.created_at
    }))

    res.json(notifications)

  } catch (error) {
    console.error('[GET /api/notifications]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

/**
 * POST /api/notifications/{id}/read
 * 標記為已讀
 */
router.post('/notifications/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const { notificationId } = req.params

    await db.query(
      `UPDATE notifications 
       SET is_read = true, read_at = NOW()
       WHERE id = $1`,
      [notificationId]
    )

    res.json({ success: true })

  } catch (error) {
    console.error('[POST /api/notifications/:notificationId/read]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

/**
 * POST /api/notifications/read-all
 * 標記全部為已讀
 */
router.post('/notifications/read-all', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id

    await db.query(
      `UPDATE notifications 
       SET is_read = true, read_at = NOW()
       WHERE recipient_id = $1 AND is_read = false`,
      [userId]
    )

    res.json({ success: true })

  } catch (error) {
    console.error('[POST /api/notifications/read-all]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

export default router
```

### Step 3: 聊天 API（P1）

```javascript
// backend/routes/messages.js（P1）

import express from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { io } from '../io.js'

const router = express.Router()

/**
 * GET /api/conversations
 * 取得聊天列表
 */
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id

    const result = await db.query(
      `SELECT c.id, c.participant_1_id, c.participant_2_id,
              c.last_message, c.last_message_time,
              CASE 
                WHEN c.participant_1_id = $1 THEN c.participant_1_unread
                ELSE c.participant_2_unread
              END as unread_count,
              u.username, u.avatar_url
       FROM conversations c
       LEFT JOIN users u ON (
         CASE 
           WHEN c.participant_1_id = $1 THEN c.participant_2_id
           ELSE c.participant_1_id
         END = u.id
       )
       WHERE c.participant_1_id = $1 OR c.participant_2_id = $1
       ORDER BY c.last_message_time DESC`,
      [userId]
    )

    const conversations = result.rows.map(c => ({
      id: c.id,
      otherUser: { username: c.username, avatar: c.avatar_url },
      lastMessage: c.last_message,
      lastMessageTime: c.last_message_time,
      unreadCount: c.unread_count || 0
    }))

    res.json(conversations)

  } catch (error) {
    console.error('[GET /api/conversations]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

/**
 * POST /api/conversations/{id}/messages
 * 傳送訊息
 */
router.post('/conversations/:conversationId/messages', requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params
    const { content } = req.body
    const senderId = req.user.id

    // 新增訊息
    const result = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, sender_id, content, created_at, is_read`,
      [conversationId, senderId, content]
    )

    const message = result.rows[0]

    // Socket.io 實時推送（P2）
    io.to(`chat_${conversationId}`).emit('chat:message:new', {
      id: message.id,
      conversationId,
      content: message.content,
      senderId,
      createdAt: message.created_at,
      isRead: message.is_read
    })

    res.status(201).json(message)

  } catch (error) {
    console.error('[POST /api/conversations/:conversationId/messages]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

/**
 * POST /api/conversations/{id}/read
 * 標記聊天為已讀
 */
router.post('/conversations/:conversationId/read', requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user.id

    // 更新未讀計數
    await db.query(
      `UPDATE conversations 
       SET participant_1_unread = CASE WHEN participant_1_id = $1 THEN 0 ELSE participant_1_unread END,
           participant_2_unread = CASE WHEN participant_2_id = $1 THEN 0 ELSE participant_2_unread END
       WHERE id = $2`,
      [userId, conversationId]
    )

    // 標記訊息為已讀
    await db.query(
      `UPDATE messages 
       SET is_read = true, read_at = NOW()
       WHERE conversation_id = $1 AND is_read = false`,
      [conversationId]
    )

    res.json({ success: true })

  } catch (error) {
    console.error('[POST /api/conversations/:conversationId/read]', error)
    res.status(500).json({ error: '伺服器錯誤' })
  }
})

export default router
```

### Step 4: Socket.io 伺服器（P2）

```javascript
// backend/io.js（P2）

import { Server } from 'socket.io'
import db from './db.js'

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: 'http://localhost:5173' }
  })

  // 用戶在線狀態管理
  const userSockets = new Map()  // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`[Socket] 用戶連接: ${socket.id}`)

    // ========== 用戶上線 ==========
    socket.on('user:online', async (data) => {
      const userId = data.userId
      userSockets.set(userId, socket.id)

      // 更新資料庫
      await db.query(
        `UPDATE user_statuses 
         SET status = 'online', last_seen_at = NOW()
         WHERE user_id = $1`,
        [userId]
      )

      // 廣播用戶上線
      io.emit('user:status:changed', {
        userId,
        status: 'online'
      })

      console.log(`[Socket] 用戶 ${userId} 上線`)
    })

    // ========== 心跳包（保持在線） ==========
    socket.on('user:heartbeat', async (data) => {
      const userId = data.userId
      await db.query(
        `UPDATE user_statuses 
         SET last_seen_at = NOW()
         WHERE user_id = $1`,
        [userId]
      )
    })

    // ========== 實時通知 ==========
    socket.on('notification:create', async (data) => {
      const { recipientId, type, content, targetId } = data

      // 寫入資料庫
      await db.query(
        `INSERT INTO notifications 
         (recipient_id, actor_id, type, content, target_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [recipientId, data.actorId, type, content, targetId]
      )

      // 推送給接收者（如果在線）
      const recipientSocket = userSockets.get(recipientId)
      if (recipientSocket) {
        io.to(recipientSocket).emit('notification:new', data)
      }
    })

    // ========== 實時聊天 ==========
    socket.on('chat:message', async (data) => {
      const { conversationId, content, senderId } = data

      // 寫入資料庫
      const result = await db.query(
        `INSERT INTO messages (conversation_id, sender_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, created_at`,
        [conversationId, senderId, content]
      )

      const message = result.rows[0]

      // 推送給會話參與者
      io.to(`chat_${conversationId}`).emit('chat:message:new', {
        id: message.id,
        conversationId,
        content,
        senderId,
        createdAt: message.created_at,
        isRead: false
      })
    })

    // ========== 訊息已讀 ==========
    socket.on('chat:message:read', async (data) => {
      const { messageId, conversationId } = data

      // 更新資料庫
      await db.query(
        `UPDATE messages SET is_read = true, read_at = NOW()
         WHERE id = $1`,
        [messageId]
      )

      // 廣播已讀狀態
      io.to(`chat_${conversationId}`).emit('chat:message:read', {
        messageId,
        isRead: true
      })
    })

    // ========== 用戶下線 ==========
    socket.on('user:offline', async (data) => {
      const userId = data.userId
      userSockets.delete(userId)

      // 更新資料庫
      await db.query(
        `UPDATE user_statuses 
         SET status = 'offline', last_seen_at = NOW()
         WHERE user_id = $1`,
        [userId]
      )

      // 廣播用戶下線
      io.emit('user:status:changed', {
        userId,
        status: 'offline'
      })

      console.log(`[Socket] 用戶 ${userId} 下線`)
    })

    // ========== 斷線 ==========
    socket.on('disconnect', () => {
      console.log(`[Socket] 用戶斷線: ${socket.id}`)

      // 尋找斷線的用戶
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId)
          db.query(
            `UPDATE user_statuses 
             SET status = 'offline', last_seen_at = NOW()
             WHERE user_id = $1`,
            [userId]
          )
          break
        }
      }
    })
  })

  return io
}
```

---

## 資料庫設計

### 完整的 SQL Schema

```sql
-- =================== 基礎表 ===================

-- 使用者表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================== 動態牆表 ===================

-- 貼文表
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_urls JSONB NOT NULL DEFAULT '[]',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- 讚表
CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);

-- 留言表
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================== 通知表 ===================

-- 通知表
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  target_id INT,
  target_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =================== 聊天表 ===================

-- 聊天會話表
CREATE TABLE conversations (
  id VARCHAR(50) PRIMARY KEY,
  participant_1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_time TIMESTAMP,
  participant_1_unread INT DEFAULT 0,
  participant_2_unread INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);

-- 訊息表
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(50) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_receiver_read ON messages(sender_id, is_read);

-- =================== 在線狀態表 ===================

-- 用戶狀態表
CREATE TABLE user_statuses (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'offline',
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================== 插入測試資料 ===================

-- 測試用戶
INSERT INTO users (username, email, password_hash) VALUES
('user_a', 'a@example.com', 'hash_a'),
('user_b', 'b@example.com', 'hash_b');

-- 初始化狀態
INSERT INTO user_statuses (user_id, status) VALUES
(1, 'online'),
(2, 'offline');
```

---

## 實時通信（Socket.io）

### 前端：useSocket.js（P2）

```javascript
// src/utils/socket.js（P2）

import { io } from 'socket.io-client'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useChatStore } from '@/stores/useChatStore'
import { useUserStatusStore } from '@/stores/useUserStatusStore'
import { useToast } from '@/composables/useToast'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

let socket = null

/**
 * 初始化 Socket.io 連接
 */
export const initSocket = (userId) => {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { userId },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  })

  // ========== 連接事件 ==========
  socket.on('connect', () => {
    console.log('[Socket] 已連接:', socket.id)
    socket.emit('user:online', { userId })
  })

  socket.on('disconnect', () => {
    console.log('[Socket] 已斷開連接')
    socket.emit('user:offline', { userId })
  })

  // ========== 通知事件 ==========
  socket.on('notification:new', (notification) => {
    const notificationStore = useNotificationStore()
    const { info } = useToast()

    notificationStore.addNotification(notification)

    // 顯示 Toast（可選）
    info(`${notification.actor.name} ${notification.content}`)
  })

  // ========== 聊天事件 ==========
  socket.on('chat:message:new', (message) => {
    const chatStore = useChatStore()
    chatStore.addMessage(message)
  })

  socket.on('chat:message:read', (data) => {
    const chatStore = useChatStore()
    const msg = chatStore.messages.find(m => m.id === data.messageId)
    if (msg) msg.isRead = true
  })

  // ========== 在線狀態事件 ==========
  socket.on('user:status:changed', (data) => {
    const userStatusStore = useUserStatusStore()
    userStatusStore.setUserStatus(data.userId, data.status)
  })

  return socket
}

/**
 * 發送通知
 */
export const createNotification = (recipientId, type, content, targetId) => {
  socket?.emit('notification:create', {
    recipientId,
    type,
    content,
    targetId,
    actorId: getCurrentUserId()
  })
}

/**
 * 發送訊息
 */
export const sendChatMessage = (conversationId, content) => {
  socket?.emit('chat:message', {
    conversationId,
    content,
    senderId: getCurrentUserId()
  })
}

/**
 * 標記訊息已讀
 */
export const markMessageAsRead = (messageId, conversationId) => {
  socket?.emit('chat:message:read', {
    messageId,
    conversationId
  })
}

/**
 * 用戶心跳（保持在線）
 */
export const sendHeartbeat = (userId) => {
  socket?.emit('user:heartbeat', { userId })
}

const getCurrentUserId = () => {
  // 實際應該從 Auth Store 取得
  return localStorage.getItem('userId') || 'unknown'
}

export { socket }
```

---
## 最終總結

### 檔案清單（完整版）

**前端新增（MVP）：**
- `src/api/index.js`
- `src/api/social.js`
- `src/composables/useImageUpload.js`
- `src/composables/useToast.js`
- `src/stores/usePostStore.js`
- `src/components/Social/PostComposer.vue`
- `src/components/Share/SimpleToast.vue`

**前端新增（P1）：**
- `src/api/notification.js`
- `src/api/chat.js`
- `src/stores/useNotificationStore.js`
- `src/stores/useChatStore.js`
- `src/components/Notification/*`
- `src/components/Chat/*`

**前端新增（P2）：**
- `src/utils/socket.js`
- `src/stores/useUserStatusStore.js`

**後端新增（MVP）：**
- `backend/routes/social.js`
- `backend/utils/validators.js`

**後端新增（P1）：**
- `backend/routes/notifications.js`
- `backend/routes/messages.js`

**後端新增（P2）：**
- `backend/io.js`

**資料庫（一次建立全部）：**
- users, posts, post_likes, comments
- notifications
- conversations, messages
- user_statuses


### 核心流程圖

```
用戶拍照/選圖
    ↓
壓縮 (browser-image-compression)
    ↓
上傳 Cloudinary
    ↓
取得永久 URL
    ↓
顯示預覽 + ✓
    ↓
用戶發布貼文
    ↓
POST /api/social/posts
    ↓
後端驗證 + 寫入資料庫
    ↓
回傳新貼文
    ↓
前端即時更新動態牆
    ↓
其他用戶看到新貼文
    ↓
其他用戶點讚
    ↓
後端建立通知
    ↓
Socket.io 推送給原貼文者
    ↓
通知鈴鐺亮紅
    ↓
用戶打開通知中心
    ↓
看到誰讚了
    ↓
點通知跳到貼文
    ↓
自動標記為已讀
    ↓
通知鈴鐺變灰
```


## 測試清單

```
| 測試項目 | 預期結果 | 狀態 |
| :--- | :--- | :--- |
| **圖片上傳** | | |
| 選擇 1 張圖片 | 預覽顯示，上傳成功 | ⬜ |
| 選擇多張圖片 | 預覽列表顯示，全部上傳成功 | ⬜ |
| 移除圖片 | 預覽消失，陣列更新 | ⬜ |
| **發布貼文** | | |
| 輸入文字 + 圖片 | 點發布，動態牆出現新貼文 | ⬜ |
| 只有文字 | 發布成功 | ⬜ |
| 只有圖片 | 發布成功 | ⬜ |
| 空內容 | 發布按鈕 Disabled | ⬜ |
| **互動** | | |
| 按讚 | 愛心變紅，計數 +1 | ⬜ |
| 取消讚 | 愛心變空，計數 -1 | ⬜ |
| **通知 (P1)** | | |
| 用戶 B 按讚 | 用戶 A 收到通知，鈴鐺變紅 | ⬜ |
| 點開通知 | 跳轉到貼文，標記已讀 | ⬜ |
| **聊天 (P1)** | | |
| 發送訊息 | 訊息即時出現在視窗 | ⬜ |
| 接收訊息 | 對方視窗即時出現 | ⬜ |
| **在線狀態 (P2)** | | |
| 上線 | 對方看到綠燈 | ⬜ |
| 斷線 | 對方看到紅燈 | ⬜ |

```