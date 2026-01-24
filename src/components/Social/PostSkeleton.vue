<template>
  <div class="c-card w-full min-w-0 bg-white p-5 md:p-6">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div class="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-200"></div>
        <!-- Name & Info -->
        <div class="space-y-2">
          <div class="h-4 w-24 animate-pulse rounded bg-zinc-200"></div>
          <div class="h-3 w-16 animate-pulse rounded bg-zinc-200"></div>
        </div>
      </div>
      <!-- More Options -->
      <div class="h-8 w-8 animate-pulse rounded-full bg-zinc-100"></div>
    </div>

    <!-- Content Text -->
    <div class="mt-4 space-y-2">
      <div class="h-4 w-full animate-pulse rounded bg-zinc-200"></div>
      <div class="h-4 w-3/4 animate-pulse rounded bg-zinc-200"></div>
    </div>

    <!-- Image Placeholder (Optional, just a block) -->
    <div class="mt-4 aspect-video w-full animate-pulse rounded-xl bg-zinc-200"></div>

    <!-- Action Bar -->
    <div class="mt-4 flex items-center justify-between">
      <div class="flex gap-6">
        <div class="h-6 w-12 animate-pulse rounded bg-zinc-200"></div>
        <div class="h-6 w-12 animate-pulse rounded bg-zinc-200"></div>
      </div>
      <div class="h-6 w-6 animate-pulse rounded bg-zinc-200"></div>
    </div>
  </div>
</template>
