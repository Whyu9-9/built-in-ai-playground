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
                <div class="space-y-4" v-if="toggleCodeCollapse">
                    <h2 class="text-xl font-semibold">Example Usage</h2>
                    <CodeExample :code="exampleCode" />
                </div>

                <p class="text-gray-600 mb-4">
                    Send a text prompt to Gemini Nano in Chrome and get a response directly in the browser. Enter
                    your
                    prompt and see the result below. Optionally, request structured output by providing a JSON
                    schema or
                    instructions.
                </p>

                <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'"
                    variant="subtle" :description="downloadStatus" />

                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <h3 class="font-medium">Prompt</h3>
                    </div>
                    <UTextarea v-model="inputText" placeholder="Enter your prompt..." :rows="4" :disabled="!isSupported"
                        class="w-full" />
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
                    <UButton icon="i-heroicons-plus" color="primary" variant="soft" size="xs" @click="addInitialPrompt">
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
                            <USlider v-model="topK" :min="minTopK" :max="maxTopK" :step="1" :disabled="!isSupported" />
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
                    <h3 class="text-gray-500 mb-2">Response</h3>
                    <div v-if="outputType === 'structured' && formattedResult"
                        class="whitespace-pre-wrap font-mono text-sm">{{
                            formattedResult }}</div>
                    <div v-else class="whitespace-pre-wrap">{{ result }}</div>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CodeExample from '../components/CodeExample.vue'
import StreamingToggle from '../components/StreamingToggle.vue'
import { useAIModel } from '../composables/useAIModel'
import { useExampleCode } from '../composables/useExampleCode'
import { useFormOptions } from '../composables/useFormOptions'
import { useStreaming } from '../composables/useStreaming'

const inputText = ref('')
const result = ref('')
const toggleCodeCollapse = ref(false)

const {
    isSupported,
    error,
    downloadStatus,
    downloadProgress,
    isProcessing,
    abortController,
    checkSupport,
    createModel,
    cleanup
} = useAIModel('LanguageModel')

const {
    temperature,
    minTemperature,
    maxTemperature,
    topK,
    minTopK,
    maxTopK,
    roleOptions
} = useFormOptions()

const { enableStreaming, processStreamingResponse } = useStreaming()

const outputType = ref('text')
const outputTypeOptions = [
    { label: 'Text', value: 'text' },
    { label: 'Structured', value: 'structured' }
]
const structureSchema = ref('')

// Initial Prompts
const initialPrompts = ref([])

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

const { exampleCode } = useExampleCode('LanguageModel', {
    inputRef: inputText,
    streamingRef: enableStreaming,
    methodName: 'prompt',
    streamMethodName: 'promptStreaming',
    generateOptionsStr: () => {
        const options = []

        if (temperature.value !== 1.0) {
            options.push(`temperature: ${temperature.value}`)
        }
        if (topK.value !== 3) {
            options.push(`topK: ${topK.value}`)
        }
        if (outputType.value === 'structured' && structureSchema.value) {
            options.push(`structureSchema: ${structureSchema.value}`)
        }
        if (initialPrompts.value.length > 0) {
            options.push(`initialPrompts: ${JSON.stringify(initialPrompts.value)}`)
        }

        return options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''
    }
})

let model = null

onMounted(async () => {
    await checkSupport()
})

async function sendPrompt() {
    if (!canProcess.value || !isSupported.value) return

    try {
        isProcessing.value = true
        error.value = ''
        abortController.value = new AbortController()

        if (!model) {
            model = await createModel()
            if (!model) return
        }

        const options = {
            signal: abortController.value.signal,
            temperature: temperature.value,
            topK: topK.value
        }

        if (outputType.value === 'structured' && structureSchema.value) {
            options.structureSchema = structureSchema.value
        }

        if (initialPrompts.value.length > 0) {
            options.initialPrompts = initialPrompts.value
        }

        if (enableStreaming.value) {
            const stream = await model.promptStreaming(inputText.value, options)
            await processStreamingResponse(stream, result)
        } else {
            result.value = await model.prompt(inputText.value, options)
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            error.value = err.message
        }
    } finally {
        isProcessing.value = false
    }
}

function cancelPrompt() {
    if (abortController.value) {
        abortController.value.abort()
    }
}
</script>