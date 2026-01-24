import { defineStore } from 'pinia'
import { socialApi } from '@/api/social'

export const useCommentStore = defineStore('comment', {
  state: () => ({
    commentsByPost: {}
  }),

  getters: {
    getComments: (state) => (postId) => {
      return state.commentsByPost[postId] || []
    }
  },

  actions: {
    async fetchComments(postId) {
      if (!postId) return
      try {
        const res = await socialApi.getComments(postId)
        // 假設 API 回傳的是 comment array
        this.commentsByPost[postId] = res.data || res
      } catch (error) {
        console.error('Fetch comments failed:', error)
      }
    },

    async addComment(postId, content) {
      if (!postId || !content) return

      try {
        console.log('[CommentStore] Adding comment for post:', postId)
        const res = await socialApi.createComment(postId, { content })
        const newComment = res.data || res

        if (!this.commentsByPost[postId]) {
          this.commentsByPost[postId] = []
        }

        // 加上 highlight 效果
        newComment.isHighlight = true
        this.commentsByPost[postId].unshift(newComment) // 新留言排最前

        setTimeout(() => {
          const target = this.commentsByPost[postId].find((c) => c.id === newComment.id)
          if (target) {
            target.isHighlight = false
          }
        }, 2000)

        return newComment
      } catch (error) {
        console.error('[CommentStore] Add comment failed:', error)
        throw error
      }
    },

    async deleteComment(postId, commentId) {
      try {
        await socialApi.deleteComment(commentId)

        // Optimistic update
        if (this.commentsByPost[postId]) {
          this.commentsByPost[postId] = this.commentsByPost[postId].filter(
            (c) => c.id !== commentId
          )
        }
      } catch (error) {
        console.error('Delete comment failed:', error)
        throw error
      }
    }
  }
})
