# Built-in AI Playground

An interactive playground for exploring Chrome's experimental built-in AI APIs. Test text generation, translation, summarization, and more directly in your browser without any server setup.

## 🚀 Features

- **Text Generation**: Use the Prompt API for conversational AI
- **Image Analysis**: Analyze images with multimodal AI
- **Audio Processing**: Process audio with AI capabilities
- **Text Summarization**: Generate summaries with different styles
- **Language Translation**: Translate between 80+ languages
- **Text Rewriting**: Transform text tone, length, and format
- **Language Detection**: Identify languages in text
- **Real-time Streaming**: Support for streaming responses
- **API Status Monitoring**: Check which APIs are available

## 🛠️ Setup

### Prerequisites

1. **Chrome Canary or Dev Channel** (recommended)
2. Enable experimental features:
   - Go to `chrome://flags/#enable-experimental-web-platform-features`
   - Set to "Enabled"
   - Restart Chrome

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

1. Open the application in Chrome
2. Click "Check API Support" to see available APIs
3. Navigate to different API demos using the sidebar
4. Experiment with various parameters and options

## 📚 API Documentation

### Supported APIs

- **Summarizer API**: Generate key points, TL;DR, teasers, or headlines
- **Writer API**: Create new content based on writing tasks
- **Rewriter API**: Transform existing text with different tones and formats
- **Translator API**: Translate between multiple languages
- **Language Detector API**: Identify languages in text
- **Prompt API**: General-purpose text generation with streaming support

### Browser Compatibility

- Chrome 127+ (with experimental flags enabled)
- Chrome Canary (recommended for latest features)

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format
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

This project uses experimental Chrome APIs that may change or be removed in future versions. Use for educational and experimental purposes only.