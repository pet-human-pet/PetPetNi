<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginForm from '@/views/Login/login-components/LoginForm.vue'
import RegisterForm from '@/views/Login/login-components/RegisterForm.vue'
import ForgetPasswordForm from '@/views/Login/login-components/ForgetPasswordForm.vue'
import OtpVerification from '@/views/Login/login-components/OtpVerification.vue'
import SocialBindEmail from '@/views/Login/login-components/SocialBindEmail.vue'
import RoleSelection from '@/components/Onboarding/RoleSelection.vue'
import PetBasicInfo from '@/components/Onboarding/PetBasicInfo.vue'

const route = useRoute()
const router = useRouter()
// 認證模式: 'login' | 'register' | 'forget' | 'otp' | 'social_bind' | 'role' | 'pet' | 'success'

const authMode = ref('login')
const userRole = ref('owner') // 用於成功頁面顯示不同訊息
const countdown = ref(3)
let countdownTimer = null

onMounted(() => {
  // 支援 query parameter: /login?mode=register
  if (route.query.mode === 'register') {
    authMode.value = 'register'
  } else if (route.query.mode === 'social_bind') {
    authMode.value = 'social_bind'
  }
})

const switchToRegister = () => {
  authMode.value = 'register'
}

const switchToLogin = () => {
  authMode.value = 'login'
}

const switchToForget = () => {
  authMode.value = 'forget'
}

const handleViewChange = (view) => {
  // 處理表單之間的切換
  const viewMap = {
    LOGIN: 'login',
    REGISTER: 'register',
    FORGET: 'forget',
    OTP_VERIFY: 'otp'
  }
  authMode.value = viewMap[view] || 'login'
}

const handleRegisterSuccess = () => {
  // 註冊成功，進入角色選擇
  authMode.value = 'role'
}

const handleSocialBindSuccess = () => {
  // 社交綁定 Email 成功，進入角色選擇
  authMode.value = 'role'
}

const handleOtpSuccess = () => {
  // OTP 驗證成功，回到登入或跳轉首頁
  router.push('/')
}

const handleRoleSelect = (role) => {
  userRole.value = role // 儲存用戶角色
  if (role === 'owner') {
    authMode.value = 'pet'
  } else {
    // 雲鏟屎官：顯示完成頁面
    handleComplete()
  }
}

const handlePetSubmit = () => {
  // 寵物資料填寫完成，顯示完成頁面
  handleComplete()
}

const handleComplete = () => {
  // 顯示註冊完成頁面，3秒後自動跳轉首頁
  authMode.value = 'success'
  startCountdown()
}

// 成功頁面相關邏輯
const welcomeMessage = computed(() => {
  if (userRole.value === 'cloud') {
    return '準備好探索毛孩的世界了嗎？'
  }
  return '準備好開始記錄您的毛孩日記了嗎？'
})

const goToHome = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  router.push('/')
}

const startCountdown = () => {
  countdown.value = 3
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
      router.push('/')
    }
  }, 1000)
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center p-4 lg:p-8" style="background-color: #ffd9ad">
    <!-- TODO: Replace with CSS variable var(--app-bg) -->

    <div class="grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <!-- Branding Section (Left/Top) - 固定顯示 -->
      <div class="flex flex-col items-center justify-center space-y-4 lg:items-center">
        <!-- Paw Icon -->
        <div class="h-24 w-24 lg:h-32 lg:w-32">
          <img src="@/assets/icons/icon-paw.svg" alt="PetPetNi Logo" class="h-full w-full object-contain opacity-90" />
        </div>
        <h1 class="text-center text-4xl font-bold tracking-wider text-white lg:text-5xl">PetPetNi</h1>
      </div>

      <!-- Form Section (Right/Bottom) - 條件渲染 -->
      <div class="flex justify-center">
        <Transition name="auth-form" mode="out-in">
          <LoginForm v-if="authMode === 'login'" key="login" @switch="switchToRegister" @forgot="switchToForget" />
          <RegisterForm
            v-else-if="authMode === 'register'"
            key="register"
            @switch="switchToLogin"
            @success="handleRegisterSuccess"
          />
          <div
            v-else-if="authMode === 'forget'"
            key="forget"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <ForgetPasswordForm @change-view="handleViewChange" />
          </div>
          <div
            v-else-if="authMode === 'otp'"
            key="otp"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <OtpVerification @success="handleOtpSuccess" @change-view="handleViewChange" />
          </div>
          <div
            v-else-if="authMode === 'social_bind'"
            key="social_bind"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <SocialBindEmail @success="handleSocialBindSuccess" />
          </div>
          <div
            v-else-if="authMode === 'role'"
            key="role"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <RoleSelection @select="handleRoleSelect" />
          </div>
          <div
            v-else-if="authMode === 'pet'"
            key="pet"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <PetBasicInfo @submit="handlePetSubmit" />
          </div>
          <!-- 註冊成功頁面 -->
          <div
            v-else-if="authMode === 'success'"
            key="success"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <!-- 完成圖示 -->
            <div class="mb-6 flex justify-center">
              <div class="animate-scale-in flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <svg
                  class="animate-check h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 過渡動畫 */
.auth-form-enter-active,
.auth-form-leave-active {
  transition: all 0.3s ease;
}

.auth-form-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.auth-form-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 成功頁面動畫 */
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
