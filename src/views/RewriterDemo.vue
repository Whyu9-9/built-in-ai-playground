<template>
  <div class="space-y-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-arrow-path-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Rewriter API</h3>
          </div>
          <UButton
            @click="() => (toggleCodeCollapse = !toggleCodeCollapse)"
            icon="i-heroicons-code-bracket-20-solid"
          >
            {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <ApiExplainer :apiData="apiDocs.rewriter" />
        <div class="space-y-4" v-if="toggleCodeCollapse">
          <CodeExample :code="exampleCode" />
        </div>

        <UAlert
          v-if="downloadStatus"
          :color="downloadProgress === 100 ? 'primary' : 'secondary'"
          variant="subtle"
          :description="downloadStatus"
        />

        <div class="space-y-6">
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Input Text</h3>
            </div>
            <UTextarea
              v-model="inputText"
              placeholder="Enter the text you want to rewrite..."
              :rows="6"
              :disabled="!isSupported"
              class="w-full font-mono text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Transformation Type</h3>
              </div>
              <USelect
                v-model="transformationType"
                :items="transformationOptions"
                :disabled="!isSupported"
              />
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Output Format</h3>
              </div>
              <USelect v-model="outputFormat" :items="formatOptions" :disabled="!isSupported" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Length</h3>
              </div>
              <USelect v-model="contentLength" :items="lengthOptions" :disabled="!isSupported" />
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Style</h3>
              </div>
              <USelect v-model="writingStyle" :items="styleOptions" :disabled="!isSupported" />
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Additional Instructions (Optional)</h3>
            </div>
            <UTextarea
              v-model="additionalInstructions"
              placeholder="Add any specific instructions for the rewriting process"
              :rows="2"
              :disabled="!isSupported"
              class="w-full"
            />
          </div>

          <div class="space-y-4">
            <StreamingToggle v-model="enableStreaming" :disabled="!isSupported" />
          </div>

          <div class="flex gap-2">
            <UButton
              @click="rewriteText"
              :loading="isProcessing"
              :disabled="!isSupported || !canProcess"
              color="primary"
              size="md"
            >
              Rewrite Text
            </UButton>
            <UButton
              v-if="isProcessing"
              @click="cancelRewriting"
              color="error"
              variant="soft"
              size="md"
            >
              Cancel
            </UButton>
          </div>

          <div v-if="error" class="mt-4">
            <UAlert color="error" variant="subtle" :title="error" />
          </div>

          <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-gray-500 mb-2">Rewritten Text</h3>
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
const enableStreaming = ref(false)
const transformationType = ref('more-formal')
const outputFormat = ref('markdown')
const contentLength = ref('medium')
const writingStyle = ref('professional')
const additionalInstructions = ref('')

const transformationOptions = [
  {
    label: 'More Formal',
    value: 'more-formal',
    description: 'Make the text more formal and professional',
  },
  {
    label: 'More Casual',
    value: 'more-casual',
    description: 'Make the text more casual and conversational',
  },
  {
    label: 'More Creative',
    value: 'more-creative',
    description: 'Make the text more imaginative and engaging',
  },
  {
    label: 'More Concise',
    value: 'more-concise',
    description: 'Make the text shorter while preserving meaning',
  },
  {
    label: 'Longer',
    value: 'longer',
    description: 'Expand the text with more detail and explanation',
  },
  { label: 'Simpler', value: 'simpler', description: 'Use simpler language and shorter sentences' },
  {
    label: 'More Technical',
    value: 'more-technical',
    description: 'Use more technical and precise language',
  },
  {
    label: 'More Accessible',
    value: 'more-accessible',
    description: 'Make the text easier to understand',
  },
]

const formatOptions = [
  { label: 'Markdown', value: 'markdown', description: 'Formatted markdown text' },
  { label: 'Plain Text', value: 'plain-text', description: 'Standard unformatted text' },
]

const lengthOptions = [
  { label: 'Short', value: 'short', description: 'Concise version (preserve key points)' },
  { label: 'Medium', value: 'medium', description: 'Balanced length (similar to original)' },
  { label: 'Long', value: 'long', description: 'Expanded version (add detail)' },
]

const styleOptions = [
  { label: 'Professional', value: 'professional', description: 'Formal, business-like tone' },
  { label: 'Casual', value: 'casual', description: 'Informal, conversational tone' },
  { label: 'Creative', value: 'creative', description: 'Imaginative, engaging tone' },
  { label: 'Academic', value: 'academic', description: 'Scholarly, research-based tone' },
  { label: 'Technical', value: 'technical', description: 'Precise, technical language' },
]

const canProcess = computed(() => {
  return inputText.value.trim() !== ''
})

const formattedResult = computed(() => {
  if (!result.value) return ''

  if (outputFormat.value === 'markdown') {
    // Convert markdown to HTML for display
    return result.value
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/g, '<br><br>')
  }

  return result.value
})

const generateExampleCode = computed(() => {
  const options = []

  if (transformationType.value !== 'more-formal') {
    options.push(`type: '${transformationType.value}'`)
  }
  if (outputFormat.value !== 'markdown') {
    options.push(`format: '${outputFormat.value}'`)
  }
  if (contentLength.value !== 'medium') {
    options.push(`length: '${contentLength.value}'`)
  }
  if (writingStyle.value !== 'professional') {
    options.push(`style: '${writingStyle.value}'`)
  }
  if (additionalInstructions.value) {
    options.push(`instructions: '${additionalInstructions.value.replace(/'/g, "\\'")}'`)
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const rewriteCode = enableStreaming.value
    ? `// Use streaming API for real-time updates
const stream = await rewriter.rewriteStreaming(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Text to rewrite'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}`
    : `// Use regular API for complete response
const result = await rewriter.rewrite(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Text to rewrite'"}\
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

function cancelRewriting() {
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
      type: transformationType.value,
      format: outputFormat.value,
      length: contentLength.value,
      style: writingStyle.value,
      instructions: additionalInstructions.value,
      signal: abortController.value.signal,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          downloadProgress.value = e.loaded * 100
          downloadStatus.value = 'Downloading model...'
        })
      },
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
      const rewritten = await rewriter.rewrite(inputText.value)
      result.value = rewritten
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
