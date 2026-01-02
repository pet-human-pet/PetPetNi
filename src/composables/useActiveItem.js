import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export const useActiveItem = (options = {}) => {
  const { enableClickOutside = ref(true) } = options

  const activeId = ref(null)

  const itemRefs = ref(new Map())

  const activate = (id) => {
    activeId.value = id
  }

  const deactivate = () => {
    activeId.value = null
  }

  const registerRef = (id, el) => {
    if (el) {
      const domEl = el.$el || el
      itemRefs.value.set(id, domEl)
    } else {
      itemRefs.value.delete(id)
    }
  }

  if (typeof window !== 'undefined') {
    useEventListener(window, 'click', (event) => {
      if (!enableClickOutside.value || activeId.value === null) return

      const activeEl = itemRefs.value.get(activeId.value)
      if (!activeEl) return

      const isClickInside = activeEl.contains(event.target)
      if (!isClickInside) {
        deactivate()
      }
    })
  }

  return {
    activeId,
    activate,
    deactivate,
    registerRef
  }
}
