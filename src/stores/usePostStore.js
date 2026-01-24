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

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback

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
    } catch (err) {
      showError(getErrorMessage(err, '貼文載入失敗，請稍後再試'))
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
    try {
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
    } catch (err) {
      showError(getErrorMessage(err, '貼文發布失敗，請稍後再試'))
      throw err
    }
  }

  // 更新貼文
  const updatePost = async (id, payload) => {
    const post = posts.value.find((p) => p.id === id)
    const previousPost = post ? { ...post } : null
    if (post) {
      Object.assign(post, payload)
    }

    try {
      await socialApi.updatePost(id, payload)
    } catch (err) {
      // TODO: 必要時還原邏輯 (目前沒有簡單的還原機制，暫時忽略)
      if (post && previousPost) {
        Object.assign(post, previousPost)
      }
      showError(getErrorMessage(err, '更新貼文失敗，請稍後再試'))
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
    } catch (err) {
      post.isLiked = !isLiked
      post.likeCount += isLiked ? -1 : 1
      showError(getErrorMessage(err, '操作失敗，請稍後再試'))
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
    } catch (err) {
      post.isBookmarked = originalState
      showError(getErrorMessage(err, '操作失敗，請稍後再試'))
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
      showError(getErrorMessage(error, '刪除貼文失敗，請稍後再試'))
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
