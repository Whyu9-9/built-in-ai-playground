<template>
    <div v-if="result" class="mt-4 p-4 rounded-lg"
        style="background-color: var(--ui-bg-elevated); border: 1px solid var(--ui-border)">
        <div class="flex items-center justify-between mb-2">
            <h3 style="color: var(--ui-text-muted)">{{ title }}</h3>
            <UButton @click="copyToClipboard" :loading="isCopying" size="sm" variant="ghost"
                :color="copySuccess ? 'green' : 'gray'"
                :icon="copySuccess ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'">
                {{ copyButtonText }}
            </UButton>
        </div>
        <div class="whitespace-pre-wrap" :class="{ 'font-mono text-sm': format === 'structured' || isStructured }"
            style="color: var(--ui-text)" v-html="formattedResult"></div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    result: {
        type: [String, Array, Object],
        required: true
    },
    title: {
        type: String,
        default: 'Result'
    },
    format: {
        type: String,
        default: 'text' // 'text', 'html', 'list', 'language-detection', 'structured'
    },
    isStructured: {
        type: Boolean,
        default: false
    }
})

const isCopying = ref(false)
const copyButtonText = ref('Copy')
const copySuccess = ref(false)

const formattedResult = computed(() => {
    if (!props.result) return ''

    if (props.format === 'html') {
        return props.result
    }

    if (props.format === 'list' && Array.isArray(props.result)) {
        return props.result.map(item => `• ${item}`).join('\n')
    }

    if (props.format === 'language-detection' && Array.isArray(props.result)) {
        return props.result.map(res =>
            `<span class="font-mono">${res.detectedLanguage}</span><span class="ml-2 text-xs" style="color: var(--ui-text-muted)">Confidence: ${(res.confidence * 100).toFixed(2)}%</span>`
        ).join('<br>')
    }

    if (props.format === 'structured' || props.isStructured) {
        try {
            const parsed = JSON.parse(props.result)
            return JSON.stringify(parsed, null, 2)
        } catch {
            return props.result
        }
    }

    return props.result
})

const textToCopy = computed(() => {
    if (!props.result) return ''

    if (Array.isArray(props.result)) {
        if (props.format === 'language-detection') {
            return props.result.map(res =>
                `${res.detectedLanguage} - Confidence: ${(res.confidence * 100).toFixed(2)}%`
            ).join('\n')
        }
        return props.result.join('\n')
    }

    return props.result
})

async function copyToClipboard() {
    if (!textToCopy.value) return

    isCopying.value = true
    copyButtonText.value = 'Copying...'
    copySuccess.value = false

    try {
        await navigator.clipboard.writeText(textToCopy.value)
        copyButtonText.value = 'Copied!'
        copySuccess.value = true

        // Reset button text after 2 seconds
        setTimeout(() => {
            copyButtonText.value = 'Copy'
            copySuccess.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy to clipboard:', err)
        copyButtonText.value = 'Failed'

        // Reset button text after 2 seconds
        setTimeout(() => {
            copyButtonText.value = 'Copy'
        }, 2000)
    } finally {
        isCopying.value = false
    }
}

// Expose reset function for parent components
defineExpose({
    resetCopyState: () => {
        copySuccess.value = false
        copyButtonText.value = 'Copy'
    }
})
</script>