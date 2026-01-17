<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  petIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['submit', 'back'])

const name = ref('')
const type = ref('dog')
const breed = ref('')
const birthday = ref('')
const gender = ref('male')

// 計算今天日期（YYYY-MM-DD 格式，用於日期選擇器的 max 屬性）
const today = new Date().toISOString().split('T')[0]

// 計算當前寵物索引（用於 template 顯示）
const currentPetIndex = computed(() => props.petIndex)

const submitForm = () => {
  if (!name.value || !breed.value || !birthday.value) return
  emit('submit', {
    name: name.value,
    type: type.value,
    breed: breed.value,
    birthday: birthday.value,
    gender: gender.value
  })
}
</script>

<template>
  <div class="flex flex-col p-6 text-gray-800">
    <h2 class="mb-2 text-center text-2xl font-bold">
      填寫{{ currentPetIndex > 0 ? `第 ${currentPetIndex + 1} 隻` : '' }}毛孩資料
    </h2>
    <p class="mb-6 text-center text-sm text-gray-500">
      {{ currentPetIndex > 0 ? '讓我們認識您的下一位寶貝' : '讓我們更認識您的寶貝' }}
    </p>

    <form
      class="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-2"
      @submit.prevent="submitForm"
    >
      <!-- 毛孩姓名 -->
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

      <!-- 種類 -->
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

      <!-- 品種 -->
      <div class="space-y-2">
        <label class="ml-1 text-sm font-bold">品種</label>
        <input
          v-model="breed"
          type="text"
          placeholder="例如：柴犬、波斯貓"
          class="w-full rounded-xl border-none bg-gray-100 px-4 py-3 placeholder-gray-400 outline-none focus:ring-2 focus:ring-red-300"
          required
        />
      </div>

      <!-- 生日 -->
      <div class="space-y-2">
        <label class="ml-1 text-sm font-bold">生日</label>
        <input
          v-model="birthday"
          type="date"
          :max="today"
          class="w-full rounded-xl border-none bg-gray-100 px-4 py-3 outline-none focus:ring-2 focus:ring-red-300"
          required
        />
      </div>

      <!-- 性別 -->
      <div class="space-y-2">
        <label class="ml-1 text-sm font-bold">性別</label>
        <div class="flex gap-3">
          <label class="flex-1 cursor-pointer">
            <input v-model="gender" type="radio" value="male" class="peer hidden" />
            <div
              class="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 bg-white py-3 transition-all peer-checked:border-blue-400 peer-checked:bg-blue-50"
            >
              <span class="text-xl">♂️</span>
              <span class="text-sm font-bold text-gray-600">公</span>
            </div>
          </label>
          <label class="flex-1 cursor-pointer">
            <input v-model="gender" type="radio" value="female" class="peer hidden" />
            <div
              class="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 bg-white py-3 transition-all peer-checked:border-pink-400 peer-checked:bg-pink-50"
            >
              <span class="text-xl">♀️</span>
              <span class="text-sm font-bold text-gray-600">母</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 按鈕群組 -->
      <div class="mt-4 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-xl border-2 border-gray-300 bg-white py-4 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
          @click="emit('back')"
        >
          上一步
        </button>
        <!-- TODO: Replace #ffa75f with var(--app-primary) -->
        <button
          type="submit"
          class="flex-1 rounded-xl py-4 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          style="background-color: #ffa75f"
          :disabled="!name || !breed || !birthday"
        >
          下一步
        </button>
      </div>
    </form>
  </div>
</template>
