# 專案樣式使用教學
本文件說明本專案的樣式系統設計方式，包含：

- 設計變數（Design Tokens）
- 全站預設樣式（Base）
- 共用元件樣式（Components）

**目標：**
- 統一配色與字型
- 減少重複的 Tailwind utility
- 避免在 Vue template 中散落色碼與任意 px

---

## 1️⃣ 核心設計原則（一定要先看）

### 設計分層
- **tokens.css**
  - 定義「顏色、字體、圓角、陰影」
  - 不寫實際元件樣式
- **base layer**
  - 定義 HTML tag 的預設樣式（body、a）
- **components.css**
  - 定義可重用的 `.c-*` 元件

### 三個禁止
- ❌ template 內直接寫 hex 色碼
- ❌ 使用 `text-[px]` ex. text-[15px]
- ❌ 把 layout（grid / mt / gap）抽進共用元件

## 2️⃣ 檔案結構與載入方式

src/
├─ styles/
│  ├─ tokens.css
│  ├─ components.css
│  └─ Style.md
└─ style.css

style.css（只負責 import）：

@import "tailwindcss";
@import "./styles/tokens.css";
@import "./styles/components.css";

---

## 3️⃣ 常用的class

**背景**
<div class="bg-bg-base">頁面底色（米色）</div>
<div class="bg-bg-surface">卡片底色（白色）</div>

**文字**
<h2 class="c-title text-fg-primary">標題</h2>
<h3 class="c-subtitle text-fg-secondary">副標</h3>
<p class="c-meta text-fg-muted">2 小時前</p>

*`c-title`：標題（大）*
*`c-subtitle`：副標（中）*
*`c-meta`：時間、數量、說明（小）*

👉 顏色自己選，但一定用 `text-fg-*`

**按鈕（最常用）**
<button class="c-btn--primary">主要操作（綠底白字）</button>
<button class="c-btn--accent">次要 CTA（黃底咖字）</button>
<button class="c-btn--secondary">取消 / 返回（灰底）</button>

*一個畫面只會有 一顆 primary*
*不要自己改按鈕顏色*

**卡片 / 對話框**
<div class="c-card">
  卡片內容
</div>

<div class="c-dialog">
  對話框內容
</div>

**<a>連結**
<a href="/profile">個人頁</a>

*<a>已經有預設顏色跟 hover*
*不用自己加 class*
*如果你不想要藍色，在該元件內覆蓋即可*

### 我什麼時候要新增 `.c-*`？
可以新增的情況
1. 同一組樣式 出現 3 次以上
2. 很明確會在不同頁用（例如貼文卡、聊天室訊息）

### 新增流程
1. 先在 template 用 Tailwind utility 做出畫面

2. 發現一直重複

3. 抽成 `.c-*` 放進 components.css
   ex: <button class="c-btn--primary">

4. PR 說明用途

## 命名與使用速查
| 類型 | 範例 |
| :--- | :--- |
| **標題** | `c-title`, `c-subtitle` |
| **內文/輔助資訊** | `c-meta` |
| **按鈕** | `c-btn--primary` |
| **卡片** | `c-card` |
| **對話框** | `c-dialog` |