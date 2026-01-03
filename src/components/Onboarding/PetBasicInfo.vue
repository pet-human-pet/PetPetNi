<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const name = ref('')
const type = ref('dog')

const submitForm = () => {
  if (!name.value) return
  emit('submit', { name: name.value, type: type.value })
}
</script>

<template>
  <div class="flex flex-col p-6 text-gray-800">
    <h2 class="mb-2 text-center text-2xl font-bold">填寫毛孩資料</h2>
    <p class="mb-8 text-center text-sm text-gray-500">讓我們更認識您的寶貝</p>

    <form class="flex flex-col gap-6" @submit.prevent="submitForm">
      <div class="space-y-2">
        <label class="ml-1 text-sm font-bold">毛孩姓名</label>
        <input
          v-model="name"
          type="text"
          placeholder="例如：旺財"
          class="w-full rounded-xl border-none bg-gray-100 px-4 py-3 text-lg font-bold placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300"
          required
        />
      </div>

      <div class="space-y-2">
        <label class="ml-1 text-sm font-bold">種類</label>
        <div class="flex gap-3">
          <label class="flex-1 cursor-pointer">
            <input v-model="type" type="radio" value="dog" class="peer hidden" />
            <div
              class="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white py-3 text-2xl transition-all peer-checked:border-red-400 peer-checked:bg-red-50"
            >
              🐶 <span class="mt-1 text-xs font-bold text-gray-600">狗狗</span>
            </div>
          </label>
          <label class="flex-1 cursor-pointer">
            <input v-model="type" type="radio" value="cat" class="peer hidden" />
            <div
              class="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white py-3 text-2xl transition-all peer-checked:border-red-400 peer-checked:bg-red-50"
            >
              🐱 <span class="mt-1 text-xs font-bold text-gray-600">貓貓</span>
            </div>
          </label>
          <label class="flex-1 cursor-pointer">
            <input v-model="type" type="radio" value="other" class="peer hidden" />
            <div
              class="flex flex-col items-center justify-center rounded-xl border-2 border-gray-100 bg-white py-3 text-2xl transition-all peer-checked:border-red-400 peer-checked:bg-red-50"
            >
              🐰 <span class="mt-1 text-xs font-bold text-gray-600">其他</span>
            </div>
          </label>
        </div>
      </div>

      <button
        type="submit"
        class="mt-4 w-full rounded-xl bg-gray-900 py-4 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        :disabled="!name"
      >
        下一步：晶片驗證
      </button>
    </form>
  </div>
</template>
