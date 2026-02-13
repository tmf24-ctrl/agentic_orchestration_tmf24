# CLI Toolkit - Complete Usage Guide

## Quick Start

Ensure all environment variables are configured in `.env`:

```bash
npm run dev -- <command> [options]
```

## Command Reference

### 1. **hello** - Test Message

Print a test message and save it to `references/custom/`.

```bash
npm run dev -- hello --message "Your message here"
```

**Output Location:** `references/custom/hello.txt`

---

### 2. **web-search** - Google Custom Search

Search the web using Google Custom Search API.

**Requirements:**
- `GOOGLE_SEARCH_API_KEY` in `.env`
- `GOOGLE_SEARCH_ENGINE_ID` in `.env`

```bash
npm run dev -- web-search "latest AI news"
npm run dev -- web-search "machine learning trends 2024"
```

**Output Location:** `references/<timestamp>-web-search-<query>.txt`

**Output Format:**
```
Web Search Results for: "query"
Retrieved: <ISO timestamp>
---
1. Result Title
   URL: https://...
   Result snippet...
```

---

### 3. **gemini** - Gemini AI Prompt

Send a text or image prompt to Google Gemini with optional file attachment.

**Requirements:**
- `GEMINI_API_KEY` in `.env`
- `GEMINI_MODEL` (optional, defaults to `gemini-1.5-pro`)

```bash
# Text-only prompt
npm run dev -- gemini "Summarize machine learning"

# With image file (small files embedded as base64)
npm run dev -- gemini "Describe this image" --file ./photo.jpg

# With image file (large files uploaded to GCS)
npm run dev -- gemini "Analyze this image" --file ./large-image.jpg

# Using a specific model
npm run dev -- gemini "Explain AI" --model gemini-1.5-pro
```

**Output Location:** `references/AI feedback/<timestamp>-gemini-<query>.txt`

**Output Format:**
```
Prompt: <your prompt>
File: <optional file path>
Model: <model used>
Timestamp: <ISO timestamp>
---
<Gemini response>
```

**Supported Models:**
- `gemini-1.5-pro` (recommended for multimodal)
- `gemini-1.5-flash` (faster, lower cost)
- `gemini-pro` (legacy)

**Image Support:**
- Inline (base64): Files < 1MB embedded directly
- GCS Upload: Files > 1MB uploaded to Google Cloud Storage
  - Requires `GEMINI_GCS_BUCKET` environment variable

---

### 4. **image-generate** - Generate Images with OpenAI

Generate images using DALL-E.

**Requirements:**
- `OPENAI_API_KEY` in `.env`

```bash
# Basic usage
npm run dev -- image-generate "A serene lake at sunset"

# With custom size (DALL-E 2)
npm run dev -- image-generate "Mountain landscape" --size 512x512

# Using DALL-E 3 (1024x1024 or larger)
npm run dev -- image-generate "Futuristic city" --model dall-e-3 --size 1024x1024

# Generate multiple images
npm run dev -- image-generate "Abstract art" --n 2
```

**Output Locations:**
- Images: `images/<timestamp>-<prompt>-<index>.png` (or `.url.txt` for remote URLs)
- Metadata: `references/AI feedback/<timestamp>-<prompt>-images.txt`

**Supported Models:**
- `dall-e-2` (256x256, 512x512, 1024x1024)
- `dall-e-3` (1024x1024, 1792x1024, 1024x1792)

**Output Format:**
```
Saved images: 
  images/1770915983910-futuristic-city-1.png

Metadata saved to: 
  references/AI feedback/1770915983910-futuristic-city-images.txt
```

---

### 5. **text-analyze** - Analyze Text Statistics (Capstone Command)

Analyze a text file and generate comprehensive statistics, readability analysis, and word frequency.

**Usage:**
```bash
npm run dev -- text-analyze README.md
npm run dev -- text-analyze ./content/article.txt
npm run dev -- text-analyze ./data/sample.txt
```

**Output Location:** `references/<timestamp>-text-analysis-<filename>.txt`

**Output Includes:**
- File size and character count
- Word and line counts
- Paragraph and sentence counts
- Average word length
- Reading time estimate
- 20 most common words
- Flesch Reading Ease score (0-100)
- Reading level assessment

**Output Example:**
```
Text Analysis Report
Generated: 2026-02-12T...
Source: README.md
---

STATISTICS:
  Size: 972 bytes
  Characters: 972
  Words: 143
  Lines: 25
  Paragraphs: 8
  Average word length: 5.09 characters
  Reading time: ~1 minutes

MOST COMMON WORDS:
  1. machine
  2. learning
  3. api
  ...

READABILITY:
  Flesch Reading Ease Score: 65
  Level: Standard (8th - 9th grade)
```

---

## Output Directory Structure

```
cli-ai-toolkit/
├── references/
│   ├── <timestamp>-web-search-*.txt          # Web search results
│   ├── <timestamp>-text-analysis-*.txt       # Text analysis reports
│   ├── custom/
│   │   └── hello.txt                         # Hello command output
│   ├── uploads/
│   │   └── <timestamp>-*.txt                 # Uploaded files
│   └── AI feedback/
│       ├── <timestamp>-gemini-*.txt          # Gemini responses
│       └── <timestamp>-*-images.txt          # Image metadata
├── images/
│   └── <timestamp>-<prompt>-*.png            # Generated images
└── [other files]
```

---

## Environment Variables (.env)

```dotenv
# OpenAI API
OPENAI_API_KEY=sk-proj-...

# Google Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-pro
GEMINI_GCS_BUCKET=your-bucket-name

# Google Custom Search
GOOGLE_SEARCH_API_KEY=your-key
GOOGLE_SEARCH_ENGINE_ID=your-id

# Google Cloud Storage (for GCS uploads)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## Common Issues

### GEMINI_API_KEY not working
- Verify the API key is valid and has Gemini API enabled
- Check that you're using a supported model (`gemini-1.5-pro`, `gemini-1.5-flash`)
- Ensure the model has been enabled in your Google Cloud project

### Image generation returns 400 error
- DALL-E 2 supports: 256x256, 512x512, 1024x1024
- DALL-E 3 supports: 1024x1024, 1792x1024, 1024x1792
- Verify `OPENAI_API_KEY` is valid and has image generation enabled
- Check billing/quota limits

### "File not found" errors
- Use absolute paths or paths relative to the current working directory
- Ensure files exist before running the command

### Web search returns no results
- Set both `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`
- Create a Custom Search Engine at: https://cse.google.com
- Ensure the search engine is configured to search your target domains

---

## Command Architecture

### Command Interface Pattern

Each command extends the `Command` base class:

```javascript
class MyCommand extends Command {
  async execute(options) {
    // Command logic here
  }
}
```

### Command Registry

Commands are registered in `src/index.js`:

```javascript
registry.register('command-name', {
  description: 'Command description',
  builder: (yargs) => yargs.option(...)
}, new CommandClass());
```

### Adding a New Command

1. Create `src/commands/MyCommand.js`:
```javascript
const { Command } = require('../Command');
class MyCommand extends Command {
  async execute(options) {
    // Implementation
  }
}
module.exports = { MyCommand };
```

2. Register in `src/index.js`:
```javascript
registry.register('my-command', {...}, new MyCommand());
```

3. Use it:
```bash
npm run dev -- my-command [args]
```

---

## Troubleshooting & Debugging

### Enable verbose logging
Add console.log statements to view API requests/responses.

### Check .env file
```bash
# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? 'API key loaded' : 'Not loaded')"
```

### Test API connectivity
```bash
# Test OpenAI
npm run dev -- image-generate "test" --model dall-e-2

# Test Gemini
npm run dev -- gemini "test"
```

---

## Best Practices

1. **Organize outputs**: Check `references/` regularly to clean up old results
2. **Use timestamps**: All outputs include timestamps for easy tracking
3. **Sanitize queries**: Command automatically sanitizes prompts for safe filenames
4. **Test incrementally**: Run commands with small inputs first
5. **Save credentials**: Store API keys in `.env`, never commit to git
