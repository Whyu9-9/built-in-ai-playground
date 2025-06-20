# Built-in AI Playground

An interactive playground for exploring Chrome's experimental built-in AI APIs. Test text generation, translation, summarization, and more directly in your browser without any server setup.

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
- **Parameter Controls**: Adjust temperature, topK, and other model parameters

## 🛠️ Setup

### Prerequisites

1. **Supported Browsers**:
   - **Chrome 127+**: Primary support with experimental features
   - **Chrome Canary/Dev**: Recommended for latest features
   - **Microsoft Edge 127+**: Support for most APIs with experimental features
   - **Edge Canary/Dev**: Latest Edge features and APIs
2. **Enable experimental features**:

   **For Chrome:**

   - Go to `chrome://flags/`
   - Search for "Experimental Web Platform features"
   - Set to "Enabled"
   - Restart Chrome

   **For Edge:**

   - Go to `edge://flags/`
   - Search for "Experimental Web Platform features"
   - Set to "Enabled"
   - Restart Edge

3. **For Origin Trial APIs** (Writer, Rewriter, Prompt):
   - Some APIs may require origin trial tokens
   - Check the [Chrome Origin Trials page](https://developer.chrome.com/origintrials/) for current status

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

1. **Open the application** in Chrome or Edge (with experimental features enabled)
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
6. **Adjust parameters**: Fine-tune AI behavior with temperature and topK controls

## 📚 API Documentation

### Supported APIs

| API                       | Description                                              | Documentation                                                                                         | Status       |
| ------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| **Prompt API**            | General-purpose text generation with streaming support   | [GitHub Explainer](https://github.com/webmachinelearning/prompt-api)                                  | In EPP       |
| **Summarizer API**        | Generate key points, TL;DR, teasers, or headlines        | [MDN Documentation](https://developer.mozilla.org/docs/Web/API/Summarizer/)                           | Chrome 138+  |
| **Writer API**            | Create new content based on writing tasks                | [GitHub Explainer](https://github.com/explainers-by-googlers/writing-assistance-apis)                 | Origin Trial |
| **Rewriter API**          | Transform existing text with different tones and formats | [GitHub Explainer](https://github.com/explainers-by-googlers/writing-assistance-apis)                 | Origin Trial |
| **Translator API**        | Translate between multiple languages                     | [MDN Documentation](https://developer.mozilla.org/docs/Web/API/Translator_and_Language_Detector_APIs) | Chrome 138+  |
| **Language Detector API** | Identify languages in text                               | [MDN Documentation](https://developer.mozilla.org/docs/Web/API/Translator_and_Language_Detector_APIs) | Chrome 138+  |

### Browser Compatibility

- **Chrome 127+**: Basic support with experimental flags
- **Chrome 138+**: Native support for Summarizer, Translator, Language Detector
- **Chrome Canary/Dev**: Recommended for latest features and APIs in development
- **Microsoft Edge 127+**: Basic support with experimental flags
- **Microsoft Edge 138+**: Native support for Summarizer, Translator, Language Detector
- **Edge Canary/Dev**: Latest Edge features and experimental APIs

### API Status Levels

- **Chrome Stable**: Available in stable Chrome releases
- **Origin Trial**: Requires registration and trial tokens
- **In EPP**: Available in Early Preview Program
- **Experimental**: Behind feature flags only

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

This project uses experimental web platform APIs that are currently in development and may change or be removed in future versions. Some features require:

- Chrome/Edge Canary or experimental flags
- Origin trial registration for certain APIs
- Early Preview Program participation

Use for educational and experimental purposes only. Not recommended for production applications.

**Note**: API availability may vary between Chrome and Edge. Some APIs might be available in one browser but not the other, or may have different implementation statuses.
