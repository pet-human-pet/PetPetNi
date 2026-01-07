<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useEventMapStore } from '@/stores/EventMap'
import { useGroupBuyStore } from '@/stores/GroupBuy'
// import { useEventCommentStore } from '@/stores/EventComment'

import EventSideBar from '@/components/Events/EventSideBar.vue'
import EventMap from '@/components/Events/EventMap.vue'
import EventForm from '@/components/Events/EventForm.vue'
import EventComments from '@/components/Events/EventComments.vue'
import GroupBuySidebar from '@/components/GroupBuy/GroupBuySidebar.vue'
import GroupBuyForm from '@/components/GroupBuy/GroupBuyForm.vue'
import GroupBuyDetail from '@/components/GroupBuy/GroupBuyDetail.vue'
import mapImg from '@/assets/EventMapFinal.jpg'

// Store 設定
const eventStore = useEventMapStore()
const groupBuyStore = useGroupBuyStore()

const { events, visibleEvents } = storeToRefs(eventStore)
const { groupBuys, approvedGroupBuys, pendingGroupBuys } = storeToRefs(groupBuyStore)
// 評論 Store 直接使用 actions/getters

// 滾動鎖定邏輯
import { useScrollLock } from '@vueuse/core'

const isLocked = useScrollLock(document.body)

onMounted(() => {
  isLocked.value = true
})

onBeforeUnmount(() => {
  isLocked.value = false
})

// 地圖設定邏輯
const MAP_PROFILE = {
  desktop: { scale: 1, dx: 0, dy: 0 },
  tablet: { scale: 1, dx: -100, dy: 90 },
  mobile: { scale: 1, dx: 0, dy: 0 }
}

const vw = ref(window.innerWidth)
const onResize = () => (vw.value = window.innerWidth)
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

const locations = computed(() => {
  // 使用 'lg' (1024px) 作為平板邊界，'md' (768px) 作為手機邊界
  const profile = vw.value < 768 ? 'mobile' : vw.value < 1024 ? 'tablet' : 'desktop'
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

// 頁籤與導航邏輯
const tab = ref('event') // 'event' | 'groupbuy'
const rightView = ref('map') // 'map' | 'comments' | 'eventForm' | 'gbForm' | 'gbDetail'

const selectedEventId = ref(null)
const selectedGbId = ref(null)

const selectedEvent = computed(
  () => events.value.find((e) => String(e.id) === String(selectedEventId.value)) || null
)

const selectedGb = computed(() => groupBuys.value.find((g) => g.id === selectedGbId.value) || null)

const gbJoinOpen = ref(false)
const isMobileOverlayOpen = computed(
  () => ['gbForm', 'eventForm', 'comments'].includes(rightView.value) || gbJoinOpen.value
)

const eventSidebarRef = ref(null)

function switchTab(next) {
  tab.value = next
  if (next === 'event') {
    rightView.value = 'map'
    if (!selectedEventId.value && visibleEvents.value.length) selectEvent(visibleEvents.value[0])
    return
  }

  // 團購
  if (approvedGroupBuys.value.length) {
    showGroupBuyDetail(approvedGroupBuys.value[0])
  } else {
    rightView.value = 'gbDetail'
    selectedGbId.value = null
  }
}

function selectEvent(evt, { scrollCard = false } = {}) {
  tab.value = 'event'

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
  tab.value = 'event'
  rightView.value = 'eventForm'
}

function cancelEventForm() {
  rightView.value = 'map'
}

function openEventComments(evt) {
  tab.value = 'event'
  selectedEventId.value = evt.id
  rightView.value = 'comments'
}

function backToMap() {
  rightView.value = 'map'
}

function showGroupBuyForm() {
  tab.value = 'groupbuy'
  rightView.value = 'gbForm'
  selectedGbId.value = null
}

function cancelGroupBuyForm() {
  if (groupBuys.value.length) showGroupBuyDetail(groupBuys.value[groupBuys.value.length - 1])
  else {
    rightView.value = 'gbDetail'
    selectedGbId.value = null
  }
}

function submitGroupBuy(payload) {
  groupBuyStore.addGroupBuy(payload)

  tab.value = 'groupbuy'

  const firstApproved = approvedGroupBuys.value[0]
  if (firstApproved) {
    showGroupBuyDetail(firstApproved)
  } else {
    rightView.value = 'gbDetail'
    selectedGbId.value = null
  }
}

function showGroupBuyDetail(gb) {
  tab.value = 'groupbuy'
  rightView.value = 'gbDetail'
  selectedGbId.value = gb.id
}

onMounted(() => {
  if (visibleEvents.value.length) selectEvent(visibleEvents.value[0])
})
</script>

<template>
  <div class="bg-bg-base text-fg-primary h-screen overflow-hidden">
    <!-- 主要佈局 -->
    <main
      class="relative mx-auto block h-[calc(100vh-64px)] w-full max-w-300 overflow-hidden p-0 md:flex md:gap-6 md:px-5 md:pt-6 md:pb-10"
    >
      <!-- 側邊欄 (手機: 固定頂部 | 桌機: 黏性定位) -->
      <!-- 將 max-[800px] 重構為 md: (類 Mobile First 方法，使用 md 作為桌機切換點) -->
      <!-- 邏輯：預設 (手機) 為固定頂部 (header 下方)。在 md+ 變為黏性側邊欄。 -->
      <aside
        class="pointer-events-none fixed top-[70px] left-0 z-10 flex h-[calc(100vh-90px)] w-full flex-col justify-between gap-5 overflow-hidden bg-transparent px-3 transition-transform duration-300 ease-in-out md:pointer-events-auto md:static md:h-auto md:w-85 md:shrink-0 md:justify-start md:overflow-auto md:bg-transparent md:px-0"
        :class="{ hidden: isMobileOverlayOpen && vw < 768 }"
      >
        <!-- 頁籤 -->
        <nav
          class="shadow-card pointer-events-auto mb-0 flex gap-1 rounded-xl bg-gray-100 p-1 backdrop-blur-xs md:mb-0 md:bg-gray-100 md:shadow-none md:backdrop-filter-none"
        >
          <button
            class="flex-1 rounded-[10px] py-2.5 text-[14px] font-bold transition"
            :class="
              tab === 'event'
                ? 'bg-bg-surface text-brand-primary shadow-card'
                : 'text-fg-secondary bg-transparent'
            "
            type="button"
            @click="switchTab('event')"
          >
            活動揪團
          </button>
          <button
            class="flex-1 rounded-[10px] py-2.5 text-[14px] font-bold transition"
            :class="
              tab === 'groupbuy'
                ? 'bg-bg-surface text-brand-primary shadow-card'
                : 'text-fg-secondary bg-transparent'
            "
            type="button"
            @click="switchTab('groupbuy')"
          >
            寵物團購
          </button>
        </nav>

        <!-- 內容僅在桌機顯示，手機使用覆蓋層或下方邏輯？ 
                等等，原始代碼中，側邊欄內容在 aside 內部。
                在手機上，側邊欄內容 (EventSidebar) 應該隱藏？
                原始：max-[800px]:fixed ... bottom-7.5
                側邊欄內容 (列表) - 在手機上去哪了？
                原始代碼似乎沒有在手機上明確隱藏 EventSideBar，
                但 aside 高度可能很小或者是只有 tabs？
                事實上，原始代碼有：max-[800px]:mb-130 給 tabs。
                而且 aside 本身是固定底部。
                列表似乎在那裡但也許被隱藏在螢幕外？
                再看一次原始代碼。
                aside -> 固定底部。
                nav -> mb-130。
                所以列表項目可能在 nav 下方或上方？
                如果 nav 有 mb-130，它會把內容往下推？不，nav 的 margin-bottom 會把兄弟元素往下推。
                實際上檢查原始代碼，aside 是一個 flex-col。
                nav 是第一個子元素。
                如果 aside 是固定底部，flex-col 意味著 nav 在 aside 容器頂部，然後 Sidebar 項目在它下方。
                如果 aside 是 bottom-7.5，且 nav 有 mb-130... 這個佈局很怪。
                也許使用者的意圖是只在手機底部顯示 Tabs，列表顯示在其他地方？
                但 EventSidebar 在 aside 裡面。
                如果我看典型的行動設計，通常地圖是全螢幕，並且有一個底部工作表 (bottom sheet)。
                暫時假設我們只想讓 Tabs 可見。
           -->
        <!-- 恢復原始行為但更乾淨：在手機上，只有 Tabs 容易存取或者它充當抽屜？
                之前的代碼在手機 nav 上有 `mb-130`。這很大。
                它可能把側邊欄內容推到視圖外？
                或者側邊欄內容僅供桌機？
                "EventSideBar v-show=tab==='event'"
                在手機上，也許我們不顯示活動列表？我們顯示地圖。
                讓我們保持結構但確保 Tabs 可見。
           -->
        <EventSideBar
          v-show="tab === 'event'"
          ref="eventSidebarRef"
          :events="visibleEvents"
          :selected-id="selectedEventId"
          @select="selectEvent"
          @open-form="showEventForm"
          @open-comments="openEventComments"
        />

        <GroupBuySidebar
          v-show="tab === 'groupbuy'"
          :items="approvedGroupBuys"
          :selected-id="selectedGbId"
          @select="showGroupBuyDetail"
          @open-form="showGroupBuyForm"
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

        <!-- 視圖 4: 團購表單 -->
        <GroupBuyForm
          v-show="rightView === 'gbForm'"
          :pending-items="pendingGroupBuys"
          @submit="submitGroupBuy"
          @cancel="cancelGroupBuyForm"
        />

        <!-- 視圖 5: 團購詳情 -->
        <GroupBuyDetail
          v-show="rightView === 'gbDetail'"
          :item="selectedGb"
          @overlay="gbJoinOpen = $event"
        />
      </section>
    </main>
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
