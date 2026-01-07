<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { useUIStore } from '@/stores/ui'

const router = useRouter()
const fav = useFavoritesStore()
const uiStore = useUIStore()

const props = defineProps({
  avatarUrl: { type: String, default: '' }
})

const defaultAvatar =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=60'

const favOpen = ref(false)
const menuOpen = computed(() => uiStore.isMenuOpen)

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

function toggleMenu() {
  // 開啟選單時順便關掉收藏面板，避免疊在一起
  if (!menuOpen.value) closeFavPanel()
  uiStore.toggleMenu()
}
</script>

<template>
  <div class="h-(--header-h) w-full">
    <header
      class="border-border-default bg-bg-surface fixed top-0 left-0 z-50 w-full h-(--header-h) border-b"
    >
      <div
        class="mx-auto flex h-full max-w-300 items-center justify-between px-6 max-md:px-4"
      >
        <router-link
          :to="{ name: 'home' }"
          class="flex items-center no-underline"
          :class="{ 'pointer-events-none opacity-40': menuOpen }"
        >
          <!-- Logo（先用文字：不使用 inline font；後續可改成圖片） -->
          <span class="text-brand-primary text-2xl font-semibold md:text-3xl"
            >PetPetNi</span
          >
        </router-link>

        <div class="flex items-center gap-3 max-md:gap-2">
          <!-- 收藏：桌機 dropdown、手機 modal -->
          <div
            class="relative"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
          >
            <button
              class="c-icon-btn"
              title="收藏"
              type="button"
              aria-label="收藏的活動"
              @click="toggleFavPanel"
            >
              <!-- 有收藏：用品牌強調色（避免使用未定義 token 的紅色） -->
              <i
                :class="
                  fav.count
                    ? 'fa-solid fa-heart text-func-danger'
                    : 'fa-regular fa-heart'
                "
              ></i>
            </button>

            <!-- ===== Desktop dropdown（md 以上） ===== -->
            <div
              v-if="favOpen"
              class="c-popover absolute right-0 mt-2 w-72 max-md:hidden"
            >
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

              <div v-if="!fav.count" class="text-fg-muted p-3 text-sm">
                目前沒有收藏活動
              </div>

              <ul v-else class="no-scrollbar max-h-80 overflow-y-auto p-2">
                <li v-for="e in fav.items" :key="e.id" class="c-list-item">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div
                        class="text-fg-primary truncate text-sm font-semibold"
                      >
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

            <!-- ===== Mobile modal（max-md） ===== -->
            <teleport to="body">
              <div v-if="favOpen" class="md:hidden">
                <div
                  class="fixed inset-0 z-40 bg-black/30"
                  @click="onBackdropClose"
                ></div>

                <div class="c-sheet fixed top-15 right-3 left-3 z-50">
                  <div
                    class="border-border-default flex items-center justify-between border-b px-4 py-3"
                  >
                    <div class="text-fg-primary text-sm font-semibold">
                      已收藏
                    </div>
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

                  <div v-if="!fav.count" class="text-fg-muted p-4 text-sm">
                    目前沒有收藏活動
                  </div>

                  <ul
                    v-else
                    class="no-scrollbar max-h-[60vh] overflow-y-auto p-2"
                  >
                    <li v-for="e in fav.items" :key="e.id" class="c-list-item">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div
                            class="text-fg-primary truncate text-sm font-semibold"
                          >
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
            class="c-icon-btn"
            title="訊息"
            type="button"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
            @click="goChat"
          >
            <i class="fa-regular fa-comment-dots"></i>

            <!-- badge：使用品牌強調色，避免使用未定義 token 的紅色 -->
            <span
              class="border-bg-surface bg-brand-accent absolute top-2 right-2 h-2 w-2 rounded-full border"
            ></span>
          </button>

          <!-- 通知（暫留） -->
          <button
            class="c-icon-btn"
            title="通知"
            type="button"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
          >
            <i class="fa-regular fa-bell"></i>
          </button>

          <!-- Avatar -->
          <button
            type="button"
            class="border-border-default h-10 w-10 overflow-hidden rounded-full border p-0 max-md:h-9 max-md:w-9"
            title="個人頁面"
            :class="{ 'pointer-events-none opacity-40': menuOpen }"
            @click="goProfile"
          >
            <img
              :src="props.avatarUrl || defaultAvatar"
              class="h-full w-full object-cover"
              alt="avatar"
            />
          </button>

          <!-- menu：接到 uiStore -->
          <button
            class="rounded-btn text-fg-secondary hover:bg-bg-base hover:text-brand-primary ml-2 p-2 text-xl transition-colors max-md:ml-1"
            type="button"
            title="menu"
            @click="toggleMenu"
          >
            <i class="fa-solid" :class="menuOpen ? 'fa-xmark' : 'fa-bars'"></i>
          </button>
        </div>
      </div>
    </header>
  </div>
</template>
