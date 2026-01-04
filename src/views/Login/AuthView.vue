<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginForm from './login-components/LoginForm.vue'
import RegisterForm from './login-components/RegisterForm.vue'
import RoleSelection from '@/components/Onboarding/RoleSelection.vue'
import PetBasicInfo from '@/components/Onboarding/PetBasicInfo.vue'
import ChipVerification from '@/components/Form/ChipVerification.vue'

const route = useRoute()
const router = useRouter()
const authMode = ref('login') // 'login' | 'register' | 'role' | 'pet' | 'chip'

onMounted(() => {
  // 支援 query parameter: /login?mode=register
  if (route.query.mode === 'register') {
    authMode.value = 'register'
  }
})

const switchToRegister = () => {
  authMode.value = 'register'
}

const switchToLogin = () => {
  authMode.value = 'login'
}

const handleRegisterSuccess = (userData) => {
  // 註冊成功，進入角色選擇
  authMode.value = 'role'
}

const handleRoleSelect = (role) => {
  if (role === 'owner') {
    authMode.value = 'pet'
  } else {
    // 雲鏟屎官：直接完成，跳轉首頁
    handleComplete()
  }
}

const handlePetSubmit = (petData) => {
  authMode.value = 'chip'
}

const handleComplete = () => {
  // Onboarding 完成，跳轉首頁
  router.push('/')
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center p-4 lg:p-8"
    style="background-color: #ffd9ad"
  >
    <!-- TODO: Replace with CSS variable var(--app-bg) -->

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

      <!-- Form Section (Right/Bottom) - 條件渲染 -->
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
          <div
            v-else-if="authMode === 'chip'"
            key="chip"
            class="w-full max-w-md rounded-[2.5rem] border-none bg-white p-8 shadow-xl md:p-12"
          >
            <ChipVerification pet-name="您的毛孩" @submit="handleComplete" @skip="handleComplete" />
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
</style>
