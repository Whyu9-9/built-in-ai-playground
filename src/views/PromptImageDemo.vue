<template>
    <UCard>
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-code-bracket-20-solid" class="text-lg" />
                    <h3 class="text-lg font-semibold">Prompt API (Image)</h3>
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
                        <h3 class="font-medium">Image</h3>
                    </div>
                    <div class="flex gap-2 mb-2">
                        <UButton :color="imageMode === 'upload' ? 'primary' : 'gray'" @click="switchToUpload" size="sm">
                            Upload
                        </UButton>
                        <UButton :color="imageMode === 'webcam' ? 'primary' : 'gray'" @click="switchToWebcam" size="sm">
                            Webcam
                        </UButton>
                    </div>
                    <div v-if="imageMode === 'upload'">
                        <UInput type="file" accept="image/*" @change="onImageChange" :disabled="!isSupported" />
                        <div v-if="imageUrl" class="mt-2">
                            <img :src="imageUrl" alt="Selected image" class="max-h-40 rounded border" />
                        </div>
                    </div>
                    <div v-else>
                        <div v-if="!webcamActive">
                            <UButton @click="startWebcam" :disabled="!isSupported">Start Webcam</UButton>
                        </div>
                        <div v-else>
                            <div v-if="!capturedWebcamImage">
                                <video ref="videoRef" autoplay playsinline class="rounded border max-h-40 mb-2"></video>
                                <div class="flex gap-2">
                                    <UButton @click="captureWebcam" color="primary">Capture</UButton>
                                </div>
                            </div>
                            <div v-else>
                                <img :src="imageUrl" alt="Captured image" class="max-h-40 rounded border mb-2" />
                                <div class="flex gap-2">
                                    <UButton @click="retakeWebcam" color="primary">Retake</UButton>
                                </div>
                            </div>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import CodeExample from '../components/CodeExample.vue'
import ApiExplainer from '../components/ApiExplainer.vue'
import ResultDisplay from '../components/ResultDisplay.vue'
import { apiDocs } from '../data/apiDocs.js'

const inputText = ref('')
const imageFile = ref(null)
const imageUrl = ref('')
const result = ref('')
const isProcessing = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
let session = null

const imageMode = ref('upload')
const webcamActive = ref(false)
const videoRef = ref(null)
let stream = null
const capturedWebcamImage = ref(false)

const languageModelOptions = {
    expectedInputs: [
        { type: 'text', languages: ['en'] },
        { type: 'image' },
    ],
    expectedOutputs: [{ type: 'text', languages: ['en'] }],
}

const canProcess = computed(() => inputText.value.trim().length > 0 && imageFile.value)

const toggleCodeCollapse = ref(false)

const generateExampleCode = computed(() => {
    return `const options = {
  expectedInputs: [
    { type: 'text', languages: ['en'] },
    { type: 'image' },
  ],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
}

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

// Blob is one of the visual input types supported by the Prompt API.
const imageFile = document.querySelector('input[type="file"]').files[0]
const result = await model.prompt([{
  role: 'user',
  content: [
    { type: 'text', value: ${inputText.value ? `'${inputText.value.replace(/'/g, "\\'")}'` : "'What can you tell me about this image?'"} },
    { type: 'image', value: imageFile },
  ],
}])`
})

const exampleCode = computed(() => generateExampleCode.value)

watch(imageMode, (newMode, oldMode) => {
    if (newMode === 'webcam' && !webcamActive.value) {
        startWebcam()
    } else if (newMode === 'upload' && webcamActive.value) {
        stopWebcam()
    }
})

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
    stopWebcam()
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

function onImageChange(e) {
    const file = e.target.files[0]
    if (file) {
        imageFile.value = file
        imageUrl.value = URL.createObjectURL(file)
    } else {
        imageFile.value = null
        imageUrl.value = ''
    }
}

function startWebcam() {
    if (!navigator.mediaDevices?.getUserMedia) return
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(async s => {
            stream = s
            webcamActive.value = true
            await nextTick()
            if (videoRef.value) {
                videoRef.value.srcObject = stream
                videoRef.value.play()
            }
        })
        .catch(() => {
            error.value = 'Unable to access webcam.'
        })
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop())
        stream = null
    }
    webcamActive.value = false
    if (videoRef.value) {
        videoRef.value.srcObject = null
    }
}

function captureWebcam() {
    if (!videoRef.value) return
    const video = videoRef.value
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(blob => {
        if (blob) {
            imageFile.value = blob
            imageUrl.value = URL.createObjectURL(blob)
            capturedWebcamImage.value = true
        }
    }, 'image/jpeg')
}

function retakeWebcam() {
    capturedWebcamImage.value = false
    imageFile.value = null
    imageUrl.value = ''
    stopWebcam()
    startWebcam()
}

function cancelPrompt() {
    if (abortController.value) {
        abortController.value.abort()
        abortController.value = null
    }
}

function switchToUpload() {
    imageMode.value = 'upload'
    capturedWebcamImage.value = false
}

function switchToWebcam() {
    imageMode.value = 'webcam'
    // If switching to webcam, clear any previous captured image
    capturedWebcamImage.value = false
    imageFile.value = null
    imageUrl.value = ''
}

async function sendPrompt() {
    if (!isSupported.value || !inputText.value.trim() || !imageFile.value) return

    isProcessing.value = true
    error.value = ''
    result.value = ''
    abortController.value = new AbortController()

    try {
        const availability = await LanguageModel.availability(languageModelOptions)
        if (availability === 'unavailable') {
            throw new Error('Prompt API is not available.')
        }

        const options = {
            ...languageModelOptions,
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

        if (session) session.destroy?.()
        session = await LanguageModel.create(options)
        const imageBlob = imageFile.value
        const promptContent = [
            { type: 'text', value: inputText.value },
            { type: 'image', value: imageBlob }
        ]
        const response = await session.prompt([
            { role: 'user', content: promptContent }
        ], { signal: abortController.value.signal })
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
