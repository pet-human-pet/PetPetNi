<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/Share/BaseModal.vue'
import ChipVerification from '@/components/Form/ChipVerification.vue'
import RoleSelection from '@/components/Onboarding/RoleSelection.vue'
import PetBasicInfo from '@/components/Onboarding/PetBasicInfo.vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

const isOpen = computed(() => uiStore.isVerificationModalOpen)
const currentStep = computed(() => uiStore.onboardingStep)

const handleClose = () => {
  uiStore.closeVerificationModal()
}

const handleRoleSelect = (role) => {
  if (role === 'owner') {
    uiStore.setOnboardingStep('pet_basic')
  } else {
    // TODO: Call API to create profile for Cloud Owner
    handleClose()
  }
}

const handlePetSubmit = (petData) => {
  // TODO: Save Draft via API
  uiStore.setOnboardingStep('chip_verify')
}

const handleChipSubmit = () => {
  handleClose()
}

const handleChipSkip = () => {
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
    <RoleSelection v-if="currentStep === 'role_select'" @select="handleRoleSelect" />
    <PetBasicInfo v-else-if="currentStep === 'pet_basic'" @submit="handlePetSubmit" />
    <ChipVerification
      v-else-if="currentStep === 'chip_verify'"
      pet-name="您的毛孩"
      @submit="handleChipSubmit"
      @skip="handleChipSkip"
    />
  </BaseModal>
</template>
