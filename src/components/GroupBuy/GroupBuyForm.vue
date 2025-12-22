<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  title: '',
  price: '',
  target: '',
  img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
  desc: ''
})

function submit() {
  if (!form.title || !form.price || !form.desc) {
    alert('請完整填寫團購資訊！')
    return
  }
  emit('submit', {
    title: form.title,
    price: Number(form.price),
    target: Number(form.target || 0),
    img: form.img || 'https://via.placeholder.com/800x400',
    desc: form.desc
  })

  form.title = ''
  form.price = ''
  form.target = ''
  form.desc = ''
}
</script>

<template>
  <div
    class="h-full overflow-y-auto p-10
           max-[800px]:fixed max-[800px]:left-0 max-[800px]:top-15 max-[800px]:z-50 max-[800px]:h-[calc(100vh-60px)] max-[800px]:w-full max-[800px]:bg-white max-[800px]:pb-20">
    
    <div class="mb-6">
      <h2 class="text-[24px] font-bold"><i class="fa-solid fa-shop mr-2"></i>發起團購</h2>
      <p class="text-[#666]">填寫詳細資料，讓大家一起買更便宜！</p>
    </div>

    <div class="mx-auto flex max-w-150 flex-col gap-5">
      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">商品名稱</label>
        <input v-model="form.title" placeholder="例如:吉娃娃造型抱枕" class="rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]" />
      </div>

    <!-- 價格 + 目標（桌機兩欄 / 手機一欄） -->
      <div class="grid grid-cols-2 gap-5 max-[800px]:grid-cols-1 max-[800px]:gap-3">
        <div class="min-w-0 flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">團購價格 (元)</label>
          <input
            v-model="form.price"
            placeholder="349"
            type="number"
            inputmode="numeric"
            class="w-full min-w-0 rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
          />
        </div>
      
        <div class="min-w-0 flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">目標數量</label>
          <input
            v-model="form.target"
            placeholder="30"
            type="number"
            inputmode="numeric"
            class="w-full min-w-0 rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"
          />
        </div>
      </div>


      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">圖片網址</label>
        <input v-model="form.img" class="rounded-lg border border-[#ddd] p-2.5" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-[13px] font-bold text-[#666]">詳細說明</label>
        <textarea v-model="form.desc" placeholder="商品特色、面交地點、截止日期..." class="h-37.5 rounded-lg border border-[#ddd] p-2.5 placeholder:text-[#999]"></textarea>
      </div>

      <button class="rounded-lg bg-[#ff9f43] p-3 font-bold text-white" type="button" @click="submit">
        發佈團購
      </button>

      <button
        class="rounded-lg bg-[#eee] p-3 font-bold text-[#666]"
        type="button"
        @click="emit('cancel')"
      >
        取消
      </button>
    </div>
  </div>
</template>
