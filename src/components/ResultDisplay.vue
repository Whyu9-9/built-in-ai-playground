<template>
  <div v-if="result || error" class="space-y-4">
    <!-- Error Display -->
    <UAlert 
      v-if="error" 
      color="error" 
      variant="subtle" 
      :title="error"
      class="animate-in slide-in-from-top-2 duration-300"
    />

    <!-- Result Display -->
    <div v-if="result" class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 animate-in slide-in-from-bottom-2 duration-300">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="i-heroicons-sparkles text-lg text-blue-600" />
          <h3 class="font-semibold text-gray-900">{{ title || 'Result' }}</h3>
        </div>
        <div class="flex items-center gap-2">
          <UBadge color="primary" variant="subtle" size="sm">
            {{ result.length }} characters
          </UBadge>
          <UButton 
            @click="copyResult" 
            :color="copied ? 'success' : 'gray'" 
            variant="ghost"
            size="sm"
          >
            <template v-if="!copied">
              <div class="i-heroicons-clipboard mr-1" />
              Copy
            </template>
            <template v-else>
              <div class="i-heroicons-check mr-1" />
              Copied!
            </template>
          </UButton>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-4 border border-gray-200">
        <div v-if="formatted" class="font-mono text-sm whitespace-pre-wrap">{{ formatted }}</div>
        <div v-else class="whitespace-pre-wrap leading-relaxed">{{ result }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  result: String,
  error: String,
  title: String,
  format: String
})

const copied = ref(false)

const formatted = computed(() => {
  if (props.format === 'json' && props.result) {
    try {
      return JSON.stringify(JSON.parse(props.result), null, 2)
    } catch {
      return null
    }
  }
  return null
})

async function copyResult() {
  try {
    await navigator.clipboard.writeText(props.result)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>