# Telegram YouTube Summarizer & Q&A Bot

Built with **OpenClaw**, this bot accepts YouTube links, fetches transcripts, provides structured summaries, and answers contextual questions in multiple languages.

## 🚀 Features
- **YouTube Link Processing**: Detects and extracts video IDs from URLs.
- **Transcript Retrieval**: Uses `youtube-transcript-api` (Python) for robust extraction.
- **AI Summarization**: Generates 5 key points, timestamps, and core takeaways.
- **Contextual Q&A**: Answers follow-up questions based strictly on the transcript.
- **Multilingual Support**: Supports English (default) and Indian languages like Hindi, Tamil, Kannada, etc.
- **Error Handling**: Gracefully handles invalid links, missing transcripts, and long videos.

## 🛠 Setup Instructions

### Prerequisites
- **Node.js**: v22+ (v24.3.0 used in this project)
- **Python**: v3.14+
- **OpenClaw**: Installed via npm

### Installation
1. Clone the repository and navigate to the project root.
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Install Python dependencies:
   ```bash
   pip3 install youtube-transcript-api --break-system-packages
   ```

### Configuration
1. Create/Update `~/.openclaw/openclaw.json` with your Telegram Bot Token and Gemini API Key:
   ```json
   {
     "channels": {
       "telegram": {
         "enabled": true,
         "botToken": "YOUR_TELEGRAM_BOT_TOKEN",
         "dmPolicy": "open",
         "allowFrom": ["*"]
       }
     },
     "agents": {
       "defaults": {
         "model": "google/gemini-2.0-flash-exp",
         "workspace": "/path/to/your/workspace"
       }
     }
   }
   ```
2. Set your API key in the environment:
   ```bash
   export GEMINI_API_KEY="AIzaSyDbde_x8vkze_Wg2fWCGSpeKJiSNZN9hGw"
   ```

### Running the Bot
Start the OpenClaw gateway:
```bash
./node_modules/.bin/openclaw gateway --verbose
```

## 🏗 Architecture
The system follows a modular architecture:
1.  **OpenClaw Gateway**: Acts as the central control plane, managing Telegram polling and routing messages to the agent.
2.  **YouTube Assistant Skill**: A specialized skill defined in `.openclaw/workspace/skills/youtube-assistant/`. It contains instructions for the AI on how to process YouTube videos.
3.  **Transcript Retrieval (Node + Python)**: A Node.js wrapper (`get_transcript.js`) that invokes a Python script (`youtube-transcript-api`) to fetch transcripts. This combination ensures high reliability.
4.  **LLM (Gemini 2.0 Flash)**: Used for summarization, Q&A, and translation. It's configured as the default model in OpenClaw.

## 📐 Design Trade-offs
- **Python for Transcripts**: While there are Node.js libraries for transcripts, the Python `youtube-transcript-api` is more widely maintained and robust against YouTube's frequent internal changes.
- **OpenClaw Skills**: Using OpenClaw's skill system instead of a standalone bot allows for better context management and easier extension (e.g., adding more tools later).
- **Truncation**: For extremely long videos, the transcript is truncated at 60,000 characters to ensure it fits within LLM context windows while still providing a comprehensive summary.

## 📝 Edge Cases Handled
- **Invalid URLs**: The regex-based extraction validates URLs before attempting to fetch transcripts.
- **Missing Transcripts**: Clear error messages are returned if captions are disabled or unavailable.
- **Rate Limiting**: The system uses direct fetch methods; if blocked, it advises the user accordingly.
- **Language Switch**: The bot dynamically adapts its output language based on user requests (e.g., "Summarize in Hindi").


