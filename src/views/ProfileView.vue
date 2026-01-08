<script setup>
// 1. 引入 onUnmounted 以處理生命週期清理
import { ref, reactive, onUnmounted } from 'vue'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import PostCard from '@/components/Social/PostCard.vue'

const BRAND_ORANGE = '#f48e31'
const activeTab = ref('posts')
const activeSubTab = ref('my')
const isEditing = ref(false)
const showDetail = ref(false)
const selectedItem = ref(null)
const fileInput = ref(null)
const isAboutVisible = ref(true)

// 保留完整的標籤清單
const predefinedTags = [
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
const showTagPicker = ref(false)
const showUserList = ref(false)
const userListTitle = ref('')
const currentUserList = ref([])

const profile = reactive({
  avatar:
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  name: '豆泥 (Doni)',
  username: '@doni_cat',
  hashtags: ['#布偶貓', '#藍眼', '#午睡愛好者', '#罐罐小偷'],
  petInfo: { breed: '布偶貓', birthday: '2023-01-15', gender: '母' }
})

const selectTag = (tag) => {
  if (profile.hashtags.length >= 5) return
  if (!profile.hashtags.includes(tag)) profile.hashtags.push(tag)
  showTagPicker.value = false
}
const removeTag = (index) => profile.hashtags.splice(index, 1)

// --- 資料清單 (保留原本資料) ---
const myPosts = [
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
const savedPosts = [
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
const followersList = [
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
const followingList = [
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
const createdEvents = [
  { id: 201, name: '布偶貓聚會', location: '中山區', status: '招募中', content: '交流！' }
]
const followedEvents = [
  { id: 301, name: '寵物展覽', location: '世貿一館', status: '已收藏', content: '必去！' }
]
const historyEvents = [
  { id: 401, name: '冬季健檢', location: '台大醫院', status: '已結束', content: '健康。' }
]

const handleAvatarClick = () => fileInput.value.click()

// 【修改重點 1】優化圖片上傳的記憶體管理 (Fix Memory Leak)
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // 如果已有暫存的 blob 網址，先銷毀它，釋放記憶體
    if (profile.avatar && profile.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(profile.avatar)
    }
    // 建立新的暫存網址
    profile.avatar = URL.createObjectURL(file)
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  activeSubTab.value = tab === 'posts' ? 'my' : 'create'
}
const openUserList = (type) => {
  userListTitle.value = type === 'followers' ? '粉絲名單' : '追蹤中名單'
  currentUserList.value = type === 'followers' ? followersList : followingList
  showUserList.value = true
}
const openDetail = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

// 【修改重點 2】加入 onUnmounted 生命週期鉤子 (依據 Guide.md 放最底部)
// 當使用者離開頁面時，確保銷毀最後一張暫存圖片，防止記憶體洩漏
onUnmounted(() => {
  if (profile.avatar && profile.avatar.startsWith('blob:')) {
    URL.revokeObjectURL(profile.avatar)
  }
})
</script>

<template>
  <div
    class="bg-bg-base relative flex h-screen w-full flex-col overflow-hidden text-left font-sans"
  >
    <BackgroundGrid />

    <div
      class="mx-auto flex w-full max-w-7xl flex-1 justify-center overflow-hidden px-2 pt-6 pb-6 md:px-4 md:pt-10 md:pb-24"
    >
      <div
        class="border-border-default/20 flex h-full w-full flex-col items-stretch overflow-hidden rounded-3xl border bg-white text-left shadow-sm lg:grid lg:grid-cols-[1.2fr_2fr] lg:gap-10 lg:rounded-none lg:border-none lg:bg-transparent lg:shadow-none"
      >
        <aside
          class="lg:border-border-default/20 flex h-auto shrink-0 flex-col bg-transparent lg:h-full lg:overflow-hidden lg:rounded-3xl lg:border lg:bg-white lg:p-8 lg:shadow-sm"
        >
          <div
            class="custom-scrollbar flex h-auto flex-col p-4 pb-0 lg:h-full lg:overflow-y-auto lg:p-0"
          >
            <div
              class="mb-6 flex flex-row items-stretch gap-2 pb-2 lg:mb-8 lg:flex-col lg:items-center lg:gap-0 lg:pb-0 lg:text-center"
            >
              <div
                class="flex w-[30%] min-w-[90px] shrink-0 flex-col items-center justify-between lg:w-full"
              >
                <h1
                  class="w-full truncate pt-1 text-center text-lg leading-tight font-bold lg:text-3xl"
                  :style="{ color: BRAND_ORANGE }"
                >
                  {{ profile.name }}
                </h1>
                <button
                  type="button"
                  class="group relative flex flex-1 cursor-pointer items-center justify-center py-1 text-left lg:py-4"
                  @click="handleAvatarClick"
                >
                  <div
                    class="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md lg:h-44 lg:w-44"
                  >
                    <img :src="profile.avatar" class="h-full w-full object-cover" />
                  </div>

                  <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" />

                  <span
                    class="absolute right-[-4px] bottom-[10px] z-10 rounded-full border bg-white px-2 py-0.5 text-[10px] font-bold shadow-sm lg:right-2 lg:bottom-4 lg:px-3 lg:py-1 lg:text-xs"
                  >
                    已驗證
                  </span>
                </button>
                <div class="flex h-6 w-full items-end justify-center gap-1 pb-1 lg:h-auto lg:gap-2">
                  <span
                    class="text-fg-muted max-w-[80px] truncate text-xs lg:max-w-none lg:text-lg"
                    >{{ profile.username }}</span
                  >
                  <button class="group shrink-0 cursor-pointer" @click="isEditing = true">
                    <svg
                      class="fill-fg-muted h-3.5 w-3.5 transition-all group-hover:rotate-90 hover:fill-[#f48e31] lg:h-6 lg:w-6"
                      viewBox="0 0 512 512"
                    >
                      <path
                        d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6l-44.3 119.5c-3.2 8.7-11.8 14.3-21.2 13.9l-58.4-2.8c-14.5 11.5-30.8 20.6-48.5 27.2l-10.3 57.7c-1.6 9.1-9.3 15.8-18.6 16.1l-127.3 3.6c-9.4 .3-17.7-5.5-20.1-14.5l-15.5-56.5c-16.9-7.9-32.3-18.6-45.7-31.5l-54.3 22.1c-8.7 3.6-18.8 .1-23.7-8.2L5.4 349.5c-4.9-8.3-3.6-18.9 3.2-25.7l40.1-40.6c-1.1-8.3-1.7-16.7-1.7-25.2s.6-16.9 1.7-25.2L8.6 192.1c-6.8-6.8-8.2-17.4-3.2-25.7L49.7 57.9c4.9-8.3 15-11.8 23.7-8.2l54.3 22.1c13.4-12.9 28.8-23.6 45.7-31.5l15.5-56.5c2.4-9 10.7-14.8 20.1-14.5l127.3 3.6c9.3 .3 17 7 18.6 16.1l10.3 57.7c17.7 6.6 34 15.7 48.5 27.2l58.4-2.8c9.4-.5 17.9 5.2 21.2 13.9l44.3 119.5zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mx-1 h-auto w-px self-stretch bg-gray-100 lg:hidden"></div>

              <div
                class="flex w-full min-w-0 flex-1 flex-col justify-between lg:block lg:w-auto lg:gap-0"
              >
                <div
                  class="flex items-start justify-between pt-0.5 text-center lg:mb-6 lg:flex-nowrap lg:justify-center lg:gap-10"
                >
                  <div
                    class="group flex-1 cursor-pointer lg:flex-none"
                    @click="openUserList('followers')"
                  >
                    <p class="text-lg font-bold lg:text-3xl" :style="{ color: BRAND_ORANGE }">2</p>
                    <p class="text-fg-muted text-[10px] font-medium lg:text-sm">粉絲</p>
                  </div>
                  <div class="flex flex-[1.5] justify-center lg:flex-none">
                    <button
                      class="w-full max-w-[70px] truncate rounded-full border py-1 text-[10px] font-bold whitespace-nowrap transition-all lg:w-auto lg:max-w-none lg:px-6 lg:py-1.5 lg:text-sm"
                      :style="
                        isAboutVisible
                          ? {
                              backgroundColor: BRAND_ORANGE,
                              color: 'white',
                              borderColor: BRAND_ORANGE
                            }
                          : { color: BRAND_ORANGE, borderColor: BRAND_ORANGE }
                      "
                      @click="isAboutVisible = !isAboutVisible"
                    >
                      關於我
                    </button>
                  </div>
                  <div
                    class="group flex-1 cursor-pointer lg:flex-none"
                    @click="openUserList('following')"
                  >
                    <p class="text-lg font-bold lg:text-3xl" :style="{ color: BRAND_ORANGE }">6</p>
                    <p class="text-fg-muted text-[10px] font-medium lg:text-sm">追蹤中</p>
                  </div>
                </div>
                <div class="my-1 flex w-full flex-1 items-center lg:my-0 lg:block lg:flex-none">
                  <div
                    class="grid h-[52px] w-full grid-cols-3 content-center gap-1 overflow-hidden lg:h-auto lg:gap-2"
                  >
                    <span
                      v-for="(tag, index) in profile.hashtags"
                      :key="index"
                      class="text-fg-muted truncate rounded-full bg-gray-100 px-1 py-1 text-center text-[9px] font-medium tracking-tighter lg:px-2 lg:py-1 lg:text-[11px]"
                      >{{ tag }}</span
                    >
                  </div>
                </div>
                <Transition name="fade">
                  <div
                    v-if="isAboutVisible"
                    class="flex w-full items-end border-t border-gray-50 pt-1 lg:mt-6 lg:pt-6"
                  >
                    <div
                      class="grid w-full grid-cols-3 items-center gap-0.5 text-center lg:flex lg:justify-around"
                    >
                      <div
                        class="flex flex-col items-center border-r border-gray-100 last:border-0 lg:flex-1 lg:border-0"
                      >
                        <span class="text-fg-muted mb-0.5 text-[9px] font-bold uppercase lg:mb-1"
                          >品種</span
                        ><span
                          class="text-fg-secondary w-full truncate text-[10px] font-bold tracking-tighter lg:text-sm"
                          >{{ profile.petInfo.breed }}</span
                        >
                      </div>
                      <div
                        class="flex flex-col items-center border-r border-gray-100 last:border-0 lg:flex-1 lg:border-0"
                      >
                        <span class="text-fg-muted mb-0.5 text-[9px] font-bold uppercase lg:mb-1"
                          >生日</span
                        ><span
                          class="text-fg-secondary w-full truncate text-[10px] font-bold tracking-tighter lg:text-sm"
                          >{{ profile.petInfo.birthday }}</span
                        >
                      </div>
                      <div class="flex flex-col items-center lg:flex-1">
                        <span class="text-fg-muted mb-0.5 text-[9px] font-bold uppercase lg:mb-1"
                          >性別</span
                        ><span
                          class="text-fg-secondary w-full truncate text-[10px] font-bold tracking-tighter lg:text-sm"
                          >{{ profile.petInfo.gender }}</span
                        >
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </aside>

        <main
          class="lg:border-border-default/50 flex h-full flex-col overflow-hidden bg-transparent lg:rounded-3xl lg:border lg:bg-white lg:shadow-sm"
        >
          <div class="z-10 flex-none border-b border-gray-100 bg-white/95 backdrop-blur-sm">
            <div class="mt-2 h-px w-full bg-gray-100 lg:hidden"></div>

            <div class="flex shrink-0 justify-around px-6 pt-4 lg:pt-8">
              <button
                v-for="tab in [
                  { id: 'posts', n: '貼文' },
                  { id: 'events', n: '活動' }
                ]"
                :key="tab.id"
                class="relative w-full pb-3 text-center text-base font-bold lg:pb-5 lg:text-lg"
                :style="{ color: activeTab === tab.id ? BRAND_ORANGE : '' }"
                @click="handleTabChange(tab.id)"
              >
                {{ tab.n }}
                <div
                  v-if="activeTab === tab.id"
                  class="absolute bottom-0 h-1 w-full rounded-t-full lg:h-1.5"
                  :style="{ backgroundColor: BRAND_ORANGE }"
                ></div>
              </button>
            </div>

            <div class="px-6 py-4">
              <div v-if="activeTab === 'posts'" class="flex justify-center gap-4 lg:gap-6">
                <button
                  class="c-btn rounded-xl px-6 py-2 text-xs font-bold shadow-sm lg:px-10 lg:py-2.5 lg:text-sm"
                  :style="
                    activeSubTab === 'my'
                      ? { backgroundColor: BRAND_ORANGE, color: 'white' }
                      : { backgroundColor: '#f3f4f6' }
                  "
                  @click="activeSubTab = 'my'"
                >
                  我的貼文
                </button>
                <button
                  class="c-btn rounded-xl px-6 py-2 text-xs font-bold shadow-sm lg:px-10 lg:py-2.5 lg:text-sm"
                  :style="
                    activeSubTab === 'saved'
                      ? { backgroundColor: BRAND_ORANGE, color: 'white' }
                      : { backgroundColor: '#f3f4f6' }
                  "
                  @click="activeSubTab = 'saved'"
                >
                  儲存的貼文
                </button>
              </div>
              <div
                v-if="activeTab === 'events'"
                class="flex flex-wrap justify-center gap-2 lg:gap-4"
              >
                <button
                  class="c-btn rounded-xl px-4 py-2 text-xs font-bold shadow-sm lg:px-8 lg:py-2.5 lg:text-sm"
                  :style="
                    activeSubTab === 'create'
                      ? { backgroundColor: BRAND_ORANGE, color: 'white' }
                      : { backgroundColor: '#f3f4f6' }
                  "
                  @click="activeSubTab = 'create'"
                >
                  發起活動
                </button>
                <button
                  class="c-btn rounded-xl px-4 py-2 text-xs font-bold shadow-sm lg:px-8 lg:py-2.5 lg:text-sm"
                  :style="
                    activeSubTab === 'follow'
                      ? { backgroundColor: BRAND_ORANGE, color: 'white' }
                      : { backgroundColor: '#f3f4f6' }
                  "
                  @click="activeSubTab = 'follow'"
                >
                  收藏活動
                </button>
                <button
                  class="c-btn rounded-xl px-4 py-2 text-xs font-bold shadow-sm lg:px-8 lg:py-2.5 lg:text-sm"
                  :style="
                    activeSubTab === 'history'
                      ? { backgroundColor: BRAND_ORANGE, color: 'white' }
                      : { backgroundColor: '#f3f4f6' }
                  "
                  @click="activeSubTab = 'history'"
                >
                  歷史活動
                </button>
              </div>
            </div>
          </div>

          <div
            class="custom-scrollbar flex-1 overflow-y-auto bg-transparent p-4 pb-20 lg:bg-gray-50/20 lg:p-8 lg:pb-8"
          >
            <div
              v-if="activeTab === 'posts'"
              class="mx-auto max-w-[550px] space-y-4 pb-10 text-left lg:space-y-6"
            >
              <PostCard
                v-for="post in activeSubTab === 'my' ? myPosts : savedPosts"
                :key="post.id"
                :post="post"
              />
            </div>
            <div v-if="activeTab === 'events'" class="grid gap-4 pb-10 lg:gap-5">
              <div
                v-for="event in activeSubTab === 'create'
                  ? createdEvents
                  : activeSubTab === 'follow'
                    ? followedEvents
                    : historyEvents"
                :key="event.id"
                class="border-border-default flex cursor-pointer items-center justify-between rounded-3xl border bg-white p-4 shadow-sm transition-all hover:shadow-md lg:p-6"
                @click="openDetail(event)"
              >
                <div class="flex-1 text-left">
                  <h4 class="text-fg-primary text-base font-bold lg:text-lg">{{ event.name }}</h4>
                  <p class="text-fg-muted text-xs lg:text-sm">{{ event.location }}</p>
                </div>

                <span
                  class="bg-brand-accent/20 text-fg-secondary border-brand-accent/30 inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                >
                  {{ event.status }}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    <div
      v-if="isEditing"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 text-left backdrop-blur-sm"
    >
      <div
        class="c-card max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
      >
        <h2 class="mb-8 text-center text-2xl font-bold" :style="{ color: BRAND_ORANGE }">
          編輯寵物 Hashtags
        </h2>
        <div class="space-y-8">
          <div>
            <div class="mb-4 flex items-center justify-between">
              <label class="text-fg-secondary text-lg font-bold"
                >目前已選標籤 ({{ profile.hashtags.length }}/5)</label
              ><span
                v-if="profile.hashtags.length >= 5"
                class="animate-bounce text-sm font-bold text-red-500"
                >已達上限！</span
              >
            </div>
            <div
              class="mb-6 grid grid-cols-3 gap-3 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-6"
            >
              <span
                v-if="profile.hashtags.length === 0"
                class="text-fg-muted col-span-3 py-4 text-center text-sm italic"
                >點擊下方按鈕開始選擇</span
              >
              <div
                v-for="(tag, index) in profile.hashtags"
                :key="index"
                class="flex cursor-pointer items-center justify-between rounded-full border border-orange-100 bg-white px-3 py-2 text-[10px] font-bold text-[#f48e31] shadow-sm"
                @click="removeTag(index)"
              >
                <span class="truncate">{{ tag }}</span
                ><span class="ml-1 shrink-0 text-[10px]">✕</span>
              </div>
            </div>
            <button
              class="w-full rounded-2xl py-4 font-bold text-white shadow-md transition-all active:scale-95"
              :class="
                profile.hashtags.length >= 5
                  ? 'cursor-not-allowed grayscale'
                  : 'hover:brightness-110'
              "
              :style="{ backgroundColor: BRAND_ORANGE }"
              :disabled="profile.hashtags.length >= 5"
              @click="showTagPicker = true"
            >
              選擇標籤
            </button>
          </div>
        </div>
        <div class="mt-12">
          <button
            class="w-full rounded-full bg-gray-100 py-4 text-lg font-bold transition-colors hover:bg-gray-200"
            @click="isEditing = false"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="showTagPicker"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
    >
      <div class="c-card w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <h3 class="mb-4 text-left text-xl font-bold">選擇標籤 ({{ profile.hashtags.length }}/5)</h3>
        <div class="custom-scrollbar grid max-h-[350px] grid-cols-3 gap-2 overflow-y-auto p-2">
          <button
            v-for="tag in predefinedTags"
            :key="tag"
            class="rounded-lg border p-2 text-xs transition-all"
            :class="
              profile.hashtags.includes(tag)
                ? 'cursor-not-allowed border-orange-300 bg-orange-100 text-[#f48e31]'
                : 'border-gray-200 hover:bg-orange-50'
            "
            :disabled="profile.hashtags.includes(tag)"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
        <button
          class="mt-6 w-full rounded-full bg-gray-100 py-3 font-bold"
          @click="showTagPicker = false"
        >
          取消
        </button>
      </div>
    </div>
    <Transition name="fade"
      ><div
        v-if="showUserList"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      >
        <div class="c-card w-full max-w-md rounded-3xl bg-white p-8 text-left shadow-2xl">
          <div class="mb-6 flex items-center justify-between border-b pb-4">
            <h2 class="text-2xl font-bold" :style="{ color: BRAND_ORANGE }">{{ userListTitle }}</h2>
            <button class="text-2xl" @click="showUserList = false">✕</button>
          </div>
          <div class="custom-scrollbar max-h-[400px] space-y-4 overflow-y-auto px-6 py-4">
            <div
              v-for="user in currentUserList"
              :key="user.id"
              class="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-md"
            >
              <img
                :src="user.avatar"
                class="h-12 w-12 rounded-full object-cover ring-2 ring-gray-50"
              />
              <div class="flex-1">
                <p class="text-fg-primary font-bold">{{ user.name }}</p>
                <p class="text-fg-muted text-xs">{{ user.breed }}</p>
              </div>
              <button
                class="rounded-full border border-orange-100 bg-orange-50 px-4 py-1 text-xs font-bold text-[#f48e31]"
              >
                查看
              </button>
            </div>
          </div>
          <button
            class="mt-8 w-full rounded-full py-4 font-bold text-white shadow-lg"
            :style="{ backgroundColor: BRAND_ORANGE }"
            @click="showUserList = false"
          >
            返回
          </button>
        </div>
      </div></Transition
    ><Transition name="fade"
      ><div
        v-if="showDetail"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      >
        <div class="c-card w-full max-w-2xl rounded-3xl bg-white p-8 text-left shadow-2xl">
          <div v-if="selectedItem" class="space-y-6 text-left">
            <h2 class="text-left text-3xl font-bold" :style="{ color: BRAND_ORANGE }">
              {{ selectedItem.name }}
            </h2>
            <div class="text-fg-secondary border-t pt-6 text-left text-lg leading-relaxed">
              {{ selectedItem.content }}
            </div>
          </div>
          <button
            class="mt-10 w-full rounded-full py-4 font-bold text-white shadow-lg"
            :style="{ backgroundColor: BRAND_ORANGE }"
            @click="showDetail = false"
          >
            關閉視窗
          </button>
        </div>
      </div></Transition
    >
  </div>
</template>

<style scoped>
:global(body) {
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
