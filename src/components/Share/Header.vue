<script setup>
const avatarUrl =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=60'
</script>

<template>
  <header
    class="fixed left-0 top-0 z-1000 w-full border-b border-[#eee] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
  >
    <div
      class="mx-auto flex h-17.5 max-w-300 items-center justify-between px-6 max-[800px]:h-15 max-[800px]:px-4"
    >
      <a href="#" class="flex items-center no-underline">
        <span
          class="text-[26px] font-semibold text-[#ff9f43] max-[800px]:text-[22px]"
          style="font-family: 'Fredoka', sans-serif"
        >
          PetPetNi
        </span>
      </a>

      <div class="flex items-center gap-3">
        <!-- desktop icons,<=800 隱藏（跟你原本一致） -->
        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="收藏"
          type="button"
        >
          <i class="fa-regular fa-heart"></i>
        </button>

        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="訊息"
          type="button"
        >
          <i class="fa-regular fa-comment-dots"></i>
          <span class="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-[#ff5e57]" />
        </button>

        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="通知"
          type="button"
        >
          <i class="fa-regular fa-bell"></i>
        </button>

        <div class="h-10 w-10 overflow-hidden rounded-full border-2 border-[#eee]">
          <img :src="avatarUrl" class="h-full w-full object-cover" alt="avatar" />
        </div>

        <button
          class="ml-2 rounded-lg p-1.25 text-[22px] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
          type="button"
          title="menu"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
  </header>
</template>
