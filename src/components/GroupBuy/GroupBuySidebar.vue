<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  selectedId: { type: [Number, String, null], default: null }
})
const emit = defineEmits(['select', 'open-form'])
</script>

<template>
  <section
    class="max-[800px]:no-scrollbar flex flex-col gap-3.75 max-[800px]:pointer-events-auto max-[800px]:snap-x max-[800px]:snap-mandatory max-[800px]:flex-row max-[800px]:gap-3 max-[800px]:overflow-x-auto max-[800px]:pb-1.25"
  >
    <div
      class="rounded-xl border-2 border-dashed border-[#ff9f43] bg-white p-4 max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center max-[800px]:flex-col max-[800px]:items-center max-[800px]:justify-center max-[800px]:rounded-2xl max-[800px]:p-0 max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
    >
      <button
        class="flex w-full items-center justify-center gap-2 bg-transparent py-2 text-[16px] font-bold text-[#ff9f43] max-[800px]:h-full max-[800px]:flex-col max-[800px]:text-[14px]"
        type="button"
        @click="emit('open-form')"
      >
        <i class="fa-solid fa-shop max-[800px]:text-[28px]"></i>
        <span>發起新團購</span>
      </button>
    </div>

    <ul class="m-0 flex list-none flex-col gap-3.75 p-0 max-[800px]:contents">
      <li
        v-for="gb in props.items"
        :key="gb.id"
        class="relative cursor-pointer overflow-hidden rounded-xl border border-[#ddd] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] max-[800px]:flex max-[800px]:h-40 max-[800px]:w-60 max-[800px]:flex-none max-[800px]:snap-center max-[800px]:flex-col max-[800px]:justify-between max-[800px]:rounded-2xl max-[800px]:shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
        :class="props.selectedId === gb.id ? 'border-2 border-[#ff9f43] bg-[#fffcf7]' : ''"
        @click="emit('select', gb)"
      >
        <div class="p-3.75 max-[800px]:p-3">
          <div class="mb-1 flex items-start justify-between gap-2">
            <div class="line-clamp-1 min-w-0 text-[16px] leading-snug font-bold">
              {{ gb.title }}
            </div>

            <span
              class="shrink-0 rounded-full bg-[#e3f2fd] px-2 py-0.5 text-[11px] font-bold text-[#2196f3]"
            >
              進行中
            </span>
          </div>

          <div class="text-[13px] font-bold text-[#ff9f43]">$ {{ gb.price }} / 份</div>
        </div>
      </li>
    </ul>
  </section>
</template>
