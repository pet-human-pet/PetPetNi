<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useScreen } from '@/composables/useScreen.js'
const props = defineProps({
  events: { type: Array, required: true },
  locations: { type: Object, required: true },
  selectedId: { type: [Number, String, null], default: null },
  mapSrc: { type: String, required: true }
})

const emit = defineEmits(['pin-click'])
const { isMobile } = useScreen()
const sameId = (a, b) => String(a) === String(b)
const getLoc = (locId) => props.locations?.[locId] ?? props.locations?.[String(locId)] ?? null

const selectedEvt = computed(() => props.events.find((e) => sameId(e.id, props.selectedId)) ?? null)
const selectedLoc = computed(() => (selectedEvt.value ? getLoc(selectedEvt.value.locId) : null))

const mapBox = ref(null)
const mapLayer = ref(null)
const transform = ref('translate(0px, 0px)')

function computeTransformByLoc(loc) {
  const layer = mapLayer.value
  const box = mapBox.value
  if (!layer || !box || !loc) return

  const mapWidth = layer.offsetWidth
  const mapHeight = layer.offsetHeight
  const boxWidth = box.offsetWidth
  const boxHeight = box.offsetHeight

  let moveX = boxWidth / 2 - loc.x
  let moveY = boxHeight / 2 - loc.y

  if (isMobile.value) moveY += 80

  if (mapWidth > boxWidth) {
    const minX = boxWidth - mapWidth
    moveX = Math.min(0, Math.max(minX, moveX))
  } else {
    moveX = (boxWidth - mapWidth) / 2
  }

  if (mapHeight > boxHeight) {
    const minY = boxHeight - mapHeight
    moveY = Math.min(0, Math.max(minY, moveY))
  } else {
    moveY = (boxHeight - mapHeight) / 2
  }

  transform.value = `translate(${moveX}px, ${moveY}px)`
}

async function recenter() {
  const loc = selectedLoc.value
  if (!loc) return
  await nextTick()

  let attempts = 0
  const tryFocus = () => {
    const hasSize = mapBox.value?.offsetWidth > 0 && mapLayer.value?.offsetWidth > 0
    if (hasSize) {
      computeTransformByLoc(loc)
    } else if (attempts < 5) {
      attempts++
      setTimeout(tryFocus, 150)
    }
  }
  tryFocus()
}

watch(() => props.selectedId, recenter)
watch(() => props.events.length, recenter)

const onResize = () => recenter()
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <div class="bg-bg-base relative h-full w-full overflow-hidden">
    <div ref="mapBox" class="relative h-full w-full">
      <div
        ref="mapLayer"
        class="pointer-events-auto absolute top-0 left-0 h-250 w-387.5 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        :style="{ transform }"
      >
        <img
          :src="props.mapSrc"
          class="block h-full w-full object-fill"
          alt="Map"
          @load="recenter"
        />

        <!-- 其他活動：用小點點（避免誤認為「貓掌跳點」） -->
        <div
          v-for="evt in props.events"
          :key="evt.id"
          class="pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2"
          :style="
            getLoc(evt.locId)
              ? { left: getLoc(evt.locId).x + 'px', top: getLoc(evt.locId).y + 'px' }
              : {}
          "
          @click.stop="emit('pin-click', evt)"
        >
          <div
            class="bg-status-warning h-3 w-3 rounded-full opacity-60 shadow-[0_2px_6px_rgba(0,0,0,0.18)] md:h-2.5 md:w-2.5"
            :class="sameId(props.selectedId, evt.id) ? 'opacity-0' : ''"
          ></div>
        </div>

        <!-- 被選取的活動：只顯示這一個貓掌 -->
        <div
          v-if="selectedEvt && selectedLoc"
          class="pointer-events-auto absolute z-20 h-12.5 w-12.5 -translate-x-1/2 -translate-y-full scale-[1.2] transition md:h-10 md:w-10"
          :style="{ left: selectedLoc.x + 'px', top: selectedLoc.y + 'px' }"
          @click.stop="emit('pin-click', selectedEvt)"
        >
          <div
            class="bg-status-warning flex h-full w-full -rotate-45 items-center justify-center rounded-[50%_50%_50%_0] border-[3px] border-white shadow-[0_3px_6px_rgba(0,0,0,0.2)]"
          >
            <i class="fa-solid fa-paw rotate-45 text-[24px] text-white md:text-[18px]"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
