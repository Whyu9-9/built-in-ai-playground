import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      // Use system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  }

  // Update the DOM and localStorage
  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  // Set specific theme
  const setTheme = (theme) => {
    isDark.value = theme === 'dark'
    updateTheme()
  }

  // Computed properties
  const currentTheme = computed(() => (isDark.value ? 'dark' : 'light'))
  const themeIcon = computed(() => (isDark.value ? 'i-heroicons-sun' : 'i-heroicons-moon'))

  // Watch for changes and update DOM
  watch(isDark, updateTheme, { immediate: false })

  return {
    isDark,
    currentTheme,
    themeIcon,
    initializeTheme,
    toggleTheme,
    setTheme,
  }
})
