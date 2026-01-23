<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useScrollLock } from '@/composables/useScrollLock'
import NavIcon from './NavIcon.vue'
import BackgroundGrid from './BackgroundGrid.vue'

// Stores
const uiStore = useUIStore()
// 使用 storeToRefs 取得響應式的 isMenuOpen
// 透過 useScrollLock 監聽 isMenuOpen，只有在選單開啟時才鎖定捲動
const { isMenuOpen } = storeToRefs(uiStore)
useScrollLock(isMenuOpen)
const authStore = useAuthStore()
const router = useRouter()

// Auth state
const { token } = storeToRefs(authStore)
const isLoggedIn = computed(() => !!token.value)

// ✅ Logout handler - 使用 finally 消除重複代碼
const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    // 登出失敗記錄錯誤，但仍繼續執行關閉流程
    console.error('登出失敗:', error)
  } finally {
    // 無論成功或失敗都執行
    uiStore.closeMenu()
    router.push('/')
  }
}

// 選單項目
const menuItems = [
  { en: 'Chat', zh: '聊天區', icon: '聊天區.webp', path: '/chat-test' },
  { en: 'Event', zh: '活動區', icon: '活動區.webp', path: '/event' },
  { en: 'Social', zh: '交友區', icon: '交友區.webp', path: '/social' },
  { en: 'Profile', zh: '個人資料', icon: '社交區.webp', path: '/profile' }
]

const getIconUrl = (name) => {
  return new URL(`../../assets/icons/${name}`, import.meta.url).href
}
</script>

<template>
  <Transition name="menu-fade">
    <div
      v-if="uiStore.isMenuOpen"
      class="bg-brand-secondary fixed inset-0 isolate z-40 transform-gpu cursor-pointer overflow-hidden"
      @click.self="uiStore.closeMenu()"
    >
      <BackgroundGrid class="pointer-events-none fixed inset-0 opacity-40" />

      <!-- 手機版佈局 -->
      <div class="relative flex min-h-screen flex-col px-6 pt-24 pb-10 md:hidden">
        <div class="pointer-events-auto mb-8 flex flex-col gap-6">
          <div class="flex items-center justify-end">
            <div class="mr-12 flex gap-2">
              <!-- ✅ GitHub 連結 -->
              <a
                href="https://github.com/pet-human-pet/PetPetNi"
                target="_blank"
                rel="noopener noreferrer"
                class="text-brand-primary flex items-center rounded bg-white px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-100 sm:rounded-full"
              >
                GitHub
              </a>
              <!-- ✅ 登出按鈕（已登入時顯示） -->
              <button
                v-if="isLoggedIn"
                type="button"
                class="text-brand-primary flex items-center rounded bg-white px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-100 sm:rounded-full"
                @click="handleLogout"
              >
                登出
              </button>
            </div>
          </div>
        </div>

        <!-- 垂直標語 -->
        <div class="pointer-events-none absolute top-32 right-4 bottom-20 z-0 w-8">
          <div
            class="writing-vertical-rl flex h-full items-center justify-center text-3xl leading-none font-bold tracking-widest text-white opacity-20"
          >
            Pet到心坎裡
          </div>
          <div
            class="writing-vertical-rl absolute top-0 right-full mr-2 h-auto text-xs tracking-widest text-white opacity-80"
          >
            PetPetNi 寵物社交平台
          </div>
        </div>

        <!-- 選單項目 (手機版) -->
        <div class="pointer-events-auto z-10 flex flex-1 flex-col gap-0 pr-10">
          <NavIcon
            v-for="item in menuItems"
            :key="item.en"
            :label-en="item.en"
            :label-zh="item.zh"
            :icon-name="item.icon"
            :to="item.path"
            class="w-full"
            variant="list"
            @click="uiStore.closeMenu()"
          >
            <template #icon>
              <img
                :src="getIconUrl(item.icon)"
                class="h-full w-full object-contain"
                :alt="item.en"
              />
            </template>
          </NavIcon>
        </div>
      </div>

      <!-- 桌面版佈局 -->
      <div
        class="pointer-events-none relative hidden min-h-screen flex-row items-center justify-center px-12 pt-24 pb-10 md:flex"
      >
        <div class="pointer-events-auto flex w-5/12 flex-col items-start justify-center space-y-12">
          <!-- 桌面版標語 -->
          <div class="flex flex-col text-white">
            <div class="flex items-start gap-6">
              <div class="writing-vertical-rl h-32 pt-2 text-sm tracking-widest opacity-80">
                PetPetNi 寵物社交平台
              </div>
              <div class="text-7xl leading-none font-bold tracking-widest drop-shadow-md">
                <div class="mb-2">Pet到</div>
                <div>心坎裡</div>
              </div>
            </div>
          </div>

          <!-- 桌面版按鈕 -->
          <div class="flex flex-col gap-4">
            <!-- ✅ GitHub 連結 -->
            <a
              href="https://github.com/pet-human-pet/PetPetNi"
              target="_blank"
              rel="noopener noreferrer"
              class="group text-brand-primary flex min-w-[280px] items-center justify-between rounded-full bg-white px-8 py-4 font-bold transition-colors hover:bg-gray-100"
            >
              <!-- TODO: Magic Number: min-w-[280px] 應改為 Tailwind utility 或 token -->
              <span>GitHub</span>
              <span class="text-xl transition-transform group-hover:translate-x-1">→</span>
            </a>
            <!-- ✅ 登出按鈕（已登入時顯示） -->
            <button
              v-if="isLoggedIn"
              type="button"
              class="group text-brand-primary flex min-w-[280px] items-center justify-between rounded-full bg-white px-8 py-4 font-bold transition-colors hover:bg-gray-100"
              @click="handleLogout"
            >
              <!-- TODO: Magic Number: min-w-[280px] 應改為 Tailwind utility 或 token -->
              <span class="tracking-widest">登出</span>
              <span class="text-xl transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        <!-- 選單項目 (桌面版) -->
        <div class="pointer-events-auto grid w-7/12 grid-cols-2 gap-12 pl-12">
          <NavIcon
            v-for="item in menuItems"
            :key="item.en"
            :label-en="item.en"
            :label-zh="item.zh"
            :icon-name="item.icon"
            :to="item.path"
            class="w-full"
            variant="grid"
            @click="uiStore.closeMenu()"
          >
            <template #icon>
              <img
                :src="getIconUrl(item.icon)"
                class="h-full w-full object-contain"
                :alt="item.en"
              />
            </template>
          </NavIcon>
        </div>

        <div class="text-basic text-fg-primary absolute bottom-6 left-6 opacity-60">© PETPETNI</div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* MenuButton 在 MenuOverlay 中使用白色 */
.menu-button-wrapper :deep(.menu-line) {
  background-color: var(--color-btn-secondary);
}

.menu-button-wrapper :deep(.menu-text) {
  color: var(--color-btn-secondary);
}

/* Transition 動畫 */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
