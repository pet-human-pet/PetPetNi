import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

// 處理右鍵選單與訊息選單的狀態與行為
export function useChatMenus(options = {}) {
  const { store, success, showConfirm, showReport = null } = options

  const contextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    chatId: null,
    chatType: null,
    pinned: false
  })

  const openContextMenu = (e, chat) => {
    e.preventDefault()
    if (store.currentCategory === 'friendList') return
    const chatType = store.currentCategory === 'community' ? 'community' : chat.type

    const rect = e.currentTarget.getBoundingClientRect()
    contextMenu.value = {
      visible: true,
      x: rect.left + 180,
      y: rect.top + 10,
      chatId: chat.id,
      chatType,
      pinned: chat.pinned
    }
  }

  const closeContextMenu = () => {
    contextMenu.value.visible = false
  }

  const handleMenuAction = async (action) => {
    const { chatId, chatType } = contextMenu.value

    if (action === 'pin') {
      store.togglePin(chatId)
    }

    if (action === 'leave') {
      const isConfirmed = await showConfirm({
        title: '退出社群',
        message: '確定要退出此社群嗎？退出後將不再收到該社群的訊息。',
        type: 'danger',
        confirmText: '退出'
      })

      if (isConfirmed) {
        store.deleteChat(chatId)
        success('已退出社群')
      }
    }

    if (action === 'delete') {
      const isEvent = chatType === 'event'
      const isConfirmed = await showConfirm({
        title: isEvent ? '刪除活動對話' : '刪除對話',
        message: isEvent ? '確定要刪除此活動對話嗎？' : '確定要刪除此對話紀錄嗎？',
        type: 'danger',
        confirmText: '刪除'
      })

      if (isConfirmed) {
        store.deleteChat(chatId)
      }
    }
    closeContextMenu()
  }

  const handleDirectDelete = async (chat) => {
    const isConfirmed = await showConfirm({
      title: '刪除對話',
      message: '確定要刪除此對話紀錄嗎？',
      type: 'danger',
      confirmText: '刪除'
    })

    if (isConfirmed) {
      store.deleteChat(chat.id)
    }
  }

  // 訊息互動選單邏輯
  const activeMsgId = ref(null)

  const openMsgMenu = (id) => {
    activeMsgId.value = activeMsgId.value === id ? null : id
  }

  const closeMsgMenu = () => {
    activeMsgId.value = null
  }

  const handleMsgAction = async (action, msg) => {
    closeMsgMenu()

    if (action === 'reply') {
      store.replyingMsg = { id: msg.id, content: msg.content }
    }

    if (action === 'delete') {
      const isConfirmed = await showConfirm({
        title: '刪除訊息',
        message: '確定要收回這則訊息嗎？',
        type: 'danger',
        confirmText: '收回'
      })
      if (isConfirmed) {
        success('訊息已收回')
      }
    }

    if (action === 'report') {
      if (!showReport) {
        return
      }
      const { confirmed } = await showReport()
      if (confirmed) {
        success('已收到檢舉，感謝您的回報')

        const blockConfirmed = await showConfirm({
          title: '已檢舉',
          message: '要封鎖此用戶嗎？封鎖後將不再收到對方的訊息。',
          type: 'danger',
          confirmText: '封鎖'
        })

        if (blockConfirmed) {
          store.blockChat(store.activeChat.id)
          success('已封鎖此用戶')
          store.activeChatId = null
        }
      }
    }
  }

  const closeAllMenus = (e) => {
    if (e.target?.closest('.c-chat-bubble') || e.target?.closest('.c-chat-pop')) return
    closeContextMenu()
    closeMsgMenu()
  }

  useEventListener(window, 'click', closeAllMenus)

  return {
    contextMenu,
    activeMsgId,
    openContextMenu,
    closeContextMenu,
    handleMenuAction,
    handleDirectDelete,
    openMsgMenu,
    closeMsgMenu,
    handleMsgAction,
    closeAllMenus
  }
}
