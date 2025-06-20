<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="i-heroicons-clock text-lg text-gray-600" />
        <h3 class="font-semibold text-gray-900">Recent History</h3>
      </div>
      <UButton 
        v-if="history.length > 0"
        @click="clearHistory" 
        color="gray" 
        variant="ghost" 
        size="sm"
      >
        Clear All
      </UButton>
    </div>

    <div v-if="history.length === 0" class="text-center py-8 text-gray-500">
      <div class="i-heroicons-document-text text-3xl mb-2 opacity-50" />
      <p>No history yet</p>
    </div>

    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="(item, index) in history"
        :key="index"
        class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
        @click="$emit('select', item)"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="text-sm font-medium text-gray-900 truncate flex-1">
            {{ item.input.substring(0, 50) }}{{ item.input.length > 50 ? '...' : '' }}
          </div>
          <div class="text-xs text-gray-500 ml-2">
            {{ formatTime(item.timestamp) }}
          </div>
        </div>
        <div class="text-xs text-gray-600 line-clamp-2">
          {{ item.output.substring(0, 100) }}{{ item.output.length > 100 ? '...' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'clear'])

function clearHistory() {
  emit('clear')
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}
</script>