<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ActionBar from './PostCard/ActionBar.vue'
import AudiencePicker from './AudiencePicker.vue'
import CommentSection from './CommentSection.vue'
import { useReport } from '@/composables/useReport'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { onClickOutside } from '@vueuse/core'

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
  'close-comments',
  'delete',
  'comment-added',
  'comment-deleted'
])

const router = useRouter()
const toProfile = () => {
  // 如果有 authorIdInt，導向該用戶的個人頁面
  if (props.post.authorIdInt) {
    router.push({ name: 'Profile', params: { userIdInt: props.post.authorIdInt } })
  } else {
    // 備用：導向自己的個人頁面
    router.push({ name: 'Profile' })
  }
}

const isEditing = ref(false)
const editContent = ref('')
const editImages = ref([])
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
  editImages.value = [...(props.post.images || [])]
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
  editImages.value = []
  editAudience.value = 'public'
}

const saveEdit = () => {
  const normalizedContent = editContent.value.trim().replace(/\n\s*\n+/g, '\n\n')
  const hasContent = normalizedContent.length > 0
  const hasImages = editImages.value.length > 0

  if (!hasContent && !hasImages) return
  emit('update', {
    id: props.post.id,
    content: normalizedContent,
    audience: editAudience.value,
    images: editImages.value
  })
  isEditing.value = false
}

const editAudience = ref('public')

const shareUrl = computed(() => `${window.location.origin}/post/${props.post.id}`)

const { showReport } = useReport()
const { success } = useToast()
const { showConfirm } = useConfirm()

const showMenu = ref(false)
const menuRef = ref(null)

onClickOutside(menuRef, () => {
  showMenu.value = false
})

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleReport = async () => {
  showMenu.value = false
  const result = await showReport()
  if (result.confirmed) {
    success('檢舉已送出，我們會盡快審核')
  }
}

const handleDelete = async () => {
  showMenu.value = false
  const confirmed = await showConfirm({
    title: '刪除貼文？',
    message: '刪除這則貼文後，即無法恢復顯示。',
    confirmText: '刪除',
    cancelText: '取消',
    type: 'danger'
  })

  if (confirmed) {
    emit('delete', props.post.id)
  }
}

const removeEditImage = (index) => {
  editImages.value.splice(index, 1)
}
</script>

<template>
  <div
    class="c-card relative w-full min-w-0 p-5 transition-colors duration-500 md:p-6"
    :class="post.isNew ? 'bg-yellow-50/40 ring-2 ring-yellow-200' : 'bg-white ring-0'"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-1">
        <div class="flex cursor-pointer items-center gap-3" @click="toProfile">
          <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
          <a class="cursor-pointer text-sm font-semibold text-blue-800">{{ post.author }}</a>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-zinc-500">·</span>

          <!-- 編輯中：顯示 Picker -->
          <AudiencePicker v-if="isEditing" v-model="editAudience" />

          <!-- 非編輯：只顯示目前 audience -->
          <span v-else class="text-xs text-zinc-500 md:text-sm">
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
          class="text-fg-secondary/70 grid h-9 w-9 cursor-pointer place-items-center rounded-lg hover:bg-zinc-100"
          aria-label="Edit"
          @click="startEdit"
        >
          <i class="fa-regular fa-pen-to-square"></i>
        </button>

        <!--更多按鈕 (Kebab Menu)-->
        <div ref="menuRef" class="relative">
          <button
            class="text-fg-secondary/70 grid h-9 w-9 cursor-pointer place-items-center rounded-lg hover:bg-zinc-100"
            aria-label="More"
            @click="toggleMenu"
          >
            <i class="fa-solid fa-ellipsis"></i>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showMenu"
            class="absolute top-full right-0 z-10 mt-1 w-32 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
          >
            <div class="flex flex-col py-1">
              <template v-if="post.isMine">
                <button
                  class="text-func-danger flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm font-medium hover:bg-red-50"
                  @click="handleDelete"
                >
                  <i class="fa-regular fa-trash-can"></i>
                  刪除貼文
                </button>
              </template>
              <template v-else>
                <button
                  class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  @click="handleReport"
                >
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  檢舉貼文
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isEditing" class="mt-3">
      <textarea
        ref="editTextareaRef"
        v-model="editContent"
        class="w-full resize-none bg-transparent text-base leading-6 outline-none"
        rows="1"
      ></textarea>

      <!-- 編輯時的圖片列表 -->
      <div v-if="editImages.length > 0" class="mt-2 flex flex-wrap gap-2">
        <div
          v-for="(img, idx) in editImages"
          :key="img + idx"
          class="relative aspect-square w-[80%] overflow-hidden rounded-lg border border-zinc-200"
        >
          <img :src="img" class="h-full w-full object-cover" />
          <button
            type="button"
            class="absolute top-2 right-2 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-black/50 text-sm font-bold text-white hover:bg-black/70"
            @click="removeEditImage(idx)"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div class="mt-2 flex justify-end gap-2">
        <button
          type="button"
          class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
          @click="cancelEdit"
        >
          取消
        </button>
        <button
          type="button"
          class="bg-btn-primary hover:bg-btn-primary-dark cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
          @click="saveEdit"
        >
          更新
        </button>
      </div>
    </div>
    <p
      v-else
      class="md:text-m text-fg-secondary mt-3 leading-6 wrap-break-word whitespace-pre-wrap sm:text-base"
    >
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

    <div v-if="post.images?.length && !isEditing" class="mt-3 min-w-0">
      <div
        class="flex w-full min-w-0 snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
      >
        <div
          v-for="(img, i) in post.images"
          :key="img + i"
          class="aspect-square w-4/5 shrink-0 snap-center overflow-hidden rounded-xl border border-gray-100 bg-zinc-200 transition-all duration-300"
        >
          <img
            :src="img"
            alt=""
            class="h-full w-full cursor-pointer object-cover"
            @click="$emit('preview-image', { images: post.images, index: i })"
          />
        </div>
      </div>
    </div>

    <!-- actions: 只 emit-->
    <ActionBar
      :post-id="post.id"
      :like-count="post.likeCount"
      :comment-count="post.commentCount"
      :is-liked="post.isLiked"
      :is-bookmarked="post.isBookmarked"
      :share-url="shareUrl"
      :share-title="`來看看${post.author}的貼文`"
      :share-text="post.content"
      @like="$emit('like', $event)"
      @open-comments="$emit('open-comments', $event)"
      @share="$emit('share', $event)"
      @bookmark="$emit('bookmark', $event)"
    />

    <!-- 留言區塊 -->
    <CommentSection
      v-if="showComments"
      :post="post"
      @close="$emit('close-comments')"
      @add-comment="$emit('comment-added', post.id)"
      @delete-comment="$emit('comment-deleted', post.id)"
    />
  </div>
</template>
