<script setup>
// 1. Imports
import { ref } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'

// 2. Props & Emits
const props = defineProps({
  events: { type: Array, required: true },
  selectedId: { type: [Number, String, null], default: null }
})

const emit = defineEmits(['select', 'open-comments', 'open-form'])

// 3. Store / State
const fav = useFavoritesStore()

const joinModalOpen = ref(false)
const joinedEvent = ref(null)

// 4. Refs：scrollTo 保留
const cardEls = new Map()
const setCardRef = (id) => (el) => {
  if (el) cardEls.set(id, el)
}
function scrollTo(id) {
  cardEls.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}
defineExpose({ scrollTo })

// 5. Functions
function openJoinModal(evt) {
  joinedEvent.value = evt
  joinModalOpen.value = true
}

function canJoin(status) {
  const s = String(status || '').toLowerCase()
  return s === 'recruiting' || s === 'signup' || s === 'open'
}

function closeJoinModal() {
  joinModalOpen.value = false
  joinedEvent.value = null
}

function eventBadge(status) {
  const s = String(status || '').toLowerCase()

  // 報名中
  if (s === 'recruiting' || s === 'signup' || s === 'open') {
    return { text: '報名中', cls: 'bg-[#e8f5e9] text-[#2e7d32]' }
  }

  // 進行中
  if (s === 'ongoing' || s === 'active' || s === 'in_progress') {
    return { text: '進行中', cls: 'bg-[#e3f2fd] text-[#2196f3]' }
  }

  // 已結束
  if (s === 'ended' || s === 'closed') {
    return { text: '已結束', cls: 'bg-[#f5f5f5] text-[#777]' }
  }

  // 審核中（pending）
  return { text: '審核中', cls: 'bg-[#fff3e0] text-[#ef6c00]' }
}
</script>

<template>
  <section
    class="max-[800px]:no-scrollbar flex flex-col gap-3.75 max-[800px]:pointer-events-auto max-[800px]:snap-x max-[800px]:snap-mandatory max-[800px]:flex-row max-[800px]:gap-3 max-[800px]:overflow-x-auto max-[800px]:pb-1.25"
  >
    <!-- create card -->
    <div
      class="rounded-xl border-2 border-dashed border-[#ff9f43] bg-white p-4 transition-all max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center max-[800px]:flex-col max-[800px]:items-center max-[800px]:justify-center max-[800px]:rounded-2xl max-[800px]:p-0 max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
    >
      <button
        class="flex w-full items-center justify-center gap-2 bg-transparent py-2 text-[16px] font-bold text-[#ff9f43] max-[800px]:h-full max-[800px]:flex-col max-[800px]:text-[14px]"
        type="button"
        @click="emit('open-form')"
      >
        <i class="fa-solid fa-circle-plus max-[800px]:text-[28px]"></i>
        <span>發起新活動</span>
      </button>
    </div>

    <!-- cards -->
    <ul class="m-0 flex list-none flex-col gap-3.75 p-0 max-[800px]:contents">
      <li
        v-for="evt in props.events"
        :key="evt.id"
        :ref="setCardRef(evt.id)"
        class="relative cursor-pointer overflow-hidden rounded-xl border border-[#ddd] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center max-[800px]:flex-col max-[800px]:justify-between max-[800px]:rounded-2xl max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
        :class="
          String(props.selectedId) === String(evt.id)
            ? 'border-2 border-[#ff9f43] bg-[#fffcf7]'
            : ''
        "
        @click="emit('select', evt)"
      >
        <div class="p-3.75 max-[800px]:p-3">
          <div class="mb-1 flex items-start justify-between gap-2">
            <div class="text-[16px] leading-snug font-bold">
              {{ evt.title }}
            </div>

            <span
              class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="eventBadge(evt.status).cls"
            >
              {{ eventBadge(evt.status).text }}
            </span>
          </div>

          <div
            class="[display:-webkit-box] overflow-hidden text-[13px] leading-[1.4] text-[#666] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] max-[800px]:text-[12px]"
          >
            {{ evt.desc }}
          </div>
        </div>

        <div class="flex gap-2.5 px-3.75 pb-3.75 max-[800px]:px-3 max-[800px]:pb-3.75">
          <button
            type="button"
            class="h-8.5 flex-1 rounded-[17px] text-[12px] font-bold max-[800px]:h-8"
            :disabled="!canJoin(evt.status)"
            :class="!canJoin(evt.status) ? 'cursor-not-allowed ...' : 'bg-[#ff9f43] text-white'"
            @click.stop="canJoin(evt.status) && openJoinModal(evt)"
          >
            <i class="fa-solid fa-paw mr-1"></i>
            {{ evt.status === 'ended' ? '已結束' : '參加' }}
          </button>

          <button
            type="button"
            class="h-8.5 flex-1 rounded-[17px] bg-[#f0f2f5] text-[12px] font-bold max-[800px]:h-8"
            :class="fav.has(evt.id) ? 'text-[#ff4d4f]' : 'text-[#555]'"
            :aria-pressed="fav.has(evt.id)"
            aria-label="收藏活動"
            @click.stop="fav.toggle(evt)"
          >
            <i :class="fav.has(evt.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
          </button>

          <button
            type="button"
            class="h-8 flex-1 rounded-[17px] bg-[#f0f2f5] text-[12px] font-bold text-[#555] max-[800px]:h-8"
            @click.stop="emit('open-comments', evt)"
          >
            <i class="fa-regular fa-comment-dots"></i>
          </button>
        </div>
      </li>
    </ul>

    <!-- join success modal -->
    <div
      v-if="joinModalOpen"
      class="fixed inset-0 z-1100 flex items-center justify-center bg-black/40 p-5"
      @click="closeJoinModal"
    >
      <div
        class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        @click.stop
      >
        <div class="mb-2 text-[18px] font-bold text-[#333]">已成功報名 🎉</div>
        <p class="text-[14px] text-[#666]">
          你已報名「<span class="font-bold text-[#ff9f43]">{{ joinedEvent?.title }}</span
          >」活動！
        </p>

        <button
          type="button"
          class="mt-4 w-full rounded-xl bg-[#ff9f43] p-3 text-[14px] font-bold text-white"
          @click="closeJoinModal"
        >
          確定
        </button>
      </div>
    </div>
  </section>
</template>
