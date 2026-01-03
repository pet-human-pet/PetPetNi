import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isMenuOpen = ref(false)

  function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value
  }

  function closeMenu() {
    isMenuOpen.value = false
  }

  function openMenu() {
    isMenuOpen.value = true
  }

  const isVerificationModalOpen = ref(false)
  const onboardingStep = ref('role_select')

  function openVerificationModal(step = 'role_select') {
    onboardingStep.value = step
    isVerificationModalOpen.value = true
  }

  function closeVerificationModal() {
    isVerificationModalOpen.value = false
  }

  function setOnboardingStep(step) {
    onboardingStep.value = step
  }

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    openMenu,
    isVerificationModalOpen,
    onboardingStep,
    openVerificationModal,
    closeVerificationModal,
    setOnboardingStep
  }
})
