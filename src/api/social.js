import api from './index'

export const socialApi = {
  // 取得貼文列表
  getPosts(params) {
    return api.get('api/social/posts', { params })
  },

  // 發布貼文
  createPost(data) {
    return api.post('api/social/posts', data)
  },

  // 按讚
  likePost(postId) {
    return api.post(`api/social/posts/${postId}/like`)
  },

  // 取消讚
  unlikePost(postId) {
    return api.delete(`api/social/posts/${postId}/like`)
  },

  // 更新貼文
  updatePost(id, data) {
    return api.put(`api/social/posts/${id}`, data)
  },

  // 收藏 (預留)
  bookmarkPost(id) {
    return api.post(`api/social/posts/${id}/bookmark`)
  },

  unbookmarkPost(id) {
    return api.delete(`api/social/posts/${id}/bookmark`)
  },

  // 刪除貼文
  deletePost(id) {
    return api.delete(`api/social/posts/${id}`)
  }
}
