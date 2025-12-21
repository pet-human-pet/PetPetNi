<template>
  <header class="sticky top-0 z-50 w-full border-b bg-white">
    <div class="mx-auto flex h-14 max-w-260 items-center justify-between px-4">
      <div class="flex items-center gap-3">
        <button class="rounded-lg border px-3 py-1 text-sm font-semibold">Logo</button>

        <!-- 手機：搜尋 icon -->
        <button class="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 md:hidden cursor-pointer"
          aria-label="Search">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>

        <!-- 平板/桌機：搜尋框 -->
        <div class="hidden w-70 items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 md:flex">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input class="w-full bg-transparent text-sm outline-none" placeholder="搜尋" />
        </div>
      </div>

      <!-- 平板：顯示社群標題；桌機：顯示 tabs -->
      <div class="hidden items-center gap-6 md:flex">
        <div class="lg:hidden text-base font-semibold">社群</div>
        <nav class="hidden items-center gap-6 lg:flex">
          <button class="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer">活動地圖</button>
          <button class="text-sm text-zinc-600 hover:text-zinc-900 cursor-pointer">配對卡片</button>
          <button class="text-sm font-semibold text-zinc-900 cursor-pointer">社群</button>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <button class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100 cursor-pointer" aria-label="Chat">
          <i class="fa-regular fa-comment"></i>
        </button>

        <button class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100 cursor-pointer" aria-label="Bell">
          <i class="fa-regular fa-bell"></i>
        </button>

        <!-- 手機：漢堡；平板/桌機：頭像 -->
        <button class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100 md:hidden cursor-pointer"
          aria-label="Menu">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="hidden h-9 w-9 rounded-full bg-zinc-200 md:block cursor-pointer">
        </div>
      </div>
    </div>
  </header>
</template>
