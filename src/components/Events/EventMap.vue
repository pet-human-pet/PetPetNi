<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  events: { type: Array, required: true },
  locations: { type: Object, required: true },
  selectedId: { type: [Number, String, null], default: null },
  mapSrc: { type: String, required: true },
})

const emit = defineEmits(['pin-click'])

const sameId = (a, b) => String(a) === String(b)
const getLoc = (locId) => props.locations?.[locId] ?? props.locations?.[String(locId)] ?? null

const selectedEvt = computed(() => props.events.find(e => sameId(e.id, props.selectedId)) ?? null)
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

  let moveX = (boxWidth / 2) - loc.x
  let moveY = (boxHeight / 2) - loc.y

  if (window.innerWidth <= 800) moveY += 80

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
  computeTransformByLoc(loc)
}

watch(() => props.selectedId, recenter)
watch(() => props.events.length, recenter)

const onResize = () => recenter()
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-[#fdfbf7]">
    <div ref="mapBox" class="relative h-full w-full">
      <div
        ref="mapLayer"
        class="absolute left-0 top-0 w-387.5 pointer-events-none
               transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        :style="{ transform }"
      >
        <img :src="props.mapSrc" class="block w-full object-cover" alt="Map" @load="recenter" />

        <!-- 其他活動：用小點點（避免誤認為「貓掌跳點」） -->
        <div
          v-for="evt in props.events"
          :key="evt.id"
          class="absolute z-10 pointer-events-auto -translate-x-1/2 -translate-y-1/2"
          :style="getLoc(evt.locId)
            ? { left: getLoc(evt.locId).x + 'px', top: getLoc(evt.locId).y + 'px' }
            : {}"
          @click.stop="emit('pin-click', evt)"
        >
          <div
            class="h-2.5 w-2.5 rounded-full bg-[#ff9f43] shadow-[0_2px_6px_rgba(0,0,0,0.18)] opacity-60
                   max-[800px]:h-3 max-[800px]:w-3"
            :class="sameId(props.selectedId, evt.id) ? 'opacity-0' : ''"></div>
        </div>

        <!-- 被選取的活動：只顯示這一個貓掌 -->
        <div
          v-if="selectedEvt && selectedLoc"
          class="absolute z-20 h-10 w-10 pointer-events-auto
                 -translate-x-1/2 -translate-y-full scale-[1.2] transition
                 max-[800px]:h-12.5 max-[800px]:w-12.5"
          :style="{ left: selectedLoc.x + 'px', top: selectedLoc.y + 'px' }"
          @click.stop="emit('pin-click', selectedEvt)"
        >
          <div
            class="flex h-full w-full items-center justify-center shadow-[0_3px_6px_rgba(0,0,0,0.2)]
                   border-[3px] border-white bg-[#ff9f43]
                   rounded-[50%_50%_50%_0] -rotate-45"
          >
            <i class="fa-solid fa-paw rotate-45 text-[18px] text-white max-[800px]:text-[24px]"></i>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
