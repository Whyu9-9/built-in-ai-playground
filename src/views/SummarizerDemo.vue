<template>
  <div class="space-y-8">
    <UAlert v-if="!isSupported" title="API Not Supported" color="error" variant="subtle"
      description="This feature requires enabling Experimental Web Platform features in your browser." class="mb-4" />
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-code-bracket-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Summarizer API</h3>
          </div>
          <UButton @click="() => toggleCodeCollapse = !toggleCodeCollapse" icon="i-heroicons-code-bracket-20-solid">
            {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <div class="space-y-4" v-if="toggleCodeCollapse">
          <h2 class="text-xl font-semibold">Example Usage</h2>
          <CodeExample :code="exampleCode" />
        </div>

        <p class="text-gray-600 mb-4">
          Generate concise summaries of text using Gemini Nano in Chrome. Enter your text and get a summarized version.
        </p>

        <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'" variant="subtle"
          :description="downloadStatus" />

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Input Text</h3>
          </div>
          <UTextarea v-model="inputText" placeholder="Enter text to summarize..." :rows="6" :disabled="!isSupported"
            class="w-full" />
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Parameters</h3>
          </div>
          <div class="flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Temperature: {{ temperature }}</label>
              <USlider v-model="temperature" :min="minTemperature" :max="maxTemperature" :step="0.01"
                :disabled="!isSupported" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">TopK: {{ topK }}</label>
              <USlider v-model="topK" :min="minTopK" :max="maxTopK" :step="1" :disabled="!isSupported" />
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <StreamingToggle v-model="enableStreaming" :disabled="!isSupported" />
        </div>

        <div class="flex gap-2">
          <UButton @click="summarizeText" :loading="isProcessing" :disabled="!isSupported || !canProcess"
            color="primary" size="md">
            Summarize Text
          </UButton>
          <UButton v-if="isProcessing" @click="cancelSummarize" color="error" variant="soft" size="md">
            Cancel
          </UButton>
        </div>

        <div v-if="error" class="mt-4">
          <UAlert color="error" variant="subtle" :title="error" />
        </div>

        <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 mb-2">Summary</h3>
          <div class="whitespace-pre-wrap">{{ result }}</div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CodeExample from '../components/CodeExample.vue'
import StreamingToggle from '../components/StreamingToggle.vue'
import { useAIModel } from '../composables/useAIModel'
import { useExampleCode } from '../composables/useExampleCode'
import { useFormOptions } from '../composables/useFormOptions'
import { useStreaming } from '../composables/useStreaming'

const inputText = ref('')
const result = ref('')
const toggleCodeCollapse = ref(false)

const {
  isSupported,
  error,
  downloadStatus,
  downloadProgress,
  isProcessing,
  abortController,
  checkSupport,
  createModel,
  cleanup
} = useAIModel('Summarizer')

const {
  temperature,
  minTemperature,
  maxTemperature,
  topK,
  minTopK,
  maxTopK
} = useFormOptions()

const { enableStreaming, processStreamingResponse } = useStreaming()

const canProcess = computed(() => {
  return inputText.value.trim().length > 10
})

const { exampleCode } = useExampleCode('Summarizer', {
  inputRef: inputText,
  streamingRef: enableStreaming,
  methodName: 'summarize',
  streamMethodName: 'summarizeStreaming',
  generateOptionsStr: () => {
    const options = []

    if (temperature.value !== 1.0) {
      options.push(`temperature: ${temperature.value}`)
    }
    if (topK.value !== 3) {
      options.push(`topK: ${topK.value}`)
    }

    return options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''
  }
})

let summarizer = null

onMounted(async () => {
  await checkSupport()
})

async function summarizeText() {
  if (!canProcess.value || !isSupported.value) return

  try {
    isProcessing.value = true
    error.value = ''
    abortController.value = new AbortController()

    if (!summarizer) {
      summarizer = await createModel()
      if (!summarizer) return
    }

    const options = {
      signal: abortController.value.signal,
      temperature: temperature.value,
      topK: topK.value
    }

    if (enableStreaming.value) {
      const stream = await summarizer.summarizeStreaming(inputText.value, options)
      await processStreamingResponse(stream, result)
    } else {
      result.value = await summarizer.summarize(inputText.value, options)
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      error.value = err.message
    }
  } finally {
    isProcessing.value = false
  }
}

function cancelSummarize() {
  if (abortController.value) {
    abortController.value.abort()
  }
}
</script>