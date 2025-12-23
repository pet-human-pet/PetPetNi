<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import EventSideBar from '@/components/Events/EventSideBar.vue'
import EventMap from '@/components/Events/EventMap.vue'
import GroupBuySidebar from '@/components/GroupBuy/GroupBuySidebar.vue'
import GroupBuyForm from '@/components/GroupBuy/GroupBuyForm.vue'
import GroupBuyDetail from '@/components/GroupBuy/GroupBuyDetail.vue'
import mapImg from '@/assets/EventMapFinal.jpg'




/** ========== 原本資料 ========== */
const locations = {
  1: { name: '101 區域', x: 250, y: 450 },
  2: { name: '國父紀念館', x: 750, y: 380 },
  3: { name: '松菸區域', x: 1100, y: 280 },
  4: { name: '象山區域', x: 1490, y: 815 },
  5: { name: '市府區域', x: 900, y: 820 }
}

const events = ref([
  { id: 1, locId: 1, title: '101 狗狗散步團', desc: '在 101 大樓下方的草地集合，享受週末陽光。' },
  { id: 2, locId: 2, title: '國父紀念館飛盤賽', desc: '歡迎各路飛盤好狗前來挑戰！' },
  { id: 4, locId: 4, title: '象山健行小隊', desc: '體力好的狗狗集合！一起爬象山看夜景。' }
])

const groupBuys = ref([
  {
    id: 201,
    title: '法鬥專用雨衣團購',
    price: 450,
    target: 30,
    img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    desc: '這款雨衣透氣又防水,適合台灣潮濕的天氣。湊滿30件廠商給批發價!'
  },
  {
    id: 202,
    title: '手工雞肉乾零食',
    price: 180,
    target: 50,
    img: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80',
    desc: '無添加防腐劑,自家烘焙,每包100g。需要冷藏保存。'
  }
])

/** ========== 狀態（對應原本 currentTab + views） ========== */
const tab = ref('event') // 'event' | 'groupbuy'
const rightView = ref('map') // 'map' | 'gbForm' | 'gbDetail'

const selectedEventId = ref(null)
const selectedGbId = ref(null)

const gbFormOpen = computed(() => rightView.value === 'gbForm')
const selectedGb = computed(() => groupBuys.value.find(g => g.id === selectedGbId.value) || null)

/** refs：用來讓 pin click 可以 scroll 到卡片 */
const eventSidebarRef = ref(null)

function switchTab(next) {
  tab.value = next
  if (next === 'event') {
    rightView.value = 'map'
    if (!selectedEventId.value && events.value.length) selectEvent(events.value[0])
    return
  }

  // groupbuy
  if (groupBuys.value.length) {
    showGroupBuyDetail(groupBuys.value[0])
  } else {
    rightView.value = 'gbDetail'
    selectedGbId.value = null
  }
}

function selectEvent(evt, { scrollCard = false } = {}) {
  tab.value = 'event'
  rightView.value = 'map'
  selectedEventId.value = evt.id

  if (scrollCard) {
    nextTick(() => eventSidebarRef.value?.scrollTo?.(evt.id))

  }
}

function createEvent(payload) {
  const newEvt = { id: Date.now(), ...payload }
  events.value.push(newEvt)
  selectEvent(newEvt, { scrollCard: true })
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
  const newGb = { id: Date.now(), ...payload }
  groupBuys.value.push(newGb)
  showGroupBuyDetail(newGb)
}

function showGroupBuyDetail(gb) {
  tab.value = 'groupbuy'
  rightView.value = 'gbDetail'
  selectedGbId.value = gb.id
}

onMounted(() => {
  if (events.value.length) selectEvent(events.value[0])
})
</script>

<template>
  <div class="min-h-screen bg-[#f9f9f9] text-[#333] overflow-x-hidden">
    <!-- Hero（桌面版保留；你原本是 margin-top 100，現在 App 已 pt 70，所以這裡 mt 30 → 70+30=100） -->
    <section
      class="mx-auto my-0 mt-7.5 mb-7.5 h-62.5 w-full max-w-300 px-5 max-[800px]:hidden"
    >
      <div
        class="flex h-full w-full items-center justify-center rounded-2xl bg-[url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"
      >
        <div
          class="text-[2.5rem] font-bold text-white [text-shadow:0_2px_15px_rgba(0,0,0,0.6)]"
          style="font-family: 'Fredoka', sans-serif"
        >
          Explore Pet Life
        </div>
      </div>
    </section>

    <!-- main layout -->
    <main class="relative mx-auto flex w-full max-w-300 gap-6 px-5 pb-10 max-[800px]:block max-[800px]:p-0">
      <!-- Sidebar（手機版浮動底部；gb 表單開啟時手機要整組藏起來） -->
      <aside
        class="z-10 flex w-85 shrink-0 flex-col gap-5 transition-transform duration-300 ease-in-out
               max-[800px]:fixed max-[800px]:bottom-7.5 max-[800px]:left-0 max-[800px]:w-full max-[800px]:bg-transparent max-[800px]:px-3 max-[800px]:pointer-events-none"
        :class="{ 'max-[800px]:hidden': gbFormOpen }"
      >
        <!-- Tabs（手機版要有毛玻璃+大距離，照你原本） -->
        <nav
          class="flex gap-1 rounded-xl bg-[#eee] p-1 max-[800px]:pointer-events-auto
                 max-[800px]:mb-130 max-[800px]:bg-white/90 max-[800px]:backdrop-blur-xs
                 max-[800px]:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
        >
          <button
            class="flex-1 rounded-[10px] py-2.5 text-[14px] font-bold transition"
            :class="tab === 'event' ? 'bg-white text-[#ff9f43] shadow-[0_2px_6px_rgba(0,0,0,0.1)]' : 'bg-transparent text-[#666]'"
            type="button"
            @click="switchTab('event')"
          >
            活動揪團
          </button>
          <button
            class="flex-1 rounded-[10px] py-2.5 text-[14px] font-bold transition"
            :class="tab === 'groupbuy' ? 'bg-white text-[#ff9f43] shadow-[0_2px_6px_rgba(0,0,0,0.1)]' : 'bg-transparent text-[#666]'"
            type="button"
            @click="switchTab('groupbuy')"
          >
            寵物團購
          </button>
        </nav>

        <EventSideBar
          v-show="tab === 'event'"
          ref="eventSidebarRef"
          :events="events"
          :selected-id="selectedEventId"
          @select="selectEvent"
          @create="createEvent"
        />

        <GroupBuySidebar
          v-show="tab === 'groupbuy'"
          :items="groupBuys"
          :selected-id="selectedGbId"
          @select="showGroupBuyDetail"
          @open-form="showGroupBuyForm"
        />
      </aside>

      <!-- Right content（桌面 sticky；手機 fixed 背景化） -->
      <section
        class="z-1 flex h-175 flex-1 flex-col overflow-hidden rounded-2xl border border-[#ccc] bg-white
               sticky top-25
               max-[800px]:fixed max-[800px]:left-0 max-[800px]:top-15 max-[800px]:z-0 max-[800px]:h-[calc(100vh-60px)] max-[800px]:w-full
               max-[800px]:rounded-none max-[800px]:border-0"
        :class="{ 'max-[800px]:z-9999': gbFormOpen }"
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

        <!-- View 2: GroupBuy Form -->
        <GroupBuyForm
          v-show="rightView === 'gbForm'"
          @submit="submitGroupBuy"
          @cancel="cancelGroupBuyForm"
        />

        <!-- View 3: GroupBuy Detail -->
        <GroupBuyDetail
          v-show="rightView === 'gbDetail'"
          :item="selectedGb"
        />
      </section>
    </main>
  </div>
</template>

<style>
/* 只補你原本 CSS 的 no-scrollbar（Tailwind 沒內建） */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
