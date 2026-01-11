<script setup>
import { defineEmits } from 'vue'
import { useChatStore } from '@/stores/chat.js'
import {
  NAV_ITEMS,
  PAGE_NAV_ITEMS,
  MOBILE_BOTTOM_NAV,
  MOBILE_MORE_ITEMS
} from '@/utils/chatConstants'

defineProps({
  isMoreMenuOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['update:isMoreMenuOpen', 'go-to-page'])
const store = useChatStore()

const handleAction = (item) => {
  const target = item.key || item.route
  if (item.isRoute || item.route) {
    emit('go-to-page', target)
  } else {
    store.switchCategory(target)
  }
}

const handleNavClick = (item) => {
  if (item.isAction) {
    emit('update:isMoreMenuOpen', true)
  } else {
    handleAction(item)
  }
}

const handleMoreItemClick = (item) => {
  handleAction(item)
  emit('update:isMoreMenuOpen', false)
}
</script>

<template>
  <!-- Left Nav (Desktop Sidebar) -->
  <aside
    class="border-border-default bg-bg-base hidden h-full w-56 shrink-0 flex-col justify-start gap-1 border-r px-3 pt-6 md:flex"
  >
    <div class="mt-2 mb-2 flex w-full justify-start px-3">
      <span class="bg-brand-accent/10 text-brand-accent rounded-md px-2 py-0.5 text-sm font-black tracking-wider">好友</span>
    </div>

    <div
      class="c-chat-nav-item"
      :class="{ 'c-chat-nav-item--active': store.currentCategory === 'friendList' }"
      @click="store.switchCategory('friendList')"
    >
      <div class="flex h-6 w-6 items-center justify-center"><i class="fa-solid fa-address-book text-base"></i></div>
      <div class="text-sm leading-none font-bold">好友列表</div>
    </div>

    <div class="border-border-strong mx-auto my-4 h-0 w-full border-t opacity-50"></div>

    <div class="mt-2 mb-2 w-full px-3">
      <span class="bg-brand-primary/10 text-brand-primary rounded-md px-1.5 py-0.5 text-xs font-black tracking-wider">頻道</span>
    </div>

    <div
      v-for="item in NAV_ITEMS"
      :key="item.key"
      class="c-chat-nav-item relative"
      :class="{ 'c-chat-nav-item--active': store.currentCategory === item.key }"
      @click="store.switchCategory(item.key)"
    >
      <div class="flex h-6 w-6 items-center justify-center"><i class="fa-solid text-base" :class="item.icon"></i></div>
      <div class="text-sm leading-none font-bold">{{ item.label }}</div>
      <div v-if="store.unreadCounts[item.key] > 0" class="c-badge c-badge--num top-auto right-3">
        {{ store.unreadCounts[item.key] > 99 ? '99+' : store.unreadCounts[item.key] }}
      </div>
    </div>

    <div class="border-border-strong mx-auto my-4 h-0 w-full border-t opacity-50"></div>

    <div class="mt-1 mb-2 w-full px-3">
      <span class="bg-fg-muted/10 text-fg-muted rounded-md px-1.5 py-0.5 text-xs font-black tracking-wider">探索</span>
    </div>

    <div
      v-for="item in PAGE_NAV_ITEMS"
      :key="item.name"
      class="c-chat-nav-item text-fg-secondary"
      @click="handleAction(item)"
    >
      <div class="flex h-6 w-6 items-center justify-center">
        <i v-if="typeof item.icon === 'string'" class="fa-solid text-base" :class="item.icon"></i>
        <div v-else class="h-4 w-4"><component :is="item.icon" /></div>
      </div>
      <div class="text-sm leading-none font-bold">{{ item.name }}</div>
    </div>
  </aside>

  <!-- Mobile Bottom Nav -->
  <nav
    class="border-border-default bg-bg-surface fixed bottom-0 left-0 z-40 flex h-16 w-full flex-row items-center justify-around border-t px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden"
  >
    <div
      v-for="item in MOBILE_BOTTOM_NAV"
      :key="item.key"
      class="c-chat-nav-item"
      :class="[
        (item.key === 'match' && (store.currentCategory === 'match' || store.currentCategory === 'community' || store.currentCategory === 'event')) || store.currentCategory === item.key ? 'text-brand-primary' : 'text-fg-muted',
        item.isAction ? 'text-brand-accent scale-110' : ''
      ]"
      @click="handleNavClick(item)"
    >
      <div class="relative flex h-6 w-6 items-center justify-center">
        <i class="fa-solid text-lg" :class="item.icon"></i>
        <div v-if="store.unreadCounts[item.key] > 0" class="c-badge c-badge--num -top-1 left-3 border border-white">N</div>
      </div>
      <div class="text-xs font-black tracking-tighter">{{ item.label }}</div>
      <div v-if="((item.key === 'match' && (store.currentCategory === 'match' || store.currentCategory === 'community' || store.currentCategory === 'event')) || store.currentCategory === item.key) && !item.isAction" class="bg-brand-primary absolute -bottom-1.5 h-1 w-1 rounded-full"></div>
    </div>
  </nav>

  <!-- Mobile More Menu -->
  <div v-if="isMoreMenuOpen" class="fixed inset-0 z-100 flex items-end md:hidden">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="emit('update:isMoreMenuOpen', false)"></div>
    <div class="bg-bg-surface border-brand-primary/10 animate-slide-up relative w-full rounded-t-4xl border-t px-6 pt-3 pb-10 shadow-2xl" @click.stop>
      <div class="mb-6 flex justify-center"><div class="bg-border-strong/30 h-1.5 w-12 rounded-full"></div></div>
      <div class="mb-6 text-center text-brand-primary/50 text-sm font-black tracking-[0.2em] uppercase">探索更多功能</div>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="item in MOBILE_MORE_ITEMS" :key="item.key" class="bg-bg-base flex flex-col items-center gap-3 rounded-2xl p-5 transition-all active:scale-95 cursor-pointer" @click="handleMoreItemClick(item)">
          <div class="text-brand-primary flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <i v-if="typeof item.icon === 'string'" class="fa-solid text-xl" :class="item.icon"></i>
            <div v-else class="h-6 w-6"><component :is="item.icon" /></div>
          </div>
          <div class="text-fg-primary text-sm font-black">{{ item.label }}</div>
        </div>
      </div>
      <div class="mt-8 flex justify-center">
        <div class="bg-brand-primary shadow-brand-primary/30 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg cursor-pointer" @click="emit('update:isMoreMenuOpen', false)">
          <i class="fa-solid fa-xmark text-lg"></i>
        </div>
      </div>
    </div>
  </div>
</template>