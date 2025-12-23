<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({
  events: { type: Array, required: true },
  selectedId: { type: [Number, String, null], default: null }
})

const emit = defineEmits(['select', 'create'])

const formOpen = ref(false)
const form = reactive({ title: '', locId: 1, desc: '' })

const cardEls = new Map()
const setCardRef = (id) => (el) => {
  if (el) cardEls.set(id, el)
}

function scrollTo(id) {
  cardEls.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}
defineExpose({ scrollTo })

function openForm() {
  formOpen.value = true
}
function closeForm() {
  formOpen.value = false
}
function submit() {
  if (!form.title || !form.desc) {
    alert('資訊填寫不完整喔！')
    return
  }
  emit('create', { title: form.title, locId: Number(form.locId), desc: form.desc })
  form.title = ''
  form.desc = ''
  closeForm()
}
</script>

<template>
  <section
    class="flex flex-col gap-3.75
           max-[800px]:no-scrollbar max-[800px]:pointer-events-auto max-[800px]:flex-row max-[800px]:overflow-x-auto max-[800px]:gap-3 max-[800px]:pb-1.25
           max-[800px]:snap-x max-[800px]:snap-mandatory"
  >
    <!-- create card -->
    <div
      class="rounded-xl border-2 border-dashed border-[#ff9f43] bg-white p-4 transition-all
             max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center max-[800px]:flex-col max-[800px]:items-center max-[800px]:justify-center
             max-[800px]:rounded-2xl max-[800px]:p-0 max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
    >
      <button
        class="flex w-full items-center justify-center gap-2 bg-transparent py-2 text-[16px] font-bold text-[#ff9f43]
               max-[800px]:h-full max-[800px]:flex-col max-[800px]:text-[14px]"
        type="button"
        @click="openForm"
      >
        <i class="fa-solid fa-circle-plus max-[800px]:text-[28px]"></i>
        <span>發起新活動</span>
      </button>

      <!-- inline form（桌面） + full screen（手機） -->
      <div
        v-if="formOpen"
        class="relative mt-3.75 flex flex-col gap-3 border-t border-[#eee] pt-3.75
               max-[800px]:fixed max-[800px]:inset-0 max-[800px]:z-1000 max-[800px]:m-0 max-[800px]:border-0 max-[800px]:bg-white
               max-[800px]:pt-20 max-[800px]:px-5 max-[800px]:pb-5 max-[800px]:overflow-y-auto"
      >
        <button
          class="absolute right-3 top-3 flex h-8.5 w-8.5 items-center justify-center rounded-[10px] bg-[#f0f2f5] text-[#666] transition hover:bg-[#fffcf7] hover:text-[#ff9f43]"
          type="button"
          aria-label="關閉"
          @click.stop="closeForm"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <h3 class="mb-1 font-bold">建立新活動</h3>

        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">活動名稱</label>
          <input v-model="form.title" placeholder="例如:松山菸廠狗狗聚會" class="rounded-lg border border-[#ddd] bg-white p-2.5 text-[14px] placeholder:text-[#999]" />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">選擇地點</label>
          <select v-model="form.locId"  class="rounded-lg border border-[#ddd] bg-white p-2.5 text-[14px] ">
            <option :value="1">台北 101 大樓</option>
            <option :value="2">國父紀念館</option>
            <option :value="3">松山菸廠</option>
            <option :value="4">象山公園</option>
            <option :value="5">台北市政府廣場</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-bold text-[#666]">活動描述</label>
          <textarea
            v-model="form.desc" placeholder="例如:輸入活動時間、集合地點等詳細資訊..." class="h-20 resize-none rounded-lg border border-[#ddd] bg-white p-2.5 text-[14px] placeholder:text-[#999]"/>
        </div>

        <button
          class="rounded-lg bg-[#ff9f43] p-3 font-bold text-white"
          type="button"
          @click="submit"
        >
          立即發佈活動
        </button>

        <button
          class="mt-2 hidden w-full rounded-lg bg-[#eee] p-3 font-bold text-[#666] max-[800px]:block"
          type="button"
          @click="closeForm"
        >
          取消返回
        </button>
      </div>
    </div>

    <!-- cards -->
    <ul class="list-none p-0 m-0 flex flex-col gap-3.75 max-[800px]:contents">
      <li
        v-for="evt in props.events"
        :key="evt.id"
        :ref="setCardRef(evt.id)"
        class="relative cursor-pointer overflow-hidden rounded-xl border border-[#ddd] bg-white transition
               hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
               max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center
               max-[800px]:flex-col max-[800px]:justify-between max-[800px]:rounded-2xl max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
        :class="props.selectedId === evt.id ? 'border-2 border-[#ff9f43] bg-[#fffcf7]' : ''"
        @click="emit('select', evt)"
      >
        <div class="p-3.75 max-[800px]:p-3">
          <div class="mb-1 text-[16px] font-bold">{{ evt.title }}</div>
          <div
            class="text-[13px] leading-[1.4] text-[#666] overflow-hidden
                   [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]
                   max-[800px]:text-[12px]"
          >
            {{ evt.desc }}
          </div>
        </div>

        <div class="flex gap-2.5 px-3.75 pb-3.75 max-[800px]:px-3 max-[800px]:pb-3.75">
          <button class="flex-1 rounded-[17px] bg-[#ff9f43] text-white h-8.5 max-[800px]:h-8 text-[12px] font-bold">
            <i class="fa-solid fa-paw mr-1"></i> 參加
          </button>
          <button class="flex-1 rounded-[17px] bg-[#f0f2f5] text-[#555] h-8.5 max-[800px]:h-8 text-[12px] font-bold">
            <i class="fa-regular fa-heart"></i>
          </button>
          <button class="flex-1 rounded-[17px] bg-[#f0f2f5] text-[#555] h-8 max-[800px]:h-8 text-[12px] font-bold">
            <i class="fa-regular fa-comment-dots"></i>
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
