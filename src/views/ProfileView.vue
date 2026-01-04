<script setup>
// ... (script 部分保持完全不變)
import { ref, reactive } from 'vue'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import PostCard from '@/components/Social/PostCard.vue'

const BRAND_ORANGE = '#f48e31'
const activeTab = ref('posts')
const activeSubTab = ref('my')
const isEditing = ref(false)
const showDetail = ref(false)
const selectedItem = ref(null)
const newTagInput = ref('')
const fileInput = ref(null)

const showUserList = ref(false)
const userListTitle = ref('')
const currentUserList = ref([])

const profile = reactive({
  avatar:
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  name: '豆泥 (Doni)',
  username: '@doni_cat',
  hashtags: ['#布偶貓', '#藍眼', '#午睡愛好者', '#罐罐小偷'],
  petInfo: {
    breed: '布偶貓',
    birthday: '2023-01-15',
    gender: '母',
    interest: '抓蝴蝶、踩奶、睡在鍵盤上，最喜歡在半夜開演唱會，是家裡的小霸王。'
  }
})

const myPosts = [
  {
    id: 1,
    author: '豆泥 (Doni)',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150',
    isMine: true,
    audience: 'public',
    content: '今天陽光曬起來好舒服，豆泥最喜歡的窗邊位置！',
    images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800'],
    tags: ['#午後', '#慵懶'],
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
    content: '新買的貓草球，一打開包裝就瘋了。',
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
    content: '這款貓咪飲水機超靜音，推薦給各位家長！',
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
    content: '今天收到的新玩具，家裡的貓咪玩瘋了！',
    images: ['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800'],
    tags: ['#開箱', '#貓玩具'],
    likeCount: 156,
    commentCount: 24,
    isLiked: true,
    isBookmarked: true
  }
]

const createdEvents = [
  {
    id: 201,
    name: '布偶貓交流聚會',
    location: '中山區',
    status: '招募中',
    content: '交流心得與罐罐試吃！'
  }
]
const followedEvents = [
  {
    id: 301,
    name: '年度寵物展覽',
    location: '世貿一館',
    status: '已收藏',
    content: '年度大展，必去！'
  }
]
const historyEvents = [
  {
    id: 401,
    name: '2023 冬季健檢',
    location: '台大醫院',
    status: '已結束',
    content: '數據非常健康。'
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

const handleAvatarClick = () => fileInput.value.click()
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) profile.avatar = URL.createObjectURL(file)
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
const removeTag = (index) => profile.hashtags.splice(index, 1)
const addTag = () => {
  if (newTagInput.value.trim()) {
    profile.hashtags.push(
      newTagInput.value.trim().startsWith('#')
        ? newTagInput.value.trim()
        : `#${newTagInput.value.trim()}`
    )
    newTagInput.value = ''
  }
}
</script>

<template>
  <div class="bg-bg-base relative min-h-screen overflow-x-hidden pb-20 text-left font-sans">
    <BackgroundGrid />

    <div class="mx-auto flex max-w-7xl justify-center px-0 py-8">
      <div class="grid w-full grid-cols-1 items-stretch gap-10 lg:grid-cols-[1.2fr_2fr]">
        <aside class="flex h-full flex-col">
          <div
            class="c-card border-border-default/20 flex h-full flex-1 flex-col border bg-white p-8 shadow-sm"
          >
            <div class="mb-8 flex w-full shrink-0 flex-col items-center text-center">
              <h1 class="c-title mb-6 text-3xl font-bold" :style="{ color: BRAND_ORANGE }">
                {{ profile.name }}
              </h1>

              <div class="group relative mb-6 cursor-pointer" @click="handleAvatarClick">
                <div
                  class="shadow-card h-44 w-44 overflow-hidden rounded-full border-4 border-white"
                >
                  <img :src="profile.avatar" class="h-full w-full object-cover" />
                </div>
                <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" />
                <span
                  class="absolute right-2 bottom-2 rounded-full border bg-white px-3 py-1 text-xs font-bold shadow-sm"
                  >已驗證飼主</span
                >
              </div>

              <div class="mb-6 flex items-center justify-center gap-3">
                <span class="text-fg-muted text-lg">{{ profile.username }}</span>
                <button class="group cursor-pointer" @click="isEditing = true">
                  <svg
                    class="fill-fg-muted h-6 w-6 transition-all group-hover:rotate-90 hover:fill-[#f48e31]"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6l-44.3 119.5c-3.2 8.7-11.8 14.3-21.2 13.9l-58.4-2.8c-14.5 11.5-30.8 20.6-48.5 27.2l-10.3 57.7c-1.6 9.1-9.3 15.8-18.6 16.1l-127.3 3.6c-9.4 .3-17.7-5.5-20.1-14.5l-15.5-56.5c-16.9-7.9-32.3-18.6-45.7-31.5l-54.3 22.1c-8.7 3.6-18.8 .1-23.7-8.2L5.4 349.5c-4.9-8.3-3.6-18.9 3.2-25.7l40.1-40.6c-1.1-8.3-1.7-16.7-1.7-25.2s.6-16.9 1.7-25.2L8.6 192.1c-6.8-6.8-8.2-17.4-3.2-25.7L49.7 57.9c4.9-8.3 15-11.8 23.7-8.2l54.3 22.1c13.4-12.9 28.8-23.6 45.7-31.5l15.5-56.5c2.4-9 10.7-14.8 20.1-14.5l127.3 3.6c9.3 .3 17 7 18.6 16.1l10.3 57.7c17.7 6.6 34 15.7 48.5 27.2l58.4-2.8c9.4-.5 17.9 5.2 21.2 13.9l44.3 119.5zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
                    />
                  </svg>
                </button>
              </div>

              <div class="mx-auto flex w-full justify-center gap-12 text-center">
                <div class="group cursor-pointer" @click="openUserList('followers')">
                  <p class="text-3xl font-bold" :style="{ color: BRAND_ORANGE }">2</p>
                  <p class="text-fg-muted text-sm font-medium">粉絲</p>
                </div>
                <div class="group cursor-pointer" @click="openUserList('following')">
                  <p class="text-3xl font-bold" :style="{ color: BRAND_ORANGE }">6</p>
                  <p class="text-fg-muted text-sm font-medium">追蹤中</p>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap justify-center gap-2">
                <span
                  v-for="(tag, index) in profile.hashtags"
                  :key="index"
                  class="text-fg-muted rounded-full bg-gray-100 px-3 py-1 text-sm font-medium"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="w-full flex-1 space-y-6 border-t border-gray-50 pt-8 text-left">
              <div
                class="mb-8 flex items-center gap-3 border-l-4 pl-4"
                :style="{ borderColor: BRAND_ORANGE }"
              >
                <h2 class="text-fg-secondary text-xl font-bold tracking-wide">寵物詳細資料</h2>
              </div>
              <div class="space-y-5 px-4 font-bold">
                <p class="flex flex-col border-b border-gray-50 pb-2">
                  <span class="text-fg-muted mb-1 text-xs font-bold uppercase">品種</span>
                  <span class="text-fg-secondary text-lg font-bold">{{
                    profile.petInfo.breed
                  }}</span>
                </p>
                <p class="flex flex-col border-b border-gray-50 pb-2">
                  <span class="text-fg-muted mb-1 text-xs font-bold uppercase">生日</span>
                  <span class="text-fg-secondary text-lg font-bold">{{
                    profile.petInfo.birthday
                  }}</span>
                </p>
                <p class="flex flex-col border-b border-gray-50 pb-2">
                  <span class="text-fg-muted mb-1 text-xs font-bold uppercase">性別</span>
                  <span class="text-fg-secondary text-lg font-bold">{{
                    profile.petInfo.gender
                  }}</span>
                </p>
                <div class="pt-2">
                  <span class="text-fg-muted mb-2 block text-xs font-bold uppercase">興趣愛好</span>
                  <p class="text-fg-secondary text-lg leading-snug font-bold">
                    {{ profile.petInfo.interest }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main
          class="c-card border-border-default/50 flex h-[850px] w-full flex-col overflow-hidden border bg-white shadow-sm"
        >
          <div
            class="border-border-default z-10 flex shrink-0 justify-around border-b bg-white px-6 pt-8"
          >
            <button
              v-for="tab in [
                { id: 'posts', n: '貼文' },
                { id: 'events', n: '活動' }
              ]"
              :key="tab.id"
              class="relative w-full pb-5 text-center text-lg font-bold"
              :style="{ color: activeTab === tab.id ? BRAND_ORANGE : '' }"
              @click="handleTabChange(tab.id)"
            >
              {{ tab.n }}
              <div
                v-if="activeTab === tab.id"
                class="absolute bottom-0 h-1.5 w-full rounded-t-full"
                :style="{ backgroundColor: BRAND_ORANGE }"
              ></div>
            </button>
          </div>
          <div class="custom-scrollbar flex-1 overflow-y-auto bg-gray-50/20 p-6 md:p-8">
            <div v-if="activeTab === 'posts'" class="space-y-6">
              <div class="mb-6 flex justify-center gap-6">
                <button
                  class="c-btn px-10 py-2.5 shadow-sm"
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
                  class="c-btn px-10 py-2.5 shadow-sm"
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
              <div class="mx-auto max-w-[550px] space-y-6 pb-10 text-left">
                <PostCard
                  v-for="post in activeSubTab === 'my' ? myPosts : savedPosts"
                  :key="post.id"
                  :post="post"
                />
              </div>
            </div>
            <div v-if="activeTab === 'events'" class="space-y-8">
              <div class="flex flex-wrap justify-center gap-4">
                <button
                  class="c-btn px-8 py-2.5 shadow-sm"
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
                  class="c-btn px-8 py-2.5 shadow-sm"
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
                  class="c-btn px-8 py-2.5 shadow-sm"
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
              <div class="grid gap-5 pb-10 text-left">
                <div
                  v-for="event in activeSubTab === 'create'
                    ? createdEvents
                    : activeSubTab === 'follow'
                      ? followedEvents
                      : historyEvents"
                  :key="event.id"
                  class="border-border-default flex cursor-pointer items-center justify-between rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  @click="openDetail(event)"
                >
                  <div class="flex-1 text-left">
                    <h4 class="text-fg-primary text-lg font-bold">{{ event.name }}</h4>
                    <p class="text-fg-muted text-sm">{{ event.location }}</p>
                  </div>
                  <span
                    class="rounded-full border border-orange-100 bg-orange-50 px-4 py-1 text-xs font-bold text-[#f48e31]"
                    >{{ activeSubTab === 'history' ? '已結束' : '進行中' }}</span
                  >
                </div>
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
      <div class="c-card max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white p-8 shadow-2xl">
        <h2 class="mb-6 text-center text-2xl font-bold" :style="{ color: BRAND_ORANGE }">
          編輯寵物資料
        </h2>
        <div class="space-y-4">
          <div>
            <label class="text-fg-secondary mb-1 block font-bold">寵物名稱</label
            ><input
              v-model="profile.name"
              class="border-border-default w-full rounded-xl border p-3"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-fg-secondary mb-1 block font-bold">品種</label
              ><input
                v-model="profile.petInfo.breed"
                class="border-border-default w-full rounded-xl border p-3"
              />
            </div>
            <div>
              <label class="text-fg-secondary mb-1 block font-bold">性別</label
              ><select
                v-model="profile.petInfo.gender"
                class="border-border-default w-full rounded-xl border p-3"
              >
                <option>公</option>
                <option>母</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-fg-secondary mb-1 block font-bold">生日</label
            ><input
              v-model="profile.petInfo.birthday"
              type="date"
              class="border-border-default w-full rounded-xl border p-3"
            />
          </div>
          <div>
            <label class="text-fg-secondary mb-1 block font-bold">興趣愛好</label
            ><textarea
              v-model="profile.petInfo.interest"
              rows="3"
              class="border-border-default w-full resize-none rounded-xl border p-3"
            ></textarea>
          </div>
          <div>
            <label class="text-fg-secondary mb-1 block font-bold">Hashtags</label>
            <div class="mb-2 flex flex-wrap gap-2 rounded-xl border border-dashed p-3">
              <span
                v-for="(tag, index) in profile.hashtags"
                :key="index"
                class="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-red-50 hover:text-red-500"
                @click="removeTag(index)"
                >{{ tag }} ✕</span
              >
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTagInput"
                placeholder="新增標籤..."
                class="border-border-default flex-1 rounded-xl border p-3"
                @keyup.enter="addTag"
              /><button
                class="rounded-xl px-5 font-bold text-white"
                :style="{ backgroundColor: BRAND_ORANGE }"
                @click="addTag"
              >
                新增
              </button>
            </div>
          </div>
        </div>
        <div class="mt-8 flex gap-4">
          <button class="flex-1 rounded-full bg-gray-100 py-3 font-bold" @click="isEditing = false">
            取消</button
          ><button
            class="flex-1 rounded-full py-3 font-bold text-white shadow-lg"
            :style="{ backgroundColor: BRAND_ORANGE }"
            @click="isEditing = false"
          >
            確認修改
          </button>
        </div>
      </div>
    </div>
    <Transition name="fade"
      ><div
        v-if="showDetail"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      >
        <div class="c-card w-full max-w-2xl bg-white p-8 text-left shadow-2xl">
          <div v-if="selectedItem" class="space-y-6">
            <h2 class="text-3xl font-bold" :style="{ color: BRAND_ORANGE }">
              {{ selectedItem.name || '項目詳情' }}
            </h2>
            <div class="text-fg-secondary border-t pt-6 text-lg leading-relaxed">
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
    <Transition name="fade"
      ><div
        v-if="showUserList"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      >
        <div class="c-card w-full max-w-md bg-white p-8 text-left shadow-2xl">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold" :style="{ color: BRAND_ORANGE }">{{ userListTitle }}</h2>
            <button class="text-2xl" @click="showUserList = false">✕</button>
          </div>
          <div class="custom-scrollbar max-h-[400px] space-y-4 overflow-y-auto">
            <div
              v-for="user in currentUserList"
              :key="user.id"
              class="flex items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm"
            >
              <img :src="user.avatar" class="h-12 w-12 rounded-full object-cover" />
              <div class="flex-1 text-left">
                <p class="font-bold">{{ user.name }}</p>
                <p class="text-fg-muted text-xs">{{ user.breed }}</p>
              </div>
              <button class="rounded-full border px-3 py-1 text-xs font-bold">查看</button>
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
    >
  </div>
</template>
