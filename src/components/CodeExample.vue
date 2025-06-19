<template>
    <div class="relative">
        <UCard>
            <div>
                <pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-xs mt-3"><code
            :class="`language-${language}`" ref="codeBlock" v-html="highlightedCode"></code></pre>
                <UButton @click="copyCode" :color="copied ? 'success' : 'gray'" variant="ghost"
                    class="absolute top-2 right-2" size="xs">
                    <template v-if="!copied">
                        <div class="i-heroicons-document-duplicate-20-solid mr-1" />
                        Copy
                    </template>
                    <template v-else>
                        <div class="i-heroicons-check-20-solid mr-1" />
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
import 'prismjs/themes/prism.css'

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