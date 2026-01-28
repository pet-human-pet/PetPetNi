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
