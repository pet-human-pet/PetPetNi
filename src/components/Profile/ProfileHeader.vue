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
  }
})

const emit = defineEmits([
  'update:isAboutVisible',
  'open-tag-picker',
  'open-user-list',
  'update-avatar'
])

const fileInput = ref(null)

const handleAvatarClick = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  emit('update-avatar', e)
}

const toggleAbout = () => {
  emit('update:isAboutVisible', !props.isAboutVisible)
}
</script>

<template>
  <div class="flex h-auto flex-col">
    <div class="flex flex-row gap-4 md:flex-col md:gap-5">
      <!-- 左欄：頭像與名稱 (手機版置頂) -->
      <div class="flex shrink-0 flex-col items-center justify-start gap-2">
        <!-- 頭像容器 -->
        <div
          class="relative flex cursor-pointer items-center justify-center px-5"
          @click="handleAvatarClick"
        >
          <div
            class="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md md:h-36 md:w-36"
          >
            <img :src="profile.avatar" class="h-full w-full object-cover" alt="avatar" />
          </div>
          <!-- 已驗證標誌-->
          <span
            class="border-fg-muted/70 absolute -right-1 bottom-0 z-10 rounded-full border bg-white px-2 py-0.5 text-xs font-bold md:right-0 md:bottom-1 md:border-2 md:px-3 md:py-1 md:text-sm"
          >
            已驗證
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
          class="mb-3 flex w-full flex-wrap items-center justify-center gap-10 text-center md:mb-5 md:gap-10"
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
          <button
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
          <button
            class="text-fg-muted hover:text-brand-primary shrink-0 origin-center cursor-pointer items-center justify-center text-xl transition-transform duration-200 ease-out will-change-transform hover:rotate-90"
            type="button"
            @click="emit('open-tag-picker')"
          >
            <i class="fa-solid fa-gear leading-none"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 展開內容區 (獨立於左右欄之外) -->
    <transition name="fade-slide">
      <div
        v-if="isAboutVisible"
        class="u-no-tap-highlight mt-4 w-full"
        style="outline: none !important; -webkit-tap-highlight-color: transparent"
      >
        <div class="grid w-full grid-cols-2 gap-2 md:grid-cols-3 md:gap-2">
          <span
            v-for="tag in profile.hashtags"
            :key="tag"
            class="text-fg-muted truncate rounded-full bg-gray-100 px-2 py-1 text-center text-xs font-medium tracking-tighter"
            >{{ tag }}</span
          >
        </div>

        <div class="mt-3 w-full md:pt-3">
          <div class="grid w-full grid-cols-1 gap-2 md:gap-3">
            <div v-for="field in petInfoFields" :key="field.label" class="text-left">
              <div
                class="text-fg-muted mb-1 grid w-full grid-cols-[auto_1fr] items-center gap-3 text-sm font-semibold tracking-wide uppercase"
              >
                <div class="rounded-full bg-white px-3 py-1.5 text-center">
                  {{ field.label }}
                </div>
                <div class="text-fg-secondary flex min-h-8 items-center truncate text-left">
                  <span class="text-fg-muted block leading-tight">{{ field.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
