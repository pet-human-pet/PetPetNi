import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const nextId = ref(Date.now())
  const channel = ref(null)

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  const getNextId = () => {
    nextId.value += 1
    return nextId.value
  }

  const getPostSnippet = (post) => {
    if (!post?.content) return ''
    const normalized = String(post.content).trim().replace(/\s+/g, ' ')
    if (!normalized) return ''
    return normalized.length > 24 ? `${normalized.slice(0, 24)}...` : normalized
  }

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '剛剛'
    const date = new Date(dateString)
    const diffMs = Date.now() - date.getTime()
    if (Number.isNaN(diffMs)) return '剛剛'

    const minutes = Math.floor(diffMs / 60000)
    if (minutes < 1) return '剛剛'
    if (minutes < 60) return `${minutes} 分鐘前`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} 小時前`

    const days = Math.floor(hours / 24)
    return `${days} 天前`
  }

  const normalizeNotification = (notification) => {
    const type = notification.type || 'system'
    const title =
      notification.title ||
      (type === 'comment' ? '留言通知' : type === 'like' ? '按讚通知' : '系統通知')
    const read = notification.read ?? notification.is_read ?? false
    const time =
      notification.time || formatRelativeTime(notification.created_at || notification.createdAt)

    return {
      id: notification.id ?? getNextId(),
      type,
      title,
      desc: notification.desc ?? notification.content ?? '',
      read,
      time,
      postId: notification.postId ?? notification.target_post_id ?? notification.targetId ?? null
    }
  }

  const buildInteractionText = ({ type, count = 1, post }) => {
    const snippet = getPostSnippet(post)
    const postfix = snippet ? `：「${snippet}」` : ''

    if (type === 'like') {
      const prefix = count > 1 ? `有 ${count} 人讚了你的貼文` : '有人讚了你的貼文'
      return `${prefix}${postfix}`
    }

    if (type === 'comment') {
      const prefix = count > 1 ? `有 ${count} 則新留言` : '有人留言你的貼文'
      return `${prefix}${postfix}`
    }

    return `你的貼文有新互動${postfix}`
  }

  const fetchNotifications = async ({ limit = 30 } = {}) => {
    const authStore = useAuthStore()
    const userIdInt = authStore.userIdInt
    if (!userIdInt) return []

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id_int', userIdInt)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return []
    }

    notifications.value = (data || []).map((item) => normalizeNotification(item))
    return notifications.value
  }

  async function markRead(id) {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
    if (id) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
      if (error) {
      }
    }
  }

  async function markAllRead() {
    notifications.value.forEach((n) => {
      n.read = true
    })
    const authStore = useAuthStore()
    const userIdInt = authStore.userIdInt
    if (userIdInt) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id_int', userIdInt)
        .eq('is_read', false)
      if (error) {
      }
    }
  }

  function removeNotification(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  function addNotification(notification) {
    const normalized = normalizeNotification(notification)
    notifications.value.unshift(normalized)
  }

  function addPostInteractionNotification({ type, count = 1, post } = {}) {
    if (!type || count <= 0) return

    const title = type === 'comment' ? '留言通知' : '按讚通知'
    const desc = buildInteractionText({ type, count, post })

    addNotification({
      type,
      title,
      desc,
      postId: post?.id
    })
  }

  const startRealtime = (userIdInt) => {
    if (!userIdInt) return

    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value = null
    }

    channel.value = supabase
      .channel(`notifications:user:${userIdInt}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id_int=eq.${userIdInt}`
        },
        (payload) => {
          if (payload?.new) {
            addNotification(payload.new)
          }
        }
      )
      .subscribe()
  }

  const stopRealtime = () => {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value = null
    }
  }

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markRead,
    markAllRead,
    removeNotification,
    addNotification,
    addPostInteractionNotification,
    startRealtime,
    stopRealtime
  }
})
