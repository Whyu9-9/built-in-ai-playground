<template>
  <div class="space-y-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="i-heroicons-musical-note-20-solid text-lg" />
            <h3 class="text-lg font-semibold">Prompt API - Audio Input</h3>
          </div>
          <UButton
            @click="() => (toggleCodeCollapse = !toggleCodeCollapse)"
            icon="i-heroicons-code-bracket-20-solid"
          >
            {{ toggleCodeCollapse ? 'Hide code' : 'Show code' }}
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <ApiExplainer :apiData="apiDocs.prompt" />
        <div class="space-y-4" v-if="toggleCodeCollapse">
          <CodeExample :code="exampleCode" />
        </div>

        <UAlert
          v-if="downloadStatus"
          :color="downloadProgress === 100 ? 'primary' : 'secondary'"
          variant="subtle"
          :description="downloadStatus"
        />

        <div class="space-y-6">
          <!-- Session Configuration -->
          <div class="space-y-4">
            <h3 class="font-medium">Session Configuration</h3>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Temperature</label>
                <div class="flex items-center gap-2">
                  <USlider
                    v-model="temperature"
                    :min="0"
                    :max="2"
                    :step="0.1"
                    :disabled="!isSupported"
                    class="flex-1"
                  />
                  <span class="text-sm w-12 text-center">{{ temperature }}</span>
                </div>
                <p class="text-xs text-gray-500">
                  Controls randomness (0 = deterministic, 2 = very creative)
                </p>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Max Tokens</label>
                <UInput
                  v-model.number="maxTokens"
                  type="number"
                  :min="1"
                  :max="4096"
                  :disabled="!isSupported"
                  class="w-full"
                />
                <p class="text-xs text-gray-500">Maximum response length</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Expected Input Languages</label>
              <div class="flex flex-wrap gap-2">
                <UCheckbox
                  v-for="lang in availableLanguages"
                  :key="lang.code"
                  :model-value="expectedInputLanguages.includes(lang.code)"
                  @update:model-value="(checked) => toggleInputLanguage(lang.code, checked)"
                  :disabled="!isSupported"
                  :label="lang.name"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Expected Output Languages</label>
              <div class="flex flex-wrap gap-2">
                <UCheckbox
                  v-for="lang in availableLanguages"
                  :key="lang.code"
                  :model-value="expectedOutputLanguages.includes(lang.code)"
                  @update:model-value="(checked) => toggleOutputLanguage(lang.code, checked)"
                  :disabled="!isSupported"
                  :label="lang.name"
                />
              </div>
            </div>
          </div>

          <!-- Initial Prompts -->
          <div class="space-y-4">
            <h3 class="font-medium">Initial Prompts (System Context)</h3>
            <div class="space-y-2">
              <UTextarea
                v-model="systemPrompt"
                placeholder="Enter system prompt to set context (e.g., 'You are an AI assistant that can transcribe and analyze audio content')"
                :rows="3"
                :disabled="!isSupported"
                class="w-full"
              />
              <p class="text-xs text-gray-500">
                This sets the initial context for the language model session
              </p>
            </div>
          </div>

          <!-- Audio Input -->
          <div class="space-y-4">
            <h3 class="font-medium">Audio Input</h3>
            <div class="space-y-2">
              <div class="flex gap-2">
                <UButton
                  @click="startRecording"
                  :disabled="!isSupported || isRecording"
                  color="primary"
                  size="sm"
                >
                  Start Recording
                </UButton>
                <UButton
                  @click="stopRecording"
                  :disabled="!isSupported || !isRecording"
                  color="error"
                  size="sm"
                >
                  Stop Recording
                </UButton>
                <input
                  ref="audioInput"
                  type="file"
                  accept="audio/*"
                  @change="handleAudioUpload"
                  class="hidden"
                />
                <UButton
                  @click="$refs.audioInput.click()"
                  :disabled="!isSupported"
                  color="gray"
                  variant="soft"
                  size="sm"
                >
                  Upload Audio
                </UButton>
              </div>

              <div v-if="isRecording" class="p-3 bg-red-50 rounded-lg">
                <p class="text-red-700 text-sm">Recording... Click "Stop Recording" when done.</p>
              </div>

              <div v-if="audioUrl" class="space-y-2">
                <audio controls class="w-full">
                  <source :src="audioUrl" type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <UButton @click="clearAudio" color="gray" variant="soft" size="sm">
                  Clear Audio
                </UButton>
              </div>
            </div>
          </div>

          <!-- User Prompt -->
          <div class="space-y-4">
            <h3 class="font-medium">User Prompt</h3>
            <UTextarea
              v-model="userPrompt"
              placeholder="Enter your prompt about the audio (e.g., 'Transcribe this audio', 'Summarize what was said')"
              :rows="4"
              :disabled="!isSupported"
              class="w-full"
            />
          </div>

          <!-- Streaming Toggle -->
          <div class="space-y-4">
            <StreamingToggle v-model="enableStreaming" :disabled="!isSupported" />
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <UButton
              @click="createSession"
              :loading="isCreatingSession"
              :disabled="!isSupported"
              color="primary"
              size="md"
            >
              Create Session
            </UButton>
            <UButton
              @click="sendPrompt"
              :loading="isProcessing"
              :disabled="!isSupported || !session || !canProcess"
              color="primary"
              size="md"
            >
              Analyze Audio
            </UButton>
            <UButton
              v-if="isProcessing"
              @click="cancelPrompt"
              color="error"
              variant="soft"
              size="md"
            >
              Cancel
            </UButton>
            <UButton v-if="session" @click="destroySession" color="gray" variant="soft" size="md">
              Destroy Session
            </UButton>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="mt-4">
            <UAlert color="error" variant="subtle" :title="error" />
          </div>

          <!-- Session Status -->
          <div v-if="session" class="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 class="text-green-700 mb-2">Session Active</h3>
            <p class="text-green-600 text-sm">
              Language model session is ready. You can now analyze audio.
            </p>
          </div>

          <!-- Response Display -->
          <div v-if="result" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-gray-500 mb-2">Analysis Result</h3>
            <div class="whitespace-pre-wrap">{{ result }}</div>
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

const userPrompt = ref('')
const systemPrompt = ref('')
const result = ref('')
const isProcessing = ref(false)
const isCreatingSession = ref(false)
const isSupported = ref(false)
const error = ref('')
const downloadStatus = ref('')
const downloadProgress = ref(0)
const abortController = ref(null)
const toggleCodeCollapse = ref(false)
const enableStreaming = ref(false)
const temperature = ref(0.7)
const maxTokens = ref(1000)
const session = ref(null)
const audioUrl = ref(null)
const audioInput = ref(null)
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])

const expectedInputLanguages = ref(['en'])
const expectedOutputLanguages = ref(['en'])

const availableLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
]

const canProcess = computed(() => {
  return userPrompt.value.trim() !== '' && audioUrl.value && session.value
})

const generateExampleCode = computed(() => {
  const options = []

  if (temperature.value !== 0.7) {
    options.push(`temperature: ${temperature.value}`)
  }
  if (maxTokens.value !== 1000) {
    options.push(`maxTokens: ${maxTokens.value}`)
  }
  if (expectedInputLanguages.value.length > 0) {
    options.push(
      `expectedInputs: [{ type: "text", languages: [${expectedInputLanguages.value.map((l) => `"${l}"`).join(', ')}] }, { type: "audio" }]`,
    )
  }
  if (expectedOutputLanguages.value.length > 0) {
    options.push(
      `expectedOutputs: [{ type: "text", languages: [${expectedOutputLanguages.value.map((l) => `"${l}"`).join(', ')}] }]`,
    )
  }
  if (systemPrompt.value) {
    options.push(
      `initialPrompts: [{ role: "system", content: "${systemPrompt.value.replace(/"/g, '\\"')}" }]`,
    )
  }

  const optionsStr = options.length > 0 ? `,\n  ${options.join(',\n  ')}` : ''

  const promptCode = enableStreaming.value
    ? `// Use streaming API for real-time updates
const stream = await session.promptStreaming(
  ${userPrompt.value ? `'${userPrompt.value.replace(/'/g, "\\'")}'` : "'Your prompt here'"},
  { type: "audio", data: audioData }
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}`
    : `// Use regular API for complete response
const result = await session.prompt(
  ${userPrompt.value ? `'${userPrompt.value.replace(/'/g, "\\'")}'` : "'Your prompt here'"},
  { type: "audio", data: audioData }
)`

  return `// Check availability first
const availability = await LanguageModel.availability({
  expectedInputs: [
    { type: "text", languages: [${expectedInputLanguages.value.map((l) => `"${l}"`).join(', ')}] },
    { type: "audio" }
  ],
  expectedOutputs: [
    { type: "text", languages: [${expectedOutputLanguages.value.map((l) => `"${l}"`).join(', ')}] }
  ],
  temperature: ${temperature.value}${maxTokens.value !== 1000 ? `,\n  maxTokens: ${maxTokens.value}` : ''}
})

if (availability === 'unavailable') {
  console.error('Language model not available for audio analysis')
  return
}

if (availability !== 'available') {
  console.log('Model needs to be downloaded...')
}

// Create session with monitoring
const session = await LanguageModel.create({
  ${systemPrompt.value ? `initialPrompts: [{ role: "system", content: "${systemPrompt.value.replace(/"/g, '\\"')}" }],` : ''}
  expectedInputs: [
    { type: "text", languages: [${expectedInputLanguages.value.map((l) => `"${l}"`).join(', ')}] },
    { type: "audio" }
  ],
  expectedOutputs: [
    { type: "text", languages: [${expectedOutputLanguages.value.map((l) => `"${l}"`).join(', ')}] }
  ],
  temperature: ${temperature.value}${maxTokens.value !== 1000 ? `,\n  maxTokens: ${maxTokens.value}` : ''},
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(\`Downloaded \${e.loaded * 100}%\`)
    })
  }
})

${promptCode}

// Clean up when done
session.destroy()`
})

const exampleCode = computed(() => generateExampleCode.value)

onMounted(async () => {
  await checkSupport()
})

onUnmounted(() => {
  if (session.value) {
    session.value.destroy()
  }
  if (abortController.value) {
    abortController.value.abort()
  }
  if (mediaRecorder.value && isRecording.value) {
    stopRecording()
  }
})

function toggleInputLanguage(langCode, checked) {
  if (checked) {
    expectedInputLanguages.value.push(langCode)
  } else {
    const index = expectedInputLanguages.value.indexOf(langCode)
    if (index > -1) {
      expectedInputLanguages.value.splice(index, 1)
    }
  }
}

function toggleOutputLanguage(langCode, checked) {
  if (checked) {
    expectedOutputLanguages.value.push(langCode)
  } else {
    const index = expectedOutputLanguages.value.indexOf(langCode)
    if (index > -1) {
      expectedOutputLanguages.value.splice(index, 1)
    }
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      audioChunks.value.push(event.data)
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' })
      audioUrl.value = URL.createObjectURL(audioBlob)
      isRecording.value = false
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (err) {
    error.value = 'Failed to access microphone: ' + err.message
  }
}

function stopRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    mediaRecorder.value.stream.getTracks().forEach((track) => track.stop())
  }
}

function handleAudioUpload(event) {
  const file = event.target.files[0]
  if (file) {
    audioUrl.value = URL.createObjectURL(file)
  }
}

function clearAudio() {
  audioUrl.value = null
  if (audioInput.value) {
    audioInput.value.value = ''
  }
}

async function checkSupport() {
  try {
    if ('LanguageModel' in window) {
      isSupported.value = true
    } else {
      isSupported.value = false
      error.value = 'Prompt API is not supported in this browser'
    }
  } catch (err) {
    console.error('Failed to check support:', err)
    error.value = err.message || 'Failed to check Prompt API support'
    isSupported.value = false
  }
}

async function createSession() {
  if (!isSupported.value) return

  isCreatingSession.value = true
  error.value = ''
  downloadStatus.value = ''
  downloadProgress.value = 0

  try {
    // Check availability first
    const availability = await LanguageModel.availability({
      expectedInputs: [
        { type: 'text', languages: expectedInputLanguages.value },
        { type: 'audio' },
      ],
      expectedOutputs: [{ type: 'text', languages: expectedOutputLanguages.value }],
      temperature: temperature.value,
      maxTokens: maxTokens.value,
    })

    if (availability === 'unavailable') {
      throw new Error('Language model not available for audio analysis')
    }

    if (availability !== 'available') {
      downloadStatus.value = 'Model needs to be downloaded. This may take a few minutes.'
    }

    // Create session
    const sessionOptions = {
      expectedInputs: [
        { type: 'text', languages: expectedInputLanguages.value },
        { type: 'audio' },
      ],
      expectedOutputs: [{ type: 'text', languages: expectedOutputLanguages.value }],
      temperature: temperature.value,
      maxTokens: maxTokens.value,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          downloadProgress.value = e.loaded * 100
          downloadStatus.value = 'Downloading model...'
        })
      },
    }

    // Add initial prompts if provided
    if (systemPrompt.value.trim()) {
      sessionOptions.initialPrompts = [{ role: 'system', content: systemPrompt.value }]
    }

    session.value = await LanguageModel.create(sessionOptions)
    downloadStatus.value = ''
    downloadProgress.value = 0
  } catch (err) {
    error.value = err.message || 'Failed to create language model session'
    console.error('Session creation error:', err)
  } finally {
    isCreatingSession.value = false
  }
}

function destroySession() {
  if (session.value) {
    session.value.destroy()
    session.value = null
    result.value = ''
  }
}

function cancelPrompt() {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
}

async function sendPrompt() {
  if (!session.value || !userPrompt.value.trim() || !audioUrl.value) return

  isProcessing.value = true
  error.value = ''
  result.value = ''
  abortController.value = new AbortController()

  try {
    // Convert audio URL to proper format for the API
    const audioData = audioUrl.value

    if (enableStreaming.value) {
      // Use streaming API
      const stream = await session.value.promptStreaming(userPrompt.value, {
        type: 'audio',
        data: audioData,
      })
      result.value = ''

      for await (const chunk of stream) {
        result.value += chunk
      }
    } else {
      // Use regular API
      const response = await session.value.prompt(userPrompt.value, {
        type: 'audio',
        data: audioData,
      })
      result.value = response
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      error.value = 'Operation cancelled'
    } else {
      error.value = err.message || 'Failed to analyze audio with language model'
      console.error('Audio analysis error:', err)
    }
  } finally {
    isProcessing.value = false
  }
}
</script>
