<script setup>
// 1. Imports
import { ref, onMounted, watch } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useEventMapStore } from '@/stores/EventMap'

// 2. Props & Emits
const props = defineProps({
  events: { type: Array, required: true },
  selectedId: { type: [Number, String, null], default: null }
})

const emit = defineEmits(['select', 'open-detail', 'open-form'])

// 3. Store / State
const fav = useFavoritesStore()
const eventStore = useEventMapStore()

const joinModalOpen = ref(false)
const joinedEvent = ref(null)
const isJoining = ref(false)
const isLeaving = ref(false)

// 追蹤每個活動的參加狀態
const participationStatus = ref(new Map())

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
async function handleJoinEvent(evt) {
  if (isJoining.value) return

  try {
    isJoining.value = true
    await eventStore.joinEvent(evt.id)

    // 更新參加狀態
    participationStatus.value.set(evt.id, true)

    // 成功後顯示彈窗
    joinedEvent.value = evt
    joinModalOpen.value = true
  } catch (error) {
    alert(error.message || '參加活動失敗')
  } finally {
    isJoining.value = false
  }
}

async function handleLeaveEvent(evt) {
  if (isLeaving.value) return

  const confirmed = confirm(`確定要取消報名「${evt.title}」嗎？`)
  if (!confirmed) return

  try {
    isLeaving.value = true
    await eventStore.leaveEvent(evt.id)

    // 更新參加狀態
    participationStatus.value.set(evt.id, false)

    alert('已成功取消報名')
  } catch (error) {
    alert(error.message || '取消報名失敗')
  } finally {
    isLeaving.value = false
  }
}

function canJoin(evt) {
  const s = String(evt.status || '').toLowerCase()
  const isOpen = s === 'recruiting' || s === 'signup' || s === 'open'
  const isFull = evt.participantsCount >= evt.capacity
  const hasJoined = participationStatus.value.get(evt.id) || false
  return isOpen && !isFull && !hasJoined
}

function hasJoined(evt) {
  return participationStatus.value.get(evt.id) || false
}

// 檢查所有活動的參加狀態
async function checkAllParticipationStatus() {
  for (const evt of props.events) {
    try {
      const isParticipating = await eventStore.checkParticipation(evt.id)
      participationStatus.value.set(evt.id, isParticipating)
    } catch (error) {
      console.error(`檢查活動 ${evt.id} 參加狀態失敗:`, error)
    }
  }
}

function closeJoinModal() {
  joinModalOpen.value = false
  joinedEvent.value = null
}

// 計算剩餘名額
function getRemainingSlots(evt) {
  return Math.max(0, evt.capacity - (evt.participantsCount || 0))
}

// 判斷是否已滿
function isFull(evt) {
  return (evt.participantsCount || 0) >= evt.capacity
}

import { getStatusBadge } from '@/utils/statusHelper'

function eventBadge(status) {
  return getStatusBadge(status)
}

// 生命週期
onMounted(() => {
  checkAllParticipationStatus()
})

// 監聽活動列表變化
watch(() => props.events, () => {
  checkAllParticipationStatus()
}, { deep: true })
</script>

<template>
  <section
    class="no-scrollbar pointer-events-auto flex flex-row gap-3 overflow-x-auto pb-1.25 md:flex-col md:gap-3.75 md:overflow-visible md:pb-0"
  >
    <!-- create card -->
    <div
      class="border-brand-primary bg-bg-surface shadow-card flex h-40 w-60 flex-none snap-center flex-col items-center justify-center rounded-2xl border-2 border-dashed p-0 transition-all md:h-auto md:w-full md:flex-initial md:flex-row md:items-stretch md:justify-start md:rounded-xl md:p-4 md:shadow-none"
    >
      <button
        class="text-brand-primary flex h-full w-full flex-col items-center justify-center gap-2 bg-transparent py-2 text-[14px] font-bold md:h-auto md:flex-row md:text-[16px]"
        type="button"
        @click="emit('open-form')"
      >
        <i class="fa-solid fa-circle-plus text-[28px] md:text-base"></i>
        <span>發起新活動</span>
      </button>
    </div>

    <!-- cards -->
    <ul class="m-0 flex list-none flex-col gap-3.75 p-0 max-md:flex-row max-md:gap-3">
      <li
        v-for="evt in props.events"
        :key="evt.id"
        :ref="setCardRef(evt.id)"
        class="c-event-card"
        :class="{ 'c-event-card--active': String(props.selectedId) === String(evt.id) }"
        @click="emit('select', evt)"
      >
        <div class="p-3 md:p-3.75">
          <div class="mb-1 flex items-start justify-between gap-2">
            <div class="text-fg-primary text-[16px] leading-snug font-bold">
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
            class="text-fg-secondary [display:-webkit-box] overflow-hidden text-[12px] leading-[1.4] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] md:text-[13px]"
          >
            {{ evt.desc }}
          </div>

          <!-- 發起人與報名人數 -->
          <div class="text-fg-muted mt-2 flex items-center justify-between text-xs">
            <div v-if="evt.initiator">
              發起人：
              <span
                class="text-brand-primary decoration-brand-primary/30 hover:decoration-brand-primary cursor-pointer font-bold underline underline-offset-2"
                @click.stop="() => {} /* Placeholder for profile navigation */"
              >
                {{ evt.initiator.name }}
              </span>
            </div>

            <!-- 報名人數 / 上限 -->
            <div
              class="flex items-center gap-1 text-[11px] font-bold"
              :class="isFull(evt) ? 'text-func-danger' : 'text-brand-primary'"
            >
              <i class="fa-solid fa-users"></i>
              <span>{{ evt.participantsCount || 0 }}/{{ evt.capacity }}</span>
              <span v-if="isFull(evt)" class="text-func-danger">(已滿)</span>
              <span v-else class="text-fg-muted">(剩 {{ getRemainingSlots(evt) }})</span>
            </div>
          </div>
        </div>

        <div class="flex gap-2.5 px-3 pb-3.75 md:px-3.75">
          <!-- 已參加：顯示取消報名按鈕 -->
          <button
            v-if="hasJoined(evt)"
            type="button"
            class="c-btn--primary h-8 flex-1 rounded-[17px] text-[12px] font-bold text-white md:h-8.5"
            :disabled="isLeaving"
            @click.stop="handleLeaveEvent(evt)"
          >
            <i v-if="isLeaving" class="fa-solid fa-spinner fa-spin mr-1"></i>
            <i v-else class="fa-solid fa-right-from-bracket mr-1"></i>
            {{ isLeaving ? '取消中...' : '取消報名' }}
          </button>

          <!-- 未參加：顯示參加按鈕 -->
          <button
            v-else
            type="button"
            class="h-8 flex-1 rounded-[17px] text-[12px] font-bold md:h-8.5"
            :disabled="!canJoin(evt) || isJoining"
            :class="
              !canJoin(evt)
                ? 'c-btn text-fg-muted cursor-not-allowed bg-gray-100'
                : 'c-btn--primary text-white'
            "
            @click.stop="canJoin(evt) && handleJoinEvent(evt)"
          >
            <i v-if="isJoining" class="fa-solid fa-spinner fa-spin mr-1"></i>
            <i v-else class="fa-solid fa-paw mr-1"></i>
            {{ isFull(evt) ? '已額滿' : evt.status === 'ended' ? '已結束' : '參加' }}
          </button>

          <button
            type="button"
            class="h-8 flex-1 rounded-[17px] bg-gray-100 text-[12px] font-bold md:h-8.5"
            :class="fav.has(evt.id) ? 'text-func-danger' : 'text-fg-secondary'"
            :aria-pressed="fav.has(evt.id)"
            aria-label="收藏活動"
            @click.stop="fav.toggle(evt)"
          >
            <i :class="fav.has(evt.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
          </button>

          <button
            type="button"
            class="text-fg-secondary h-8 flex-1 rounded-[17px] bg-gray-100 text-[12px] font-bold md:h-8.5"
            @click.stop="emit('open-detail', evt)"
          >
            <i class="fa-solid fa-circle-info"></i>
          </button>
        </div>
      </li>
    </ul>

    <!-- join success modal -->
    <div
      v-if="joinModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"
      @click="closeJoinModal"
    >
      <div class="bg-bg-surface shadow-dialog w-full max-w-sm rounded-2xl p-5" @click.stop>
        <div class="text-fg-primary mb-2 text-[18px] font-bold">已成功報名 🎉</div>
        <p class="text-fg-secondary text-[14px]">
          你已報名「<span class="text-brand-primary font-bold">{{ joinedEvent?.title }}</span
          >」活動！
        </p>

        <button
          type="button"
          class="c-btn--primary mt-4 w-full p-3 text-[14px]"
          @click="closeJoinModal"
        >
          確定
        </button>
      </div>
    </div>
  </section>
</template>
