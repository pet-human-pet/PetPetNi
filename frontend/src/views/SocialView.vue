<script setup>
import PostComposer from '@/components/Social/PostComposer.vue'
import SocialFeed from '@/components/Social/SocialFeed.vue'
import { useToast } from '@/composables/useToast'
import { usePostStore } from '@/stores/usePostStore'

const postStore = usePostStore()
const { success } = useToast()

const handleSubmit = async (payload) => {
  try {
    await postStore.createPost(payload.content, payload.images, payload.audience)
    success('貼文已發布')
  } catch {
    // 錯誤已由 API interceptor 與 store 統一處理
  }
}
</script>

<template>
  <div class="bg-bg-base">
    <div class="min-h-screen">
      <main class="mx-auto w-full max-w-300 px-4 pb-16">
        <div class="pt-3">
          <PostComposer username="" @submit="handleSubmit" />
        </div>
        <SocialFeed />
      </main>
    </div>
  </div>
</template>
