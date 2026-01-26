<script setup>
import { ref, onUnmounted, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useTagSelection } from '@/composables/useTagSelection.js'
import PostCard from '@/components/Social/PostCard.vue'
import TagSelector from '@/components/Share/TagSelector.vue'
import ImageCropper from '@/components/Share/ImageCropper.vue'
import ImagePreviewModal from '@/components/Share/ImagePreviewModal.vue'
import ConfirmDialog from '@/components/Share/ConfirmDialog.vue'
import ProfileHeader from '@/components/Profile/ProfileHeader.vue'
import FansListModal from '@/components/Profile/FansListModal.vue'
import EventListItem from '@/components/Profile/EventListItem.vue'
import { useImagePreview } from '@/composables/useImagePreview'
import { useImageUpload } from '@/composables/useImageUpload'
import { useToast } from '@/composables/useToast'
import { useEventMapStore } from '@/stores/EventMap'
import { useFavoritesStore } from '@/stores/favorites'
import { usePostStore } from '@/stores/usePostStore'
import { getStatusBadge } from '@/utils/statusHelper'
import defaultAvatar01 from '@/assets/images/avatar-cat.jpg'
import defaultAvatar02 from '@/assets/images/avatar-dog.jpg'
import { followApi } from '@/api/follow'
import { profileApi } from '@/api/profile'
import { useChatStore } from '@/stores/chat'

// Route
const route = useRoute()
const router = useRouter()

// Auth Store
const authStore = useAuthStore()
const { user, profile: userProfile, pet, tags } = storeToRefs(authStore)

// Chat Store
const chatStore = useChatStore()

// ==========================================
// 判斷是否為自己的頁面
// ==========================================
const targetUserIdInt = computed(() => {
  const param = route.params.userIdInt
  return param ? parseInt(param, 10) : null
})

const isOwnProfile = computed(() => {
  // 如果沒有路由參數，或路由參數等於當前用戶的 ID，就是自己的頁面
  if (!targetUserIdInt.value) return true
  return targetUserIdInt.value === userProfile.value?.user_id_int
})

// ==========================================
// 其他用戶資料（當查看他人頁面時）
// ==========================================
const otherUserData = ref(null)
const isFollowing = ref(false)
const isLoadingProfile = ref(false)
const isFollowLoading = ref(false)

// 取得其他用戶資料
const fetchOtherUserProfile = async (userIdInt) => {
  try {
    isLoadingProfile.value = true
    const profilePromise = followApi.getPublicProfile(userIdInt)
    // 追蹤狀態允許失敗
    const statusPromise = followApi.getFollowStatus(userIdInt).catch(() => {
      return { data: { data: { isFollowing: false } } }
    })
    // 載入該用戶的貼文
    const postsPromise = postStore.fetchPosts({ authorId: userIdInt })

    const [profileRes, statusRes] = await Promise.all([profilePromise, statusPromise, postsPromise])

    otherUserData.value = profileRes.data.data
    isFollowing.value = statusRes.data.data.isFollowing
  } catch (error) {
    // Silently fail or handle error UI
  } finally {
    isLoadingProfile.value = false
  }
}

// 追蹤/取消追蹤
const handleToggleFollow = async () => {
  if (!targetUserIdInt.value || isFollowLoading.value) return

  try {
    isFollowLoading.value = true

    if (isFollowing.value) {
      // 取消追蹤
      const res = await followApi.unfollowUser(targetUserIdInt.value)
      isFollowing.value = false
      // 更新對方的粉絲數
      if (otherUserData.value?.profile) {
        otherUserData.value.profile.followersCount = res.data.data.targetFollowersCount
      }
      // 更新自己的追蹤數
      myFollowingCount.value = res.data.data.myFollowingCount
    } else {
      // 追蹤
      const res = await followApi.followUser(targetUserIdInt.value)
      isFollowing.value = true
      // 更新對方的粉絲數
      if (otherUserData.value?.profile) {
        otherUserData.value.profile.followersCount = res.data.data.targetFollowersCount
      }
      // 更新自己的追蹤數
      myFollowingCount.value = res.data.data.myFollowingCount
    }
  } catch (error) {
    console.error('❌ 追蹤操作失敗:', error)
  } finally {
    isFollowLoading.value = false
  }
}

// 開始聊天
const handleStartChat = async () => {
  if (!targetUserIdInt.value || isLoadingProfile.value) return

  try {
    const result = await chatStore.startPrivateChat(targetUserIdInt.value)
    if (result.success) {
      router.push({ name: 'chat' })
    } else {
      showError(result.error || '無法開啟聊天室')
    }
  } catch (error) {
    showError('無法開啟聊天室')
  }
}

// 監聽路由變化
watch(
  [() => route.params.userIdInt, () => userProfile.value?.user_id_int],
  async ([newUserIdInt, myUserIdInt]) => {
    // 如果有路由參數，且不是自己的 ID
    if (newUserIdInt) {
      const targetId = parseInt(newUserIdInt, 10)
      if (myUserIdInt && targetId === myUserIdInt) {
        // 是自己的頁面
        otherUserData.value = null
        isFollowing.value = false
        // 確保載入自己的資料（如果之前是看別人的）
        await Promise.all([postStore.fetchPosts(), postStore.fetchBookmarkedPosts()])
      } else {
        // 他人頁面
        await fetchOtherUserProfile(targetId)
      }
    } else {
      // 沒有路由參數，是自己的頁面
      otherUserData.value = null
      isFollowing.value = false
      // 確保載入自己的資料
      await Promise.all([postStore.fetchPosts(), postStore.fetchBookmarkedPosts()])
    }
  },
  { immediate: true }
)

// Local Data
const followersList = ref([])
const followingList = ref([])
const myFollowersCount = ref(0)
const myFollowingCount = ref(0)

const eventTabs = [
  { id: 'create', label: '發起活動', padding: 'px-4 md:px-8' },
  { id: 'participated', label: '參加活動', padding: 'px-4 md:px-8' },
  { id: 'follow', label: '收藏活動', padding: 'px-4 md:px-8' },
  { id: 'history', label: '歷史活動', padding: 'px-4 md:px-8' }
]

const eventStore = useEventMapStore()
const favoritesStore = useFavoritesStore()
const postStore = usePostStore()
const { uploadToCloudinary, compressImage, getDynamicUrl } = useImageUpload()
const { error: showError, success: showSuccess, info: showInfo } = useToast()

const tempImageSrc = ref('')
const currentPublicId = ref('')
const showCropper = ref(false)

// Event data
const createdEvents = ref([])
const participatedEvents = ref([])
const followedEvents = computed(() => {
  return eventStore.events.filter((evt) => favoritesStore.has(evt.id))
})
const historyEvents = computed(() => {
  return createdEvents.value.filter((evt) => evt.status === 'ended')
})

// 根據當前選中的 tab 返回對應的活動列表
const currentEvents = computed(() => {
  const eventsMap = {
    create: createdEvents.value,
    participated: participatedEvents.value,
    follow: followedEvents.value,
    history: historyEvents.value
  }
  return eventsMap[activeSubTab.value] || []
})

const confirmDialogRef = ref(null)
const isDeleting = ref(false)

const fallbackAvatar = ref([defaultAvatar01, defaultAvatar02][Math.floor(Math.random() * 2)])

const modalOverlayClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'

const profileDisplay = computed(() => {
  // 如果是查看他人頁面
  if (!isOwnProfile.value) {
    // 資料尚未載入時的暫位顯示
    if (!otherUserData.value) {
      return {
        avatar: fallbackAvatar.value,
        name: '載入中...',
        username: '...',
        hashtags: [],
        followersCount: 0,
        followingCount: 0,
        petInfo: {
          breed: '...',
          birthday: '...',
          gender: '...'
        }
      }
    }

    // 資料已載入
    const otherProfile = otherUserData.value.profile
    const otherPet = otherUserData.value.pet

    return {
      avatar: otherProfile?.avatar_url || fallbackAvatar.value,
      name: otherProfile?.nick_name || '未知用戶',
      username: `@${otherProfile?.user_id_int || 'user'}`,
      role: otherProfile?.role || 'user',
      hashtags: otherUserData.value.tags || [],
      followersCount: otherProfile?.followersCount || 0,
      followingCount: otherProfile?.followingCount || 0,
      petInfo: {
        breed: otherPet?.breed || '未知',
        birthday: otherPet?.birthday || '未知',
        gender: otherPet?.gender || '未知'
      }
    }
  }

  // 自己的頁面
  if (!userProfile.value) return {}

  return {
    avatar: userProfile.value.avatar_url || fallbackAvatar.value,
    name: userProfile.value.nick_name || user.value?.email,
    username: `@${userProfile.value.user_id_int || 'user'}`,
    role: userProfile.value.role || 'user',
    hashtags: tags.value || [],
    followersCount: myFollowersCount.value,
    followingCount: myFollowingCount.value,
    petInfo: {
      breed: pet.value?.breed || '未知',
      birthday: pet.value?.birthday || '未知',
      gender: pet.value?.gender || '未知'
    }
  }
})

// 寵物資訊欄位
const petInfoFields = computed(() => [
  { label: '品種', value: profileDisplay.value.petInfo?.breed },
  { label: '生日', value: profileDisplay.value.petInfo?.birthday },
  { label: '性別', value: profileDisplay.value.petInfo?.gender }
])

const activeTab = ref('posts')
const activeSubTab = ref('my')
const showDetail = ref(false)
const selectedItem = ref(null)
const isAboutVisible = ref(true)

// 處理貼文分頁點擊
const handlePostTabClick = (tabId) => {
  activeSubTab.value = tabId
}

const showTagPicker = ref(false)
const showUserList = ref(false)
const userListTitle = ref('')
const userListType = ref('')
const currentUserList = computed(() =>
  userListType.value === 'followers'
    ? followersList.value
    : userListType.value === 'following'
      ? followingList.value
      : []
)

const {
  requiredSelections,
  optionalTags,
  maxOptionalTags,
  requiredCount,
  selectRequiredTag,
  toggleOptionalTag,
  removeOptionalTag,
  getSubmitData
} = useTagSelection(tags.value || []) // Initialize with current tags

const syncTagsToProfile = async () => {
  const { requiredTags, optionalTags: optional } = getSubmitData()
  const newTags = [...requiredTags, ...optional]

  try {
    // 更新 Store (雖然 fetchProfile 會更新，但立即更新可提升體驗嗎？最好等 API 回應)
    // tags.value = newTags

    // 呼叫 API 更新
    await profileApi.updateProfile({ optionalTags: newTags })

    // 重新載入 Profile 以更新 UI
    await authStore.fetchProfile()

    showSuccess('標籤設定已儲存')
  } catch (err) {
    showError('儲存失敗，請稍後再試')
  }
}

const { previewOpen, previewImages, previewIndex, openPreview, closePreview } = useImagePreview()

// 我的貼文 (從 postStore 取得當前用戶的貼文)
const myPosts = computed(() => {
  return postStore.postsWithAuth.filter((p) => p.isMine)
})

// 儲存的貼文 (從 postStore.bookmarkedPosts 取得已收藏的貼文)
const savedPosts = computed(() => {
  return postStore.bookmarkedPosts
})

// 根據當前情境決定要顯示的貼文列表
const displayedPosts = computed(() => {
  if (!isOwnProfile.value) {
    // 他人頁面：顯示所有從後端抓取的貼文（已用 authorId 篩選）
    return postStore.postsWithAuth
  }

  // 自己頁面：根據子分頁顯示
  return activeSubTab.value === 'my' ? myPosts.value : savedPosts.value
})

const postTabs = computed(() => {
  if (!isOwnProfile.value) {
    // 他人頁面只顯示「貼文」
    return [{ id: 'my', label: '貼文', padding: 'px-6 md:px-10' }]
  }
  return [
    { id: 'my', label: '我的貼文', padding: 'px-6 md:px-10' },
    { id: 'saved', label: '儲存的貼文', padding: 'px-6 md:px-10' }
  ]
})

// 按讚
const toggleLike = async (postId) => {
  try {
    const post = postStore.posts.find((p) => p.id === postId)
    if (!post) return
    await postStore.likePost(postId)
    if (post.isLiked) {
      showSuccess('已按讚')
    } else {
      showSuccess('已取消按讚')
    }
  } catch {
    showError('操作失敗')
  }
}

// 收藏
const toggleBookmark = async (postId) => {
  try {
    const post = postStore.posts.find((p) => p.id == postId)
    await postStore.bookmarkPost(postId)
    if (post && post.isBookmarked) {
      showSuccess('已收藏貼文')
    } else {
      showSuccess('已取消收藏')
    }
  } catch {
    showError('操作失敗')
  }
}

// 更新貼文
const handleUpdatePost = async ({ id, content, audience }) => {
  await postStore.updatePost(id, { content, audience })
  showSuccess('貼文已更新')
}

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    showInfo('正在準備圖片...')
    // 1. 壓縮原圖
    const { blob: compressedBlob } = await compressImage(file)

    // 2. 先上傳到 Cloudinary (原圖)
    showInfo('正在預傳送圖片...')
    const result = await uploadToCloudinary(compressedBlob, { folder: 'petpetni/avatars' })

    currentPublicId.value = result.publicId
    tempImageSrc.value = result.url // 使用原始網址供裁切器顯示
    showCropper.value = true

    e.target.value = ''
  } catch (err) {
    console.error('❌ 預傳圖片失敗:', err)
    showError(err.message || '圖片讀取失敗')
  }
}

const cleanupTempImage = () => {
  if (tempImageSrc.value) {
    URL.revokeObjectURL(tempImageSrc.value)
    tempImageSrc.value = ''
  }
}

const fetchMyFollowCounts = async () => {
  if (!userProfile.value?.user_id_int) return
  try {
    const res = await followApi.getFollowCounts(userProfile.value.user_id_int)
    myFollowersCount.value = res.data.data.followersCount
    myFollowingCount.value = res.data.data.followingCount
  } catch (error) {
    console.error('❌ 取得追蹤數失敗:', error)
    showError('取得追蹤數失敗，請稍後再試')
  }
}

const handleCropConfirm = async ({ coordinates }) => {
  showCropper.value = false
  showInfo('正在更新個人頭像...')

  try {
    // 1. 根據座標生成 Cloudinary 動態裁切網址
    const avatarUrl = getDynamicUrl(currentPublicId.value, coordinates)
    console.log('🔗 生成動態裁切網址:', avatarUrl)

    // 2. 呼叫 API 更新後端
    const response = await profileApi.updateProfile({ avatarUrl })
    console.log('📬 API 回應:', response.data)

    // 3. 重新載入自己的 Profile 以更新網頁顯示
    await authStore.fetchProfile()

    showSuccess('頭像已更新')
  } catch (err) {
    console.error('❌ 更新頭像失敗:', err)
    showError('更新頭像失敗，請稍後再試')
  } finally {
    cleanupTempImage()
  }
}
const handleCropCancel = () => {
  showCropper.value = false
  cleanupTempImage()
}

// 其他 UI 交互
const handleTabChange = (tab) => {
  activeTab.value = tab
  activeSubTab.value = tab === 'posts' ? 'my' : 'create'
}

const mapFollowUser = (user) => ({
  id: user.userIdInt,
  name: user.nickName,
  avatar: user.avatarUrl || defaultAvatar01
})

const fetchUserList = async (type) => {
  const userIdInt = isOwnProfile.value ? userProfile.value?.user_id_int : targetUserIdInt.value
  if (!userIdInt) return

  try {
    const res =
      type === 'followers'
        ? await followApi.getFollowersList(userIdInt)
        : await followApi.getFollowingList(userIdInt)
    const list = (res.data.data || []).map(mapFollowUser)

    if (type === 'followers') {
      followersList.value = list
    } else {
      followingList.value = list
    }
  } catch (error) {
    console.error('❌ 取得名單失敗:', error)
    showError('取得名單失敗，請稍後再試')
  } finally {
    // keep modal flow simple; no loading state for now
  }
}

const openUserList = async (type) => {
  await fetchUserList(type)
  userListTitle.value = type === 'followers' ? '粉絲名單' : '追蹤中名單'
  userListType.value = type
  showUserList.value = true
}

const handleViewProfile = (userIdInt) => {
  if (!userIdInt) return
  showUserList.value = false
  router.push({ name: 'Profile', params: { userIdInt } })
}

const openDetail = (item) => {
  selectedItem.value = item
  showDetail.value = true
}

const handleTagConfirm = async () => {
  await syncTagsToProfile()
  showTagPicker.value = false
}

const fetchMyEvents = async () => {
  try {
    const events = await eventStore.fetchMyEvents()
    createdEvents.value = events
  } catch (error) {
    // Error logged in store
  }
}

const fetchMyParticipatedEvents = async () => {
  try {
    const events = await eventStore.fetchMyParticipatedEvents()
    participatedEvents.value = events
  } catch (error) {
    // Error logged in store
  }
}

const openDeleteConfirm = async (event) => {
  const confirmed = await confirmDialogRef.value?.show({
    title: '確定要刪除此活動？',
    message: `刪除活動「${event.title}」後將無法復原，且所有參與者將失去此活動的資訊。`,
    type: 'danger',
    confirmText: '確認刪除',
    cancelText: '取消'
  })

  if (confirmed) {
    await confirmDeleteEvent(event)
  }
}

const confirmDeleteEvent = async (eventToDelete) => {
  if (isDeleting.value) return

  try {
    isDeleting.value = true
    await eventStore.deleteEvent(eventToDelete.id)

    const index = createdEvents.value.findIndex((e) => e.id === eventToDelete.id)
    if (index !== -1) {
      createdEvents.value.splice(index, 1)
    }
  } catch (error) {
    showError(error.message || '刪除活動失敗')
  } finally {
    isDeleting.value = false
  }
}

const handleLeaveEvent = async (event) => {
  const confirmed = await confirmDialogRef.value?.show({
    title: '確定要取消報名？',
    message: `確定要取消報名「${event.title}」嗎？`,
    type: 'danger',
    confirmText: '確認',
    cancelText: '取消'
  })

  if (!confirmed) return

  try {
    await eventStore.leaveEvent(event.id)

    const index = participatedEvents.value.findIndex((e) => e.id === event.id)
    if (index !== -1) {
      participatedEvents.value.splice(index, 1)
    }
  } catch (error) {
    showError(error.message || '取消報名失敗')
  }
}

onMounted(async () => {
  document.body.classList.add('md:overflow-hidden')

  // 載入貼文資料
  await postStore.fetchPosts()

  // 載入已收藏的貼文
  await postStore.fetchBookmarkedPosts()

  // 載入活動資料
  await fetchMyEvents()
  await fetchMyParticipatedEvents()
  await eventStore.fetchEvents()

  // 如果是查看自己的頁面，載入追蹤數據
  if (isOwnProfile.value) {
    await fetchMyFollowCounts()
  }
})

watch(
  [() => isOwnProfile.value, () => userProfile.value?.user_id_int],
  async ([isOwn, userIdInt]) => {
    if (isOwn && userIdInt) {
      await fetchMyFollowCounts()
    }
  }
)

onBeforeUnmount(() => {
  document.body.classList.remove('md:overflow-hidden')
})

onUnmounted(() => {
  if (userProfile.value?.avatar_url && userProfile.value.avatar_url.startsWith('blob:')) {
    URL.revokeObjectURL(userProfile.value.avatar_url)
  }
  if (tempImageSrc.value) {
    URL.revokeObjectURL(tempImageSrc.value)
  }
})
</script>

<template>
  <div>
    <div class="bg-bg-base text-fg-secondary">
      <main
        class="mx-auto min-h-[calc(100vh-var(--header-h))] w-full max-w-300 px-4 pt-4 pb-10 lg:h-[calc(100vh-var(--header-h))] lg:pb-10"
      >
        <div
          class="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)] md:gap-6 lg:h-full"
        >
          <!--左欄-->
          <div
            class="c-card bg-brand-tertiary/25 flex w-full min-w-0 shrink-0 flex-col md:h-[75vh] lg:h-full"
          >
            <ProfileHeader
              v-model:is-about-visible="isAboutVisible"
              :profile="profileDisplay"
              :pet-info-fields="petInfoFields"
              :is-own-profile="isOwnProfile"
              :is-following="isFollowing"
              :is-follow-loading="isFollowLoading"
              @open-tag-picker="showTagPicker = true"
              @open-user-list="openUserList"
              @update-avatar="handleFileChange"
              @toggle-follow="handleToggleFollow"
              @start-chat="handleStartChat"
              @back-to-my-profile="router.push({ name: 'Profile' })"
            />
          </div>

          <!--右欄-->
          <div class="c-card flex w-full min-w-0 flex-col md:h-[75vh] lg:h-full lg:min-h-0">
            <!-- 右欄內容 -->
            <div
              class="sticky top-(--header-h) z-30 flex-none md:static md:top-0 md:z-auto md:mx-0 md:rounded-t-3xl md:border-b-0 md:px-0"
            >
              <div class="text-fg-muted flex shrink-0 justify-around bg-white px-4 text-xl md:px-6">
                <button
                  v-for="tab in [
                    { id: 'posts', n: '貼文' },
                    { id: 'events', n: '活動' }
                  ]"
                  :key="tab.id"
                  class="group flex-1 cursor-pointer text-center text-base font-bold md:text-lg"
                  :class="{ 'text-btn-primary': activeTab === tab.id }"
                  @click="handleTabChange(tab.id)"
                >
                  <span
                    class="relative inline-flex w-full items-center justify-center rounded-full px-3 py-2 pb-3 transition-colors duration-200"
                  >
                    {{ tab.n }}
                    <span
                      v-if="activeTab === tab.id"
                      class="bg-btn-primary absolute right-3 bottom-0 left-3 h-1 md:h-1.5"
                    ></span>
                  </span>
                </button>
              </div>

              <div class="bg-white/90 px-4 py-2 pt-2 md:p-4">
                <div
                  v-if="activeTab === 'posts' && isOwnProfile"
                  class="flex justify-center gap-4 md:gap-6"
                >
                  <button
                    v-for="tab in postTabs"
                    :key="tab.id"
                    type="button"
                    class="c-btn text-md cursor-pointer rounded-xl py-2 font-bold shadow-sm md:py-2.5 md:text-sm"
                    :class="[
                      tab.padding,
                      activeSubTab === tab.id ? 'bg-btn-primary text-white' : 'bg-white'
                    ]"
                    @click="handlePostTabClick(tab.id)"
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
                    class="c-btn text-md cursor-pointer rounded-xl py-2 font-bold shadow-sm md:py-2.5 md:text-sm"
                    :class="[
                      tab.padding,
                      activeSubTab === tab.id ? 'bg-btn-primary text-white' : 'bg-white'
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
                <!-- 貼文列表 -->
                <PostCard
                  v-for="post in displayedPosts"
                  :key="post.id"
                  :post="post"
                  @like="toggleLike"
                  @bookmark="toggleBookmark"
                  @preview-image="openPreview"
                  @update="handleUpdatePost"
                />

                <!-- 空狀態提示 -->
                <div
                  v-if="
                    (activeSubTab === 'my' && myPosts.length === 0) ||
                    (activeSubTab === 'saved' && savedPosts.length === 0)
                  "
                  class="text-fg-muted py-10 text-center"
                >
                  <i class="fa-solid fa-image mb-2 text-4xl opacity-30"></i>
                  <p>{{ activeSubTab === 'my' ? '尚未發布任何貼文' : '尚未儲存任何貼文' }}</p>
                </div>
              </div>
              <div v-if="activeTab === 'events'" class="grid gap-4 pb-10 md:gap-5">
                <EventListItem
                  v-for="event in currentEvents"
                  :key="event.id"
                  :event="event"
                  :location-name="eventStore.baseLocations[event.locId]?.name"
                  :show-delete="activeSubTab === 'create'"
                  :show-leave="activeSubTab === 'participated'"
                  @click="openDetail"
                  @delete="openDeleteConfirm"
                  @leave="handleLeaveEvent"
                />

                <!-- 空狀態提示 -->
                <div
                  v-if="
                    (activeSubTab === 'create' && createdEvents.length === 0) ||
                    (activeSubTab === 'participated' && participatedEvents.length === 0) ||
                    (activeSubTab === 'follow' && followedEvents.length === 0) ||
                    (activeSubTab === 'history' && historyEvents.length === 0)
                  "
                  class="text-fg-muted py-10 text-center"
                >
                  <i class="fa-solid fa-calendar-xmark mb-2 text-4xl opacity-30"></i>
                  <p>
                    {{
                      activeSubTab === 'create'
                        ? '尚未發起任何活動'
                        : activeSubTab === 'participated'
                          ? '尚未參加任何活動'
                          : activeSubTab === 'follow'
                            ? '尚未收藏任何活動'
                            : '尚無歷史活動'
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Modals -->
      <div>
        <ImageCropper
          v-if="showCropper"
          :key="tempImageSrc"
          class="image-cropper-wrapper"
          :image-src="tempImageSrc"
          @confirm="handleCropConfirm"
          @cancel="handleCropCancel"
        />
        <ConfirmDialog ref="confirmDialogRef" />
      </div>

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
                class="bg-btn-primary flex-1 rounded-xl py-3 font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                @click="handleTagConfirm"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <FansListModal
        :visible="showUserList"
        :title="userListTitle"
        :user-list="currentUserList"
        :list-type="userListType"
        @view-profile="handleViewProfile"
        @close="showUserList = false"
      />

      <Transition name="fade"
        ><div v-if="showDetail" :class="modalOverlayClass">
          <div class="c-card w-full max-w-2xl bg-white p-8 text-left">
            <div v-if="selectedItem" class="space-y-6 text-left">
              <div class="flex items-start justify-between gap-4">
                <h2 class="text-brand-primary text-left text-3xl font-bold">
                  {{ selectedItem.title || selectedItem.name }}
                </h2>
                <span
                  v-if="selectedItem.status"
                  class="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
                  :class="getStatusBadge(selectedItem.status).cls"
                >
                  {{ getStatusBadge(selectedItem.status).text }}
                </span>
              </div>

              <div v-if="selectedItem.locId" class="text-fg-muted flex items-center gap-2">
                <i class="fa-solid fa-location-dot"></i>
                <span>{{ eventStore.baseLocations[selectedItem.locId]?.name || '未知地點' }}</span>
              </div>

              <div v-if="selectedItem.startAt" class="text-fg-muted flex items-center gap-2">
                <i class="fa-solid fa-clock"></i>
                <span>{{ new Date(selectedItem.startAt).toLocaleString('zh-TW') }}</span>
              </div>

              <div v-if="selectedItem.capacity" class="text-fg-muted flex items-center gap-2">
                <i class="fa-solid fa-users"></i>
                <span
                  >{{ selectedItem.participantsCount || 0 }}/{{ selectedItem.capacity }} 人</span
                >
              </div>

              <div v-if="selectedItem.contact" class="text-fg-muted flex items-center gap-2">
                <i class="fa-solid fa-phone"></i>
                <span>{{ selectedItem.contact }}</span>
              </div>

              <div class="text-fg-secondary border-t pt-6 text-left text-lg leading-relaxed">
                {{ selectedItem.desc || selectedItem.content }}
              </div>
            </div>
            <button
              class="bg-btn-primary hover:bg-btn-primary-dark mt-10 w-full cursor-pointer rounded-full py-4 font-bold text-white shadow-lg"
              @click="showDetail = false"
            >
              關閉視窗
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
