<template>
  <div class="space-y-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-code-bracket-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Translator API</h3>
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
        <ApiExplainer :apiData="apiDocs.translator" />
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
          <div class="grid grid-cols-2 gap-4">
            <USelect
              v-model="sourceLanguage"
              :items="languageOptions"
              :disabled="!isSupported"
              placeholder="Source Language"
            />
            <USelect
              v-model="targetLanguage"
              :items="languageOptions"
              :disabled="!isSupported"
              placeholder="Target Language"
            />
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <h3 class="font-medium">Input Text</h3>
            </div>
            <UTextarea
              v-model="inputText"
              placeholder="Enter text to translate..."
              :rows="4"
              :disabled="!isSupported"
              class="w-full"
            />
          </div>

          <div class="space-y-4">
            <StreamingToggle v-model="enableStreaming" :disabled="!isSupported" />
          </div>

          <div class="flex gap-2">
            <UButton
              @click="translateText"
              :loading="isProcessing"
              :disabled="!isSupported || !canProcess"
              color="primary"
              size="md"
            >
              Translate
            </UButton>
            <UButton
              v-if="isProcessing"
              @click="cancelTranslation"
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
            <h3 class="text-gray-500 mb-2">Translated Text</h3>
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
import ApiExplainer from '../components/ApiExplainer.vue'
import StreamingToggle from '../components/StreamingToggle.vue'
import { apiDocs } from '../data/apiDocs.js'

const inputText = ref('')
const sourceLanguage = ref('en')
const targetLanguage = ref('fr')
const result = ref('')
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)
const enableStreaming = ref(false)

const languageOptions = [
  { label: 'Afrikaans', value: 'af' },
  { label: 'Albanian', value: 'sq' },
  { label: 'Amharic', value: 'am' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Armenian', value: 'hy' },
  { label: 'Azerbaijani', value: 'az' },
  { label: 'Balochi', value: 'bal' },
  { label: 'Basque', value: 'eu' },
  { label: 'Belarusian', value: 'be' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Bosnian', value: 'bs' },
  { label: 'Bulgarian', value: 'bg' },
  { label: 'Catalan', value: 'ca' },
  { label: 'Chichewa', value: 'ny' },
  { label: 'Chinese (Simplified)', value: 'zh' },
  { label: 'Croatian', value: 'hr' },
  { label: 'Czech', value: 'cs' },
  { label: 'Danish', value: 'da' },
  { label: 'Dari', value: 'prs' },
  { label: 'Dutch', value: 'nl' },
  { label: 'English', value: 'en' },
  { label: 'Estonian', value: 'et' },
  { label: 'Faroese', value: 'fo' },
  { label: 'Filipino', value: 'fil' },
  { label: 'Finnish', value: 'fi' },
  { label: 'French', value: 'fr' },
  { label: 'Galician', value: 'gl' },
  { label: 'Georgian', value: 'ka' },
  { label: 'German', value: 'de' },
  { label: 'Greek', value: 'el' },
  { label: 'Greenlandic', value: 'kl' },
  { label: 'Gujarati', value: 'gu' },
  { label: 'Hausa', value: 'ha' },
  { label: 'Hebrew', value: 'he' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Hungarian', value: 'hu' },
  { label: 'Icelandic', value: 'is' },
  { label: 'Igbo', value: 'ig' },
  { label: 'Indonesian', value: 'id' },
  { label: 'Irish', value: 'ga' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Kannada', value: 'kn' },
  { label: 'Kashmiri', value: 'ks' },
  { label: 'Kazakh', value: 'kk' },
  { label: 'Khmer', value: 'km' },
  { label: 'Kinyarwanda', value: 'rw' },
  { label: 'Kirundi', value: 'rn' },
  { label: 'Kongo', value: 'kg' },
  { label: 'Korean', value: 'ko' },
  { label: 'Kurdish', value: 'ku' },
  { label: 'Kyrgyz', value: 'ky' },
  { label: 'Lao', value: 'lo' },
  { label: 'Latvian', value: 'lv' },
  { label: 'Lingala', value: 'ln' },
  { label: 'Lithuanian', value: 'lt' },
  { label: 'Luxembourgish', value: 'lb' },
  { label: 'Macedonian', value: 'mk' },
  { label: 'Malagasy', value: 'mg' },
  { label: 'Malay', value: 'ms' },
  { label: 'Malayalam', value: 'ml' },
  { label: 'Maltese', value: 'mt' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Mauritian Creole', value: 'mfe' },
  { label: 'Mongolian', value: 'mn' },
  { label: 'Montenegrin', value: 'cnr' },
  { label: 'Myanmar', value: 'my' },
  { label: 'Ndebele', value: 'nd' },
  { label: 'Nepali', value: 'ne' },
  { label: 'Norwegian', value: 'no' },
  { label: 'Oromo', value: 'om' },
  { label: 'Pashto', value: 'ps' },
  { label: 'Pedi', value: 'nso' },
  { label: 'Persian', value: 'fa' },
  { label: 'Polish', value: 'pl' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Russian', value: 'ru' },
  { label: 'Sami', value: 'se' },
  { label: 'Scottish Gaelic', value: 'gd' },
  { label: 'Serbian', value: 'sr' },
  { label: 'Seychellois Creole', value: 'crs' },
  { label: 'Shona', value: 'sn' },
  { label: 'Sindhi', value: 'sd' },
  { label: 'Sinhala', value: 'si' },
  { label: 'Slovak', value: 'sk' },
  { label: 'Slovenian', value: 'sl' },
  { label: 'Somali', value: 'so' },
  { label: 'Sotho', value: 'st' },
  { label: 'Spanish', value: 'es' },
  { label: 'Swahili', value: 'sw' },
  { label: 'Swati', value: 'ss' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Tajik', value: 'tg' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Thai', value: 'th' },
  { label: 'Tigrinya', value: 'ti' },
  { label: 'Tsonga', value: 'ts' },
  { label: 'Tswana', value: 'tn' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Turkmen', value: 'tk' },
  { label: 'Ukrainian', value: 'uk' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Uzbek', value: 'uz' },
  { label: 'Venda', value: 've' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Welsh', value: 'cy' },
  { label: 'Xhosa', value: 'xh' },
  { label: 'Yoruba', value: 'yo' },
  { label: 'Zulu', value: 'zu' },
  // Add more as needed
]

const canProcess = computed(() => {
  return (
    inputText.value.trim() !== '' &&
    sourceLanguage.value &&
    targetLanguage.value &&
    sourceLanguage.value !== targetLanguage.value
  )
})

let translator = null

const generateExampleCode = computed(() => {
  const options = []

  if (targetLanguage.value !== 'en') {
    options.push(`targetLang: '${targetLanguage.value}'`)
  }
  if (sourceLanguage.value !== 'auto') {
    options.push(`sourceLang: '${sourceLanguage.value}'`)
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const translateCode = enableStreaming.value
    ? `// Use streaming API for real-time updates
const stream = await translator.translateStreaming(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Text to translate goes here...'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}`
    : `// Use regular API for complete response
const result = await translator.translate(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Text to translate goes here...'"}\
${optionsStr}
)`

  return `const available = await Translator.availability()
let translator

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  translator = await Translator.create()
} else {
  translator = await Translator.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(\`Downloaded \${e.loaded * 100}%\`)
      })
    }
  })
}

${translateCode}`
})

const exampleCode = computed(() => generateExampleCode.value)

onMounted(async () => {
  await checkSupport()
})

onUnmounted(() => {
  if (abortController.value) {
    abortController.value.abort()
  }
})

async function checkSupport() {
  try {
    if ('Translator' in window) {
      // Check if at least one language pair is available
      const availability = await Translator.availability({
        sourceLanguage: sourceLanguage.value,
        targetLanguage: targetLanguage.value,
      })
      if (availability === 'unavailable') {
        isSupported.value = false
        error.value = 'Translator API is not supported for this language pair in this browser.'
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
      error.value = 'Translator API is not supported in this browser.'
      downloadStatus.value = ''
    }
  } catch (err) {
    error.value = err.message
    isSupported.value = false
  }
}

function cancelTranslation() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
}

async function translateText() {
  if (!isSupported.value || !inputText.value.trim()) return

  isProcessing.value = true
  error.value = ''
  result.value = ''
  abortController.value = new AbortController()

  try {
    const availability = await Translator.availability({
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
    })
    if (availability === 'unavailable') {
      throw new Error('Translator API is not available for the selected language pair.')
    }

    const options = {
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value,
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

    translator = await Translator.create(options)

    if (enableStreaming.value) {
      // Use streaming API for real-time updates
      const stream = await translator.translateStreaming(inputText.value)
      result.value = ''

      for await (const chunk of stream) {
        result.value += chunk
      }
    } else {
      // Use regular API for complete response
      const translated = await translator.translate(inputText.value)
      result.value = translated
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'Operation cancelled'
    } else {
      error.value = err.message || 'Failed to translate text'
      console.error('Translation error:', err)
    }
  } finally {
    isProcessing.value = false
    downloadStatus.value = ''
    downloadProgress.value = 0
  }
}
</script>
