import { ref } from 'vue'

export const useSwipe = ({ onSwipeLeft, onSwipeRight, enabled }) => {
  const startX = ref(0)
  const startY = ref(0)

  const isEnabled = () => (typeof enabled === 'function' ? !!enabled() : enabled !== false)

  const onTouchStart = (e) => {
    if (!isEnabled()) return
    const t = e.touches?.[0]
    if (!t) return
    startX.value = t.clientX
    startY.value = t.clientY
  }

  const onTouchEnd = (e) => {
    if (!isEnabled()) return
    const t = e.changedTouches?.[0]
    if (!t) return

    const dx = t.clientX - startX.value
    const dy = t.clientY - startY.value

    if (Math.abs(dx) < 40) return
    if (Math.abs(dy) > Math.abs(dx) * 0.6) return

    if (dx < 0) onSwipeLeft?.()
    else onSwipeRight?.()
  }

  return { onTouchStart, onTouchEnd }
}
