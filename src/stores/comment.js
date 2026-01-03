import { defineStore } from 'pinia'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    comments: [
      {
        id: 1,
        user: 'user123',
        content: '真可愛！',
        time: '2025-12-30T10:30:00',
        isHighlight: false
      },
      {
        id: 2,
        user: 'dog_lover',
        content: '這是在哪裡拍的呀？',
        time: '2025-12-29T21:15:00',
        isHighlight: false
      },
      {
        id: 3,
        user: 'cat_king',
        content: '雖然我是貓派，但這隻可以。',
        time: '2025-12-31T13:20:00',
        isHighlight: false
      }
    ]
  }),

  actions: {
    addComment(content) {
      const newComment = {
        id: Date.now(),
        user: 'me',
        content,
        time: new Date().toISOString(),
        isHighlight: true
      }

      this.comments.unshift(newComment)

      setTimeout(() => {
        const target = this.comments.find((c) => c.id === newComment.id)
        if (target) {
          target.isHighlight = false
        }
      }, 2000)
    },
    // 編輯留言
    updateComment(id, newContent) {
      const comment = this.comments.find((c) => c.id === id)
      if (comment) {
        comment.content = newContent
        comment.isEdited = true
      }
    },
    // 刪除留言
    deleteComment(id) {
      this.comments = this.comments.filter((c) => c.id !== id)
    }
  }
})
