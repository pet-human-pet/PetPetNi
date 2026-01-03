<script setup>
import ActionBar from './PostCard/ActionBar.vue'
import { ref, watch, nextTick } from 'vue'
import AudiencePicker from './AudiencePicker.vue'
import { useRouter } from 'vue-router'
import CommentSection from './CommentSection.vue'

const props = defineProps({
  post: { type: Object, required: true },
  showComments: { type: Boolean, default: false }
})

const emit = defineEmits([
  'edit',
  'update',
  'preview-image',
  'like',
  'open-comments',
  'share',
  'bookmark',
  'close-comments'
])

const router = useRouter()
const toProfile = () => router.push({ path: '/profile' })

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
  editAudience.value = props.post.audience || 'public'

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
  editAudience.value = 'public'
}

const saveEdit = () => {
  if (!editContent.value.trim()) return
  emit('update', {
    id: props.post.id,
    content: editContent.value,
    audience: editAudience.value
  })
  isEditing.value = false
}

const editAudience = ref('public')

// 圖片大小設定
const fitMap = ref({})
const aspectMap = ref({})

const getImgKey = (postId, index) => `${postId}-${index}`
const hasLandscape = ref(false)

const onImgLoad = (e, key) => {
  const img = e.target
  if (!img) return
  if (img.naturalWidth > img.naturalHeight) {
    hasLandscape.value = true
  }
  const isLandscape = img.naturalWidth > img.naturalHeight
  if (isLandscape) {
    aspectMap.value[key] = 'aspect-square'
  } else {
    aspectMap.value[key] = 'aspect-3/4'
  }
  fitMap.value[key] = 'cover'
}
</script>

<template>
  <div
    class="c-card w-full min-w-0 p-5 transition-colors duration-500 md:p-6"
    :class="post.isNew ? 'bg-yellow-50/40 ring-2 ring-yellow-200' : 'bg-white ring-0'"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="flex cursor-pointer items-center gap-3" @click="toProfile">
          <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
          <a class="text-m cursor-pointer font-semibold text-blue-800">{{ post.author }}</a>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-zinc-500">·</span>

          <!-- 編輯中：顯示 Picker -->
          <AudiencePicker v-if="isEditing" v-model="editAudience" />

          <!-- 非編輯：只顯示目前 audience -->
          <span v-else class="text-xs text-zinc-500">
            {{
              post.audience === 'public'
                ? '🌐 所有人'
                : post.audience === 'friends'
                  ? '👥 好友'
                  : '🔒 只限自己'
            }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!--貼文編輯-->
        <button
          v-if="post.isMine"
          type="button"
          class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg hover:bg-zinc-100"
          aria-label="Edit"
          @click="startEdit"
        >
          <i class="fa-regular fa-pen-to-square"></i>
        </button>

        <!--更多按鈕-->
        <button
          class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg hover:bg-zinc-100"
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
        class="cursor-pointer px-1 text-sm text-blue-700 sm:text-base"
      >
        {{ t }}
      </a>
    </div>

    <div v-if="post.images?.length" class="mt-3 min-w-0">
      <div
        class="flex w-full min-w-0 snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
      >
        <div
          v-for="(img, i) in post.images"
          :key="img + i"
          class="trnsition-all w-4/5 shrink-0 snap-start overflow-hidden rounded-xl border border-gray-100 bg-zinc-200 duration-300 md:w-4/5"
          :class="hasLandscape ? 'aspect-square' : 'aspect-3/4'"
        >
          <img
            :src="img"
            alt=""
            class="h-full w-full cursor-pointer object-cover"
            @load="onImgLoad"
            @click="$emit('preview-image', { images: post.images, index: i })"
          />
        </div>
      </div>
    </div>

    <!-- actions: 只 emit-->
    <ActionBar
      :post-id="post.id"
      :like-count="post.likeCount"
      :is-liked="post.isLiked"
      :is-bookmarked="post.isBookmarked"
      @like="$emit('like', $event)"
      @open-comments="$emit('open-comments', $event)"
      @share="$emit('share', $event)"
      @bookmark="$emit('bookmark', $event)"
    />

    <!-- 留言區塊 -->
    <CommentSection v-if="showComments" :post="post" @close="$emit('close-comments')" />
  </div>
</template>
