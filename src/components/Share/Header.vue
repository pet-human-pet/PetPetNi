<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'

const router = useRouter()
const fav = useFavoritesStore()

const props = defineProps({
  avatarUrl: { type: String, default: '' }
})

const emit = defineEmits(['select-favorite'])

const defaultAvatar =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=60'

const favOpen = ref(false)

function goProfile() {
  router.push({ name: 'Profile' })
}

function toggleFavPanel() {
  favOpen.value = !favOpen.value
}

function closeFavPanel() {
  favOpen.value = false
}

function onSelectFavorite(evt) {
  router.push({ name: 'Event', query: { eventId: evt.id } })
  closeFavPanel()
}

function goChat() {
  router.push({ name: 'chat-test' })
}
</script>

<template>
  <header
    class="fixed top-0 left-0 z-1000 w-full border-b border-[#eee] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
  >
    <div
      class="mx-auto flex h-17.5 max-w-300 items-center justify-between px-6 max-[800px]:h-15 max-[800px]:px-4"
    >
      <router-link :to="{ name: 'home' }" class="flex items-center no-underline">
        <span
          class="text-[26px] font-semibold text-[#ff9f43] max-[800px]:text-[22px]"
          style="font-family: 'Fredoka', sans-serif"
        >
          PetPetNi
        </span>
      </router-link>

      <div class="flex items-center gap-3">
        <!-- desktop icons -->
        <!-- 收藏：dropdown（無 badge 數字） -->
        <div class="relative max-[800px]:hidden">
          <button
            class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
            title="收藏"
            type="button"
            aria-label="收藏的活動"
            @click="toggleFavPanel"
          >
            <i :class="fav.count ? 'fa-solid fa-heart text-[#ff4d4f]' : 'fa-regular fa-heart'"></i>
          </button>

          <!-- dropdown panel -->
          <div
            v-if="favOpen"
            class="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-[#eee] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
          >
            <div class="flex items-center justify-between border-b border-[#eee] px-3 py-2">
              <div class="font-bold text-[#333]">已收藏</div>
              <div class="flex items-center gap-2">
                <button
                  v-if="fav.count"
                  type="button"
                  class="text-[12px] font-bold text-[#999] hover:text-[#ff4d4f]"
                  @click="fav.clear()"
                >
                  清空
                </button>
                <button
                  type="button"
                  class="text-[12px] font-bold text-[#999] hover:text-[#333]"
                  @click="closeFavPanel"
                >
                  關閉
                </button>
              </div>
            </div>

            <div v-if="!fav.count" class="p-3 text-[13px] text-[#777]">目前沒有收藏活動</div>

            <ul v-else class="max-h-80 overflow-y-auto p-2">
              <li
                v-for="e in fav.items"
                :key="e.id"
                class="rounded-lg p-2 text-[13px] hover:bg-[#f6f7f8]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <div class="truncate font-bold text-[#333]">
                      {{ e.title || `活動 #${e.id}` }}
                    </div>
                    <div class="truncate text-[12px] text-[#777]">
                      {{ e.desc || '（沒有描述）' }}
                    </div>
                  </div>

                  <button
                    type="button"
                    class="shrink-0 rounded-md px-2 py-1 text-[12px] font-bold text-[#ff9f43] hover:bg-[#fffcf7]"
                    @click="onSelectFavorite(e)"
                  >
                    查看
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 訊息 -->
        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="訊息"
          type="button"
          @click="goChat"
        >
          <i class="fa-regular fa-comment-dots"></i>
          <span
            class="absolute top-2 right-2 h-2 w-2 rounded-full border border-white bg-[#ff5e57]"
          />
        </button>

        <!-- 通知（暫留） -->
        <button
          class="relative flex h-10 w-10 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43] max-[800px]:hidden"
          title="通知"
          type="button"
        >
          <i class="fa-regular fa-bell"></i>
        </button>

        <!-- Avatar：前往個人頁 -->
        <button
          type="button"
          class="h-10 w-10 overflow-hidden rounded-full border-2 border-[#eee] p-0"
          title="個人頁面"
          @click="goProfile"
        >
          <img
            :src="props.avatarUrl || defaultAvatar"
            class="h-full w-full object-cover"
            alt="avatar"
          />
        </button>

        <!-- menu -->
        <button
          class="ml-2 rounded-lg p-1.25 text-[22px] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
          type="button"
          title="menu"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
  </header>
</template>
