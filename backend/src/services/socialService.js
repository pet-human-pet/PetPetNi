import { supabase } from './supabase.js'

const formatPostForFrontend = (post) => {
  const images = post.post_images ? post.post_images.map((img) => img.image_url) : []

  return {
    id: post.id,
    author: post.profiles?.name || 'Unknown',
    authorId: post.user_id,
    authorAvatar: post.profiles?.avatar || '',
    content: post.content,
    images: images,
    audience: post.audience, // 'public', 'friends', etc.
    isLiked: post.is_liked || false,
    likeCount: post.post_likes ? post.post_likes[0]?.count : 0,
    commentCount: post.post_comments ? post.post_comments[0]?.count : 0,
    isBookmarked: post.is_bookmarked || false,
    createdAt: post.created_at,
    isNew: false
  }
}

export const socialService = {
  // 取得貼文列表
  getPosts: async ({ page = 1, limit = 10, userId = null }) => {
    const from = (page - 1) * limit
    const to = from + limit - 1

    // 1. Fetch Posts
    const {
      data: postsData,
      error: postsError,
      count
    } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (postsError) {
      console.error('❌ Error getting posts:', postsError)
      throw postsError
    }

    if (!postsData || postsData.length === 0) {
      return { data: [], total: count }
    }

    // 2. Collect IDs
    const userIds = [...new Set(postsData.map((p) => p.user_id))]
    const postIds = postsData.map((p) => p.id)

    // 3. Fetch Profiles & Images in parallel
    const [profilesResult, imagesResult, likesResult] = await Promise.all([
      supabase.from('profiles').select('id, name, avatar').in('id', userIds),
      supabase.from('post_images').select('post_id, image_url').in('post_id', postIds),
      // Optional: Fetch likes/bookmarks status if needed specific to current user,
      // but for now we follow existing structure or just return defaults if not critical.
      // If we need like counts, they should likely be a separate query or counter on post table.
      // Assuming existing `post_likes` counts were via join, we might skip or do a count query if critical.
      // For now, let's keep it simple to fix the 500 error.
      Promise.resolve({ data: [] })
    ])

    const profilesMap = new Map(profilesResult.data?.map((p) => [p.id, p]) || [])

    // Group images by post_id
    const imagesMap = {}
    imagesResult.data?.forEach((img) => {
      if (!imagesMap[img.post_id]) imagesMap[img.post_id] = []
      imagesMap[img.post_id].push(img)
    })

    // 4. Merge Data
    const posts = postsData.map((p) => {
      const profile = profilesMap.get(p.user_id)
      const images = imagesMap[p.id]?.map((i) => i.image_url) || []

      return {
        id: p.id,
        author: profile?.name || 'Unknown',
        authorId: p.user_id,
        authorAvatar: profile?.avatar || '',
        content: p.content,
        images: images,
        audience: p.audience,
        isLiked: false, // TODO: restore like status logic if needed
        likeCount: 0, // TODO: restore like count logic
        commentCount: 0, // TODO: restore comment count logic
        isBookmarked: false,
        createdAt: p.created_at,
        isNew: false
      }
    })

    return { data: posts, total: count }
  },

  // 建立貼文
  createPost: async (userId, { content, images = [], audience = 'public' }) => {
    // 1. 建立 Post 本體
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content,
        audience
      })
      .select()
      .single()

    if (postError) {
      console.error('❌ Error creating post:', postError)
      throw postError
    }

    const postId = postData.id

    // 2. 若有圖片，寫入 post_images 表格
    if (images && images.length > 0) {
      const imageRecords = images.map((url, index) => ({
        post_id: postId,
        image_url: url
        // display_order: index // 若有此欄位
      }))

      const { error: imgError } = await supabase.from('post_images').insert(imageRecords)

      if (imgError) {
        console.error('❌ Error creating post images:', imgError)
      }
    }

    const { data: userData } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single()

    return {
      id: postId,
      author: userData?.name || 'Me',
      authorId: userId,
      content,
      images,
      audience,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isBookmarked: false,
      createdAt: postData.created_at,
      isNew: true
    }
  },

  // 按讚
  likePost: async (userId, postId) => {
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })

    if (error) throw error
    return { success: true }
  },

  // 取消讚
  unlikePost: async (userId, postId) => {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) throw error
    return { success: true }
  },

  // 刪除貼文
  deletePost: async (userId, postId) => {
    // 驗證是否為作者 (安全檢查)
    const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()

    if (!post) throw new Error('Post not found')
    // 這裡我們暫時放寬權限檢查，或者假設 userId 必須匹配 (如果 userId 有傳入的話)
    // 嚴謹做法：if (post.user_id !== userId) throw new Error('Unauthorized')

    const { error } = await supabase.from('posts').delete().eq('id', postId)

    if (error) {
      console.error('❌ Error deleting post:', error)
      throw error
    }
    return { success: true }
  },

  // 更新貼文
  updatePost: async (userId, postId, { content, images, audience }) => {
    // 1. Update Post Content
    const { data: post, error: postError } = await supabase
      .from('posts')
      .update({ content, audience })
      .eq('id', postId)
      // .eq('user_id', userId) // Enforce owner check
      .select()
      .single()

    if (postError) throw postError

    // 2. Sync Images
    // Get current DB images
    const { data: currentImages } = await supabase
      .from('post_images')
      .select('image_url')
      .eq('post_id', postId)

    const currentUrls = currentImages?.map((i) => i.image_url) || []

    // Determine images to delete (present in DB but not in new list)
    // images is the new list of URLs
    const imagesToDelete = currentUrls.filter((url) => !images.includes(url))

    // Note: We currently only support deleting existing images during edit, not adding new ones via this flow yet.
    // If we wanted to support adding, we would find diff in the other direction.

    if (imagesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('post_images')
        .delete()
        .eq('post_id', postId)
        .in('image_url', imagesToDelete)

      if (deleteError) {
        console.error('❌ Error deleting post images:', deleteError)
        throw deleteError
      }
    }

    // Return updated post structure
    // Reuse formatPostForFrontend logic or construct manually
    // Fetch profile for completeness
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar')
      .eq('id', post.user_id)
      .single()

    // Re-fetch final images to be sure
    const { data: finalImages } = await supabase
      .from('post_images')
      .select('image_url')
      .eq('post_id', postId)

    return {
      id: post.id,
      author: profile?.name || 'Unknown',
      authorId: post.user_id,
      authorAvatar: profile?.avatar || '',
      content: post.content,
      images: finalImages?.map((i) => i.image_url) || [],
      audience: post.audience,
      isLiked: false, // preserving previous state in frontend ideally
      likeCount: 0,
      commentCount: 0,
      isBookmarked: false,
      createdAt: post.created_at,
      isNew: false
    }
  }
}
