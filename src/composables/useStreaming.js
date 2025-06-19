import { ref } from 'vue'

export function useStreaming() {
  const enableStreaming = ref(false)

  async function processStreamingResponse(stream, resultRef) {
    resultRef.value = ''
    for await (const chunk of stream) {
      resultRef.value += chunk
    }
  }

  return {
    enableStreaming,
    processStreamingResponse,
  }
}
