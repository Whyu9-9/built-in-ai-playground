import { ref } from 'vue'

export function usePerformanceMetrics() {
  const metrics = ref(null)
  const startTime = ref(null)

  function startMeasurement() {
    startTime.value = performance.now()
    metrics.value = null
  }

  function endMeasurement(inputText = '', outputText = '') {
    if (!startTime.value) return

    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime.value)
    
    // Rough token estimation (words * 1.3)
    const inputTokens = Math.round(inputText.split(/\s+/).length * 1.3)
    const outputTokens = Math.round(outputText.split(/\s+/).length * 1.3)
    const tokensPerSecond = Math.round(outputTokens / (responseTime / 1000))

    metrics.value = {
      responseTime,
      inputTokens,
      outputTokens,
      tokensPerSecond: tokensPerSecond || 0
    }

    startTime.value = null
  }

  function resetMetrics() {
    metrics.value = null
    startTime.value = null
  }

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    resetMetrics
  }
}