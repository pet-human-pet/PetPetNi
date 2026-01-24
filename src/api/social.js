import api from './index'
import { useAuthStore } from '@/stores/auth'

const getHeaders = () => {
  const authStore = useAuthStore()
  const userId = authStore.user?.id
  if (userId) {
    return { 'x-user-id': userId }
  }
  return {}
}

export const socialApi = {
  // 取得貼文列表
  getPosts(params) {
    return api.get('api/social/posts', {
      params,
      headers: getHeaders()
    })
  },

  // 發布貼文
  createPost(data) {
    return api.post('api/social/posts', data, {
      headers: getHeaders()
    })
  },

  // 按讚
  likePost(postId) {
    return api.post(
      `api/social/posts/${postId}/like`,
      {},
      {
        headers: getHeaders()
      }
    )
  },

  // 取消讚
  unlikePost(postId) {
    return api.delete(`api/social/posts/${postId}/like`, {
      headers: getHeaders()
    })
  },

  // 更新貼文
  updatePost(id, data) {
    return api.put(`api/social/posts/${id}`, data, {
      headers: getHeaders()
    })
  },

  // 收藏 (預留)
  bookmarkPost(id) {
    return api.post(
      `api/social/posts/${id}/bookmark`,
      {},
      {
        headers: getHeaders()
      }
    )
  },

  unbookmarkPost(id) {
    return api.delete(`api/social/posts/${id}/bookmark`, {
      headers: getHeaders()
    })
  },

  // 刪除貼文
  deletePost(id) {
    return api.delete(`api/social/posts/${id}`, {
      headers: getHeaders()
    })
  },

  // 取得留言
  getComments(postId) {
    return api.get(`api/social/posts/${postId}/comments`, {
      headers: getHeaders()
    })
  },

  // 新增留言
  createComment(postId, data) {
    return api.post(`api/social/posts/${postId}/comments`, data, {
      headers: getHeaders()
    })
  },

  // 刪除留言
  deleteComment(commentId) {
    return api.delete(`api/social/comments/${commentId}`, {
      headers: getHeaders()
    })
  }
}
