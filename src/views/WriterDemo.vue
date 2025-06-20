<template>
  <div class="space-y-8">
    <UAlert v-if="!isSupported" title="API Not Supported" color="error" variant="subtle"
      description="This feature requires enabling Experimental Web Platform features in your browser." class="mb-4" />

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-code-bracket-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Writer API</h3>
          </div>
          <UButton @click="() => toggleCodeCollapse = !toggleCodeCollapse" icon="i-heroicons-code-bracket-20-solid">
            {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <div class="space-y-4" v-if="toggleCodeCollapse">
          <CodeExample :code="exampleCode" />
        </div>

        <p class="text-gray-600 mb-4">
          Generate new text based on writing tasks. Describe what you want to write, and the API will help create the
          content.
        </p>

        <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'" variant="subtle"
          :description="downloadStatus" />

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Writing Task</h3>
          </div>
          <UTextarea v-model="writingTask"
            placeholder="Describe your writing task (e.g., 'Write a product description for an eco-friendly water bottle')"
            :rows="4" :disabled="!isSupported" class="w-full" />
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Writing Style</h3>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <USelect v-model="writingTone" :items="toneOptions" :disabled="!isSupported" />
            <USelect v-model="writingFormat" :items="formatOptions" :disabled="!isSupported" />
          </div>
        </div>

        <div class="space-y-4">
          <StreamingToggle v-model="enableStreaming" :disabled="!isSupported" />
        </div>

        <div class="flex gap-2">
          <UButton @click="generateText" :loading="isProcessing" :disabled="!isSupported || !canProcess" color="primary"
            size="md">
            Generate Text
          </UButton>
        </div>

        <div v-if="error" class="mt-4">
          <UAlert color="error" variant="subtle" :title="error" />
        </div>

        <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 mb-2">Generated Text</h3>
          <div class="whitespace-pre-wrap">{{ result }}</div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CodeExample from '../components/CodeExample.vue'
import StreamingToggle from '../components/StreamingToggle.vue'

const writingTask = ref('')
const writingTone = ref('neutral')
const writingFormat = ref('markdown')
const result = ref('')
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)
const enableStreaming = ref(false)

const toneOptions = [
  { label: 'Neutral', value: 'neutral', description: 'Balanced and objective tone' },
  { label: 'Formal', value: 'formal', description: 'Business and professional style' },
  { label: 'Casual', value: 'casual', description: 'Friendly and conversational' }
]

const formatOptions = [
  { label: 'Markdown', value: 'markdown', description: 'Formatted markdown text' },
  { label: 'Plain Text', value: 'plain-text', description: 'Standard unformatted text' },
]

const canProcess = computed(() => {
  return writingTask.value.trim() !== ''
})

const generateExampleCode = computed(() => {
  const options = []

  if (writingTone.value !== 'neutral') {
    options.push(`tone: '${writingTone.value}'`)
  }
  if (writingFormat.value !== 'markdown') {
    options.push(`format: '${writingFormat.value}'`)
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const writeCode = enableStreaming.value ?
    `// Use streaming API for real-time updates
const stream = await writer.writeStreaming(
  ${writingTask.value ? `'${writingTask.value.replace(/'/g, "\\'")}'` : "'Write a product description for an eco-friendly water bottle'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}` :
    `// Use regular API for complete response
const result = await writer.write(
  ${writingTask.value ? `'${writingTask.value.replace(/'/g, "\\'")}'` : "'Write a product description for an eco-friendly water bottle'"}\
${optionsStr}
)`

  return `const available = await Writer.availability()
let writer

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  writer = await Writer.create()
} else {
  writer = await Writer.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(\`Downloaded \${e.loaded * 100}%\`)
      })
    }
  })
}

${writeCode}`
})

const exampleCode = computed(() => generateExampleCode.value)

let writer = null

onMounted(async () => {
  await checkSupport()
})

onUnmounted(() => {
  if (writer) {
    writer.destroy()
  }
  if (abortController.value) {
    abortController.value.abort()
  }
})

async function checkSupport() {
  try {
    if ('Writer' in window) {
      const availability = await Writer.availability()

      if (availability === 'unavailable') {
        isSupported.value = false
        error.value = 'Writer API is not supported in this browser'
        downloadStatus.value = ''
      } else {
        isSupported.value = true
        if (availability === 'downloadable' || availability === 'downloading') {
          downloadStatus.value = 'Model needs to be downloaded. This may take a few minutes.'
        } else {
          downloadStatus.value = ''
        }
      }
    } else {
      isSupported.value = false
      error.value = 'Writer API is not supported in this browser'
      downloadStatus.value = ''
    }
  } catch (err) {
    console.error('Failed to check availability:', err)
    error.value = err.message
  }
}

async function generateText() {
  if (!isSupported.value || !writingTask.value.trim()) return

  isProcessing.value = true
  error.value = ''
  result.value = ''
  abortController.value = new AbortController()

  try {
    const availability = await Writer.availability()

    if (availability === 'unavailable') {
      throw new Error('Writer API is not available for the current configuration')
    }

    const options = {
      tone: writingTone.value,
      format: writingFormat.value,
      signal: abortController.value.signal,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          downloadProgress.value = e.loaded * 100
          downloadStatus.value = 'Downloading model...'
        })
      }
    }

    if (availability !== 'available') {
      downloadStatus.value = 'Model is being downloaded. Please wait...'
    }

    writer = await Writer.create(options)

    if (enableStreaming.value) {
      // Use streaming API
      const stream = await writer.writeStreaming(writingTask.value)
      result.value = ''

      for await (const chunk of stream) {
        result.value += chunk
      }
    } else {
      // Use regular API
      const text = await writer.write(writingTask.value)
      result.value = text
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'Operation cancelled'
    } else {
      error.value = err.message || 'Failed to generate text'
      console.error('Writing error:', err)
    }
  } finally {
    isProcessing.value = false
    downloadStatus.value = ''
    downloadProgress.value = 0
  }
}
</script>