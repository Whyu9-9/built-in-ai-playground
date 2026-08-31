# Built-in AI Playground

An interactive playground for Chrome's built-in AI APIs. Models run on-device after their initial download, so the demos do not need an application server or API key.

## 🚀 Features

### Core AI Capabilities

- **Text Generation**: Use the Prompt API for conversational AI
- **Image Analysis**: Analyze images with multimodal AI capabilities
- **Audio Processing**: Process audio with AI (experimental)
- **Text Summarization**: Generate summaries with different styles and formats
- **Language Translation**: Translate between multiple languages
- **Text Rewriting**: Transform text tone, length, and format
- **Language Detection**: Automatically identify languages in text
- **Real-time Streaming**: Support for streaming responses

### User Experience

- **Dark/Light Mode**: Toggle between themes with system preference detection
- **API Status Monitoring**: Real-time status of API availability and download progress
- **Interactive Code Examples**: View and copy implementation code for each API
- **Official Documentation Links**: Direct access to MDN docs and GitHub explainers
- **Responsive Design**: Modern UI built with Nuxt UI components
- **Structured Output**: Pass a JSON Schema to the Prompt API

## 🛠️ Setup

### Prerequisites

1. Use an up-to-date desktop version of Chrome. Built-in models are not available on mobile.
2. Foundation-model APIs require Windows 10/11, macOS 13+, Linux, or a Chromebook Plus; at least 22 GB of free storage; and either more than 4 GB VRAM or at least 16 GB RAM with 4 CPU cores. Audio input requires a GPU.
3. For localhost development, enable `chrome://flags/#optimization-guide-on-device-model` and `chrome://flags/#prompt-api-for-gemini-nano`, then relaunch Chrome.
4. Preview APIs can require their own flag, developer trial, or origin trial. Follow the official page linked from each demo because availability changes independently.

See Chrome's [built-in AI getting-started guide](https://developer.chrome.com/docs/ai/get-started) for the current requirements and troubleshooting steps.

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd built-in-ai-playground

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 Usage

1. **Open the application** in desktop Chrome
2. **Check API Support**: The homepage displays real-time API availability
3. **Navigate demos**: Use the sidebar to explore different AI capabilities:
   - **Prompt Demo**: Text generation with streaming support
   - **Image Demo**: Multimodal AI for image analysis
   - **Audio Demo**: Audio processing capabilities
   - **Summarizer**: Text summarization with various formats
   - **Writer**: AI-assisted content creation
   - **Rewriter**: Text transformation and editing
   - **Translator**: Multi-language translation
   - **Language Detector**: Automatic language identification
4. **View code examples**: Toggle code examples to see implementation details
5. **Access documentation**: Click documentation links for official API references
6. **Try structured output**: Provide a JSON Schema in the text Prompt demo

## 📚 API Documentation

### Supported APIs

| API                       | Description                                              | Documentation                                                                                         | Status       |
| ------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| **Prompt API**            | General-purpose text and multimodal prompting             | [Chrome documentation](https://developer.chrome.com/docs/ai/prompt-api)             | Chrome 148+  |
| **Summarizer API**        | Generate key points, TL;DR, teasers, or headlines         | [Chrome documentation](https://developer.chrome.com/docs/ai/summarizer-api)         | Stable       |
| **Writer API**            | Create new content based on writing tasks                 | [Chrome documentation](https://developer.chrome.com/docs/ai/writer-api)             | Preview      |
| **Rewriter API**          | Transform existing text with different tones and formats  | [Chrome documentation](https://developer.chrome.com/docs/ai/rewriter-api)           | Preview      |
| **Translator API**        | Translate between supported language packs                | [Chrome documentation](https://developer.chrome.com/docs/ai/translator-api)         | Stable       |
| **Language Detector API** | Identify languages in text                                | [Chrome documentation](https://developer.chrome.com/docs/ai/language-detection)     | Stable       |
| **Proofreader API**       | Correct spelling, grammar, and punctuation                 | [Chrome documentation](https://developer.chrome.com/docs/ai/proofreader-api)        | Preview      |

The runtime status panel uses each API's `availability()` result: `unavailable`, `downloadable`, `downloading`, or `available`. Model downloads begin only from a demo action so Chrome's user-activation requirement is satisfied.

## 🔧 Development

### Tech Stack

- **Vue 3**: Progressive JavaScript framework
- **Nuxt UI**: Modern component library
- **Vite**: Fast build tool and dev server
- **Pinia**: State management
- **Tailwind CSS**: Utility-first CSS framework

### Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code (if available)
npm run format
```

### Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── ApiExplainer.vue # Documentation links
│   ├── ApiStatus.vue    # API availability display
│   ├── CodeExample.vue  # Interactive code examples
│   └── ...
├── views/              # Page components for each API demo
│   ├── HomeView.vue    # Landing page with API status
│   ├── PromptDemo.vue  # Text generation demo
│   └── ...
├── stores/             # Pinia stores
│   └── theme.js        # Dark/light mode management
└── data/               # Static data and configurations
    └── apiDocs.js      # API documentation links
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Created with [Cursor AI](https://cursor.sh) and [@thangman22](https://github.com/thangman22)

## ⚠️ Disclaimer

Some built-in AI APIs are still in preview and may change. Check the official Chrome page for an API before shipping it to production, and always keep feature detection and an `unavailable` fallback.
