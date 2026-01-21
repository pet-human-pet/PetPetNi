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

    let query = supabase
      .from('posts')
      .select(
        `
        *,
        profiles:profiles!posts_user_id_fkey ( name ),
        post_images ( image_url )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to)

    // TODO: 之後需加入 audience 過濾邏輯 (例如只看 friends)
    const { data, error, count } = await query

    if (error) {
      console.error('❌ Error getting posts:', error)
      throw error
    }

    const posts = data.map(formatPostForFrontend)

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
  }
}
