<template>
    <div class="space-y-8">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-code-bracket-20-solid" class="text-lg" />
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
                            <h3 class="font-medium">JSON Schema</h3>
                        </div>
                        <UTextarea v-model="structureSchema"
                            placeholder='{"type":"object","properties":{"answer":{"type":"string"}},"required":["answer"]}' :rows="4"
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

                    <ResultDisplay :result="result" title="Response"
                        :format="outputType === 'structured' ? 'structured' : 'text'" ref="resultDisplay" />
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
import ResultDisplay from '../components/ResultDisplay.vue'
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
let session = null

const languageModelOptions = {
    expectedInputs: [{ type: 'text', languages: ['en'] }],
    expectedOutputs: [{ type: 'text', languages: ['en'] }],
}

const outputType = ref('text')
const outputTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Structured', value: 'structured' }
]
const structureSchema = ref('')

// Initial Prompts
const initialPrompts = ref([])
const roleOptions = [
    { label: 'system', value: 'system' },
    { label: 'user', value: 'user' },
    { label: 'assistant', value: 'assistant' }
]

function addInitialPrompt() {
    initialPrompts.value.push({ role: 'user', content: '' })
}
function removeInitialPrompt(idx) {
    initialPrompts.value.splice(idx, 1)
}

const canProcess = computed(() =>
    inputText.value.trim().length > 0 &&
    (outputType.value !== 'structured' || structureSchema.value.trim().length > 0)
)

const generateExampleCode = computed(() => {
    const promptOptions = outputType.value === 'structured'
        ? `, { responseConstraint: ${structureSchema.value || '{ /* JSON Schema */ }'} }`
        : ''

    const promptCode = enableStreaming.value ?
        `// Use streaming API for real-time updates
const stream = await model.promptStreaming(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Your prompt goes here'"}${promptOptions}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}` :
        `// Use regular API for complete response
const result = await model.prompt(
  ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'Your prompt goes here'"}${promptOptions}
)`

    return `const options = {
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
${initialPrompts.value.length ? `  initialPrompts: ${JSON.stringify(initialPrompts.value)},\n` : ''}}

const available = await LanguageModel.availability(options)
let model

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  model = await LanguageModel.create(options)
} else {
  model = await LanguageModel.create({
    ...options,
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

onMounted(async () => {
    await checkSupport()
})

onUnmounted(() => {
    if (abortController.value) {
        abortController.value.abort()
    }
    if (session) {
        session.destroy?.()
    }
})

async function checkSupport() {
    try {
        if ('LanguageModel' in window) {
            const availability = await LanguageModel.availability(languageModelOptions)
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
        const promptOptions = { signal: abortController.value.signal }
        if (outputType.value === 'structured') {
            try {
                promptOptions.responseConstraint = JSON.parse(structureSchema.value)
            } catch {
                throw new Error('JSON Schema must be valid JSON.')
            }
        }

        const createOptions = {
            ...languageModelOptions,
            signal: abortController.value.signal,
            initialPrompts: initialPrompts.value.filter((prompt) => prompt.content.trim()),
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    downloadProgress.value = e.loaded * 100
                    downloadStatus.value = 'Downloading model...'
                })
            },
        }
        const availability = await LanguageModel.availability(languageModelOptions)

        if (availability === 'unavailable') {
            throw new Error('Language Model API is not available for the current configuration')
        }

        if (availability !== 'available') {
            downloadStatus.value = 'Model is being downloaded. Please wait...'
        }

        if (session) session.destroy?.()
        session = await LanguageModel.create(createOptions)

        if (enableStreaming.value) {
            // Use streaming API
            const stream = session.promptStreaming(inputText.value, promptOptions)
            result.value = ''

            for await (const chunk of stream) {
                result.value += chunk
            }
        } else {
            // Use regular API
            const response = await session.prompt(inputText.value, promptOptions)
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
