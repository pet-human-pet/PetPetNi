<script setup>
import ActionBar from './PostCard/ActionBar.vue'
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  post: { type: Object, required: true }
})

const emit = defineEmits([
  'edit',
  'update',
  'preview-image',
  'like',
  'open-comments',
  'share',
  'bookmark'
])

const isEditing = ref(false)
const editContent = ref('')
const editTextareaRef = ref(null)

const autoResizeEdit = () => {
  const el = editTextareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

const startEdit = async () => {
  isEditing.value = true
  editContent.value = props.post.content

  await nextTick()
  autoResizeEdit()
  editTextareaRef.value?.focus()
}

watch(editContent, () => {
  autoResizeEdit()
})

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

const saveEdit = () => {
  if (!editContent.value.trim()) return
  emit('update', { id: props.post.id, content: editContent.value })
  isEditing.value = false
}
</script>

<template>
  <body>
    <div class="c-card p-5 md:p-6">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
          <a class="text-m cursor-pointer font-semibold text-blue-800">{{ post.author }}</a>
        </div>

        <div class="flex items-center gap-2">
          <!--貼文編輯-->
          <button
            v-if="post.isMine"
            type="button"
            class="grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-100 cursor-pointer"
            aria-label="Edit"
            @click="startEdit"
          >
            <i class="fa-regular fa-pen-to-square"></i>
          </button>

          <!--更多按鈕-->
          <button
            class="grid h-9 w-9 place-items-center rounded-lg cursor-pointer hover:bg-zinc-100"
            aria-label="More"
          >
            <i class="fa-solid fa-ellipsis"></i>
          </button>
        </div>
      </div>

      <div v-if="isEditing" class="mt-3">
        <textarea
          ref="editTextareaRef"
          v-model="editContent"
          class="w-full resize-none bg-transparent text-base leading-6 outline-none"
          rows="3"
        ></textarea>
        <div class="mt-2 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
            @click="cancelEdit"
          >
            取消
          </button>
          <button
            type="button"
            class="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700"
            @click="saveEdit"
          >
            更新
          </button>
        </div>
      </div>
      <p v-else class="md:text-m mt-3 leading-6 text-zinc-800 sm:text-base">
        {{ post.content }}
      </p>

      <!-- hashtags -->
      <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1">
        <a
          v-for="(t, i) in post.tags"
          :key="i"
          class="cursor-pointer px-1 text-lg text-blue-700 sm:text-base"
        >
          {{ t }}
        </a>
      </div>

      <!-- 單張圖片 -->
      <div
        v-if="post.images?.length === 1"
        class="mt-3 aspect-3/4 w-3/5 overflow-hidden rounded-xl bg-zinc-200 sm:aspect-3/4"
      >
        <img
          :src="post.images[0]"
          alt=""
          class="h-full w-full cursor-pointer object-cover"
          @click="$emit('preview-image', post.images[0])"
        />
      </div>

      <!-- 兩張圖片 -->
      <div v-else-if="post.images?.length === 2" class="mt-3 grid grid-cols-2 gap-3">
        <div
          v-for="(img, i) in post.images"
          :key="i"
          class="aspect-3/4 w-full overflow-hidden rounded-xl bg-zinc-200"
        >
          <img
            :src="img"
            alt=""
            class="h-full w-full cursor-pointer object-cover"
            @click="$emit('preview-image', img)"
          />
        </div>
      </div>

      <!-- actions: 只 emit-->
      <ActionBar
        :post-id="post.id"
        :like-count="post.likeCount"
        :comment-count="post.commentCount"
        :is-liked="post.isLiked"
        :is-bookmarked="post.isBookmarked"
        @like="$emit('like', $event)"
        @open-comments="$emit('open-comments', $event)"
        @share="$emit('share', $event)"
        @bookmark="$emit('bookmark', $event)"
      />
    </div>
  </body>
</template>
