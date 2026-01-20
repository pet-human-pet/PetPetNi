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

      // Backend returns the created post directly (or inside data)
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
      await socialApi.updatePost(id, payload) // 假設有此 API
    } catch (error) {
      console.warn('Update post failed (Dev Mode - keeping local change):', error)
      // 若是正式環境需 revert，但在開發測試(無後端)時，保持本地變更
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

  return {
    posts,
    postsWithAuth,
    isLoading,
    pagination,
    fetchPosts,
    createPost,
    updatePost,
    likePost,
    bookmarkPost
  }
})
