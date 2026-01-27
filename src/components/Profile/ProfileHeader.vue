<script setup>
import { ref } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  },
  isAboutVisible: {
    type: Boolean,
    default: true
  },
  petInfoFields: {
    type: Array,
    required: true
  },
  isOwnProfile: {
    type: Boolean,
    default: true
  },
  isFollowing: {
    type: Boolean,
    default: false
  },
  isFollowLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:isAboutVisible',
  'open-tag-picker',
  'open-user-list',
  'update-avatar',
  'toggle-follow',
  'back-to-my-profile',
  'start-chat'
])

const fileInput = ref(null)

const handleAvatarClick = () => {
  if (props.isOwnProfile) {
    fileInput.value.click()
  }
}

const handleFileChange = (e) => {
  emit('update-avatar', e)
}

const toggleAbout = () => {
  emit('update:isAboutVisible', !props.isAboutVisible)
}

const handleFollowClick = () => {
  emit('toggle-follow')
}
</script>

<template>
  <div class="flex h-auto flex-col">
    <div class="flex flex-row gap-4 md:flex-col md:gap-3">
      <!-- 左欄：頭像與名稱 (手機版置頂) -->
      <div class="relative flex shrink-0 flex-col items-center justify-start gap-2">
        <!-- 返回我的頁面按鈕（只有他人頁面顯示） -->
        <button
          v-if="!isOwnProfile"
          class="c-btn-back absolute -top-2 -left-1 z-10 text-xl hover:-translate-x-1 md:left-0 md:text-2xl"
          type="button"
          title="返回我的個人頁面"
          @click="emit('back-to-my-profile')"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>

        <!-- 頭像容器 -->
        <div
          class="relative flex cursor-pointer items-center justify-center px-5"
          @click="handleAvatarClick"
        >
          <div
            class="relative h-20 w-20 overflow-hidden rounded-full border-3 border-white shadow-md md:h-36 md:w-36 md:border-4"
          >
            <img :src="profile.avatar" class="h-full w-full object-cover" alt="avatar" />
          </div>
          <!-- 身份標籤 -->
          <span
            v-if="profile.role === 'owner'"
            class="border-btn-primary text-brand-primary absolute -right-1 bottom-0 z-10 rounded-full border bg-white px-2 py-0.5 text-xs font-bold md:right-0 md:bottom-1 md:border-2 md:px-3 md:py-1 md:text-sm"
          >
            已驗證
          </span>
          <span
            v-else
            class="border-fg-muted/70 text-fg-muted absolute -right-1 bottom-0 z-10 rounded-full border bg-white px-2 py-0.5 text-xs font-bold md:right-0 md:bottom-1 md:border-2 md:px-3 md:py-1 md:text-sm"
          >
            一般會員
          </span>
        </div>
        <!-- 隱藏的文件輸入 -->
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleFileChange"
        />
        <!-- 用戶名稱 -->
        <span
          class="text-brand-primary flex justify-end gap-4 text-center text-lg leading-tight font-bold md:text-2xl"
        >
          {{ profile.name }}
        </span>
      </div>

      <!-- 右欄：粉絲 + 關於我按鈕 -->
      <div class="flex flex-1 flex-col items-center justify-end md:w-full">
        <div
          class="mb-6 flex w-full flex-wrap items-center justify-center gap-10 text-center md:mb-5 md:gap-10"
        >
          <div class="group cursor-pointer" @click="emit('open-user-list', 'followers')">
            <p class="text-brand-primary text-2xl font-bold md:text-3xl">
              {{ profile.followersCount ?? 0 }}
            </p>
            <p class="text-fg-muted text-md font-medium md:text-sm">粉絲</p>
          </div>
          <div class="group cursor-pointer" @click="emit('open-user-list', 'following')">
            <p class="text-brand-primary text-2xl font-bold md:text-3xl">
              {{ profile.followingCount ?? 0 }}
            </p>
            <p class="text-fg-muted text-md font-medium md:text-sm">追蹤中</p>
          </div>
        </div>

        <div class="flex justify-center gap-5 md:gap-2">
          <!-- 自己的頁面且身分為屋主：顯示「關於我」按鈕 -->
          <button
            v-if="isOwnProfile && profile.role === 'owner'"
            class="c-btn text-md w-full max-w-28 cursor-pointer truncate rounded-full border py-1 font-bold whitespace-nowrap transition-colors outline-none select-none focus:outline-none focus-visible:outline-none md:w-auto md:px-6 md:py-1.5 md:text-sm"
            :class="[
              isAboutVisible
                ? 'border-brand-primary bg-brand-primary border-2 text-white'
                : 'border-brand-primary text-brand-primary border-2'
            ]"
            @click="toggleAbout"
          >
            關於我
          </button>

          <!-- 他人頁面：顯示「追蹤」按鈕 -->
          <button
            v-else-if="!isOwnProfile"
            class="c-btn text-md w-full max-w-28 cursor-pointer truncate rounded-full border py-1 font-bold whitespace-nowrap transition-all outline-none select-none focus:outline-none focus-visible:outline-none md:w-auto md:px-6 md:py-1.5 md:text-sm"
            :class="[
              isFollowing
                ? 'border-2 border-gray-300 bg-gray-100 text-gray-600'
                : 'border-brand-primary bg-brand-primary border-2 text-white'
            ]"
            :disabled="isFollowLoading"
            @click="handleFollowClick"
          >
            <span v-if="isFollowLoading" class="inline-flex items-center gap-1">
              <i class="fa-solid fa-spinner fa-spin text-xs"></i>
            </span>
            <span v-else>{{ isFollowing ? '已追蹤' : '追蹤' }}</span>
          </button>

          <!-- 聊天按鈕 (Chat Button) -->
          <button
            v-if="!isOwnProfile"
            class="c-btn text-md text-fg-muted w-full max-w-28 cursor-pointer truncate rounded-full bg-white py-1 font-bold whitespace-nowrap transition-all outline-none select-none hover:bg-gray-50 focus:outline-none focus-visible:outline-none md:w-auto md:px-6 md:py-1.5 md:text-sm"
            type="button"
            @click="emit('start-chat')"
          >
            聊天
          </button>

          <!-- 設定按鈕（只有身分為屋主且是自己的頁面顯示） -->
          <button
            v-if="isOwnProfile && profile.role === 'owner'"
            class="text-fg-muted hover:text-brand-primary shrink-0 origin-center cursor-pointer items-center justify-center text-xl transition-transform duration-200 ease-out will-change-transform hover:rotate-90"
            type="button"
            @click="emit('open-tag-picker')"
          >
            <i class="fa-solid fa-gear leading-none"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 展開內容區 (僅在身分為屋主時顯示) -->
    <transition name="fade-slide">
      <div
        v-if="profile.role === 'owner' && (isAboutVisible || !isOwnProfile)"
        class="u-no-tap-highlight mt-4 w-full md:mt-10"
        style="outline: none !important; -webkit-tap-highlight-color: transparent"
      >
        <!-- 寵物基本資訊：行動版置中，桌機版還原偏移位置 (優化 960px 空間) -->
        <div class="flex w-full flex-col items-center md:items-start md:pl-6 lg:pl-12">
          <div class="flex w-full max-w-[280px] flex-col gap-2 md:max-w-none md:gap-1">
            <div v-for="field in petInfoFields" :key="field.label">
              <div
                class="text-fg-muted mb-1 flex items-center gap-3 text-sm font-semibold tracking-wide uppercase md:gap-4"
              >
                <div class="w-16 shrink-0 rounded-full bg-white py-1.5 text-center md:w-18 lg:w-20">
                  {{ field.label }}
                </div>
                <div class="text-fg-secondary flex min-h-8 items-center truncate text-left">
                  <span class="text-fg-muted block leading-tight">{{ field.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 標籤雲：同樣保持置中重心 -->
        <div class="mt-8 flex w-full justify-center md:mt-12">
          <div class="grid w-full max-w-sm grid-cols-2 gap-2 md:grid-cols-3 md:gap-4">
            <span
              v-for="tag in profile.hashtags"
              :key="tag"
              class="text-fg-muted md:text-md truncate rounded-full bg-white px-2 py-1 text-center text-xs font-medium tracking-tighter"
              >{{ tag }}</span
            >
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
