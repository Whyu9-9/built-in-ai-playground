<template>
  <div class="space-y-8">
    <UAlert v-if="!isSupported" title="API Not Supported" color="error" variant="subtle"
      description="This feature requires enabling Experimental Web Platform features in your browser." class="mb-4" />

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-code-bracket-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Rewriter API</h3>
          </div>
          <UButton @click="() => toggleCodeCollapse = !toggleCodeCollapse" icon="i-heroicons-code-bracket-20-solid">
            {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <ApiExplainer :apiData="apiDocs.rewriter" />
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
            <UTextarea v-model="inputText" placeholder="Enter text to rewrite..." :rows="4" :disabled="!isSupported"
              class="w-full" />
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Shared Context (Optional)</h3>
            </div>
            <UTextarea v-model="sharedContext"
              placeholder="Add context to help the rewriter understand the content better..." :rows="2"
              :disabled="!isSupported" class="w-full" />
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Rewriting Options</h3>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <USelect v-model="rewriteLength" :items="lengthOptions" :disabled="!isSupported" />
              <USelect v-model="rewriteTone" :items="toneOptions" :disabled="!isSupported" />
              <USelect v-model="rewriteFormat" :items="formatOptions" :disabled="!isSupported" />
            </div>
          </div>

          <StreamingToggle v-model="enableStreaming" :disabled="!isSupported" />

          <div class="flex gap-2">
            <UButton @click="rewriteText" :loading="isProcessing" :disabled="!isSupported || !canProcess"
              color="primary" size="md">
              Rewrite Text
            </UButton>
            <UButton v-if="isProcessing" @click="cancelRewrite" color="error" variant="soft" size="md">
              Cancel
            </UButton>
          </div>

          <div v-if="error" class="mt-4">
            <UAlert color="error" variant="subtle" :title="error" />
          </div>

          <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-gray-500 mb-2">Rewritten Text</h3>
            <div class="whitespace-pre-wrap">{{ result }}</div>
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
const sharedContext = ref('')
const rewriteLength = ref('as-is')
const rewriteTone = ref('as-is')
const rewriteFormat = ref('as-is')
const result = ref('')
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)
const enableStreaming = ref(false)

const lengthOptions = [
  { label: 'Same Length', value: 'as-is', description: 'Keep the same length' },
  { label: 'Shorter', value: 'shorter', description: 'Make it more concise' },
  { label: 'Longer', value: 'longer', description: 'Add more details' }
]

const toneOptions = [
  { label: 'Same Tone', value: 'as-is', description: 'Keep the same tone' },
  { label: 'More Formal', value: 'more-formal', description: 'Make it more professional' },
  { label: 'More Casual', value: 'more-casual', description: 'Make it more conversational' }
]

const formatOptions = [
  { label: 'Same Format', value: 'as-is', description: 'Keep the same format' },
  { label: 'Plain Text', value: 'plain-text', description: 'Convert to plain text' },
  { label: 'Markdown', value: 'markdown', description: 'Convert to markdown format' }
]

const canProcess = computed(() => {
  return inputText.value.trim() !== ''
})

const generateExampleCode = computed(() => {
  const options = []

  if (rewriteLength.value !== 'as-is') {
    options.push(`length: '${rewriteLength.value}'`)
  }
  if (rewriteTone.value !== 'as-is') {
    options.push(`tone: '${rewriteTone.value}'`)
  }
  if (rewriteFormat.value !== 'as-is') {
    options.push(`format: '${rewriteFormat.value}'`)
  }
  if (sharedContext.value) {
    options.push(`sharedContext: '${sharedContext.value.replace(/'/g, "\\'")}'`)
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const rewriteCode = enableStreaming.value ?
    `// Use streaming API for real-time updates
const stream = await rewriter.rewriteStreaming(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Please rewrite this sentence to be more formal.'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}` :
    `// Use regular API for complete response
const result = await rewriter.rewrite(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Please rewrite this sentence to be more formal.'"}\
${optionsStr}
)`

  return `const available = await Rewriter.availability()
let rewriter

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  rewriter = await Rewriter.create()
} else {
  rewriter = await Rewriter.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(\`Downloaded \${e.loaded * 100}%\`)
      })
    }
  })
}

${rewriteCode}`
})

const exampleCode = computed(() => generateExampleCode.value)

let rewriter = null

onMounted(async () => {
  await checkSupport()
})

onUnmounted(() => {
  if (rewriter) {
    rewriter.destroy()
  }
  if (abortController.value) {
    abortController.value.abort()
  }
})

async function checkSupport() {
  try {
    if ('Rewriter' in window) {
      const availability = await Rewriter.availability()

      if (availability === 'unavailable') {
        isSupported.value = false
        error.value = 'Rewriter API is not supported in this browser'
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
      error.value = 'Rewriter API is not supported in this browser'
      downloadStatus.value = ''
    }
  } catch (err) {
    console.error('Failed to check availability:', err)
    error.value = err.message
  }
}

function cancelRewrite() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
}

async function rewriteText() {
  if (!isSupported.value || !inputText.value.trim()) return

  isProcessing.value = true
  error.value = ''
  result.value = ''
  abortController.value = new AbortController()

  try {
    const availability = await Rewriter.availability()

    if (availability === 'unavailable') {
      throw new Error('Rewriter API is not available for the current configuration')
    }

    const options = {
      tone: rewriteTone.value,
      format: rewriteFormat.value,
      length: rewriteLength.value,
      sharedContext: sharedContext.value || undefined,
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

    rewriter = await Rewriter.create(options)

    if (enableStreaming.value) {
      // Use streaming API
      const stream = await rewriter.rewriteStreaming(inputText.value)
      result.value = ''

      for await (const chunk of stream) {
        result.value += chunk
      }
    } else {
      // Use regular API
      const text = await rewriter.rewrite(inputText.value)
      result.value = text
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'Operation cancelled'
    } else {
      error.value = err.message || 'Failed to rewrite text'
      console.error('Rewriting error:', err)
    }
  } finally {
    isProcessing.value = false
    downloadStatus.value = ''
    downloadProgress.value = 0
  }
}
</script>