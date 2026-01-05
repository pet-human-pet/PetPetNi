import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useEventCommentStore = defineStore('comment', () => {
  const commentsByEvent = reactive({
    1: [
      { id: 1, text: '昨天去 101 草地超讚，狗狗玩到不想走！', createdAt: '2025-12-26 18:20' },
      { id: 2, text: '建議帶水跟拾便袋～人也很多', createdAt: '2025-12-26 19:05' },
      { id: 3, text: '想問下次活動還會約嗎？', createdAt: '2025-12-26 20:10' }
    ],
    2: [{ id: 4, text: '飛盤賽太可愛了，超多狗狗！', createdAt: '2025-12-25 16:40' }],
    3: [{ id: 3, text: '好喜歡攝影競賽，大家都好厲害！', createdAt: '2025-11-23 17:40' }]
  })

  function getComments(eventId) {
    return commentsByEvent[String(eventId)] || []
  }

  function addComment(eventId, text) {
    const key = String(eventId)
    if (!commentsByEvent[key]) commentsByEvent[key] = []

    commentsByEvent[key].unshift({
      id: Date.now(),
      text,
      createdAt: new Date().toLocaleString()
    })
  }

  return {
    commentsByEvent,
    getComments,
    addComment
  }
})
