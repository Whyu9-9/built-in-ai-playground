<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="i-heroicons-code-bracket-20-solid text-lg" />
                    <h3 class="text-lg font-semibold">Prompt API (Audio)</h3>
                </div>
                <UButton @click="() => toggleCodeCollapse = !toggleCodeCollapse"
                    icon="i-heroicons-code-bracket-20-solid">
                    {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
                </UButton>
            </div>
        </template>

        <div class="space-y-4">
            <div class="space-y-4" v-if="toggleCodeCollapse">
                <CodeExample :code="exampleCode" />
            </div>

            <p class="text-gray-600 mb-4">
                Send a text prompt and an audio file to Gemini Nano in Chrome and get a response directly in the
                browser. Enter your prompt, upload an audio file, or record from your microphone, and see the result
                below.
            </p>

            <UAlert v-if="downloadStatus" :color="downloadProgress === 100 ? 'primary' : 'secondary'" variant="subtle"
                :description="downloadStatus" />

            <div class="space-y-6">
                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <h3 class="font-medium">Prompt</h3>
                    </div>
                    <UTextarea v-model="inputText" placeholder="Enter your prompt..." :rows="3" :disabled="!isSupported"
                        class="w-full" />
                </div>
                <div class="space-y-4">
                    <div class="flex items-center gap-2">
                        <h3 class="font-medium">Audio</h3>
                    </div>
                    <div class="flex gap-2 mb-2">
                        <UButton :color="audioMode === 'upload' ? 'primary' : 'gray'" @click="switchToUpload" size="sm">
                            Upload
                        </UButton>
                        <UButton :color="audioMode === 'mic' ? 'primary' : 'gray'" @click="switchToMic" size="sm">
                            Microphone
                        </UButton>
                    </div>
                    <div v-if="audioMode === 'upload'">
                        <UInput type="file" accept="audio/*" @change="onAudioChange" :disabled="!isSupported" />
                        <div v-if="audioUrl" class="mt-2">
                            <audio :src="audioUrl" controls class="w-full" />
                        </div>
                    </div>
                    <div v-else>
                        <div v-if="!recording && !recordedAudio">
                            <UButton @click="startRecording" :disabled="!isSupported">Start Recording</UButton>
                        </div>
                        <div v-else-if="recording">
                            <div class="flex gap-2 items-center mb-2">
                                <span class="text-red-500 font-bold">● Recording...</span>
                                <UButton @click="stopRecording" color="primary">Stop</UButton>
                            </div>
                        </div>
                        <div v-else-if="recordedAudio">
                            <audio :src="audioUrl" controls class="w-full mb-2" />
                            <div class="flex gap-2">
                                <UButton @click="retakeAudio" color="primary">Retake</UButton>
                            </div>
                        </div>
                    </div>
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
                    <div class="whitespace-pre-wrap">{{ result }}</div>
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CodeExample from '../components/CodeExample.vue'

const inputText = ref('')
const audioFile = ref(null)
const audioUrl = ref('')
const result = ref('')
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
let session = null

const audioMode = ref('upload')
const recording = ref(false)
const recordedAudio = ref(false)
let mediaRecorder = null
let audioChunks = []
let audioStream = null

const temperature = ref(1.0)
const minTemperature = ref(0.0)
const maxTemperature = ref(2.0)
const topK = ref(3)
const minTopK = ref(1)
const maxTopK = ref(8)

const canProcess = computed(() => inputText.value.trim().length > 0 && audioFile.value)

const toggleCodeCollapse = ref(false)

const generateExampleCode = computed(() => {
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

// Get audio data from a file input or MediaRecorder
const audioFile = document.querySelector('input[type="file"]').files[0]
const audioData = await audioFile.arrayBuffer()

// Create a prompt with both text and audio
const prompt = {
  text: ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'What is being said in this audio?'"},
  audio: audioData
}

const result = await model.generateContent(prompt)`
})

const exampleCode = computed(() => generateExampleCode.value)

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
    stopRecording(true)
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

function switchToUpload() {
    audioMode.value = 'upload'
    recordedAudio.value = false
    audioFile.value = null
    audioUrl.value = ''
}
function switchToMic() {
    audioMode.value = 'mic'
    recordedAudio.value = false
    audioFile.value = null
    audioUrl.value = ''
}

function onAudioChange(e) {
    const file = e.target.files[0]
    if (file) {
        audioFile.value = file
        audioUrl.value = URL.createObjectURL(file)
        recordedAudio.value = false
    } else {
        audioFile.value = null
        audioUrl.value = ''
        recordedAudio.value = false
    }
}

function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) return
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioStream = stream
            mediaRecorder = new MediaRecorder(stream)
            audioChunks = []
            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) audioChunks.push(e.data)
            }
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' })
                audioFile.value = blob
                audioUrl.value = URL.createObjectURL(blob)
                recordedAudio.value = true
                stopRecording(true)
            }
            mediaRecorder.start()
            recording.value = true
        })
        .catch(() => {
            error.value = 'Unable to access microphone.'
        })
}

function stopRecording(silent) {
    if (mediaRecorder && recording.value) {
        mediaRecorder.stop()
        recording.value = false
    }
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
        audioStream = null
    }
    if (!silent) {
        recordedAudio.value = true
    }
}

function retakeAudio() {
    recordedAudio.value = false
    audioFile.value = null
    audioUrl.value = ''
}

function cancelPrompt() {
    if (abortController.value) {
        abortController.value.abort()
        abortController.value = null
    }
}

async function sendPrompt() {
    if (!isSupported.value || !inputText.value.trim() || !audioFile.value) return

    isProcessing.value = true
    error.value = ''
    result.value = ''
    abortController.value = new AbortController()

    try {
        const availability = await LanguageModel.availability()
        if (availability === 'unavailable') {
            throw new Error('Prompt API is not available.')
        }

        const options = {
            expectedInputs: [{ type: 'audio' }],
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

        session = await LanguageModel.create(options)
        const audioBlob = audioFile.value
        const promptContent = [
            { type: 'text', value: inputText.value },
            { type: 'audio', value: audioBlob }
        ]
        const response = await session.prompt([
            { role: 'user', content: promptContent }
        ], {
            signal: abortController.value.signal,
            temperature: temperature.value,
            topK: topK.value
        })
        result.value = response
    } catch (err) {
        if (err.name === 'AbortError') {
            error.value = 'Operation cancelled'
        } else {
            error.value = err.message || 'Failed to get response'
            console.error('Prompt error:', err)
        }
    } finally {
        isProcessing.value = false
        downloadStatus.value = ''
        downloadProgress.value = 0
    }
}
</script>