<template>
    <UButton :icon="themeStore.themeIcon" color="gray" variant="ghost" size="sm" @click="themeStore.toggleTheme"
        :title="themeTitle" class="transition-transform hover:scale-105" />
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme.js'

const themeStore = useThemeStore()

const themeTitle = computed(() => {
    if (themeStore.themeMode === 'auto' || themeStore.themeMode.value === 'auto') {
        return `Switch to light mode`
    }
    if (themeStore.themeMode === 'light' || themeStore.themeMode.value === 'light') {
        return `Switch to dark mode`
    }
    return `Switch to auto mode`
})
</script>