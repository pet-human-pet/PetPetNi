<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { useActiveItem } from '@/composables/useActiveItem'
import { useScreen } from '@/composables/useScreen'
import { useScrollLock } from '@/composables/useScrollLock'

const router = useRouter()
const fav = useFavoritesStore()
const { activeId, activate, deactivate, registerRef } = useActiveItem()
const { breakpoints } = useScreen()

const PANEL_ID = 'favorite-panel'
const isOpen = computed(() => activeId.value === PANEL_ID)

// Mobile check & Scroll Lock
const isPanelMobile = breakpoints.smaller('md')
useScrollLock(computed(() => isOpen.value && isPanelMobile.value))

const toggle = () => {
  if (isOpen.value) {
    deactivate()
  } else {
    activate(PANEL_ID)
  }
}

const close = () => {
  deactivate()
}

const onBackdropClose = () => {
  close()
}

const onSelectFavorite = (evt) => {
  router.push({ name: 'Event', query: { eventId: evt.id } })
  close()
}
</script>

<template>
  <div :ref="(el) => registerRef(PANEL_ID, el)" class="relative">
    <!-- Trigger Button -->
    <button class="c-header-btn" title="收藏" type="button" aria-label="收藏的活動" @click="toggle">
      <i :class="fav.count ? 'fa-solid fa-heart text-brand-accent' : 'fa-regular fa-heart'"></i>
    </button>

    <!-- Desktop Dropdown -->
    <div v-if="isOpen" class="c-popover absolute right-0 z-50 mt-2 w-72 max-md:hidden">
      <div class="border-border-default flex items-center justify-between border-b px-3 py-2">
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
            @click="close"
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

    <!-- Mobile Modal -->
    <teleport to="body">
      <div v-if="isOpen" class="md:hidden">
        <div class="fixed inset-0 z-40 bg-black/30" @click="onBackdropClose"></div>

        <div class="c-sheet fixed top-15 right-3 left-3 z-50">
          <div class="border-border-default flex items-center justify-between border-b px-4 py-3">
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
                @click="close"
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
</template>
