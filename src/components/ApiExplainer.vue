<template>
    <UCard class="mt-4">
        <div class="space-y-3">
            <p class="text-sm" style="color: var(--ui-text-muted)">
                {{ apiData.description }}
            </p>

            <div class="flex flex-wrap gap-3">
                <a v-for="link in apiData.links" :key="link.url" :href="link.url" target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
                    style="border: 1px solid var(--ui-border)">
                    <UIcon :name="link.icon" class="text-sm" />
                    {{ link.text }}
                    <UIcon name="i-heroicons-arrow-top-right-on-square" class="text-xs opacity-60" />
                </a>
            </div>
        </div>
    </UCard>
</template>

<script setup>
const props = defineProps({
    apiData: {
        type: Object,
        required: true
    }
})
</script>