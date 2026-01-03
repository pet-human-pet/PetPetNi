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

  /* === Modal Controls === */
  const isVerificationModalOpen = ref(false)

  function openVerificationModal() {
    isVerificationModalOpen.value = true
  }

  function closeVerificationModal() {
    isVerificationModalOpen.value = false
  }

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    openMenu,
    // Modals
    isVerificationModalOpen,
    openVerificationModal,
    closeVerificationModal
  }
})
