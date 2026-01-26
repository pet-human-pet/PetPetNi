<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  userList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'view-profile'])

const modalOverlayClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" :class="modalOverlayClass" @click.self="emit('close')">
      <div class="c-card w-full max-w-md bg-white p-6 text-left">
        <div class="border-fg-muted/50 mb-6 flex items-center justify-between gap-5 border-b pb-4">
          <div class="flex items-center gap-5">
            <button class="c-btn-back text-2xl" @click="emit('close')">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <h2 class="text-btn-primary left-5 text-xl font-bold md:text-2xl">{{ title }}</h2>
          </div>
          <button
            class="text-fg-secondary/70 hover:text-fg-secondary cursor-pointer text-2xl"
            @click="emit('close')"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="scrollbar max-h-96 overflow-y-auto">
          <div v-if="userList.length === 0" class="text-fg-muted py-15 md:py-20 text-center">
            {{ title === '粉絲名單' ? '沒有追蹤者' : '沒有追蹤人' }}
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="user in userList"
              :key="user.id"
              class="hover:bg-brand-tertiary/20 border-brand-secondary bg-bg-base flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 text-left"
              @click="emit('view-profile', user.id)"
            >
              <div
                class="ring-brand-tertiary h-12 w-12 overflow-hidden rounded-full object-cover ring-2"
              >
                <img :src="user.avatar" />
              </div>
              <div class="flex-1">
                <p class="text-brand-primary font-bold">{{ user.name }}</p>
              </div>
              <button
                class="bg-btn-primary cursor-pointer rounded-full border-2 px-3 py-1.5 text-sm text-white md:px-4 md:py-2"
                @click="emit('view-profile', user.id)"
              >
                查看
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
