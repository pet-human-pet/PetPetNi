<script setup>
import { ref, reactive, onUnmounted, onMounted, onBeforeUnmount } from 'vue'
import {
  profile as profileData,
  myPosts as myPostsData,
  savedPosts as savedPostsData,
  followersList,
  followingList,
  createdEvents,
  followedEvents,
  historyEvents
} from '@/utils/profileData.js'
import { useTagSelection } from '@/composables/useTagSelection.js'
import BackgroundGrid from '@/components/Share/BackgroundGrid.vue'
import PostCard from '@/components/Social/PostCard.vue'
import IconGear from '@/components/icons/IconGear.vue'
import TagSelector from '@/components/Share/TagSelector.vue'
import ImageCropper from '@/components/Share/ImageCropper.vue'
import ImagePreviewModal from '@/components/Share/ImagePreviewModal.vue'
import { useImagePreview } from '@/composables/useImagePreview'
import { getStatusBadge } from '@/utils/statusHelper'

const postTabs = [
  { id: 'my', label: '我的貼文', padding: 'px-6 md:px-10' },
  { id: 'saved', label: '儲存的貼文', padding: 'px-6 md:px-10' }
]

const eventTabs = [
  { id: 'create', label: '發起活動', padding: 'px-4 md:px-8' },
  { id: 'follow', label: '收藏活動', padding: 'px-4 md:px-8' },
  { id: 'history', label: '歷史活動', padding: 'px-4 md:px-8' }
]

// 統一的 Modal 樣式
const modalOverlayClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'

// 响应式帖子数据
const myPosts = ref(myPostsData)
const savedPosts = ref(savedPostsData)

// 基础 UI 状态
const activeTab = ref('posts')
const activeSubTab = ref('my')
const showDetail = ref(false)
const selectedItem = ref(null)
const fileInput = ref(null)
const isAboutVisible = ref(true)

// ImageCropper 状态
const showCropper = ref(false)
const tempImageSrc = ref('')

// 其他 Modal 状态
const showTagPicker = ref(false)
const showUserList = ref(false)
const userListTitle = ref('')
const currentUserList = ref([])

const profile = reactive(profileData)

// 标签选择
const {
  requiredSelections,
  optionalTags,
  maxOptionalTags,
  requiredCount,
  selectRequiredTag,
  toggleOptionalTag,
  removeOptionalTag,
  getSubmitData
} = useTagSelection(profile.hashtags)

const syncTagsToProfile = () => {
  const { requiredTags, optionalTags: optional } = getSubmitData()
  profile.hashtags = [...requiredTags, ...optional]
}

// 图片预览
const { previewOpen, previewImages, previewIndex, openPreview, closePreview } = useImagePreview()

// 贴文互动
const toggleLike = (postId) => {
  const posts = activeSubTab.value === 'my' ? myPosts.value : savedPosts.value
  const post = posts.find((p) => p.id === postId)
  if (!post) return
  post.isLiked = !post.isLiked
  post.likeCount += post.isLiked ? 1 : -1
}

const toggleBookmark = (postId) => {
  const posts = activeSubTab.value === 'my' ? myPosts.value : savedPosts.value
  const post = posts.find((p) => p.id === postId)
  if (!post) return
  post.isBookmarked = !post.isBookmarked
}

// 头像处理
const handleAvatarClick = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    tempImageSrc.value = URL.createObjectURL(file)
    showCropper.value = true
    e.target.value = ''
  }
}

const handleCropConfirm = (blob) => {
  if (profile.avatar?.startsWith('blob:')) {
    URL.revokeObjectURL(profile.avatar)
  }
  profile.avatar = URL.createObjectURL(blob)
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

// 其他 UI 交互
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

const handleTagConfirm = () => {
  syncTagsToProfile()
  showTagPicker.value = false
}

// 生命周期钩子
onMounted(() => {
  document.body.classList.add('md:overflow-hidden')
})

onBeforeUnmount(() => {
  document.body.classList.remove('md:overflow-hidden')
})

onUnmounted(() => {
  if (profile.avatar && profile.avatar.startsWith('blob:')) {
    URL.revokeObjectURL(profile.avatar)
  }
  if (tempImageSrc.value) {
    URL.revokeObjectURL(tempImageSrc.value)
  }
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
                    <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
                    <span
                      class="absolute -right-1 bottom-2.5 z-10 rounded-full border bg-white px-2 py-0.5 text-xs font-bold shadow-sm md:right-2 md:bottom-4 md:px-3 md:py-1 md:text-xs"
                      >已驗證</span
                    >
                  </div>
                  <div
                    class="hidden h-6 w-full items-end justify-center gap-1 pb-1 md:flex md:h-auto md:gap-2"
                  >
                    <span class="text-fg-muted max-w-20 truncate text-xs md:max-w-none md:text-lg">{{
                      profile.username
                    }}</span>
                    <button class="group shrink-0 cursor-pointer" @click="showTagPicker = true">
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
                  <div class="flex items-center justify-center gap-2 pb-2 text-center md:hidden">
                    <span class="text-fg-muted text-xs">{{ profile.username }}</span>
                    <button class="group shrink-0 cursor-pointer" @click="showTagPicker = true">
                      <!-- TODO: Replace hover:text-[#f48e31] with CSS variable -->
                      <IconGear
                        class="text-fg-muted h-3.5 w-3.5 transition-all group-hover:rotate-90 hover:text-[#f48e31]"
                      />
                    </button>
                  </div>
                  <div
                    class="flex items-start justify-between pt-0.5 text-center md:mb-6 md:flex-nowrap md:justify-center md:gap-10"
                  >
                    <div
                      class="group flex-1 cursor-pointer md:flex-none"
                      @click="openUserList('followers')"
                    >
                      <div class="relative">
                        <!-- TODO: Replace #f48e31 -->
                        <p class="text-lg font-bold text-[#f48e31] md:text-3xl">2</p>
                      </div>
                      <p class="text-fg-muted text-xs font-medium md:text-sm">粉絲</p>
                    </div>
                    <div class="flex flex-[1.5] justify-center md:flex-none">
                      <!-- TODO: Replace #f48e31 -->
                      <button
                        class="c-btn w-full max-w-20 truncate rounded-full border py-1 text-xs font-bold whitespace-nowrap transition-all md:w-auto md:max-w-none md:px-6 md:py-1.5 md:text-sm"
                        :class="[
                          isAboutVisible
                            ? 'border-[#f48e31] bg-[#f48e31] text-white'
                            : 'border-[#f48e31] text-[#f48e31]'
                        ]"
                        @click="isAboutVisible = !isAboutVisible"
                      >
                        關於我
                      </button>
                    </div>
                    <div
                      class="group flex-1 cursor-pointer md:flex-none"
                      @click="openUserList('following')"
                    >
                      <div class="relative">
                        <!-- TODO: Replace #f48e31 -->
                        <p class="text-lg font-bold text-[#f48e31] md:text-3xl">6</p>
                      </div>
                      <p class="text-fg-muted text-xs font-medium md:text-sm">追蹤中</p>
                    </div>
                  </div>
                  <Transition
                    enter-active-class="transition-opacity duration-300 ease-out transform-gpu"
                    leave-active-class="transition-opacity duration-300 ease-in transform-gpu"
                    enter-from-class="opacity-0 -translate-y-[10px]"
                    leave-to-class="opacity-0 -translate-y-[10px]"
                  >
                    <div
                      v-if="isAboutVisible"
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
                  </Transition>
                  <Transition name="fade">
                    <div
                      v-if="isAboutVisible"
                      class="flex w-full items-end border-t border-gray-50 pt-1 md:mt-6 md:pt-6"
                    >
                      <div
                        class="grid w-full grid-cols-3 items-center gap-0.5 text-center md:flex md:justify-around"
                      >
                        <div
                          class="flex flex-col items-center border-r border-gray-100 last:border-0 md:flex-1 md:border-0"
                        >
                          <span class="text-fg-muted mb-0.5 text-xs font-bold uppercase md:mb-1"
                            >品種</span
                          ><span
                            class="text-fg-secondary w-full truncate text-xs font-bold tracking-tighter md:text-sm"
                            >{{ profile.petInfo.breed }}</span
                          >
                        </div>
                        <div
                          class="flex flex-col items-center border-r border-gray-100 last:border-0 md:flex-1 md:border-0"
                        >
                          <span class="text-fg-muted mb-0.5 text-xs font-bold uppercase md:mb-1"
                            >生日</span
                          ><span
                            class="text-fg-secondary w-full truncate text-xs font-bold tracking-tighter md:text-sm"
                            >{{ profile.petInfo.birthday }}</span
                          >
                        </div>
                        <div class="flex flex-col items-center md:flex-1">
                          <span class="text-fg-muted mb-0.5 text-xs font-bold uppercase md:mb-1"
                            >性別</span
                          ><span
                            class="text-fg-secondary w-full truncate text-xs font-bold tracking-tighter md:text-sm"
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
            class="md:c-card flex h-full flex-col overflow-visible bg-transparent md:overflow-hidden md:rounded-2xl md:bg-white"
          >
            <div
              class="sticky top-(--header-h) z-30 flex-none border-b border-gray-100 bg-white md:static md:top-0 md:z-auto md:mx-0 md:rounded-t-3xl md:border-b-0 md:px-0"
            >
              <div class="flex shrink-0 justify-around px-4 pt-4 md:px-6">
                <button
                  v-for="tab in [
                    { id: 'posts', n: '貼文' },
                    { id: 'events', n: '活動' }
                  ]"
                  :key="tab.id"
                  class="relative w-full pb-3 text-center text-base font-bold md:pb-5 md:text-lg"
                  :class="{ 'text-[#f48e31]': activeTab === tab.id }"
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
                                :class="[tab.padding, activeSubTab === tab.id ? 'bg-[#f48e31] text-white' : 'bg-[#f3f4f6]']"
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
                                :class="[tab.padding, activeSubTab === tab.id ? 'bg-[#f48e31] text-white' : 'bg-[#f3f4f6]']"
                                @click="activeSubTab = tab.id"
                              >
                                {{ tab.label }}
                              </button>
                            </div>
                          </div>            </div>

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
                                  >                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <!-- Modals -->
      <Teleport to="body">
        <ImageCropper
          class="image-cropper-wrapper"
          :class="{ 'is-visible': showCropper }"
          :image-src="tempImageSrc"
          @confirm="handleCropConfirm" @cancel="handleCropCancel"
        />
      </Teleport>      <ImagePreviewModal
        v-model:index="previewIndex"
        :open="previewOpen"
        :images="previewImages"
        @close="closePreview"
      />

      <div
        v-if="showTagPicker"
        :class="modalOverlayClass"
        @click.self="showTagPicker = false"
      >
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
        ><div
          v-if="showUserList"
          :class="modalOverlayClass"
        >
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
        ><div
          v-if="showDetail"
          :class="modalOverlayClass"
        >
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
