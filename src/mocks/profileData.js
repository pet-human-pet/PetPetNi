export const predefinedTags = [
  '#布偶貓',
  '#藍眼',
  '#午睡愛好者',
  '#罐罐小偷',
  '#踩奶大師',
  '#半夜開演唱會',
  '#拆家小能手',
  '#優雅貓生',
  '#長毛怪',
  '#黏人精',
  '#主子威武',
  '#家中小霸王',
  '#呼嚕機',
  '#吸貓成癮',
  '#屁顛屁顛',
  '#呆萌',
  '#好奇寶寶',
  '#拆家專家',
  '#睡神',
  '#專業乞食者',
  '#毛茸茸',
  '#眼裡只有肉',
  '#慢條斯理',
  '#動作敏捷',
  '#宅貓',
  '#戶外探險家',
  '#接球達人',
  '#搖尾巴',
  '#傻白甜',
  '#高冷王子',
  '#貓草中毒',
  '#追球高手',
  '#沙發破壞者',
  '#偷吃現行犯',
  '#傲嬌',
  '#社交達人',
  '#安靜乖乖',
  '#活潑好動',
  '#智慧擔當',
  '#專業陪睡',
  '#大胃王',
  '#潔癖怪',
  '#捕蚊英雄',
  '#鍵盤干擾',
  '#箱子控',
  '#陽光男孩',
  '#精緻女孩',
  '#小短腿',
  '#大長腿',
  '#混血美男子'
]

export const profile = {
  avatar:
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  name: '豆泥 (Doni)',
  username: '@doni_cat',
  hashtags: ['#布偶貓', '#藍眼', '#午睡愛好者', '#罐罐小偷'],
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
