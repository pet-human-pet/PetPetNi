<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useScrollLock } from '@vueuse/core'
import { useScreen } from '@/composables/useScreen.js'
import { useEventMapStore } from '@/stores/EventMap'
// import { useEventCommentStore } from '@/stores/EventComment'

import EventSideBar from '@/components/Events/EventSideBar.vue'
import EventMap from '@/components/Events/EventMap.vue'
import EventForm from '@/components/Events/EventForm.vue'
import EventComments from '@/components/Events/EventComments.vue'
import mapImg from '@/assets/EventMapFinal.jpg'

const eventStore = useEventMapStore()

const { events, visibleEvents } = storeToRefs(eventStore)
// 評論 Store 直接使用 actions/getters

// 滾動鎖定邏輯
const isLocked = useScrollLock(document.body)
onMounted(() => {
  isLocked.value = true // 鎖定
})

onBeforeUnmount(() => {
  isLocked.value = false // 解鎖
})

// 視窗斷點
const { isMobile, isTablet } = useScreen()

// 地圖設定邏輯
const MAP_PROFILE = {
  desktop: { scale: 1, dx: 0, dy: 0 },
  tablet: { scale: 1, dx: -100, dy: 90 },
  mobile: { scale: 1, dx: 0, dy: 0 }
}

const locations = computed(() => {
  let profile = 'desktop'
  if (isMobile.value) profile = 'mobile'
  else if (isTablet.value) profile = 'tablet'
  const { scale, dx, dy } = MAP_PROFILE[profile]

  const out = {}
  for (const [id, loc] of Object.entries(eventStore.baseLocations)) {
    out[id] = {
      ...loc,
      x: Math.round(loc.x * scale + dx),
      y: Math.round(loc.y * scale + dy)
    }
  }
  return out
})

// 導航邏輯
const rightView = ref('map') // 'map' | 'comments' | 'eventForm'

const selectedEventId = ref(null)

const selectedEvent = computed(
  () => events.value.find((e) => String(e.id) === String(selectedEventId.value)) || null
)

const isMobileOverlayOpen = computed(() => ['eventForm', 'comments'].includes(rightView.value))

const eventSidebarRef = ref(null)

function selectEvent(evt, { scrollCard = false } = {}) {
  const keepComments = rightView.value === 'comments'
  if (!keepComments) rightView.value = 'map'

  selectedEventId.value = evt.id

  if (scrollCard) {
    nextTick(() => eventSidebarRef.value?.scrollTo?.(evt.id))
  }
}

function createEvent(payload) {
  eventStore.addEvent(payload)

  // 留在 EventForm，讓 submittedOpen 成功畫面顯示
  rightView.value = 'eventForm'
  alert('活動已送出審核！可在此頁查看送出內容')
}

function showEventForm() {
  rightView.value = 'eventForm'
}

function cancelEventForm() {
  rightView.value = 'map'
}

function openEventComments(evt) {
  selectedEventId.value = evt.id
  rightView.value = 'comments'
}

function backToMap() {
  rightView.value = 'map'
}

onMounted(() => {
  if (visibleEvents.value.length) selectEvent(visibleEvents.value[0])
})
</script>

<template>
  <div class="bg-bg-base text-fg-primary h-full overflow-hidden">
    <!-- 主要佈局 -->
    <main
      class="relative mx-auto block h-[calc(100vh-var(--header-h))] w-full max-w-300 overflow-hidden p-0 md:flex md:gap-6 md:px-5 md:pt-6 md:pb-10"
    >
      <aside
        class="pointer-events-none fixed bottom-0 left-0 z-10 flex h-auto w-full flex-col justify-start gap-5 overflow-hidden bg-transparent px-3 pb-5 transition-transform duration-300 ease-in-out md:pointer-events-auto md:static md:h-auto md:w-85 md:shrink-0 md:justify-start md:overflow-auto md:bg-transparent md:px-0 md:pb-0"
        :class="{ hidden: isMobileOverlayOpen && isMobile }"
      >
        <EventSideBar
          ref="eventSidebarRef"
          :events="visibleEvents"
          :selected-id="selectedEventId"
          @select="selectEvent"
          @open-form="showEventForm"
          @open-comments="openEventComments"
        />
      </aside>

      <!-- 右側內容 (地圖 / 詳情) -->
      <section
        class="border-border-default bg-bg-surface fixed top-0 left-0 z-1 flex h-full w-full flex-1 flex-col overflow-hidden rounded-2xl border md:sticky md:top-25 md:z-auto md:h-full md:rounded-2xl md:border"
        :class="{ 'z-100': isMobileOverlayOpen }"
      >
        <!-- 視圖 1: 地圖 -->
        <EventMap
          v-show="rightView === 'map'"
          :events="events"
          :locations="locations"
          :selected-id="selectedEventId"
          :map-src="mapImg"
          @pin-click="(evt) => selectEvent(evt, { scrollCard: true })"
        />
        <!--視圖 2: 評論-->
        <EventComments v-show="rightView === 'comments'" :event="selectedEvent" @back="backToMap" />
        <!--視圖 3: 活動表單-->
        <EventForm
          v-show="rightView === 'eventForm'"
          @submit="createEvent"
          @cancel="cancelEventForm"
        />
      </section>
    </main>
  </div>
</template>
