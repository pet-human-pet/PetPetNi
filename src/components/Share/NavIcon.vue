<script setup>
import { computed } from 'vue'

const props = defineProps({
  labelZh: { type: String, required: true },
  labelEn: { type: String, required: true },
  iconName: { type: String, default: '' },
  to: { type: String, default: '' },
  variant: { type: String, default: 'grid' },
  iconSizeClass: { type: String, default: '' }, // Allow overriding icon size
  animationDelay: { type: String, default: '0s' },
  animationDuration: { type: String, default: '3s' }
})

const isList = computed(() => props.variant === 'list')

const getIconUrl = (name) => {
  return new URL(`../../assets/icons/${name}`, import.meta.url).href
}
</script>

<template>
  <!-- <component :is="...">功能,既可以是連結，也可以是普通區塊div -->
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="group relative cursor-pointer transition-all duration-300"
    :class="[
      isList
        ? 'flex w-full flex-row items-center justify-between border-b border-white/20 py-4 hover:bg-white/5'
        : 'flex flex-col items-center justify-center p-2 hover:-translate-y-2'
    ]"
  >
    <!-- Left Section for List: Icon + Text -->
    <div :class="[isList ? 'flex flex-1 items-center' : 'contents']">
      <!-- Icon Container -->
      <div
        class="jump-object relative flex items-center justify-center"
        :class="[
          iconSizeClass
            ? iconSizeClass
            : isList
              ? 'mr-4 h-10 w-10'
              : 'mb-2 h-24 w-24 sm:h-28 sm:w-28'
        ]"
        :style="{
          animationDelay: animationDelay,
          animationDuration: animationDuration
        }"
      >
        <slot name="icon">
          <div
            class="h-full w-full bg-contain bg-center bg-no-repeat"
            :style="iconName ? `background-image: url(${getIconUrl(iconName)})` : ''"
          ></div>
        </slot>
      </div>

      <!-- Text Container -->
      <div :class="[isList ? 'text-left' : 'z-10 text-center']">
        <h3
          class="font-sans font-bold tracking-widest text-white uppercase opacity-90"
          :class="[isList ? 'mb-0 text-[10px]' : 'mb-0.5 text-[10px]']"
        >
          {{ labelEn }}
        </h3>
        <h2
          class="font-sans font-bold text-white drop-shadow-md"
          :class="[
            isList ? 'text-base leading-tight' : 'text-sm leading-none tracking-wide sm:text-xl'
          ]"
        >
          {{ labelZh }}
        </h2>
      </div>
    </div>

    <!-- Arrow Button Circle -->
    <div
      class="flex items-center justify-center rounded-full bg-white shadow transition-transform duration-300 group-hover:bg-red-100"
      :class="[
        isList ? 'ml-2 h-6 w-6 group-hover:translate-x-1' : 'mt-2 h-8 w-8 group-hover:scale-110'
      ]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke="currentColor"
        class="text-red-600"
        :class="[isList ? 'h-3 w-3' : 'h-4 w-4']"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      </svg>
    </div>
  </component>
</template>

<style scoped>
.jump-object {
  animation: jump 3s ease-in-out infinite;
}

@keyframes jump {
  0%,
  86.67%,
  100% {
    transform: translate(0, 0);
  }
  6.67% {
    transform: translate(0, -20%);
  }
  13.33% {
    transform: translate(0, 0);
  }
}
</style>
