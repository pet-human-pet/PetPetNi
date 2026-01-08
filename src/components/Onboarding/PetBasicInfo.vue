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
const selectedInterests = ref([])

// 計算今天日期（YYYY-MM-DD 格式，用於日期選擇器的 max 屬性）
const today = new Date().toISOString().split('T')[0]

// 計算當前寵物索引（用於 template 顯示）
const currentPetIndex = computed(() => props.petIndex)

// 預設興趣選項
const interestOptions = [
  { value: 'play', label: '玩玩具', emoji: '🎾' },
  { value: 'walk', label: '散步', emoji: '🚶' },
  { value: 'eat', label: '吃零食', emoji: '🍖' },
  { value: 'sleep', label: '睡覺', emoji: '😴' },
  { value: 'social', label: '社交', emoji: '🐕' },
  { value: 'run', label: '奔跑', emoji: '🏃' }
]

// TODO: 之後會從 tag 資料庫取得 interestOptions
const toggleInterest = (value) => {
  const index = selectedInterests.value.indexOf(value)
  if (index > -1) {
    selectedInterests.value.splice(index, 1)
  } else {
    selectedInterests.value.push(value)
  }
}

const submitForm = () => {
  if (!name.value || !breed.value || !birthday.value) return
  emit('submit', {
    name: name.value,
    type: type.value,
    breed: breed.value,
    birthday: birthday.value,
    gender: gender.value,
    interests: selectedInterests.value
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

      <!-- 興趣 -->
      <div class="space-y-2">
        <label class="ml-1 text-sm font-bold">興趣（可多選）</label>

        <!-- 預設選項 -->
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="option in interestOptions"
            :key="option.value"
            type="button"
            :class="[
              'flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all',
              selectedInterests.includes(option.value)
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            ]"
            @click="toggleInterest(option.value)"
          >
            <span>{{ option.emoji }}</span>
            <span>{{ option.label }}</span>
          </button>
        </div>

        <!-- 已選興趣標籤 -->
        <div v-if="selectedInterests.length > 0" class="flex flex-wrap gap-2 pt-2">
          <span
            v-for="interest in selectedInterests"
            :key="interest"
            class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
          >
            {{ interestOptions.find((opt) => opt.value === interest)?.label }}
          </span>
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
        <button
          type="submit"
          class="flex-1 rounded-xl py-4 font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          style="background-color: #ffa75f"
          :disabled="!name || !breed || !birthday"
        >
          {{ currentPetIndex > 0 ? '繼續' : '完成' }}
        </button>
      </div>
    </form>
  </div>
</template>
