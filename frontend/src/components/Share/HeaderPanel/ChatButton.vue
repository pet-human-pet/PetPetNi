<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goChat() {
  router.push({ name: 'chat' })
}
</script>

<template>
  <button class="c-header-btn relative" title="訊息" type="button" @click="goChat">
    <i class="fa-regular fa-comment-dots"></i>
    <!-- TODO: 當有未讀訊息時顯示，目前為靜態顯示 -->
    <span class="bg-func-danger absolute top-1 md:top-2 md:right-2 right-1 h-2 w-2 rounded-full border border-white" />
  </button>
</template>
