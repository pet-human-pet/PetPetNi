<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userApi } from '@/api/user'
import { useToast } from '@/composables/useToast'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/login/RegisterForm.vue'

import SocialBindEmail from '@/components/login/SocialBindEmail.vue'
import RoleSelection from '@/components/Onboarding/RoleSelection.vue'
import OwnerInfo from '@/components/Onboarding/OwnerInfo.vue'
import PetBasicInfo from '@/components/Onboarding/PetBasicInfo.vue'
import PetTagsSelection from '@/components/Onboarding/PetTagsSelection.vue'

const route = useRoute()
const router = useRouter()
// 認證模式: 'login' | 'register' | 'social_bind' | 'role' | 'owner_info' | 'pet' | 'pet_tags' | 'success'

const authMode = ref('login')
const userRole = ref('owner') // 用於成功頁面顯示不同訊息
const userEmail = ref('') // 儲存用戶 Email
const isOAuthLogin = ref(false) // 追蹤是否為第三方登入
const countdown = ref(3)
let countdownTimer = null

// 資料管理
const ownerData = ref(null) // 主人資料
const petData = ref(null) // 單隻寵物資料
const petTagsData = ref(null) // 寵物標籤資料

const { error: showToastError } = useToast()
const isSubmitting = ref(false)

onMounted(() => {
  handleRouteQuery()
})

// 監聽路由參數變化，以支援同頁面透過 query 切換模式 (例如登入後導向註冊)
// watch(() => route.query.mode, ...) // watch route directly
watch(
  () => route.query.mode,
  (newMode) => {
    if (newMode) {
      handleRouteQuery()
    }
  }
)

function handleRouteQuery() {
  const mode = route.query.mode
  if (mode === 'register') {
    authMode.value = 'register'
  } else if (mode === 'social_bind') {
    authMode.value = 'social_bind'
    isOAuthLogin.value = true // 標記為 OAuth 登入
  } else if (mode === 'role') {
    authMode.value = 'role'
    // 檢查是否已登入（包含一般登入與 OAuth）
    import('@/stores/auth').then(({ useAuthStore }) => {
      const authStore = useAuthStore()
      if (authStore.user && authStore.user.email) {
        userEmail.value = authStore.user.email
      }
    })
  } else if (mode === 'pet-onboarding') {
    // 直接跳轉至寵物填寫 (需先取得主人資料)
    import('@/api/auth').then(async ({ default: authApi }) => {
      try {
        const res = await authApi.getCurrentUser()
        const profile = res.data.profile

        // 填入主人資料
        ownerData.value = {
          realName: profile.real_name,
          nickname: profile.nick_name,
          phone: profile.phone,
          city: profile.city,
          district: profile.district,
          gender: profile.gender,
          birthday: profile.birthday
        }

        userEmail.value = res.data.user.email
        userRole.value = 'owner'
        authMode.value = 'pet'
      } catch (err) {
        console.error('❌ 無法載入個人檔案:', err)
        authMode.value = 'login' // 失敗則回登入頁
      }
    })
  }
}

const switchToRegister = () => {
  authMode.value = 'register'
}

const switchToLogin = () => {
  authMode.value = 'login'
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

const handleRoleSelect = (role) => {
  userRole.value = role // 儲存用戶角色
  // 所有角色都需要填寫主人資訊
  authMode.value = 'owner_info'
}

const handleOwnerInfoSubmit = (data) => {
  // 儲存主人資料
  ownerData.value = data

  if (userRole.value === 'owner') {
    // 飼主：進入寵物資料填寫
    authMode.value = 'pet'
  } else {
    // 雲鏟屎官：顯示完成頁面
    handleComplete()
  }
}

const handlePetSubmit = (data) => {
  // 儲存寵物資料
  petData.value = data
  // 進入標籤選擇頁面
  authMode.value = 'pet_tags'
}

const handlePetTagsSubmit = (data) => {
  // 儲存標籤資料
  petTagsData.value = data
  // 完成註冊
  handleComplete()
}

const handleGoBack = () => {
  // 根據當前模式返回上一步
  const backMap = {
    owner_info: 'role',
    pet: 'owner_info',
    pet_tags: 'pet'
  }
  authMode.value = backMap[authMode.value] || 'login'
}

const handleComplete = async () => {
  try {
    // 準備寵物資料 (如果有的話)
    let petPayload = null
    if (petData.value) {
      petPayload = {
        name: petData.value.name,
        type: petData.value.type,
        breed: petData.value.breed,
        birthday: petData.value.birthday,
        gender: petData.value.gender
      }
    }

    // 呼叫後端 API 建立 Profile
    isSubmitting.value = true
    const response = await userApi.createProfile({
      realName: ownerData.value.realName,
      nickName: ownerData.value.nickname,
      phone: ownerData.value.phone,
      city: ownerData.value.city,
      district: ownerData.value.district,
      gender: ownerData.value.gender, // 新增：傳遞性別
      avatarUrl: '', // 即使沒上傳也傳送空字串，避免後端驗證錯誤
      pet: petPayload,
      optionalTags: petTagsData.value?.optionalTags || []
    })


    // 從回應中取得 user_id_int 並儲存到 authStore
    // userController 回傳格式為 { success: true, data: { profile: ... } }
    const profileData = response.data.data?.profile || response.data.profile
    if (profileData?.user_id_int) {
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      authStore.setUserIdInt(profileData.user_id_int)

      // 如果有建立寵物資料，更新 store 狀態
      if (petData.value) {
        authStore.setHasPet(true)
      }

    }

    // 顯示註冊完成頁面，3秒後自動跳轉首頁
    authMode.value = 'success'
    startCountdown()
  } catch (error) {
    console.error('❌ Profile 建立失敗:', error)
    showToastError('註冊失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
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
  <div
    class="bg-brand-tertiary flex h-screen items-center justify-center overflow-hidden p-4 lg:p-8"
  >
    <div class="grid w-full max-w-5xl grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
      <!-- Branding Section (Left/Top) - 垂直居中固定 -->
      <div class="flex flex-col items-center justify-center space-y-4 lg:self-center">
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
          <LoginForm v-if="authMode === 'login'" key="login" @switch="switchToRegister" />
          <RegisterForm
            v-else-if="authMode === 'register'"
            key="register"
            @switch="switchToLogin"
            @success="handleRegisterSuccess"
          />

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
            class="max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl border-none bg-white shadow-xl md:h-[85vh]"
          >
            <OwnerInfo
              :email="userEmail"
              :initial-data="ownerData"
              :show-email="!isOAuthLogin"
              @submit="handleOwnerInfoSubmit"
              @back="handleGoBack"
            />
          </div>
          <div
            v-else-if="authMode === 'pet'"
            key="pet"
            class="max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl border-none bg-white shadow-xl md:h-[85vh]"
          >
            <PetBasicInfo :pet-index="0" @submit="handlePetSubmit" @back="handleGoBack" />
          </div>
          <div
            v-else-if="authMode === 'pet_tags'"
            key="pet_tags"
            class="max-h-[90vh] w-full max-w-md overflow-hidden rounded-3xl border-none bg-white shadow-xl md:h-[85vh]"
          >
            <PetTagsSelection
              :loading="isSubmitting"
              @submit="handlePetTagsSubmit"
              @back="handleGoBack"
            />
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

            <p class="text-brand-primary mb-2 text-center text-xl font-medium">歡迎來到 PetPetNi</p>

            <!-- 訊息 -->
            <p class="mb-8 text-center text-sm text-gray-500">
              {{ welcomeMessage }}
            </p>

            <!-- 倒數計時 -->
            <div class="mb-6 text-center">
              <p class="text-sm text-gray-400">
                <span class="text-brand-primary text-2xl font-bold">{{ countdown }}</span>
                秒後自動進入
              </p>
            </div>

            <!-- 立即進入按鈕 -->

            <button
              type="button"
              class="bg-brand-primary w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
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
