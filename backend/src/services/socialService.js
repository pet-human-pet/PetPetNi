/* eslint-disable no-console */
import { supabase } from './supabase.js'

// Helper: 取得 user_id_int (從 profiles table)
const getProfileId = async (authUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id_int')
    .eq('user_id', authUserId)
    .single()

  if (error || !data) {
    console.error(`❌ 無法取得用戶 Profile ID (Auth ID: ${authUserId}):`, error)
    throw new Error('找不到用戶資料')
  }
  return data.user_id_int
}

const getProfileNameByIdInt = async (userIdInt) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('nick_name')
      .eq('user_id_int', userIdInt)
      .single()

    if (error) {
      console.error('❌ 取得用戶名稱失敗:', error)
      return '用戶'
    }

    return data?.nick_name || '用戶'
  } catch (error) {
    console.error('❌ 取得用戶名稱發生錯誤:', error)
    return '用戶'
  }
}

const createNotification = async ({
  recipientIdInt,
  actorIdInt,
  type,
  content,
  targetPostId = null
}) => {
  if (!recipientIdInt || !actorIdInt) return
  if (recipientIdInt === actorIdInt) return

  const { error } = await supabase.from('notifications').insert({
    recipient_id_int: recipientIdInt,
    actor_id_int: actorIdInt,
    type,
    content,
    target_post_id: targetPostId,
    is_read: false
  })

  if (error) {
    console.error('❌ 建立通知失敗:', error)
  }
}

export const socialService = {
  // ==========================================
  // 取得貼文列表 API
  // ==========================================
  getPosts: async ({ page = 1, limit = 10, userId = null, authorId = null }) => {
    const from = (page - 1) * limit
    const to = from + limit - 1

    try {
      let query = supabase
        .from('posts')
        .select(
          `
          id,
          content,
          created_at,
          user_id_int,
          profiles:user_id_int (
            user_id,
            user_id_int,
            nick_name,
            avatar_url
          ),
          post_images (
            display_order,
            is_deleted,
            images (
              url
            )
          ),
          post_likes(count),
          post_comments(count)
        `,
          { count: 'exact' }
        )
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (authorId) {
        query = query.eq('user_id_int', authorId)
      }

      const { data: postsData, error: postsError, count } = await query

      if (postsError) {
        console.error('❌ 取得貼文列表失敗:', postsError)
        throw postsError
      }

      if (!postsData || postsData.length === 0) {
        return { data: [], total: count }
      }

      // 處理按讚與收藏狀態
      let userLikedPostIds = new Set()
      let userBookmarkedPostIds = new Set()

      if (userId) {
        console.log(`[SocialService] Fetching interaction status for user: ${userId}`)
        try {
          // 注意：這裡假設 userId 是 UUID (Auth ID)，需轉為 user_id_int
          const profileId = await getProfileId(userId)
          console.log(`[SocialService] Resolved profileId: ${profileId}`)

          // 查詢按讚
          const { data: likesData, error: likesError } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id_int', profileId)
            .in(
              'post_id',
              postsData.map((p) => p.id)
            )

          if (likesError) console.error('[SocialService] Error fetching likes:', likesError)

          if (likesData) {
            likesData.forEach((l) => userLikedPostIds.add(String(l.post_id)))
          }

          // 查詢收藏
          const { data: bookmarksData, error: bookmarksError } = await supabase
            .from('bookmarks')
            .select('post_id')
            .eq('user_id_int', profileId)
            .in(
              'post_id',
              postsData.map((p) => p.id)
            )

          if (bookmarksError)
            console.error('[SocialService] Error fetching bookmarks:', bookmarksError)

          if (bookmarksData) {
            bookmarksData.forEach((b) => userBookmarkedPostIds.add(String(b.post_id)))
          }
        } catch (e) {
          console.warn('⚠️ 無法確認互動狀態:', e.message)
        }
      }

      const posts = postsData.map((p) => {
        const images =
          p.post_images
            ?.filter((pi) => !pi.is_deleted)
            ?.sort((a, b) => a.display_order - b.display_order)
            ?.map((pi) => pi.images?.url)
            ?.filter(Boolean) || []

        const likeCount = p.post_likes?.[0]?.count || 0
        const commentCount = p.post_comments?.[0]?.count || 0

        return {
          id: p.id,
          author: p.profiles?.nick_name || 'Unknown',
          authorId: p.profiles?.user_id || '',
          authorIdInt: p.profiles?.user_id_int || p.user_id_int || null,
          authorAvatar: p.profiles?.avatar_url || '',
          content: p.content,
          images: images,
          audience: 'public',
          isLiked: userLikedPostIds.has(String(p.id)),
          likeCount: likeCount,
          commentCount: commentCount,
          isBookmarked: userBookmarkedPostIds.has(String(p.id)),
          createdAt: p.created_at,
          isNew: false
        }
      })

      return { data: posts, total: count }
    } catch (error) {
      console.error('❌ getPosts 發生嚴重錯誤:', error)
      throw error
    }
  },

  // ==========================================
  // 建立貼文 API
  // ==========================================
  createPost: async (userId, { content, images = [], audience = 'public' }) => {
    console.log(`[SocialService] createPost called by ${userId}`)
    try {
      const userIdInt = await getProfileId(userId)

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id_int: userIdInt,
          content,
          is_deleted: false
        })
        .select()
        .single()

      if (postError) {
        console.error('❌ 建立貼文失敗:', postError)
        throw postError
      }

      const postId = postData.id

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i]
          let imageId

          const { data: existingImg } = await supabase
            .from('images')
            .select('id')
            .eq('url', imageUrl)
            .single()

          if (existingImg) {
            imageId = existingImg.id
          } else {
            const { data: newImg, error: imgInsertError } = await supabase
              .from('images')
              .insert({
                url: imageUrl,
                folder: 'social_posts'
              })
              .select('id')
              .single()

            if (imgInsertError) {
              console.error(`❌ 新增圖片失敗 (${imageUrl}):`, imgInsertError)
              continue
            }
            imageId = newImg.id
          }

          const { error: linkError } = await supabase.from('post_images').insert({
            post_id: postId,
            image_id: imageId,
            display_order: i
          })

          if (linkError) {
            console.error(`❌ 關聯圖片失敗 (Post: ${postId}, Img: ${imageId}):`, linkError)
          }
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('nick_name, avatar_url')
        .eq('user_id_int', userIdInt)
        .single()

      return {
        id: postId,
        author: profile?.nick_name || 'Me',
        authorId: userId,
        authorAvatar: profile?.avatar_url || '',
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
    } catch (error) {
      console.error('❌ createPost 發生錯誤:', error)
      throw error
    }
  },

  // ==========================================
  // 按讚 API
  // ==========================================
  likePost: async (userId, postId) => {
    try {
      const userIdInt = await getProfileId(userId)

      const { error } = await supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id_int: userIdInt })

      if (error && !error.message.includes('duplicate key')) {
        throw error
      }

      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id_int')
        .eq('id', postId)
        .single()

      if (!postError && post?.user_id_int && post.user_id_int !== userIdInt) {
        const actorName = await getProfileNameByIdInt(userIdInt)
        await createNotification({
          recipientIdInt: post.user_id_int,
          actorIdInt: userIdInt,
          type: 'like',
          content: `${actorName} 讚了你的貼文`,
          targetPostId: postId
        })
      }

      return { success: true }
    } catch (error) {
      console.error('❌ 按讚失敗:', error)
      throw error
    }
  },

  // ==========================================
  // 取消讚 API
  // ==========================================
  unlikePost: async (userId, postId) => {
    try {
      const userIdInt = await getProfileId(userId)

      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id_int', userIdInt)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('❌ 取消讚失敗:', error)
      throw error
    }
  },

  // ==========================================
  // 刪除貼文 API (軟刪除)
  // ==========================================
  deletePost: async (userId, postId) => {
    try {
      const userIdInt = await getProfileId(userId)

      const { data: post, error: findError } = await supabase
        .from('posts')
        .select('user_id_int')
        .eq('id', postId)
        .single()

      if (findError || !post) {
        throw new Error('找不到貼文')
      }

      if (post.user_id_int !== userIdInt) {
        throw new Error('無權限刪除此貼文')
      }

      const { error } = await supabase.from('posts').update({ is_deleted: true }).eq('id', postId)

      if (error) {
        console.error('❌ 刪除貼文失敗:', error)
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('❌ deletePost 發生錯誤:', error)
      throw error
    }
  },

  // ==========================================
  // 收藏貼文 API
  // ==========================================
  bookmarkPost: async (userId, postId) => {
    try {
      const userIdInt = await getProfileId(userId)

      const { error } = await supabase
        .from('bookmarks')
        .insert({ post_id: postId, user_id_int: userIdInt })

      if (error && !error.message.includes('duplicate key')) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('❌ 收藏失敗:', error)
      throw error
    }
  },

  // ==========================================
  // 取消收藏 API
  // ==========================================
  unbookmarkPost: async (userId, postId) => {
    try {
      const userIdInt = await getProfileId(userId)

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id_int', userIdInt)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('❌ 取消收藏失敗:', error)
      throw error
    }
  },

  // ==========================================
  // 取得已收藏的貼文列表 API
  // ==========================================
  getBookmarkedPosts: async (userId) => {
    try {
      const userIdInt = await getProfileId(userId)

      // 1. 先取得用戶所有收藏的 post_id
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id_int', userIdInt)
        .order('created_at', { ascending: false })

      if (bookmarksError) {
        console.error('❌ 取得收藏列表失敗:', bookmarksError)
        throw bookmarksError
      }

      if (!bookmarks || bookmarks.length === 0) {
        return { data: [] }
      }

      const bookmarkedPostIds = bookmarks.map((b) => b.post_id)

      // 2. 取得這些貼文的詳細資料
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(
          `
          id,
          content,
          created_at,
          user_id_int,
          profiles:user_id_int (
            user_id,
            user_id_int,
            nick_name,
            avatar_url
          ),
          post_images (
            display_order,
            is_deleted,
            images (
              url
            )
          ),
          post_likes(count),
          post_comments(count)
        `
        )
        .in('id', bookmarkedPostIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('❌ 取得收藏貼文詳情失敗:', postsError)
        throw postsError
      }

      if (!postsData || postsData.length === 0) {
        return { data: [] }
      }

      // 3. 查詢用戶按讚狀態
      let userLikedPostIds = new Set()

      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id_int', userIdInt)
        .in('post_id', bookmarkedPostIds)

      if (likesError) console.error('[SocialService] Error fetching likes:', likesError)
      if (likesData) {
        likesData.forEach((l) => userLikedPostIds.add(l.post_id))
      }

      // 4. 格式化貼文資料
      const posts = postsData.map((p) => {
        const images =
          p.post_images
            ?.filter((pi) => !pi.is_deleted)
            ?.sort((a, b) => a.display_order - b.display_order)
            ?.map((pi) => pi.images?.url)
            ?.filter(Boolean) || []

        const likeCount = p.post_likes?.[0]?.count || 0
        const commentCount = p.post_comments?.[0]?.count || 0

        return {
          id: p.id,
          author: p.profiles?.nick_name || 'Unknown',
          authorId: p.profiles?.user_id || '',
          authorIdInt: p.profiles?.user_id_int || p.user_id_int || null,
          authorAvatar: p.profiles?.avatar_url || '',
          content: p.content,
          images: images,
          audience: 'public',
          isLiked: userLikedPostIds.has(p.id),
          likeCount: likeCount,
          commentCount: commentCount,
          isBookmarked: true, // 收藏列表中的貼文都是已收藏的
          createdAt: p.created_at,
          isNew: false
        }
      })

      return { data: posts }
    } catch (error) {
      console.error('❌ getBookmarkedPosts 發生錯誤:', error)
      throw error
    }
  },

  // ==========================================
  // 更新貼文 API
  // ==========================================
  updatePost: async (userId, postId, { content, images, audience }) => {
    try {
      const userIdInt = await getProfileId(userId)

      // 1. 檢查權限
      const { data: post, error: findError } = await supabase
        .from('posts')
        .select('user_id_int')
        .eq('id', postId)
        .single()

      if (findError || !post) {
        throw new Error('找不到貼文')
      }

      if (post.user_id_int !== userIdInt) {
        throw new Error('無權限修改此貼文')
      }

      // 2. 更新內容
      // TODO: 若資料庫支援 audience，也要 update audience
      const { error: updateError } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', postId)

      if (updateError) throw updateError

      // 3. 處理圖片更新
      if (images) {
        // 先取得目前關聯的圖片
        const { data: currentLinks } = await supabase
          .from('post_images')
          .select(
            `
            id,
            image_id,
            display_order,
            is_deleted,
            images(id, url)
          `
          )
          .eq('post_id', postId)

        // 建立目前的 URL Map: URL -> post_image record
        const currentUrlMap = new Map()
        if (currentLinks) {
          currentLinks.forEach((link) => {
            if (link.images?.url) {
              currentUrlMap.set(link.images.url, link)
            }
          })
        }

        // 遍歷新的圖片列表
        for (let i = 0; i < images.length; i++) {
          const url = images[i]

          if (currentUrlMap.has(url)) {
            // 舊圖片：更新順序並確保未刪除
            const link = currentUrlMap.get(url)
            await supabase
              .from('post_images')
              .update({ display_order: i, is_deleted: false })
              .eq('id', link.id)

            // 從 Map 移除，表示已處理
            currentUrlMap.delete(url)
          } else {
            // 新圖片：找 ID 或新增，然後建立關聯
            let imageId

            const { data: existingImg } = await supabase
              .from('images')
              .select('id')
              .eq('url', url)
              .single()

            if (existingImg) {
              imageId = existingImg.id
            } else {
              const { data: newImg, error: imgInsertError } = await supabase
                .from('images')
                .insert({ url: url, folder: 'social_posts' })
                .select('id')
                .single()

              if (imgInsertError) {
                console.error(`❌ 新增圖片失敗 (${url}):`, imgInsertError)
                continue
              }
              imageId = newImg.id
            }

            const { error: linkError } = await supabase.from('post_images').insert({
              post_id: postId,
              image_id: imageId,
              display_order: i,
              is_deleted: false
            })

            if (linkError) {
              console.error(`❌ 關聯圖片失敗 (${url}):`, linkError)
            }
          }
        }

        // 剩下的 Map 項目表示這次更新被移除的圖片 -> 設為 deleted
        for (const link of currentUrlMap.values()) {
          if (!link.is_deleted) {
            await supabase.from('post_images').update({ is_deleted: true }).eq('id', link.id)
          }
        }
      }

      return {
        id: postId,
        content,
        images,
        audience,
        success: true
      }
    } catch (error) {
      console.error('❌ 更新貼文失敗:', error)
      throw error
    }
  },

  // ==========================================
  // 取得留言列表 API
  // ==========================================
  getComments: async (postId) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(
          `
          id,
          content,
          created_at,
          user_id_int,
          profiles:user_id_int (
            user_id,
            nick_name,
            avatar_url
          )
        `
        )
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      const comments = data.map((c) => ({
        id: c.id,
        content: c.content,
        author: c.profiles?.nick_name || 'Unknown',
        authorId: c.profiles?.user_id,
        authorAvatar: c.profiles?.avatar_url,
        createdAt: c.created_at
      }))

      return comments
    } catch (error) {
      console.error('❌ 取得留言失敗:', error)
      throw error
    }
  },

  // ==========================================
  // 新增留言 API
  // ==========================================
  createComment: async (userId, postId, content) => {
    try {
      const userIdInt = await getProfileId(userId)

      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id_int: userIdInt,
          content,
          is_deleted: false
        })
        .select(
          `
          id,
          content,
          created_at,
          profiles:user_id_int (
            user_id,
            nick_name,
            avatar_url
          )
        `
        )
        .single()

      if (error) throw error

      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('user_id_int')
        .eq('id', postId)
        .single()

      if (!postError && post?.user_id_int && post.user_id_int !== userIdInt) {
        const actorName = data?.profiles?.nick_name || (await getProfileNameByIdInt(userIdInt))
        await createNotification({
          recipientIdInt: post.user_id_int,
          actorIdInt: userIdInt,
          type: 'comment',
          content: `${actorName} 留言了你的貼文`,
          targetPostId: postId
        })
      }

      return {
        id: data.id,
        content: data.content,
        author: data.profiles?.nick_name || 'Unknown',
        authorId: userId,
        authorAvatar: data.profiles?.avatar_url,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('❌ 新增留言失敗:', error)
      throw error
    }
  },

  // ==========================================
  // 刪除留言 API (硬刪除)
  // ==========================================
  deleteComment: async (userId, commentId) => {
    try {
      const userIdInt = await getProfileId(userId)

      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id_int', userIdInt) // 確保權限：只能刪自己的

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('❌ 刪除留言失敗:', error)
      throw error
    }
  }
}
