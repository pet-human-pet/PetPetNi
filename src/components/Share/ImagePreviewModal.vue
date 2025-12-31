<script setup>
import { computed, watch, onBeforeUnmount } from 'vue'
import { useSwipe } from '@/composables/useSwipe'

const props = defineProps({
  open: { type: Boolean, default: false },
  images: { type: Array, default: () => [] },
  index: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'update:index'])

const src = computed(() => props.images?.[props.index] ?? '')
const hasMany = computed(() => (props.images?.length ?? 0) > 1)

const next = () => {
  if (!props.images?.length) return
  emit('update:index', (props.index + 1) % props.images.length)
}

const prev = () => {
  if (!props.images?.length) return
  emit('update:index', (props.index - 1 + props.images.length) % props.images.length)
}

const { onTouchStart, onTouchEnd } = useSwipe({
  enabled: () => props.open && hasMany.value,
  onSwipeLeft: next,
  onSwipeRight: prev
})

const onKeydown = (e) => {
  if (!props.open) return
  if (e.key === 'Escape') emit('close')
  if (!hasMany.value) return
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

watch(
  () => props.open,
  (v) => {
    if (v) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-99 bg-black/70" @click="$emit('close')">
    <div class="grid h-full w-full place-items-center p-6">
      <div
        class="relative inline-block"
        @click.stop
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <img
          :src="src"
          alt=""
          class="max-h-[70vh] min-h-70 max-w-[70vw] min-w-70 rounded-2xl object-cover sm:min-h-100 sm:min-w-100 md:rounded-2xl"
          draggable="false"
        />

        <!-- 左右切換 -->
        <button
          v-if="hasMany"
          type="button"
          class="absolute top-1/2 left-2 hidden -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white shadow hover:bg-white/20 sm:-left-13 sm:grid sm:h-10 sm:w-10"
          aria-label="Previous"
          @click.stop="prev"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <button
          v-if="hasMany"
          type="button"
          class="absolute top-1/2 right-2 hidden h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white shadow hover:bg-white/20 sm:-right-13 sm:grid sm:h-10 sm:w-10"
          aria-label="Next"
          @click.stop="next"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <!-- 關閉 -->
        <button
          type="button"
          class="absolute top-2 right-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-white/40 shadow hover:bg-white/70"
          aria-label="Close"
          @click.stop="$emit('close')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- 指示 -->
        <div
          v-if="hasMany"
          class="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white"
        >
          {{ index + 1 }} / {{ images.length }}
        </div>
      </div>
    </div>
  </div>
</template>
