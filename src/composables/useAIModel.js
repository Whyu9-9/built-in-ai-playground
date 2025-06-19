import { ref, onUnmounted } from 'vue'

export function useAIModel(modelName) {
  const isSupported = ref(false)
  const error = ref('')
  const downloadStatus = ref('')
  const downloadProgress = ref(0)
  const isProcessing = ref(false)
  const abortController = ref(null)
  let modelInstance = null

  async function checkSupport() {
    try {
      if (modelName in window) {
        const availability = await window[modelName].availability()

        if (availability === 'unavailable') {
          isSupported.value = false
          error.value = `${modelName} API is not supported in this browser`
          downloadStatus.value = ''
        } else {
          isSupported.value = true
          if (availability === 'downloadable' || availability === 'downloading') {
            downloadStatus.value = 'Model needs to be downloaded. This may take a few minutes.'
          } else {
            downloadStatus.value = ''
          }
        }
      } else {
        isSupported.value = false
        error.value = `${modelName} API is not supported in this browser`
        downloadStatus.value = ''
      }
    } catch (err) {
      console.error('Failed to check availability:', err)
      error.value = err.message
    }
  }

  async function createModel(options = {}) {
    try {
      const availability = await window[modelName].availability()

      if (availability === 'unavailable') {
        return null
      }

      modelInstance = await window[modelName].create({
        ...options,
        monitor: (m) => {
          m.addEventListener('downloadprogress', (e) => {
            downloadProgress.value = e.loaded * 100
          })
          if (options.monitor) {
            options.monitor(m)
          }
        },
      })

      return modelInstance
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  function cleanup() {
    if (modelInstance) {
      modelInstance.destroy()
    }
    if (abortController.value) {
      abortController.value.abort()
    }
  }

  onUnmounted(cleanup)

  return {
    isSupported,
    error,
    downloadStatus,
    downloadProgress,
    isProcessing,
    abortController,
    checkSupport,
    createModel,
    cleanup,
  }
}
