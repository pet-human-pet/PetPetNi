<script setup>
import { ref, computed, nextTick, onMounted, reactive, onBeforeUnmount } from 'vue'
import EventSideBar from '@/components/Events/EventSideBar.vue'
import EventMap from '@/components/Events/EventMap.vue'
import EventForm from '@/components/Events/EventForm.vue'
import EventComments from '@/components/Events/EventComments.vue'
import GroupBuySidebar from '@/components/GroupBuy/GroupBuySidebar.vue'
import GroupBuyForm from '@/components/GroupBuy/GroupBuyForm.vue'
import GroupBuyDetail from '@/components/GroupBuy/GroupBuyDetail.vue'
import mapImg from '@/assets/EventMapFinal.jpg'

let _prevOverflow = ''
let _prevPaddingRight = ''

function lockBodyScroll() {
  const body = document.body
  _prevOverflow = body.style.overflow
  _prevPaddingRight = body.style.paddingRight

  // 避免鎖住後造成版面左右跳動（因為 scrollbar 消失）
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`
}

function unlockBodyScroll() {
  const body = document.body
  body.style.overflow = _prevOverflow
  body.style.paddingRight = _prevPaddingRight
}

onMounted(lockBodyScroll)
onBeforeUnmount(unlockBodyScroll)

/** ========== 原本資料 ========== */
const baseLocations = {
  1: { name: '101 區域', x: 280, y: 410 },
  2: { name: '國父紀念館', x: 750, y: 370 },
  3: { name: '松菸區域', x: 1050, y: 280 },
  4: { name: '象山區域', x: 1490, y: 815 },
  5: { name: '市府區域', x: 900, y: 820 }
}

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
  const profile = vw.value <= 800 ? 'mobile' : vw.value <= 1024 ? 'tablet' : 'desktop'
  const { scale, dx, dy } = MAP_PROFILE[profile]

  const out = {}
  for (const [id, loc] of Object.entries(baseLocations)) {
    out[id] = {
      ...loc,
      x: Math.round(loc.x * scale + dx),
      y: Math.round(loc.y * scale + dy)
    }
  }
  return out
})

const events = ref([
  {
    id: 1,
    locId: 1,
    title: '101 狗狗散步團',
    desc: '在 101 大樓下方的草地集合，享受週末陽光。',
    status: 'active'
  },
  {
    id: 2,
    locId: 2,
    title: '國父紀念館飛盤賽',
    desc: '歡迎各路飛盤好狗前來挑戰！',
    status: 'active'
  },
  {
    id: 3,
    locId: 3,
    title: '松山菸廠攝影競賽',
    desc: '歡迎拍攝好手，一起來參加攝影比賽!',
    status: 'ended'
  }
])

const groupBuys = ref([
  {
    id: 201,
    title: '法鬥專用雨衣團購',
    price: 450,
    target: 30,
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    desc: '這款雨衣透氣又防水,適合台灣潮濕的天氣。湊滿30件廠商給批發價!',
    status: 'approved'
  },
  {
    id: 202,
    title: '手工雞肉乾零食',
    price: 180,
    target: 50,
    img: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80',
    desc: '無添加防腐劑,自家烘焙,每包100g。需要冷藏保存。',
    status: 'approved'
  }
])

/** ========== 狀態（對應原本 currentTab + views） ========== */
const tab = ref('event') // 'event' | 'groupbuy'
const rightView = ref('map') // 'map' | 'comments' | 'eventForm' | 'gbForm' | 'gbDetail'

const selectedEventId = ref(null)
const selectedGbId = ref(null)

const commentsByEvent = reactive({
  1: [
    { id: 1, text: '昨天去 101 草地超讚，狗狗玩到不想走！', createdAt: '2025-12-26 18:20' },
    { id: 2, text: '建議帶水跟拾便袋～人也很多', createdAt: '2025-12-26 19:05' },
    { id: 3, text: '想問下次活動還會約嗎？', createdAt: '2025-12-26 20:10' }
  ],
  2: [{ id: 4, text: '飛盤賽太可愛了，超多狗狗！', createdAt: '2025-12-25 16:40' }],

  3: [{ id: 3, text: '好喜歡攝影競賽，大家都好厲害！', createdAt: '2025-11-23 17:40' }]
})

const selectedEvent = computed(
  () => events.value.find((e) => String(e.id) === String(selectedEventId.value)) || null
)

const gbFormOpen = computed(() => rightView.value === 'gbForm')
const selectedGb = computed(() => groupBuys.value.find((g) => g.id === selectedGbId.value) || null)
const pendingGroupBuys = computed(() =>
  groupBuys.value
    .filter((g) => g.status === 'pending')
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
)

const approvedGroupBuys = computed(() => groupBuys.value.filter((g) => g.status === 'approved'))

const gbJoinOpen = ref(false)
const isMobileOverlayOpen = computed(
  () => ['gbForm', 'eventForm', 'comments'].includes(rightView.value) || gbJoinOpen.value
)

/** refs：用來讓 pin click 可以 scroll 到卡片 */
const eventSidebarRef = ref(null)
// ✅ sidebar 要顯示：approved + ended（不顯示 pending）
const visibleEvents = computed(() => events.value.filter((e) => e.status !== 'pending'))

function switchTab(next) {
  tab.value = next
  if (next === 'event') {
    rightView.value = 'map'
    if (!selectedEventId.value && visibleEvents.value.length) selectEvent(visibleEvents.value[0])
    return
  }

  // groupbuy
  if (approvedGroupBuys.value.length) {
    showGroupBuyDetail(approvedGroupBuys.value[0])
  } else {
    rightView.value = 'gbDetail'
    selectedGbId.value = null
  }
}

function getProfile() {
  const w = window.innerWidth
  if (w <= 800) return 'mobile'
  if (w <= 1024) return 'tablet'
  return 'desktop'
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
  const newEvt = {
    id: Date.now(),
    status: 'pending',
    ...payload
  }

  events.value.push(newEvt)

  // 原本會進「待審核」：這裡保留原本切換邏輯
  // rightView.value = 'submitted' 或你現有的待審核畫面
  // 先不要 selectEvent(newEvt)，因為它不該出現在 sidebar
  rightView.value = 'map'
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

function addComment(text) {
  const id = selectedEventId.value
  if (id == null) return

  const key = String(id)
  if (!commentsByEvent[key]) commentsByEvent[key] = []

  commentsByEvent[key].unshift({
    id: Date.now(),
    text,
    createdAt: new Date().toLocaleString()
  })
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
  groupBuys.value.unshift({
    ...payload,
    status: payload.status ?? 'pending',
    createdAt: payload.createdAt ?? Date.now()
  })

  // ✅ 送審後回到團購列表/詳情（不顯示 pending 在 sidebar）
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
  <div class="h-screen overflow-hidden bg-[#f9f9f9] text-[#333]">
    <!-- main layout -->
    <main
      class="relative mx-auto flex h-[calc(100vh-64px)] w-full max-w-300 gap-6 overflow-hidden px-5 pt-6 pb-10 max-[800px]:block max-[800px]:p-0"
    >
      <!-- Sidebar（手機版浮動底部；gb 表單開啟時手機要整組藏起來） -->
      <aside
        class="z-10 flex w-85 shrink-0 flex-col gap-5 overflow-auto transition-transform duration-300 ease-in-out max-[800px]:pointer-events-none max-[800px]:fixed max-[800px]:bottom-7.5 max-[800px]:left-0 max-[800px]:w-full max-[800px]:bg-transparent max-[800px]:px-3"
        :class="{ 'max-[800px]:hidden': isMobileOverlayOpen }"
      >
        <!-- Tabs（手機版要有毛玻璃+大距離，照你原本） -->
        <nav
          class="flex gap-1 rounded-xl bg-[#eee] p-1 max-[800px]:pointer-events-auto max-[800px]:mb-130 max-[800px]:bg-white/90 max-[800px]:shadow-[0_2px_8px_rgba(0,0,0,0.1)] max-[800px]:backdrop-blur-xs"
        >
          <button
            class="flex-1 rounded-[10px] py-2.5 text-[14px] font-bold transition"
            :class="
              tab === 'event'
                ? 'bg-white text-[#ff9f43] shadow-[0_2px_6px_rgba(0,0,0,0.1)]'
                : 'bg-transparent text-[#666]'
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
                ? 'bg-white text-[#ff9f43] shadow-[0_2px_6px_rgba(0,0,0,0.1)]'
                : 'bg-transparent text-[#666]'
            "
            type="button"
            @click="switchTab('groupbuy')"
          >
            寵物團購
          </button>
        </nav>

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

      <!-- Right content（桌面 sticky；手機 fixed 背景化） -->
      <section
        class="z-1 flex h-full flex-1 flex-col overflow-hidden rounded-2xl border border-[#ccc] bg-white max-[800px]:fixed max-[800px]:top-20 max-[800px]:left-0 max-[800px]:z-0 max-[800px]:h-[calc(100vh-60px)] max-[800px]:w-full max-[800px]:rounded-none max-[800px]:border-0 lg:sticky lg:top-25"
        :class="{ 'max-[800px]:z-9999': isMobileOverlayOpen }"
      >
        <!-- View 1: Map -->
        <EventMap
          v-show="rightView === 'map'"
          :events="events"
          :locations="locations"
          :selected-id="selectedEventId"
          :map-src="mapImg"
          @pin-click="(evt) => selectEvent(evt, { scrollCard: true })"
        />
        <!--View 2: Comments-->
        <EventComments
          v-show="rightView === 'comments'"
          :event="selectedEvent"
          :comments="selectedEventId != null ? commentsByEvent[String(selectedEventId)] || [] : []"
          @back="backToMap"
          @add="addComment"
        />
        <!--View 3: Comments-->
        <EventForm
          v-show="rightView === 'eventForm'"
          @submit="createEvent"
          @cancel="cancelEventForm"
        />

        <!-- View 4: GroupBuy Form -->
        <GroupBuyForm
          v-show="rightView === 'gbForm'"
          :pending-items="pendingGroupBuys"
          @submit="submitGroupBuy"
          @cancel="cancelGroupBuyForm"
        />

        <!-- View 3: GroupBuy Detail -->
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
/* 只補你原本 CSS 的 no-scrollbar（Tailwind 沒內建） */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
