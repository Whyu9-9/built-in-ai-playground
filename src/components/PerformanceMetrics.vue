<template>
  <div v-if="metrics" class="bg-blue-50 rounded-lg p-4 border border-blue-200">
    <div class="flex items-center gap-2 mb-3">
      <div class="i-heroicons-chart-bar text-lg text-blue-600" />
      <h3 class="font-semibold text-gray-900">Performance Metrics</h3>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ metrics.responseTime }}ms</div>
        <div class="text-xs text-gray-600">Response Time</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">{{ metrics.tokensPerSecond }}</div>
        <div class="text-xs text-gray-600">Tokens/sec</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-600">{{ metrics.inputTokens }}</div>
        <div class="text-xs text-gray-600">Input Tokens</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-600">{{ metrics.outputTokens }}</div>
        <div class="text-xs text-gray-600">Output Tokens</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  metrics: {
    type: Object,
    default: null
  }
})
</script>