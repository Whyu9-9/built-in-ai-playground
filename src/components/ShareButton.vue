<template>
  <UButton 
    @click="shareResult" 
    :disabled="!result"
    color="gray" 
    variant="ghost"
    size="sm"
  >
    <div class="i-heroicons-share mr-1" />
    Share
  </UButton>
</template>

<script setup>
const props = defineProps({
  result: String,
  prompt: String,
  apiType: String
})

async function shareResult() {
  if (!props.result) return

  const shareData = {
    title: `AI ${props.apiType} Result`,
    text: `Prompt: ${props.prompt}\n\nResult: ${props.result}`,
    url: window.location.href
  }

  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData)
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareData.text)
      // You could show a toast notification here
    }
  } catch (err) {
    console.error('Failed to share:', err)
  }
}
</script>