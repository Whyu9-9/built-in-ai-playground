<template>
  <div class="space-y-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-pencil-square-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Writer API</h3>
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
        <ApiExplainer :apiData="apiDocs.writer" />
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
              <h3 class="font-medium">Writing Task Prompt</h3>
            </div>
            <UTextarea
              v-model="writingPrompt"
              placeholder="Describe what you want to write (e.g., 'Write a blog post about AI', 'Create a product description')"
              :rows="3"
              :disabled="!isSupported"
              class="w-full"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Output Format</h3>
              </div>
              <USelect v-model="outputFormat" :items="formatOptions" :disabled="!isSupported" />
            </div>

            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <h3 class="font-medium">Length</h3>
              </div>
              <USelect v-model="contentLength" :items="lengthOptions" :disabled="!isSupported" />
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Writing Style</h3>
            </div>
            <USelect v-model="writingStyle" :items="styleOptions" :disabled="!isSupported" />
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Additional Context (Optional)</h3>
            </div>
            <UTextarea
              v-model="additionalContext"
              placeholder="Add any additional context, requirements, or specific instructions for the writing task"
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
              @click="generateContent"
              :loading="isProcessing"
              :disabled="!isSupported || !canProcess"
              color="primary"
              size="md"
            >
              Generate Content
            </UButton>
            <UButton
              v-if="isProcessing"
              @click="cancelGeneration"
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
            <h3 class="text-gray-500 mb-2">Generated Content</h3>
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

const writingPrompt = ref('')
const result = ref('')
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)
const enableStreaming = ref(false)
const outputFormat = ref('markdown')
const contentLength = ref('medium')
const writingStyle = ref('professional')
const additionalContext = ref('')

const formatOptions = [
  { label: 'Markdown', value: 'markdown', description: 'Formatted markdown text' },
  { label: 'Plain Text', value: 'plain-text', description: 'Standard unformatted text' },
]

const lengthOptions = [
  { label: 'Short', value: 'short', description: 'Concise content (1-2 paragraphs)' },
  { label: 'Medium', value: 'medium', description: 'Balanced length (3-5 paragraphs)' },
  { label: 'Long', value: 'long', description: 'Detailed content (6+ paragraphs)' },
]

const styleOptions = [
  { label: 'Professional', value: 'professional', description: 'Formal, business-like tone' },
  { label: 'Casual', value: 'casual', description: 'Informal, conversational tone' },
  { label: 'Creative', value: 'creative', description: 'Imaginative, engaging tone' },
  { label: 'Academic', value: 'academic', description: 'Scholarly, research-based tone' },
  { label: 'Technical', value: 'technical', description: 'Precise, technical language' },
]

const canProcess = computed(() => {
  return writingPrompt.value.trim() !== ''
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

  if (outputFormat.value !== 'markdown') {
    options.push(`format: '${outputFormat.value}'`)
  }
  if (contentLength.value !== 'medium') {
    options.push(`length: '${contentLength.value}'`)
  }
  if (writingStyle.value !== 'professional') {
    options.push(`style: '${writingStyle.value}'`)
  }
  if (additionalContext.value) {
    options.push(`context: '${additionalContext.value.replace(/'/g, "\\'")}'`)
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const writeCode = enableStreaming.value
    ? `// Use streaming API for real-time updates
const stream = await writer.writeStreaming(
  ${writingPrompt.value ? `'${writingPrompt.value.replace(/'/g, "\\'")}'` : "'Writing task prompt'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}`
    : `// Use regular API for complete response
const result = await writer.write(
  ${writingPrompt.value ? `'${writingPrompt.value.replace(/'/g, "\\'")}'` : "'Writing task prompt'"}\
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

function cancelGeneration() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
}

async function generateContent() {
  if (!isSupported.value || !writingPrompt.value.trim()) return

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
      format: outputFormat.value,
      length: contentLength.value,
      style: writingStyle.value,
      context: additionalContext.value,
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

    writer = await Writer.create(options)

    if (enableStreaming.value) {
      // Use streaming API
      const stream = await writer.writeStreaming(writingPrompt.value)
      result.value = ''

      for await (const chunk of stream) {
        result.value += chunk
      }
    } else {
      // Use regular API
      const content = await writer.write(writingPrompt.value)
      result.value = content
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'Operation cancelled'
    } else {
      error.value = err.message || 'Failed to generate content'
      console.error('Content generation error:', err)
    }
  } finally {
    isProcessing.value = false
    downloadStatus.value = ''
    downloadProgress.value = 0
  }
}
</script>
