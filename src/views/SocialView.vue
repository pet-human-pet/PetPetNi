<script setup>
import { ref } from 'vue'
import SocialHeader from '@/components/Social/SocialHeader.vue'
import PostComposer from '@/components/Social/PostComposer.vue'
import PostCard from '@/components/Social/PostCard.vue'

const posts = ref([
  {
    id: 1,
    author: 'test',
    content:
      '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，請勿當作正式文案。五十個字隱藏',
    isMine: true,
    ellipsis: true,
    tags: ['#狗', '#柯基', '#日常生活'],
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSum7FwfWAYG3LAVpmMG9e_y3H_u57BstJ5Tg&s',
    ],
    likeCount: 120,
    commentCount: 12,
  },
  {
    id: 2,
    author: 'test',
    content:
      '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，請勿當作正式文案。',
    isMine: false,
    ellipsis: false,
    tags: ['#貓', '#奴才日常'],
    images: ['https://media.tenor.com/uKayqry3x90AAAAM/goofy-funny-cat.gif'],
    likeCount: 120,
    commentCount: 12,
  },
  {
    id: 3,
    author: 'test',
    content: '這是一段用於版面配置的示意文字，主要用來模擬實際內容呈現時的視覺效果，五十個字隱藏',
    ellipsis: true,
    tags: [],
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn4pPgkiCwbIXkTfSgfhp4BMEjVOJXJItR1FkRMuWplvtUZo4yzGtfKgC1Dqyi7R9lM3Y&usqp=CAU',
      'https://tiptopk9.com/nitropack_static/CQBMbUdUxEdJwDWnlMCaRSOixvBddFgB/assets/images/optimized/rev-dcdf01d/tiptopk9.com/wp-content/uploads/hilarious-chihuahua-dog-meme.jpeg',
    ],
    likeCount: 120,
    commentCount: 12,
  },
])

const handleSubmit = (payload) => {
  posts.value.unshift({
    id: Date.now(),
    author: 'myaccount',
    content: payload.content,
    isMine: true,
    ellipsis: payload.content.length > 50,
    tags: ['#hashtag'],
    images: payload.images ?? [],
    likeCount: 0,
    commentCount: 0,
  })
}

const editOpen = ref(false)
const editingId = ref(null)
const editContent = ref('')

const openEdit = (id) => {
  const target = posts.value.find((p) => p.id === id)
  if (!target) return
  editingId.value = id
  editContent.value = target.content
  editOpen.value = true
}

const closeEdit = () => {
  editOpen.value = false
  editingId.value = null
  editContent.value = ''
}

const saveEdit = () => {
  const target = posts.value.find((p) => p.id === editingId.value)
  if (!target) return
  target.content = editContent.value
  target.ellipsis = editContent.value.length > 50
  closeEdit()
}

const previewOpen = ref(false)
const previewSrc = ref('')
const openPreview = (src) => {
  previewSrc.value = src
  previewOpen.value = true
}

const closePreview = () => {
  previewOpen.value = false
  previewSrc.value = ''
}
</script>

<template>
  <header>
    <SocialHeader />
  </header>
  <div class="min-h-screen bg-white mx-10">
    <main class="mx-auto w-full max-w-260 px-4 pb-16">
      <PostComposer username="qwer123" @submit="handleSubmit" />

      <!-- 手機/平板：單欄 -->
      <section class="mt-4 space-y-4 lg:hidden">
        <PostCard
          v-for="p in posts"
          :key="p.id"
          :post="p"
          @edit="openEdit"
          @preview-image="openPreview"
        />
      </section>

      <!-- 桌機：雙欄 -->
      <section class="mt-6 hidden lg:grid grid-cols-2 gap-6 items-start">
        <PostCard
          v-for="p in posts"
          :key="p.id"
          :post="p"
          @edit="openEdit"
          @preview-image="openPreview"
        />
      </section>

      <!-- loading -->
      <div class="grid place-items-center py-10 text-zinc-500">
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent"
        ></div>
      </div>
    </main>
  </div>
  <div v-if="editOpen" class="fixed inset-0 z-100">
    <div class="absolute inset-0 bg-black/60" @click="closeEdit"></div>

    <div class="relative mx-auto flex h-full max-w-130 items-center p-4">
      <section class="w-full rounded-2xl bg-white p-4 shadow-lg">
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold">編輯貼文</div>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-full hover:bg-zinc-100"
            @click="closeEdit"
          >
            ×
          </button>
        </div>

        <textarea
          v-model="editContent"
          class="mt-3 w-full resize-none rounded-xl border p-3 text-sm outline-none"
          rows="4"
          maxlength="500"
        />

        <div class="mt-3 flex justify-end gap-2">
          <button type="button" class="rounded-lg border px-4 py-2 text-sm" @click="closeEdit">
            取消
          </button>
          <button
            type="button"
            class="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white"
            @click="saveEdit"
          >
            儲存
          </button>
        </div>
      </section>
    </div>
  </div>

  <!-- 圖片預覽遮罩（最小版本） -->
  <div v-if="previewOpen" class="fixed inset-0 z-100">
    <div class="absolute inset-0 bg-black/70" @click="closePreview"></div>

    <div class="relative mx-auto flex h-full max-w-180 items-center justify-center p-4">
      <img :src="previewSrc" alt="" class="max-h-[85vh] w-full rounded-2xl object-contain" />

      <button
        type="button"
        class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90"
        @click="closePreview"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  </div>
</template>
