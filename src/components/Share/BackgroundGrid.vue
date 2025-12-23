<script setup>
// Shared Background component using the vector pattern
// Ensures simplified consistency across views
// Based on user provided CSS spec: size 53.04px 49px, center position
</script>

<template>
  <div
    class="absolute inset-0 pointer-events-none z-0"
    style="
      background-image: url('@/assets/images/pattern-grid.svg');
      background-size: 53.04px 49px;
      background-position: 0 0;
      background-repeat: repeat;
    "
  ></div>
</template>
