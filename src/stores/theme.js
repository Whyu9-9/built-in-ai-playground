import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const themeMode = ref('auto') // 'auto', 'dark', 'light'
  const isDark = ref(false)
  let mediaQuery = null

  // Helper to update isDark based on mode
  const applyTheme = () => {
    if (themeMode.value === 'auto') {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark.value = themeMode.value === 'dark'
    }
    updateTheme()
  }

  // Listen for system theme changes in auto mode
  const setupMediaQuery = () => {
    if (mediaQuery) mediaQuery.removeEventListener('change', applyTheme)
    if (themeMode.value === 'auto') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', applyTheme)
    }
  }

  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light' || saved === 'auto') {
      themeMode.value = saved
    } else {
      themeMode.value = 'auto'
    }
    applyTheme()
    setupMediaQuery()
  }

  // Update the DOM and localStorage
  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', themeMode.value)
  }

  // Cycle theme: light -> dark -> auto -> light
  const toggleTheme = () => {
    if (themeMode.value === 'light') themeMode.value = 'dark'
    else if (themeMode.value === 'dark') themeMode.value = 'auto'
    else themeMode.value = 'light'
    applyTheme()
    setupMediaQuery()
  }

  // Set specific theme
  const setTheme = (theme) => {
    if (['light', 'dark', 'auto'].includes(theme)) {
      themeMode.value = theme
      applyTheme()
      setupMediaQuery()
    }
  }

  // Computed properties
  const currentTheme = computed(() => {
    if (themeMode.value === 'auto') {
      return isDark.value ? 'dark (auto)' : 'light (auto)'
    }
    return themeMode.value
  })
  const themeIcon = computed(() => {
    if (themeMode.value === 'auto') return 'i-heroicons-computer-desktop'
    return isDark.value ? 'i-heroicons-sun' : 'i-heroicons-moon'
  })

  // Watch for changes and update DOM
  watch(themeMode, (newVal, oldVal) => {
    applyTheme()
    setupMediaQuery()
  })

  return {
    isDark,
    currentTheme,
    themeIcon,
    initializeTheme,
    toggleTheme,
    setTheme,
    themeMode,
  }
})
