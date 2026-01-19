<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useFavoritesStore } from '@/stores/favorites'
import MenuButton from '@/components/Button/MenuButton.vue'

// Props
const props = defineProps({
  transparent: {
    type: Boolean,
    default: false
  }
})

// Router & Store
const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const fav = useFavoritesStore()

// 判斷是否為首頁（只有首頁使用 MainFrame 藍色框架）
const isHomePage = computed(() => route.name === 'home')

// TODO: 後續整合真實的 auth store (useAuthStore)
const isLoggedIn = ref(true)

// 常數與狀態
const defaultAvatar =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=60'

const favOpen = ref(false)
const menuOpen = computed(() => uiStore.isMenuOpen)

// 計算屬性
const headerClasses = computed(() => [
  'h-(--header-h) fixed left-0 z-50 w-full',
  props.transparent || uiStore.isMenuOpen
    ? 'bg-transparent border-none shadow-none'
    : 'bg-white border-b border-border-default shadow-shadow-card',
  // TODO: top-[36px] 為跑馬燈高度，考慮抽成 CSS 變數 --marquee-h
  isHomePage.value ? 'top-[36px]' : 'top-0',
  uiStore.isMenuOpen ? 'pointer-events-none' : ''
])

const containerClasses = computed(() => [
  'h-(--header-h) w-full mx-auto flex items-center justify-between',
  // TODO: px-[30px]/px-[50px] 為 MainFrame 對齊邊距，考慮抽成 CSS 變數
  isHomePage.value ? 'w-full px-[30px] md:px-[50px]' : 'max-w-300 px-6 max-[800px]:px-4'
])

// 方法
function handleLogoClick() {
  uiStore.closeMenu()
  router.push({ name: 'home' })
}

function goProfile() {
  router.push({ name: 'Profile' })
}

function goChat() {
  router.push({ name: 'chat-test' })
}

function toggleFavPanel() {
  if (menuOpen.value) return
  favOpen.value = !favOpen.value
}

function closeFavPanel() {
  favOpen.value = false
}

function onBackdropClose() {
  closeFavPanel()
}

function onSelectFavorite(evt) {
  router.push({ name: 'Event', query: { eventId: evt.id } })
  closeFavPanel()
}
</script>

<template>
  <header v-show="!uiStore.isMenuOpen" :class="headerClasses">
    <div :class="containerClasses">
      <!-- Logo -->
      <button
        class="flex cursor-pointer items-center border-none bg-transparent p-0 no-underline"
        :class="{ 'pointer-events-none opacity-40': menuOpen }"
        @click="handleLogoClick"
      >
        <span
          class="text-brand-primary text-2xl font-semibold max-[800px]:text-xl"
          style="font-family: 'Fredoka', sans-serif"
        >
          PetPetNi
        </span>
      </button>

      <!-- 登入前：只顯示登入按鈕 + Menu -->
      <div v-if="!isLoggedIn" class="flex items-center gap-3">
        <router-link
          v-show="!uiStore.isMenuOpen"
          :to="{ name: 'login' }"
          class="flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-xs font-bold tracking-wider text-black transition-colors duration-300 hover:bg-gray-200"
        >
          登入
        </router-link>
        <MenuButton />
      </div>

      <!-- 登入後：完整功能按鈕 -->
      <div v-else class="flex items-center gap-3">
        <div v-show="!uiStore.isMenuOpen" class="flex items-center gap-3">
          <!-- 收藏：桌機 dropdown、手機 modal -->
          <div class="relative" :class="{ 'pointer-events-none opacity-40': menuOpen }">
            <button
              class="hover:text-brand-primary hover:bg-btn-secondary text-btn-accent relative flex h-10 w-10 items-center justify-center rounded-full transition max-[800px]:hidden"
              title="收藏"
              type="button"
              aria-label="收藏的活動"
              @click="toggleFavPanel"
            >
              <i
                :class="fav.count ? 'fa-solid fa-heart text-brand-accent' : 'fa-regular fa-heart'"
              ></i>
            </button>

            <!-- Desktop dropdown -->
            <div v-if="favOpen" class="c-popover absolute right-0 mt-2 w-72 max-md:hidden">
              <div
                class="border-border-default flex items-center justify-between border-b px-3 py-2"
              >
                <div class="text-fg-primary text-sm font-semibold">已收藏</div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="fav.count"
                    type="button"
                    class="c-meta text-fg-muted hover:text-brand-primary font-semibold"
                    @click="fav.clear()"
                  >
                    清空
                  </button>
                  <button
                    type="button"
                    class="c-meta text-fg-muted hover:text-fg-primary font-semibold"
                    @click="closeFavPanel"
                  >
                    關閉
                  </button>
                </div>
              </div>

              <div v-if="!fav.count" class="text-fg-muted p-3 text-sm">目前沒有收藏活動</div>

              <ul v-else class="no-scrollbar max-h-80 overflow-y-auto p-2">
                <li v-for="e in fav.items" :key="e.id" class="c-list-item">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-fg-primary truncate text-sm font-semibold">
                        {{ e.title || `活動 #${e.id}` }}
                      </div>
                      <div class="text-fg-muted truncate text-sm">
                        {{ e.desc || '（沒有描述）' }}
                      </div>
                    </div>
                    <button
                      type="button"
                      class="rounded-btn text-brand-primary hover:bg-bg-base shrink-0 px-3 py-1 text-sm font-semibold"
                      @click="onSelectFavorite(e)"
                    >
                      查看
                    </button>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Mobile modal -->
            <teleport to="body">
              <div v-if="favOpen" class="md:hidden">
                <div class="fixed inset-0 z-40 bg-black/30" @click="onBackdropClose"></div>

                <div class="c-sheet fixed top-15 right-3 left-3 z-50">
                  <div
                    class="border-border-default flex items-center justify-between border-b px-4 py-3"
                  >
                    <div class="text-fg-primary text-sm font-semibold">已收藏</div>
                    <div class="flex items-center gap-3">
                      <button
                        v-if="fav.count"
                        type="button"
                        class="c-meta text-fg-muted hover:text-brand-primary font-semibold"
                        @click="fav.clear()"
                      >
                        清空
                      </button>
                      <button
                        type="button"
                        class="c-meta text-fg-muted hover:text-fg-primary font-semibold"
                        @click="closeFavPanel"
                      >
                        關閉
                      </button>
                    </div>
                  </div>

                  <div v-if="!fav.count" class="text-fg-muted p-4 text-sm">目前沒有收藏活動</div>

                  <ul v-else class="no-scrollbar max-h-[60vh] overflow-y-auto p-2">
                    <li v-for="e in fav.items" :key="e.id" class="c-list-item">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="text-fg-primary truncate text-sm font-semibold">
                            {{ e.title || `活動 #${e.id}` }}
                          </div>
                          <div class="text-fg-muted mt-1 line-clamp-2 text-sm">
                            {{ e.desc || '（沒有描述）' }}
                          </div>
                        </div>
                        <button
                          type="button"
                          class="rounded-btn text-brand-primary hover:bg-bg-base shrink-0 px-3 py-1.5 text-sm font-semibold"
                          @click="onSelectFavorite(e)"
                        >
                          查看
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </teleport>
          </div>

          <!-- 訊息 -->

          <button
            class="text-btn-accent hover:text-brand-primary hover:bg-btn-secondary relative flex h-10 w-10 items-center justify-center rounded-full transition max-[800px]:hidden"
            title="訊息"
            type="button"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
            @click="goChat"
          >
            <i class="fa-regular fa-comment-dots"></i>

            <span
              class="bg-brand-accent absolute top-2 right-2 h-2 w-2 rounded-full border border-white"
            />
          </button>

          <!-- 通知 -->

          <button
            class="text-btn-accent hover:text-brand-primary hover:bg-btn-secondary relative flex h-10 w-10 items-center justify-center rounded-full transition max-[800px]:hidden"
            title="通知"
            type="button"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
          >
            <i class="fa-regular fa-bell"></i>
          </button>

          <!-- Avatar：點擊導向個人頁面 -->
          <button
            type="button"
            class="border-border-default h-10 w-10 overflow-hidden rounded-full border-2 p-0"
            title="個人頁面"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
            @click="goProfile"
          >
            <img :src="defaultAvatar" class="h-full w-full object-cover" alt="avatar" />
          </button>
        </div>

        <!-- Menu 按鈕 -->
        <MenuButton class="ml-2" />
      </div>
    </div>
  </header>
</template>
