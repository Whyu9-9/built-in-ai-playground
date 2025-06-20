<template>
    <div class="space-y-8">
        <UAlert v-if="!isSupported" title="API Not Supported" color="error" variant="subtle"
            description="This feature requires enabling Experimental Web Platform features in your browser."
            class="mb-4" />
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="i-heroicons-code-bracket-20-solid text-lg" />
                        <h3 class="text-lg font-semibold">Language Detector API</h3>
                    </div>
                    <UButton @click="() => toggleCodeCollapse = !toggleCodeCollapse"
                        icon="i-heroicons-code-bracket-20-solid">
                        {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
                    </UButton>
                </div>
            </template>

            <div class="space-y-4">
                <ApiExplainer :apiData="apiDocs.languageDetector" />
                <div class="space-y-4" v-if="toggleCodeCollapse">
                    <CodeExample :code="exampleCode" />

                </div>

                <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'"
                    variant="subtle" :description="downloadStatus" />

                <div class="space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-center gap-2">
                            <h3 class="font-medium">Input Text</h3>
                        </div>
                        <UTextarea v-model="inputText" placeholder="Enter text to detect language..." :rows="4"
                            :disabled="!isSupported" class="w-full" />
                    </div>

                    <div class="flex gap-2">
                        <UButton @click="detectLanguage" :loading="isProcessing" :disabled="!isSupported || !canProcess"
                            color="primary" size="md">
                            Detect Language
                        </UButton>
                        <UButton v-if="isProcessing" @click="cancelDetection" color="error" variant="soft" size="md">
                            Cancel
                        </UButton>
                    </div>

                    <div v-if="error" class="mt-4">
                        <UAlert color="error" variant="subtle" :title="error" />
                    </div>

                    <div v-if="results.length" class="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 class="text-gray-500 mb-2">Detected Languages</h3>
                        <ul>
                            <li v-for="(res, idx) in results" :key="idx">
                                <span class="font-mono">{{ res.detectedLanguage }}</span>
                                <span class="ml-2 text-xs text-gray-500">Confidence: {{ (res.confidence *
                                    100).toFixed(2)
                                }}%</span>
                            </li>
                        </ul>
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
import { apiDocs } from '../data/apiDocs.js'

const inputText = ref('')
const results = ref([])
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)

const canProcess = computed(() => inputText.value.trim().length > 3)

let detector = null

const generateExampleCode = computed(() => {
    return `const available = await LanguageDetector.availability()
let detector

if (available === 'unavailable') {
    return
}

if (available === 'available') {
    detector = await LanguageDetector.create()
} else {
    detector = await LanguageDetector.create({
        monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
                console.log(\`Downloaded \${e.loaded * 100}%\`)
            })
        }
    })
}

const result = await detector.detect(
    ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Text to detect language from goes here...'"}\
)`
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
        if ('LanguageDetector' in window) {
            const availability = await LanguageDetector.availability()
            if (availability === 'unavailable') {
                isSupported.value = false
                error.value = 'Language Detector API is not supported in this browser.'
                downloadStatus.value = ''
            } else {
                isSupported.value = true
                if (availability === 'downloadable' || availability === 'downloading') {
                    downloadStatus.value = 'Model needs to be downloaded. This may take a few moments.'
                } else {
                    downloadStatus.value = ''
                }
            }
        } else {
            isSupported.value = false
            error.value = 'Language Detector API is not supported in this browser.'
            downloadStatus.value = ''
        }
    } catch (err) {
        error.value = err.message
        isSupported.value = false
    }
}

function cancelDetection() {
    if (abortController.value) {
        abortController.value.abort()
        abortController.value = null
    }
}

async function detectLanguage() {
    if (!isSupported.value || inputText.value.trim().length < 4) return

    isProcessing.value = true
    error.value = ''
    results.value = []
    abortController.value = new AbortController()

    try {
        const availability = await LanguageDetector.availability()
        if (availability === 'unavailable') {
            throw new Error('Language Detector API is not available.')
        }

        const options = {
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

        detector = await LanguageDetector.create(options)
        await detector.ready
        const detected = await detector.detect(inputText.value)
        results.value = detected
    } catch (err) {
        if (err.name === 'AbortError') {
            error.value = 'Operation cancelled'
        } else {
            error.value = err.message || 'Failed to detect language'
            console.error('Detection error:', err)
        }
    } finally {
        isProcessing.value = false
        downloadStatus.value = ''
        downloadProgress.value = 0
    }
}
</script>