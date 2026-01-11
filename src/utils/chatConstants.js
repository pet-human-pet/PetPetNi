import IconMatch from '@/components/icons/IconMatch.vue'

//聊天室導航欄相關常數定義
export const NAV_ITEMS = [
  { key: 'match', icon: 'fa-comments', label: '聊天' },
  { key: 'event', icon: 'fa-calendar-check', label: '活動揪團' },
  { key: 'community', icon: 'fa-users', label: '社群' },
  { key: 'ai', icon: 'fa-robot', label: 'AI 溝通師' }
]

export const PAGE_NAV_ITEMS = [
  { name: '首頁', icon: 'fa-house', route: 'home' },
  { name: '活動頁', icon: 'fa-map-location-dot', route: 'Event' },
  { name: '配對頁', icon: IconMatch, route: 'match' },
  { name: '動態牆', icon: 'fa-hashtag', route: 'Social' },
  { name: '個人檔案', icon: 'fa-user', route: 'Profile' }
]

export const MOBILE_BOTTOM_NAV = [
  { key: 'friendList', icon: 'fa-address-book', label: '好友' },
  { key: 'match', icon: 'fa-comments', label: '訊息' },
  { key: 'ai', icon: 'fa-robot', label: 'AI' },
  { key: 'Social', icon: 'fa-hashtag', label: '動態牆', isRoute: true },
  { key: 'more', icon: 'fa-paw', label: '更多', isAction: true }
]

export const MOBILE_MORE_ITEMS = [
  { key: 'home', icon: 'fa-house', label: '首頁', isRoute: true },
  { key: 'Event', icon: 'fa-map-location-dot', label: '活動頁', isRoute: true },
  { key: 'match', icon: IconMatch, label: '配對頁', isRoute: true },
  { key: 'Profile', icon: 'fa-user', label: '個人檔案', isRoute: true }
]
