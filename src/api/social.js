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
  }
}
