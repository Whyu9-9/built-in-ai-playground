<template>
  <div class="space-y-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-code-bracket-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Proofreader API</h3>
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
        <ApiExplainer :apiData="apiDocs.proofreader" />
        <div class="space-y-4" v-if="toggleCodeCollapse">
          <CodeExample :code="exampleCode" />
        </div>

        <UAlert
          v-if="downloadStatus"
          :color="downloadProgress === 100 ? 'primary' : 'secondary'"
          variant="subtle"
          :description="downloadStatus"
        />

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Input Text</h3>
          </div>
          <UTextarea
            v-model="inputText"
            placeholder="Enter text to proofread (e.g., 'I seen him yesterday at the store, and he bought two loafs of bread.')"
            :rows="4"
            :disabled="!isSupported"
            class="w-full"
          />
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Proofreader Options</h3>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Include Correction Types</label>
              <USwitch v-model="includeCorrectionTypes" :disabled="!isSupported" />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Include Explanations</label>
              <USwitch v-model="includeCorrectionExplanations" :disabled="!isSupported" />
            </div>
          </div>
        </div>

        <div class="space-y-4" v-if="includeCorrectionExplanations">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Explanation Language</h3>
          </div>
          <USelect
            v-model="correctionExplanationLanguage"
            :items="explanationLanguageOptions"
            :disabled="!isSupported"
          />
        </div>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">Expected Input Languages</h3>
          </div>
          <USelectMenu
            v-model="expectedInputLanguages"
            :options="inputLanguageOptions"
            multiple
            :disabled="!isSupported"
            placeholder="Select expected input languages"
          />
        </div>

        <div class="space-y-4">
          <StreamingToggle v-model="enableStreaming" :disabled="true" />
        </div>

        <div class="flex gap-2">
          <UButton
            @click="proofreadText"
            :loading="isProcessing"
            :disabled="!isSupported || !canProcess"
            color="primary"
            size="md"
          >
            Proofread Text
          </UButton>
          <UButton v-if="isProcessing" @click="cancelProofreading" color="secondary" size="md">
            Cancel
          </UButton>
        </div>

        <div v-if="error" class="mt-4">
          <UAlert color="error" variant="subtle" :title="error" />
        </div>

        <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 class="text-gray-500 mb-2">Proofreading Results</h3>

          <!-- Corrected Text -->
          <div class="mb-4">
            {{ result.correctedInput }}
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

const inputText = ref('I seen him yesterday atss the store, and he bought twa loafs of bread.')
const includeCorrectionTypes = ref(true)
const includeCorrectionExplanations = ref(true)
const correctionExplanationLanguage = ref('en')
const expectedInputLanguages = ref(['en'])
const result = ref(null)
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)
const textAreaRef = ref(null)
const enableStreaming = ref(false) // Proofreader API does not support streaming
const explanationLanguageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' },
  { label: 'Chinese (Traditional)', value: 'zh-TW' },
]

const inputLanguageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' },
  { label: 'Chinese (Traditional)', value: 'zh-TW' },
  { label: 'Russian', value: 'ru' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Hindi', value: 'hi' },
]

const canProcess = computed(() => {
  return inputText.value.trim() !== ''
})

const generateExampleCode = computed(() => {
  const options = []

  if (includeCorrectionTypes.value) {
    options.push(`includeCorrectionTypes: true`)
  }
  if (includeCorrectionExplanations.value) {
    options.push(`includeCorrectionExplanations: true`)
  }
  if (includeCorrectionExplanations.value && correctionExplanationLanguage.value !== 'en') {
    options.push(`correctionExplanationLanguage: '${correctionExplanationLanguage.value}'`)
  }
  if (expectedInputLanguages.value.length > 0) {
    options.push(`expectedInputLanguages: ${JSON.stringify(expectedInputLanguages.value)}`)
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const proofreadCode = `// Use regular API for complete response
const result = await proofreader.proofread(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'I seen him yesterday at the store, and he bought two loafs of bread.'"}\
${optionsStr}
)`

  return `const available = await Proofreader.availability()
let proofreader

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  proofreader = await Proofreader.create()
} else {
  proofreader = await Proofreader.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(\`Downloaded \${e.loaded * 100}%\`)
      })
    }${optionsStr}
  })
}

${proofreadCode}`
})

const exampleCode = computed(() => generateExampleCode.value)

const highlightedParts = computed(() => {
  if (!result.value || !result.value.corrections) return []
  const parts = []
  let lastIdx = 0
  for (const corr of result.value.corrections) {
    if (corr.startIndex > lastIdx) {
      parts.push({ startIndex: lastIdx, endIndex: corr.startIndex })
    }
    parts.push({
      startIndex: corr.startIndex,
      endIndex: corr.endIndex,
      correction: corr.correction,
      type: corr.type,
      explanation: corr.explanation,
    })
    lastIdx = corr.endIndex
  }
  if (lastIdx < inputText.value.length) {
    parts.push({ startIndex: lastIdx, endIndex: inputText.value.length })
  }
  return parts
})

let proofreader = null

onMounted(async () => {
  await checkSupport()
})

onUnmounted(() => {
  if (proofreader) {
    proofreader.destroy()
  }
  if (abortController.value) {
    abortController.value.abort()
  }
})

async function checkSupport() {
  try {
    if ('Proofreader' in window) {
      const options = {
        includeCorrectionTypes: includeCorrectionTypes.value,
        includeCorrectionExplanations: includeCorrectionExplanations.value,
      }

      if (includeCorrectionExplanations.value && correctionExplanationLanguage.value) {
        options.correctionExplanationLanguage = correctionExplanationLanguage.value
      }

      if (expectedInputLanguages.value.length > 0) {
        options.expectedInputLanguages = expectedInputLanguages.value
      }

      const availability = await Proofreader.availability(options)

      if (availability === 'unavailable') {
        isSupported.value = false
        error.value = 'Proofreader API is not supported in this browser'
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
      error.value = 'Proofreader API is not supported in this browser'
      downloadStatus.value = ''
    }
  } catch (err) {
    console.error('Failed to check availability:', err)
    error.value = err.message
  }
}

function cancelProofreading() {
  if (abortController.value) {
    abortController.value.abort()
  }
}

async function proofreadText() {
  if (!isSupported.value || !inputText.value.trim()) return

  isProcessing.value = true
  error.value = ''
  result.value = null
  abortController.value = new AbortController()

  try {
    const options = {
      includeCorrectionTypes: includeCorrectionTypes.value,
      includeCorrectionExplanations: includeCorrectionExplanations.value,
      signal: abortController.value.signal,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          downloadProgress.value = e.loaded * 100
          downloadStatus.value = `Downloading model... ${Math.round(e.loaded * 100)}%`
        })
      },
    }

    if (includeCorrectionExplanations.value && correctionExplanationLanguage.value) {
      options.correctionExplanationLanguage = correctionExplanationLanguage.value
    }

    if (expectedInputLanguages.value.length > 0) {
      options.expectedInputLanguages = expectedInputLanguages.value
    }

    const availability = await Proofreader.availability(options)

    if (availability === 'unavailable') {
      throw new Error('Proofreader API is not available for the current configuration')
    }

    if (availability !== 'available') {
      downloadStatus.value = 'Model is being downloaded. Please wait...'
    }

    proofreader = await Proofreader.create(options)

    // Proofreader API does not support streaming, so always use regular API
    const res = await proofreader.proofread(inputText.value)
    console.log('Proofreader result:', res)
    result.value = res
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'Operation cancelled'
    } else {
      error.value = err.message || 'Failed to proofread.'
      console.error('Proofreading error:', err)
    }
  } finally {
    isProcessing.value = false
    downloadStatus.value = ''
    downloadProgress.value = 0
  }
}
</script>
