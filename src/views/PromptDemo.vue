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
                        <h3 class="text-lg font-semibold">Prompt API</h3>
                    </div>
                    <UButton @click="() => toggleCodeCollapse = !toggleCodeCollapse"
                        icon="i-heroicons-code-bracket-20-solid">
                        {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
                    </UButton>
                </div>
            </template>

            <div class="space-y-4">
                <ApiExplainer :apiData="apiDocs.prompt" />
                <div class="space-y-4" v-if="toggleCodeCollapse">
                    <CodeExample :code="exampleCode" />
                </div>

                <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'"
                    variant="subtle" :description="downloadStatus" />

                <div class="space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-center gap-2">
                            <h3 class="font-medium">Prompt</h3>
                        </div>
                        <UTextarea v-model="inputText" placeholder="Enter your prompt..." :rows="4"
                            :disabled="!isSupported" class="w-full" />
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-2">
                            <h3 class="font-medium">Output Type</h3>
                        </div>
                        <USelect v-model="outputType" :items="outputTypeOptions" :disabled="!isSupported" />
                    </div>

                    <div v-if="outputType === 'structured'" class="space-y-4">
                        <div class="flex items-center gap-2">
                            <h3 class="font-medium">Structure Instructions / JSON Schema</h3>
                        </div>
                        <UTextarea v-model="structureSchema"
                            placeholder="Enter JSON schema or instructions for structured output..." :rows="4"
                            :disabled="!isSupported" class="w-full font-mono text-sm" />
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-2">
                            <h3 class="font-medium">Initial Prompts (optional)</h3>
                        </div>
                        <div v-for="(prompt, idx) in initialPrompts" :key="idx" class="flex items-center gap-2 mb-2">
                            <USelect v-model="prompt.role" :items="roleOptions" class="w-32" />
                            <UInput v-model="prompt.content" placeholder="Prompt content..." class="flex-1" />
                            <UButton icon="i-heroicons-x-mark" color="gray" variant="soft" size="xs"
                                @click="removeInitialPrompt(idx)" />
                        </div>
                        <UButton icon="i-heroicons-plus" color="primary" variant="soft" size="xs"
                            @click="addInitialPrompt">
                            Add
                            Initial Prompt</UButton>
                    </div>

                    <div class="space-y-4">
                        <StreamingToggle v-model="enableStreaming" :disabled="!isSupported" />
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center gap-2">
                            <h3 class="font-medium">Parameters</h3>
                        </div>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Temperature: {{ temperature }}</label>
                                <USlider v-model="temperature" :min="minTemperature" :max="maxTemperature" :step="0.01"
                                    :disabled="!isSupported" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">TopK: {{ topK }}</label>
                                <USlider v-model="topK" :min="minTopK" :max="maxTopK" :step="1"
                                    :disabled="!isSupported" />
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <UButton @click="sendPrompt" :loading="isProcessing" :disabled="!isSupported || !canProcess"
                            color="primary" size="md">
                            Send Prompt
                        </UButton>
                        <UButton v-if="isProcessing" @click="cancelPrompt" color="error" variant="soft" size="md">
                            Cancel
                        </UButton>
                    </div>

                    <div v-if="error" class="mt-4">
                        <UAlert color="error" variant="subtle" :title="error" />
                    </div>

                    <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="text-gray-500">Response</h3>
                            <UButton @click="copyResult" :color="copied ? 'success' : 'gray'" variant="ghost" size="sm">
                                <template v-if="!copied">
                                    <div class="i-heroicons-clipboard mr-1" />
                                    Copy
                                </template>
                                <template v-else>
                                    <div class="i-heroicons-check mr-1" />
                                    Copied!
                                </template>
                            </UButton>
                        </div>
                        <div v-if="outputType === 'structured' && formattedResult"
                            class="whitespace-pre-wrap font-mono text-sm">{{
                                formattedResult }}</div>
                        <div v-else class="whitespace-pre-wrap">{{ result }}</div>
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
const temperature = ref(1.0)
const minTemperature = ref(0.0)
const maxTemperature = ref(2.0)
const topK = ref(3)
const minTopK = ref(1)
const maxTopK = ref(8)
const enableStreaming = ref(false)
const copied = ref(false)
let session = null


const outputType = ref('text')
const outputTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Structured', value: 'structured' }
]
const structureSchema = ref('')

// Initial Prompts
const initialPrompts = ref([])
const roleOptions = [
    { label: 'user', value: 'user' },
    { label: 'assistant', value: 'assistant' }
]

function addInitialPrompt() {
    initialPrompts.value.push({ role: 'user', content: '' })
}
function removeInitialPrompt(idx) {
    initialPrompts.value.splice(idx, 1)
}

const canProcess = computed(() => inputText.value.trim().length > 0)

const formattedResult = computed(() => {
    if (outputType.value === 'structured') {
        try {
            return JSON.stringify(JSON.parse(result.value), null, 2)
        } catch {
            return result.value
        }
    }
    return ''
})

const generateExampleCode = computed(() => {
    const options = []

    if (temperature.value !== 1.0) {
        options.push(`temperature: ${temperature.value}`)
    }
    if (topK.value !== 3) {
        options.push(`topK: ${topK.value}`)
    }

    const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

    const promptCode = enableStreaming.value ?
        `// Use streaming API for real-time updates
const stream = await model.promptStreaming(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Your prompt goes here'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}` :
        `// Use regular API for complete response
const result = await model.prompt(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Your prompt goes here'"}\
${optionsStr}
)`

    return `const available = await LanguageModel.availability()
let model

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  model = await LanguageModel.create()
} else {
  model = await LanguageModel.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(\`Downloaded \${e.loaded * 100}%\`)
      })
    }
  })
}

${promptCode}`
})

const exampleCode = computed(() => generateExampleCode.value)

async function copyResult() {
    try {
        await navigator.clipboard.writeText(result.value)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy:', err)
    }
}

onMounted(async () => {
    await fetchParams()
    await checkSupport()
})

onUnmounted(() => {
    if (abortController.value) {
        abortController.value.abort()
    }
    if (session) {
        session.destroy()
    }
})

async function fetchParams() {
    if ('LanguageModel' in window && LanguageModel.params) {
        try {
            const params = await LanguageModel.params()
            temperature.value = params.defaultTemperature
            minTemperature.value = 0.0
            maxTemperature.value = params.maxTemperature
            topK.value = params.defaultTopK
            minTopK.value = 1
            maxTopK.value = params.maxTopK
        } catch (e) {
            // fallback to defaults
        }
    }
}

async function checkSupport() {
    try {
        if ('LanguageModel' in window) {
            const availability = await LanguageModel.availability()
            if (availability === 'unavailable') {
                isSupported.value = false
                error.value = 'Prompt API is not supported in this browser.'
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
            error.value = 'Prompt API is not supported in this browser.'
            downloadStatus.value = ''
        }
    } catch (err) {
        error.value = err.message
        isSupported.value = false
    }
}

function cancelPrompt() {
    if (abortController.value) {
        abortController.value.abort()
        abortController.value = null
    }
}

async function sendPrompt() {
    if (!isSupported.value || !inputText.value.trim()) return

    isProcessing.value = true
    error.value = ''
    result.value = ''
    abortController.value = new AbortController()

    try {
        const availability = await LanguageModel.availability()

        if (availability === 'unavailable') {
            throw new Error('Language Model API is not available for the current configuration')
        }

        const options = {
            temperature: temperature.value,
            topK: topK.value,
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

        const model = await LanguageModel.create(options)

        if (enableStreaming.value) {
            // Use streaming API
            const stream = await model.promptStreaming(inputText.value)
            result.value = ''

            for await (const chunk of stream) {
                result.value += chunk
            }
        } else {
            // Use regular API
            const response = await model.prompt(inputText.value)
            result.value = response
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            error.value = 'Operation cancelled'
        } else {
            error.value = err.message || 'Failed to generate response'
            console.error('Prompt error:', err)
        }
    } finally {
        isProcessing.value = false
        downloadStatus.value = ''
        downloadProgress.value = 0
    }
}
</script>