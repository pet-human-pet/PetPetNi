<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/Share/BaseModal.vue'
import ChipVerification from '@/components/Form/ChipVerification.vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

const isOpen = computed(() => uiStore.isVerificationModalOpen)

const handleClose = () => {
  uiStore.closeVerificationModal()
}

const handleSubmit = () => {
  // Verification Submitted: chipNum
  // 您可以在這裡呼叫其他 Store 或 API
  // 驗證成功後可以選擇自動關閉，或讓 ChipVerification 顯示成功狀態 (目前是後者)
}

const handleSkip = () => {
  handleClose()
}
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :show-close-button="false"
    :close-on-backdrop="false"
    @close="handleClose"
  >
    <ChipVerification pet-name="您的毛孩" @submit="handleSubmit" @skip="handleSkip" />
  </BaseModal>
</template>
