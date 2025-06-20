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

  const styleOptions = [
    { label: 'Formal', value: 'formal' },
    { label: 'Casual', value: 'casual' },
    { label: 'Professional', value: 'professional' },
    { label: 'Creative', value: 'creative' },
  ]

  const languageOptions = [
    { label: 'Auto Detect', value: 'auto' },
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Italian', value: 'it' },
    { label: 'Portuguese', value: 'pt' },
    { label: 'Russian', value: 'ru' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Korean', value: 'ko' },
    { label: 'Chinese (Simplified)', value: 'zh-cn' },
    { label: 'Chinese (Traditional)', value: 'zh-tw' },
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
    styleOptions,
    languageOptions,
  }
}