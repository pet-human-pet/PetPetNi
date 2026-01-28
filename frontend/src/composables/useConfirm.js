import { ref } from 'vue'

const dialogInstance = ref(null)

export const useConfirm = () => {
  const register = (instance) => {
    dialogInstance.value = instance
  }

  const showConfirm = (options) => {
    if (!dialogInstance.value) {
      return Promise.resolve(false)
    }
    return dialogInstance.value.show(options)
  }

  return { register, showConfirm }
}
