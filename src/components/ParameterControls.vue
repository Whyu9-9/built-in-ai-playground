<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="flex items-center gap-2 mb-4">
      <div class="i-heroicons-adjustments-horizontal text-lg text-gray-600" />
      <h3 class="font-semibold text-gray-900">Parameters</h3>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-if="showTemperature">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Temperature: {{ temperature }}
          <UTooltip text="Controls randomness. Lower values make output more focused and deterministic.">
            <div class="i-heroicons-information-circle text-gray-400 ml-1 cursor-help" />
          </UTooltip>
        </label>
        <USlider 
          v-model="temperature" 
          :min="minTemperature" 
          :max="maxTemperature" 
          :step="0.01"
          :disabled="disabled"
          class="mb-2"
        />
        <div class="flex justify-between text-xs text-gray-500">
          <span>Focused</span>
          <span>Creative</span>
        </div>
      </div>

      <div v-if="showTopK">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          TopK: {{ topK }}
          <UTooltip text="Limits the number of highest probability tokens to consider.">
            <div class="i-heroicons-information-circle text-gray-400 ml-1 cursor-help" />
          </UTooltip>
        </label>
        <USlider 
          v-model="topK" 
          :min="minTopK" 
          :max="maxTopK" 
          :step="1"
          :disabled="disabled"
          class="mb-2"
        />
        <div class="flex justify-between text-xs text-gray-500">
          <span>Precise</span>
          <span>Diverse</span>
        </div>
      </div>
    </div>

    <slot />
  </div>
</template>

<script setup>
defineProps({
  temperature: Number,
  minTemperature: Number,
  maxTemperature: Number,
  topK: Number,
  minTopK: Number,
  maxTopK: Number,
  disabled: Boolean,
  showTemperature: { type: Boolean, default: true },
  showTopK: { type: Boolean, default: true }
})

defineEmits(['update:temperature', 'update:topK'])
</script>