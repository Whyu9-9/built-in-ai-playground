<template>
  <div class="flex items-center gap-3">
    <UButton 
      @click="$emit('process')" 
      :loading="isProcessing" 
      :disabled="disabled || !canProcess"
      color="primary" 
      size="lg"
      class="px-6"
    >
      <template v-if="!isProcessing">
        <component :is="icon" class="mr-2" />
        {{ buttonText }}
      </template>
    </UButton>
    
    <UButton 
      v-if="isProcessing" 
      @click="$emit('cancel')" 
      color="error" 
      variant="soft" 
      size="lg"
    >
      <div class="i-heroicons-x-mark mr-2" />
      Cancel
    </UButton>

    <div v-if="isProcessing" class="flex items-center gap-2 text-sm text-gray-600">
      <div class="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      Processing...
    </div>
  </div>
</template>

<script setup>
defineProps({
  isProcessing: Boolean,
  disabled: Boolean,
  canProcess: Boolean,
  buttonText: String,
  icon: String
})

defineEmits(['process', 'cancel'])
</script>