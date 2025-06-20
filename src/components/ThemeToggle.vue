<template>
    <UButton :icon="themeStore.themeIcon" color="gray" variant="ghost" size="sm" @click="themeStore.toggleTheme"
        :title="`Switch to ${themeStore.isDark ? 'light' : 'dark'} mode`"
        class="transition-transform hover:scale-105" />
</template>

<script setup>
import { useThemeStore } from '../stores/theme.js'

const themeStore = useThemeStore()
</script>