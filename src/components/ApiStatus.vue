<template>
  <div>
    <UAlert v-if="showEnableFlagsInstruction && hasChecked" title="Some APIs are not supported" color="warning"
      variant="subtle"
      description="To enable built-in AI features, please enable 'Experimental Web Platform features' in your browser. For Chrome, go to chrome://flags/#enable-experimental-web-platform-features, enable the flag, and restart your browser."
      class="mb-4" />
    <UButton v-if="!hasChecked" @click="onCheckSupport" color="primary" class="mb-4">
      Check API Support
    </UButton>
    <UCard v-if="hasChecked">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">API Status</h3>
        </div>
      </template>

      <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="api in apiList" :key="api.key" class="space-y-2">
            <h4 class="text-sm font-medium mb-1">{{ api.name }}</h4>
            <UBadge :color="apiStatus[api.key].supported ? 'primary' : 'error'" variant="subtle"
              class="w-full justify-center">
              {{ apiStatus[api.key].status }}
            </UBadge>
            <p v-if="apiStatus[api.key].downloadProgress !== null" class="text-xs text-gray-500 mt-1">
              Downloading: {{ Math.round(apiStatus[api.key].downloadProgress * 100) }}%
            </p>
          </div>
        </div>
        <div v-if="error" class="mt-4">
          <UAlert :title="error" color="error" variant="subtle" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const apiList = [
  {
    key: 'summarizer',
    name: 'Summarizer API',
  },
  {
    key: 'writer',
    name: 'Writer API',

  },
  {
    key: 'rewriter',
    name: 'Rewriter API',

  },
  {
    key: 'translator',
    name: 'Translator API',

  },
  {
    key: 'languageDetector',
    name: 'Language Detector API',

  },
  {
    key: 'prompt',
    name: 'Prompt API',

  },
]

const apiStatus = ref({
  summarizer: {
    supported: false,
    status: 'Checking...',
    downloadProgress: null
  },
  writer: {
    supported: false,
    status: 'Checking...',
    downloadProgress: null
  },
  rewriter: {
    supported: false,
    status: 'Checking...',
    downloadProgress: null
  },
  translator: {
    supported: false,
    status: 'Checking...',
    downloadProgress: null
  },
  languageDetector: {
    supported: false,
    status: 'Checking...',
    downloadProgress: null
  },
  prompt: {
    supported: false,
    status: 'Checking...',
    downloadProgress: null
  }
})
const error = ref('')
let checkInterval = null
const hasChecked = ref(false)

function onCheckSupport() {
  hasChecked.value = true
  checkApiStatus()
}

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})

async function checkSingleApi({ key, globalName, availabilityArgs = {}, createArgs = {}, monitorDownload = false }) {
  if (globalName in self) {
    const apiObj = self[globalName]
    let availability

    try {
      availability = await apiObj.availability(availabilityArgs)
    } catch (err) {
      apiStatus.value[key].supported = false
      apiStatus.value[key].status = 'Error'
      apiStatus.value[key].downloadProgress = null
      return
    }
    if (availability === 'unavailable') {
      apiStatus.value[key].supported = false
      apiStatus.value[key].status = 'Not Supported'
      apiStatus.value[key].downloadProgress = null
    } else {
      apiStatus.value[key].supported = true
      if (availability !== 'available') {
        apiStatus.value[key].status = 'Downloading'
        if (monitorDownload && typeof apiObj.create === 'function') {
          try {
            createArgs.monitor = (m) => {
              m.addEventListener('downloadprogress', e => {
                apiStatus.value[key].downloadProgress = e.loaded
              })
            }
            await apiObj.create(createArgs)
          } catch (err) {
            // If monitoring fails, just log and continue
            console.error(`Failed to monitor ${globalName} download:`, err)
          }
        }
      } else {
        apiStatus.value[key].status = 'Available'
        apiStatus.value[key].downloadProgress = null
      }
    }
  } else {
    apiStatus.value[key].supported = false
    apiStatus.value[key].status = 'Not Supported'
    apiStatus.value[key].downloadProgress = null
  }
}

async function checkApiStatus() {
  try {
    await Promise.all([
      checkSingleApi({
        key: 'summarizer',
        globalName: 'Summarizer',
        availabilityArgs: null,
        monitorDownload: true
      }),
      checkSingleApi({
        key: 'writer',
        globalName: 'Writer',
        availabilityArgs: null,
        monitorDownload: true
      }),
      checkSingleApi({
        key: 'rewriter',
        globalName: 'Rewriter',
        availabilityArgs: null,
        monitorDownload: true
      }),
      checkSingleApi({
        key: 'translator',
        globalName: 'Translator',
        availabilityArgs: { sourceLanguage: 'en', targetLanguage: 'fr' },
        createArgs: { sourceLanguage: 'en', targetLanguage: 'fr' },
        monitorDownload: true
      }),
      checkSingleApi({
        key: 'languageDetector',
        globalName: 'LanguageDetector',
        availabilityArgs: null,
        monitorDownload: true
      }),
      checkSingleApi({
        key: 'prompt',
        globalName: 'LanguageModel',
        availabilityArgs: null,
        monitorDownload: true
      })
    ])
    error.value = ''
  } catch (err) {
    error.value = err.message || 'Failed to check API status'
    console.error('API status check error:', err)
  }
}

const unsupportedApis = computed(() =>
  apiList.filter(api => !apiStatus.value[api.key].supported)
)
const showEnableFlagsInstruction = computed(() =>
  unsupportedApis.value.length > 0
)
</script>