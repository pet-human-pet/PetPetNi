<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  myPosts as myPostsData,
  savedPosts as savedPostsData,
  followersList,
  createdEvents,
  followedEvents,
  historyEvents
} from '@/utils/profileData.js'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/auth'
import { useTagSelection } from '@/composables/useTagSelection.js'
import { useToast } from '@/composables/useToast'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import PostCard from '@/components/Social/PostCard.vue'
import IconGear from '@/components/icons/IconGear.vue'
import TagSelector from '@/components/Share/TagSelector.vue'
import ImageCropper from '@/components/Share/ImageCropper.vue'
import ImagePreviewModal from '@/components/Share/ImagePreviewModal.vue'
import { useImagePreview } from '@/composables/useImagePreview'
import { getStatusBadge } from '@/utils/statusHelper'

// 1. 初始化資料源
const profileStore = useProfileStore()
const authStore = useAuthStore()
const toast = useToast()
const route = useRoute()

// 2. 定義核心響應式對象
const profileId = computed(() => String(route.params.id || '1'))
const isLoggedIn = computed(() => !!authStore.user)

// 權限檢查工具
const requireAuth = (callback) => {
  if (!isLoggedIn.value) {
    toast.info('請先登入後再進行操作')
    return
  }
  callback()
}

const profile = computed(() => {
  return profileStore.getProfileById(profileId.value)
})

const isMe = computed(() => profileId.value === '1')

// 寵物資訊欄位
const petInfoFields = computed(() => [
  { label: '品種', value: profile.value.petInfo?.breed || '未知' },
  { label: '生日', value: profile.value.petInfo?.birthday || '未知' },
  { label: '性別', value: profile.value.petInfo?.gender || '未知' }
])

// 3. UI 狀態
const activeTab = ref('posts')
const activeSubTab = ref('my')
const showDetail = ref(false)
const selectedItem = ref(null)
const fileInput = ref(null)
const showCropper = ref(false)
const tempImageSrc = ref('')
const showTagPicker = ref(false)
const showUserList = ref(false)
const userListTitle = ref('')

const myPosts = ref(myPostsData)
const savedPosts = ref(savedPostsData)

const postTabs = [
  { id: 'my', label: '我的貼文', padding: 'px-6 md:px-10' },
  { id: 'saved', label: '儲存的貼文', padding: 'px-6 md:px-10' }
]

const eventTabs = [
  { id: 'create', label: '發起活動', padding: 'px-4 md:px-8' },
  { id: 'follow', label: '收藏活動', padding: 'px-4 md:px-8' },
  { id: 'history', label: '歷史活動', padding: 'px-4 md:px-8' }
]

// 4. 標籤管理
const {
  requiredSelections,
  optionalTags,
  maxOptionalTags,
  requiredCount,
  selectRequiredTag,
  toggleOptionalTag,
  removeOptionalTag,
  getSubmitData
} = useTagSelection(profile.value.hashtags || [])

const syncTagsToProfile = () => {
  const { requiredTags, optionalTags: optional } = getSubmitData()
  profile.value.hashtags = [...requiredTags, ...optional]
}

const handleTagConfirm = () => {
  syncTagsToProfile()
  showTagPicker.value = false
}

const handleOpenTagPicker = () => {
  requireAuth(() => {
    showTagPicker.value = true
  })
}

// 5. 互動與業務邏輯
const toggleFollow = () => {
  requireAuth(() => {
    profileStore.toggleFollow(profileId.value)
  })
}

const toggleLike = (postId) => {
  requireAuth(() => {
    const posts = activeSubTab.value === 'my' ? myPosts.value : savedPosts.value
    const post = posts.find((p) => p.id === postId)
    if (!post) return
    post.isLiked = !post.isLiked
    post.likeCount += post.isLiked ? 1 : -1
  })
}

const toggleBookmark = (postId) => {
  requireAuth(() => {
    const posts = activeSubTab.value === 'my' ? myPosts.value : savedPosts.value
    const postIndex = posts.findIndex((p) => p.id === postId)
    if (postIndex === -1) return
    const post = posts[postIndex]
    post.isBookmarked = !post.isBookmarked
    if (!post.isBookmarked && activeSubTab.value === 'saved') {
      posts.splice(postIndex, 1)
    }
  })
}

const handleUpdatePost = ({ id, content, audience }) => {
  requireAuth(() => {
    const updateArr = (arr) => {
      const idx = arr.findIndex((p) => p.id === id)
      if (idx !== -1) {
        arr[idx].content = content
        arr[idx].audience = audience
      }
    }
    updateArr(myPosts.value)
    updateArr(savedPosts.value)
  })
}

// 6. 頭像與名單處理
const handleAvatarClick = () => {
  requireAuth(() => {
    fileInput.value?.click()
  })
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (tempImageSrc.value) URL.revokeObjectURL(tempImageSrc.value)
    tempImageSrc.value = URL.createObjectURL(file)
    showCropper.value = true
    e.target.value = ''
  }
}

const handleCropConfirm = (blob) => {
  if (profile.value.avatar?.startsWith('blob:')) URL.revokeObjectURL(profile.value.avatar)
  profile.value.avatar = URL.createObjectURL(blob)
  showCropper.value = false
  if (tempImageSrc.value) {
    URL.revokeObjectURL(tempImageSrc.value)
    tempImageSrc.value = ''
  }
}

const handleCropCancel = () => {
  showCropper.value = false
  if (tempImageSrc.value) {
    URL.revokeObjectURL(tempImageSrc.value)
    tempImageSrc.value = ''
  }
}

const modalOverlayClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'

const activeUserListType = ref('followers')
const currentUserList = computed(() => {
  if (activeUserListType.value === 'followers') return followersList
  return profileStore.state.myFollowingList
})

const openUserList = (type) => {
  activeUserListType.value = type
  userListTitle.value = type === 'followers' ? '粉絲名單' : '追蹤中名單'
  showUserList.value = true
}

const openDetail = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  activeSubTab.value = tab === 'posts' ? 'my' : 'create'
}

const { previewOpen, previewImages, previewIndex, openPreview, closePreview } = useImagePreview()

// 7. 生命週期與清理
onMounted(() => document.body.classList.add('md:overflow-hidden'))

onBeforeUnmount(() => {
  document.body.classList.remove('md:overflow-hidden')
  // 釋放記憶體中的 Blob URL
  if (profile.value?.avatar?.startsWith('blob:')) URL.revokeObjectURL(profile.value.avatar)
  if (tempImageSrc.value) URL.revokeObjectURL(tempImageSrc.value)
})
</script>

<template>
  <div>
    <div
      class="bg-bg-base custom-scrollbar relative flex w-full flex-col text-left font-sans md:h-screen md:overflow-y-auto md:py-6"
    >
      <BackgroundGrid />

      <div
        class="mx-auto flex w-full max-w-7xl flex-1 justify-center overflow-visible pt-6 pb-6 md:overflow-hidden md:pb-24"
      >
        <div
          class="border-border-default/20 flex h-full w-full flex-col items-stretch overflow-visible rounded-3xl border bg-white text-left shadow-sm md:grid md:grid-cols-[1.2fr_2fr] md:gap-10 md:overflow-hidden md:border-none md:bg-transparent md:shadow-none"
        >
          <aside
            class="md:c-card flex h-auto shrink-0 flex-col bg-transparent md:h-full md:overflow-hidden md:rounded-2xl md:border-none md:bg-white md:p-0 md:shadow-none"
          >
            <div class="custom-scrollbar flex h-auto flex-col p-4 md:h-full md:p-8">
              <div
                class="flex flex-row items-stretch gap-2 border-b border-gray-100 pb-2 md:mb-8 md:flex-col md:items-center md:gap-0 md:border-b-0 md:pb-0"
              >
                <div
                  class="flex w-1/3 min-w-24 shrink-0 flex-col items-center justify-between md:w-full"
                >
                  <h1
                    class="w-full truncate pt-1 text-center text-lg leading-tight font-bold text-[#f48e31] md:text-3xl"
                  >
                    <!-- TODO: Replace #f48e31 with var(--brand-orange) -->
                    {{ profile.name }}
                  </h1>
                  <div
                    class="group relative flex flex-1 cursor-pointer items-center justify-center py-1 md:py-4"
                    @click="handleAvatarClick"
                  >
                    <div
                      class="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md md:h-44 md:w-44"
                    >
                      <img :src="profile.avatar" class="h-full w-full object-cover" />
                    </div>
                    <input
                      ref="fileInput"
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="handleFileChange"
                    />
                    <span
                      class="absolute -right-1 bottom-2.5 z-10 rounded-full border bg-white px-2 py-0.5 text-xs font-bold shadow-sm md:right-2 md:bottom-4 md:px-3 md:py-1 md:text-xs"
                      >{{ profile.role === 'owner' ? '飼主' : '一般會員' }}</span
                    >
                  </div>
                  <div
                    v-if="profile.role === 'owner' && isMe"
                    class="hidden h-6 w-full items-end justify-center gap-1 pb-1 md:flex md:h-auto md:gap-2"
                  >
                    <button class="group shrink-0 cursor-pointer" @click="handleOpenTagPicker">
                      <!-- TODO: Replace hover:text-[#f48e31] with CSS variable -->
                      <IconGear
                        class="text-fg-muted h-3.5 w-3.5 transition-all group-hover:rotate-90 hover:text-[#f48e31] md:h-6 md:w-6"
                      />
                    </button>
                  </div>
                </div>
                <div class="mx-1 h-auto w-px self-stretch bg-gray-100 md:hidden"></div>
                <div
                  class="flex w-full min-w-0 flex-1 flex-col justify-between md:block md:w-auto md:gap-0"
                >
                  <div
                    v-if="profile.role === 'owner' && isMe"
                    class="flex items-center justify-center gap-2 pb-2 text-center md:hidden"
                  >
                    <button class="group shrink-0 cursor-pointer" @click="handleOpenTagPicker">
                      <!-- TODO: Replace hover:text-[#f48e31] with CSS variable -->
                      <IconGear
                        class="text-fg-muted h-3.5 w-3.5 transition-all group-hover:rotate-90 hover:text-[#f48e31]"
                      />
                    </button>
                  </div>
                  <div
                    class="flex items-start justify-between pt-0.5 text-center md:mb-6 md:flex-nowrap md:justify-center md:gap-8 lg:gap-10"
                  >
                    <div
                      class="group flex-1 cursor-pointer md:flex-none"
                      @click="openUserList('followers')"
                    >
                      <div class="relative">
                        <!-- TODO: Replace #f48e31 -->
                        <p class="text-lg font-bold text-[#f48e31] md:text-3xl">
                          {{ profile.followersCount }}
                        </p>
                      </div>
                      <p class="text-fg-muted text-xs font-medium md:text-sm">粉絲</p>
                    </div>

                    <!-- 追蹤按鈕：僅在他人主頁顯示 -->
                    <div v-if="!isMe" class="flex flex-1 items-center justify-center px-2">
                      <button
                        class="c-btn h-8 w-full min-w-20 rounded-full px-4 text-xs font-bold transition-all md:h-10 md:min-w-24 md:text-sm"
                        :class="
                          profile.isFollowed
                            ? 'text-fg-secondary bg-gray-100 hover:bg-gray-200'
                            : 'bg-[#f48e31] text-white hover:bg-[#e07d2c]'
                        "
                        @click="toggleFollow"
                      >
                        {{ profile.isFollowed ? '追蹤中' : '追蹤' }}
                      </button>
                    </div>

                    <div
                      class="group flex-1 cursor-pointer md:flex-none"
                      @click="openUserList('following')"
                    >
                      <div class="relative">
                        <!-- TODO: Replace #f48e31 -->
                        <p class="text-lg font-bold text-[#f48e31] md:text-3xl">
                          {{ profile.followingCount }}
                        </p>
                      </div>
                      <p class="text-fg-muted text-xs font-medium md:text-sm">追蹤中</p>
                    </div>
                  </div>
                  <!-- 一般會員 (cloud) 專用簡介區塊 (塊狀化設計) -->
                  <div
                    v-if="profile.role === 'cloud'"
                    class="flex flex-col gap-5 border-t border-gray-100 pt-6 md:mt-8 md:items-center md:pt-8"
                  >
                    <div class="flex w-full flex-col gap-2 md:max-w-[280px]">
                      <h3
                        class="text-fg-muted pl-1 text-[10px] font-black tracking-widest uppercase md:text-center"
                      >
                        個人簡介
                      </h3>
                      <div class="bg-bg-base/60 rounded-2xl border border-black/5 p-4 shadow-xs">
                        <p class="text-fg-secondary text-left text-sm leading-relaxed font-medium">
                          {{ profile.bio }}
                        </p>
                      </div>
                    </div>

                    <div class="text-fg-muted/50 flex items-center gap-1.5">
                      <span class="text-[10px] font-black tracking-tight uppercase">
                        加入日期：{{ profile.joinDate }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="profile.role === 'owner'"
                    class="my-1 flex w-full flex-1 items-center md:my-0 md:block md:flex-none"
                  >
                    <div
                      class="grid h-14 w-full grid-cols-3 content-center gap-1 overflow-hidden md:h-auto md:gap-2"
                    >
                      <span
                        v-for="tag in profile.hashtags"
                        :key="tag"
                        class="text-fg-muted truncate rounded-full bg-gray-100 px-1 py-1 text-center text-xs font-medium tracking-tighter md:px-2 md:py-1 md:text-xs"
                        >{{ tag }}</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="profile.role === 'owner'"
                    class="flex w-full items-end border-t border-gray-50 pt-1 md:mt-6 md:pt-6"
                  >
                    <div
                      class="grid w-full grid-cols-3 items-center gap-0.5 text-center md:flex md:justify-around"
                    >
                      <div
                        v-for="field in petInfoFields"
                        :key="field.label"
                        class="flex flex-col items-center border-r border-gray-100 last:border-0 md:flex-1 md:border-0"
                      >
                        <span class="text-fg-muted mb-0.5 text-xs font-bold uppercase md:mb-1">{{
                          field.label
                        }}</span
                        ><span
                          class="text-fg-secondary w-full truncate text-xs font-bold tracking-tighter md:text-sm"
                          >{{ field.value }}</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main
            class="md:c-card flex h-full flex-col overflow-visible bg-transparent md:overflow-hidden md:rounded-2xl md:bg-white"
          >
            <div
              class="sticky top-(--header-h) z-30 flex-none border-b border-gray-100 bg-white md:static md:top-0 md:z-auto md:mx-0 md:rounded-t-3xl md:border-b-0 md:px-0"
            >
              <div
                class="flex shrink-0 px-4 pt-4 md:px-6"
                :class="profile.role === 'owner' ? 'justify-around' : 'justify-center'"
              >
                <button
                  v-for="tab in profile.role === 'owner'
                    ? [
                        { id: 'posts', n: '貼文' },
                        { id: 'events', n: '活動' }
                      ]
                    : [{ id: 'posts', n: '貼文' }]"
                  :key="tab.id"
                  class="relative pb-3 text-center text-base font-bold md:pb-5 md:text-lg"
                  :class="[
                    profile.role === 'owner' ? 'w-full' : 'w-1/3',
                    { 'text-[#f48e31]': activeTab === tab.id }
                  ]"
                  @click="handleTabChange(tab.id)"
                >
                  {{ tab.n }}
                  <!-- TODO: Replace #f48e31 -->
                  <div
                    v-if="activeTab === tab.id"
                    class="absolute bottom-0 h-1 w-full rounded-t-full bg-[#f48e31] md:h-1.5"
                  ></div>
                </button>
              </div>

              <div class="px-4 py-4 md:px-6">
                <div v-if="activeTab === 'posts'" class="flex justify-center gap-4 md:gap-6">
                  <button
                    v-for="tab in postTabs"
                    :key="tab.id"
                    class="c-btn rounded-xl py-2 text-xs font-bold shadow-sm md:py-2.5 md:text-sm"
                    :class="[
                      tab.padding,
                      activeSubTab === tab.id ? 'bg-[#f48e31] text-white' : 'bg-[#f3f4f6]'
                    ]"
                    @click="activeSubTab = tab.id"
                  >
                    {{ tab.label }}
                  </button>
                </div>
                <div
                  v-if="activeTab === 'events'"
                  class="flex flex-wrap justify-center gap-2 md:gap-4"
                >
                  <button
                    v-for="tab in eventTabs"
                    :key="tab.id"
                    class="c-btn rounded-xl py-2 text-xs font-bold shadow-sm md:py-2.5 md:text-sm"
                    :class="[
                      tab.padding,
                      activeSubTab === tab.id ? 'bg-[#f48e31] text-white' : 'bg-[#f3f4f6]'
                    ]"
                    @click="activeSubTab = tab.id"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </div>
            </div>

            <div
              class="custom-scrollbar h-full flex-1 overflow-y-auto bg-transparent p-4 pb-20 md:p-8 md:pb-8"
            >
              <div
                v-if="activeTab === 'posts'"
                class="mx-auto max-w-xl space-y-4 pb-10 text-left md:space-y-6"
              >
                <PostCard
                  v-for="post in activeSubTab === 'my' ? myPosts : savedPosts"
                  :key="post.id"
                  :post="post"
                  @like="toggleLike"
                  @bookmark="toggleBookmark"
                  @preview-image="openPreview"
                  @update="handleUpdatePost"
                />
              </div>
              <div v-if="activeTab === 'events'" class="grid gap-4 pb-10 md:gap-5">
                <div
                  v-for="event in activeSubTab === 'create'
                    ? createdEvents
                    : activeSubTab === 'follow'
                      ? followedEvents
                      : historyEvents"
                  :key="event.id"
                  class="border-border-default flex cursor-pointer items-center justify-between rounded-3xl border bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-6"
                  @click="openDetail(event)"
                >
                  <div class="flex-1 text-left">
                    <h4 class="text-fg-primary text-base font-bold md:text-lg">{{ event.name }}</h4>
                    <p class="text-fg-muted text-xs md:text-sm">{{ event.location }}</p>
                  </div>
                  <!-- TODO: Replace #f48e31 -->
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    :class="getStatusBadge(event.status).cls"
                    >{{ getStatusBadge(event.status).text }}</span
                  >
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <!-- Modals -->
      <Teleport to="body">
        <ImageCropper
          :key="tempImageSrc"
          class="image-cropper-wrapper"
          :class="{ 'is-visible': showCropper }"
          :image-src="tempImageSrc"
          @confirm="handleCropConfirm"
          @cancel="handleCropCancel"
        />
      </Teleport>
      <ImagePreviewModal
        v-model:index="previewIndex"
        :open="previewOpen"
        :images="previewImages"
        @close="closePreview"
      />

      <div v-if="showTagPicker" :class="modalOverlayClass" @click.self="showTagPicker = false">
        <!-- 卡片容器 -->
        <div
          class="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl md:h-[85vh]"
        >
          <!-- 標題區（固定） -->
          <div class="shrink-0 border-b border-gray-200 p-4 md:p-6">
            <h3 class="text-center text-xl font-bold">編輯標籤</h3>
          </div>

          <!-- 內容區（可滾動） -->
          <div class="flex-1 overflow-y-auto p-4 md:p-6">
            <TagSelector
              :required-selections="requiredSelections"
              :optional-tags="optionalTags"
              :max-optional-tags="maxOptionalTags"
              :required-count="requiredCount"
              title=""
              :show-required="true"
              :show-confirm-button="false"
              @select-required="selectRequiredTag"
              @toggle-optional="toggleOptionalTag"
              @remove-optional="removeOptionalTag"
            />
          </div>

          <!-- 按鈕區（固定） -->
          <div class="shrink-0 border-t border-gray-200 p-4 md:p-6">
            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-xl border-2 border-gray-300 bg-white py-3 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
                @click="showTagPicker = false"
              >
                取消
              </button>
              <button
                type="button"
                class="flex-1 rounded-xl bg-orange-400 py-3 font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                @click="handleTagConfirm"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
      <Transition name="fade"
        ><div v-if="showUserList" :class="modalOverlayClass">
          <div class="c-card w-full max-w-md bg-white p-8 text-left">
            <div class="mb-6 flex items-center justify-between border-b pb-4">
              <!-- TODO: Replace #f48e31 -->
              <h2 class="text-2xl font-bold text-[#f48e31]">{{ userListTitle }}</h2>
              <button class="text-2xl" @click="showUserList = false">✕</button>
            </div>
            <div class="custom-scrollbar max-h-96 space-y-4 overflow-y-auto px-6 py-4">
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
                  <!-- TODO: Replace #f48e31 above -->
                  查看
                </button>
              </div>
            </div>
            <button
              class="mt-8 w-full rounded-full bg-[#f48e31] py-4 font-bold text-white shadow-lg"
              @click="showUserList = false"
            >
              <!-- TODO: Replace #f48e31 above -->
              返回
            </button>
          </div>
        </div></Transition
      >
      <Transition name="fade"
        ><div v-if="showDetail" :class="modalOverlayClass">
          <div class="c-card w-full max-w-2xl bg-white p-8 text-left">
            <div v-if="selectedItem" class="space-y-6 text-left">
              <h2 class="text-left text-3xl font-bold text-[#f48e31]">
                <!-- TODO: Replace #f48e31 -->
                {{ selectedItem.name }}
              </h2>
              <div class="text-fg-secondary border-t pt-6 text-left text-lg leading-relaxed">
                {{ selectedItem.content }}
              </div>
            </div>
            <button
              class="mt-10 w-full rounded-full bg-[#f48e31] py-4 font-bold text-white shadow-lg"
              @click="showDetail = false"
            >
              <!-- TODO: Replace #f48e31 -->
              關閉視窗
            </button>
          </div>
        </div></Transition
      >
    </div>
  </div>
</template>

<style scoped>
/* 將原有的滾動條樣式修改為只作用於 .custom-scrollbar 類別，並確保其作用範圍在 ProfileView.vue 內部 */
.custom-scrollbar::-webkit-scrollbar {
  width: 12px;
  height: 12px;
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

<style>
/* Global styles for Teleported ImageCropper */
.image-cropper-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.image-cropper-wrapper.is-visible {
  opacity: 1;
  pointer-events: auto;
}
</style>
