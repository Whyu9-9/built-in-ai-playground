<template>
    <div class="relative">
        <UCard>
            <div>
                <pre class="p-4 rounded-lg overflow-x-auto text-xs mt-3"
                    style="background-color: var(--ui-bg-elevated); border: 1px solid var(--ui-border)"><code
            :class="`language-${language}`" ref="codeBlock" v-html="highlightedCode" style="color: var(--ui-text)"></code></pre>
                <UButton @click="copyCode" :color="copied ? 'success' : 'gray'" variant="ghost"
                    class="absolute top-2 right-2" size="xs">
                    <template v-if="!copied">
                        <UIcon name="i-heroicons-document-duplicate-20-solid" class="mr-1" />
                        Copy
                    </template>
                    <template v-else>
                        <UIcon name="i-heroicons-check-20-solid" class="mr-1" />
                        Copied!
                    </template>
                </UButton>
            </div>
        </UCard>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import Prism from 'prismjs'

const props = defineProps({
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'js'
    }
})

const copied = ref(false)
const highlightedCode = ref('')
const codeBlock = ref(null)

async function copyCode() {
    try {
        await navigator.clipboard.writeText(props.code)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        console.error('Failed to copy code:', err)
    }
}

function highlight() {
    highlightedCode.value = Prism.highlight(props.code, Prism.languages[props.language] || Prism.languages.js, props.language)
}

watch(() => [props.code, props.language], () => {
    highlight()
})

onMounted(() => {
    highlight()
})
</script>

<style scoped>
/* Custom theme-aware syntax highlighting */
:deep(.token.comment) {
    color: var(--ui-text-muted) !important;
}

:deep(.token.keyword) {
    color: #3b82f6 !important;
    /* blue-500 */
}

:deep(.token.string) {
    color: #059669 !important;
    /* emerald-600 */
}

:deep(.token.number) {
    color: #dc2626 !important;
    /* red-600 */
}

:deep(.token.boolean) {
    color: #7c3aed !important;
    /* violet-600 */
}

:deep(.token.function) {
    color: #ea580c !important;
    /* orange-600 */
}

:deep(.token.class-name) {
    color: #0891b2 !important;
    /* cyan-600 */
}

:deep(.token.operator) {
    color: var(--ui-text) !important;
}

:deep(.token.punctuation) {
    color: var(--ui-text) !important;
}

:deep(.token.property) {
    color: var(--ui-text) !important;
}

:deep(.token.variable) {
    color: var(--ui-text) !important;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
    :deep(.token.keyword) {
        color: #60a5fa !important;
        /* blue-400 */
    }

    :deep(.token.string) {
        color: #34d399 !important;
        /* emerald-400 */
    }

    :deep(.token.number) {
        color: #f87171 !important;
        /* red-400 */
    }

    :deep(.token.boolean) {
        color: #a78bfa !important;
        /* violet-400 */
    }

    :deep(.token.function) {
        color: #fb923c !important;
        /* orange-400 */
    }

    :deep(.token.class-name) {
        color: #22d3ee !important;
        /* cyan-400 */
    }
}
</style>