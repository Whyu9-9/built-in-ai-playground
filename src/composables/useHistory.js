import { ref, watch } from 'vue'

export function useHistory(storageKey = 'ai-playground-history', maxItems = 50) {
  const history = ref([])

  // Load history from localStorage
  function loadHistory() {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        history.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  // Save history to localStorage
  function saveHistory() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history.value))
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }

  // Add new item to history
  function addToHistory(input, output, metadata = {}) {
    const item = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input,
      output,
      ...metadata
    }

    history.value.unshift(item)
    
    // Keep only the most recent items
    if (history.value.length > maxItems) {
      history.value = history.value.slice(0, maxItems)
    }

    saveHistory()
  }

  // Clear all history
  function clearHistory() {
    history.value = []
    saveHistory()
  }

  // Remove specific item
  function removeFromHistory(id) {
    history.value = history.value.filter(item => item.id !== id)
    saveHistory()
  }

  // Initialize
  loadHistory()

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  }
}