import { ref } from 'vue'

export function useFormOptions() {
  const temperature = ref(1.0)
  const minTemperature = ref(0.0)
  const maxTemperature = ref(2.0)
  const topK = ref(3)
  const minTopK = ref(1)
  const maxTopK = ref(8)

  const toneOptions = [
    { label: 'Neutral', value: 'neutral', description: 'Balanced and objective tone' },
    { label: 'Formal', value: 'formal', description: 'Business and professional style' },
    { label: 'Casual', value: 'casual', description: 'Friendly and conversational' },
  ]

  const formatOptions = [
    { label: 'Markdown', value: 'markdown', description: 'Formatted markdown text' },
    { label: 'Plain Text', value: 'plain-text', description: 'Standard unformatted text' },
  ]

  const lengthOptions = [
    { label: 'Short', value: 'short', description: 'Concise output' },
    { label: 'Medium', value: 'medium', description: 'Balanced length (default)' },
    { label: 'Long', value: 'long', description: 'Detailed output' },
  ]

  const roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Assistant', value: 'assistant' },
  ]

  return {
    temperature,
    minTemperature,
    maxTemperature,
    topK,
    minTopK,
    maxTopK,
    toneOptions,
    formatOptions,
    lengthOptions,
    roleOptions,
  }
}
