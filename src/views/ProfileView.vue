<script setup>
import { ref, reactive } from 'vue'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'

// --- 1. 顏色與狀態 ---
const BRAND_ORANGE = '#f48e31'
const activeTab = ref('posts')
const activeSubTab = ref('my')
const isEditing = ref(false)
const showDetail = ref(false)
const selectedItem = ref(null)
const newTagInput = ref('')
const fileInput = ref(null)

// --- 2. 寵物個人資料 ---
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
    interest: '抓蝴蝶、踩奶、睡在鍵盤上'
  }
})

// --- 3. 恢復與簡化假資料 (🔑 移除好友英文名稱防止 RWD 跑版) ---
const myPosts = [
  {
    id: 1,
    type: 'post',
    title: '午後的陽光剛好',
    date: '2023-12-01',
    img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
    content: '今天陽光曬起來好舒服，豆泥最喜歡的窗邊位置！'
  },
  {
    id: 2,
    type: 'post',
    title: '新買的貓草球',
    date: '2023-12-05',
    img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80',
    content: '一打開包裝就瘋了，抓著不放。'
  },
  {
    id: 3,
    type: 'post',
    title: '今天的晚餐是罐罐',
    date: '2023-12-10',
    img: 'https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?auto=format&fit=crop&w=800&q=80',
    content: '期待很久的雞肉口味。'
  }
]
const savedPosts = [
  {
    id: 101,
    type: 'post',
    title: '貓咪飲水機評測',
    date: '2023-11-15',
    img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    content: '這款超靜音，豆泥很愛喝。'
  },
  {
    id: 102,
    type: 'post',
    title: '逗貓棒推薦清單',
    date: '2023-11-20',
    img: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=800&q=80',
    content: '整理了十款好玩的逗貓棒。'
  },
  {
    id: 103,
    type: 'post',
    title: '室內貓健康飲食',
    date: '2023-11-25',
    img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80',
    content: '關於低碳水化合物的選購指南。'
  }
]
const createdEvents = [
  {
    id: 201,
    type: 'event',
    name: '布偶貓交流聚會',
    location: '中山區咖啡廳',
    status: '招募中',
    content: '歡迎帶主子來參加！'
  },
  {
    id: 202,
    type: 'event',
    name: '週末草皮野餐',
    location: '大安森林公園',
    status: '已額滿',
    content: '一起來曬太陽跑跑跑。'
  },
  {
    id: 203,
    type: 'event',
    name: '寵物鮮食工作坊',
    location: '線上課程',
    status: '報名中',
    content: '製作美味寵物蛋糕。'
  }
]
const followedEvents = [
  {
    id: 301,
    type: 'event',
    name: '年度寵物展覽',
    location: '世貿一館',
    status: '已收藏',
    content: '大降價時刻到了。'
  },
  {
    id: 302,
    type: 'event',
    name: '線上貓咪攝影賽',
    location: 'Instagram 線上',
    status: '進行中',
    content: 'PO 出崩壞照。'
  },
  {
    id: 303,
    type: 'event',
    name: '愛心認養市集',
    location: '松菸園區',
    status: '已收藏',
    content: '認養代替購買。'
  }
]

// 🔑 修改點：僅移除英文名稱，防止寬度不足跑版
const friendsList = [
  {
    id: 501,
    type: 'friend',
    name: '阿福',
    breed: '黃金獵犬',
    status: '線上',
    content: '溫柔體貼的鄰居。',
    img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 502,
    type: 'friend',
    name: '酷醬',
    breed: '法鬥',
    status: '離線',
    content: '熱情的法鬥男孩。',
    img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 503,
    type: 'friend',
    name: '小柴',
    breed: '柴犬',
    status: '線上',
    content: '傲嬌的散步好隊友。',
    img: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=80'
  }
]

// --- 4. 邏輯方法 ---
const openDetail = (item) => {
  selectedItem.value = item
  showDetail.value = true
}
const handleAvatarClick = () => fileInput.value.click()
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) profile.avatar = URL.createObjectURL(file)
}
const handleTabChange = (tab) => {
  activeTab.value = tab
  activeSubTab.value = tab === 'posts' ? 'my' : 'create'
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
  <div class="bg-bg-base relative min-h-screen overflow-x-hidden pb-20 font-sans">
    <BackgroundGrid />

    <div class="container mx-auto flex max-w-[1300px] justify-center px-10 py-8">
      <div class="grid w-full grid-cols-1 items-stretch gap-10 lg:grid-cols-[1.2fr_2fr]">
        <aside class="flex min-h-[850px] flex-col items-center space-y-8">
          <div class="flex flex-col items-center text-center">
            <h1 class="c-title mb-6 text-3xl font-bold" :style="{ color: BRAND_ORANGE }">
              {{ profile.name }}
            </h1>
            <div class="group relative mb-6 cursor-pointer" @click="handleAvatarClick">
              <div class="shadow-card h-44 w-44 overflow-hidden rounded-full border-4 border-white">
                <img
                  :src="profile.avatar"
                  alt="Avatar"
                  class="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                />
              </div>
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept="image/*"
                @change="handleFileChange"
              />
              <span
                class="border-border-default absolute right-2 bottom-2 rounded-full border bg-white px-3 py-1 text-xs font-bold shadow-sm"
                >已驗證飼主</span
              >
            </div>
            <div class="flex items-center gap-3">
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
          </div>
          <div class="mx-auto flex w-full max-w-[260px] justify-between py-2 text-center">
            <div>
              <p class="text-3xl font-bold" :style="{ color: BRAND_ORANGE }">105</p>
              <p class="text-fg-muted text-sm font-medium">粉絲</p>
            </div>
            <div>
              <p class="text-3xl font-bold" :style="{ color: BRAND_ORANGE }">15</p>
              <p class="text-fg-muted text-sm font-medium">追蹤中</p>
            </div>
          </div>
          <div class="flex flex-wrap justify-center gap-3 px-8">
            <span
              v-for="tag in profile.hashtags"
              :key="tag"
              class="border-border-default text-fg-secondary flex h-[38px] w-[110px] items-center justify-center rounded-full border bg-white text-[11px] shadow-sm"
              >{{ tag }}</span
            >
          </div>

          <div
            class="c-card border-border-default/20 flex w-full flex-1 flex-col justify-center border p-8 shadow-sm"
          >
            <div class="w-full space-y-6">
              <div
                class="mb-8 flex items-center gap-3 border-l-4 pl-4"
                :style="{ borderColor: BRAND_ORANGE }"
              >
                <h2 class="text-fg-secondary text-xl font-bold tracking-wide">寵物詳細資料</h2>
              </div>
              <div class="space-y-5 px-4 text-left">
                <p class="flex flex-col border-b border-gray-50 pb-2">
                  <span class="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase"
                    >品種</span
                  >
                  <span class="text-fg-secondary text-lg font-bold">{{
                    profile.petInfo.breed
                  }}</span>
                </p>
                <p class="flex flex-col border-b border-gray-50 pb-2">
                  <span class="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase"
                    >生日</span
                  >
                  <span class="text-fg-secondary text-lg font-bold">{{
                    profile.petInfo.birthday
                  }}</span>
                </p>
                <p class="flex flex-col border-b border-gray-50 pb-2">
                  <span class="text-fg-muted mb-1 text-xs font-bold tracking-wider uppercase"
                    >性別</span
                  >
                  <span class="text-fg-secondary text-lg font-bold">{{
                    profile.petInfo.gender
                  }}</span>
                </p>
                <div class="pt-2">
                  <span class="text-fg-muted mb-2 block text-xs font-bold tracking-wider uppercase"
                    >興趣愛好</span
                  >
                  <p class="text-fg-secondary text-lg leading-snug font-bold">
                    {{ profile.petInfo.interest }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main
          class="c-card border-border-default/50 flex min-h-[850px] w-full flex-col overflow-hidden border shadow-sm"
        >
          <div class="border-border-default flex shrink-0 justify-around border-b px-6 pt-8">
            <button
              v-for="tab in [
                { id: 'posts', n: '貼文' },
                { id: 'events', n: '活動' },
                { id: 'friends', n: '好友' }
              ]"
              :key="tab.id"
              class="relative w-full pb-5 text-center text-lg font-bold"
              :class="activeTab === tab.id ? '' : 'text-fg-muted hover:text-fg-primary'"
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

          <div class="flex-1 p-10">
            <div v-if="activeTab === 'posts'" class="space-y-8">
              <div class="flex justify-center gap-6">
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
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div
                  v-for="post in activeSubTab === 'my' ? myPosts : savedPosts"
                  :key="post.id"
                  class="cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md active:scale-95"
                  @click="openDetail(post)"
                >
                  <div class="aspect-square overflow-hidden">
                    <img :src="post.img" class="h-full w-full object-cover" />
                  </div>
                  <div class="text-fg-primary truncate p-4 text-center text-sm font-bold">
                    {{ post.title }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'friends'" class="grid gap-6">
              <div
                v-for="friend in friendsList"
                :key="friend.id"
                class="border-border-default flex cursor-pointer items-center justify-between rounded-[2rem] border bg-white p-8 transition-all hover:shadow-lg active:scale-95"
                @click="openDetail(friend)"
              >
                <div class="flex items-center gap-6">
                  <img :src="friend.img" class="h-16 w-16 rounded-full border-2 border-gray-50" />
                  <div class="text-left">
                    <p class="text-fg-primary text-2xl font-bold">{{ friend.name }}</p>
                    <p class="text-fg-muted text-sm">狀態：{{ friend.status }}</p>
                  </div>
                </div>
                <button class="px-6 text-xl font-bold" :style="{ color: BRAND_ORANGE }">
                  查看
                </button>
              </div>
            </div>

            <div v-if="activeTab === 'events'" class="space-y-8">
              <div class="flex justify-center gap-6">
                <button
                  class="c-btn px-10 py-2.5"
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
                  class="c-btn px-10 py-2.5"
                  :style="
                    activeSubTab === 'follow'
                      ? { backgroundColor: BRAND_ORANGE, color: 'white' }
                      : { backgroundColor: '#f3f4f6' }
                  "
                  @click="activeSubTab = 'follow'"
                >
                  收藏活動
                </button>
              </div>
              <div class="grid gap-5">
                <div
                  v-for="event in activeSubTab === 'create' ? createdEvents : followedEvents"
                  :key="event.id"
                  class="border-border-default flex cursor-pointer items-center justify-between rounded-3xl border bg-white p-6 transition-all hover:shadow-md active:scale-[0.98]"
                  @click="openDetail(event)"
                >
                  <div class="text-left">
                    <h4 class="text-fg-primary text-lg font-bold">{{ event.name }}</h4>
                    <p class="text-fg-muted text-sm">{{ event.location }}</p>
                  </div>
                  <span class="bg-brand-accent/20 rounded-full px-4 py-1 text-xs font-bold">{{
                    event.status
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <div
      v-if="isEditing"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div class="c-card mt-10 max-h-[90vh] w-full max-w-xl overflow-y-auto p-8 shadow-2xl">
        <h2 class="mb-6 text-center text-2xl font-bold" :style="{ color: BRAND_ORANGE }">
          編輯寵物資料
        </h2>
        <div class="space-y-5 text-left text-sm">
          <div>
            <label class="text-fg-secondary mb-1 block font-bold">寵物名稱</label
            ><input
              v-model="profile.name"
              type="text"
              class="border-border-default w-full rounded-xl border p-3"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-fg-secondary mb-1 block font-bold">品種</label
              ><input
                v-model="profile.petInfo.breed"
                type="text"
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
            <label class="text-fg-secondary mb-1 block font-bold">興趣</label
            ><textarea
              v-model="profile.petInfo.interest"
              rows="2"
              class="border-border-default w-full resize-none rounded-xl border p-3"
            ></textarea>
          </div>
          <div>
            <label class="text-fg-secondary mb-1 block font-bold">Hashtags</label>
            <div
              class="border-border-default mb-2 flex flex-wrap gap-2 rounded-xl border border-dashed p-3"
            >
              <span
                v-for="(tag, index) in profile.hashtags"
                :key="index"
                class="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-red-50 hover:text-red-500"
                @click="removeTag(index)"
              >
                {{ tag }} ✕
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTagInput"
                type="text"
                placeholder="新增標籤..."
                class="border-border-default flex-1 rounded-xl border p-3"
                @keyup.enter="addTag"
              /><button
                class="rounded-xl px-5 font-bold text-white shadow-sm"
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

    <Transition name="fade">
      <div
        v-if="showDetail"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      >
        <div class="c-card animate-scale-up mt-10 w-full max-w-2xl p-8 shadow-2xl">
          <div v-if="selectedItem" class="space-y-6 text-left">
            <template v-if="selectedItem.type === 'post'">
              <img :src="selectedItem.img" class="h-80 w-full rounded-2xl object-cover shadow-sm" />
              <h2 class="text-2xl font-bold" :style="{ color: BRAND_ORANGE }">
                {{ selectedItem.title }}
              </h2>
              <p class="text-fg-secondary border-t pt-4 leading-relaxed">
                {{ selectedItem.content }}
              </p>
            </template>
            <template v-else-if="selectedItem.type === 'event'"
              ><h2 class="text-2xl font-bold" :style="{ color: BRAND_ORANGE }">
                {{ selectedItem.name }}
              </h2>
              <p class="text-fg-secondary border-t pt-4">{{ selectedItem.content }}</p></template
            >
            <template v-else-if="selectedItem.type === 'friend'"
              ><h2 class="text-2xl font-bold" :style="{ color: BRAND_ORANGE }">
                {{ selectedItem.name }}
              </h2>
              <p class="text-fg-secondary border-t pt-4">{{ selectedItem.content }}</p></template
            >
          </div>
          <button
            class="mt-8 w-full rounded-full py-4 font-bold text-white shadow-lg"
            :style="{ backgroundColor: BRAND_ORANGE }"
            @click="showDetail = false"
          >
            關閉
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes scale-up {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-scale-up {
  animation: scale-up 0.3s ease-out;
}
</style>
