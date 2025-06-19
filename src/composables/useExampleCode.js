import { computed } from 'vue'

export function useExampleCode(modelName, options = {}) {
  const {
    inputRef,
    streamingRef,
    methodName = 'process',
    streamMethodName = 'processStreaming',
    generateOptionsStr = () => '',
    inputProcessor = (input) => `'${input?.replace(/'/g, "\\'")}'` || "'Your input goes here'",
  } = options

  const exampleCode = computed(() => {
    const optionsStr = generateOptionsStr()

    const processCode = streamingRef?.value
      ? `// Use streaming API for real-time updates
const stream = await ${modelName.toLowerCase()}.${streamMethodName}(
  ${inputRef?.value ? inputProcessor(inputRef.value) : "'Your input goes here'"}\
${optionsStr}
)

let result = ''
for await (const chunk of stream) {
  result += chunk
}`
      : `// Use regular API for complete response
const result = await ${modelName.toLowerCase()}.${methodName}(
  ${inputRef?.value ? inputProcessor(inputRef.value) : "'Your input goes here'"}\
${optionsStr}
)`

    return `const available = await ${modelName}.availability()
let ${modelName.toLowerCase()}

if (available === 'unavailable') {
  return
}

if (available === 'available') {
  ${modelName.toLowerCase()} = await ${modelName}.create()
} else {
  ${modelName.toLowerCase()} = await ${modelName}.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(\`Downloaded \${e.loaded * 100}%\`)
      })
    }
  })
}

${processCode}`
  })

  return {
    exampleCode,
  }
}
