<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/login/RegisterForm.vue'
import ForgetPasswordForm from '@/components/login/ForgetPasswordForm.vue'
import ResetPasswordForm from '@/components/login/ResetPasswordForm.vue'
import SocialBindEmail from '@/components/login/SocialBindEmail.vue'
import RoleSelection from '@/components/Onboarding/RoleSelection.vue'
import OwnerInfo from '@/components/Onboarding/OwnerInfo.vue'
import PetBasicInfo from '@/components/Onboarding/PetBasicInfo.vue'

const route = useRoute()
const router = useRouter()
// 認證模式: 'login' | 'register' | 'forget' | 'reset-password' | 'social_bind' | 'role' | 'owner_info' | 'pet' | 'success'

const authMode = ref('login')
const userRole = ref('owner') // 用於成功頁面顯示不同訊息
const userEmail = ref('') // 儲存用戶 Email
const countdown = ref(3)
let countdownTimer = null

// 資料管理
const ownerData = ref(null) // 主人資料
const petsData = ref([]) // 寵物資料陣列
const currentPetIndex = ref(0) // 當前編輯的寵物索引

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
    FORGET: 'forget'
  }
  authMode.value = viewMap[view] || 'login'
}

const handleRegisterSuccess = (data) => {
  // 儲存 Email 並進入角色選擇
  userEmail.value = data.email
  authMode.value = 'role'
}

const handleSocialBindSuccess = () => {
  // 社交綁定 Email 成功，進入角色選擇
  authMode.value = 'role'
}

const handleResetPasswordSuccess = () => {
  // 密碼重設成功，回到登入頁
  authMode.value = 'login'
}

const handleRoleSelect = (role) => {
  userRole.value = role // 儲存用戶角色
  // 所有角色都需要填寫主人資訊
  authMode.value = 'owner_info'
}

const handleOwnerInfoSubmit = (data) => {
  // 儲存主人資料
  ownerData.value = data
  console.log('主人資料:', data)

  if (userRole.value === 'owner') {
    // 飼主：進入寵物資料填寫
    authMode.value = 'pet'
  } else {
    // 雲鏟屎官：顯示完成頁面
    handleComplete()
  }
}

const handlePetSubmit = (petData) => {
  // 儲存寵物資料到陣列
  if (currentPetIndex.value < petsData.value.length) {
    // 編輯現有寵物
    petsData.value[currentPetIndex.value] = petData
  } else {
    // 新增寵物
    petsData.value.push(petData)
  }

  console.log(`寵物 ${currentPetIndex.value + 1} 資料:`, petData)
  console.log('所有寵物資料:', petsData.value)

  // 顯示「新增更多寵物」確認頁面
  authMode.value = 'add_more_pets'
}

const handleAddMorePets = () => {
  // 新增更多寵物
  currentPetIndex.value++
  authMode.value = 'pet'
}

const handleFinishPets = () => {
  // 完成所有寵物資料填寫
  console.log('=== 完整註冊資料 ===')
  console.log('主人資料:', ownerData.value)
  console.log('寵物資料:', petsData.value)
  handleComplete()
}

const handleGoBack = () => {
  // 根據當前模式返回上一步
  const backMap = {
    owner_info: 'role',
    pet: currentPetIndex.value > 0 ? 'add_more_pets' : 'owner_info',
    add_more_pets: 'pet'
  }
  authMode.value = backMap[authMode.value] || 'login'
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
  <!-- TODO: Replace with CSS variable var(--app-bg) -->
  <div
    class="flex min-h-screen items-center justify-center p-4 lg:p-8"
    style="background-color: #ffd9ad"
  >
    <div class="grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <!-- Branding Section (Left/Top) - 固定顯示 -->
      <div class="flex flex-col items-center justify-center space-y-4 lg:items-center">
        <!-- Paw Icon -->
        <div class="h-24 w-24 lg:h-32 lg:w-32">
          <img
            src="@/assets/icons/icon-paw.svg"
            alt="PetPetNi Logo"
            class="h-full w-full object-contain opacity-90"
          />
        </div>
        <h1 class="text-center text-4xl font-bold tracking-wider text-white lg:text-5xl">
          PetPetNi
        </h1>
      </div>

      <!-- Form Section (Right/Bottom) - 動態高度 -->
      <div class="flex justify-center">
        <Transition name="auth-form" mode="out-in">
          <LoginForm
            v-if="authMode === 'login'"
            key="login"
            @switch="switchToRegister"
            @forgot="switchToForget"
          />
          <RegisterForm
            v-else-if="authMode === 'register'"
            key="register"
            @switch="switchToLogin"
            @success="handleRegisterSuccess"
          />
          <div
            v-else-if="authMode === 'forget'"
            key="forget"
            class="w-full max-w-md rounded-3xl border-none bg-white p-8 shadow-xl md:p-12"
          >
            <ForgetPasswordForm @change-view="handleViewChange" />
          </div>
          <div
            v-else-if="authMode === 'reset-password'"
            key="reset-password"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <ResetPasswordForm @success="handleResetPasswordSuccess" />
          </div>
          <div
            v-else-if="authMode === 'social_bind'"
            key="social_bind"
            class="w-full max-w-md rounded-3xl border-none bg-white p-8 shadow-xl md:p-12"
          >
            <SocialBindEmail @success="handleSocialBindSuccess" />
          </div>
          <div
            v-else-if="authMode === 'role'"
            key="role"
            class="w-full max-w-md rounded-3xl border-none bg-white p-8 shadow-xl md:p-12"
          >
            <RoleSelection @select="handleRoleSelect" />
          </div>
          <div
            v-else-if="authMode === 'owner_info'"
            key="owner_info"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <OwnerInfo
              :email="userEmail"
              :initial-data="ownerData"
              @submit="handleOwnerInfoSubmit"
              @back="handleGoBack"
            />
          </div>
          <div
            v-else-if="authMode === 'pet'"
            key="pet"
            class="w-full max-w-md rounded-3xl border-none bg-white p-8 shadow-xl md:p-12"
          >
            <PetBasicInfo
              :pet-index="currentPetIndex"
              @submit="handlePetSubmit"
              @back="handleGoBack"
            />
          </div>
          <!-- 新增更多寵物確認頁面 -->
          <div
            v-else-if="authMode === 'add_more_pets'"
            key="add_more_pets"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <div class="text-center">
              <div class="mb-4 flex justify-center">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg class="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 class="mb-2 text-2xl font-bold text-gray-800">
                已新增第 {{ petsData.length }} 隻寵物！
              </h2>
              <p class="mb-6 text-sm text-gray-500">您還有其他毛孩嗎？</p>

              <div class="flex flex-col gap-3">
                <button
                  type="button"
                  class="w-full rounded-xl py-3 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
                  style="background-color: #ffa75f"
                  @click="handleAddMorePets"
                >
                  新增更多寵物
                </button>
                <button
                  type="button"
                  class="w-full rounded-xl border-2 border-gray-300 bg-white py-3 text-lg font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
                  @click="handleFinishPets"
                >
                  完成註冊
                </button>
              </div>
            </div>
          </div>
          <!-- 註冊成功頁面 -->
          <div
            v-else-if="authMode === 'success'"
            key="success"
            class="w-full max-w-md rounded-3xl border-none bg-white p-8 shadow-xl md:p-12"
          >
            <!-- 完成圖示 -->
            <div class="mb-6 flex justify-center">
              <div
                class="animate-scale-in flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
              >
                <svg
                  class="animate-check h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
            </div>

            <!-- 標題 -->
            <h2 class="mb-2 text-center text-3xl font-bold text-gray-800">註冊完成！</h2>
            <!-- TODO: Replace with CSS variable var(--app-primary) -->
            <p class="mb-2 text-center text-xl font-medium" style="color: #ffa75f">
              歡迎來到 PetPetNi
            </p>

            <!-- 訊息 -->
            <p class="mb-8 text-center text-sm text-gray-500">
              {{ welcomeMessage }}
            </p>

            <!-- 倒數計時 -->
            <div class="mb-6 text-center">
              <p class="text-sm text-gray-400">
                <!-- TODO: Replace with CSS variable var(--app-primary) -->
                <span class="text-2xl font-bold" style="color: #ffa75f">{{ countdown }}</span>
                秒後自動進入
              </p>
            </div>

            <!-- 立即進入按鈕 -->
            <!-- TODO: Replace with CSS variable var(--app-primary) -->
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
