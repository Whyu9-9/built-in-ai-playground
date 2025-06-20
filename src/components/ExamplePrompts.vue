<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="flex items-center gap-2 mb-4">
      <div class="i-heroicons-light-bulb text-lg text-yellow-600" />
      <h3 class="font-semibold text-gray-900">Example Prompts</h3>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <button
        v-for="example in examples"
        :key="example.title"
        @click="$emit('select', example.prompt)"
        class="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
      >
        <div class="font-medium text-gray-900 mb-1 group-hover:text-blue-700">
          {{ example.title }}
        </div>
        <div class="text-sm text-gray-600 line-clamp-2">
          {{ example.prompt }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  examples: {
    type: Array,
    required: true
  }
})

defineEmits(['select'])
</script>