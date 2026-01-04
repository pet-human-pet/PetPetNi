<template>
  <div class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12">
    <!-- 完成圖示 -->
    <div class="mb-6 flex justify-center">
      <div class="animate-scale-in flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <svg class="animate-check h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>

    <!-- 標題 -->
    <h2 class="mb-2 text-center text-3xl font-bold text-gray-800">註冊完成！</h2>
    <p class="mb-2 text-center text-xl font-medium" style="color: #ffa75f">歡迎來到 PetPetNi</p>

    <!-- 訊息 -->
    <p class="mb-8 text-center text-sm text-gray-500">
      {{ welcomeMessage }}
    </p>

    <!-- 倒數計時 -->
    <div class="mb-6 text-center">
      <p class="text-sm text-gray-400">
        <span class="text-2xl font-bold" style="color: #ffa75f">{{ countdown }}</span>
        秒後自動進入
      </p>
    </div>

    <!-- 立即進入按鈕 -->
    <button
      type="button"
      class="w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
      style="background-color: #ffa75f"
      @click="goToHome"
    >
      立即進入
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userRole: {
    type: String,
    default: 'owner' // 'owner' | 'cloud'
  }
})

const router = useRouter()
const countdown = ref(3)
let timer = null

const welcomeMessage = computed(() => {
  if (props.userRole === 'cloud') {
    return '準備好探索毛孩的世界了嗎？'
  }
  return '準備好開始記錄您的毛孩日記了嗎？'
})

const goToHome = () => {
  if (timer) clearInterval(timer)
  router.push('/')
}

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      goToHome()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
@keyframes scale-in {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes check-draw {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-scale-in {
  animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.animate-check path {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: check-draw 0.6s ease-in-out 0.3s forwards;
}
</style>
