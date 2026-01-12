import { ref, watch, onUnmounted } from 'vue'

export function useChatTimer(store) {
  const timeLeft = ref('')
  let timer = null

  const updateTime = () => {
    if (store.activeChat?.type === 'event' && store.activeChat.expiryDate) {
      const diff = new Date(store.activeChat.expiryDate) - new Date()
      if (diff > 0) {
        const hrs = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        timeLeft.value = `剩餘 ${hrs} 小時 ${mins} 分鐘`
      } else {
        timeLeft.value = '活動已結束'
      }
    } else {
      timeLeft.value = ''
    }
  }

  watch(
    () => store.activeChatId,
    () => {
      updateTime()
      if (timer) clearInterval(timer)
      
      if (store.activeChat?.type === 'event') {
        timer = setInterval(updateTime, 60000)
      }
    }
  )

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    timeLeft,
    updateTime
  }
}
