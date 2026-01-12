import { ref } from 'vue'

const reportInstance = ref(null)

export const useReport = () => {
  const registerReport = (instance) => {
    reportInstance.value = instance
  }

  const showReport = () => {
    if (!reportInstance.value) {
      return Promise.resolve({ confirmed: false })
    }
    return reportInstance.value.show()
  }

  return { registerReport, showReport }
}
