<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-code-bracket-20-solid" class="text-lg" />
                    <h3 class="text-lg font-semibold">Prompt API (Audio)</h3>
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
                            <!-- Volume Meter -->
                            <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                                <div class="flex items-center gap-2 mb-2">
                                    <UIcon name="i-heroicons-speaker-wave" class="text-gray-600 dark:text-gray-400" />
                                    <span class="text-sm font-medium">Volume Level</span>
                                </div>
                                <div class="volume-meter">
                                    <div class="volume-bars">
                                        <div v-for="(bar, index) in volumeBars" :key="index" class="volume-bar" :style="{
                                            height: `${bar}%`,
                                            backgroundColor: getBarColor(bar)
                                        }"></div>
                                    </div>
                                    <div class="volume-text">
                                        {{ Math.round(currentVolume) }}%
                                    </div>
                                </div>
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

                <ResultDisplay :result="result" title="Response" ref="resultDisplay" />

            </div>
        </div>
    </UCard>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CodeExample from '../components/CodeExample.vue'
import ApiExplainer from '../components/ApiExplainer.vue'
import ResultDisplay from '../components/ResultDisplay.vue'
import { apiDocs } from '../data/apiDocs.js'

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

// Volume visualization
const currentVolume = ref(0)
const volumeBars = ref(Array(20).fill(0))
let audioContext = null
let analyser = null
let microphone = null
let animationFrame = null

const temperature = ref(1.0)
const minTemperature = ref(0.0)
const maxTemperature = ref(2.0)
const topK = ref(3)
const minTopK = ref(1)
const maxTopK = ref(8)

const canProcess = computed(() => inputText.value.trim().length > 0 && audioFile.value)

const toggleCodeCollapse = ref(false)

// Function to get color based on volume level
function getBarColor(volume) {
    if (volume < 30) return '#10b981' // green for low
    if (volume < 70) return '#f59e0b' // yellow for medium
    return '#ef4444' // red for high
}

// Function to update volume visualization
function updateVolumeVisualization() {
    if (!analyser || !recording.value) return

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(dataArray)

    // Calculate RMS (Root Mean Square) for better volume representation
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
        const sample = (dataArray[i] - 128) / 128 // Convert to -1 to 1 range
        sum += sample * sample
    }
    const rms = Math.sqrt(sum / dataArray.length)

    // Convert RMS to volume percentage with better scaling
    currentVolume.value = Math.min(100, rms * 200) // Scale factor adjusted for better range

    // Update volume bars with smooth animation
    const newBars = [...volumeBars.value]
    for (let i = 0; i < newBars.length; i++) {
        // Create a more dynamic visualization
        const baseHeight = currentVolume.value * 0.6
        const randomFactor = Math.random() * 0.4 + 0.8 // 0.8 to 1.2
        const targetHeight = baseHeight * randomFactor
        newBars[i] = newBars[i] * 0.7 + targetHeight * 0.3 // Faster response
    }
    volumeBars.value = newBars

    if (recording.value) {
        animationFrame = requestAnimationFrame(updateVolumeVisualization)
    }
}

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

    // Additional cleanup for audio analysis
    if (animationFrame) {
        cancelAnimationFrame(animationFrame)
    }
    if (audioContext) {
        audioContext.close()
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

            // Setup audio analysis for volume visualization
            setupAudioAnalysis(stream)
        })
        .catch(() => {
            error.value = 'Unable to access microphone.'
        })
}

function setupAudioAnalysis(stream) {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 512 // Increased for better resolution
        analyser.smoothingTimeConstant = 0.3 // Less smoothing for more responsive visualization

        microphone = audioContext.createMediaStreamSource(stream)
        microphone.connect(analyser)

        // Start volume visualization
        updateVolumeVisualization()
    } catch (err) {
        console.warn('Audio analysis not supported:', err)
    }
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

    // Clean up audio analysis
    if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
    }
    if (audioContext) {
        audioContext.close()
        audioContext = null
    }
    analyser = null
    microphone = null

    // Reset volume visualization
    currentVolume.value = 0
    volumeBars.value = Array(20).fill(0)

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

<style scoped>
.volume-meter {
    display: flex;
    align-items: center;
    gap: 12px;
}

.volume-bars {
    display: flex;
    align-items: end;
    gap: 2px;
    height: 60px;
    flex: 1;
}

.volume-bar {
    width: 8px;
    min-height: 4px;
    border-radius: 2px;
    transition: height 0.1s ease-out, background-color 0.1s ease-out;
    background: linear-gradient(to top, currentColor, currentColor);
}

.volume-text {
    font-size: 14px;
    font-weight: 600;
    min-width: 40px;
    text-align: center;
    color: #6b7280;
}

.dark .volume-text {
    color: #9ca3af;
}
</style>