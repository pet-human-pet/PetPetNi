<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  shareUrl: { type: String, default: '' },
  shareTitle: { type: String, default: '' },
  shareText: { type: String, default: '' },
  postId: { type: [String, Number], default: '' }
})

const emit = defineEmits(['share'])

const authStore = useAuthStore()
const isLoggedIn = computed(() => !!authStore.user)

const handleShare = async () => {
  const url = props.shareUrl || window.location.href
  const data = {
    title: props.shareTitle || document.title,
    text: props.shareText || '',
    url
  }
  // Web Share API 支援才用，不支援就 fallback
  if (navigator.share) {
    try {
      await navigator.share(data)
      return
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err)
    }
  }
  emit('share', { postId: props.postId, url })
}
</script>

<template>
  <div>
    <button
      type="button"
      class="action-btn flex cursor-pointer items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Share"
      :disabled="!isLoggedIn"
      @click="handleShare"
    >
      <span class="action-icon inline-flex items-center justify-center text-xl leading-none"
        ><i class="fa-solid fa-share"
      /></span>
    </button>
  </div>
</template>
