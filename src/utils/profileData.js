/**
 * 寵物標籤選擇 - 必選群組
 * 用於配對算法核心匹配，註冊時必須選擇
 */
export const requiredTagGroups = [
  {
    id: 'size',
    label: '體型',
    options: [
      { value: 'small', label: '小型', emoji: '🐕', description: '5kg 以下' },
      { value: 'medium', label: '中型', emoji: '🐶', description: '5-15kg' },
      { value: 'large', label: '大型', emoji: '🦮', description: '15kg 以上' }
    ]
  },
  {
    id: 'personality_type',
    label: '性格傾向',
    options: [
      { value: 'introvert', label: '內向', emoji: '🌙', description: '喜歡安靜獨處' },
      { value: 'extrovert', label: '外向', emoji: '☀️', description: '喜歡社交互動' },
      { value: 'balanced', label: '中性', emoji: '⚖️', description: '視情況而定' }
    ]
  },
  {
    id: 'activity_level',
    label: '活動量',
    options: [
      { value: 'low', label: '低', emoji: '😴', description: '喜歡睡覺休息' },
      { value: 'medium', label: '中', emoji: '🚶', description: '適度活動' },
      { value: 'high', label: '高', emoji: '🏃', description: '精力旺盛' }
    ]
  }
]

/**
 * 寵物標籤選擇 - 非必選分類
 * 用於興趣匹配和個人化，最多選 5 個
 */
export const optionalTagCategories = [
  {
    id: 'traits',
    label: '個性',
    emoji: '💫',
    tags: ['親人', '獨立', '害羞', '活潑', '溫和', '高冷', '黏人', '傲嬌', '好奇', '穩重']
  },
  {
    id: 'interests',
    label: '興趣',
    emoji: '🎯',
    tags: ['愛散步', '玩玩具', '睡覺', '社交', '游泳', '追球', '曬太陽', '看窗外', '玩水', '挖土']
  },
  {
    id: 'features',
    label: '特色',
    emoji: '✨',
    tags: [
      '會握手',
      '話很多',
      '愛撒嬌',
      '貪吃',
      '愛乾淨',
      '護食',
      '怕生',
      '愛抱抱',
      '會接飛盤',
      '會定點上廁所'
    ]
  }
]

/**
 * 預定義標籤 (用於 ProfileView 等頁面)
 * 從 optionalTagCategories 動態生成，並加上 # 前綴
 */
export const predefinedTags = optionalTagCategories.flatMap((category) =>
  category.tags.map((tag) => `#${tag}`)
)

export const profile = {
  avatar:
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  name: '豆泥 (Doni)',
  username: '@doni_cat',
  hashtags: ['#黏人', '#活潑', '#愛撒嬌', '#睡覺'],
  petInfo: { breed: '布偶貓', birthday: '2023-01-15', gender: '母' }
}

export const myPosts = [
  {
    id: 1,
    author: '豆泥 (Doni)',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150',
    isMine: true,
    audience: 'public',
    content: '今天陽光曬起來好舒服！',
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800'],
    tags: ['#午後'],
    likeCount: 12,
    commentCount: 3,
    isLiked: false,
    isBookmarked: true
  },
  {
    id: 2,
    author: '豆泥 (Doni)',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150',
    isMine: true,
    audience: 'friends',
    content: '新買的貓草球！',
    images: ['https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800'],
    tags: ['#貓草'],
    likeCount: 45,
    commentCount: 8,
    isLiked: true,
    isBookmarked: false
  }
]
export const savedPosts = [
  {
    id: 101,
    author: '小柴 (Shiba)',
    avatar: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=150',
    isMine: false,
    audience: 'public',
    content: '好物分享！',
    images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800'],
    tags: ['#好物分享'],
    likeCount: 88,
    commentCount: 12,
    isLiked: false,
    isBookmarked: true
  },
  {
    id: 102,
    author: '咪咪 (Mimi)',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150',
    isMine: false,
    audience: 'public',
    content: '開箱新玩具！',
    images: ['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800'],
    tags: ['#開箱'],
    likeCount: 156,
    commentCount: 24,
    isLiked: true,
    isBookmarked: true
  }
]
export const followersList = [
  {
    id: 1,
    name: '阿福',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150',
    breed: '布偶貓'
  },
  {
    id: 2,
    name: '酷醬',
    avatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150',
    breed: '法鬥'
  }
]
export const followingList = [
  {
    id: 1,
    name: '金金',
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150',
    breed: '黃金獵犬'
  },
  {
    id: 2,
    name: '小柴',
    avatar: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=150',
    breed: '柴犬'
  },
  {
    id: 3,
    name: '咪咪',
    avatar: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=150',
    breed: '橘貓'
  },
  {
    id: 4,
    name: '圓圓',
    avatar: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=150',
    breed: '英短'
  },
  {
    id: 5,
    name: '波波',
    avatar: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=150',
    breed: '波斯貓'
  },
  {
    id: 6,
    name: '黑豆',
    avatar: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=150',
    breed: '黑貓'
  }
]
export const createdEvents = [
  { id: 201, name: '布偶貓聚會', location: '中山區', status: '招募中', content: '交流！' }
]
export const followedEvents = [
  { id: 301, name: '寵物展覽', location: '世貿一館', status: '已收藏', content: '必去！' }
]
export const historyEvents = [
  { id: 401, name: '冬季健檢', location: '台大醫院', status: '已結束', content: '健康。' }
]
