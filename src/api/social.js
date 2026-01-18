import api from './index'

export const socialApi = {
  // 取得貼文列表
  getPosts(params) {
    return api.get('/social/posts', { params })
  },

  // 發布貼文
  createPost(data) {
    return api.post('/social/posts', data)
  },

  // 按讚
  likePost(postId) {
    return api.post(`/social/posts/${postId}/like`)
  },

  // 取消讚
  unlikePost(postId) {
    return api.delete(`/social/posts/${postId}/like`)
  },

  // 更新貼文
  updatePost(id, data) {
    return api.put(`/social/posts/${id}`, data)
  },

  // 收藏 (預留)
  bookmarkPost(id) {
    return api.post(`/social/posts/${id}/bookmark`)
  },

  unbookmarkPost(id) {
    return api.delete(`/social/posts/${id}/bookmark`)
  }
}
