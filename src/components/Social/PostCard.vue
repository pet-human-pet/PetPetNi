<script setup>
defineProps({
  post: { type: Object, required: true },
})

defineEmits(['edit', 'preview-image'])
</script>

<template>
  <div class="rounded-2xl border bg-white p-4 md:p-6">
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-full bg-zinc-200"></div>
        <div class="text-m font-semibold">{{ post.author }}</div>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="post.isMine"
          type="button"
          class="grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-100"
          aria-label="Edit"
          @click="$emit('edit', post.id)"
        >
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button
          class="grid h-9 w-9 place-items-center rounded-lg hover:bg-zinc-100"
          aria-label="More"
        >
          <i class="fa-solid fa-ellipsis"></i>
        </button>
      </div>
    </div>

    <p class="mt-3 sm:text-base md:text-lg leading-6 text-zinc-800">
      {{ post.content }}
      <span v-if="post.ellipsis" class="text-zinc-500"> …</span>
    </p>

    <!-- hashtags -->
    <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-1">
      <a
        v-for="(t, i) in post.tags"
        :key="i"
        class="text-lg sm:text-base px-1 text-blue-700 cursor-pointer"
      >
        {{ t }}
      </a>
    </div>

    <!-- 單張圖片 -->
    <div
      v-if="post.images?.length === 1"
      class="mt-3 w-3/5 overflow-hidden rounded-xl bg-zinc-200 aspect-3/4 sm:aspect-3/4"
    >
      <img
        :src="post.images[0]"
        alt=""
        class="h-full w-full object-cover cursor-pointer"
        @click="$emit('preview-image', post.images[0])"
      />
    </div>
    <!-- 兩張圖片 -->
    <div v-else-if="post.images?.length === 2" class="mt-3 grid grid-cols-2 gap-3">
      <div
        v-for="(img, i) in post.images"
        :key="i"
        class="w-full overflow-hidden rounded-xl bg-zinc-200 aspect-3/4"
      >
        <img
          :src="img"
          alt=""
          class="h-full w-full object-cover cursor-pointer"
          @click="$emit('preview-image', img)"
        />
      </div>
    </div>

    <!-- actions -->
    <div class="mt-4 flex items-center justify-between">
      <div class="flex items-center gap-6 text-zinc-800">
        <button class="flex items-center gap-2">
          <span class="text-xl"> <i class="fa-solid fa-paw"></i></span>
          <span class="text-sm">{{ post.likeCount }}</span>
        </button>
        <button class="flex items-center gap-2">
          <span class="text-xl"> <i class="fa-solid fa-comment"></i></span>
          <span class="text-sm">{{ post.commentCount }}</span>
        </button>
        <button class="flex items-center gap-2">
          <span class="text-xl"><i class="fa-solid fa-share"></i></span>
        </button>
      </div>

      <button class="grid place-items-center cursor-pointer">
        <span class="text-xl"> <i class="fa-regular fa-bookmark"></i></span>
      </button>
    </div>
  </div>
</template>
