import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

// Toast通知系統 3秒自動消失
export const useToast = () => {
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = ++toastId

    toasts.value.push({
      id,
      message,
      type, // 'success' | 'error' | 'info'
      duration
    })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)

    return id
  }

  const success = (message, duration = 3000) => showToast(message, 'success', duration)
  const error = (message, duration = 3000) => showToast(message, 'error', duration)
  const info = (message, duration = 3000) => showToast(message, 'info', duration)

  return { toasts, showToast, success, error, info }
}
