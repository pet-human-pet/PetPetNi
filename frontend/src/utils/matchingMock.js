/**
 * Mock Data for Matching Feature
 * 配對功能的模擬資料
 *
 * 總數：20 隻寵物（10 狗 + 10 貓）
 * 符合標籤系統（硬性標籤 #prefix: + 軟性標籤）
 */

export const mockPets = [
  // ==================== 狗狗區 (10隻) ====================
  {
    id: 'dog_001',
    name: '小白',
    species: 'DOG',
    avatarUrl: '🐕',
    location: 'Taipei',
    tags: ['#breed:柴犬', '#size:中型', '#gender:公', '親人', '愛散步', '活潑'],
    bio: '活潑可愛的柴犬，最愛在公園玩耍和認識新朋友'
  },
  {
    id: 'dog_002',
    name: '大黃',
    species: 'DOG',
    avatarUrl: '🦮',
    location: 'Taichung',
    tags: ['#breed:黃金獵犬', '#size:大型', '#gender:公', '熱情', '貪吃', '聰明'],
    bio: '熱情的黃金獵犬，是個不折不扣的開心果'
  },
  {
    id: 'dog_003',
    name: '阿福',
    species: 'DOG',
    avatarUrl: '🐶',
    location: 'Taipei',
    tags: ['#breed:拉布拉多', '#size:大型', '#gender:母', '忠誠', '溫和', '愛游泳'],
    bio: '忠心耿耿的拉布拉多，最愛水上活動'
  },
  {
    id: 'dog_004',
    name: '妞妞',
    species: 'DOG',
    avatarUrl: '🐕‍🦺',
    location: 'Kaohsiung',
    tags: ['#breed:柯基', '#size:小型', '#gender:母', '可愛', '愛撒嬌', '好奇'],
    bio: '短腿柯基，走起路來屁股一扭一扭超可愛'
  },
  {
    id: 'dog_005',
    name: '旺財',
    species: 'DOG',
    avatarUrl: '🐕',
    location: 'Taipei',
    tags: ['#breed:哈士奇', '#size:大型', '#gender:公', '活潑', '愛玩', '話很多'],
    bio: '精力旺盛的哈士奇，會用各種方式表達意見'
  },
  {
    id: 'dog_006',
    name: '咖啡',
    species: 'DOG',
    avatarUrl: '🐶',
    location: 'Tainan',
    tags: ['#breed:貴賓犬', '#size:小型', '#gender:母', '優雅', '聰明', '愛乾淨'],
    bio: '優雅的貴賓犬，非常在意自己的儀態'
  },
  {
    id: 'dog_007',
    name: '波比',
    species: 'DOG',
    avatarUrl: '🦮',
    location: 'Taipei',
    tags: ['#breed:柴犬', '#size:中型', '#gender:公', '獨立', '愛散步', '警戒心強'],
    bio: '個性獨立的柴犬，但對主人非常忠誠'
  },
  {
    id: 'dog_008',
    name: '豆豆',
    species: 'DOG',
    avatarUrl: '🐕',
    location: 'Hsinchu',
    tags: ['#breed:米克斯', '#size:中型', '#gender:母', '親人', '溫和', '會握手'],
    bio: '可愛的米克斯犬，會很多才藝喔'
  },
  {
    id: 'dog_009',
    name: '巧克力',
    species: 'DOG',
    avatarUrl: '🐶',
    location: 'Taichung',
    tags: ['#breed:拉布拉多', '#size:大型', '#gender:公', '溫和', '貪吃', '愛睡覺'],
    bio: '慵懶的拉布拉多，最愛吃飽睡睡飽吃'
  },
  {
    id: 'dog_010',
    name: 'Lucky',
    species: 'DOG',
    avatarUrl: '🐕‍🦺',
    location: 'Taipei',
    tags: ['#breed:柯基', '#size:小型', '#gender:公', '活潑', '愛玩球', '聰明'],
    bio: '聰明的柯基，最愛玩接球遊戲'
  },

  // ==================== 貓貓區 (10隻) ====================
  {
    id: 'cat_001',
    name: '花花',
    species: 'CAT',
    avatarUrl: '🐈',
    location: 'Taipei',
    tags: ['#breed:三花貓', '#size:中型', '#gender:母', '安靜', '愛睡覺', '獨立'],
    bio: '慵懶的三花貓，最愛找個溫暖的地方曬太陽'
  },
  {
    id: 'cat_002',
    name: '咪咪',
    species: 'CAT',
    avatarUrl: '🐱',
    location: 'Taipei',
    tags: ['#breed:波斯貓', '#size:中型', '#gender:母', '優雅', '親人', '愛撒嬌'],
    bio: '優雅的波斯貓，喜歡被抱抱和梳毛'
  },
  {
    id: 'cat_003',
    name: '小虎',
    species: 'CAT',
    avatarUrl: '😺',
    location: 'Taichung',
    tags: ['#breed:美短', '#size:中型', '#gender:公', '活潑', '好奇', '愛玩'],
    bio: '好奇心旺盛的美短，對任何事物都充滿興趣'
  },
  {
    id: 'cat_004',
    name: '布丁',
    species: 'CAT',
    avatarUrl: '🐱',
    location: 'Taipei',
    tags: ['#breed:布偶貓', '#size:大型', '#gender:母', '溫和', '黏人', '愛抱抱'],
    bio: '溫柔的布偶貓，走到哪跟到哪的跟屁蟲'
  },
  {
    id: 'cat_005',
    name: '黑皮',
    species: 'CAT',
    avatarUrl: '🐈‍⬛',
    location: 'Kaohsiung',
    tags: ['#breed:米克斯', '#size:中型', '#gender:公', '獨立', '神秘', '夜行性'],
    bio: '神秘的黑貓，白天都在睡覺晚上才活躍'
  },
  {
    id: 'cat_006',
    name: '橘子',
    species: 'CAT',
    avatarUrl: '😸',
    location: 'Taipei',
    tags: ['#breed:米克斯', '#size:大型', '#gender:公', '貪吃', '慵懶', '親人'],
    bio: '圓滾滾的橘貓，最愛的事就是吃和睡'
  },
  {
    id: 'cat_007',
    name: '雪球',
    species: 'CAT',
    avatarUrl: '🐱',
    location: 'Hsinchu',
    tags: ['#breed:波斯貓', '#size:中型', '#gender:母', '優雅', '高冷', '愛乾淨'],
    bio: '高貴的白波斯，對環境整潔要求很高'
  },
  {
    id: 'cat_008',
    name: '芒果',
    species: 'CAT',
    avatarUrl: '😺',
    location: 'Taichung',
    tags: ['#breed:英短', '#size:中型', '#gender:公', '溫和', '安靜', '愛發呆'],
    bio: '圓臉英短，常常呆呆地看著遠方不知道在想什麼'
  },
  {
    id: 'cat_009',
    name: 'Coco',
    species: 'CAT',
    avatarUrl: '🐈',
    location: 'Taipei',
    tags: ['#breed:暹羅貓', '#size:中型', '#gender:母', '活潑', '話很多', '聰明'],
    bio: '愛說話的暹羅貓，會用叫聲表達各種需求'
  },
  {
    id: 'cat_010',
    name: '灰灰',
    species: 'CAT',
    avatarUrl: '😸',
    location: 'Tainan',
    tags: ['#breed:俄羅斯藍貓', '#size:中型', '#gender:公', '害羞', '溫和', '黏人'],
    bio: '害羞的藍貓，熟了之後是個小跟屁蟲'
  }
]

/**
 * 根據條件篩選寵物
 *
 * @param {Object} options - 篩選條件
 * @param {string} options.species - 物種 ('DOG' | 'CAT')
 * @param {string} options.location - 地點
 * @param {string} options.excludeId - 排除的寵物 ID
 * @returns {Array} 篩選後的寵物清單
 */
export function filterPets({ species, location, excludeId } = {}) {
  let filtered = [...mockPets]

  if (species) {
    filtered = filtered.filter((p) => p.species === species)
  }

  if (location) {
    filtered = filtered.filter((p) => p.location === location)
  }

  if (excludeId) {
    filtered = filtered.filter((p) => p.id !== excludeId)
  }

  return filtered
}

/**
 * 隨機取得 N 隻寵物
 *
 * @param {number} count - 數量
 * @param {Object} filters - 篩選條件
 * @returns {Array} 隨機寵物清單
 */
export function getRandomPets(count = 5, filters = {}) {
  const filtered = filterPets(filters)
  const shuffled = filtered.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
