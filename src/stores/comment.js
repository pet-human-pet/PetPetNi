import { defineStore } from 'pinia'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    // 以 postId 為 key 的物件
    commentsByPost: {
      1: [
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
        }
      ],
      2: [
        {
          id: 3,
          user: 'cat_king',
          content: '雖然我是貓派，但這隻可以。',
          time: '2025-12-31T13:20:00',
          isHighlight: false
        }
      ]
    }
  }),

  getters: {
    // 取得特定貼文的留言
    getComments: (state) => (postId) => {
      return state.commentsByPost[postId] || []
    }
  },

  actions: {
    addComment(postId, content) {
      // 確保該貼文有留言陣列
      if (!this.commentsByPost[postId]) {
        this.commentsByPost[postId] = []
      }

      const newComment = {
        id: Date.now(),
        user: 'me',
        content,
        time: new Date().toISOString(),
        isHighlight: true
      }

      this.commentsByPost[postId].unshift(newComment)

      setTimeout(() => {
        const target = this.commentsByPost[postId].find((c) => c.id === newComment.id)
        if (target) {
          target.isHighlight = false
        }
      }, 2000)
    },

    updateComment(postId, commentId, newContent) {
      if (!this.commentsByPost[postId]) return

      const comment = this.commentsByPost[postId].find((c) => c.id === commentId)
      if (comment) {
        comment.content = newContent
        comment.isEdited = true
      }
    },

    deleteComment(postId, commentId) {
      if (!this.commentsByPost[postId]) return
      this.commentsByPost[postId] = this.commentsByPost[postId].filter((c) => c.id !== commentId)
    }
  }
})
