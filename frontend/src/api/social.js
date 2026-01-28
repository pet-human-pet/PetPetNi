import api from './index'
import { useAuthStore } from '@/stores/auth'

const getHeaders = () => {
  const authStore = useAuthStore()
  const userId = authStore.user?.id
  const token = authStore.token
  const headers = {}

  if (userId) {
    headers['x-user-id'] = userId
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export const socialApi = {
  getPosts(params) {
    return api.get('/api/social/posts', {
      params,
      headers: getHeaders()
    })
  },
  createPost(data) {
    return api.post('/api/social/posts', data, {
      headers: getHeaders()
    })
  },
  likePost(postId) {
    return api.post(
      `/api/social/posts/${postId}/like`,
      {},
      {
        headers: getHeaders()
      }
    )
  },
  unlikePost(postId) {
    return api.delete(`/api/social/posts/${postId}/like`, {
      headers: getHeaders()
    })
  },
  updatePost(id, data) {
    return api.put(`/api/social/posts/${id}`, data, {
      headers: getHeaders()
    })
  },
  bookmarkPost(id) {
    return api.post(
      `/api/social/posts/${id}/bookmark`,
      {},
      {
        headers: getHeaders()
      }
    )
  },
  unbookmarkPost(id) {
    return api.delete(`/api/social/posts/${id}/bookmark`, {
      headers: getHeaders()
    })
  },
  getBookmarkedPosts() {
    return api.get('/api/social/posts/bookmarks', {
      headers: getHeaders()
    })
  },
  deletePost(id) {
    return api.delete(`/api/social/posts/${id}`, {
      headers: getHeaders()
    })
  },
  getComments(postId) {
    return api.get(`/api/social/posts/${postId}/comments`, {
      headers: getHeaders()
    })
  },
  createComment(postId, data) {
    return api.post(`/api/social/posts/${postId}/comments`, data, {
      headers: getHeaders()
    })
  },
  deleteComment(commentId) {
    return api.delete(`/api/social/comments/${commentId}`, {
      headers: getHeaders()
    })
  }
}
