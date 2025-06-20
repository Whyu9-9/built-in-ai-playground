<template>
  <div class="rounded-xl p-6" style="background-color: var(--ui-bg); border: 1px solid var(--ui-border)">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-cpu-chip" class="text-primary text-4xl" />
        <div>
          <h2 class="text-xl font-bold" style="color: var(--ui-text)">API Status</h2>
          <p style="color: var(--ui-text-muted)">Check which AI APIs are available in your browser</p>
        </div>
      </div>
      <UButton v-if="!hasChecked" @click="onCheckSupport" color="primary" size="lg">
        <div class="i-heroicons-play mr-2" />
        Check API Support
      </UButton>
    </div>

    <!-- Enable Flags Warning -->
    <UAlert v-if="showEnableFlagsInstruction && hasChecked" title="Some APIs are not supported" color="warning"
      variant="subtle" class="mb-6">
      <template #description>
        <div class="space-y-2">
          <p>To enable built-in AI features, please enable 'Experimental Web Platform features' in your browser.</p>
          <div class="flex items-center gap-2 text-sm">
            <div class="i-heroicons-information-circle" />
            <span>For Chrome: <code
                class="bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 px-2 py-1 rounded">chrome://flags/#enable-experimental-web-platform-features</code></span>
          </div>
        </div>
      </template>
    </UAlert>

    <!-- API Status Grid -->
    <div v-if="hasChecked" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="api in apiList" :key="api.key" class="rounded-lg p-4 transition-colors hover:opacity-80"
        style="background-color: var(--ui-bg-elevated); border: 1px solid var(--ui-border)">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="apiStatus[api.key].supported ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'">
            <div
              :class="apiStatus[api.key].supported ? 'i-heroicons-check text-green-600 dark:text-green-400' : 'i-heroicons-x-mark text-red-600 dark:text-red-400'" />
          </div>
          <div>
            <h3 class="font-medium" style="color: var(--ui-text)">{{ api.name }}</h3>
            <UBadge :color="apiStatus[api.key].supported ? 'primary' : 'error'" variant="subtle" size="sm">
              {{ apiStatus[api.key].status }}
            </UBadge>
          </div>
        </div>

        <!-- Download Progress -->
        <div v-if="apiStatus[api.key].downloadProgress !== null" class="mt-3">
          <div class="flex items-center justify-between text-xs mb-1" style="color: var(--ui-text-muted)">
            <span>Downloading model...</span>
            <span>{{ Math.round(apiStatus[api.key].downloadProgress * 100) }}%</span>
          </div>
          <div class="w-full rounded-full h-2" style="background-color: var(--ui-border)">
            <div class="h-2 rounded-full transition-all duration-300" style="background-color: var(--color-primary-500)"
              :style="{ width: `${apiStatus[api.key].downloadProgress * 100}%` }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <UAlert v-if="error" :title="error" color="error" variant="subtle" class="mt-6" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const apiList = [
  { key: 'summarizer', name: 'Summarizer API' },
  { key: 'writer', name: 'Writer API' },
  { key: 'rewriter', name: 'Rewriter API' },
  { key: 'translator', name: 'Translator API' },
  { key: 'languageDetector', name: 'Language Detector API' },
  { key: 'prompt', name: 'Prompt API' },
]

const apiStatus = ref({
  summarizer: { supported: false, status: 'Checking...', downloadProgress: null },
  writer: { supported: false, status: 'Checking...', downloadProgress: null },
  rewriter: { supported: false, status: 'Checking...', downloadProgress: null },
  translator: { supported: false, status: 'Checking...', downloadProgress: null },
  languageDetector: { supported: false, status: 'Checking...', downloadProgress: null },
  prompt: { supported: false, status: 'Checking...', downloadProgress: null }
})

const error = ref('')
const hasChecked = ref(false)
let checkInterval = null

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
      checkSingleApi({ key: 'summarizer', globalName: 'Summarizer', monitorDownload: true }),
      checkSingleApi({ key: 'writer', globalName: 'Writer', monitorDownload: true }),
      checkSingleApi({ key: 'rewriter', globalName: 'Rewriter', monitorDownload: true }),
      checkSingleApi({
        key: 'translator',
        globalName: 'Translator',
        availabilityArgs: { sourceLanguage: 'en', targetLanguage: 'fr' },
        createArgs: { sourceLanguage: 'en', targetLanguage: 'fr' },
        monitorDownload: true
      }),
      checkSingleApi({ key: 'languageDetector', globalName: 'LanguageDetector', monitorDownload: true }),
      checkSingleApi({ key: 'prompt', globalName: 'LanguageModel', monitorDownload: true })
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