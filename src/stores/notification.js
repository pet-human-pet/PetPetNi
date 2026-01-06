import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([
    { id: 1, title: '系統通知', desc: '歡迎加入 PetPetNi', time: '剛剛', read: false },
    { id: 2, title: '系統通知', desc: '你有 1 則新訊息', time: '5 分鐘前', read: false },
    { id: 3, title: '系統通知', desc: '本週有新功能上線', time: '昨天', read: true }
  ])

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  function markRead(id) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllRead() {
    notifications.value.forEach((n) => {
      n.read = true
    })
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function addNotification(notification) {
    notifications.value.unshift({
      id: Date.now(),
      read: false,
      time: '剛剛', // 實際專案可能需要處理時間格式
      ...notification
    })
  }

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    removeNotification,
    addNotification
  }
})
