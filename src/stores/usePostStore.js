import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socialApi } from '@/api/social'
import { useAuthStore } from './auth'
import { useToast } from '@/composables/useToast'

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 10,
    hasMore: true
  })

  const authStore = useAuthStore()
  const { error: showError } = useToast()

  const postsWithAuth = computed(() => {
    return posts.value.map((p) => ({
      ...p,
      isMine: p.authorId === authStore.user?.id
    }))
  })
  const fetchPosts = async ({ page = 1, limit = 10, loadMore = false } = {}) => {
    if (isLoading.value) return
    if (loadMore && !pagination.value.hasMore) return

    isLoading.value = true
    try {
      const params = { page, limit }
      const res = await socialApi.getPosts(params)
      const data = Array.isArray(res.data) ? res.data : res.data?.data || []
      const hasNext = data.length >= limit

      if (loadMore) {
        posts.value.push(...data)
      } else {
        posts.value = data
      }

      pagination.value = {
        page,
        limit,
        hasMore: hasNext
      }
    } catch {
      // API error handled by interceptor
    } finally {
      isLoading.value = false
    }
  }

  const createPost = async (content, imageUrls = [], audience = 'public') => {
    if (!authStore.user?.id) {
      const msg = '請先登入'
      showError(msg)
      throw new Error(msg)
    }
    const res = await socialApi.createPost({
      content,
      imageUrls,
      audience,
      userId: authStore.user.id
    })

    const newPost = res.data || res

    if (newPost) {
      posts.value.unshift(newPost)

      // New post animation handling
      if (newPost.isNew) {
        setTimeout(() => {
          const p = posts.value.find((x) => x.id === newPost.id)
          if (p) p.isNew = false
        }, 3000)
      }
      return newPost
    }
  }

  // 更新貼文
  const updatePost = async (id, payload) => {
    const post = posts.value.find((p) => p.id === id)
    if (post) {
      Object.assign(post, payload)
    }

    try {
      await socialApi.updatePost(id, payload)
    } catch {
      // TODO: 必要時還原邏輯 (目前沒有簡單的還原機制，暫時忽略)
    }
  }

  // 按讚
  const likePost = async (id) => {
    const post = posts.value.find((p) => p.id === id)
    if (!post) return

    const isLiked = !post.isLiked
    post.isLiked = isLiked
    post.likeCount += isLiked ? 1 : -1

    try {
      if (isLiked) {
        await socialApi.likePost(id)
      } else {
        await socialApi.unlikePost(id)
      }
    } catch {
      post.isLiked = !isLiked
      post.likeCount += isLiked ? -1 : 1
    }
  }

  // 收藏
  const bookmarkPost = async (id) => {
    const post = posts.value.find((p) => p.id === id)
    if (!post) return

    const originalState = post.isBookmarked
    post.isBookmarked = !originalState

    try {
      if (post.isBookmarked) {
        await socialApi.bookmarkPost(id)
      } else {
        await socialApi.unbookmarkPost(id)
      }
    } catch {
      post.isBookmarked = originalState
    }
  }

  // 刪除貼文
  const deletePost = async (id) => {
    const post = posts.value.find((p) => p.id === id)
    if (post) {
      post.isDeleted = true
    }

    try {
      await socialApi.deletePost(id)
    } catch (error) {
      if (post) {
        post.isDeleted = false
      }
      throw error
    }
  }

  const updateCommentCount = (id, delta) => {
    const post = posts.value.find((p) => p.id === id)
    if (post) {
      post.commentCount = (post.commentCount || 0) + delta
    }
  }

  return {
    posts,
    postsWithAuth,
    isLoading,
    pagination,
    fetchPosts,
    createPost,
    updatePost,
    likePost,
    bookmarkPost,
    deletePost,
    updateCommentCount
  }
})
