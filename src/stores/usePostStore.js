import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socialApi } from '@/api/social'
import { useAuthStore } from './auth'

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const pagination = ref({
    page: 1,
    limit: 10,
    hasMore: true
  })

  const authStore = useAuthStore()
  const postsWithAuth = computed(() => {
    return posts.value.map((p) => ({
      ...p,
      isMine: p.authorId === authStore.user?.id || p.author === authStore.user?.name
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
    } catch (error) {
      console.error('Fetch posts failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createPost = async (content, imageUrls = [], audience = 'public') => {
    try {
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
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
    } catch (error) {
      console.error('API createPost failed:', error)
      throw error // Let component handle error toast
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
    } catch (error) {
      console.error('Update post failed:', error)
      // TODO: 必要時還原邏輯
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
        await socialApi.likePost(id) // 假設 API
      } else {
        await socialApi.unlikePost(id) // 假設 API
      }
    } catch (error) {
      console.warn('Like post failed (Dev Mode - keeping local change):', error)
      // 正式環境應 revert:
      // post.isLiked = !isLiked
      // post.likeCount += isLiked ? -1 : 1
    }
  }

  // 收藏
  const bookmarkPost = async (id) => {
    const post = posts.value.find((p) => p.id === id)
    if (!post) return

    post.isBookmarked = !post.isBookmarked
    try {
      // await socialApi.bookmarkPost(id)
    } catch (error) {
      console.warn('Bookmark post failed (Dev Mode - keeping local change):', error)
    }
  }

  // 刪除貼文
  const deletePost = async (id) => {
    // Optimistic update - 標記為已刪除而不是從陣列移除
    const post = posts.value.find((p) => p.id === id)
    if (post) {
      post.isDeleted = true
    }

    try {
      await socialApi.deletePost(id)
    } catch (error) {
      console.error('Delete post failed:', error)
      // Revert if failed
      if (post) {
        post.isDeleted = false
      }
      throw error
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
    deletePost
  }
})
