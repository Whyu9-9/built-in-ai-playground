<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <component :is="icon" class="text-white text-xl" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
            <p class="text-gray-600 mt-1">{{ description }}</p>
          </div>
        </div>
        <UButton 
          @click="toggleCode" 
          :icon="showCode ? 'i-heroicons-eye-slash' : 'i-heroicons-code-bracket'"
          variant="soft"
          color="gray"
          size="sm"
        >
          {{ showCode ? 'Hide Code' : 'Show Code' }}
        </UButton>
      </div>

      <!-- API Status Alert -->
      <UAlert 
        v-if="!isSupported" 
        title="API Not Supported" 
        color="error" 
        variant="subtle"
        description="This feature requires enabling Experimental Web Platform features in your browser. Go to chrome://flags/#enable-experimental-web-platform-features"
        class="mb-4"
      />

      <!-- Download Status -->
      <UAlert 
        v-if="downloadStatus && isSupported" 
        :color="downloadProgress === 100 ? 'primary' : 'amber'" 
        variant="subtle" 
        :description="downloadStatus"
        class="mb-4"
      />
    </div>

    <!-- Code Example -->
    <div v-if="showCode" class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="i-heroicons-code-bracket text-lg text-gray-600" />
        <h3 class="text-lg font-semibold text-gray-900">Example Usage</h3>
      </div>
      <CodeExample :code="exampleCode" />
    </div>

    <!-- Main Demo Content -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CodeExample from './CodeExample.vue'

defineProps({
  title: String,
  description: String,
  icon: String,
  isSupported: Boolean,
  downloadStatus: String,
  downloadProgress: Number,
  exampleCode: String
})

const showCode = ref(false)

function toggleCode() {
  showCode.value = !showCode.value
}
</script>