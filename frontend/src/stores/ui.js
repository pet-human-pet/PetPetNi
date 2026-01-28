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

  // === 已移除：VerificationModal 相關功能 ===
  // 註：原有的 isVerificationModalOpen、onboardingStep 等功能
  // 已由 AuthView.vue 一頁式流程取代，故移除以避免混淆

  return {
    // Menu
    isMenuOpen,
    toggleMenu,
    closeMenu,
    openMenu
  }
})
