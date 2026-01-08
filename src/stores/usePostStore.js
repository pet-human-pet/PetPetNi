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
      // 假設後端回傳格式為 { data: [...] } 或直接 [...]
      // 這裡做一個簡單的兼容處理，避免沒後端時爆掉
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      posts.value = data
    } catch (err) {
      console.error('[fetchPosts Error]', err)
      // 可以在這裡處理錯誤，例如清空列表或顯示錯誤提示
    } finally {
      isLoading.value = false
    }
  }

  // 發布新貼文
  const createPost = async (content, imageUrls = []) => {
    try {
      const res = await socialApi.createPost({ content, imageUrls })
      // 樂觀更新 (Optimistic Update)：
      // 假設後端回傳了新建立的貼文物件，我們直接把它加到列表最上方
      // 這樣使用者不用重新整理就能看到
      if (res.data) {
        posts.value.unshift(res.data)
      }
      return res.data
    } catch (err) {
      throw err // 錯誤拋出給 PostComposer 顯示 Toast
    }
  }

  return {
    posts,
    isLoading,
    fetchPosts,
    createPost
  }
})
