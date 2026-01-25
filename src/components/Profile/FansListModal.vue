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

const emit = defineEmits(['close'])

const modalOverlayClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'
</script>

<template>
  <Transition name="fade">
    <div v-if="visible" :class="modalOverlayClass" @click.self="emit('close')">
      <div class="c-card w-full max-w-md bg-white p-8 text-left">
        <div class="mb-6 flex items-center justify-between border-b pb-4">
          <h2 class="text-btn-primary text-2xl font-bold">{{ title }}</h2>
          <button class="cursor-pointer text-2xl" @click="emit('close')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="scrollbar max-h-96 space-y-4 overflow-y-auto px-6 py-4">
          <div
            v-for="user in userList"
            :key="user.id"
            class="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-md"
          >
            <div class="ring-brand-tertiary h-12 w-12 rounded-full object-cover ring-2">
              <img :src="user.avatar" />
            </div>
            <div class="flex-1">
              <p class="text-brand-primary font-bold">{{ user.name }}</p>
            </div>
            <button
              class="bg-btn-primary hover:bg-btn-primary-dark cursor-pointer rounded-full border-2 px-4 py-2 text-sm text-white"
            >
              查看
            </button>
          </div>
        </div>
        <button
          class="mt-8 w-full cursor-pointer rounded-full bg-[#f48e31] py-4 font-bold text-white shadow-lg"
          @click="emit('close')"
        >
          返回
        </button>
      </div>
    </div>
  </Transition>
</template>
