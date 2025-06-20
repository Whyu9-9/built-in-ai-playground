<template>
  <div class="space-y-8">
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
        <ApiExplainer :apiData="apiDocs.summarizer" />
        <div class="space-y-4" v-if="toggleCodeCollapse">
          <CodeExample :code="exampleCode" />

        </div>

        <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'" variant="subtle"
          :description="downloadStatus" />

        <div class="space-y-6">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Input Text</h3>
            </div>
            <UTextarea v-model="inputText" placeholder="Enter your text here..." :rows="6" :disabled="!isSupported"
              class="w-full font-mono text-sm" />
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Shared Context (Optional)</h3>
            </div>
            <UTextarea v-model="sharedContext"
              placeholder="Add any context that might help improve the summarization (e.g., 'This is a scientific article')"
              :rows="2" :disabled="!isSupported" class="w-full" />
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Summary Type</h3>
              </div>
              <USelect v-model="summaryType" :items="summaryTypes" :disabled="!isSupported" />
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Format</h3>
              </div>
              <USelect v-model="summaryFormat" :items="formatOptions" :disabled="!isSupported" />
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Length</h3>
              </div>
              <USelect v-model="summaryLength" :items="lengthOptions" :disabled="!isSupported" />
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
          </div>

          <div v-if="error" class="mt-4">
            <UAlert color="error" variant="subtle" :title="error" />
          </div>

          <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-gray-500 mb-2">Summary</h3>
            <div class="whitespace-pre-wrap" v-html="formattedResult"></div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CodeExample from '../components/CodeExample.vue'
import StreamingToggle from '../components/StreamingToggle.vue'
import ApiExplainer from '../components/ApiExplainer.vue'
import { apiDocs } from '../data/apiDocs.js'

const inputText = ref('')
const result = ref('')
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)
const summaryType = ref('key-points')
const summaryFormat = ref('markdown')
const summaryLength = ref('medium')
const sharedContext = ref('')
const enableStreaming = ref(false)

const summaryTypes = [
  { label: 'Key Points', value: 'key-points', description: 'Extract important points as bullet points (3-7 points based on length)' },
  { label: 'TL;DR', value: 'tldr', description: 'Quick overview summary (1-5 sentences based on length)' },
  { label: 'Teaser', value: 'teaser', description: 'Intriguing summary to draw readers in (1-5 sentences based on length)' },
  { label: 'Headline', value: 'headline', description: 'Main point in a single sentence (12-22 words based on length)' }
]

const formatOptions = [
  { label: 'Markdown', value: 'markdown', description: 'Formatted markdown text' },
  { label: 'Plain Text', value: 'plain-text', description: 'Standard unformatted text' }
]

const lengthOptions = [
  { label: 'Short', value: 'short', description: 'Concise summary' },
  { label: 'Medium', value: 'medium', description: 'Balanced length (default)' },
  { label: 'Long', value: 'long', description: 'Detailed summary' }
]

const canProcess = computed(() => {
  return inputText.value.trim() !== ''
})

const formattedResult = computed(() => {
  if (!result.value) return ''

  if (summaryType.value === 'key-points' && summaryFormat.value === 'markdown') {
    // Convert bullet points to HTML list if in markdown format
    return result.value
      .split('\n')
      .map(point => `<li>${point.replace(/^[•\-\*]\s*/, '')}</li>`)
      .join('\n')
  }

  return result.value
})

const generateExampleCode = computed(() => {
  const options = []

  if (summaryType.value !== 'key-points') {
    options.push(`type: '${summaryType.value}'`)
  }
  if (summaryFormat.value !== 'markdown') {
    options.push(`format: '${summaryFormat.value}'`)
  }
  if (summaryLength.value !== 'medium') {
    options.push(`length: '${summaryLength.value}'`)
  }
  if (sharedContext.value) {
    options.push(`sharedContext: '${sharedContext.value.replace(/'/g, "\\'")}'`)
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const summarizeCode = enableStreaming.value ?
    `// Use streaming API for real-time updates
const stream = await summarizer.summarizeStreaming(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Text to summarize'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}` :
    `// Use regular API for complete response
const result = await summarizer.summarize(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Text to summarize'"}\
${optionsStr}
)`

  return `const available = await Summarizer.availability()
let summarizer

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  summarizer = await Summarizer.create()
} else {
  summarizer = await Summarizer.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(\`Downloaded \${e.loaded * 100}%\`)
      })
    }
  })
}

${summarizeCode}`
})

// Replace the static exampleCode with the computed one
const exampleCode = computed(() => generateExampleCode.value)

let summarizer = null

onMounted(async () => {
  await checkSupport()
})

onUnmounted(() => {
  if (summarizer) {
    summarizer.destroy()
  }
  if (abortController.value) {
    abortController.value.abort()
  }
})

async function checkSupport() {
  try {
    if ('Summarizer' in window) {
      const availability = await Summarizer.availability()

      if (availability === 'unavailable') {
        isSupported.value = false
        error.value = 'Summarizer API is not supported in this browser'
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
      error.value = 'Summarizer API is not supported in this browser'
      downloadStatus.value = ''
    }
  } catch (err) {
    console.error('Failed to check availability:', err)
    error.value = err.message
  }
}

async function summarizeText() {
  if (!isSupported.value || !inputText.value.trim()) return

  isProcessing.value = true
  error.value = ''
  result.value = ''
  abortController.value = new AbortController()

  try {
    const availability = await Summarizer.availability()

    if (availability === 'unavailable') {
      throw new Error('Summarizer API is not available for the current configuration')
    }

    const options = {
      sharedContext: sharedContext.value,
      type: summaryType.value,
      format: summaryFormat.value,
      length: summaryLength.value,
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

    summarizer = await Summarizer.create(options)

    if (enableStreaming.value) {
      // Use streaming API
      const stream = await summarizer.summarizeStreaming(inputText.value)
      result.value = ''

      for await (const chunk of stream) {
        result.value += chunk
      }
    } else {
      // Use regular API
      const summary = await summarizer.summarize(inputText.value)
      result.value = summary
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'Operation cancelled'
    } else {
      error.value = err.message || 'Failed to generate summary'
      console.error('Summarization error:', err)
    }
  } finally {
    isProcessing.value = false
    downloadStatus.value = ''
    downloadProgress.value = 0
  }
}
</script>