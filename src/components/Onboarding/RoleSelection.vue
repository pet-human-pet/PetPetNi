<script setup>
const emit = defineEmits(['select'])

const selectRole = (role) => {
  emit('select', role)
}
</script>

<template>
  <div class="flex flex-col items-center p-6 text-center text-gray-800">
    <h2 class="mb-2 text-2xl font-bold">歡迎來到 PetPetNi</h2>
    <p class="mb-8 text-sm text-gray-500">為了提供給您最合適的服務，<br />請告訴我們您的身分</p>

    <div class="flex w-full flex-col gap-4">
      <button
        class="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-white p-4 shadow-lg transition-all hover:scale-[1.02] hover:border-red-200 hover:shadow-xl"
        @click="selectRole('owner')"
      >
        ß
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-2xl transition-colors group-hover:bg-red-200"
        >
          🏠
        </div>
        <div class="flex flex-col items-start">
          <span class="text-lg font-bold">我是飼主</span>
          <span class="text-xs text-gray-400">我有毛孩，想紀錄生活</span>
        </div>
        <div class="ml-auto text-gray-300 group-hover:text-red-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </div>
      </button>

      <button
        class="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-white p-4 shadow-lg transition-all hover:scale-[1.02] hover:border-blue-200 hover:shadow-xl"
        @click="selectRole('cloud')"
      >
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl transition-colors group-hover:bg-blue-200"
        >
          ☁️
        </div>
        <div class="flex flex-col items-start">
          <span class="text-lg font-bold">雲鏟屎官</span>
          <span class="text-xs text-gray-400">暫時沒有，但想關注毛孩</span>
        </div>
        <div class="ml-auto text-gray-300 group-hover:text-blue-400">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>
