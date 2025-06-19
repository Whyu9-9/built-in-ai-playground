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
                        <h3 class="text-lg font-semibold">Audio Prompt API</h3>
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
                    Send a prompt about an audio file to Gemini Nano in Chrome. Upload an audio file and ask questions
                    about it to
                    get
                    detailed responses.
                </p>

                <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'"
                    variant="subtle" :description="downloadStatus" />

                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <h3 class="font-medium">Audio</h3>
                    </div>
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-4">
                            <UButton @click="triggerFileInput" :disabled="!isSupported" color="primary" variant="soft">
                                Upload Audio
                            </UButton>
                            <input type="file" ref="fileInput" class="hidden" accept="audio/*"
                                @change="handleFileUpload" />
                            <span v-if="selectedFile" class="text-sm text-gray-600">{{ selectedFile.name }}</span>
                        </div>
                        <audio v-if="audioUrl" controls :src="audioUrl" class="w-full max-w-md"></audio>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <h3 class="font-medium">Prompt</h3>
                    </div>
                    <UTextarea v-model="inputText" placeholder="Ask a question about the audio..." :rows="4"
                        :disabled="!isSupported" class="w-full" />
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

                <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 class="text-gray-500 mb-2">Response</h3>
                    <div class="whitespace-pre-wrap">{{ result }}</div>
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
const fileInput = ref(null)
const selectedFile = ref(null)
const audioUrl = ref('')

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
} = useAIModel('AudioPrompt')

const {
    temperature,
    minTemperature,
    maxTemperature,
    topK,
    minTopK,
    maxTopK
} = useFormOptions()

const { enableStreaming, processStreamingResponse } = useStreaming()

const canProcess = computed(() => {
    return inputText.value.trim() !== '' && selectedFile.value !== null
})

const { exampleCode } = useExampleCode('AudioPrompt', {
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

        return options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''
    }
})

let model = null

onMounted(async () => {
    await checkSupport()
})

function triggerFileInput() {
    fileInput.value.click()
}

async function handleFileUpload(event) {
    const file = event.target.files[0]
    if (file) {
        selectedFile.value = file
        audioUrl.value = URL.createObjectURL(file)
    }
}

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

        if (enableStreaming.value) {
            const stream = await model.promptStreaming(selectedFile.value, inputText.value, options)
            await processStreamingResponse(stream, result)
        } else {
            result.value = await model.prompt(selectedFile.value, inputText.value, options)
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