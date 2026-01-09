import { defineStore } from 'pinia'
import { ref } from 'vue'
import { socialApi } from '@/api/social'

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const isLoading = ref(false)

  // 取得貼文列表
  const fetchPosts = async (params = {}) => {
    isLoading.value = true
    try {
      const res = await socialApi.getPosts(params)
      // 假設後端回傳格式並簡單做兼容處理，避免沒後端爆掉
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      posts.value = data
    } finally {
      isLoading.value = false
    }
  }

  // 發布新貼文
  const createPost = async (content, imageUrls = []) => {
    const res = await socialApi.createPost({ content, imageUrls })
    // Optimistic Update：假設後端回傳了新貼文，直接加到列表最上方
    if (res.data) {
      posts.value.unshift(res.data)
    }
    return res.data
  }

  return {
    posts,
    isLoading,
    fetchPosts,
    createPost
  }
})
