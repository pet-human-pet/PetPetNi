<script setup>
const props = defineProps({
  item: { type: Object, default: null }
})
</script>

<template>
  <div
    class="h-full overflow-y-auto p-10
           max-[800px]:fixed max-[800px]:left-0 max-[800px]:top-15 max-[800px]:z-50 max-[800px]:h-[calc(100vh-60px)] max-[800px]:w-full max-[800px]:bg-white max-[800px]:pb-20"
  >
    

    <template v-if="props.item">
      <div class="mb-5 border-b border-[#eee] pb-5">
        <div class="mb-2 text-[28px] font-bold max-[800px]:mt-2.5">{{ props.item.title }}</div>
        <div class="flex gap-5 text-[14px] text-[#666]">
          <span><i class="fa-solid fa-users mr-1"></i>目標 {{ props.item.target }} 人</span>
          <span><i class="fa-regular fa-clock mr-1"></i>截止: 2025/12/31</span>
        </div>
      </div>

      <div>
        <img
          :src="props.item.img"
          :alt="props.item.title"
          class="mb-5 w-full max-h-75 rounded-xl object-cover max-[800px]:max-h-37.5"
        />

        <div class="flex items-center justify-between rounded-xl border-2 border-[#ff9f43] bg-[#fffcf7] p-5">
          <div>
            <div>團購優惠價</div>
            <div class="text-[24px] font-bold text-[#ff9f43]">NT$ {{ props.item.price }}</div>
          </div>
          <button class="rounded-lg bg-[#ff9f43] px-8 py-3 text-[18px] font-bold text-white">
            我要跟團 +1
          </button>
        </div>

        <h3 class="my-5 text-[18px] font-bold">商品詳情</h3>
        <div>{{ props.item.desc }}</div>
      </div>
    </template>

    <template v-else>
      <div class="mt-25 text-center text-[#999]">
        <i class="fa-solid fa-basket-shopping text-[48px]"></i>
        <p class="mt-5">請點選左側團購項目查看詳情</p>
      </div>
    </template>
  </div>
</template>
