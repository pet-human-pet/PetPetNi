<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginForm from './login-components/LoginForm.vue'
import RegisterForm from './login-components/RegisterForm.vue'
import ForgetPasswordForm from './login-components/ForgetPasswordForm.vue'
import OtpVerification from './login-components/OtpVerification.vue'
import SocialBindPhone from './login-components/SocialBindPhone.vue'
import RoleSelection from '@/components/Onboarding/RoleSelection.vue'
import PetBasicInfo from '@/components/Onboarding/PetBasicInfo.vue'
import SuccessView from './login-components/SuccessView.vue'
// ChipVerification 組件保留但不在此流程中使用

const route = useRoute()
const router = useRouter()
// 認證模式: 'login' | 'register' | 'forget' | 'otp' | 'social_bind' | 'role' | 'pet' | 'success'
// 註：chip 模式已從註冊流程中移除，ChipVerification 組件將用於其他頁面
const authMode = ref('login')
const userRole = ref('owner') // 用於 SuccessView 顯示不同訊息

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
}
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
            <SocialBindPhone @success="handleSocialBindSuccess" />
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
          <SuccessView v-else-if="authMode === 'success'" key="success" :user-role="userRole" />
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
</style>
